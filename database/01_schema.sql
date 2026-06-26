-- =============================================================================
-- WaterOS Database Schema
-- PostgreSQL 16  |  Run once; all statements are idempotent (IF NOT EXISTS)
-- =============================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pg_trgm";    -- trigram search on names

-- -----------------------------------------------------------------------------
-- Auth / Users
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS roles (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(50)  UNIQUE NOT NULL,
    description TEXT,
    permissions TEXT,
    created_at  TIMESTAMPTZ  DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) UNIQUE NOT NULL,
    username        VARCHAR(100) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name       VARCHAR(255),
    is_active       BOOLEAN  DEFAULT TRUE,
    is_superuser    BOOLEAN  DEFAULT FALSE,
    api_key         VARCHAR(64) UNIQUE,
    last_login      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS user_roles (
    user_id UUID REFERENCES users(id)  ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id)  ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- -----------------------------------------------------------------------------
-- Water Infrastructure
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reservoirs (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name             VARCHAR(200) NOT NULL,
    country          VARCHAR(100),
    state            VARCHAR(100),
    city             VARCHAR(100),
    location         VARCHAR(255),
    latitude         DOUBLE PRECISION,
    longitude        DOUBLE PRECISION,
    capacity_mcm     DOUBLE PRECISION,           -- Million Cubic Metres
    current_level_mcm DOUBLE PRECISION DEFAULT 0,
    inflow_rate      DOUBLE PRECISION DEFAULT 0, -- m³/s
    outflow_rate     DOUBLE PRECISION DEFAULT 0, -- m³/s
    spillway_level   DOUBLE PRECISION,
    dead_storage     DOUBLE PRECISION,
    is_active        BOOLEAN  DEFAULT TRUE,
    metadata         JSONB    DEFAULT '{}',
    last_updated     TIMESTAMPTZ DEFAULT NOW(),
    created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reservoirs_country  ON reservoirs(country);
CREATE INDEX IF NOT EXISTS idx_reservoirs_name_trgm ON reservoirs USING gin(name gin_trgm_ops);

CREATE TABLE IF NOT EXISTS rivers (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name             VARCHAR(200) NOT NULL,
    country          VARCHAR(100),
    state            VARCHAR(100),
    basin            VARCHAR(200),
    length_km        DOUBLE PRECISION,
    discharge_m3s    DOUBLE PRECISION DEFAULT 0,
    current_level_m  DOUBLE PRECISION DEFAULT 0,
    normal_level_m   DOUBLE PRECISION,
    flood_level_m    DOUBLE PRECISION,
    flow_velocity    DOUBLE PRECISION DEFAULT 0,  -- m/s
    discharge_cumecs DOUBLE PRECISION DEFAULT 0,  -- m³/s (alias)
    flood_risk       VARCHAR(20) DEFAULT 'low',   -- low/medium/high/critical
    basin_area_km2   DOUBLE PRECISION,
    ecosystem_health DOUBLE PRECISION DEFAULT 80, -- 0-100 score
    latitude         DOUBLE PRECISION,
    longitude        DOUBLE PRECISION,
    is_active        BOOLEAN  DEFAULT TRUE,
    last_updated     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rivers_country ON rivers(country);
CREATE INDEX IF NOT EXISTS idx_rivers_flood_risk ON rivers(flood_risk);

CREATE TABLE IF NOT EXISTS sensors (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name           VARCHAR(200) NOT NULL,
    sensor_type    VARCHAR(50),   -- water_level/flow_rate/pressure/ph/turbidity/chlorine/temperature/conductivity
    location       VARCHAR(255),
    country        VARCHAR(100),
    latitude       DOUBLE PRECISION,
    longitude      DOUBLE PRECISION,
    current_value  DOUBLE PRECISION,
    unit           VARCHAR(20),
    min_threshold  DOUBLE PRECISION,
    max_threshold  DOUBLE PRECISION,
    is_active      BOOLEAN  DEFAULT TRUE,
    battery_level  DOUBLE PRECISION DEFAULT 100,
    last_reading   TIMESTAMPTZ,
    metadata       JSONB    DEFAULT '{}'   -- stores pipeline_id, reservoir_id, etc.
);

CREATE INDEX IF NOT EXISTS idx_sensors_type     ON sensors(sensor_type);
CREATE INDEX IF NOT EXISTS idx_sensors_country  ON sensors(country);
CREATE INDEX IF NOT EXISTS idx_sensors_location ON sensors USING gin(metadata);

-- -----------------------------------------------------------------------------
-- Water Quality
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS water_quality (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location        VARCHAR(255),
    country         VARCHAR(100),
    city            VARCHAR(100),
    latitude        DOUBLE PRECISION,
    longitude       DOUBLE PRECISION,
    ph              DOUBLE PRECISION,
    turbidity_ntu   DOUBLE PRECISION,
    chlorine_mg_l   DOUBLE PRECISION,
    dissolved_oxygen DOUBLE PRECISION,
    conductivity    DOUBLE PRECISION,
    temperature_c   DOUBLE PRECISION,
    heavy_metals    JSONB  DEFAULT '{}',   -- {lead_ppb, arsenic_ppb, mercury_ppb}
    safety_score    DOUBLE PRECISION DEFAULT 100,
    status          VARCHAR(20) DEFAULT 'safe',  -- safe/warning/danger
    sampling_zone   VARCHAR(255),
    population_at_risk VARCHAR(100),
    measured_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wq_country ON water_quality(country);
CREATE INDEX IF NOT EXISTS idx_wq_status  ON water_quality(status);

-- -----------------------------------------------------------------------------
-- Groundwater
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS groundwater (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location        VARCHAR(255),
    country         VARCHAR(100),
    state           VARCHAR(100),
    latitude        DOUBLE PRECISION,
    longitude       DOUBLE PRECISION,
    depth_m         DOUBLE PRECISION,          -- current depth to water table
    level_m         DOUBLE PRECISION,          -- absolute elevation of water table
    recharge_rate   DOUBLE PRECISION,          -- mm/year
    extraction_rate DOUBLE PRECISION,          -- mm/year
    quality_score   DOUBLE PRECISION,
    depletion_risk  VARCHAR(20) DEFAULT 'low', -- low/medium/high/critical
    measured_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gw_country ON groundwater(country);

-- -----------------------------------------------------------------------------
-- Alerts
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS alerts (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_type          VARCHAR(50),  -- flood/drought/leak/quality/emergency
    severity            VARCHAR(20),  -- info/warning/high/critical/emergency
    title               VARCHAR(500),
    message             TEXT,
    location            VARCHAR(255),
    country             VARCHAR(100),
    latitude            DOUBLE PRECISION,
    longitude           DOUBLE PRECISION,
    is_active           BOOLEAN  DEFAULT TRUE,
    is_acknowledged     BOOLEAN  DEFAULT FALSE,
    acknowledged_by     VARCHAR(255),
    confidence          DOUBLE PRECISION,
    evidence            JSONB    DEFAULT '{}',
    recommended_actions JSONB    DEFAULT '[]',
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    expires_at          TIMESTAMPTZ,
    resolved_at         TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_alerts_type     ON alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_alerts_active   ON alerts(is_active);
CREATE INDEX IF NOT EXISTS idx_alerts_country  ON alerts(country);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts(severity);

-- -----------------------------------------------------------------------------
-- Weather
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS weather (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location        VARCHAR(255),
    country         VARCHAR(100),
    latitude        DOUBLE PRECISION,
    longitude       DOUBLE PRECISION,
    temperature_c   DOUBLE PRECISION,
    humidity_pct    DOUBLE PRECISION,
    rainfall_mm     DOUBLE PRECISION DEFAULT 0,
    wind_speed_kmh  DOUBLE PRECISION,
    pressure_hpa    DOUBLE PRECISION,
    cloud_cover_pct DOUBLE PRECISION,
    visibility_km   DOUBLE PRECISION,
    uv_index        DOUBLE PRECISION,
    forecast        JSONB DEFAULT '[]',  -- 7-day forecast array
    recorded_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_weather_location ON weather(location);
CREATE INDEX IF NOT EXISTS idx_weather_country  ON weather(country);

-- -----------------------------------------------------------------------------
-- Agent Infrastructure
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS agent_memory (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id     VARCHAR(100) NOT NULL,
    memory_type  VARCHAR(50),   -- episodic/semantic/procedural
    content      TEXT,
    context      JSONB  DEFAULT '{}',
    importance   DOUBLE PRECISION DEFAULT 0.5,
    created_at   TIMESTAMPTZ DEFAULT NOW(),
    expires_at   TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_agentmem_agent ON agent_memory(agent_id);

CREATE TABLE IF NOT EXISTS agent_execution (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id       VARCHAR(100) NOT NULL,
    session_id     VARCHAR(100),
    status         VARCHAR(20)  DEFAULT 'pending',  -- pending/running/completed/failed
    task           TEXT,
    result         JSONB,
    reasoning_chain JSONB DEFAULT '[]',
    tools_called   JSONB  DEFAULT '[]',
    agents_invoked JSONB  DEFAULT '[]',
    confidence     DOUBLE PRECISION,
    latency_ms     INTEGER,
    tokens_used    INTEGER,
    error          TEXT,
    started_at     TIMESTAMPTZ DEFAULT NOW(),
    completed_at   TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_agentexec_agent   ON agent_execution(agent_id);
CREATE INDEX IF NOT EXISTS idx_agentexec_session ON agent_execution(session_id);
CREATE INDEX IF NOT EXISTS idx_agentexec_status  ON agent_execution(status);

-- -----------------------------------------------------------------------------
-- Simulations
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS simulations (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name              VARCHAR(255),
    scenario_type     VARCHAR(50),   -- heavy_rain/dam_failure/drought/contamination
    parameters        JSONB  DEFAULT '{}',
    results           JSONB  DEFAULT '{}',
    impact_assessment JSONB  DEFAULT '{}',
    recommendations   JSONB  DEFAULT '[]',
    status            VARCHAR(20) DEFAULT 'pending',
    created_by        VARCHAR(255),
    created_at        TIMESTAMPTZ DEFAULT NOW(),
    completed_at      TIMESTAMPTZ
);

-- =============================================================================
-- Views
-- =============================================================================

CREATE OR REPLACE VIEW v_reservoir_status AS
SELECT
    id, name, country, state, city, location, latitude, longitude,
    capacity_mcm,
    current_level_mcm,
    CASE WHEN capacity_mcm > 0
         THEN ROUND((current_level_mcm / capacity_mcm * 100)::NUMERIC, 2)
         ELSE 0 END AS fill_pct,
    inflow_rate,
    outflow_rate,
    inflow_rate - outflow_rate AS net_flow,
    CASE
        WHEN (current_level_mcm / NULLIF(capacity_mcm,0) * 100) > 92 THEN 'critical'
        WHEN (current_level_mcm / NULLIF(capacity_mcm,0) * 100) > 85 THEN 'high'
        WHEN (current_level_mcm / NULLIF(capacity_mcm,0) * 100) > 72 THEN 'medium'
        ELSE 'low'
    END AS overflow_risk,
    CASE
        WHEN (current_level_mcm / NULLIF(capacity_mcm,0) * 100) < 20 THEN 'critical'
        WHEN (current_level_mcm / NULLIF(capacity_mcm,0) * 100) < 35 THEN 'high'
        WHEN (current_level_mcm / NULLIF(capacity_mcm,0) * 100) < 50 THEN 'medium'
        ELSE 'low'
    END AS shortage_risk,
    is_active,
    last_updated
FROM reservoirs;

CREATE OR REPLACE VIEW v_active_alerts AS
SELECT * FROM alerts
WHERE is_active = TRUE AND (expires_at IS NULL OR expires_at > NOW())
ORDER BY
    CASE severity
        WHEN 'emergency' THEN 1
        WHEN 'critical'  THEN 2
        WHEN 'high'      THEN 3
        WHEN 'warning'   THEN 4
        ELSE 5
    END,
    created_at DESC;

CREATE OR REPLACE VIEW v_river_flood_status AS
SELECT
    id, name, country, state, basin,
    current_level_m,
    flood_level_m,
    ROUND((current_level_m - flood_level_m)::NUMERIC, 2) AS margin_m,
    flood_risk,
    discharge_m3s,
    CASE
        WHEN current_level_m >= flood_level_m THEN 'EXCEEDED'
        WHEN current_level_m >= flood_level_m * 0.90 THEN 'NEAR THRESHOLD'
        ELSE 'NORMAL'
    END AS threshold_status,
    is_active,
    last_updated
FROM rivers
WHERE is_active = TRUE;
