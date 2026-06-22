from sqlalchemy import Column, String, Float, Boolean, DateTime, Text, Integer
from sqlalchemy.dialects.postgresql import UUID, JSONB
from datetime import datetime, timezone
import uuid
from app.db.base import Base


class AgentMemory(Base):
    __tablename__ = "agent_memory"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    agent_id = Column(String(100), nullable=False, index=True)
    memory_type = Column(String(50))  # episodic/semantic/procedural
    content = Column(Text)
    context = Column(JSONB, default={})
    importance = Column(Float, default=0.5)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    expires_at = Column(DateTime(timezone=True))


class AgentExecution(Base):
    __tablename__ = "agent_execution"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    agent_id = Column(String(100), nullable=False, index=True)
    session_id = Column(String(100), index=True)
    status = Column(String(20), default="pending")  # pending/running/completed/failed
    task = Column(Text)
    result = Column(JSONB)
    reasoning_chain = Column(JSONB, default=[])
    tools_called = Column(JSONB, default=[])
    agents_invoked = Column(JSONB, default=[])
    confidence = Column(Float)
    latency_ms = Column(Integer)
    tokens_used = Column(Integer)
    error = Column(Text)
    started_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime(timezone=True))
