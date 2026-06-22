import random
from datetime import datetime, timezone
from typing import Dict, Any


async def get_digital_twin() -> Dict:
    return {
        "twin_id": "WATEROS-TWIN-001",
        "status": "active",
        "last_sync": datetime.now(timezone.utc).isoformat(),
        "components": {
            "reservoirs": 5,
            "rivers": 8,
            "pipelines": 24,
            "treatment_plants": 3,
            "sensors": 142,
        },
        "system_state": {
            "water_health_score": round(random.uniform(75, 95), 1),
            "network_pressure_bar": round(random.uniform(3.5, 6.5), 2),
            "total_flow_m3s": round(random.uniform(500, 2000), 1),
            "active_anomalies": random.randint(0, 5),
        },
        "sensors": _generate_sensor_grid(),
    }


async def run_simulation(scenario_type: str, parameters: Dict[str, Any]) -> Dict:
    scenarios = {
        "heavy_rain": _simulate_heavy_rain,
        "dam_failure": _simulate_dam_failure,
        "drought": _simulate_drought,
        "contamination": _simulate_contamination,
    }

    handler = scenarios.get(scenario_type, _simulate_heavy_rain)
    return await handler(parameters)


def _generate_sensor_grid() -> list:
    sensors = []
    for i in range(20):
        sensors.append({
            "id": f"S{str(i+1).zfill(3)}",
            "type": random.choice(["flow", "pressure", "quality", "level"]),
            "value": round(random.uniform(0, 100), 2),
            "status": random.choice(["normal", "normal", "normal", "warning", "alert"]),
            "lat": round(12.5 + random.uniform(-2, 2), 4),
            "lng": round(77.5 + random.uniform(-2, 2), 4),
        })
    return sensors


async def _simulate_heavy_rain(params: Dict) -> Dict:
    rainfall_intensity = params.get("rainfall_mm_hr", 80)
    duration_hours = params.get("duration_hours", 12)

    total_rainfall = rainfall_intensity * duration_hours
    runoff_coefficient = 0.7
    runoff_volume = total_rainfall * runoff_coefficient

    return {
        "scenario": "heavy_rain",
        "parameters": params,
        "timeline_hours": list(range(0, duration_hours + 1)),
        "river_level_m": [round(2.0 + (i / duration_hours) * (runoff_volume / 500), 2) for i in range(duration_hours + 1)],
        "reservoir_level_pct": [round(min(100, 60 + (i / duration_hours) * 30), 1) for i in range(duration_hours + 1)],
        "flood_probability": [round(min(1, 0.1 + i * 0.06), 3) for i in range(duration_hours + 1)],
        "impact": {
            "flood_risk": "high" if runoff_volume > 800 else "medium",
            "areas_affected": random.randint(3, 15),
            "population_at_risk": random.randint(5000, 100000),
            "economic_impact_cr": round(random.uniform(10, 500), 1),
        },
        "recommendations": [
            f"Pre-release {round(rainfall_intensity * 0.3, 0)} m³/s from reservoir",
            "Issue flood watch for downstream communities",
            "Deploy pumping stations at low-lying areas",
        ],
    }


async def _simulate_dam_failure(params: Dict) -> Dict:
    reservoir_volume_mcm = params.get("reservoir_volume_mcm", 5000)
    return {
        "scenario": "dam_failure",
        "parameters": params,
        "peak_discharge_m3s": round(reservoir_volume_mcm * 100, 0),
        "inundation_area_km2": round(reservoir_volume_mcm * 0.05, 1),
        "time_to_peak_hours": round(random.uniform(1, 6), 1),
        "population_at_risk": random.randint(50000, 500000),
        "impact": {"severity": "catastrophic", "evacuation_required": True},
        "recommendations": [
            "IMMEDIATE EVACUATION of downstream zones",
            "Activate national disaster response",
            "Emergency dam inspection and repair teams",
        ],
    }


async def _simulate_drought(params: Dict) -> Dict:
    deficit_days = params.get("deficit_days", 60)
    return {
        "scenario": "drought",
        "parameters": params,
        "reservoir_depletion": [round(max(20, 80 - i * 0.5), 1) for i in range(min(deficit_days, 90))],
        "groundwater_decline_m": round(deficit_days * 0.02, 2),
        "crop_water_deficit_pct": round(min(100, deficit_days * 1.2), 1),
        "impact": {
            "severity": "high" if deficit_days > 45 else "medium",
            "agriculture_loss_pct": round(min(80, deficit_days * 0.8), 1),
            "water_shortage_days": max(0, deficit_days - 30),
        },
        "recommendations": [
            "Implement Stage 3 water conservation",
            "Emergency groundwater extraction permits",
            "Cloud seeding operations where feasible",
        ],
    }


async def _simulate_contamination(params: Dict) -> Dict:
    contaminant = params.get("contaminant", "industrial_effluent")
    return {
        "scenario": "contamination",
        "parameters": params,
        "affected_area_km2": round(random.uniform(5, 100), 1),
        "contamination_spread_hours": [round(i * 2.5, 1) for i in range(24)],
        "ph_change": [round(7.0 - i * 0.05, 2) for i in range(24)],
        "turbidity_increase": [round(1 + i * 0.8, 1) for i in range(24)],
        "impact": {
            "severity": "critical",
            "population_affected": random.randint(10000, 200000),
            "treatment_plants_impacted": random.randint(1, 3),
        },
        "recommendations": [
            "Immediate shutdown of affected intake points",
            "Deploy emergency water tankers",
            "Activate contamination containment booms",
            "Issue DO NOT DRINK advisory",
        ],
    }
