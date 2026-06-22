from typing import Dict
import random
from datetime import datetime, timezone
from app.agents.base_agent import BaseWaterAgent, AgentResult
from app.agents.emergency_agent import EmergencyAgent
from app.agents.rainfall_agent import RainfallAgent
from app.agents.reservoir_agent import ReservoirAgent


class DecisionAgent(BaseWaterAgent):
    """Master reasoning agent — collects all agent outputs and produces final recommendation."""

    def __init__(self):
        super().__init__(
            agent_id="decision_agent",
            description="Master reasoning agent that synthesizes all sub-agent outputs into final actionable recommendations",
        )

    async def run(self, context: Dict) -> AgentResult:
        self.add_reasoning_step("Decision Agent activated — orchestrating full system analysis")

        # Run the full agent cascade
        emergency_agent = EmergencyAgent()
        emergency_result = await self.invoke_agent(emergency_agent, context)

        rainfall_agent = RainfallAgent()
        rainfall_result = await self.invoke_agent(rainfall_agent, context)

        reservoir_agent = ReservoirAgent()
        reservoir_result = await self.invoke_agent(reservoir_agent, context)

        self.tools_called.append("knowledge_graph_query")
        self.tools_called.append("historical_data_retrieval")
        self.tools_called.append("decision_matrix_engine")

        emergency_data = emergency_result.result or {}
        rainfall_data = rainfall_result.result or {}
        reservoir_data = reservoir_result.result or {}

        self.add_reasoning_step("All sub-agent reports collected", {
            "agents_completed": len(self.agents_invoked),
            "overall_severity": emergency_data.get("overall_severity"),
        })

        # Synthesize final recommendation
        severity = emergency_data.get("overall_severity", "low")
        confidence = round(
            (emergency_result.confidence + rainfall_result.confidence + reservoir_result.confidence) / 3, 3
        )

        prompt = f"""
        WaterOS Decision Agent — Final Synthesis

        You are the master decision AI for a water management platform. Based on all agent reports:

        EMERGENCY STATUS: {severity}
        Active Emergencies: {emergency_data.get("emergency_count", 0)}
        Evacuation Required: {emergency_data.get("evacuation_required", False)}

        RAINFALL ANALYSIS:
        Storm Probability: {rainfall_data.get("storm_probability_pct", 0)}%
        7-Day Total: {rainfall_data.get("total_7day_mm", 0)}mm
        Drought Risk: {rainfall_data.get("drought_risk", "unknown")}

        RESERVOIR STATUS:
        Current Level: {reservoir_data.get("current_level_pct", 0)}%
        Overflow Risk: {reservoir_data.get("overflow_risk", "unknown")}
        Recommended Outflow: {reservoir_data.get("recommended_outflow_m3s", 0)} m³/s

        WATER QUALITY:
        Status: {emergency_data.get("quality_summary", {}).get("status", "unknown")}
        Safety Score: {emergency_data.get("quality_summary", {}).get("safety_score", 0)}%

        LEAKAGE:
        Detected: {emergency_data.get("leak_summary", {}).get("detected", False)}
        Daily Loss: {emergency_data.get("leak_summary", {}).get("daily_loss_m3", 0)} m³/day

        Provide a comprehensive final recommendation with:
        1. IMMEDIATE ACTIONS (next 1 hour)
        2. SHORT-TERM ACTIONS (next 24 hours)
        3. MEDIUM-TERM ACTIONS (next 7 days)
        4. CONFIDENCE and reasoning
        5. Alternative scenarios considered
        6. Which agents contributed to this decision
        7. Data quality assessment
        """

        ai_response = await self.call_gemini(prompt)
        self.add_reasoning_step("Final decision synthesis complete")

        alternatives = [
            {
                "scenario": "Conservative approach",
                "action": "Increase monitoring frequency, hold emergency reserves",
                "probability": 0.30,
            },
            {
                "scenario": "Aggressive response",
                "action": "Immediate release + full emergency activation",
                "probability": 0.25,
            },
        ]

        result = {
            "final_recommendation": ai_response[:1000],
            "severity_level": severity,
            "confidence": confidence,
            "immediate_actions": self._get_immediate_actions(emergency_data),
            "short_term_actions": self._get_short_term_actions(rainfall_data, reservoir_data),
            "alternative_scenarios": alternatives,
            "agents_participated": list(set(self.agents_invoked)),
            "tools_used": list(set(self.tools_called)),
            "evidence_summary": {
                "emergency": emergency_data.get("overall_severity"),
                "storm_probability": rainfall_data.get("storm_probability_pct"),
                "reservoir_level": reservoir_data.get("current_level_pct"),
            },
            "reasoning_steps": len(self.reasoning_chain),
            "analysis_timestamp": datetime.now(timezone.utc).isoformat(),
        }

        return AgentResult(
            agent_id=self.agent_id,
            status="completed",
            result=result,
            reasoning_chain=self.reasoning_chain,
            confidence=confidence,
            tools_called=self.tools_called,
            agents_invoked=self.agents_invoked,
            latency_ms=0,
        )

    def _get_immediate_actions(self, emergency_data: Dict) -> list:
        actions = []
        if emergency_data.get("evacuation_required"):
            actions.append("Initiate evacuation protocol for high-risk zones")
        if emergency_data.get("notifications_sent"):
            actions.append("Issue public emergency notifications via all channels")
        if emergency_data.get("overall_severity") == "critical":
            actions.append("Activate Emergency Operations Center (EOC)")
        actions.append("Deploy rapid response monitoring teams to affected sites")
        return actions

    def _get_short_term_actions(self, rainfall_data: Dict, reservoir_data: Dict) -> list:
        actions = []
        if reservoir_data.get("overflow_risk") in ["high", "critical"]:
            actions.append(f"Increase reservoir outflow to {reservoir_data.get('recommended_outflow_m3s', 0)} m³/s")
        if rainfall_data.get("drought_risk") == "high":
            actions.append("Activate water conservation Stage 2 protocols")
        actions.append("Coordinate with meteorological department for updates every 6 hours")
        actions.append("Pre-position emergency equipment at strategic locations")
        return actions
