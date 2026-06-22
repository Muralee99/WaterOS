from fastapi import APIRouter, Depends
from app.api.deps import get_current_user
from app.services.data_service import get_sample_water_quality

router = APIRouter(prefix="/quality", tags=["Water Quality"])


@router.get("")
async def get_water_quality(user=Depends(get_current_user)):
    return await get_sample_water_quality()
