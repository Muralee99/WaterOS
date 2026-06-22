from fastapi import APIRouter, Depends
from app.api.deps import get_current_user
from app.services.data_service import get_dashboard_data, get_statistics

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("")
async def get_dashboard(user=Depends(get_current_user)):
    return await get_dashboard_data()


@router.get("/statistics")
async def get_stats(user=Depends(get_current_user)):
    return await get_statistics()
