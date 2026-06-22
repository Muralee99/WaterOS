from app.agents.base_agent import BaseWaterAgent, AgentResult
from app.agents.rainfall_agent import RainfallAgent
from app.agents.reservoir_agent import ReservoirAgent
from app.agents.flood_agent import FloodAgent
from app.agents.water_quality_agent import WaterQualityAgent
from app.agents.leak_detection_agent import LeakDetectionAgent
from app.agents.emergency_agent import EmergencyAgent
from app.agents.decision_agent import DecisionAgent
from app.agents.global_coordinator_agent import GlobalCoordinatorAgent
from app.agents.country_agent import CountryAgent
from app.agents.climate_agent import ClimateAgent
from app.agents.groundwater_agent import GroundwaterAgent

AGENT_REGISTRY = {
    "rainfall_agent": RainfallAgent,
    "reservoir_agent": ReservoirAgent,
    "flood_agent": FloodAgent,
    "water_quality_agent": WaterQualityAgent,
    "leak_detection_agent": LeakDetectionAgent,
    "emergency_agent": EmergencyAgent,
    "decision_agent": DecisionAgent,
    "global_coordinator_agent": GlobalCoordinatorAgent,
    "country_agent": CountryAgent,
    "climate_agent": ClimateAgent,
    "groundwater_agent": GroundwaterAgent,
}

AGENT_METADATA = {
    "rainfall_agent": {
        "name": "Rainfall Agent",
        "icon": "cloud-rain",
        "color": "#3B82F6",
        "category": "environmental",
    },
    "reservoir_agent": {
        "name": "Reservoir Agent",
        "icon": "database",
        "color": "#06B6D4",
        "category": "infrastructure",
    },
    "flood_agent": {
        "name": "Flood Agent",
        "icon": "waves",
        "color": "#EF4444",
        "category": "emergency",
    },
    "water_quality_agent": {
        "name": "Water Quality Agent",
        "icon": "flask",
        "color": "#10B981",
        "category": "quality",
    },
    "leak_detection_agent": {
        "name": "Leak Detection Agent",
        "icon": "droplets",
        "color": "#F59E0B",
        "category": "infrastructure",
    },
    "emergency_agent": {
        "name": "Emergency Agent",
        "icon": "siren",
        "color": "#DC2626",
        "category": "emergency",
    },
    "decision_agent": {
        "name": "Decision Agent",
        "icon": "brain",
        "color": "#8B5CF6",
        "category": "orchestrator",
    },
    "global_coordinator_agent": {
        "name": "Global Coordinator Agent",
        "icon": "globe",
        "color": "#6366F1",
        "category": "orchestrator",
    },
    "country_agent": {
        "name": "Country Agent",
        "icon": "flag",
        "color": "#0EA5E9",
        "category": "geographic",
    },
    "climate_agent": {
        "name": "Climate Agent",
        "icon": "thermometer",
        "color": "#F97316",
        "category": "environmental",
    },
    "groundwater_agent": {
        "name": "Groundwater Agent",
        "icon": "layers",
        "color": "#84CC16",
        "category": "environmental",
    },
}
