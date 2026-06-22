from fastapi import APIRouter, HTTPException
import random

router = APIRouter(prefix="/states", tags=["States"])

STATES = [
    {"id": "in-mh", "name": "Maharashtra", "country_id": "in", "water_score": 61, "groundwater_level": 48, "agricultural_water_use": 78, "city_count": 534, "river_flow_status": "normal", "emergency_level": "none"},
    {"id": "in-ka", "name": "Karnataka", "country_id": "in", "water_score": 54, "groundwater_level": 38, "agricultural_water_use": 82, "city_count": 279, "river_flow_status": "warning", "emergency_level": "low"},
    {"id": "in-tn", "name": "Tamil Nadu", "country_id": "in", "water_score": 49, "groundwater_level": 31, "agricultural_water_use": 85, "city_count": 832, "river_flow_status": "drought", "emergency_level": "medium"},
    {"id": "in-rj", "name": "Rajasthan", "country_id": "in", "water_score": 32, "groundwater_level": 18, "agricultural_water_use": 91, "city_count": 296, "river_flow_status": "drought", "emergency_level": "high"},
    {"id": "in-up", "name": "Uttar Pradesh", "country_id": "in", "water_score": 57, "groundwater_level": 55, "agricultural_water_use": 76, "city_count": 901, "river_flow_status": "normal", "emergency_level": "none"},
    {"id": "us-ca", "name": "California", "country_id": "us", "water_score": 58, "groundwater_level": 42, "agricultural_water_use": 80, "city_count": 482, "river_flow_status": "warning", "emergency_level": "low"},
    {"id": "us-tx", "name": "Texas", "country_id": "us", "water_score": 64, "groundwater_level": 57, "agricultural_water_use": 68, "city_count": 1216, "river_flow_status": "normal", "emergency_level": "none"},
    {"id": "us-fl", "name": "Florida", "country_id": "us", "water_score": 72, "groundwater_level": 68, "agricultural_water_use": 55, "city_count": 412, "river_flow_status": "normal", "emergency_level": "none"},
    {"id": "us-az", "name": "Arizona", "country_id": "us", "water_score": 41, "groundwater_level": 29, "agricultural_water_use": 72, "city_count": 91, "river_flow_status": "drought", "emergency_level": "medium"},
    {"id": "br-am", "name": "Amazonas", "country_id": "br", "water_score": 88, "groundwater_level": 92, "agricultural_water_use": 22, "city_count": 62, "river_flow_status": "normal", "emergency_level": "none"},
    {"id": "br-sp", "name": "São Paulo", "country_id": "br", "water_score": 63, "groundwater_level": 51, "agricultural_water_use": 48, "city_count": 645, "river_flow_status": "normal", "emergency_level": "none"},
    {"id": "cn-sc", "name": "Sichuan", "country_id": "cn", "water_score": 71, "groundwater_level": 64, "agricultural_water_use": 62, "city_count": 218, "river_flow_status": "normal", "emergency_level": "none"},
    {"id": "cn-xj", "name": "Xinjiang", "country_id": "cn", "water_score": 28, "groundwater_level": 14, "agricultural_water_use": 94, "city_count": 14, "river_flow_status": "drought", "emergency_level": "high"},
]

STATE_INDEX = {s["id"]: s for s in STATES}


@router.get("")
async def list_states(country_id: str = None):
    data = STATES
    if country_id:
        data = [s for s in STATES if s["country_id"] == country_id]
    return {"states": data, "total": len(data)}


@router.get("/{state_id}")
async def get_state(state_id: str):
    s = STATE_INDEX.get(state_id)
    if not s:
        raise HTTPException(status_code=404, detail="State not found")
    r = random.Random(state_id)
    return {
        **s,
        "reservoir_map": [
            {"id": f"{state_id}-res-{i}", "name": f"Reservoir {i+1}", "capacity_pct": r.randint(30, 95), "status": r.choice(["normal", "warning", "full"])}
            for i in range(r.randint(2, 5))
        ],
        "groundwater": {
            "current_m": round(r.uniform(5, 30), 1),
            "safe_yield_m3_day": r.randint(50000, 500000),
            "depletion_rate_pct_yr": round(r.uniform(0.5, 4.2), 2),
            "recharge_rate_pct_yr": round(r.uniform(0.3, 2.8), 2),
        },
        "agriculture": {
            "irrigated_area_ha": r.randint(200000, 5000000),
            "water_use_mcm_yr": r.randint(5000, 80000),
            "irrigation_efficiency_pct": r.randint(55, 82),
            "crop_water_stress_index": round(r.uniform(0.1, 0.7), 2),
        },
        "cities_list": [
            {"name": f"City {i+1}", "population": r.randint(50000, 2000000), "water_score": r.randint(40, 90)}
            for i in range(min(5, s["city_count"]))
        ],
        "emergency_response": {
            "teams_deployed": r.randint(0, 8),
            "evacuation_orders": r.randint(0, 3),
            "relief_camps": r.randint(0, 5),
        },
        "ai_insights": {
            "confidence_score": round(r.uniform(0.80, 0.95), 2),
            "reasoning_summary": f"{s['name']} state analysis complete with groundwater and agriculture cross-referencing.",
            "participating_agents": ["CountryAgent", "GroundwaterAgent", "ReservoirAgent"],
            "tools_used": ["getHistoricalData", "optimizeReservoir"],
        },
    }
