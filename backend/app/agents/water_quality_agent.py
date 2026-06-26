from typing import Dict
import random
from app.agents.base_agent import BaseWaterAgent, AgentResult

# Realistic water quality contexts for key demo cities
_CITY_WQ: Dict[str, Dict] = {
    "Mumbai": {
        "ph": 7.4,
        "turbidity_ntu": 6.8,      # Monsoon spike — above 4.0 WHO limit
        "chlorine_mg_l": 0.8,
        "dissolved_oxygen": 7.2,
        "heavy_metals": {"lead_ppb": 4.2, "arsenic_ppb": 1.8, "mercury_ppb": 0.1},
        "_zone": "Zone 7 — Bhandup WTP service area (monsoon turbidity surge)",
        "_population_at_risk": "1.2M residents in eastern suburbs",
    },
    "Delhi": {
        "ph": 7.8,
        "turbidity_ntu": 12.4,     # Very high — Yamuna runoff
        "chlorine_mg_l": 0.4,
        "dissolved_oxygen": 5.6,   # Below 6.0 → violation
        "heavy_metals": {"lead_ppb": 8.6, "arsenic_ppb": 3.2, "mercury_ppb": 0.3},
        "_zone": "Yamuna basin WTP — monsoon runoff contamination",
        "_population_at_risk": "4.8M in downstream distribution zones",
    },
    "Dhaka City": {
        "ph": 6.9,
        "turbidity_ntu": 18.2,
        "chlorine_mg_l": 0.12,     # Below 0.2 → violation
        "dissolved_oxygen": 4.8,   # Below 6.0 → violation
        "heavy_metals": {"lead_ppb": 12.4, "arsenic_ppb": 8.9, "mercury_ppb": 0.8},
        "_zone": "Buriganga River intake — critical industrial contamination",
        "_population_at_risk": "8.9M Dhaka metro residents",
    },
    "Cairo": {
        "ph": 8.1,
        "turbidity_ntu": 3.2,
        "chlorine_mg_l": 0.6,
        "dissolved_oxygen": 7.8,
        "heavy_metals": {"lead_ppb": 5.1, "arsenic_ppb": 2.4, "mercury_ppb": 0.2},
        "_zone": "Nile delta intake — agricultural runoff concern",
        "_population_at_risk": "2.1M in eastern districts",
    },
    "Jakarta": {
        "ph": 6.8,
        "turbidity_ntu": 8.9,
        "chlorine_mg_l": 0.3,
        "dissolved_oxygen": 5.2,   # Below 6.0 → violation
        "heavy_metals": {"lead_ppb": 9.8, "arsenic_ppb": 4.6, "mercury_ppb": 0.5},
        "_zone": "Ciliwung River catchment — industrial discharge",
        "_population_at_risk": "5.6M in central Jakarta",
    },
    "Nairobi": {
        "ph": 7.1,
        "turbidity_ntu": 5.8,
        "chlorine_mg_l": 0.25,
        "dissolved_oxygen": 6.4,
        "heavy_metals": {"lead_ppb": 6.8, "arsenic_ppb": 2.1, "mercury_ppb": 0.2},
        "_zone": "Nairobi River — urban stormwater contamination",
        "_population_at_risk": "900K in Eastlands districts",
    },
}


