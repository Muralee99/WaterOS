from sqlalchemy import Column, String, Float, DateTime
from sqlalchemy.dialects.postgresql import UUID, JSONB
from datetime import datetime, timezone
import uuid
from app.db.base import Base


class WeatherData(Base):
    __tablename__ = "weather"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    location = Column(String(255))
    latitude = Column(Float)
    longitude = Column(Float)
    temperature_c = Column(Float)
    humidity_pct = Column(Float)
    rainfall_mm = Column(Float, default=0)
    wind_speed_kmh = Column(Float)
    pressure_hpa = Column(Float)
    cloud_cover_pct = Column(Float)
    visibility_km = Column(Float)
    uv_index = Column(Float)
    forecast = Column(JSONB, default=[])  # 7-day forecast
    recorded_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
