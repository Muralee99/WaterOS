from fastapi import APIRouter, Depends, Query
from app.api.deps import get_current_user
from app.services.data_service import get_forecast_data

router = APIRouter(prefix="/forecast", tags=["Forecast"])


@router.get("")
async def get_forecast(
    location: str = Query(default="Global"),
    days: int = Query(default=7, ge=1, le=30),
    user=Depends(get_current_user),
):
    return await get_forecast_data(location, days)
