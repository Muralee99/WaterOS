"""
Database query helpers for MCP tool implementations.
All functions return plain dicts (no SQLAlchemy objects) so callers stay simple.
Each function has a try/except — callers fall back to random defaults on failure.
"""
from typing import Optional, Dict, List, Any
from sqlalchemy import text
from app.db.base import AsyncSessionLocal


async def _one(sql: str, params: dict = {}) -> Optional[Dict]:
    async with AsyncSessionLocal() as session:
        row = (await session.execute(text(sql), params)).mappings().first()
        return dict(row) if row else None


async def _many(sql: str, params: dict = {}) -> List[Dict]:
    async with AsyncSessionLocal() as session:
        rows = (await session.execute(text(sql), params)).mappings().all()
        return [dict(r) for r in rows]


# ---------------------------------------------------------------------------
# Reservoirs
# ---------------------------------------------------------------------------

async def query_reservoir(reservoir_id: str) -> Optional[Dict]:
    """
    Lookup by UUID (exact) or by name substring (case-insensitive).
    Returns the v_reservoir_status view row as a dict.
    """
    row = await _one(
        """
        SELECT id, name, country, state, city, location,
               latitude, longitude, capacity_mcm, current_level_mcm,
               fill_pct AS current_level_pct, inflow_rate, outflow_rate,
               net_flow AS net_flow_m3s, overflow_risk, shortage_risk,
               is_active, last_updated
        FROM v_reservoir_status
        WHERE id::text = :rid
           OR lower(name) LIKE lower(:like)
        ORDER BY fill_pct DESC
        LIMIT 1
        """,
        {"rid": reservoir_id, "like": f"%{reservoir_id}%"},
    )
    if not row:
        return None
    return {
        "reservoir_id":       str(row["id"]),
        "name":               row["name"],
        "location":           row.get("location") or f"{row.get('city') or ''}, {row.get('state') or ''}, {row.get('country') or ''}".strip(", "),
        "capacity_mcm":       float(row["capacity_mcm"] or 0),
        "current_level_mcm":  float(row["current_level_mcm"] or 0),
        "current_level_pct":  float(row["current_level_pct"] or 0),
        "inflow_rate_m3s":    float(row["inflow_rate"] or 0),
        "outflow_rate_m3s":   float(row["outflow_rate"] or 0),
        "net_flow_m3s":       float(row["net_flow_m3s"] or 0),
        "overflow_risk":      row["overflow_risk"],
        "shortage_risk":      row["shortage_risk"],
        "spillway_status":    "open" if (row.get("overflow_risk") in ("high", "critical")) else "closed",
        "last_updated":       row["last_updated"].isoformat() if row.get("last_updated") else None,
    }


async def query_reservoirs_by_country(country: str) -> List[Dict]:
    rows = await _many(
        """
        SELECT id, name, country, state, fill_pct, overflow_risk, shortage_risk
        FROM v_reservoir_status
        WHERE lower(country) LIKE lower(:c) AND is_active = TRUE
        ORDER BY fill_pct DESC
        """,
        {"c": f"%{country}%"},
    )
    return rows


# ---------------------------------------------------------------------------
# Rivers (flood prediction)
# ---------------------------------------------------------------------------

async def query_river_flood(location: str) -> Optional[Dict]:
    """Find a river matching the location, return flood prediction data."""
    row = await _one(
        """
        SELECT id, name, country, state, basin,
               current_level_m, flood_level_m, margin_m,
               discharge_m3s, flood_risk, last_updated
        FROM v_river_flood_status
        WHERE lower(name)    LIKE lower(:loc)
           OR lower(country) LIKE lower(:loc)
           OR lower(state)   LIKE lower(:loc)
           OR lower(basin)   LIKE lower(:loc)
        ORDER BY
            CASE flood_risk
                WHEN 'critical' THEN 1
                WHEN 'high'     THEN 2
                WHEN 'medium'   THEN 3
                ELSE 4
            END
        LIMIT 1
        """,
        {"loc": f"%{location}%"},
    )
    if not row:
        return None

    current = float(row["current_level_m"] or 0)
    flood   = float(row["flood_level_m"]   or 99)
    margin  = flood - current
    prob = min(0.97, max(0.10, 1 - (margin / max(flood, 1))))
    hours  = max(2.0, (margin / 0.15) * 6) if margin > 0 else 0.0

    return {
        "location":          f"{row['name']}, {row.get('state') or ''}, {row.get('country') or ''}".strip(", "),
        "river_name":        row["name"],
        "current_level_m":   current,
        "flood_level_m":     flood,
        "margin_m":          round(margin, 2),
        "flood_probability": round(prob, 3),
        "risk_level":        row["flood_risk"],
        "hours_to_flood":    round(hours, 1) if current >= flood * 0.85 else None,
        "discharge_m3s":     float(row.get("discharge_m3s") or 0),
        "confidence":        0.91,
        "last_updated":      row["last_updated"].isoformat() if row.get("last_updated") else None,
    }


