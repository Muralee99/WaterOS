from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.api.deps import get_current_user
from app.services.data_service import get_active_alerts, create_alert

router = APIRouter(prefix="/alerts", tags=["Alerts"])


class AlertRequest(BaseModel):
    alert_type: str
    severity: str
    title: str
    message: str
    location: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None


@router.get("")
async def list_alerts(user=Depends(get_current_user)):
    return await get_active_alerts()


@router.post("")
async def post_alert(request: AlertRequest, user=Depends(get_current_user)):
    return await create_alert(request.dict())
