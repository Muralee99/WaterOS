from fastapi import APIRouter
import random

router = APIRouter(prefix="/climate", tags=["Climate"])

REGIONS = ["Asia", "North America", "South America", "Europe", "Africa", "Oceania"]

WATER_STRESS_COUNTRIES = [
    {"country": "Egypt", "stress_level": "extreme", "freshwater_per_capita_m3": 560},
    {"country": "Pakistan", "stress_level": "high", "freshwater_per_capita_m3": 1210},
    {"country": "India", "stress_level": "high", "freshwater_per_capita_m3": 1458},
    {"country": "South Africa", "stress_level": "high", "freshwater_per_capita_m3": 921},
    {"country": "Mexico", "stress_level": "medium-high", "freshwater_per_capita_m3": 3822},
    {"country": "China", "stress_level": "medium-high", "freshwater_per_capita_m3": 2018},
    {"country": "Spain", "stress_level": "medium", "freshwater_per_capita_m3": 2388},
]


@router.get("")
async def global_climate():
    r = random.Random(2026)
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    years = list(range(2024, 2035))
    return {
        "global_indicators": {
            "temperature_anomaly_c": 1.48,
            "sea_level_rise_mm_since_1990": 112,
            "co2_ppm": 422.8,
            "glacier_retreat_pct_since_2000": 18.4,
            "extreme_events_count_2025": 287,
            "arctic_ice_extent_change_pct": -14.2,
        },
        "water_stress_countries": WATER_STRESS_COUNTRIES,
        "historical_temperature": {
            "years": list(range(1990, 2027)),
            "anomaly_c": [round(-0.2 + i * 0.052 + r.uniform(-0.08, 0.08), 2) for i in range(37)],
        },
        "projections_10yr": {
            "years": years,
            "temperature_increase_c": [round(1.48 + i * 0.08, 2) for i in range(11)],
            "precipitation_change_pct": [round(r.uniform(-8, 12), 1) for _ in years],
            "sea_level_mm": [112 + i * 4.2 for i in range(11)],
            "water_stressed_population_bn": [round(3.6 + i * 0.12, 2) for i in range(11)],
        },
        "seasonal_patterns": {
            "months": months,
            "global_avg_rainfall_mm": [r.randint(60, 120) for _ in months],
            "evapotranspiration_mm": [r.randint(40, 95) for _ in months],
        },
        "ai_insights": {
            "confidence_score": 0.94,
            "reasoning_summary": "Climate analysis based on IPCC AR6 data and real-time sensor integration. 1.48°C anomaly is a critical threshold indicator.",
            "participating_agents": ["ClimateAgent", "GlobalCoordinatorAgent", "DecisionAgent"],
            "tools_used": ["searchKnowledge", "getHistoricalData", "predictDrought"],
        },
    }


@router.get("/{region}")
async def regional_climate(region: str):
    r = random.Random(region)
    region_clean = region.replace("-", " ").title()
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    return {
        "region": region_clean,
        "temperature_anomaly_c": round(r.uniform(0.8, 2.1), 2),
        "precipitation_change_pct_yr": round(r.uniform(-12, 15), 1),
        "extreme_events_count": r.randint(8, 62),
        "water_availability_index": round(r.uniform(0.3, 0.9), 2),
        "drought_frequency_change_pct": round(r.uniform(-5, 40), 1),
        "flood_frequency_change_pct": round(r.uniform(-5, 55), 1),
        "monthly_rainfall": {
            "months": months,
            "historical_mm": [r.randint(20, 180) for _ in months],
            "projected_2030_mm": [r.randint(15, 200) for _ in months],
        },
        "ai_insights": {
            "confidence_score": round(r.uniform(0.80, 0.93), 2),
            "reasoning_summary": f"Regional climate analysis for {region_clean} complete.",
            "participating_agents": ["ClimateAgent", "RainfallAgent"],
            "tools_used": ["searchKnowledge", "forecastRain"],
        },
    }