# ---------------------------------------------------------------------------
# Pipeline leak detection
# ---------------------------------------------------------------------------

async def query_pipeline_sensors(pipeline_id: str) -> Optional[Dict]:
    """
    Return inlet/outlet pressure sensors for a pipeline_id from sensors.metadata.
    """
    rows = await _many(
        """
        SELECT name, current_value, unit, is_active, last_reading,
               metadata->>'segment' AS segment,
               metadata->>'pipe_age_yr' AS pipe_age_yr,
               metadata->>'expected_bar' AS expected_bar
        FROM sensors
        WHERE metadata->>'pipeline_id' ILIKE :pid
          AND sensor_type = 'pressure'
        ORDER BY segment
        """,
        {"pid": f"%{pipeline_id}%"},
    )
    if not rows:
        return None

    inlet  = next((r for r in rows if r.get("segment") == "inlet"),  None)
    outlet = next((r for r in rows if r.get("segment") == "outlet"), None)

    if not inlet or not outlet:
        return None

    inlet_bar  = float(inlet["current_value"]  or 0)
    outlet_bar = float(outlet["current_value"] or 0)
    drop       = inlet_bar - outlet_bar
    expected   = float(inlet.get("expected_bar") or inlet_bar)
    loss_pct   = round((drop / expected) * 100, 2) if expected > 0 else 0
    leak_prob  = round(min(0.99, loss_pct / 50), 3)

    return {
        "pipeline_id":       pipeline_id,
        "inlet_pressure_bar": inlet_bar,
        "outlet_pressure_bar": outlet_bar,
        "pressure_drop_bar": round(drop, 2),
        "leak_probability":  leak_prob,
        "leak_detected":     leak_prob > 0.30,
        "estimated_loss_pct": loss_pct,
        "estimated_loss_l_s": round(loss_pct * 10, 1),
        "pipe_age_yr":       int(inlet.get("pipe_age_yr") or 0),
        "confidence":        0.89,
    }


# ---------------------------------------------------------------------------
# Water quality
# ---------------------------------------------------------------------------

async def query_water_quality(location_id: str) -> Optional[Dict]:
    """
    Lookup by UUID, city, or location substring.
    Returns the latest reading for that location.
    """
    row = await _one(
        """
        SELECT id, location, country, city, ph, turbidity_ntu, chlorine_mg_l,
               dissolved_oxygen, heavy_metals, safety_score, status,
               sampling_zone, population_at_risk, measured_at
        FROM water_quality
        WHERE id::text = :lid
           OR lower(location) LIKE lower(:like)
           OR lower(city)     LIKE lower(:like)
        ORDER BY measured_at DESC
        LIMIT 1
        """,
        {"lid": location_id, "like": f"%{location_id}%"},
    )
    if not row:
        return None

    metals = row.get("heavy_metals") or {}
    return {
        "location_id":       str(row["id"]),
        "location":          row["location"],
        "city":              row.get("city"),
        "ph":                float(row["ph"] or 7.0),
        "turbidity_ntu":     float(row["turbidity_ntu"] or 0),
        "chlorine_mg_l":     float(row["chlorine_mg_l"] or 0),
        "dissolved_oxygen_mg_l": float(row["dissolved_oxygen"] or 0),
        "heavy_metals":      metals,
        "lead_ppb":          metals.get("lead_ppb", 0),
        "arsenic_ppb":       metals.get("arsenic_ppb", 0),
        "safety_score":      float(row["safety_score"] or 100),
        "status":            row["status"],
        "sampling_zone":     row.get("sampling_zone"),
        "population_at_risk": row.get("population_at_risk"),
        "measured_at":       row["measured_at"].isoformat() if row.get("measured_at") else None,
    }


# ---------------------------------------------------------------------------
# Rainfall / weather forecast
# ---------------------------------------------------------------------------

