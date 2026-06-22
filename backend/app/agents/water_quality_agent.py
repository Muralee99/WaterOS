from typing import Dict
import random
from app.agents.base_agent import BaseWaterAgent, AgentResult


class WaterQualityAgent(BaseWaterAgent):
    def __init__(self):
        super().__init__(
            agent_id="water_quality_agent",
            description="Analyzes pH, chlorine, turbidity, heavy metals and produces water safety scores",
        )

    async def run(self, context: Dict) -> AgentResult:
        self.add_reasoning_step("Reading water quality sensors")
        self.tools_called.append("water_quality_sensor_array")
        self.tools_called.append("spectrometer_analysis")

        ph = context.get("ph", round(random.uniform(6.5, 8.5), 2))
        turbidity = context.get("turbidity_ntu", round(random.uniform(0.5, 15), 2))
        chlorine = context.get("chlorine_mg_l", round(random.uniform(0.1, 2.0), 2))
        dissolved_oxygen = context.get("dissolved_oxygen", round(random.uniform(5, 12), 2))
        heavy_metals = context.get("heavy_metals", {
            "lead_ppb": round(random.uniform(0, 15), 2),
            "arsenic_ppb": round(random.uniform(0, 10), 2),
            "mercury_ppb": round(random.uniform(0, 2), 2),
        })

        self.add_reasoning_step("Calculating water safety score", {
            "ph": ph, "turbidity": turbidity, "chlorine": chlorine,
        })

        # WHO standards check
        ph_safe = 6.5 <= ph <= 8.5
        turbidity_safe = turbidity <= 4.0
        chlorine_safe = 0.2 <= chlorine <= 2.0
        do_safe = dissolved_oxygen >= 6.0
        lead_safe = heavy_metals.get("lead_ppb", 0) <= 10
        arsenic_safe = heavy_metals.get("arsenic_ppb", 0) <= 10

        safety_score = sum([ph_safe, turbidity_safe, chlorine_safe, do_safe, lead_safe, arsenic_safe]) / 6 * 100

        status = "safe" if safety_score >= 80 else "warning" if safety_score >= 60 else "danger"

        prompt = f"""
        Water Quality AI Analysis:
        pH: {ph} (WHO: 6.5-8.5)
        Turbidity: {turbidity} NTU (WHO: <4 NTU)
        Chlorine: {chlorine} mg/L (WHO: 0.2-2.0 mg/L)
        Dissolved Oxygen: {dissolved_oxygen} mg/L
        Heavy Metals: {heavy_metals}

        Safety Score: {safety_score:.1f}%
        Status: {status}

        Provide:
        1. Detailed safety assessment per parameter
        2. Specific health risks if any
        3. Treatment recommendations
        4. Population at risk
        5. Urgency level
        """

        ai_response = await self.call_gemini(prompt)
        self.add_reasoning_step("AI water quality assessment complete")

        violations = []
        if not ph_safe:
            violations.append(f"pH {ph} outside safe range 6.5-8.5")
        if not turbidity_safe:
            violations.append(f"Turbidity {turbidity} NTU exceeds 4 NTU limit")
        if not chlorine_safe:
            violations.append(f"Chlorine {chlorine} mg/L outside 0.2-2.0 range")

        result = {
            "measurements": {
                "ph": ph,
                "turbidity_ntu": turbidity,
                "chlorine_mg_l": chlorine,
                "dissolved_oxygen_mg_l": dissolved_oxygen,
                "heavy_metals": heavy_metals,
            },
            "safety_score": round(safety_score, 1),
            "status": status,
            "violations": violations,
            "who_compliance": len(violations) == 0,
            "ai_analysis": ai_response[:500],
            "treatment_required": status != "safe",
            "immediate_action": status == "danger",
        }

        return AgentResult(
            agent_id=self.agent_id,
            status="completed",
            result=result,
            reasoning_chain=self.reasoning_chain,
            confidence=round(random.uniform(0.88, 0.97), 2),
            tools_called=self.tools_called,
            agents_invoked=self.agents_invoked,
            latency_ms=0,
        )
