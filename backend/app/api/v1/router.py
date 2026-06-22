from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth, dashboard, reservoirs, agents, water_quality,
    alerts, forecast, simulation, mcp_api,
    global_api, countries, states, cities, rivers,
    pipelines, sensors, weather, climate, graph, reports,
)

api_router = APIRouter(prefix="/api/v1")

# Existing endpoints
api_router.include_router(auth.router)
api_router.include_router(dashboard.router)
api_router.include_router(reservoirs.router)
api_router.include_router(agents.router)
api_router.include_router(water_quality.router)
api_router.include_router(alerts.router)
api_router.include_router(forecast.router)
api_router.include_router(simulation.router)
api_router.include_router(mcp_api.router)

# New expanded endpoints
api_router.include_router(global_api.router)
api_router.include_router(countries.router)
api_router.include_router(states.router)
api_router.include_router(cities.router)
api_router.include_router(rivers.router)
api_router.include_router(pipelines.router)
api_router.include_router(sensors.router)
api_router.include_router(weather.router)
api_router.include_router(climate.router)
api_router.include_router(graph.router)
api_router.include_router(reports.router)
