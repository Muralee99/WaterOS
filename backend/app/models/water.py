from sqlalchemy import Column, String, Float, Boolean, DateTime, ForeignKey, Text, Integer, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB
from datetime import datetime, timezone
import uuid
import enum
from app.db.base import Base


class SensorType(str, enum.Enum):
    WATER_LEVEL = "water_level"
    FLOW_RATE = "flow_rate"
    PRESSURE = "pressure"
    PH = "ph"
    TURBIDITY = "turbidity"
    CHLORINE = "chlorine"
    TEMPERATURE = "temperature"
    CONDUCTIVITY = "conductivity"


class Reservoir(Base):
    __tablename__ = "reservoirs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(200), nullable=False)
    location = Column(String(255))
    latitude = Column(Float)
    longitude = Column(Float)
    capacity_mcm = Column(Float)  # Million Cubic Meters
    current_level_mcm = Column(Float, default=0)
    inflow_rate = Column(Float, default=0)  # m³/s
    outflow_rate = Column(Float, default=0)  # m³/s
    spillway_level = Column(Float)
    dead_storage = Column(Float)
    is_active = Column(Boolean, default=True)
    metadata_ = Column("metadata", JSONB, default={})
    last_updated = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    @property
    def fill_percentage(self) -> float:
        if self.capacity_mcm and self.capacity_mcm > 0:
            return (self.current_level_mcm / self.capacity_mcm) * 100
        return 0


class River(Base):
    __tablename__ = "rivers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(200), nullable=False)
    basin = Column(String(200))
    length_km = Column(Float)
    current_level_m = Column(Float, default=0)
    normal_level_m = Column(Float)
    flood_level_m = Column(Float)
    flow_velocity = Column(Float, default=0)  # m/s
    discharge_cumecs = Column(Float, default=0)  # m³/s
    flood_risk = Column(String(20), default="low")  # low/medium/high/critical
    latitude = Column(Float)
    longitude = Column(Float)
    is_active = Column(Boolean, default=True)
    last_updated = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class Sensor(Base):
    __tablename__ = "sensors"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(200), nullable=False)
    sensor_type = Column(String(50))
    location = Column(String(255))
    latitude = Column(Float)
    longitude = Column(Float)
    current_value = Column(Float)
    unit = Column(String(20))
    min_threshold = Column(Float)
    max_threshold = Column(Float)
    is_active = Column(Boolean, default=True)
    battery_level = Column(Float, default=100)
    last_reading = Column(DateTime(timezone=True))
    metadata_ = Column("metadata", JSONB, default={})


class WaterQuality(Base):
    __tablename__ = "water_quality"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    location = Column(String(255))
    latitude = Column(Float)
    longitude = Column(Float)
    ph = Column(Float)
    turbidity_ntu = Column(Float)
    chlorine_mg_l = Column(Float)
    dissolved_oxygen = Column(Float)
    conductivity = Column(Float)
    temperature_c = Column(Float)
    heavy_metals = Column(JSONB, default={})
    safety_score = Column(Float, default=100)
    status = Column(String(20), default="safe")  # safe/warning/danger
    measured_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class Groundwater(Base):
    __tablename__ = "groundwater"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    location = Column(String(255))
    latitude = Column(Float)
    longitude = Column(Float)
    depth_m = Column(Float)
    level_m = Column(Float)
    recharge_rate = Column(Float)
    extraction_rate = Column(Float)
    quality_score = Column(Float)
    depletion_risk = Column(String(20), default="low")
    measured_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
