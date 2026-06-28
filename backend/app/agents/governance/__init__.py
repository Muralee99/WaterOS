"""
WaterOS Agent Governance Layer
Exports all governance components for use in base_agent.py and API endpoints.
"""

from .instructions import get_instructions, AGENT_INSTRUCTIONS
from .guardrails   import (validate_input, validate_output,
                            record_success, record_failure,
                            get_circuit_status, GuardrailViolation)
from .protocols    import (build_a2a_envelope, check_invocation_allowed,
                            check_rate_limit, enforce_timeout,
                            get_rate_limit_status, A2A_VERSION)
from .governance   import (apply_governance, record_human_override,
                            get_audit_log, get_governance_summary, audit_event)

__all__ = [
    # Instructions
    "get_instructions", "AGENT_INSTRUCTIONS",
    # Guardrails
    "validate_input", "validate_output",
    "record_success", "record_failure",
    "get_circuit_status", "GuardrailViolation",
    # Protocols
    "build_a2a_envelope", "check_invocation_allowed",
    "check_rate_limit", "enforce_timeout",
    "get_rate_limit_status", "A2A_VERSION",
    # Governance
    "apply_governance", "record_human_override",
    "get_audit_log", "get_governance_summary", "audit_event",
]
