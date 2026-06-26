#!/usr/bin/env bash
# =============================================================================
# WaterOS Database Seed Script
# Usage:  bash database/seed.sh [--reset]
#   --reset   drops and recreates all tables before seeding (DESTRUCTIVE)
# Run from the project root directory.
# =============================================================================
set -e

CONTAINER="wateros_postgres"
DB_USER="wateros"
DB_NAME="wateros"

check_container() {
    if ! docker inspect "$CONTAINER" > /dev/null 2>&1; then
        echo "ERROR: Container '$CONTAINER' not found. Run 'docker compose up -d' first."
        exit 1
    fi
}

run_sql() {
    local file="$1"
    echo ">>> Running $file ..."
    docker exec -i "$CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" < "$file"
    echo "    Done."
}

check_container

if [[ "$1" == "--reset" ]]; then
    echo "!!! RESET mode: dropping all WaterOS tables ..."
    docker exec -i "$CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" <<'RESET_SQL'
DROP TABLE IF EXISTS simulations, agent_execution, agent_memory,
    weather, alerts, groundwater, water_quality,
    sensors, rivers, reservoirs,
    user_roles, users, roles CASCADE;
DROP VIEW  IF EXISTS v_reservoir_status, v_active_alerts, v_river_flood_status;
RESET_SQL
    echo "    Tables dropped."
fi

run_sql "database/01_schema.sql"
run_sql "database/02_sample_data.sql"

echo ""
echo "=== WaterOS database seed complete ==="
echo "Tables populated:"
docker exec "$CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" \
    -c "\dt" 2>/dev/null | grep -E "public\s+\|" | awk '{print "  -", $3}'
echo ""
echo "Row counts:"
docker exec "$CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -t \
    -c "SELECT '  reservoirs: ' || count(*) FROM reservoirs
        UNION ALL SELECT '  rivers:      ' || count(*) FROM rivers
        UNION ALL SELECT '  sensors:     ' || count(*) FROM sensors
        UNION ALL SELECT '  water_qual:  ' || count(*) FROM water_quality
        UNION ALL SELECT '  groundwater: ' || count(*) FROM groundwater
        UNION ALL SELECT '  alerts:      ' || count(*) FROM alerts
        UNION ALL SELECT '  weather:     ' || count(*) FROM weather
        UNION ALL SELECT '  agent_mem:   ' || count(*) FROM agent_memory
        UNION ALL SELECT '  simulations: ' || count(*) FROM simulations;"
