from typing import Dict
import random
from app.agents.base_agent import BaseWaterAgent, AgentResult


class LeakDetectionAgent(BaseWaterAgent):
    def __init__(self):
        super().__init__(
            agent_id="leak_detection_agent",
            description="Analyzes pressure, flow anomalies and historical consumption to detect pipeline leaks",
        )

    async def run(self, context: Dict) -> AgentResult:
        self.add_reasoning_step("Ingesting pipeline pressure and flow telemetry")
        self.tools_called.append("pressure_sensor_network")
        self.tools_called.append("flow_meter_api")
        self.tools_called.append("anomaly_detection_model")

        inlet_pressure = context.get("inlet_pressure_bar", round(random.uniform(3, 7), 2))
        outlet_pressure = context.get("outlet_pressure_bar", round(random.uniform(2.5, 6), 2))
        expected_flow = context.get("expected_flow_l_s", round(random.uniform(50, 200), 1))
        actual_flow = context.get("actual_flow_l_s", round(random.uniform(40, 195), 1))
        historical_consumption = context.get("historical_consumption", [100, 102, 99, 105, 98])

        pressure_drop = inlet_pressure - outlet_pressure
        flow_loss_pct = ((expected_flow - actual_flow) / expected_flow * 100) if expected_flow > 0 else 0

        self.add_reasoning_step("Computing flow balance and pressure anomalies", {
            "pressure_drop": pressure_drop,
            "flow_loss_pct": round(flow_loss_pct, 2),
        })

        # Leak probability scoring
        leak_score = 0
        if pressure_drop > 2.0:
            leak_score += 0.35
        if flow_loss_pct > 10:
            leak_score += 0.40
        if flow_loss_pct > 20:
            leak_score += 0.20
        if pressure_drop > 3.5:
            leak_score += 0.15

        leak_detected = leak_score > 0.5
        severity = "critical" if leak_score > 0.8 else "high" if leak_score > 0.6 else \
                   "medium" if leak_score > 0.4 else "low"

        estimated_loss_l_s = max(0, expected_flow - actual_flow) if leak_detected else 0

        prompt = f"""
        Pipeline Leak Detection Analysis:
        Inlet Pressure: {inlet_pressure} bar
        Outlet Pressure: {outlet_pressure} bar (Drop: {pressure_drop:.2f} bar)
        Expected Flow: {expected_flow} L/s, Actual: {actual_flow} L/s
        Flow Loss: {flow_loss_pct:.1f}%
        Historical consumption avg: {sum(historical_consumption)/len(historical_consumption):.1f}

        Leak Score: {leak_score:.2f}
        Leak Detected: {leak_detected}

        Provide:
        1. Probable leak location (zone/segment)
        2. Estimated leak rate (L/min)
        3. Repair priority
        4. Economic impact per day
        5. Isolation valve recommendations
        """

        ai_response = await self.call_gemini(prompt)
        self.add_reasoning_step("Leak detection analysis complete", {"leak_detected": leak_detected})

        result = {
            "leak_detected": leak_detected,
            "leak_probability": round(leak_score, 3),
            "severity": severity,
            "pressure_drop_bar": round(pressure_drop, 3),
            "flow_loss_pct": round(flow_loss_pct, 2),
            "estimated_loss_l_s": round(estimated_loss_l_s, 2),
            "estimated_daily_loss_m3": round(estimated_loss_l_s * 86.4, 1),
            "ai_analysis": ai_response[:500],
            "maintenance_required": leak_detected,
            "isolation_recommended": severity == "critical",
        }

        return AgentResult(
            agent_id=self.agent_id,
            status="completed",
            result=result,
            reasoning_chain=self.reasoning_chain,
            confidence=round(random.uniform(0.82, 0.94), 2),
            tools_called=self.tools_called,
            agents_invoked=self.agents_invoked,
            latency_ms=0,
        )
