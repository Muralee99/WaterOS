from fastapi import APIRouter
from datetime import datetime, timezone
import random

router = APIRouter(tags=["Global"])

COUNTRIES_MAP = [
    {"id": "in", "name": "India", "code": "IN", "lat": 20.59, "lng": 78.96, "water_score": 62, "risk_level": "medium", "reservoir_count": 4728},
    {"id": "us", "name": "United States", "code": "US", "lat": 37.09, "lng": -95.71, "water_score": 78, "risk_level": "low", "reservoir_count": 9265},
    {"id": "br", "name": "Brazil", "code": "BR", "lat": -14.23, "lng": -51.92, "water_score": 71, "risk_level": "low", "reservoir_count": 2178},
    {"id": "cn", "name": "China", "code": "CN", "lat": 35.86, "lng": 104.19, "water_score": 55, "risk_level": "high", "reservoir_count": 98000},
    {"id": "au", "name": "Australia", "code": "AU", "lat": -25.27, "lng": 133.77, "water_score": 66, "risk_level": "medium", "reservoir_count": 512},
    {"id": "ru", "name": "Russia", "code": "RU", "lat": 61.52, "lng": 105.31, "water_score": 81, "risk_level": "low", "reservoir_count": 2840},
    {"id": "ca", "name": "Canada", "code": "CA", "lat": 56.13, "lng": -106.34, "water_score": 88, "risk_level": "low", "reservoir_count": 1876},
    {"id": "de", "name": "Germany", "code": "DE", "lat": 51.16, "lng": 10.45, "water_score": 84, "risk_level": "low", "reservoir_count": 392},
    {"id": "eg", "name": "Egypt", "code": "EG", "lat": 26.82, "lng": 30.80, "water_score": 31, "risk_level": "critical", "reservoir_count": 14},
    {"id": "ng", "name": "Nigeria", "code": "NG", "lat": 9.08, "lng": 8.67, "water_score": 44, "risk_level": "high", "reservoir_count": 287},
    {"id": "mx", "name": "Mexico", "code": "MX", "lat": 23.63, "lng": -102.55, "water_score": 59, "risk_level": "medium", "reservoir_count": 667},
    {"id": "id", "name": "Indonesia", "code": "ID", "lat": -0.78, "lng": 113.92, "water_score": 68, "risk_level": "medium", "reservoir_count": 422},
    {"id": "pk", "name": "Pakistan", "code": "PK", "lat": 30.37, "lng": 69.34, "water_score": 38, "risk_level": "critical", "reservoir_count": 150},
    {"id": "jp", "name": "Japan", "code": "JP", "lat": 36.20, "lng": 138.25, "water_score": 82, "risk_level": "low", "reservoir_count": 2743},
    {"id": "za", "name": "South Africa", "code": "ZA", "lat": -30.55, "lng": 22.93, "water_score": 48, "risk_level": "high", "reservoir_count": 320},
]

CONTINENTS = [
    {"name": "Asia", "water_health": 58, "reservoir_capacity": 61, "flood_risk": 72, "drought_risk": 45, "countries": 48, "sensors": 98420},
    {"name": "North America", "water_health": 81, "reservoir_capacity": 77, "flood_risk": 32, "drought_risk": 28, "countries": 23, "sensors": 62180},
    {"name": "South America", "water_health": 73, "reservoir_capacity": 69, "flood_risk": 55, "drought_risk": 22, "countries": 12, "sensors": 38640},
    {"name": "Europe", "water_health": 85, "reservoir_capacity": 82, "flood_risk": 28, "drought_risk": 19, "countries": 44, "sensors": 51200},
    {"name": "Africa", "water_health": 42, "reservoir_capacity": 38, "flood_risk": 61, "drought_risk": 68, "countries": 54, "sensors": 24380},
    {"name": "Oceania", "water_health": 67, "reservoir_capacity": 64, "flood_risk": 41, "drought_risk": 38, "countries": 14, "sensors": 9180},
]