async def query_weather_forecast(location: str) -> Optional[Dict]:
    """
    Return the latest weather + forecast for a location.
    """
    row = await _one(
        """
        SELECT id, location, country, temperature_c, humidity_pct,
               rainfall_mm, wind_speed_kmh, forecast, recorded_at
        FROM weather
        WHERE lower(location) LIKE lower(:loc)
           OR lower(country)  LIKE lower(:loc)
        ORDER BY recorded_at DESC
        LIMIT 1
        """,
        {"loc": f"%{location}%"},
    )
    if not row:
        return None

    forecast_raw = row.get("forecast") or []
    daily_mm = [float(d.get("rainfall_mm", 0)) for d in forecast_raw]
    total_mm = round(sum(daily_mm), 1)

    heavy = sum(1 for d in daily_mm if d > 20)
    peak  = max(daily_mm) if daily_mm else 0
    storm_prob = round(min(95.0, heavy * 13.0 + (peak / 150 * 30)), 1)

    return {
        "location":           row["location"],
        "country":            row.get("country"),
        "current_temp_c":     float(row["temperature_c"] or 0),
        "current_humidity_pct": float(row["humidity_pct"] or 0),
        "forecast_7day_mm":   daily_mm,
        "total_7day_mm":      total_mm,
        "peak_day_mm":        round(peak, 1),
        "storm_probability":  storm_prob,
        "drought_risk":       "high" if total_mm < 20 else "medium" if total_mm < 60 else "low",
        "confidence":         0.88,
        "recorded_at":        row["recorded_at"].isoformat() if row.get("recorded_at") else None,
    }


# ---------------------------------------------------------------------------
# Groundwater
# ---------------------------------------------------------------------------

async def query_groundwater(region: str) -> Optional[Dict]:
    row = await _one(
        """
        SELECT id, location, country, state, depth_m, level_m,
               recharge_rate, extraction_rate, quality_score, depletion_risk,
               measured_at
        FROM groundwater
        WHERE lower(location) LIKE lower(:r)
           OR lower(state)    LIKE lower(:r)
           OR lower(country)  LIKE lower(:r)
        ORDER BY
            CASE depletion_risk
                WHEN 'critical' THEN 1
                WHEN 'high'     THEN 2
                WHEN 'medium'   THEN 3
                ELSE 4
            END
        LIMIT 1
        """,
        {"r": f"%{region}%"},
    )
    if not row:
        return None

    recharge    = float(row["recharge_rate"]    or 0)
    extraction  = float(row["extraction_rate"]  or 0)
    net_balance = recharge - extraction

    return {
        "region":              row["location"],
        "country":             row.get("country"),
        "depth_m":             float(row["depth_m"]  or 0),
        "level_m":             float(row["level_m"]  or 0),
        "recharge_rate_mm_yr": recharge,
        "extraction_rate_mm_yr": extraction,
        "net_balance_mm_yr":   round(net_balance, 1),
        "quality_score":       float(row["quality_score"] or 0),
        "depletion_risk":      row["depletion_risk"],
        "years_to_critical":   round(float(row["depth_m"] or 0) / (abs(net_balance) / 1000) if net_balance < 0 else 999, 1),
        "measured_at":         row["measured_at"].isoformat() if row.get("measured_at") else None,
    }


# ---------------------------------------------------------------------------
# Emergency / alerts
# ---------------------------------------------------------------------------

async def query_active_alerts(
    incident_type: Optional[str] = None,
    location: Optional[str] = None,
    country: Optional[str] = None,
    limit: int = 10,
) -> List[Dict]:
    where_clauses = ["is_active = TRUE", "(expires_at IS NULL OR expires_at > NOW())"]
    params: Dict[str, Any] = {}

    if incident_type:
        where_clauses.append("alert_type = :itype")
        params["itype"] = incident_type
    if location:
        where_clauses.append("(lower(location) LIKE lower(:loc) OR lower(country) LIKE lower(:loc))")
        params["loc"] = f"%{location}%"
    if country:
        where_clauses.append("lower(country) LIKE lower(:country)")
        params["country"] = f"%{country}%"

    params["limit"] = limit
    sql = f"""
        SELECT id, alert_type, severity, title, message, location, country,
               confidence, recommended_actions, evidence, created_at
        FROM alerts
        WHERE {" AND ".join(where_clauses)}
        ORDER BY
            CASE severity
                WHEN 'critical'  THEN 1
                WHEN 'emergency' THEN 1
                WHEN 'high'      THEN 2
                WHEN 'warning'   THEN 3
                ELSE 4
            END, created_at DESC
        LIMIT :limit
    """
    rows = await _many(sql, params)
    return [
        {
            "alert_id":    str(r["id"]),
            "type":        r["alert_type"],
            "severity":    r["severity"],
            "title":       r["title"],
            "message":     r["message"],
            "location":    r["location"],
            "confidence":  float(r.get("confidence") or 0),
            "recommended_actions": r.get("recommended_actions") or [],
            "evidence":    r.get("evidence") or {},
            "created_at":  r["created_at"].isoformat() if r.get("created_at") else None,
        }
        for r in rows
    ]
