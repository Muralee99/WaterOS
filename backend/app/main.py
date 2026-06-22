from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from contextlib import asynccontextmanager
import asyncio
import json
import logging
import random
from datetime import datetime, timezone

from app.core.config import settings
from app.api.v1.router import api_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"WaterOS {settings.APP_VERSION} starting up...")
    yield
    logger.info("WaterOS shutting down...")


app = FastAPI(
    title="WaterOS API",
    description="AI-Native Multi-Agent Water Intelligence Platform",
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(GZipMiddleware, minimum_size=1000)

app.include_router(api_router)

# WebSocket connection manager
active_connections: list[WebSocket] = []


@app.websocket("/ws/live-data")
async def websocket_live_data(websocket: WebSocket):
    await websocket.accept()
    active_connections.append(websocket)
    try:
        while True:
            data = {
                "type": "sensor_update",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "reservoir_level": round(random.uniform(55, 85), 1),
                "river_level": round(random.uniform(2.0, 6.5), 2),
                "water_quality_score": round(random.uniform(78, 98), 1),
                "flood_risk": random.choice(["low", "low", "medium"]),
                "active_alerts": random.randint(0, 4),
            }
            await websocket.send_text(json.dumps(data))
            await asyncio.sleep(5)
    except WebSocketDisconnect:
        active_connections.remove(websocket)


@app.websocket("/ws/agents")
async def websocket_agent_stream(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            agent_ids = ["rainfall_agent", "reservoir_agent", "flood_agent", "water_quality_agent",
                         "leak_detection_agent", "emergency_agent", "decision_agent"]
            statuses = ["idle", "idle", "idle", "running", "completed"]
            data = {
                "type": "agent_status",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "agents": [
                    {
                        "agent_id": aid,
                        "status": random.choice(statuses),
                        "confidence": round(random.uniform(0.75, 0.98), 2),
                        "last_run": datetime.now(timezone.utc).isoformat(),
                    }
                    for aid in agent_ids
                ],
            }
            await websocket.send_text(json.dumps(data))
            await asyncio.sleep(3)
    except WebSocketDisconnect:
        pass


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@app.get("/metrics")
async def metrics():
    return {
        "active_agents": 7,
        "total_api_calls": random.randint(1000, 50000),
        "avg_response_ms": random.randint(80, 350),
        "error_rate_pct": round(random.uniform(0.01, 0.5), 3),
        "uptime_seconds": random.randint(86400, 2592000),
    }
