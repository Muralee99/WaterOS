from sqlalchemy import Column, String, Float, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from datetime import datetime, timezone
import uuid
from app.db.base import Base


class Simulation(Base):
    __tablename__ = "simulations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255))
    scenario_type = Column(String(50))  # heavy_rain/dam_failure/drought/contamination
    parameters = Column(JSONB, default={})
    results = Column(JSONB, default={})
    impact_assessment = Column(JSONB, default={})
    recommendations = Column(JSONB, default=[])
    status = Column(String(20), default="pending")
    created_by = Column(String(255))
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime(timezone=True))
