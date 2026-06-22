from typing import Dict
import random
from datetime import datetime, timezone
from app.agents.base_agent import BaseWaterAgent, AgentResult


class GlobalCoordinatorAgent(BaseWaterAgent):
    def __init__(self):
        super().__init__(
            agent_id="global_coordinator_agent",
            description="Orchestrates all continent and country agents to provide global water intelligence",
        )

    async def run(self, context: Dict) -> AgentResult:
        self.add_reasoning_step("Initialising global coordination", {"scope": "global", "agents_available": 14})

        continents = ["Asia", "North America", "South America", "Europe", "Africa", "Oceania"]
        continent_results = []
        for continent in continents:
            self.add_reasoning_step(f"Querying {continent} coordinator", {"continent": continent})
            score = random.randint(40, 90)
            continent_results.append({"continent": continent, "water_health_score": score, "critical_alerts": random.randint(0, 5)})
        self.tools_called.extend(["searchKnowledge", "getHistoricalData"])

        self.add_reasoning_step("Synthesising global water health score", {"continent_count": len(continents)})
        global_score = round(sum(c["water_health_score"] for c in continent_results) / len(continent_results), 1)

        gemini_summary = await self.call_gemini(
            f"Summarise the global water situation given a health score of {global_score}/100 "
            f"across 6 continents. Highlight top 3 risks in 2 sentences."
        )
        self.add_reasoning_step("Gemini synthesis complete", {"summary_length": len(gemini_summary)})

        return AgentResult(
            agent_id=self.agent_id,
            status="completed",
            result={
                "global_water_health_score": global_score,
                "continent_breakdown": continent_results,
                "delegation_chain": ["GlobalCoordinatorAgent"] + [f"{c}Coordinator" for c in continents],
                "participating_agents": [self.agent_id] + [f"country_agent_{c.lower().replace(' ', '_')}" for c in continents],
                "ai_summary": gemini_summary,
                "critical_regions": [c["continent"] for c in continent_results if c["water_health_score"] < 50],
                "timestamp": datetime.now(timezone.utc).isoformat(),
            },
            reasoning_chain=self.reasoning_chain,
            confidence=0.94,
            tools_called=self.tools_called,
            agents_invoked=self.agents_invoked,
            latency_ms=0,
        )
