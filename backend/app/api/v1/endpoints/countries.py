from fastapi import APIRouter, HTTPException
from datetime import datetime, timezone
import random

router = APIRouter(prefix="/countries", tags=["Countries"])

COUNTRIES = [
    {"id": "in", "name": "India", "code": "IN", "continent": "Asia", "water_score": 62, "reservoir_capacity_pct": 58, "river_count": 400, "drought_risk": "medium", "flood_risk": "high", "population": 1428000000, "lat": 20.59, "lng": 78.96, "status": "monitoring"},
    {"id": "us", "name": "United States", "code": "US", "continent": "North America", "water_score": 78, "reservoir_capacity_pct": 74, "river_count": 250000, "drought_risk": "low", "flood_risk": "medium", "population": 331000000, "lat": 37.09, "lng": -95.71, "status": "healthy"},
    {"id": "br", "name": "Brazil", "code": "BR", "continent": "South America", "water_score": 71, "reservoir_capacity_pct": 66, "river_count": 55000, "drought_risk": "low", "flood_risk": "medium", "population": 215000000, "lat": -14.23, "lng": -51.92, "status": "healthy"},
    {"id": "cn", "name": "China", "code": "CN", "continent": "Asia", "water_score": 55, "reservoir_capacity_pct": 61, "river_count": 50000, "drought_risk": "high", "flood_risk": "high", "population": 1412000000, "lat": 35.86, "lng": 104.19, "status": "warning"},
    {"id": "au", "name": "Australia", "code": "AU", "continent": "Oceania", "water_score": 66, "reservoir_capacity_pct": 62, "river_count": 3000, "drought_risk": "medium", "flood_risk": "low", "population": 26000000, "lat": -25.27, "lng": 133.77, "status": "monitoring"},
    {"id": "ru", "name": "Russia", "code": "RU", "continent": "Europe", "water_score": 81, "reservoir_capacity_pct": 79, "river_count": 100000, "drought_risk": "low", "flood_risk": "low", "population": 144000000, "lat": 61.52, "lng": 105.31, "status": "healthy"},
    {"id": "ca", "name": "Canada", "code": "CA", "continent": "North America", "water_score": 88, "reservoir_capacity_pct": 84, "river_count": 80000, "drought_risk": "low", "flood_risk": "low", "population": 38000000, "lat": 56.13, "lng": -106.34, "status": "healthy"},
    {"id": "de", "name": "Germany", "code": "DE", "continent": "Europe", "water_score": 84, "reservoir_capacity_pct": 81, "river_count": 12000, "drought_risk": "low", "flood_risk": "low", "population": 84000000, "lat": 51.16, "lng": 10.45, "status": "healthy"},
    {"id": "eg", "name": "Egypt", "code": "EG", "continent": "Africa", "water_score": 31, "reservoir_capacity_pct": 28, "river_count": 4, "drought_risk": "critical", "flood_risk": "low", "population": 104000000, "lat": 26.82, "lng": 30.80, "status": "critical"},
    {"id": "ng", "name": "Nigeria", "code": "NG", "continent": "Africa", "water_score": 44, "reservoir_capacity_pct": 41, "river_count": 900, "drought_risk": "high", "flood_risk": "high", "population": 218000000, "lat": 9.08, "lng": 8.67, "status": "warning"},
    {"id": "mx", "name": "Mexico", "code": "MX", "continent": "North America", "water_score": 59, "reservoir_capacity_pct": 55, "river_count": 1500, "drought_risk": "medium", "flood_risk": "medium", "population": 130000000, "lat": 23.63, "lng": -102.55, "status": "monitoring"},
    {"id": "id", "name": "Indonesia", "code": "ID", "continent": "Asia", "water_score": 68, "reservoir_capacity_pct": 64, "river_count": 5590, "drought_risk": "medium", "flood_risk": "high", "population": 277000000, "lat": -0.78, "lng": 113.92, "status": "monitoring"},
    {"id": "pk", "name": "Pakistan", "code": "PK", "continent": "Asia", "water_score": 38, "reservoir_capacity_pct": 34, "river_count": 150, "drought_risk": "critical", "flood_risk": "high", "population": 231000000, "lat": 30.37, "lng": 69.34, "status": "critical"},
    {"id": "jp", "name": "Japan", "code": "JP", "continent": "Asia", "water_score": 82, "reservoir_capacity_pct": 79, "river_count": 14000, "drought_risk": "low", "flood_risk": "medium", "population": 126000000, "lat": 36.20, "lng": 138.25, "status": "healthy"},
    {"id": "za", "name": "South Africa", "code": "ZA", "continent": "Africa", "water_score": 48, "reservoir_capacity_pct": 44, "river_count": 20, "drought_risk": "high", "flood_risk": "medium", "population": 60000000, "lat": -30.55, "lng": 22.93, "status": "warning"},
]

