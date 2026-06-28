"""
Protocols — A2A (Agent-to-Agent) message envelope, rate limiting,
timeout enforcement, and inter-agent trust rules.
"""

from typing import Dict, Any, Optional, List
from datetime import datetime, timezone
from collections import defaultdict, deque
import uuid
import time
import logging

logger = logging.getLogger(__name__)

# ── A2A Protocol version ─────────────────────────────────────────────────────
A2A_VERSION = "1.0"

# ── Rate limits (calls per agent per 60s sliding window) ─────────────────────
RATE_LIMITS: Dict[str, int] = {
    "flood_agent":             10,
    "rainfall_agent":          15,
    "reservoir_agent":         10,
    "water_quality_agent":     10,
    "leak_detection_agent":    8,
    "climate_agent":           5,
    "emergency_agent":         5,
    "decision_agent":          6,
    "global_coordinator":      4,
    "country_agent":           12,
    "groundwater_agent":       8,
    "infrastructure_agent":    8,
    "sensor_intelligence":     20,
    "report_generation_agent": 10,
}
DEFAULT_RATE_LIMIT = 10

# ── Agent trust hierarchy ─────────────────────────────────────────────────────
# Agents can only invoke agents at the same or lower trust level
TRUST_LEVELS: Dict[str, int] = {
    "global_coordinator":      5,   # highest — can invoke all
    "decision_agent":          4,
    "emergency_agent":         4,
    "flood_agent":             3,
    "rainfall_agent":          2,
    "reservoir_agent":         2,
    "water_quality_agent":     3,
    "leak_detection_agent":    2,
    "climate_agent":           2,
    "country_agent":           2,
    "groundwater_agent":       2,
    "infrastructure_agent":    2,
    "sensor_intelligence":     1,
    "report_generation_agent": 1,
}

# ── Allowed A2A invocation paths ─────────────────────────────────────────────
ALLOWED_INVOCATIONS: Dict[str, List[str]] = {
    "flood_agent":         ["rainfall_agent", "reservoir_agent"],
    "decision_agent":      ["flood_agent", "emergency_agent", "rainfall_agent",
                            "reservoir_agent", "water_quality_agent", "infrastructure_agent"],
    "global_coordinator":  ["country_agent", "climate_agent", "decision_agent"],
    "emergency_agent":     [],  # leaf node — cannot invoke other agents
    "rainfall_agent":      [],
    "reservoir_agent":     [],
    "water_quality_agent": ["sensor_intelligence"],
    "country_agent":       ["flood_agent", "water_quality_agent", "groundwater_agent"],
    "infrastructure_agent":["leak_detection_agent", "sensor_intelligence"],
    "sensor_intelligence": [],
    "report_generation_agent": [],
    "climate_agent":       [],
    "groundwater_agent":   ["sensor_intelligence"],
    "leak_detection_agent":["sensor_intelligence"],
}

# ── Rate limit state ──────────────────────────────────────────────────────────
_rate_windows: Dict[str, deque] = defaultdict(deque)
WINDOW_SECONDS = 60


# ── A2A Message envelope ──────────────────────────────────────────────────────

def build_a2a_envelope(
    caller_id: str,
    callee_id: str,
    context: Dict[str, Any],
    session_id: Optional[str] = None,
) -> Dict:
    return {
        "protocol_version": A2A_VERSION,
        "message_id":    str(uuid.uuid4()),
        "session_id":    session_id or str(uuid.uuid4()),
        "timestamp":     datetime.now(timezone.utc).isoformat(),
        "caller":        caller_id,
        "callee":        callee_id,
        "trust_level":   TRUST_LEVELS.get(caller_id, 1),
        "context":       context,
        "ttl_ms":        30_000,
    }


# ── Protocol checks ──────────────────────────────────────────────────────────

def check_invocation_allowed(caller_id: str, callee_id: str) -> bool:
    """Verify caller is allowed to invoke callee per the A2A topology."""
    allowed = ALLOWED_INVOCATIONS.get(caller_id, [])
    if callee_id not in allowed:
        logger.warning(
            f"[A2A] BLOCKED: {caller_id} attempted to invoke {callee_id}. "
            f"Allowed targets: {allowed}"
        )
        return False
    # Trust level check
    caller_trust = TRUST_LEVELS.get(caller_id, 1)
    callee_trust = TRUST_LEVELS.get(callee_id, 1)
    if caller_trust < callee_trust:
        logger.warning(
            f"[A2A] BLOCKED: {caller_id} (trust={caller_trust}) cannot invoke "
            f"{callee_id} (trust={callee_trust})"
        )
        return False
    return True


def check_rate_limit(agent_id: str) -> bool:
    """Sliding window rate limiter. Returns False if limit exceeded."""
    now = time.time()
    window = _rate_windows[agent_id]

    # Remove calls outside the window
    while window and window[0] < now - WINDOW_SECONDS:
        window.popleft()

    limit = RATE_LIMITS.get(agent_id, DEFAULT_RATE_LIMIT)
    if len(window) >= limit:
        logger.warning(
            f"[RateLimit] {agent_id} exceeded {limit} calls/{WINDOW_SECONDS}s. "
            f"Current: {len(window)} calls."
        )
        return False

    window.append(now)
    return True


def enforce_timeout(agent_id: str, elapsed_ms: int) -> bool:
    """Check if agent exceeded its max latency. Returns True if within limit."""
    from app.agents.governance.instructions import get_instructions
    max_ms = get_instructions(agent_id).get("max_latency_ms", 10000)
    if elapsed_ms > max_ms:
        logger.warning(
            f"[Timeout] {agent_id} took {elapsed_ms}ms, exceeds limit {max_ms}ms"
        )
        return False
    return True


def get_rate_limit_status() -> Dict:
    now = time.time()
    return {
        agent_id: {
            "limit":   RATE_LIMITS.get(agent_id, DEFAULT_RATE_LIMIT),
            "used":    sum(1 for t in window if t >= now - WINDOW_SECONDS),
            "window_s": WINDOW_SECONDS,
        }
        for agent_id, window in _rate_windows.items()
    }
