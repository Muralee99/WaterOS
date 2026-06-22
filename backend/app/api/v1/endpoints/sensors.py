from fastapi import APIRouter
from datetime import datetime, timezone
import random

router = APIRouter(prefix="/sensors", tags=["Sensors"])

BASE_SENSORS = [
    {"id": "sns-001", "name": "Mumbai Bay Flow Meter", "type": "flow", "location_lat": 18.9750, "location_lng": 72.8258, "city_id": "in-mh-mum", "unit": "L/s", "base_value": 680, "battery_pct": 92},
    {"id": "sns-002", "name": "Powai Lake Level Sensor", "type": "level", "location_lat": 19.1270, "location_lng": 72.9050, "city_id": "in-mh-mum", "unit": "m", "base_value": 8.4, "battery_pct": 78},
    {"id": "sns-003", "name": "Chennai Poondi Gauge", "type": "level", "location_lat": 13.4610, "location_lng": 79.9826, "city_id": "in-tn-che", "unit": "m", "base_value": 5.1, "battery_pct": 55},
    {"id": "sns-004", "name": "Chennai WTP Quality Monitor", "type": "quality", "location_lat": 13.0827, "location_lng": 80.2707, "city_id": "in-tn-che", "unit": "WQI", "base_value": 74, "battery_pct": 88},
    {"id": "sns-005", "name": "LA Aqueduct Pressure Node", "type": "pressure", "location_lat": 34.0522, "location_lng": -118.2437, "city_id": "us-ca-lac", "unit": "bar", "base_value": 4.2, "battery_pct": 95},
    {"id": "sns-006", "name": "LA Rainfall Station Alpha", "type": "rainfall", "location_lat": 34.1141, "location_lng": -118.4068, "city_id": "us-ca-lac", "unit": "mm/h", "base_value": 0.3, "battery_pct": 82},
    {"id": "sns-007", "name": "São Paulo Guarapiranga Level", "type": "level", "location_lat": -23.7186, "location_lng": -46.7247, "city_id": "br-sp-sao", "unit": "m", "base_value": 12.8, "battery_pct": 71},
    {"id": "sns-008", "name": "Delhi Yamuna Quality Probe", "type": "quality", "location_lat": 28.7041, "location_lng": 77.1025, "city_id": "in-up-del", "unit": "WQI", "base_value": 51, "battery_pct": 44},
    {"id": "sns-009", "name": "Houston Bayou Flow Meter", "type": "flow", "location_lat": 29.7604, "location_lng": -95.3698, "city_id": "us-tx-hou", "unit": "L/s", "base_value": 540, "battery_pct": 89},
    {"id": "sns-010", "name": "Pune Khadakwasla Level", "type": "level", "location_lat": 18.4355, "location_lng": 73.7736, "city_id": "in-mh-pun", "unit": "m", "base_value": 22.1, "battery_pct": 96},
    {"id": "sns-011", "name": "Mumbai WTP Pressure", "type": "pressure", "location_lat": 19.0760, "location_lng": 72.8777, "city_id": "in-mh-mum", "unit": "bar", "base_value": 3.8, "battery_pct": 87},
    {"id": "sns-012", "name": "Chengdu Funan River Gauge", "type": "level", "location_lat": 30.5728, "location_lng": 104.0668, "city_id": "cn-sc-chg", "unit": "m", "base_value": 4.6, "battery_pct": 91},
]


def _build_sensor(s: dict, live: bool = False) -> dict:
    r = random.Random()
    jitter = r.uniform(-0.05, 0.05) if live else 0
    value = round(s["base_value"] * (1 + jitter), 2)
    status_weights = ["online"] * 14 + ["maintenance"] + ["offline"]
    status = r.choice(status_weights)
    out = {
        "id": s["id"],
        "name": s["name"],
        "type": s["type"],
        "location_lat": s["location_lat"],
        "location_lng": s["location_lng"],
        "city_id": s.get("city_id"),
        "reservoir_id": s.get("reservoir_id"),
        "current_value": value,
        "unit": s["unit"],
        "status": status,
        "battery_pct": max(0, s["battery_pct"] - r.randint(0, 3)),
        "last_reading": datetime.now(timezone.utc).isoformat(),
    }
    if live:
        out["live"] = True
    return out


@router.get("")
async def list_sensors(city_id: str = None, reservoir_id: str = None):
    data = BASE_SENSORS
    if city_id:
        data = [s for s in BASE_SENSORS if s.get("city_id") == city_id]
    if reservoir_id:
        data = [s for s in BASE_SENSORS if s.get("reservoir_id") == reservoir_id]
    sensors = [_build_sensor(s) for s in data]
    return {
        "sensors": sensors,
        "total": len(sensors),
        "online": sum(1 for s in sensors if s["status"] == "online"),
        "offline": sum(1 for s in sensors if s["status"] == "offline"),
    }


@router.get("/live")
async def live_sensors(city_id: str = None):
    data = BASE_SENSORS
    if city_id:
        data = [s for s in BASE_SENSORS if s.get("city_id") == city_id]
    sensors = [_build_sensor(s, live=True) for s in data]
    return {
        "sensors": sensors,
        "total": len(sensors),
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "live": True,
    }
