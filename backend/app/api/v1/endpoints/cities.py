from fastapi import APIRouter, HTTPException
import random

router = APIRouter(prefix="/cities", tags=["Cities"])

CITIES = [
    {"id": "in-mh-mum", "name": "Mumbai", "state_id": "in-mh", "population": 20667656, "water_consumption_mld": 3800, "pipeline_health_pct": 67, "leak_count": 284, "treatment_plants": 7, "water_quality_score": 74, "citizen_alerts": 2},
    {"id": "in-mh-pun", "name": "Pune", "state_id": "in-mh", "population": 3124458, "water_consumption_mld": 1100, "pipeline_health_pct": 72, "leak_count": 91, "treatment_plants": 4, "water_quality_score": 79, "citizen_alerts": 0},
    {"id": "in-tn-che", "name": "Chennai", "state_id": "in-tn", "population": 7088000, "water_consumption_mld": 830, "pipeline_health_pct": 58, "leak_count": 412, "treatment_plants": 5, "water_quality_score": 61, "citizen_alerts": 4},
    {"id": "in-up-del", "name": "Delhi", "state_id": "in-up", "population": 31181376, "water_consumption_mld": 4000, "pipeline_health_pct": 62, "leak_count": 631, "treatment_plants": 12, "water_quality_score": 68, "citizen_alerts": 3},
    {"id": "us-ca-lac", "name": "Los Angeles", "state_id": "us-ca", "population": 3979576, "water_consumption_mld": 1700, "pipeline_health_pct": 78, "leak_count": 142, "treatment_plants": 6, "water_quality_score": 83, "citizen_alerts": 1},
    {"id": "us-ca-sfc", "name": "San Francisco", "state_id": "us-ca", "population": 873965, "water_consumption_mld": 260, "pipeline_health_pct": 81, "leak_count": 38, "treatment_plants": 3, "water_quality_score": 88, "citizen_alerts": 0},
    {"id": "us-tx-hou", "name": "Houston", "state_id": "us-tx", "population": 2304580, "water_consumption_mld": 1100, "pipeline_health_pct": 75, "leak_count": 88, "treatment_plants": 5, "water_quality_score": 81, "citizen_alerts": 1},
    {"id": "br-sp-sao", "name": "São Paulo", "state_id": "br-sp", "population": 12325232, "water_consumption_mld": 6800, "pipeline_health_pct": 69, "leak_count": 522, "treatment_plants": 9, "water_quality_score": 72, "citizen_alerts": 2},
    {"id": "cn-sc-chg", "name": "Chengdu", "state_id": "cn-sc", "population": 9040000, "water_consumption_mld": 3200, "pipeline_health_pct": 82, "leak_count": 167, "treatment_plants": 8, "water_quality_score": 77, "citizen_alerts": 0},
]

CITY_INDEX = {c["id"]: c for c in CITIES}


@router.get("")
async def list_cities(state_id: str = None):
    data = CITIES
    if state_id:
        data = [c for c in CITIES if c["state_id"] == state_id]
    return {"cities": data, "total": len(data)}


@router.get("/{city_id}")
async def get_city(city_id: str):
    city = CITY_INDEX.get(city_id)
    if not city:
        raise HTTPException(status_code=404, detail="City not found")
    r = random.Random(city_id)
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    return {
        **city,
        "pipelines": [
            {
                "id": f"{city_id}-pipe-{i}",
                "name": f"Pipeline Sector {i+1}",
                "length_km": round(r.uniform(5, 80), 1),
                "pressure_bar": round(r.uniform(2.5, 6.0), 2),
                "flow_rate_lps": round(r.uniform(50, 800), 1),
                "leak_probability_pct": round(r.uniform(1, 25), 1),
                "status": r.choice(["operational", "operational", "operational", "degraded", "critical"]),
            }
            for i in range(5)
        ],
        "leak_detection": {
            "total_leaks": city["leak_count"],
            "high_priority": r.randint(0, city["leak_count"] // 4),
            "repaired_this_month": r.randint(5, 50),
            "water_loss_mld": round(city["water_consumption_mld"] * r.uniform(0.05, 0.18), 1),
        },
        "treatment_plants": [
            {
                "id": f"{city_id}-tp-{i}",
                "name": f"Treatment Plant {i+1}",
                "capacity_mld": r.randint(100, 800),
                "current_load_pct": r.randint(60, 95),
                "quality_score": r.randint(70, 98),
                "status": r.choice(["operational", "operational", "maintenance"]),
            }
            for i in range(city["treatment_plants"])
        ],
        "consumption_trend": {
            "months": months,
            "demand_mld": [round(city["water_consumption_mld"] * r.uniform(0.85, 1.15), 0) for _ in months],
        },
        "water_quality_breakdown": {
            "ph": round(r.uniform(6.8, 7.6), 2),
            "turbidity_ntu": round(r.uniform(0.1, 2.5), 2),
            "chlorine_mg_l": round(r.uniform(0.2, 0.8), 2),
            "tds_mg_l": r.randint(150, 450),
            "overall_score": city["water_quality_score"],
        },
        "citizen_alerts_detail": [
            {"id": i, "message": f"Water disruption in Zone {r.randint(1,10)}", "level": r.choice(["info", "warning", "critical"]), "affected_population": r.randint(1000, 50000)}
            for i in range(city["citizen_alerts"])
        ],
        "ai_insights": {
            "confidence_score": round(r.uniform(0.83, 0.96), 2),
            "reasoning_summary": f"{city['name']} city water analysis complete. Pipeline health at {city['pipeline_health_pct']}%.",
            "participating_agents": ["LeakDetectionAgent", "WaterQualityAgent", "DecisionAgent"],
            "tools_used": ["detectLeak", "analyzeWaterQuality"],
        },
    }
