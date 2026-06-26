"""
WaterOS MCP (Model Context Protocol) Server
Exposes water intelligence tools backed by PostgreSQL.
Each tool first queries the database; if the query fails or returns nothing
it falls back to realistic defaults so the demo always works.
"""
from typing import Any, Dict, Optional
import asyncio
import random
import logging
from datetime import datetime, timezone

logger = logging.getLogger(__name__)


class WaterOSMCPServer:
    """MCP-compliant tool server for water management operations."""

    def __init__(self):
        self.tools = {
            "getReservoirStatus":    self.get_reservoir_status,
            "predictFlood":          self.predict_flood,
            "detectLeak":            self.detect_leak,
            "getWaterQuality":       self.get_water_quality,
            "forecastRain":          self.forecast_rain,
            "getGroundWater":        self.get_ground_water,
            "optimizeReservoir":     self.optimize_reservoir,
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
                "description": "Get current reservoir status from the database (level, inflow, outflow, overflow/shortage risk)",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "reservoir_id": {"type": "string", "description": "Reservoir name or UUID (e.g. 'Hirakud', 'Shasta Lake')"},
                        "include_forecast": {"type": "boolean", "default": False},
                    },
                    "required": ["reservoir_id"],
                },
            },
            {
                "name": "predictFlood",
                "description": "Predict flood probability for a river/location based on live DB data",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "location": {"type": "string", "description": "River name, city, state, or country"},
                        "hours_ahead": {"type": "integer", "default": 24},
                        "include_upstream": {"type": "boolean", "default": True},
                    },
                    "required": ["location"],
                },
            },
            {
                "name": "detectLeak",
                "description": "Detect pipeline leaks from pressure sensor data in the database",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "pipeline_id": {"type": "string", "description": "Pipeline ID (e.g. 'MUM-ZONE7-DN600', 'DEL-ZONE3-DN450')"},
                        "pressure_readings": {"type": "array", "items": {"type": "number"}},
                        "flow_readings": {"type": "array", "items": {"type": "number"}},
                    },
                    "required": ["pipeline_id"],
                },
            },
            {
                "name": "getWaterQuality",
                "description": "Get water quality measurements and WHO compliance status from the database",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "location_id": {"type": "string", "description": "City, location name, or UUID (e.g. 'Mumbai', 'Dhaka', 'Delhi')"},
                        "parameters": {"type": "array", "items": {"type": "string"}},
                    },
                    "required": ["location_id"],
                },
            },
            {
                "name": "forecastRain",
                "description": "Get 7-day rainfall forecast from the database (populated from Open-Meteo API)",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "location": {"type": "string", "description": "City, country, or region"},
                        "days": {"type": "integer", "default": 7},
                    },
                    "required": ["location"],
                },
            },
            {
                "name": "getGroundWater",
                "description": "Get groundwater depth, depletion risk, and recharge/extraction balance from the database",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "region": {"type": "string", "description": "State, country, or aquifer name (e.g. 'Rajasthan', 'California')"},
                        "depth_m": {"type": "number"},
                    },
                    "required": ["region"],
                },
            },
            {
                "name": "optimizeReservoir",
                "description": "Generate optimal 7-day release schedule for a reservoir using DB data",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "reservoir_id": {"type": "string"},
                        "target_level_pct": {"type": "number", "default": 75},
                        "forecast_days": {"type": "integer", "default": 7},
                    },
                    "required": ["reservoir_id"],
                },
            },
            {
                "name": "generateEmergencyPlan",
                "description": "Generate emergency response plan using active DB alerts and agent memory",
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

    # ── Tool implementations ───────────────────────────────────────────────

    async def get_reservoir_status(self, params: Dict) -> Dict:
        reservoir_id = params.get("reservoir_id", "")
        source = "database"
        try:
            from app.db.queries import query_reservoir
            data = await query_reservoir(reservoir_id)
            if data:
                return {
                    "tool": "getReservoirStatus",
                    "source": source,
                    **data,
                    "last_updated": data.get("last_updated") or datetime.now(timezone.utc).isoformat(),
                }
        except Exception as e:
            logger.warning("DB query failed for getReservoirStatus: %s", e)

        # Fallback with plausible defaults
        level = round(random.uniform(40, 95), 2)
        capacity = 1000.0
        return {
            "tool": "getReservoirStatus",
            "source": "fallback",
            "reservoir_id": reservoir_id,
            "name": reservoir_id,
            "capacity_mcm": capacity,
            "current_level_mcm": round(capacity * level / 100, 1),
            "current_level_pct": level,
            "inflow_rate_m3s": round(random.uniform(50, 500), 1),
            "outflow_rate_m3s": round(random.uniform(40, 450), 1),
            "overflow_risk": "high" if level > 85 else "medium" if level > 70 else "low",
            "shortage_risk": "high" if level < 35 else "medium" if level < 50 else "low",
            "spillway_status": "open" if level > 88 else "closed",
            "last_updated": datetime.now(timezone.utc).isoformat(),
        }

    async def predict_flood(self, params: Dict) -> Dict:
        location = params.get("location", "")
        source = "database"
        try:
            from app.db.queries import query_river_flood
            data = await query_river_flood(location)
            if data:
                return {"tool": "predictFlood", "source": source, **data}
        except Exception as e:
            logger.warning("DB query failed for predictFlood: %s", e)

        probability = round(random.uniform(0.1, 0.9), 3)
        return {
            "tool": "predictFlood",
            "source": "fallback",
            "location": location,
            "flood_probability": probability,
            "risk_level": "critical" if probability > 0.8 else "high" if probability > 0.6 else "medium" if probability > 0.4 else "low",
            "hours_to_flood": round(random.uniform(6, 72), 0) if probability > 0.5 else None,
            "affected_area_km2": round(random.uniform(5, 500), 1),
            "confidence": round(random.uniform(0.75, 0.95), 2),
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

    async def detect_leak(self, params: Dict) -> Dict:
        pipeline_id = params.get("pipeline_id", "")
        source = "database"
        try:
            from app.db.queries import query_pipeline_sensors
            data = await query_pipeline_sensors(pipeline_id)
            if data:
                return {"tool": "detectLeak", "source": source, **data}
        except Exception as e:
            logger.warning("DB query failed for detectLeak: %s", e)

        # Use caller-supplied readings if provided
        pressure_readings = params.get("pressure_readings", [])
        if len(pressure_readings) >= 2:
            drop = pressure_readings[0] - pressure_readings[-1]
            leak_prob = round(min(0.99, max(0, drop / pressure_readings[0])), 3)
        else:
            leak_prob = round(random.uniform(0, 1), 3)

        return {
            "tool": "detectLeak",
            "source": "fallback",
            "pipeline_id": pipeline_id,
            "leak_detected": leak_prob > 0.50,
            "leak_probability": leak_prob,
            "estimated_loss_l_s": round(random.uniform(0, 20), 2) if leak_prob > 0.50 else 0,
            "probable_segment": f"Segment-{random.randint(1, 20)}" if leak_prob > 0.50 else None,
            "confidence": round(random.uniform(0.80, 0.95), 2),
        }

    async def get_water_quality(self, params: Dict) -> Dict:
        location_id = params.get("location_id", "")
        source = "database"
        try:
            from app.db.queries import query_water_quality
            data = await query_water_quality(location_id)
            if data:
                return {"tool": "getWaterQuality", "source": source, **data}
        except Exception as e:
            logger.warning("DB query failed for getWaterQuality: %s", e)

        return {
            "tool": "getWaterQuality",
            "source": "fallback",
            "location_id": location_id,
            "ph": round(random.uniform(6.5, 8.5), 2),
            "turbidity_ntu": round(random.uniform(0.5, 10), 2),
            "chlorine_mg_l": round(random.uniform(0.2, 2.0), 2),
            "dissolved_oxygen_mg_l": round(random.uniform(6, 12), 2),
            "safety_score": round(random.uniform(70, 100), 1),
            "status": random.choice(["safe", "safe", "warning"]),
            "measured_at": datetime.now(timezone.utc).isoformat(),
        }

    async def forecast_rain(self, params: Dict) -> Dict:
        location = params.get("location", "")
        days = params.get("days", 7)
        source = "database"
        try:
            from app.db.queries import query_weather_forecast
            data = await query_weather_forecast(location)
            if data:
                daily = data["forecast_7day_mm"][:days]
                return {
                    "tool": "forecastRain",
                    "source": source,
                    "location": data["location"],
                    "forecast": [{"day": i + 1, "rainfall_mm": mm} for i, mm in enumerate(daily)],
                    "total_mm": data["total_7day_mm"],
                    "peak_day_mm": data["peak_day_mm"],
                    "storm_probability": data["storm_probability"],
                    "drought_risk": data["drought_risk"],
                    "confidence": data["confidence"],
                    "current_temp_c": data["current_temp_c"],
                    "current_humidity_pct": data["current_humidity_pct"],
                }
        except Exception as e:
            logger.warning("DB query failed for forecastRain: %s", e)

        daily = [round(random.uniform(0, 80), 1) for _ in range(days)]
        return {
            "tool": "forecastRain",
            "source": "fallback",
            "location": location,
            "forecast": [{"day": i + 1, "rainfall_mm": mm} for i, mm in enumerate(daily)],
            "total_mm": round(sum(daily), 1),
            "storm_probability": round(random.uniform(10, 80), 1),
            "confidence": round(random.uniform(0.70, 0.88), 2),
        }

    async def get_ground_water(self, params: Dict) -> Dict:
        region = params.get("region", "")
        source = "database"
        try:
            from app.db.queries import query_groundwater
            data = await query_groundwater(region)
            if data:
                return {"tool": "getGroundWater", "source": source, **data}
        except Exception as e:
            logger.warning("DB query failed for getGroundWater: %s", e)

        return {
            "tool": "getGroundWater",
            "source": "fallback",
            "region": region,
            "depth_m": round(random.uniform(10, 60), 1),
            "level_m": round(random.uniform(5, 50), 1),
            "recharge_rate_mm_yr": round(random.uniform(50, 300), 1),
            "extraction_rate_mm_yr": round(random.uniform(100, 500), 1),
            "depletion_risk": random.choice(["medium", "high", "critical"]),
            "quality_score": round(random.uniform(60, 95), 1),
        }

    async def optimize_reservoir(self, params: Dict) -> Dict:
        reservoir_id = params.get("reservoir_id", "")
        target_pct = params.get("target_level_pct", 75)
        forecast_days = params.get("forecast_days", 7)
        source = "database"

        current_pct = None
        current_outflow = None
        capacity_mcm = None

        try:
            from app.db.queries import query_reservoir
            data = await query_reservoir(reservoir_id)
            if data:
                current_pct = data["current_level_pct"]
                current_outflow = data["outflow_rate_m3s"]
                capacity_mcm = data["capacity_mcm"]
        except Exception as e:
            logger.warning("DB query failed for optimizeReservoir: %s", e)
            source = "fallback"

        if current_pct is None:
            current_pct = round(random.uniform(40, 95), 1)
            current_outflow = round(random.uniform(80, 400), 1)
            capacity_mcm = 1000.0

        delta_pct = current_pct - target_pct
        factor = 1.20 if delta_pct > 15 else 1.10 if delta_pct > 5 else 0.95 if delta_pct < -5 else 1.0
        rec_outflow = round(current_outflow * factor, 1)

        schedule = [
            {
                "day": i + 1,
                "outflow_m3s": round(rec_outflow * (1 - 0.02 * i) if delta_pct > 0 else rec_outflow * (1 + 0.01 * i), 1),
                "target_level_pct": round(current_pct - delta_pct * (i + 1) / forecast_days, 1),
            }
            for i in range(forecast_days)
        ]

        return {
            "tool": "optimizeReservoir",
            "source": source,
            "reservoir_id": reservoir_id,
            "current_level_pct": current_pct,
            "target_level_pct": target_pct,
            "capacity_mcm": capacity_mcm,
            "recommended_outflow_m3s": rec_outflow,
            "schedule": schedule,
            "optimization_objective": "overflow_prevention" if current_pct > 85 else "drought_buffer" if current_pct < 40 else "balanced",
        }

    async def generate_emergency_plan(self, params: Dict) -> Dict:
        incident_type = params.get("incident_type", "flood")
        severity = params.get("severity", "medium")
        location = params.get("location", "")
        affected_pop = params.get("affected_population", 0)
        source = "database"

        # Pull real active alerts for this location/type
        active_alerts = []
        db_actions: list = []
        try:
            from app.db.queries import query_active_alerts
            active_alerts = await query_active_alerts(
                incident_type=incident_type, location=location
            )
            if active_alerts:
                source = "database"
                db_actions = active_alerts[0].get("recommended_actions") or []
        except Exception as e:
            logger.warning("DB query failed for generateEmergencyPlan: %s", e)

        # Default action templates by type
        default_actions: Dict[str, list] = {
            "flood": [
                "Activate Emergency Operations Centre",
                "Deploy rapid response flood teams",
                f"Issue {severity.upper()} flood alert for {location}",
                "Pre-position rescue boats and equipment",
                "Coordinate with meteorological department",
            ],
            "drought": [
                "Activate Stage 3 water conservation protocols",
                "Deploy emergency water tankers to affected areas",
                f"Issue drought declaration for {location}",
                "Restrict non-essential water use",
                "Activate groundwater emergency abstraction licences",
            ],
            "contamination": [
                "Issue mandatory boil-water advisory",
                "Deploy emergency water quality testing teams",
                f"Notify public health authorities for {location}",
                "Activate alternative water supply sources",
                "Increase chlorination at all WTPs",
            ],
            "leak": [
                "Deploy leak detection and repair crew immediately",
                "Isolate affected pipeline segment",
                f"Activate bypass supply for {location}",
                "Notify affected consumers via SMS alert",
                "Assess structural integrity of adjacent mains",
            ],
        }

        actions = db_actions if db_actions else default_actions.get(incident_type, default_actions["flood"])

        personnel_map = {"low": 15, "medium": 80, "high": 250, "critical": 600}
        vehicle_map   = {"low": 3,  "medium": 12, "high": 40,  "critical": 90}

        return {
            "tool": "generateEmergencyPlan",
            "source": source,
            "incident_type": incident_type,
            "severity": severity,
            "location": location,
            "plan_id": f"EP-{datetime.now().strftime('%Y%m%d%H%M%S')}",
            "active_db_alerts": len(active_alerts),
            "immediate_actions": actions[:3],
            "full_action_list": actions,
            "resources_required": {
                "personnel": personnel_map.get(severity, 80),
                "vehicles": vehicle_map.get(severity, 12),
                "equipment_units": vehicle_map.get(severity, 12) * 3,
            },
            "evacuation_zones": [f"Zone-{chr(65 + i)}" for i in range({"low": 1, "medium": 2, "high": 3, "critical": 5}.get(severity, 2))],
            "estimated_duration_hours": {"low": 8, "medium": 24, "high": 48, "critical": 72}.get(severity, 24),
            "affected_population": affected_pop or ({"low": 5000, "medium": 50000, "high": 250000, "critical": 1000000}.get(severity, 50000)),
        }


mcp_server = WaterOSMCPServer()
