from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional
from datetime import datetime, timezone
import asyncio
import time
import logging

from app.agents.governance import (
    get_instructions,
    validate_input, validate_output,
    record_success, record_failure, GuardrailViolation,
    check_invocation_allowed, check_rate_limit, build_a2a_envelope,
    apply_governance,
)

logger = logging.getLogger(__name__)


class AgentResult:
    def __init__(
        self,
        agent_id: str,
        status: str,
        result: Any,
        reasoning_chain: List[Dict],
        confidence: float,
        tools_called: List[str],
        agents_invoked: List[str],
        latency_ms: int,
        error: Optional[str] = None,
        governance_report: Optional[Dict] = None,
        input_warnings: Optional[List[str]] = None,
    ):
        self.agent_id         = agent_id
        self.status           = status
        self.result           = result
        self.reasoning_chain  = reasoning_chain
        self.confidence       = confidence
        self.tools_called     = tools_called
        self.agents_invoked   = agents_invoked
        self.latency_ms       = latency_ms
        self.error            = error
        self.governance_report = governance_report or {}
        self.input_warnings   = input_warnings or []
        self.timestamp        = datetime.now(timezone.utc).isoformat()

    def to_dict(self) -> Dict:
        return {
            "agent_id":          self.agent_id,
            "status":            self.status,
            "result":            self.result,
            "reasoning_chain":   self.reasoning_chain,
            "confidence":        self.confidence,
            "tools_called":      self.tools_called,
            "agents_invoked":    self.agents_invoked,
            "latency_ms":        self.latency_ms,
            "error":             self.error,
            "governance_report": self.governance_report,
            "input_warnings":    self.input_warnings,
            "timestamp":         self.timestamp,
        }


