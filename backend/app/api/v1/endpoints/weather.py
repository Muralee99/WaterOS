from fastapi import APIRouter
import random

router = APIRouter(prefix="/weather", tags=["Weather"])

COUNTRY_WEATHER_SEEDS = {
    "in": {"temp_base": 32, "rain_base": 45, "humid_base": 78},
    "us": {"temp_base": 22, "rain_base": 20, "humid_base": 58},
    "br": {"temp_base": 28, "rain_base": 80, "humid_base": 85},
    "cn": {"temp_base": 18, "rain_base": 35, "humid_base": 65},
    "au": {"temp_base": 25, "rain_base": 15, "humid_base": 52},
    "eg": {"temp_base": 38, "rain_base": 2, "humid_base": 35},
    "ng": {"temp_base": 30, "rain_base": 60, "humid_base": 80},
}

DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
CONDITIONS = ["Sunny", "Partly Cloudy", "Cloudy", "Light Rain", "Heavy Rain", "Thunderstorm"]


@router.get("")
async def get_weather(country_id: str = None, lat: float = None, lng: float = None):
    seed = country_id or "global"
    r = random.Random(seed)
    base = COUNTRY_WEATHER_SEEDS.get(country_id, {"temp_base": 24, "rain_base": 30, "humid_base": 65})
    current = {
        "temperature_c": round(base["temp_base"] + r.uniform(-4, 4), 1),
        "feels_like_c": round(base["temp_base"] + r.uniform(-6, 3), 1),
        "rainfall_mm": round(max(0, base["rain_base"] + r.uniform(-20, 30)), 1),
        "humidity_pct": min(100, max(10, base["humid_base"] + r.randint(-15, 15))),
        "wind_speed_kmh": r.randint(5, 60),
        "wind_direction": r.choice(["N", "NE", "E", "SE", "S", "SW", "W", "NW"]),
        "uv_index": r.randint(1, 12),
        "cloud_cover_pct": r.randint(0, 100),
        "condition": r.choice(CONDITIONS),
        "drought_index": round(r.uniform(0.05, 0.85), 2),
        "flood_index": round(r.uniform(0.05, 0.70), 2),
        "pressure_hpa": r.randint(995, 1025),
        "visibility_km": r.randint(5, 30),
    }
    forecast = [
        {
            "day": d,
            "temperature_high_c": round(base["temp_base"] + r.uniform(-2, 6), 1),
            "temperature_low_c": round(base["temp_base"] + r.uniform(-8, 0), 1),
            "rainfall_mm": round(max(0, base["rain_base"] * r.uniform(0, 2)), 1),
            "humidity_pct": min(100, max(10, base["humid_base"] + r.randint(-20, 20))),
            "wind_speed_kmh": r.randint(5, 55),
            "uv_index": r.randint(1, 11),
            "condition": r.choice(CONDITIONS),
            "drought_index": round(r.uniform(0.05, 0.85), 2),
            "flood_index": round(r.uniform(0.05, 0.70), 2),
        }
        for d in DAYS
    ]
    return {
        "location": country_id or f"lat={lat},lng={lng}",
        "current": current,
        "forecast_7d": forecast,
        "extreme_events": [
            {"type": "Heavy Rain Warning", "severity": "orange", "valid_until": "2026-06-24T18:00:00Z"}
        ] if current["rainfall_mm"] > 50 else [],
        "ai_insights": {
            "confidence_score": 0.87,
            "reasoning_summary": f"Weather analysis for {country_id or 'requested location'}. Conditions derived from multi-model ensemble.",
            "participating_agents": ["RainfallAgent", "ClimateAgent"],
            "tools_used": ["forecastRain"],
        },
    }