@router.get("/global/dashboard")
async def global_dashboard():
    now = datetime.now(timezone.utc).isoformat()
    return {
        "global_water_health_score": 67.4,
        "ai_confidence_score": 91.2,
        "countries_monitored": 195,
        "reservoirs": 12840,
        "rivers": 50000,
        "sensors_online": 284000,
        "active_agents": 14,
        "flood_risks": 23,
        "drought_risks": 18,
        "water_quality_index": 74.2,
        "leak_detection_count": 847,
        "emergency_incidents": 3,
        "recent_agent_decisions": [
            {"id": 1, "agent": "DecisionAgent", "action": "Issued flood pre-alert for Brahmaputra basin", "confidence": 0.94, "impact": "high", "timestamp": now},
            {"id": 2, "agent": "ReservoirAgent", "action": "Optimised release schedule for Hoover Dam", "confidence": 0.88, "impact": "medium", "timestamp": now},
            {"id": 3, "agent": "WaterQualityAgent", "action": "Detected pH anomaly in Chennai supply", "confidence": 0.97, "impact": "high", "timestamp": now},
            {"id": 4, "agent": "LeakDetectionAgent", "action": "Located 3 new leaks in Mumbai pipeline sector 7", "confidence": 0.91, "impact": "medium", "timestamp": now},
            {"id": 5, "agent": "ClimateAgent", "action": "Updated drought forecast for Sahel region", "confidence": 0.86, "impact": "critical", "timestamp": now},
        ],
        "live_ai_reasoning": [
            {"step": 1, "agent": "GlobalCoordinatorAgent", "action": "Aggregating continent-level water health scores", "confidence": 0.95, "timestamp": now},
            {"step": 2, "agent": "RainfallAgent", "action": "Analysing monsoon patterns over South Asia", "confidence": 0.89, "timestamp": now},
            {"step": 3, "agent": "FloodAgent", "action": "Cross-referencing river levels with reservoir capacity", "confidence": 0.93, "timestamp": now},
            {"step": 4, "agent": "EmergencyAgent", "action": "Evaluating evacuation readiness in flood zones", "confidence": 0.87, "timestamp": now},
            {"step": 5, "agent": "DecisionAgent", "action": "Synthesising recommendations across 14 active agents", "confidence": 0.96, "timestamp": now},
        ],
        "ai_insights": {
            "confidence_score": 0.91,
            "reasoning_summary": "Global water health is stable with localised stress in South Asia and Sub-Saharan Africa. 3 active emergency situations under agent coordination.",
            "participating_agents": ["GlobalCoordinatorAgent", "DecisionAgent", "FloodAgent", "ClimateAgent", "ReservoirAgent"],
            "tools_used": ["predictFlood", "analyzeWaterQuality", "optimizeReservoir", "forecastRain"],
        },
    }


@router.get("/global/statistics")
async def global_statistics():
    return {
        "continents": CONTINENTS,
        "global_totals": {
            "total_freshwater_km3": 35000000,
            "accessible_freshwater_pct": 0.77,
            "population_water_stress_pct": 40,
            "annual_precipitation_mm": 990,
        },
        "trends": {
            "water_health_change_1yr": -1.2,
            "reservoir_capacity_change_1yr": -0.8,
            "sensor_coverage_change_1yr": 8.4,
        },
        "ai_insights": {
            "confidence_score": 0.88,
            "reasoning_summary": "Continent-level aggregation complete. Asia shows highest stress concentration.",
            "participating_agents": ["GlobalCoordinatorAgent", "ClimateAgent"],
            "tools_used": ["getHistoricalData", "searchKnowledge"],
        },
    }


@router.get("/global/map")
async def global_map():
    return {
        "type": "FeatureCollection",
        "countries": COUNTRIES_MAP,
        "flood_zones": [
            {"id": "fz1", "name": "Brahmaputra Floodplain", "lat": 26.1, "lng": 91.7, "severity": "high", "population_at_risk": 2400000},
            {"id": "fz2", "name": "Bangladesh Delta", "lat": 23.6, "lng": 90.3, "severity": "critical", "population_at_risk": 8100000},
            {"id": "fz3", "name": "Mississippi Delta", "lat": 29.9, "lng": -90.0, "severity": "medium", "population_at_risk": 450000},
            {"id": "fz4", "name": "Nile Delta", "lat": 31.0, "lng": 30.5, "severity": "medium", "population_at_risk": 12000000},
        ],
        "drought_zones": [
            {"id": "dz1", "name": "Sahel Region", "lat": 14.0, "lng": 12.0, "severity": "critical", "area_km2": 5400000},
            {"id": "dz2", "name": "Indus Plain", "lat": 28.5, "lng": 70.0, "severity": "high", "area_km2": 520000},
            {"id": "dz3", "name": "Murray-Darling Basin", "lat": -34.0, "lng": 142.0, "severity": "medium", "area_km2": 1060000},
        ],
        "ai_insights": {
            "confidence_score": 0.93,
            "reasoning_summary": "Real-time global map synthesised from 284,000 sensor feeds and satellite imagery.",
            "participating_agents": ["GlobalCoordinatorAgent", "FloodAgent", "ClimateAgent"],
            "tools_used": ["predictFlood", "predictDrought", "forecastRain"],
        },
    }
