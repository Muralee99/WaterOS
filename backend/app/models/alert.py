from sqlalchemy import Column, String, Float, Boolean, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from datetime import datetime, timezone
import uuid
from app.db.base import Base


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    alert_type = Column(String(50))  # flood/drought/leak/quality/emergency
    severity = Column(String(20))  # info/warning/critical/emergency
    title = Column(String(500))
    message = Column(Text)
    location = Column(String(255))
    latitude = Column(Float)
    longitude = Column(Float)
    is_active = Column(Boolean, default=True)
    is_acknowledged = Column(Boolean, default=False)
    acknowledged_by = Column(String(255))
    confidence = Column(Float)
    evidence = Column(JSONB, default={})
    recommended_actions = Column(JSONB, default=[])
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    expires_at = Column(DateTime(timezone=True))
    resolved_at = Column(DateTime(timezone=True))
