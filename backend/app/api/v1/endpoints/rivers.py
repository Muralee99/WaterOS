from fastapi import APIRouter, HTTPException
from datetime import datetime, timezone, timedelta
import random

router = APIRouter(prefix="/rivers", tags=["Rivers"])

RIVERS = [
    {"id": "amazon", "name": "Amazon", "country_id": "br", "current_level_m": 12.4, "normal_level_m": 11.0, "speed_mps": 1.8, "flood_threshold_m": 15.0, "flood_probability_pct": 18, "length_km": 6992, "basin_area_km2": 7050000, "status": "normal"},
    {"id": "nile", "name": "Nile", "country_id": "eg", "current_level_m": 4.2, "normal_level_m": 5.5, "speed_mps": 0.6, "flood_threshold_m": 8.0, "flood_probability_pct": 6, "length_km": 6650, "basin_area_km2": 3400000, "status": "warning"},
    {"id": "ganges", "name": "Ganges", "country_id": "in", "current_level_m": 8.7, "normal_level_m": 7.2, "speed_mps": 2.1, "flood_threshold_m": 12.0, "flood_probability_pct": 42, "length_km": 2525, "basin_area_km2": 1060000, "status": "warning"},
    {"id": "mississippi", "name": "Mississippi", "country_id": "us", "current_level_m": 6.2, "normal_level_m": 6.8, "speed_mps": 1.2, "flood_threshold_m": 11.0, "flood_probability_pct": 12, "length_km": 3730, "basin_area_km2": 3220000, "status": "normal"},
    {"id": "yangtze", "name": "Yangtze", "country_id": "cn", "current_level_m": 14.8, "normal_level_m": 13.0, "speed_mps": 2.4, "flood_threshold_m": 18.0, "flood_probability_pct": 34, "length_km": 6300, "basin_area_km2": 1808500, "status": "warning"},
    {"id": "brahmaputra", "name": "Brahmaputra", "country_id": "in", "current_level_m": 11.2, "normal_level_m": 8.5, "speed_mps": 3.1, "flood_threshold_m": 13.0, "flood_probability_pct": 71, "length_km": 2900, "basin_area_km2": 712000, "status": "flood"},
    {"id": "colorado", "name": "Colorado", "country_id": "us", "current_level_m": 2.1, "normal_level_m": 4.8, "speed_mps": 0.4, "flood_threshold_m": 9.0, "flood_probability_pct": 3, "length_km": 2330, "basin_area_km2": 629000, "status": "drought"},
    {"id": "indus", "name": "Indus", "country_id": "pk", "current_level_m": 6.8, "normal_level_m": 7.1, "speed_mps": 1.6, "flood_threshold_m": 12.0, "flood_probability_pct": 28, "length_km": 3180, "basin_area_km2": 1165000, "status": "normal"},
    {"id": "niger", "name": "Niger", "country_id": "ng", "current_level_m": 5.4, "normal_level_m": 5.8, "speed_mps": 0.9, "flood_threshold_m": 9.5, "flood_probability_pct": 22, "length_km": 4200, "basin_area_km2": 2090000, "status": "normal"},
    {"id": "murray", "name": "Murray-Darling", "country_id": "au", "current_level_m": 1.8, "normal_level_m": 3.2, "speed_mps": 0.3, "flood_threshold_m": 7.0, "flood_probability_pct": 5, "length_km": 3750, "basin_area_km2": 1060000, "status": "drought"},
]

RIVER_INDEX = {r["id"]: r for r in RIVERS}


@router.get("")
async def list_rivers(country_id: str = None):
    data = RIVERS
    if country_id:
        data = [r for r in RIVERS if r["country_id"] == country_id]
    return {"rivers": data, "total": len(data)}


@router.get("/{river_id}")
async def get_river(river_id: str):
    rv = RIVER_INDEX.get(river_id)
    if not rv:
        raise HTTPException(status_code=404, detail="River not found")
    r = random.Random(river_id)
    now = datetime.now(timezone.utc)
    historical = [
        {"date": (now - timedelta(days=29 - i)).strftime("%Y-%m-%d"), "level_m": round(rv["current_level_m"] + r.uniform(-2.5, 2.5), 2), "flow_cumecs": r.randint(5000, 80000)}
        for i in range(30)
    ]
    prediction = [
        {"date": (now + timedelta(days=i + 1)).strftime("%Y-%m-%d"), "predicted_level_m": round(rv["current_level_m"] + r.uniform(-1.5, 3.0), 2), "flood_probability": round(rv["flood_probability_pct"] / 100 + r.uniform(-0.1, 0.15), 2)}
        for i in range(7)
    ]
    return {
        **rv,
        "historical_data": historical,
        "flood_prediction": prediction,
        "tributaries": [{"name": f"Tributary {i+1}", "length_km": r.randint(100, 800)} for i in range(r.randint(2, 4))],
        "ai_explanation": f"The {rv['name']} river is currently at {rv['current_level_m']}m. "
                          f"{'Flood risk is elevated due to upstream rainfall and reservoir releases.' if rv['status'] in ['flood', 'warning'] else 'Levels are within safe operational range.'} "
                          f"AI confidence in current assessment: {round(r.uniform(0.82, 0.97), 2)}.",
        "satellite_images": [
            {"url": f"https://storage.googleapis.com/wateros-mock/satellite/{river_id}_{i}.jpg", "date": (now - timedelta(days=i * 7)).strftime("%Y-%m-%d"), "cloud_cover_pct": r.randint(0, 40)}
            for i in range(4)
        ],
        "ai_insights": {
            "confidence_score": round(r.uniform(0.84, 0.96), 2),
            "reasoning_summary": f"{rv['name']} river analysis: status={rv['status']}, flood_probability={rv['flood_probability_pct']}%.",
            "participating_agents": ["FloodAgent", "RainfallAgent", "DecisionAgent"],
            "tools_used": ["predictFlood", "forecastRain", "getHistoricalData"],
        },
    }
