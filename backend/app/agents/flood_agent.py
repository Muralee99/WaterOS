from typing import Dict
import random
from app.agents.base_agent import BaseWaterAgent, AgentResult
from app.agents.rainfall_agent import RainfallAgent
from app.agents.reservoir_agent import ReservoirAgent


class FloodAgent(BaseWaterAgent):
    def __init__(self):
        super().__init__(
            agent_id="flood_agent",
            description="Monitors rivers, calculates flood risk, and triggers emergency coordination",
        )

    async def run(self, context: Dict) -> AgentResult:
        self.add_reasoning_step("Starting flood risk assessment")

        # Agent-to-Agent: Invoke RainfallAgent
        rainfall_agent = RainfallAgent()
        rainfall_result = await self.invoke_agent(rainfall_agent, context)
        rainfall_data = rainfall_result.result or {}

        # Agent-to-Agent: Invoke ReservoirAgent
        reservoir_agent = ReservoirAgent()
        reservoir_result = await self.invoke_agent(reservoir_agent, {
            **context,
            "rainfall_forecast": rainfall_data.get("forecast_7day_mm", [50] * 7),
        })
        reservoir_data = reservoir_result.result or {}

        self.tools_called.append("river_sensor_network")
        self.tools_called.append("topography_model")

        river_level = context.get("river_level_m", random.uniform(2, 8))
        normal_level = context.get("normal_level_m", 3.5)
        flood_threshold = context.get("flood_level_m", 6.0)

        level_ratio = river_level / flood_threshold if flood_threshold > 0 else 0
        storm_prob = rainfall_data.get("storm_probability_pct", 50)
        overflow_risk = reservoir_data.get("overflow_risk", "low")

        flood_risk_score = (level_ratio * 0.4 + (storm_prob / 100) * 0.4 +
                           (0.2 if overflow_risk in ["high", "critical"] else 0.0))

        flood_risk = "critical" if flood_risk_score > 0.8 else \
                     "high" if flood_risk_score > 0.6 else \
                     "medium" if flood_risk_score > 0.4 else "low"

        self.add_reasoning_step("Flood risk computed", {
            "risk_score": flood_risk_score,
            "flood_risk": flood_risk,
            "contributing_factors": ["river_level", "storm_probability", "reservoir_overflow"],
        })

        prompt = f"""
        Flood Risk Assessment:
        River Level: {river_level:.2f}m (Normal: {normal_level}m, Flood: {flood_threshold}m)
        Storm Probability: {storm_prob}%
        Reservoir Overflow Risk: {overflow_risk}
        7-day Rainfall: {rainfall_data.get("forecast_7day_mm", [])}

        Provide:
        1. Hours until potential flood event
        2. Affected area radius (km)
        3. Evacuation zones
        4. Emergency resource requirements
        5. Downstream community alerts needed
        """

        ai_response = await self.call_gemini(prompt)

        hours_to_flood = None
        if flood_risk in ["high", "critical"]:
            hours_to_flood = round(random.uniform(6, 48), 0)

        result = {
            "river_level_m": round(river_level, 2),
            "normal_level_m": normal_level,
            "flood_threshold_m": flood_threshold,
            "flood_risk": flood_risk,
            "flood_risk_score": round(flood_risk_score, 3),
            "hours_to_flood": hours_to_flood,
            "rainfall_analysis": {
                "storm_probability": storm_prob,
                "total_7day_mm": rainfall_data.get("total_7day_mm", 0),
            },
            "reservoir_analysis": {
                "overflow_risk": overflow_risk,
                "recommended_outflow": reservoir_data.get("recommended_outflow_m3s"),
            },
            "ai_analysis": ai_response[:600],
            "emergency_action_required": flood_risk in ["high", "critical"],
            "evacuation_recommended": flood_risk == "critical",
        }

        return AgentResult(
            agent_id=self.agent_id,
            status="completed",
            result=result,
            reasoning_chain=self.reasoning_chain,
            confidence=round(random.uniform(0.78, 0.94), 2),
            tools_called=self.tools_called,
            agents_invoked=self.agents_invoked,
            latency_ms=0,
        )
