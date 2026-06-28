"""
Governance — human-in-the-loop triggers, audit logging, escalation policies,
SLA monitoring, decision provenance, and override tracking.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
import logging
import json

logger = logging.getLogger(__name__)

# ── Governance configuration ──────────────────────────────────────────────────

# Confidence below this always triggers human review flag
HUMAN_REVIEW_CONFIDENCE_THRESHOLD = 0.65

# Risk levels that always require human approval before action
HUMAN_APPROVAL_RISK_LEVELS = {"critical", "high"}

# Agents that always produce human-in-the-loop outputs
ALWAYS_HUMAN_LOOP_AGENTS = {"emergency_agent", "decision_agent"}

# SLA thresholds for latency alerting (ms)
SLA_LATENCY_WARN_MS  = 5_000
SLA_LATENCY_ALERT_MS = 10_000

# Governance audit log (in-memory; in production: write to PostgreSQL audit table)
_audit_log: List[Dict] = []
MAX_AUDIT_LOG = 1000


# ── Audit entry builder ───────────────────────────────────────────────────────

def audit_event(
    event_type: str,
    agent_id: str,
    session_id: str,
    details: Dict[str, Any],
    severity: str = "info",
) -> Dict:
    entry = {
        "event_id":   f"{agent_id}_{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S%f')}",
        "event_type": event_type,
        "agent_id":   agent_id,
        "session_id": session_id,
        "severity":   severity,
        "timestamp":  datetime.now(timezone.utc).isoformat(),
        "details":    details,
    }
    _audit_log.append(entry)
    if len(_audit_log) > MAX_AUDIT_LOG:
        _audit_log.pop(0)

    log_fn = logger.warning if severity in ("warning", "error") else logger.info
    log_fn(f"[Governance:{event_type}] {agent_id} — {json.dumps(details)[:200]}")
    return entry


# ── Governance checks ─────────────────────────────────────────────────────────

def apply_governance(
    agent_id: str,
    session_id: str,
    result: Any,
    confidence: float,
    latency_ms: int,
    context: Dict,
    warnings: List[str],
) -> Dict:
    """
    Apply all governance rules to a completed agent run.
    Returns a governance report dict that is attached to the AgentResult.
    """
    report: Dict[str, Any] = {
        "human_review_required":   False,
        "human_approval_required": False,
        "escalation_required":     False,
        "escalation_reason":       [],
        "sla_breach":              False,
        "governance_warnings":     list(warnings),
        "audit_events":            [],
        "decision_provenance": {
            "agent":      agent_id,
            "session_id": session_id,
            "context_scope": {
                k: context.get(k) for k in ("country", "state", "city")
                if context.get(k)
            },
            "confidence": confidence,
            "timestamp":  datetime.now(timezone.utc).isoformat(),
        },
    }

    # ── Rule 1: Low confidence → human review ────────────────────────────────
    if confidence < HUMAN_REVIEW_CONFIDENCE_THRESHOLD:
        report["human_review_required"] = True
        reason = f"confidence={confidence:.2f} below threshold={HUMAN_REVIEW_CONFIDENCE_THRESHOLD}"
        report["escalation_reason"].append(reason)
        report["audit_events"].append(
            audit_event("LOW_CONFIDENCE", agent_id, session_id,
                        {"confidence": confidence, "threshold": HUMAN_REVIEW_CONFIDENCE_THRESHOLD},
                        severity="warning")
        )

    # ── Rule 2: Always-HIL agents ─────────────────────────────────────────────
    if agent_id in ALWAYS_HUMAN_LOOP_AGENTS:
        report["human_review_required"] = True
        report["human_approval_required"] = True
        report["audit_events"].append(
            audit_event("HUMAN_LOOP_AGENT", agent_id, session_id,
                        {"reason": f"{agent_id} always requires human review"})
        )

    # ── Rule 3: High/critical risk → human approval ───────────────────────────
    if isinstance(result, dict):
        risk = result.get("flood_risk") or result.get("risk_level") or result.get("alert_level", "")
        if str(risk).lower() in HUMAN_APPROVAL_RISK_LEVELS:
            report["human_approval_required"] = True
            report["escalation_required"]     = True
            reason = f"risk_level={risk} requires human approval"
            report["escalation_reason"].append(reason)
            report["audit_events"].append(
                audit_event("HIGH_RISK_ESCALATION", agent_id, session_id,
                            {"risk_level": risk, "requires": "human_approval"},
                            severity="warning")
            )

        # ── Rule 4: Emergency action with no human flag ───────────────────────
        if result.get("emergency_action_required") and not result.get("human_approval_required"):
            result["human_approval_required"] = True
            report["human_approval_required"] = True
            report["audit_events"].append(
                audit_event("EMERGENCY_FLAG_INJECTED", agent_id, session_id,
                            {"reason": "emergency_action_required=True forces human_approval"},
                            severity="warning")
            )

        # ── Rule 5: Public broadcast requires approval ────────────────────────
        if result.get("public_alert") or result.get("evacuation_recommended"):
            report["human_approval_required"] = True
            report["escalation_required"]     = True
            report["escalation_reason"].append("Public alert or evacuation order requires human approval")
            report["audit_events"].append(
                audit_event("PUBLIC_ACTION_GATE", agent_id, session_id,
                            {"action": "evacuation_recommended or public_alert"},
                            severity="warning")
            )

    # ── Rule 6: SLA monitoring ────────────────────────────────────────────────
    if latency_ms >= SLA_LATENCY_ALERT_MS:
        report["sla_breach"] = True
        report["governance_warnings"].append(
            f"SLA BREACH: {agent_id} took {latency_ms}ms (alert threshold={SLA_LATENCY_ALERT_MS}ms)"
        )
        report["audit_events"].append(
            audit_event("SLA_BREACH", agent_id, session_id,
                        {"latency_ms": latency_ms, "threshold_ms": SLA_LATENCY_ALERT_MS},
                        severity="warning")
        )
    elif latency_ms >= SLA_LATENCY_WARN_MS:
        report["governance_warnings"].append(
            f"SLA WARNING: {agent_id} took {latency_ms}ms (warn threshold={SLA_LATENCY_WARN_MS}ms)"
        )

    # ── Final audit: record completed run ─────────────────────────────────────
    report["audit_events"].append(
        audit_event("AGENT_RUN_COMPLETE", agent_id, session_id, {
            "confidence":              confidence,
            "latency_ms":              latency_ms,
            "human_review_required":   report["human_review_required"],
            "human_approval_required": report["human_approval_required"],
            "escalation_required":     report["escalation_required"],
            "warnings":                len(report["governance_warnings"]),
        })
    )

    return report


# ── Override tracking ─────────────────────────────────────────────────────────

def record_human_override(
    agent_id: str,
    session_id: str,
    original_recommendation: str,
    override_decision: str,
    override_by: str,
    reason: str,
) -> Dict:
    entry = audit_event(
        "HUMAN_OVERRIDE", agent_id, session_id,
        {
            "original":       original_recommendation,
            "override":       override_decision,
            "overridden_by":  override_by,
            "reason":         reason,
        },
        severity="warning",
    )
    logger.warning(
        f"[Governance:OVERRIDE] {agent_id} recommendation overridden by {override_by}. "
        f"Original: '{original_recommendation}' → Override: '{override_decision}'"
    )
    return entry


# ── Audit log access ──────────────────────────────────────────────────────────

def get_audit_log(
    agent_id: Optional[str] = None,
    event_type: Optional[str] = None,
    limit: int = 100,
) -> List[Dict]:
    entries = list(reversed(_audit_log))  # newest first
    if agent_id:
        entries = [e for e in entries if e["agent_id"] == agent_id]
    if event_type:
        entries = [e for e in entries if e["event_type"] == event_type]
    return entries[:limit]


def get_governance_summary() -> Dict:
    total = len(_audit_log)
    by_type: Dict[str, int] = {}
    by_agent: Dict[str, int] = {}
    escalations = 0
    overrides = 0
    sla_breaches = 0

    for e in _audit_log:
        by_type[e["event_type"]]  = by_type.get(e["event_type"], 0) + 1
        by_agent[e["agent_id"]]   = by_agent.get(e["agent_id"], 0) + 1
        if e["event_type"] in ("HIGH_RISK_ESCALATION", "PUBLIC_ACTION_GATE", "EMERGENCY_FLAG_INJECTED"):
            escalations += 1
        if e["event_type"] == "HUMAN_OVERRIDE":
            overrides += 1
        if e["event_type"] == "SLA_BREACH":
            sla_breaches += 1

    return {
        "total_audit_events": total,
        "escalations":        escalations,
        "human_overrides":    overrides,
        "sla_breaches":       sla_breaches,
        "by_event_type":      by_type,
        "by_agent":           by_agent,
    }
