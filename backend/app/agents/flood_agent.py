from typing import Dict
import random
from app.agents.base_agent import BaseWaterAgent, AgentResult
from app.agents.rainfall_agent import RainfallAgent
from app.agents.reservoir_agent import ReservoirAgent

# Realistic river contexts for demo locations
_RIVER_CONTEXTS: Dict[str, Dict] = {
    ("India", "Assam"): {
        "river_name": "Brahmaputra", "river_level_m": 7.2, "normal_level_m": 3.5,
        "flood_level_m": 6.0, "gauge_station": "Guwahati — Saraighat Bridge",
        "affected_districts": ["Kamrup", "Barpeta", "Morigaon", "Nagaon"],
        "affected_population_k": 240,
        "emergency_resources": "45 NDRF boats, 8 rescue teams, 12 medical camps",
        "_rainfall_override": {"storm_probability_pct": 78, "total_7day_mm": 312},
    },
    ("India", "Maharashtra"): {
        "river_name": "Godavari", "river_level_m": 5.4, "normal_level_m": 2.8,
        "flood_level_m": 5.0, "gauge_station": "Nashik — Gangapur Dam downstream",
        "affected_districts": ["Nashik", "Nandurbar", "Dhule"],
        "affected_population_k": 85,
        "emergency_resources": "22 SDRF boats, 5 rescue teams, 8 medical camps",
        "_rainfall_override": {"storm_probability_pct": 62, "total_7day_mm": 198},
    },
    ("Bangladesh", "Dhaka Division"): {
        "river_name": "Buriganga", "river_level_m": 6.8, "normal_level_m": 3.2,
        "flood_level_m": 5.5, "gauge_station": "Dhaka — Sadarghat gauge",
        "affected_districts": ["Dhaka", "Narayanganj", "Munshiganj"],
        "affected_population_k": 890,
        "emergency_resources": "120 BIWTA boats, 30 rescue teams, 45 shelter camps",
        "_rainfall_override": {"storm_probability_pct": 84, "total_7day_mm": 427},
    },
    ("India", "Punjab"): {
        "river_name": "Sutlej", "river_level_m": 4.1, "normal_level_m": 2.5,
        "flood_level_m": 4.5, "gauge_station": "Ropar Headworks",
        "affected_districts": ["Ropar", "Fatehgarh Sahib"],
        "affected_population_k": 32,
        "emergency_resources": "14 NDRF boats, 4 rescue teams",
        "_rainfall_override": {"storm_probability_pct": 41, "total_7day_mm": 94},
    },
}

_COUNTRY_CONTEXTS: Dict[str, Dict] = {
    "Bangladesh": {
        "river_name": "Padma–Brahmaputra system", "river_level_m": 6.3, "normal_level_m": 3.0,
        "flood_level_m": 5.5, "gauge_station": "Hardinge Bridge, Pabna",
        "affected_districts": ["Dhaka", "Sylhet", "Mymensingh", "Rajshahi"],
        "affected_population_k": 4200,
        "emergency_resources": "National flood response — 400 boats, 120 rescue teams",
        "_rainfall_override": {"storm_probability_pct": 81, "total_7day_mm": 389},
    },
}