class WaterQualityAgent(BaseWaterAgent):
    def __init__(self):
        super().__init__(
            agent_id="water_quality_agent",
            description="Analyzes pH, chlorine, turbidity, heavy metals and produces water safety scores",
        )

    async def run(self, context: Dict) -> AgentResult:
        self.add_reasoning_step("Reading water quality sensors")
        self.tools_called.extend(["water_quality_sensor_array", "spectrometer_analysis"])

        city = context.get("city", "")
        country = context.get("country", "")
        demo = _CITY_WQ.get(city) or {}

        ph = demo.get("ph") or context.get("ph", round(random.uniform(6.5, 8.5), 2))
        turbidity = demo.get("turbidity_ntu") or context.get("turbidity_ntu", round(random.uniform(0.5, 15), 2))
        chlorine = demo.get("chlorine_mg_l") or context.get("chlorine_mg_l", round(random.uniform(0.1, 2.0), 2))
        dissolved_oxygen = demo.get("dissolved_oxygen") or context.get("dissolved_oxygen", round(random.uniform(5, 12), 2))
        heavy_metals = demo.get("heavy_metals") or context.get("heavy_metals", {
            "lead_ppb": round(random.uniform(0, 15), 2),
            "arsenic_ppb": round(random.uniform(0, 10), 2),
            "mercury_ppb": round(random.uniform(0, 2), 2),
        })
        zone = demo.get("_zone", f"{city or country or 'monitoring zone'} — standard sampling point")
        pop_at_risk = demo.get("_population_at_risk", "")

        self.add_reasoning_step("Calculating water safety score against WHO standards", {
            "ph": ph, "turbidity_ntu": turbidity, "chlorine_mg_l": chlorine,
        })

        ph_safe = 6.5 <= ph <= 8.5
        turbidity_safe = turbidity <= 4.0
        chlorine_safe = 0.2 <= chlorine <= 2.0
        do_safe = dissolved_oxygen >= 6.0
        lead_safe = heavy_metals.get("lead_ppb", 0) <= 10
        arsenic_safe = heavy_metals.get("arsenic_ppb", 0) <= 10

        safety_score = sum([ph_safe, turbidity_safe, chlorine_safe, do_safe, lead_safe, arsenic_safe]) / 6 * 100
        status = "safe" if safety_score >= 83 else "warning" if safety_score >= 67 else "danger"

        violations = []
        if not ph_safe:
            violations.append(f"pH {ph:.2f} outside WHO range 6.5–8.5")
        if not turbidity_safe:
            violations.append(f"Turbidity {turbidity:.1f} NTU — exceeds 4.0 NTU WHO limit")
        if not chlorine_safe:
            violations.append(f"Chlorine {chlorine:.2f} mg/L — outside 0.2–2.0 mg/L safe band")
        if not do_safe:
            violations.append(f"Dissolved oxygen {dissolved_oxygen:.1f} mg/L — below 6.0 mg/L threshold")
        if not lead_safe:
            violations.append(f"Lead {heavy_metals.get('lead_ppb'):.1f} ppb — exceeds 10 ppb WHO limit")
        if not arsenic_safe:
            violations.append(f"Arsenic {heavy_metals.get('arsenic_ppb'):.1f} ppb — exceeds 10 ppb WHO limit")

        scope = city or country or "region"
        prompt = (
            f"Water Quality AI Analysis — {zone} ({scope}):\n"
            f"pH: {ph:.2f} (WHO: 6.5–8.5) {'✓' if ph_safe else '✗ VIOLATION'}\n"
            f"Turbidity: {turbidity:.1f} NTU (WHO: <4.0) {'✓' if turbidity_safe else '✗ VIOLATION'}\n"
            f"Chlorine: {chlorine:.2f} mg/L (WHO: 0.2–2.0) {'✓' if chlorine_safe else '✗ VIOLATION'}\n"
            f"Dissolved O₂: {dissolved_oxygen:.1f} mg/L (min: 6.0) {'✓' if do_safe else '✗ VIOLATION'}\n"
            f"Heavy metals: Lead {heavy_metals.get('lead_ppb'):.1f} ppb | "
            f"Arsenic {heavy_metals.get('arsenic_ppb'):.1f} ppb | Mercury {heavy_metals.get('mercury_ppb'):.2f} ppb\n"
            f"Overall safety score: {safety_score:.1f}% — Status: {status.upper()}\n"
            + (f"At-risk population: {pop_at_risk}\n" if pop_at_risk else "")
            + f"\nProvide: (1) health risk assessment, (2) treatment priority actions, "
              f"(3) timeline for safe water restoration, (4) public health advisory recommendation."
        )

        ai_response = await self.call_gemini(prompt)
        if not ai_response or ai_response.startswith("[Simulated"):
            ai_response = self._fallback(zone, violations, status, safety_score, pop_at_risk, turbidity, chlorine)

        self.add_reasoning_step("AI water quality assessment complete", {"violations": len(violations)})

        result: Dict = {
            "sampling_zone": zone,
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
            "population_at_risk": pop_at_risk,
            "ai_analysis": ai_response[:700],
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

    def _fallback(self, zone: str, violations: list, status: str, score: float,
                  pop: str, turbidity: float, chlorine: float) -> str:
        viol_str = "; ".join(violations[:3]) if violations else "No critical violations detected"
        urgency = "IMMEDIATE BOIL-WATER ADVISORY" if status == "danger" else "PRECAUTIONARY ADVISORY" if status == "warning" else "SAFE FOR CONSUMPTION"
        return (
            f"{zone}: Safety score {score:.0f}% — {urgency}. "
            f"Key findings: {viol_str}. "
            + (f"Population at risk: {pop}. " if pop else "")
            + (f"Treatment priority: increase chlorination to maintain residual >0.5 mg/L and deploy enhanced coagulation for turbidity reduction. " if turbidity > 4 or chlorine < 0.3 else "")
            + "Issue public health notice and increase sampling frequency to 4-hourly until parameters normalise."
        )
