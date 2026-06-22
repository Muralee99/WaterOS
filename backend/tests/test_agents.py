import pytest
import asyncio
from app.agents.rainfall_agent import RainfallAgent
from app.agents.reservoir_agent import ReservoirAgent
from app.agents.flood_agent import FloodAgent
from app.agents.water_quality_agent import WaterQualityAgent
from app.agents.leak_detection_agent import LeakDetectionAgent
from app.agents.decision_agent import DecisionAgent


@pytest.mark.asyncio
async def test_rainfall_agent():
    agent = RainfallAgent()
    result = await agent.execute({"location": "Mumbai", "season": "monsoon"})
    assert result.status == "completed"
    assert result.confidence > 0
    assert "forecast_7day_mm" in result.result
    assert len(result.result["forecast_7day_mm"]) == 7
    assert len(result.reasoning_chain) > 0


@pytest.mark.asyncio
async def test_reservoir_agent():
    agent = ReservoirAgent()
    result = await agent.execute({"current_level_pct": 75, "inflow_rate": 200})
    assert result.status == "completed"
    assert "current_level_pct" in result.result
    assert "overflow_risk" in result.result


@pytest.mark.asyncio
async def test_flood_agent_agent_to_agent():
    """Flood agent invokes Rainfall and Reservoir agents (A2A communication)."""
    agent = FloodAgent()
    result = await agent.execute({"river_level_m": 5.0, "flood_level_m": 6.0})
    assert result.status == "completed"
    assert len(result.agents_invoked) >= 2
    assert "rainfall_agent" in result.agents_invoked
    assert "reservoir_agent" in result.agents_invoked


@pytest.mark.asyncio
async def test_water_quality_agent():
    agent = WaterQualityAgent()
    result = await agent.execute({"ph": 7.2, "turbidity_ntu": 2.5, "chlorine_mg_l": 0.8})
    assert result.status == "completed"
    assert "safety_score" in result.result
    assert 0 <= result.result["safety_score"] <= 100


@pytest.mark.asyncio
async def test_leak_detection_agent():
    agent = LeakDetectionAgent()
    result = await agent.execute({"inlet_pressure_bar": 5.0, "outlet_pressure_bar": 2.5})
    assert result.status == "completed"
    assert "leak_probability" in result.result


@pytest.mark.asyncio
async def test_decision_agent_orchestration():
    """Decision agent orchestrates the full agent chain."""
    agent = DecisionAgent()
    result = await agent.execute({})
    assert result.status == "completed"
    assert len(result.agents_invoked) >= 3
    assert "decision_agent" == result.agent_id
    assert result.confidence > 0
    assert "immediate_actions" in result.result
