# WaterOS — AI-Native Multi-Agent Water Intelligence Platform

> Google AI Hackathon 2025 · Built with Google ADK + Gemini

WaterOS is an enterprise-grade, AI-first platform that uses autonomous agents to monitor, predict, optimize, and protect global water resources. It demonstrates multi-agent collaboration, MCP tooling, and explainable AI in a real-world domain.

## Demo

[![Demo Video](https://img.shields.io/badge/Watch%20Demo-YouTube-red?logo=youtube&style=for-the-badge)](https://youtube.com)
[![Live App](https://img.shields.io/badge/Live%20App-localhost%3A3000-blue?logo=docker&style=for-the-badge)](http://localhost:3000)

> **Login:** `admin@wateros.ai` / `admin123`

| Dashboard — KPIs + AI Reasoning Feed | Global Intelligence — 195 Countries |
|--------------------------------------|-------------------------------------|
| ![Dashboard](demo/screenshots/02-dashboard.png) | ![Global](demo/screenshots/03-global.png) |

| Countries Drill-Down | Live Sensor Grid (5s refresh) |
|----------------------|-------------------------------|
| ![Countries](demo/screenshots/04-countries.png) | ![Sensors](demo/screenshots/07-sensors.png) |

| Agent Console — 13 ADK Agents | Knowledge Graph — 60 Nodes |
|-------------------------------|---------------------------|
| ![Agents](demo/screenshots/11-agents.png) | ![Graph](demo/screenshots/13-knowledge-graph.png) |

> **To generate screenshots:** `docker compose up -d && node scripts/take-screenshots.mjs`

## Architecture

```
React 19 Frontend (TypeScript + Vite + Tailwind)
         │
    FastAPI Backend (Python 3.12)
         │
┌────────┼──────────────────────────┐
│        │                          │
PostgreSQL  Redis  Qdrant  Kafka    │
(primary)  (cache) (vector)(events) │
         │                          │
    Google ADK Agent Layer          │
         │                          │
    ┌────┴───────────────────┐      │
    │  7 Specialized Agents  │      │
    │  + MCP Server          │      │
    └────────────────────────┘      │
```

## Agent Architecture

| Agent | Role | Invokes |
|-------|------|---------|
| Rainfall Agent | Weather & storm forecasting | Gemini + satellite data |
| Reservoir Agent | Storage optimization | Gemini + sensor APIs |
| Flood Agent | Flood risk prediction | Rainfall + Reservoir agents |
| Water Quality Agent | Safety analysis (WHO standards) | Spectrometer sensors |
| Leak Detection Agent | Pipeline anomaly detection | Pressure/flow sensors |
| Emergency Agent | Incident coordination | Flood + Quality + Leak agents |
| Decision Agent | Master reasoning & synthesis | All agents |

## MCP Server Tools

- `getReservoirStatus()` — real-time reservoir telemetry
- `predictFlood()` — ML flood probability
- `detectLeak()` — pipeline pressure analysis
- `getWaterQuality()` — WHO-standard safety score
- `forecastRain()` — 7-day rainfall forecast
- `getGroundWater()` — aquifer depletion monitoring
- `optimizeReservoir()` — release schedule optimization
- `generateEmergencyPlan()` — incident response planning

## Database Architecture (Polyglot Persistence)

| Database | Purpose |
|----------|---------|
| PostgreSQL | Users, reservoirs, sensors, alerts, audit logs |
| Redis | Sessions, agent state cache, real-time pubsub |
| Qdrant | Agent vector memory, semantic search (Gemini embeddings) |
| Kafka | Sensor event streams, agent communication bus |

## Quick Start

### 1. Prerequisites
- Docker + Docker Compose
- Node.js 20+
- Python 3.12+

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env and add your GOOGLE_API_KEY
```

### 3. Start with Docker Compose
```bash
docker-compose up -d
```

Services:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Qdrant UI: http://localhost:6333/dashboard

### 4. Local development

**Backend:**
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## UI Pages

| Page | Description |
|------|-------------|
| Dashboard | KPIs, reservoir charts, water quality bars |
| World Map | Leaflet map with reservoir markers and risk layers |
| Agent Console | Run agents, view reasoning chains, chat with Decision Agent |
| AI Collaboration | React Flow visualization of agent-to-agent workflow |
| Digital Twin | Simulation engine for what-if scenarios |
| Water Quality | WHO-standard sensor analysis |
| Reservoirs | Fill levels, inflow/outflow, overflow risk |
| Climate & Forecast | 7-day rainfall/temperature predictions |
| Alerts | Real-time AI-generated incident alerts |
| Settings | API keys, AI config, database status |

## API Endpoints

Full OpenAPI docs at `http://localhost:8000/docs`

| Endpoint | Description |
|----------|-------------|
| `POST /api/v1/auth/login` | Authenticate |
| `GET /api/v1/dashboard` | Dashboard KPIs |
| `GET /api/v1/reservoirs` | List reservoirs |
| `GET /api/v1/agents` | List available agents |
| `POST /api/v1/agents/run` | Execute an agent |
| `POST /api/v1/agents/chat` | Chat with an agent |
| `POST /api/v1/agents/reason` | Full reasoning chain |
| `GET /api/v1/mcp/tools` | List MCP tools |
| `POST /api/v1/mcp/call` | Call an MCP tool |
| `POST /api/v1/simulation/run` | Run a digital twin scenario |
| `WS /ws/live-data` | Real-time sensor stream |
| `WS /ws/agents` | Real-time agent status |

## Testing

```bash
cd backend
pytest tests/ -v
```

## Technology Stack

**Frontend:** React 19, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query, Zustand, React Flow, Leaflet, Recharts, Framer Motion

**Backend:** Python 3.12, FastAPI, Pydantic v2, SQLAlchemy 2.0, Alembic, Celery

**AI:** Google Gemini 1.5 Pro, Google ADK, MCP, Multi-Agent A2A communication

**Data:** PostgreSQL 16, Redis 7, Qdrant (vector DB), Kafka

**Infra:** Docker, Kubernetes, GitHub Actions, Google Cloud Run compatible

## Key Features

- **AI-First Design** — every screen shows agent reasoning, confidence, and evidence
- **Agent-to-Agent Communication** — agents invoke each other forming a reasoning chain
- **MCP Server** — 8 standardized tools agents call to interact with the water system
- **Vector Memory** — Qdrant + Gemini embeddings for semantic agent memory
- **Digital Twin** — simulate flood/drought/contamination scenarios
- **Explainable AI** — every recommendation shows WHY, HOW, data used, agents involved
- **Real-time WebSocket** — live sensor data and agent status streams
- **Security** — JWT, RBAC, prompt injection detection, audit logging
