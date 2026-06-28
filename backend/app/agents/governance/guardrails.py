"""
Guardrails — input validation, output validation, confidence enforcement,
content safety checks, and circuit-breaker logic for all WaterOS agents.
"""

from typing import Dict, Any, List, Tuple
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

# ── Circuit breaker state (in-memory per process) ────────────────────────────
_circuit: Dict[str, Dict] = {}
CIRCUIT_FAILURE_THRESHOLD = 3       # trips after 3 consecutive failures
CIRCUIT_RECOVERY_SECONDS  = 120     # auto-reset after 2 minutes


class GuardrailViolation(Exception):
    def __init__(self, rule: str, detail: str):
        self.rule   = rule
        self.detail = detail
        super().__init__(f"[Guardrail:{rule}] {detail}")


# ── Input guardrails ──────────────────────────────────────────────────────────

def validate_input(agent_id: str, context: Dict) -> Tuple[bool, List[str]]:
    """
    Validate agent input context. Returns (passed, list_of_warnings).
    Raises GuardrailViolation on hard failures.
    """
    warnings: List[str] = []

    # Circuit breaker check
    cb = _circuit.get(agent_id, {})
    if cb.get("tripped"):
        elapsed = (datetime.now(timezone.utc).timestamp() - cb.get("tripped_at", 0))
        if elapsed < CIRCUIT_RECOVERY_SECONDS:
            raise GuardrailViolation(
                "CIRCUIT_OPEN",
                f"{agent_id} circuit breaker is OPEN after {cb['failures']} consecutive failures. "
                f"Recovery in {int(CIRCUIT_RECOVERY_SECONDS - elapsed)}s."
            )
        else:
            _circuit[agent_id] = {}  # auto-reset

    # Hard: country must be a string if provided
    if "country" in context and not isinstance(context["country"], str):
        raise GuardrailViolation("INPUT_TYPE", "country must be a string")

    # Hard: no executable code in any string field
    for key, val in context.items():
        if isinstance(val, str) and any(tok in val for tok in ["__import__", "eval(", "exec(", "os.system"]):
            raise GuardrailViolation("INPUT_INJECTION", f"Unsafe content detected in field '{key}'")

    # Soft: warn on empty context
    if not context:
        warnings.append("Context is empty — agent will use global defaults")

    # Soft: warn if numeric fields are out of plausible range
    if "river_level_m" in context:
        lvl = float(context["river_level_m"])
        if not (0 <= lvl <= 30):
            warnings.append(f"river_level_m={lvl} is outside plausible range [0, 30]")

    if "rainfall_mm" in context:
        r = float(context["rainfall_mm"])
        if r < 0:
            raise GuardrailViolation("INPUT_RANGE", f"rainfall_mm cannot be negative ({r})")
        if r > 2000:
            warnings.append(f"rainfall_mm={r} is extremely high — verify sensor calibration")

    return True, warnings


# ── Output guardrails ──────────────────────────────────────────────────────────

def validate_output(agent_id: str, result: Any, confidence: float,
                    required_fields: List[str], confidence_floor: float) -> Tuple[bool, List[str]]:
    """
    Validate agent output. Returns (passed, list_of_warnings).
    Raises GuardrailViolation on hard failures.
    """
    warnings: List[str] = []

    # Hard: confidence below floor
    if confidence < confidence_floor:
        raise GuardrailViolation(
            "CONFIDENCE_BELOW_FLOOR",
            f"{agent_id} confidence={confidence:.2f} is below required floor={confidence_floor}. "
            "Result must not be used for decisions without human review."
        )

    # Hard: confidence out of range
    if not (0.0 <= confidence <= 1.0):
        raise GuardrailViolation("CONFIDENCE_RANGE", f"confidence={confidence} outside [0, 1]")

    # Hard: required fields must be present
    if isinstance(result, dict):
        missing = [f for f in required_fields if f not in result]
        if missing:
            raise GuardrailViolation(
                "MISSING_OUTPUT_FIELDS",
                f"{agent_id} missing required output fields: {missing}"
            )

        # Soft: detect suspiciously uniform confidence pattern (potential mock/hallucination)
        if confidence == 1.0:
            warnings.append("confidence=1.0 is unusual — verify result is not a fallback mock")

        # Content safety: flag if result contains disallowed patterns
        result_str = str(result).lower()
        dangerous_phrases = ["guaranteed", "100% safe", "no risk", "impossible to fail"]
        for phrase in dangerous_phrases:
            if phrase in result_str:
                warnings.append(f"Output contains absolute claim '{phrase}' — review before use")

        # Hard: water quality — cannot be 'safe' if wqi < 50
        if agent_id == "water_quality_agent":
            wqi = result.get("wqi_score", 100)
            compliance = str(result.get("who_compliance", "compliant")).lower()
            if wqi < 50 and "compliant" in compliance:
                raise GuardrailViolation(
                    "QUALITY_CONTRADICTION",
                    f"WQI={wqi} (<50) but who_compliance='{compliance}' — contradiction detected"
                )

        # Hard: emergency agent requires human approval flag
        if agent_id == "emergency_agent":
            if result.get("alert_level") in ("high", "critical") and not result.get("human_approval_required"):
                raise GuardrailViolation(
                    "MISSING_HUMAN_APPROVAL",
                    "emergency_agent HIGH/CRITICAL alerts must set human_approval_required=True"
                )

    return True, warnings


# ── Circuit breaker management ────────────────────────────────────────────────

def record_success(agent_id: str):
    _circuit[agent_id] = {"failures": 0, "tripped": False}


def record_failure(agent_id: str, error: str):
    cb = _circuit.get(agent_id, {"failures": 0, "tripped": False})
    cb["failures"] = cb.get("failures", 0) + 1
    cb["last_error"] = error
    if cb["failures"] >= CIRCUIT_FAILURE_THRESHOLD:
        cb["tripped"] = True
        cb["tripped_at"] = datetime.now(timezone.utc).timestamp()
        logger.warning(
            f"[CircuitBreaker] {agent_id} TRIPPED after {cb['failures']} failures. "
            f"Last error: {error}"
        )
    _circuit[agent_id] = cb


def get_circuit_status() -> Dict:
    return {
        agent_id: {
            "failures": cb.get("failures", 0),
            "tripped": cb.get("tripped", False),
            "last_error": cb.get("last_error"),
        }
        for agent_id, cb in _circuit.items()
    }
