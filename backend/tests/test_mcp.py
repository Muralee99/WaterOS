import pytest
from app.mcp.server import WaterOSMCPServer


@pytest.mark.asyncio
async def test_mcp_get_reservoir_status():
    server = WaterOSMCPServer()
    result = await server.call_tool("getReservoirStatus", {"reservoir_id": "RES001"})
    assert "current_level_pct" in result
    assert result["tool"] == "getReservoirStatus"


@pytest.mark.asyncio
async def test_mcp_predict_flood():
    server = WaterOSMCPServer()
    result = await server.call_tool("predictFlood", {"location": "Test River"})
    assert "flood_probability" in result
    assert 0 <= result["flood_probability"] <= 1


@pytest.mark.asyncio
async def test_mcp_detect_leak():
    server = WaterOSMCPServer()
    result = await server.call_tool("detectLeak", {"pipeline_id": "PIPE001"})
    assert "leak_detected" in result
    assert isinstance(result["leak_detected"], bool)


@pytest.mark.asyncio
async def test_mcp_water_quality():
    server = WaterOSMCPServer()
    result = await server.call_tool("getWaterQuality", {"location_id": "WQ001"})
    assert "ph" in result
    assert "safety_score" in result


@pytest.mark.asyncio
async def test_mcp_unknown_tool():
    server = WaterOSMCPServer()
    result = await server.call_tool("nonExistentTool", {})
    assert "error" in result
    assert "available_tools" in result


def test_mcp_tool_schemas():
    server = WaterOSMCPServer()
    schemas = server.get_tool_schemas()
    assert len(schemas) == 8
    tool_names = [s["name"] for s in schemas]
    assert "getReservoirStatus" in tool_names
    assert "predictFlood" in tool_names
    assert "generateEmergencyPlan" in tool_names