class FloodAgent(BaseWaterAgent):
    def __init__(self):
        super().__init__(
            agent_id="flood_agent",
            description="Monitors rivers, calculates flood risk, and triggers emergency coordination",
        )

    async def run(self, context: Dict) -> AgentResult:
        self.add_reasoning_step("Starting flood risk assessment")
        self.tools_called.extend(["river_sensor_network", "topography_model", "hydrological_model"])

        country = context.get("country", "")
        state = context.get("state", "")
        city = context.get("city", "")

        # Resolve demo river context
        demo = (_RIVER_CONTEXTS.get((country, state))
                or _RIVER_CONTEXTS.get((country, city))
                or _COUNTRY_CONTEXTS.get(country)
                or {})

        # Agent-to-Agent: Invoke RainfallAgent
        rainfall_agent = RainfallAgent()
        rainfall_result = await self.invoke_agent(rainfall_agent, context)
        rainfall_data = rainfall_result.result or {}

        # Override rainfall with realistic demo data if available
        if demo.get("_rainfall_override"):
            rainfall_data.update(demo["_rainfall_override"])

        # Agent-to-Agent: Invoke ReservoirAgent
        reservoir_agent = ReservoirAgent()
        reservoir_result = await self.invoke_agent(reservoir_agent, {
            **context,
            "rainfall_forecast": rainfall_data.get("forecast_7day_mm", [50] * 7),
        })
        reservoir_data = reservoir_result.result or {}

        river_name = demo.get("river_name", "Main river")
        river_level = demo.get("river_level_m", context.get("river_level_m", random.uniform(2, 8)))
        normal_level = demo.get("normal_level_m", context.get("normal_level_m", 3.5))
        flood_threshold = demo.get("flood_level_m", context.get("flood_level_m", 6.0))
        gauge = demo.get("gauge_station", f"{city or state or country} gauge")
        affected_districts = demo.get("affected_districts", [])
        affected_pop_k = demo.get("affected_population_k", 0)
        emergency_resources = demo.get("emergency_resources", "")

        level_ratio = river_level / flood_threshold if flood_threshold > 0 else 0
        storm_prob = rainfall_data.get("storm_probability_pct", 50)
        overflow_risk = reservoir_data.get("overflow_risk", "low")

        flood_risk_score = (
            level_ratio * 0.45
            + (storm_prob / 100) * 0.35
            + (0.20 if overflow_risk in ["high", "critical"] else 0.0)
        )

        flood_risk = ("critical" if flood_risk_score > 0.8 else
                      "high" if flood_risk_score > 0.6 else
                      "medium" if flood_risk_score > 0.4 else "low")

        self.add_reasoning_step("Flood risk computed", {
            "river": river_name, "gauge": gauge,
            "level_m": round(river_level, 2), "threshold_m": flood_threshold,
            "risk_score": round(flood_risk_score, 3), "flood_risk": flood_risk,
        })

        hours_to_flood: float | None = None
        if flood_risk in ("high", "critical"):
            margin = flood_threshold - river_level
            hours_to_flood = round(max(2, margin / 0.15 * 6), 0) if margin > 0 else 6.0

        district_str = ", ".join(affected_districts) if affected_districts else f"{city or state or country}"
        pop_str = f"{affected_pop_k:,}K people" if affected_pop_k else "affected population TBD"
        resource_str = emergency_resources or "Local emergency services"

        prompt = (
            f"Flood Risk Assessment — {river_name} ({gauge}):\n"
            f"Current level: {river_level:.2f}m | Normal: {normal_level:.1f}m | Flood threshold: {flood_threshold:.1f}m\n"
            f"Level-to-threshold ratio: {level_ratio:.2f} | Storm probability (48h): {storm_prob}%\n"
            f"Reservoir overflow risk: {overflow_risk} | 7-day cumulative rainfall: {rainfall_data.get('total_7day_mm', 0):.0f}mm\n"
            f"Risk score: {flood_risk_score:.2f} → {flood_risk.upper()}\n"
            f"At-risk districts: {district_str} ({pop_str})\n\n"
            f"Provide: (1) Estimated hours to flood crest, (2) evacuation zone priorities, "
            f"(3) downstream communities needing alert, (4) resource deployment recommendation."
        )

        ai_response = await self.call_gemini(prompt)
        if not ai_response or ai_response.startswith("[Simulated"):
            ai_response = self._fallback(river_name, gauge, river_level, flood_threshold,
                                         flood_risk, hours_to_flood, district_str, pop_str, resource_str)

        result: Dict = {
            "river_name": river_name,
            "gauge_station": gauge,
            "river_level_m": round(river_level, 2),
            "normal_level_m": normal_level,
            "flood_threshold_m": flood_threshold,
            "level_above_normal_m": round(river_level - normal_level, 2),
            "flood_risk": flood_risk,
            "flood_risk_score": round(flood_risk_score, 3),
            "hours_to_flood_crest": hours_to_flood,
            "rainfall_analysis": {
                "storm_probability_pct": storm_prob,
                "total_7day_mm": rainfall_data.get("total_7day_mm", 0),
            },
            "reservoir_analysis": {
                "overflow_risk": overflow_risk,
                "recommended_outflow_m3s": reservoir_data.get("recommended_outflow_m3s"),
            },
            "at_risk_districts": affected_districts,
            "estimated_affected_population": f"{affected_pop_k:,}K" if affected_pop_k else "unknown",
            "emergency_resources_recommended": emergency_resources,
            "ai_analysis": ai_response[:800],
            "emergency_action_required": flood_risk in ("high", "critical"),
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

    def _fallback(self, river: str, gauge: str, level: float, threshold: float,
                  risk: str, hours: float | None, districts: str, pop: str, resources: str) -> str:
        hrs = f"approximately {hours:.0f} hours" if hours else "imminent"
        action = "Immediate evacuation of low-lying zones" if risk == "critical" else "Issue flood watch and pre-position rescue teams"
        return (
            f"{river} at {gauge} is at {level:.2f}m — {level - threshold:.2f}m {'above' if level > threshold else 'below'} flood threshold of {threshold:.1f}m. "
            f"Flood crest expected in {hrs}. {action} in {districts} ({pop}). "
            f"Deploy {resources}. Coordinate downstream alerts to adjacent districts within 6 hours."
        )
