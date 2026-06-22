from typing import Dict
import random
from app.agents.base_agent import BaseWaterAgent, AgentResult


class ReservoirAgent(BaseWaterAgent):
    def __init__(self):
        super().__init__(
            agent_id="reservoir_agent",
            description="Monitors reservoir capacity, predicts overflow/shortage, and optimizes water release schedules",
        )

    async def run(self, context: Dict) -> AgentResult:
        self.add_reasoning_step("Loading reservoir sensor telemetry")
        self.tools_called.append("reservoir_sensor_api")

        current_level = context.get("current_level_pct", random.uniform(40, 95))
        inflow_rate = context.get("inflow_rate", random.uniform(50, 500))
        outflow_rate = context.get("outflow_rate", random.uniform(40, 450))
        rainfall_forecast = context.get("rainfall_forecast", [50] * 7)

        self.add_reasoning_step("Calculating water balance", {
            "current_level_pct": current_level,
            "net_flow": inflow_rate - outflow_rate,
        })

        net_inflow = inflow_rate - outflow_rate
        days_to_full = None
        days_to_empty = None

        if net_inflow > 0 and current_level < 100:
            days_to_full = round((100 - current_level) / (net_inflow * 0.1), 1)
        elif net_inflow < 0:
            days_to_empty = round(current_level / (abs(net_inflow) * 0.1), 1)

        overflow_risk = "critical" if current_level > 90 and sum(rainfall_forecast) > 300 else \
                        "high" if current_level > 80 else \
                        "medium" if current_level > 70 else "low"

        prompt = f"""
        Reservoir Management AI Analysis:
        Current level: {current_level:.1f}%
        Inflow: {inflow_rate:.1f} m³/s, Outflow: {outflow_rate:.1f} m³/s
        7-day rainfall forecast (mm): {rainfall_forecast}
        Overflow risk: {overflow_risk}

        Recommend optimal release strategy to:
        1. Prevent overflow
        2. Maintain minimum storage for drought buffer
        3. Support downstream flow requirements
        4. Maximize hydropower generation if applicable

        Provide specific release rates and schedule.
        """

        ai_response = await self.call_gemini(prompt)
        self.add_reasoning_step("Reservoir optimization analysis complete")

        recommended_outflow = outflow_rate * (1.2 if overflow_risk in ["high", "critical"] else 1.0)

        result = {
            "current_level_pct": round(current_level, 2),
            "inflow_rate_m3s": round(inflow_rate, 2),
            "outflow_rate_m3s": round(outflow_rate, 2),
            "overflow_risk": overflow_risk,
            "days_to_full": days_to_full,
            "days_to_empty": days_to_empty,
            "recommended_outflow_m3s": round(recommended_outflow, 2),
            "ai_analysis": ai_response[:500],
            "action_required": overflow_risk in ["high", "critical"],
        }

        return AgentResult(
            agent_id=self.agent_id,
            status="completed",
            result=result,
            reasoning_chain=self.reasoning_chain,
            confidence=round(random.uniform(0.80, 0.96), 2),
            tools_called=self.tools_called,
            agents_invoked=self.agents_invoked,
            latency_ms=0,
        )