COUNTRY_INDEX = {c["id"]: c for c in COUNTRIES}


def _months():
    return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]


@router.get("")
async def list_countries():
    return {"countries": COUNTRIES, "total": len(COUNTRIES)}


@router.get("/{country_id}")
async def get_country(country_id: str):
    c = COUNTRY_INDEX.get(country_id)
    if not c:
        raise HTTPException(status_code=404, detail="Country not found")
    return c


@router.get("/{country_id}/dashboard")
async def country_dashboard(country_id: str):
    c = COUNTRY_INDEX.get(country_id)
    if not c:
        raise HTTPException(status_code=404, detail="Country not found")
    r = random.Random(country_id)
    months = _months()
    return {
        "country": c,
        "national_water_score": c["water_score"],
        "reservoir_capacity": {"current_pct": c["reservoir_capacity_pct"], "total_mcm": r.randint(50000, 500000), "usable_mcm": r.randint(30000, 300000)},
        "river_status": [
            {"name": "Main River 1", "level_m": round(r.uniform(2.5, 8.0), 2), "status": r.choice(["normal", "warning", "flood"])},
            {"name": "Main River 2", "level_m": round(r.uniform(1.5, 6.0), 2), "status": r.choice(["normal", "normal", "warning"])},
            {"name": "Tributary 1", "level_m": round(r.uniform(0.8, 3.5), 2), "status": "normal"},
        ],
        "weather_summary": {"temperature_c": round(r.uniform(18, 38), 1), "rainfall_mm_7d": round(r.uniform(0, 120), 1), "humidity_pct": r.randint(40, 90)},
        "ai_recommendations": [
            {"priority": "high", "recommendation": f"Increase reservoir release by 12% in northern {c['name']} to mitigate downstream flood risk", "confidence": 0.91},
            {"priority": "medium", "recommendation": "Deploy additional quality sensors in agricultural runoff zones", "confidence": 0.87},
            {"priority": "low", "recommendation": "Update demand forecasting model with latest census data", "confidence": 0.83},
        ],
        "government_alerts": [
            {"level": "orange", "message": "Water conservation advisory active in 3 districts", "issued_at": datetime.now(timezone.utc).isoformat()},
        ],
        "historical_trends": {
            "months": months,
            "water_level": [round(r.uniform(40, 90), 1) for _ in months],
            "rainfall_mm": [round(r.uniform(10, 200), 1) for _ in months],
        },
        "water_demand": [round(r.uniform(800, 1400), 0) for _ in months],
        "water_supply": [round(r.uniform(900, 1500), 0) for _ in months],
        "regional_agents": ["CountryAgent", "ReservoirAgent", "FloodAgent", "WaterQualityAgent"],
        "ai_insights": {
            "confidence_score": round(r.uniform(0.82, 0.96), 2),
            "reasoning_summary": f"{c['name']} water analysis complete. {c['drought_risk'].capitalize()} drought risk detected.",
            "participating_agents": ["CountryAgent", "DecisionAgent", "ClimateAgent"],
            "tools_used": ["getHistoricalData", "predictFlood", "optimizeReservoir"],
        },
    }


@router.get("/{country_id}/forecast")
async def country_forecast(country_id: str):
    c = COUNTRY_INDEX.get(country_id)
    if not c:
        raise HTTPException(status_code=404, detail="Country not found")
    r = random.Random(country_id + "forecast")
    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    return {
        "country": c["name"],
        "forecast": [
            {
                "day": d,
                "temperature_c": round(r.uniform(20, 40), 1),
                "rainfall_mm": round(r.uniform(0, 80), 1),
                "humidity_pct": r.randint(45, 95),
                "wind_speed_kmh": r.randint(5, 45),
                "flood_risk": round(r.uniform(0.05, 0.75), 2),
                "drought_index": round(r.uniform(0.1, 0.8), 2),
            }
            for d in days
        ],
        "ai_insights": {
            "confidence_score": 0.89,
            "reasoning_summary": "7-day forecast generated using ensemble weather models and historical patterns.",
            "participating_agents": ["RainfallAgent", "ClimateAgent"],
            "tools_used": ["forecastRain", "predictFlood"],
        },
    }
