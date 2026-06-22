from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Dict, Any
from app.api.deps import get_current_user
from app.services.simulation_service import run_simulation, get_digital_twin

router = APIRouter(prefix="/simulation", tags=["Simulation"])


class SimulationRequest(BaseModel):
    scenario_type: str  # heavy_rain/dam_failure/drought/contamination
    parameters: Dict[str, Any] = {}


@router.get("/digital-twin")
async def digital_twin(user=Depends(get_current_user)):
    return await get_digital_twin()


@router.post("/run")
async def simulate(request: SimulationRequest, user=Depends(get_current_user)):
    return await run_simulation(request.scenario_type, request.parameters)
