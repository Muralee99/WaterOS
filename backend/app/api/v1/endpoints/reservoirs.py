from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.base import get_db
from app.models.water import Reservoir
from app.api.deps import get_current_user
from app.services.data_service import get_sample_reservoirs

router = APIRouter(prefix="/reservoirs", tags=["Reservoirs"])


@router.get("")
async def list_reservoirs(db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    result = await db.execute(select(Reservoir))
    reservoirs = result.scalars().all()
    if not reservoirs:
        return await get_sample_reservoirs()
    return [
        {
            "id": str(r.id),
            "name": r.name,
            "location": r.location,
            "latitude": r.latitude,
            "longitude": r.longitude,
            "capacity_mcm": r.capacity_mcm,
            "current_level_mcm": r.current_level_mcm,
            "fill_percentage": r.fill_percentage,
            "inflow_rate": r.inflow_rate,
            "outflow_rate": r.outflow_rate,
            "last_updated": r.last_updated.isoformat() if r.last_updated else None,
        }
        for r in reservoirs
    ]


@router.get("/{reservoir_id}")
async def get_reservoir(reservoir_id: str, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    result = await db.execute(select(Reservoir).where(Reservoir.id == reservoir_id))
    reservoir = result.scalar_one_or_none()
    if not reservoir:
        raise HTTPException(status_code=404, detail="Reservoir not found")
    return reservoir