class BaseWaterAgent(ABC):
    def __init__(self, agent_id: str, description: str):
        self.agent_id       = agent_id
        self.description    = description
        self.reasoning_chain: List[Dict] = []
        self.tools_called:   List[str]   = []
        self.agents_invoked: List[str]   = []
        self._gemini_model  = None
        self._session_id:   Optional[str] = None

        # Load governance config for this agent
        self._instructions = get_instructions(agent_id)

    # ── Gemini ───────────────────────────────────────────────────────────────

    def _get_gemini_model(self):
        if self._gemini_model is None:
            try:
                import google.generativeai as genai
                from app.core.config import settings
                genai.configure(api_key=settings.GOOGLE_API_KEY)
                # Inject system instructions into the model
                system_prompt = self._instructions.get("system_prompt", "")
                self._gemini_model = genai.GenerativeModel(
                    "gemini-1.5-pro",
                    system_instruction=system_prompt if system_prompt else None,
                )
            except Exception as e:
                logger.warning(f"Gemini not available: {e}")
        return self._gemini_model

    # ── Reasoning trace ──────────────────────────────────────────────────────

    def add_reasoning_step(self, step: str, data: Any = None):
        self.reasoning_chain.append({
            "step":      step,
            "data":      data,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        })

    # ── A2A invocation (protocol-enforced) ──────────────────────────────────

    async def invoke_agent(self, agent: "BaseWaterAgent", context: Dict) -> "AgentResult":
        callee_id = agent.agent_id

        # Protocol: check if this invocation is allowed
        if not check_invocation_allowed(self.agent_id, callee_id):
            logger.warning(f"[A2A] {self.agent_id} → {callee_id} BLOCKED by protocol")
            self.add_reasoning_step(
                f"A2A BLOCKED: {self.agent_id} cannot invoke {callee_id}",
                {"reason": "not in allowed_invocations"}
            )
            return AgentResult(
                agent_id=callee_id, status="blocked",
                result=None, reasoning_chain=[], confidence=0,
                tools_called=[], agents_invoked=[], latency_ms=0,
                error=f"A2A protocol violation: {self.agent_id} cannot invoke {callee_id}",
            )

        # Protocol: rate limit the callee
        if not check_rate_limit(callee_id):
            return AgentResult(
                agent_id=callee_id, status="rate_limited",
                result=None, reasoning_chain=[], confidence=0,
                tools_called=[], agents_invoked=[], latency_ms=0,
                error=f"Rate limit exceeded for {callee_id}",
            )

        # Build A2A envelope and log
        envelope = build_a2a_envelope(self.agent_id, callee_id, context, self._session_id)
        self.agents_invoked.append(callee_id)
        self.add_reasoning_step(
            f"A2A → {callee_id}",
            {"message_id": envelope["message_id"], "context_keys": list(context.keys())}
        )

        agent._session_id = self._session_id
        return await agent.run(context)

    # ── Gemini call ──────────────────────────────────────────────────────────

    async def call_gemini(self, prompt: str) -> str:
        # Prepend role context to every prompt
        role = self._instructions.get("role", "WaterOS Agent")
        full_prompt = f"[{role}]\n\n{prompt}"

        model = self._get_gemini_model()
        if not model:
            return self._fallback_response(prompt)
        try:
            self.tools_called.append("gemini_1.5_pro")
            response = model.generate_content(full_prompt)
            return response.text
        except Exception as e:
            logger.error(f"Gemini call failed: {e}")
            return self._fallback_response(prompt)

    def _fallback_response(self, prompt: str) -> str:
        role = self._instructions.get("role", self.agent_id)
        return f"[{role}] Analysis complete based on available sensor and model data."

    # ── Abstract run ─────────────────────────────────────────────────────────

    @abstractmethod
    async def run(self, context: Dict) -> AgentResult:
        pass

    # ── Main execute — full governance pipeline ──────────────────────────────

    async def execute(self, context: Dict, session_id: Optional[str] = None) -> AgentResult:
        self.reasoning_chain = []
        self.tools_called    = []
        self.agents_invoked  = []
        self._session_id     = session_id or f"direct_{self.agent_id}"
        start = time.time()

        # ── 1. Rate limit self ────────────────────────────────────────────────
        if not check_rate_limit(self.agent_id):
            return AgentResult(
                agent_id=self.agent_id, status="rate_limited",
                result=None, reasoning_chain=[], confidence=0,
                tools_called=[], agents_invoked=[], latency_ms=0,
                error=f"Rate limit exceeded for {self.agent_id}",
            )

        # ── 2. Input guardrails ───────────────────────────────────────────────
        input_warnings: List[str] = []
        try:
            _, input_warnings = validate_input(self.agent_id, context)
            if input_warnings:
                logger.info(f"[Guardrail:INPUT] {self.agent_id} warnings: {input_warnings}")
        except GuardrailViolation as gv:
            latency = int((time.time() - start) * 1000)
            record_failure(self.agent_id, str(gv))
            return AgentResult(
                agent_id=self.agent_id, status="guardrail_blocked",
                result=None, reasoning_chain=self.reasoning_chain, confidence=0,
                tools_called=self.tools_called, agents_invoked=self.agents_invoked,
                latency_ms=latency, error=str(gv),
                input_warnings=input_warnings,
            )

        # ── 3. Run agent logic ────────────────────────────────────────────────
        try:
            self.add_reasoning_step(
                f"[{self._instructions.get('role', self.agent_id)}] started",
                {"context_scope": {k: context.get(k) for k in ("country","state","city") if context.get(k)}}
            )
            result = await self.run(context)
            result.latency_ms = int((time.time() - start) * 1000)

        except Exception as e:
            latency = int((time.time() - start) * 1000)
            record_failure(self.agent_id, str(e))
            logger.error(f"Agent {self.agent_id} failed: {e}")
            return AgentResult(
                agent_id=self.agent_id, status="failed",
                result=None, reasoning_chain=self.reasoning_chain, confidence=0,
                tools_called=self.tools_called, agents_invoked=self.agents_invoked,
                latency_ms=latency, error=str(e), input_warnings=input_warnings,
            )

        # ── 4. Output guardrails ──────────────────────────────────────────────
        output_warnings: List[str] = []
        required_fields = self._instructions.get("output_required_fields", [])
        confidence_floor = self._instructions.get("confidence_floor", 0.60)
        try:
            _, output_warnings = validate_output(
                self.agent_id, result.result, result.confidence,
                required_fields, confidence_floor
            )
        except GuardrailViolation as gv:
            record_failure(self.agent_id, str(gv))
            result.status = "guardrail_blocked"
            result.error  = str(gv)
            result.governance_report = {"guardrail_violation": str(gv)}
            return result

        all_warnings = input_warnings + output_warnings
        result.input_warnings = all_warnings

        # ── 5. Governance rules ───────────────────────────────────────────────
        gov_report = apply_governance(
            agent_id    = self.agent_id,
            session_id  = self._session_id,
            result      = result.result,
            confidence  = result.confidence,
            latency_ms  = result.latency_ms,
            context     = context,
            warnings    = all_warnings,
        )
        result.governance_report = gov_report

        # ── 6. Record success ─────────────────────────────────────────────────
        record_success(self.agent_id)
        logger.info(
            f"[{self.agent_id}] completed in {result.latency_ms}ms "
            f"confidence={result.confidence:.2f} "
            f"human_review={gov_report.get('human_review_required')} "
            f"escalate={gov_report.get('escalation_required')}"
        )
        return result
