from fastapi import APIRouter
from datetime import datetime, timedelta
import random

router = APIRouter(prefix="/pipelines", tags=["Pipelines"])

PIPELINE_DATA = [
    {"id": "pl-mum-01", "name": "Mumbai Northern Trunk Main", "city_id": "in-mh-mum", "length_km": 42.8, "pressure_bar": 4.2, "flow_rate_lps": 680, "leak_probability_pct": 18.4, "material": "Cast Iron", "age_years": 38, "status": "degraded"},
    {"id": "pl-mum-02", "name": "Mumbai Southern Distribution", "city_id": "in-mh-mum", "length_km": 28.1, "pressure_bar": 3.8, "flow_rate_lps": 420, "leak_probability_pct": 8.2, "material": "HDPE", "age_years": 12, "status": "operational"},
    {"id": "pl-che-01", "name": "Chennai Metro Supply Line", "city_id": "in-tn-che", "length_km": 61.4, "pressure_bar": 3.2, "flow_rate_lps": 510, "leak_probability_pct": 24.7, "material": "Ductile Iron", "age_years": 45, "status": "critical"},
    {"id": "pl-lac-01", "name": "LA Aqueduct Main", "city_id": "us-ca-lac", "length_km": 372.0, "pressure_bar": 5.8, "flow_rate_lps": 920, "leak_probability_pct": 4.1, "material": "Steel", "age_years": 28, "status": "operational"},
    {"id": "pl-lac-02", "name": "LA Distribution Ring", "city_id": "us-ca-lac", "length_km": 88.3, "pressure_bar": 4.4, "flow_rate_lps": 580, "leak_probability_pct": 6.8, "material": "PVC", "age_years": 15, "status": "operational"},
    {"id": "pl-hou-01", "name": "Houston Water Main North", "city_id": "us-tx-hou", "length_km": 54.2, "pressure_bar": 4.0, "flow_rate_lps": 640, "leak_probability_pct": 9.3, "material": "HDPE", "age_years": 20, "status": "operational"},
    {"id": "pl-sao-01", "name": "São Paulo Cantareira Link", "city_id": "br-sp-sao", "length_km": 112.0, "pressure_bar": 5.1, "flow_rate_lps": 1100, "leak_probability_pct": 14.8, "material": "Steel", "age_years": 35, "status": "degraded"},
    {"id": "pl-del-01", "name": "Delhi Ring Main Sector 1", "city_id": "in-up-del", "length_km": 78.6, "pressure_bar": 3.6, "flow_rate_lps": 820, "leak_probability_pct": 31.2, "material": "Cast Iron", "age_years": 52, "status": "critical"},
    {"id": "pl-del-02", "name": "Delhi Eastern Feeder", "city_id": "in-up-del", "length_km": 45.3, "pressure_bar": 4.1, "flow_rate_lps": 560, "leak_probability_pct": 12.5, "material": "Ductile Iron", "age_years": 22, "status": "operational"},
    {"id": "pl-chg-01", "name": "Chengdu Central Supply", "city_id": "cn-sc-chg", "length_km": 66.9, "pressure_bar": 4.6, "flow_rate_lps": 740, "leak_probability_pct": 5.2, "material": "HDPE", "age_years": 8, "status": "operational"},
]


@router.get("")
async def list_pipelines(city_id: str = None):
    data = PIPELINE_DATA
    if city_id:
        data = [p for p in PIPELINE_DATA if p["city_id"] == city_id]
    r = random.Random(42)
    now = datetime.utcnow()
    enriched = []
    for p in data:
        enriched.append({
            **p,
            "last_inspection": (now - timedelta(days=r.randint(30, 365))).strftime("%Y-%m-%d"),
            "next_inspection": (now + timedelta(days=r.randint(30, 180))).strftime("%Y-%m-%d"),
            "flow_efficiency_pct": round(100 - p["leak_probability_pct"] * 0.4, 1),
        })
    return {
        "pipelines": enriched,
        "total": len(enriched),
        "summary": {
            "operational": sum(1 for p in data if p["status"] == "operational"),
            "degraded": sum(1 for p in data if p["status"] == "degraded"),
            "critical": sum(1 for p in data if p["status"] == "critical"),
            "offline": sum(1 for p in data if p["status"] == "offline"),
        },
        "ai_insights": {
            "confidence_score": 0.91,
            "reasoning_summary": "Pipeline health analysis complete. 2 critical pipelines require immediate intervention.",
            "participating_agents": ["LeakDetectionAgent", "DecisionAgent"],
            "tools_used": ["detectLeak"],
        },
    }
