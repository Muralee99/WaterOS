"""
Provides realistic sample data for the WaterOS platform.
In production this pulls from PostgreSQL; here it returns seeded simulation data.
"""
import random
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any


def _random_trend(base: float, variation: float, points: int) -> List[float]:
    values = [base]
    for _ in range(points - 1):
        delta = random.uniform(-variation, variation)
        values.append(round(max(0, values[-1] + delta), 2))
    return values


async def get_sample_reservoirs() -> List[Dict]:
    reservoirs = [
        {"name": "Krishna Sagar", "location": "Mysuru, Karnataka", "lat": 12.42, "lng": 76.57, "capacity": 1370},
        {"name": "Bhakra", "location": "Bilaspur, Himachal Pradesh", "lat": 31.41, "lng": 76.43, "capacity": 9340},
        {"name": "Nagarjuna Sagar", "location": "Nalgonda, Telangana", "lat": 16.57, "lng": 79.32, "capacity": 11472},
        {"name": "Hirakud", "location": "Sambalpur, Odisha", "lat": 21.52, "lng": 83.87, "capacity": 8105},
        {"name": "Tehri", "location": "Uttarkhand", "lat": 30.38, "lng": 78.48, "capacity": 3540},
    ]
    return [
        {
            "id": f"RES{str(i+1).zfill(3)}",
            "name": r["name"],
            "location": r["location"],
            "latitude": r["lat"],
            "longitude": r["lng"],
            "capacity_mcm": r["capacity"],
            "current_level_mcm": round(r["capacity"] * random.uniform(0.35, 0.92), 1),
            "fill_percentage": round(random.uniform(35, 92), 1),
            "inflow_rate": round(random.uniform(50, 800), 1),
            "outflow_rate": round(random.uniform(40, 750), 1),
            "overflow_risk": random.choice(["low", "low", "medium", "high"]),
            "last_updated": datetime.now(timezone.utc).isoformat(),
            "history": _random_trend(65, 5, 30),
        }
        for i, r in enumerate(reservoirs)
    ]


async def get_sample_water_quality() -> List[Dict]:
    locations = [
        {"name": "Treatment Plant A", "lat": 12.97, "lng": 77.59},
        {"name": "River Station B", "lat": 13.05, "lng": 77.64},
        {"name": "Groundwater Well C", "lat": 12.89, "lng": 77.52},
        {"name": "Distribution Node D", "lat": 12.93, "lng": 77.67},
    ]
    return [
        {
            "id": f"WQ{str(i+1).zfill(3)}",
            "location": loc["name"],
            "latitude": loc["lat"],
            "longitude": loc["lng"],
            "ph": round(random.uniform(6.8, 8.2), 2),
            "turbidity_ntu": round(random.uniform(0.3, 8), 2),
            "chlorine_mg_l": round(random.uniform(0.2, 1.8), 2),
            "dissolved_oxygen": round(random.uniform(6, 11), 2),
            "conductivity": round(random.uniform(200, 600), 0),
            "temperature_c": round(random.uniform(18, 28), 1),
            "safety_score": round(random.uniform(72, 99), 1),
            "status": random.choice(["safe", "safe", "safe", "warning"]),
            "measured_at": datetime.now(timezone.utc).isoformat(),
        }
        for i, loc in enumerate(locations)
    ]


async def get_active_alerts() -> List[Dict]:
    alert_types = [
        {"type": "flood", "severity": "high", "title": "Flood Risk Detected", "location": "Krishna River Basin"},
        {"type": "quality", "severity": "warning", "title": "pH Anomaly Detected", "location": "Treatment Plant A"},
        {"type": "leak", "severity": "critical", "title": "Pipeline Leak Detected", "location": "Zone 3 Pipeline"},
        {"type": "drought", "severity": "medium", "title": "Low Reservoir Level", "location": "Bhakra Reservoir"},
    ]
    alerts = []
    for i, a in enumerate(alert_types[:random.randint(1, 4)]):
        alerts.append({
            "id": f"ALT{str(i+1).zfill(4)}",
            **a,
            "message": f"AI agent detected anomaly in {a['location']}. Immediate attention required.",
            "confidence": round(random.uniform(0.75, 0.97), 2),
            "is_active": True,
            "created_at": (datetime.now(timezone.utc) - timedelta(minutes=random.randint(5, 120))).isoformat(),
            "evidence": {"sensor_readings": random.randint(3, 12), "anomaly_score": round(random.uniform(0.6, 0.95), 3)},
        })
    return alerts


async def create_alert(data: Dict) -> Dict:
    return {"id": f"ALT{random.randint(1000, 9999)}", **data, "created_at": datetime.now(timezone.utc).isoformat()}


async def get_forecast_data(location: str, days: int) -> Dict:
    return {
        "location": location,
        "days": days,
        "temperature": [round(random.uniform(22, 38), 1) for _ in range(days)],
        "rainfall_mm": [round(random.uniform(0, 80), 1) for _ in range(days)],
        "humidity_pct": [round(random.uniform(40, 95), 1) for _ in range(days)],
        "wind_speed_kmh": [round(random.uniform(5, 40), 1) for _ in range(days)],
        "storm_probability": round(random.uniform(10, 70), 1),
        "drought_risk": random.choice(["low", "medium", "high"]),
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }


async def get_dashboard_data() -> Dict:
    return {
        "water_health_score": round(random.uniform(72, 95), 1),
        "avg_reservoir_level_pct": round(random.uniform(55, 80), 1),
        "flood_risk": random.choice(["low", "medium", "high"]),
        "active_leak_alerts": random.randint(0, 5),
        "water_quality_score": round(random.uniform(78, 98), 1),
        "active_agents": 7,
        "system_health": "operational",
        "total_reservoirs": 5,
        "total_sensors": 142,
        "alerts_today": random.randint(2, 15),
        "last_updated": datetime.now(timezone.utc).isoformat(),
    }


async def get_statistics() -> Dict:
    return {
        "total_water_managed_mcm": round(random.uniform(50000, 80000), 0),
        "efficiency_pct": round(random.uniform(82, 95), 1),
        "leaks_detected_this_month": random.randint(3, 12),
        "water_saved_mcm": round(random.uniform(100, 500), 1),
        "ai_predictions_accuracy": round(random.uniform(88, 97), 1),
        "agent_executions_today": random.randint(50, 200),
        "avg_response_time_ms": random.randint(120, 450),
        "uptime_pct": 99.7,
    }
