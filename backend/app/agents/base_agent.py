from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional
from datetime import datetime, timezone
import asyncio
import time
import logging
from app.core.config import settings

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
    ):
        self.agent_id = agent_id
        self.status = status
        self.result = result
        self.reasoning_chain = reasoning_chain
        self.confidence = confidence
        self.tools_called = tools_called
        self.agents_invoked = agents_invoked
        self.latency_ms = latency_ms
        self.error = error
        self.timestamp = datetime.now(timezone.utc).isoformat()

    def to_dict(self) -> Dict:
        return {
            "agent_id": self.agent_id,
            "status": self.status,
            "result": self.result,
            "reasoning_chain": self.reasoning_chain,
            "confidence": self.confidence,
            "tools_called": self.tools_called,
            "agents_invoked": self.agents_invoked,
            "latency_ms": self.latency_ms,
            "error": self.error,
            "timestamp": self.timestamp,
        }


class BaseWaterAgent(ABC):
    def __init__(self, agent_id: str, description: str):
        self.agent_id = agent_id
        self.description = description
        self.reasoning_chain: List[Dict] = []
        self.tools_called: List[str] = []
        self.agents_invoked: List[str] = []
        self._gemini_model = None

    def _get_gemini_model(self):
        if self._gemini_model is None:
            try:
                import google.generativeai as genai
                genai.configure(api_key=settings.GOOGLE_API_KEY)
                self._gemini_model = genai.GenerativeModel("gemini-1.5-pro")
            except Exception as e:
                logger.warning(f"Gemini not available: {e}")
        return self._gemini_model

    def add_reasoning_step(self, step: str, data: Any = None):
        self.reasoning_chain.append({
            "step": step,
            "data": data,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        })

    async def invoke_agent(self, agent: "BaseWaterAgent", context: Dict) -> "AgentResult":
        self.agents_invoked.append(agent.agent_id)
        self.add_reasoning_step(f"Invoking {agent.agent_id}", {"context_keys": list(context.keys())})
        return await agent.run(context)

    async def call_gemini(self, prompt: str) -> str:
        model = self._get_gemini_model()
        if not model:
            return self._fallback_response(prompt)
        try:
            self.tools_called.append("gemini_1.5_pro")
            response = model.generate_content(prompt)
            return response.text
        except Exception as e:
            logger.error(f"Gemini call failed: {e}")
            return self._fallback_response(prompt)

    def _fallback_response(self, prompt: str) -> str:
        return f"[Simulated AI response for: {self.agent_id}] Analysis complete based on sensor data."

    @abstractmethod
    async def run(self, context: Dict) -> AgentResult:
        pass

    async def execute(self, context: Dict) -> AgentResult:
        self.reasoning_chain = []
        self.tools_called = []
        self.agents_invoked = []
        start = time.time()
        try:
            self.add_reasoning_step(f"Agent {self.agent_id} started", {"context": context})
            result = await self.run(context)
            result.latency_ms = int((time.time() - start) * 1000)
            return result
        except Exception as e:
            latency = int((time.time() - start) * 1000)
            logger.error(f"Agent {self.agent_id} failed: {e}")
            return AgentResult(
                agent_id=self.agent_id,
                status="failed",
                result=None,
                reasoning_chain=self.reasoning_chain,
                confidence=0,
                tools_called=self.tools_called,
                agents_invoked=self.agents_invoked,
                latency_ms=latency,
                error=str(e),
            )
