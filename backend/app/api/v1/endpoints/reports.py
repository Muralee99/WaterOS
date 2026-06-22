from fastapi import APIRouter, HTTPException
from datetime import datetime, timezone, timedelta
from pydantic import BaseModel
import random
import uuid

router = APIRouter(prefix="/reports", tags=["Reports"])

REPORTS = [
    {"id": "rpt-001", "title": "Global Water Quality Assessment Q2 2026", "type": "water_quality", "region": "Global", "agent": "WaterQualityAgent", "status": "ready", "generated_at": "2026-06-20T08:30:00Z", "summary": "Comprehensive analysis of water quality across 195 countries. 23 countries require immediate intervention."},
    {"id": "rpt-002", "title": "South Asia Flood Risk Analysis", "type": "flood_risk", "region": "South Asia", "agent": "FloodAgent", "status": "ready", "generated_at": "2026-06-19T14:15:00Z", "summary": "Brahmaputra and Ganges basins show elevated flood risk. AI predicts 71% probability of major flooding within 7 days."},
    {"id": "rpt-003", "title": "Sahel Drought Early Warning Report", "type": "drought_analysis", "region": "Africa", "agent": "ClimateAgent", "status": "ready", "generated_at": "2026-06-18T10:00:00Z", "summary": "Severe drought conditions persisting across 6 Sahel nations. Groundwater depletion accelerating at 3.2% per year."},
    {"id": "rpt-004", "title": "Mumbai Pipeline Infrastructure Audit", "type": "infrastructure", "region": "Mumbai, India", "agent": "LeakDetectionAgent", "status": "ready", "generated_at": "2026-06-17T16:45:00Z", "summary": "284 active leaks identified. Estimated water loss of 684 MLD/day. Priority replacement zones identified."},
    {"id": "rpt-005", "title": "AI Agent Performance Report - June 2026", "type": "agent_performance", "region": "Global", "agent": "DecisionAgent", "status": "ready", "generated_at": "2026-06-16T09:00:00Z", "summary": "14 active agents processed 12,847 decisions with 91.2% average confidence. Decision latency reduced by 18%."},
    {"id": "rpt-006", "title": "Colorado River Basin Water Allocation", "type": "drought_analysis", "region": "Western USA", "agent": "ReservoirAgent", "status": "ready", "generated_at": "2026-06-15T11:30:00Z", "summary": "Lake Mead at 28% capacity. AI recommends 35% demand reduction across downstream states."},
    {"id": "rpt-007", "title": "Chennai Water Crisis Prevention Plan", "type": "water_quality", "region": "Tamil Nadu, India", "agent": "WaterQualityAgent", "status": "ready", "generated_at": "2026-06-14T13:00:00Z", "summary": "Desalination capacity needs 40% increase. Groundwater recharge plan with 3-year timeline proposed."},
    {"id": "rpt-008", "title": "Amazon Basin Hydrology Forecast 2026-2030", "type": "flood_risk", "region": "South America", "agent": "RainfallAgent", "status": "ready", "generated_at": "2026-06-13T08:00:00Z", "summary": "Deforestation continues to alter rainfall patterns. 12% increase in extreme rainfall events predicted by 2030."},
    {"id": "rpt-009", "title": "Global Sensor Network Expansion Proposal", "type": "infrastructure", "region": "Global", "agent": "GlobalCoordinatorAgent", "status": "generating", "generated_at": "2026-06-22T22:00:00Z", "summary": "Proposal to expand sensor coverage from 284,000 to 500,000 nodes by 2028."},
    {"id": "rpt-010", "title": "Climate Change Impact on Freshwater Resources", "type": "drought_analysis", "region": "Global", "agent": "ClimateAgent", "status": "ready", "generated_at": "2026-06-12T07:00:00Z", "summary": "3.6 billion people projected to face water scarcity by 2030. Adaptation strategies for 47 high-risk nations proposed."},
]

REPORT_INDEX = {r["id"]: r for r in REPORTS}


class GenerateReportRequest(BaseModel):
    type: str
    region: str
    date_range: dict = {}


@router.get("")
async def list_reports(type: str = None, region: str = None):
    data = REPORTS
    if type:
        data = [r for r in data if r["type"] == type]
    if region:
        data = [r for r in data if region.lower() in r["region"].lower()]
    return {"reports": data, "total": len(data)}


@router.get("/{report_id}")
async def get_report(report_id: str):
    r_meta = REPORT_INDEX.get(report_id)
    if not r_meta:
        raise HTTPException(status_code=404, detail="Report not found")
    rng = random.Random(report_id)
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
    return {
        **r_meta,
        "sections": [
            {"title": "Executive Summary", "content": r_meta["summary"]},
            {"title": "Data Analysis", "content": f"Analysis performed across {rng.randint(50, 500)} data points from {rng.randint(10, 200)} sensors."},
            {"title": "AI Findings", "content": f"AI agents identified {rng.randint(3, 15)} critical patterns requiring immediate attention."},
            {"title": "Recommendations", "content": f"{rng.randint(5, 12)} actionable recommendations generated with average confidence {round(rng.uniform(0.82, 0.96), 2)}."},
        ],
        "charts_data": {
            "trend": {"months": months, "values": [rng.randint(40, 90) for _ in months]},
            "distribution": [{"label": f"Zone {i+1}", "value": rng.randint(10, 40)} for i in range(5)],
        },
        "recommendations": [
            {"priority": "critical", "action": "Immediate infrastructure inspection in high-risk zones", "estimated_impact": "High", "timeline": "7 days"},
            {"priority": "high", "action": "Deploy additional water quality sensors", "estimated_impact": "Medium", "timeline": "30 days"},
            {"priority": "medium", "action": "Update demand forecasting models", "estimated_impact": "Medium", "timeline": "90 days"},
        ],
        "confidence_score": round(rng.uniform(0.82, 0.97), 2),
        "participating_agents": ["DecisionAgent", r_meta["agent"], "GlobalCoordinatorAgent"],
        "ai_insights": {
            "confidence_score": round(rng.uniform(0.82, 0.97), 2),
            "reasoning_summary": f"Report generated using multi-agent collaboration with {rng.randint(3, 8)} participating agents.",
            "participating_agents": ["DecisionAgent", r_meta["agent"]],
            "tools_used": ["getHistoricalData", "searchKnowledge", "analyzeWaterQuality"],
        },
    }


@router.post("/generate")
async def generate_report(req: GenerateReportRequest):
    report_id = f"rpt-{str(uuid.uuid4())[:8]}"
    return {
        "report_id": report_id,
        "status": "generating",
        "type": req.type,
        "region": req.region,
        "estimated_minutes": 2,
        "message": f"Report generation started. Report ID: {report_id}",
    }
