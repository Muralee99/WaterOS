"""
WaterOS MCP (Model Context Protocol) Server
Exposes water intelligence tools that agents can invoke.
"""
from typing import Any, Dict, Optional
import asyncio
import random
from datetime import datetime, timezone


class WaterOSMCPServer:
    """MCP-compliant tool server for water management operations."""

    def __init__(self):
        self.tools = {
            "getReservoirStatus": self.get_reservoir_status,
            "predictFlood": self.predict_flood,
            "detectLeak": self.detect_leak,
            "getWaterQuality": self.get_water_quality,
            "forecastRain": self.forecast_rain,
            "getGroundWater": self.get_ground_water,
            "optimizeReservoir": self.optimize_reservoir,
            "generateEmergencyPlan": self.generate_emergency_plan,
        }

    async def call_tool(self, tool_name: str, params: Dict) -> Dict:
        if tool_name not in self.tools:
            return {"error": f"Unknown tool: {tool_name}", "available_tools": list(self.tools.keys())}
        return await self.tools[tool_name](params)

    def get_tool_schemas(self) -> list:
        return [
            {
                "name": "getReservoirStatus",
                "description": "Get current status of a reservoir including level, inflow, outflow",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "reservoir_id": {"type": "string", "description": "Reservoir identifier"},
                        "include_forecast": {"type": "boolean", "default": False},
                    },
                    "required": ["reservoir_id"],
                },
            },
            {
                "name": "predictFlood",
                "description": "Predict flood probability and timing for a location",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "location": {"type": "string"},
                        "hours_ahead": {"type": "integer", "default": 24},
                        "include_upstream": {"type": "boolean", "default": True},
                    },
                    "required": ["location"],
                },
            },
            {
                "name": "detectLeak",
                "description": "Analyze pipeline data to detect leaks",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "pipeline_id": {"type": "string"},
                        "pressure_readings": {"type": "array", "items": {"type": "number"}},
                        "flow_readings": {"type": "array", "items": {"type": "number"}},
                    },
                    "required": ["pipeline_id"],
                },
            },
            {
                "name": "getWaterQuality",
                "description": "Get water quality measurements and safety score",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "location_id": {"type": "string"},
                        "parameters": {"type": "array", "items": {"type": "string"}},
                    },
                    "required": ["location_id"],
                },
            },
            {
                "name": "forecastRain",
                "description": "Get rainfall forecast for a location",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "location": {"type": "string"},
                        "days": {"type": "integer", "default": 7},
                    },
                    "required": ["location"],
                },
            },
            {
                "name": "getGroundWater",
                "description": "Get groundwater levels and depletion risk",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "region": {"type": "string"},
                        "depth_m": {"type": "number"},
                    },
                    "required": ["region"],
                },
            },
            {
                "name": "optimizeReservoir",
                "description": "Generate optimal reservoir release schedule",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "reservoir_id": {"type": "string"},
                        "target_level_pct": {"type": "number"},
                        "forecast_days": {"type": "integer", "default": 7},
                    },
                    "required": ["reservoir_id"],
                },
            },
            {
                "name": "generateEmergencyPlan",
                "description": "Generate emergency response plan for water incidents",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "incident_type": {"type": "string", "enum": ["flood", "drought", "contamination", "leak"]},
                        "severity": {"type": "string", "enum": ["low", "medium", "high", "critical"]},
                        "location": {"type": "string"},
                        "affected_population": {"type": "integer"},
                    },
                    "required": ["incident_type", "severity", "location"],
                },
            },
        ]

    async def get_reservoir_status(self, params: Dict) -> Dict:
        await asyncio.sleep(0.05)
        reservoir_id = params.get("reservoir_id", "RES001")
        return {
            "tool": "getReservoirStatus",
            "reservoir_id": reservoir_id,
            "current_level_pct": round(random.uniform(40, 95), 2),
            "capacity_mcm": 500.0,
            "current_volume_mcm": round(random.uniform(200, 475), 1),
            "inflow_rate_m3s": round(random.uniform(50, 500), 1),
            "outflow_rate_m3s": round(random.uniform(40, 450), 1),
            "spillway_status": "closed",
            "last_updated": datetime.now(timezone.utc).isoformat(),
        }

    async def predict_flood(self, params: Dict) -> Dict:
        await asyncio.sleep(0.05)
        probability = round(random.uniform(0.1, 0.9), 3)
        return {
            "tool": "predictFlood",
            "location": params.get("location"),
            "flood_probability": probability,
            "risk_level": "critical" if probability > 0.8 else "high" if probability > 0.6 else "medium",
            "hours_to_flood": round(random.uniform(6, 72), 0) if probability > 0.5 else None,
            "affected_area_km2": round(random.uniform(5, 500), 1),
            "confidence": round(random.uniform(0.75, 0.95), 2),
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

    async def detect_leak(self, params: Dict) -> Dict:
        await asyncio.sleep(0.05)
        leak_prob = round(random.uniform(0, 1), 3)
        return {
            "tool": "detectLeak",
            "pipeline_id": params.get("pipeline_id"),
            "leak_detected": leak_prob > 0.5,
            "leak_probability": leak_prob,
            "estimated_loss_l_s": round(random.uniform(0, 20), 2) if leak_prob > 0.5 else 0,
            "probable_segment": f"Segment-{random.randint(1, 20)}" if leak_prob > 0.5 else None,
            "confidence": round(random.uniform(0.80, 0.95), 2),
        }

    async def get_water_quality(self, params: Dict) -> Dict:
        await asyncio.sleep(0.05)
        return {
            "tool": "getWaterQuality",
            "location_id": params.get("location_id"),
            "ph": round(random.uniform(6.5, 8.5), 2),
            "turbidity_ntu": round(random.uniform(0.5, 10), 2),
            "chlorine_mg_l": round(random.uniform(0.2, 2.0), 2),
            "dissolved_oxygen_mg_l": round(random.uniform(6, 12), 2),
            "safety_score": round(random.uniform(70, 100), 1),
            "status": random.choice(["safe", "safe", "safe", "warning"]),
            "measured_at": datetime.now(timezone.utc).isoformat(),
        }

    async def forecast_rain(self, params: Dict) -> Dict:
        await asyncio.sleep(0.05)
        days = params.get("days", 7)
        return {
            "tool": "forecastRain",
            "location": params.get("location"),
            "forecast": [{"day": i + 1, "rainfall_mm": round(random.uniform(0, 80), 1)} for i in range(days)],
            "total_mm": round(random.uniform(50, 400), 1),
            "storm_probability": round(random.uniform(10, 80), 1),
            "confidence": round(random.uniform(0.70, 0.92), 2),
        }

    async def get_ground_water(self, params: Dict) -> Dict:
        await asyncio.sleep(0.05)
        return {
            "tool": "getGroundWater",
            "region": params.get("region"),
            "depth_m": round(random.uniform(10, 100), 1),
            "level_m": round(random.uniform(5, 80), 1),
            "recharge_rate_mm_yr": round(random.uniform(50, 500), 1),
            "extraction_rate_mm_yr": round(random.uniform(100, 600), 1),
            "depletion_risk": random.choice(["low", "medium", "high"]),
            "quality_score": round(random.uniform(60, 100), 1),
        }

    async def optimize_reservoir(self, params: Dict) -> Dict:
        await asyncio.sleep(0.05)
        return {
            "tool": "optimizeReservoir",
            "reservoir_id": params.get("reservoir_id"),
            "current_level_pct": round(random.uniform(40, 95), 1),
            "recommended_outflow_m3s": round(random.uniform(50, 300), 1),
            "schedule": [
                {"day": i + 1, "outflow_m3s": round(random.uniform(50, 250), 1)} for i in range(7)
            ],
            "target_level_pct": params.get("target_level_pct", 75),
            "optimization_objective": "balanced",
        }

    async def generate_emergency_plan(self, params: Dict) -> Dict:
        await asyncio.sleep(0.05)
        incident_type = params.get("incident_type", "flood")
        severity = params.get("severity", "medium")
        return {
            "tool": "generateEmergencyPlan",
            "incident_type": incident_type,
            "severity": severity,
            "location": params.get("location"),
            "plan_id": f"EP-{datetime.now().strftime('%Y%m%d%H%M%S')}",
            "immediate_actions": [
                "Activate Emergency Operations Center",
                "Deploy rapid response teams",
                f"Issue {severity.upper()} alert for {incident_type}",
            ],
            "resources_required": {
                "personnel": random.randint(10, 500),
                "vehicles": random.randint(2, 50),
                "equipment_units": random.randint(5, 100),
            },
            "evacuation_zones": [f"Zone-{chr(65 + i)}" for i in range(random.randint(1, 5))],
            "estimated_duration_hours": random.randint(6, 72),
        }


mcp_server = WaterOSMCPServer()
