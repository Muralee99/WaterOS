<div align="center">

# ðŸ’§ WaterOS

### AI-Native Multi-Agent Water Intelligence Platform

*Google AI Hackathon 2026*

[![Google ADK](https://img.shields.io/badge/Google%20ADK-Powered-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://google.com)
[![Gemini 1.5 Pro](https://img.shields.io/badge/Gemini%201.5%20Pro-AI%20Engine-8B5CF6?style=for-the-badge&logo=google&logoColor=white)](https://deepmind.google/gemini)
[![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React%2019-Frontend-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://docker.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgresql.org)

<br/>

> **WaterOS** is an enterprise-grade, AI-first platform that deploys 14 autonomous agents to monitor, predict, optimize, and protect global water resources in real time. It demonstrates multi-agent orchestration, agent memory, live observability, MCP tooling, and explainable AI â€” applied to one of humanity's most critical challenges.

<br/>

[![Live App](https://img.shields.io/badge/â–¶%20Live%20App-localhost%3A3000-22c55e?style=for-the-badge)](http://localhost:3000)
[![API Docs](https://img.shields.io/badge/ðŸ“–%20API%20Docs-localhost%3A8000%2Fdocs-f59e0b?style=for-the-badge)](http://localhost:8000/docs)
[![Architecture](https://img.shields.io/badge/ðŸ—%20Architecture-docs%2Farchitecture.md-6366f1?style=for-the-badge)](./docs/architecture.md)

</div>

---

## âœ¨ What Makes WaterOS Different

| Capability | Description |
|-----------|-------------|
| ðŸ¤– **14 Autonomous AI Agents** | Specialized agents for flood, rainfall, reservoir, quality, leaks, climate, emergency, and more â€” all powered by Gemini 1.5 Pro |
| ðŸ§  **Agent Memory** | Episodic memory stored in PostgreSQL â€” agents remember past runs and enrich future analysis with historical context |
| ðŸ” **Live Observability** | Real-time execution traces, reasoning step animation, session history, per-agent performance metrics |
| ðŸ”— **Agent-to-Agent Communication** | Agents invoke each other in chains (e.g., Decision Agent orchestrates Flood + Reservoir + Quality agents) |
| ðŸ›  **MCP Server** | 8 standardized Model Context Protocol tools for water system interaction |
| ðŸŒ **Global â†’ City Drill-Down** | Hierarchical intelligence: Global â†’ Country â†’ State â†’ City with scoped AI insights at every level |
| ðŸ“¡ **Real-time WebSocket Streams** | Live sensor telemetry and agent status pushed every 3â€“5 seconds |
| ðŸ§¬ **Digital Twin** | Simulate flood, drought, and contamination scenarios with what-if analysis |
| ðŸ“Š **Explainable AI** | Every recommendation shows the full reasoning chain, confidence score, tools called, and agents invoked |
| ðŸ”’ **Production-Ready** | JWT auth, RBAC, Kafka event streaming, Redis caching, Qdrant vector search |

---

## ðŸ–¥ Screenshots

### Platform Overview

| Login | Dashboard â€” Water Intelligence KPIs |
|-------|--------------------------------------|
| ![Login](demo/screenshots/01-login.png) | ![Dashboard](demo/screenshots/02-dashboard.png) |

| Global Intelligence â€” 195 Countries | Alerts & Incidents |
|--------------------------------------|-------------------|
| ![Global](demo/screenshots/03-global.png) | ![Alerts](demo/screenshots/17-alerts.png) |

---

### Geographic Intelligence

| Countries â€” Table View | Countries â€” AI Insights Panel (India selected) |
|------------------------|------------------------------------------------|
| ![Countries](demo/screenshots/04-countries.png) | ![Countries AI](demo/screenshots/04b-countries-ai-insights.png) |

| Rivers + AI Insights | Cities + AI Insights |
|----------------------|----------------------|
| ![Rivers](demo/screenshots/08b-rivers-ai-insights.png) | ![Cities](demo/screenshots/06b-cities-ai-insights.png) |

| Live Sensor Grid | Pipelines Network |
|-----------------|------------------|
| ![Sensors](demo/screenshots/07-sensors.png) | ![Pipelines](demo/screenshots/09-pipelines.png) |

| Reservoirs | Water Quality |
|-----------|--------------|
| ![Reservoirs](demo/screenshots/19-reservoirs.png) | ![Quality](demo/screenshots/10-water-quality.png) |

---

### ðŸ¤– Agentic Flows â€” Core Differentiator

| Agent Console â€” 14 Agents Overview | Geographic Context Selected (India â†’ Assam) |
|------------------------------------|---------------------------------------------|
| ![Agents Overview](demo/screenshots/13-agents-overview.png) | ![Agents Geo](demo/screenshots/13b-agents-geo-context.png) |

| Flood Agent â€” Live Step Trace (mid-execution) | Flood Agent â€” Full Result with Reasoning Chain |
|------------------------------------------------|------------------------------------------------|
| ![Live Trace](demo/screenshots/13c-agents-live-trace.png) | ![Agent Result](demo/screenshots/13d-agents-result.png) |

| Reasoning Chain Expanded â€” Step-by-Step Evidence | Decision Agent â€” A2A Orchestration Result |
|--------------------------------------------------|------------------------------------------|
| ![Reasoning Chain](demo/screenshots/13e-agents-reasoning-chain.png) | ![Decision Agent](demo/screenshots/13h-decision-agent-result.png) |

| Observability Tab â€” Session History + Metrics | Decision Agent Running â€” A2A Invocations |
|------------------------------------------------|------------------------------------------|
| ![Observability Tab](demo/screenshots/13f-agents-observability.png) | ![Decision Running](demo/screenshots/13g-decision-agent-running.png) |

**Dedicated Observability Dashboard** (`/observability`) â€” Live agent status, execution timeline, tool analytics, agent memory browser, per-agent performance

| Agent Observability â€” Stats + Live Status + Timeline | Per-Agent Performance + Memory Browser |
|------------------------------------------------------|----------------------------------------|
| ![Observability](demo/screenshots/21-observability.png) | ![Observability Performance](demo/screenshots/21b-observability-performance.png) |

---

### Intelligence & Analytics

| Climate Analysis | 7-Day Forecast |
|-----------------|----------------|
| ![Climate](demo/screenshots/11-climate.png) | ![Forecast](demo/screenshots/12-forecast.png) |

| Agent Workflow â€” A2A Visualization | Knowledge Graph â€” Semantic Network |
|------------------------------------|-----------------------------------|
| ![Workflow](demo/screenshots/14-workflow.png) | ![Knowledge Graph](demo/screenshots/15-knowledge-graph.png) |

| Digital Twin Simulation | Reports |
|------------------------|---------|
| ![Digital Twin](demo/screenshots/16-digital-twin.png) | ![Reports](demo/screenshots/18-reports.png) |

---

> Regenerate all screenshots: `docker compose up -d && node scripts/take-screenshots.mjs`

---

## ðŸ— Architecture

> 📐 **[View Full Interactive Architecture Diagram](./docs/architecture-diagram.md)** — Mermaid flowchart with all data sources, storage, MCP, governed agents, A2A topology, and action outputs

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                         PRESENTATION LAYER                               â”‚
â”‚  React 19 + TypeScript + Vite  Â·  Zustand  Â·  React Query  Â·  :3000     â”‚
â”‚                                                                          â”‚
â”‚  Dashboard Â· Map Â· Countries Â· Rivers Â· Pipelines Â· Sensors Â· Cities    â”‚
â”‚  Water Quality Â· Climate Â· Forecast Â· Alerts Â· Reports Â· Settings       â”‚
â”‚                                                                          â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”‚
â”‚  â”‚  Agent Console       â”‚  â”‚  Observability    â”‚  â”‚  Knowledge Graph â”‚   â”‚
â”‚  â”‚  14 AI agents        â”‚  â”‚  Session history  â”‚  â”‚  Digital Twin    â”‚   â”‚
â”‚  â”‚  Live step trace     â”‚  â”‚  Live metrics     â”‚  â”‚  Workflow viz    â”‚   â”‚
â”‚  â”‚  Decision Agent chat â”‚  â”‚  Agent memory     â”‚  â”‚  Reports         â”‚   â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                                 â”‚  REST + WebSocket
                                 â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                            API LAYER  Â·  FastAPI  Â·  :8000               â”‚
â”‚  JWT Auth Â· CORS Â· GZip Â· Async SQLAlchemy Â· Pydantic v2                â”‚
â”‚                                                                          â”‚
â”‚  /auth  /dashboard  /countries  /states  /cities  /rivers               â”‚
â”‚  /reservoirs  /pipelines  /sensors  /water-quality  /climate            â”‚
â”‚  /forecast  /alerts  /reports  /simulation  /graph  /mcp                â”‚
â”‚                                                                          â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”‚
â”‚  â”‚  /agents â€” Session + Memory + Observability                      â”‚    â”‚
â”‚  â”‚  POST /run     â†’ execute + save AgentExecution + write memory    â”‚    â”‚
â”‚  â”‚  POST /chat    â†’ Decision Agent chat + persist to DB             â”‚    â”‚
â”‚  â”‚  GET  /sessions       â†’ full run history from PostgreSQL         â”‚    â”‚
â”‚  â”‚  GET  /observability  â†’ aggregate stats + per-agent metrics      â”‚    â”‚
â”‚  â”‚  GET  /memory/{id}    â†’ episodic memories per agent              â”‚    â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â”‚
â”‚                                                                          â”‚
â”‚  WS /ws/live-data  (sensor telemetry, 5s)                               â”‚
â”‚  WS /ws/agents     (agent status stream, 3s)                            â”‚
â””â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
       â”‚                                          â”‚
       â–¼                                          â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”         â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚   AI AGENT LAYER          â”‚         â”‚         DATA LAYER                 â”‚
â”‚   Google ADK + Gemini     â”‚         â”‚                                    â”‚
â”‚                           â”‚         â”‚  PostgreSQL :5432                  â”‚
â”‚   Rainfall Agent          â”‚         â”‚  Â· Countries, rivers, sensors      â”‚
â”‚   Reservoir Agent         â”‚         â”‚  Â· AgentExecution (session hist)   â”‚
â”‚   Flood Agent             â”‚         â”‚  Â· AgentMemory (episodic memory)   â”‚
â”‚   Water Quality Agent     â”‚         â”‚  Â· Users, alerts, reports          â”‚
â”‚   Leak Detection Agent    â”‚         â”‚                                    â”‚
â”‚   Climate Agent           â”‚         â”‚  Redis :6379                       â”‚
â”‚   Emergency Agent         â”‚         â”‚  Â· Auth token cache                â”‚
â”‚   Country Agent           â”‚         â”‚  Â· Agent state, pub/sub            â”‚
â”‚   Groundwater Agent       â”‚         â”‚                                    â”‚
â”‚   Decision Agent â”€â”€â”€â”€â”€â”€â”€â”€ â”‚â”€â”€â”€â”€â”€â”€â”€â”€ â”‚  Qdrant :6333                      â”‚
â”‚   Global Coordinator      â”‚ invokes â”‚  Â· Vector embeddings               â”‚
â”‚   Infrastructure Agent    â”‚ agents  â”‚  Â· Semantic knowledge search       â”‚
â”‚   Sensor Intelligence     â”‚         â”‚                                    â”‚
â”‚   Report Generation       â”‚         â”‚  Kafka + Zookeeper :9092           â”‚
â”‚                           â”‚         â”‚  Â· Sensor telemetry streams        â”‚
â”‚   Celery Workers          â”‚         â”‚  Â· Agent result events             â”‚
â”‚   (async task queue)      â”‚         â”‚  Â· Alert broadcasting              â”‚
â”‚                           â”‚         â”‚                                    â”‚
â”‚   MCP Server              â”‚         â”‚  Celery Workers                    â”‚
â”‚   8 water system tools    â”‚         â”‚  Â· Background agent tasks          â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜         â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## ðŸ¤– Agent Roster

| Agent | Domain | Key Capabilities |
|-------|--------|-----------------|
| ðŸŒ§ **Rainfall Agent** | Environmental | Satellite data ingestion, anomaly detection, 7-day precipitation forecast |
| ðŸž **Reservoir Agent** | Infrastructure | Level monitoring, inflow/outflow optimization, overflow prediction |
| ðŸŒŠ **Flood Agent** | Emergency | ML flood crest prediction, discharge calculation, evacuation recommendations |
| ðŸ§ª **Water Quality Agent** | Safety | 1,400 WHO parameters, contamination detection, treatment advisory |
| ðŸ”§ **Leak Detection Agent** | Infrastructure | Acoustic sensor analysis, pressure differential mapping, pipe failure prediction |
| ðŸŒ¡ **Climate Agent** | Environmental | ERA5/CMIP6 climate modeling, drought index, long-term freshwater projections |
| ðŸš¨ **Emergency Agent** | Operations | Multi-hazard assessment, protocol activation, cross-agency coordination |
| ðŸ› **Country Agent** | Geographic | National water scoring, SDG 6 benchmarking, cross-border analysis |
| ðŸ’§ **Groundwater Agent** | Environmental | Aquifer depletion monitoring, recharge rate analysis |
| ðŸ§  **Decision Agent** | Orchestrator | Multi-criteria decision analysis, MCDA ranking, synthesizes all agents |
| ðŸŒ **Global Coordinator** | Orchestrator | Coordinates all 13 specialist agents, identifies cross-system conflicts |
| ðŸ— **Infrastructure Agent** | Operations | GIS pipe network assessment, material degradation modeling, maintenance prioritization |
| ðŸ“¡ **Sensor Intelligence** | Operations | Live telemetry processing, anomaly detection across all sensor streams |
| ðŸ“‹ **Report Generation** | Operations | Executive and technical report synthesis with Gemini narrative generation |

### Agent Observability

Every agent run is:
- **Traced** â€” reasoning steps stream live to the UI as they complete
- **Persisted** â€” full result saved to `agent_execution` table with session ID
- **Remembered** â€” key outcomes written to `agent_memory` for future context enrichment
- **Measured** â€” latency, confidence, tools called, agents invoked â€” all tracked

---

## ðŸ›  MCP Server Tools

The Model Context Protocol server exposes 8 standardized water system tools:

```python
getReservoirStatus(reservoir_id)     # Real-time level, inflow, outflow
predictFlood(river_id, hours=72)     # ML flood probability + crest timing
detectLeak(pipeline_segment_id)      # Acoustic + pressure anomaly analysis
getWaterQuality(zone_id)             # WHO-standard WQI + parameter breakdown
forecastRain(location, days=7)       # Satellite-backed precipitation forecast
getGroundWater(aquifer_id)           # Depth, recharge rate, depletion trend
optimizeReservoir(reservoir_id)      # Optimal release schedule calculation
generateEmergencyPlan(incident_type) # Incident response + resource allocation
```

---

## ðŸ—„ Database Architecture

| Database | Port | Purpose |
|----------|------|---------|
| **PostgreSQL 16** | 5432 | Primary store â€” countries, rivers, sensors, pipelines, cities, alerts, agent sessions, agent memory, users |
| **Redis 7** | 6379 | Auth token cache, agent state, real-time pub/sub, rate limiting |
| **Qdrant** | 6333 | Vector embeddings â€” semantic knowledge search, agent long-term memory |
| **Apache Kafka** | 9092 | Sensor telemetry streaming, agent result events, alert broadcasting |

---

## ðŸš€ Quick Start

### Prerequisites

- [Docker Desktop](https://docker.com/products/docker-desktop) (Docker + Compose)
- [Google AI API Key](https://aistudio.google.com/app/apikey) (for Gemini 1.5 Pro)

### 1. Clone & Configure

```bash
git clone https://github.com/Muralee99/WaterOS.git
cd WaterOS

cp .env.example .env
# Open .env and set:
# GOOGLE_API_KEY=your_gemini_api_key_here
```

### 2. Start All Services

```bash
docker compose up -d
```

This starts 8 services: frontend, backend, celery worker, postgres, redis, kafka, zookeeper, qdrant.

### 3. Open the App

| Service | URL |
|---------|-----|
| **Frontend** | http://localhost:3000 |
| **Backend API** | http://localhost:8000 |
| **API Docs (Swagger)** | http://localhost:8000/docs |
| **Qdrant Dashboard** | http://localhost:6333/dashboard |

### 4. Register & Login

The app auto-creates database tables on startup. Register a new account at:
```
http://localhost:3000/login
```

Or use the API directly:
```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","username":"you","password":"pass123","full_name":"Your Name"}'
```

### 5. Run Your First Agent

```bash
# Get auth token
TOKEN=$(curl -s -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","password":"pass123"}' | jq -r .access_token)

# Run the Flood Agent for India/Assam
curl -X POST http://localhost:8000/api/v1/agents/run \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"agent_id":"flood_agent","context":{"country":"India","state":"Assam"}}'
```

---

## ðŸ’» Local Development

**Backend (Python 3.12)**
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

**Frontend (Node.js 20+)**
```bash
cd frontend
npm install
npm run dev        # Dev server at http://localhost:5173
npm run build      # Production build
npm run type-check # TypeScript validation
```

**Run Tests**
```bash
cd backend
pytest tests/ -v
```

---

## ðŸ“¡ API Reference

Full interactive docs at `http://localhost:8000/docs`

### Authentication
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/auth/register` | POST | Create account |
| `/api/v1/auth/login` | POST | Get JWT token |
| `/api/v1/auth/logout` | POST | Revoke token |

### Agents
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/agents` | GET | List all 14 agents |
| `/api/v1/agents/run` | POST | Execute an agent with geo context |
| `/api/v1/agents/chat` | POST | Chat with Decision Agent |
| `/api/v1/agents/reason` | POST | Full reasoning chain |
| `/api/v1/agents/sessions` | GET | Session history from DB |
| `/api/v1/agents/observability` | GET | Aggregate stats + timeline |
| `/api/v1/agents/memory/{id}` | GET | Agent episodic memories |
| `/api/v1/agents/sessions` | DELETE | Clear all sessions |

### Water Data
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/countries` | GET | All countries + water metrics |
| `/api/v1/rivers` | GET | River levels and risk status |
| `/api/v1/reservoirs` | GET | Reservoir levels and forecasts |
| `/api/v1/pipelines` | GET | Pipeline network status |
| `/api/v1/sensors` | GET | Sensor readings (all types) |
| `/api/v1/water-quality` | GET | WHO-standard quality scores |
| `/api/v1/climate` | GET | Climate trends and drought index |
| `/api/v1/forecast` | GET | 7-day precipitation forecast |
| `/api/v1/alerts` | GET/POST | Active alerts |

### Real-time
| Endpoint | Protocol | Description |
|----------|----------|-------------|
| `/ws/live-data` | WebSocket | Sensor telemetry every 5s |
| `/ws/agents` | WebSocket | Agent status stream every 3s |

---

## ðŸ–¥ UI Pages

| Page | Path | Description |
|------|------|-------------|
| **Dashboard** | `/dashboard` | KPIs, reservoir charts, water quality scores, AI reasoning feed |
| **Global** | `/global` | World-level intelligence â€” 195 countries, risk heatmap |
| **Countries** | `/countries` | Country drill-down with AI insights panel |
| **States** | `/states` | State-level water intelligence |
| **Cities** | `/cities` | City infrastructure and quality overview |
| **Rivers** | `/rivers` | River levels, discharge rates, flood risk |
| **Reservoirs** | `/reservoirs` | Storage levels, overflow risk, optimization |
| **Pipelines** | `/pipelines` | Network status, leak zones, pressure data |
| **Sensors** | `/sensors` | Live sensor grid with health monitoring |
| **Water Quality** | `/water-quality` | WHO-standard analysis per zone |
| **Climate** | `/climate` | Temperature anomalies, drought index, projections |
| **Forecast** | `/forecast` | 7-day rainfall and temperature predictions |
| **Agent Console** | `/agents` | Run agents, live trace, Decision Agent chat, observability |
| **Workflow** | `/workflow` | Agent-to-agent collaboration visualization |
| **Knowledge Graph** | `/knowledge-graph` | 60-node semantic water knowledge graph |
| **Digital Twin** | `/digital-twin` | Flood/drought/contamination scenario simulation |
| **Alerts** | `/alerts` | Real-time AI-generated incident alerts |
| **Reports** | `/reports` | Generate executive and technical water reports |
| **Settings** | `/settings` | API keys, AI config, database connection status |

---

## ðŸ“ Technology Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 19 | UI framework |
| TypeScript | 5 | Type safety |
| Vite | 5 | Build tool |
| Tailwind CSS | 3 | Styling |
| Framer Motion | 11 | Animations |
| Zustand | 4 | State management (with localStorage persist) |
| React Query | 5 | Server state + caching |
| React Flow | 11 | Agent workflow visualization |
| Leaflet | 1.9 | Interactive world map |
| Recharts | 2 | Data visualization |
| Lucide React | â€” | Icon library |

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Python | 3.12 | Runtime |
| FastAPI | 0.111 | REST API + WebSocket |
| Pydantic | v2 | Data validation |
| SQLAlchemy | 2.0 | Async ORM |
| Alembic | â€” | Database migrations |
| Celery | â€” | Async task queue |
| aioredis | â€” | Async Redis client |

### AI / Data
| Technology | Purpose |
|-----------|---------|
| Google Gemini 1.5 Pro | LLM backbone for all 14 agents |
| Google ADK | Agent Development Kit â€” agent orchestration framework |
| MCP | Model Context Protocol â€” standardized tool interface |
| PostgreSQL 16 | Primary relational database + agent sessions/memory |
| Redis 7 | Cache + pub/sub + session store |
| Qdrant | Vector database â€” semantic memory + knowledge search |
| Apache Kafka | Event streaming â€” sensor telemetry + agent results |

---

## ðŸ§  Core Concepts

### ðŸ¤– Agents â€” How They Work

Each WaterOS agent is an autonomous AI unit built on **Google ADK** (`BaseWaterAgent`). When invoked, an agent:

1. **Receives a context** â€” geographic scope (country/state/city) plus any enriched memory from past runs
2. **Builds a reasoning chain** â€” adds structured steps via `add_reasoning_step()` at each decision point
3. **Calls tools** â€” invokes domain-specific tools (sensor APIs, ML models, satellite data) tracked in `tools_called`
4. **Optionally invokes sub-agents** â€” orchestrator agents call specialist agents and collect their outputs
5. **Calls Gemini 1.5 Pro** â€” synthesizes all gathered data into a natural-language analysis + structured result
6. **Returns an `AgentResult`** â€” containing `status`, `confidence`, `latency_ms`, `reasoning_chain`, `tools_called`, `agents_invoked`, and the full `result` payload

```python
# Example: how agents self-describe their reasoning
self.add_reasoning_step("Retrieved river gauge data for Assam")
self.add_reasoning_step("Applied ML flood prediction model (50-year training set)")
self.add_reasoning_step("Computed crest arrival time and at-risk districts")
gemini_analysis = await self.call_gemini(prompt)
```

Every agent run is **non-blocking async** (`async def run()`), allowing the platform to run multiple agents in parallel.

---

### ðŸ”— Agent-to-Agent (A2A) Protocol

WaterOS implements **directed agent invocation chains** â€” agents call other agents as sub-tasks, forming a reasoning tree:

```
Decision Agent
â”œâ”€â”€ invoke Emergency Agent â†’ get crisis level + active alerts
â”œâ”€â”€ invoke Rainfall Agent  â†’ get 7-day precipitation anomaly
â”œâ”€â”€ invoke Reservoir Agent â†’ get capacity + overflow risk
â””â”€â”€ synthesize all outputs â†’ Gemini final recommendation

Global Coordinator
â””â”€â”€ invoke all 13 specialist agents â†’ unified global water picture
```

The A2A mechanism uses `invoke_agent()` on `BaseWaterAgent`:

```python
async def invoke_agent(self, agent: BaseWaterAgent, context: Dict) -> AgentResult:
    self.agents_invoked.append(agent.agent_id)
    self.add_reasoning_step(f"Invoking {agent.agent_id}", {"context_keys": list(context.keys())})
    return await agent.run(context)
```

- **Results propagate upward** â€” sub-agent outputs become input context for the parent agent
- **Agents are tracked** â€” `agents_invoked` in every `AgentResult` shows the full invocation tree
- **Visualized** â€” the Workflow page renders this chain as an interactive React Flow graph

---

### ðŸ›  MCP â€” Model Context Protocol

The **Model Context Protocol (MCP)** server exposes 8 standardized water domain tools that any agent can call. MCP provides a vendor-neutral interface so agents interact with water systems through structured, typed tool calls rather than raw API calls:

```
Agent  â†’  MCP Tool Call  â†’  Water System Data
```

| Tool | Input | Output |
|------|-------|--------|
| `getReservoirStatus(id)` | reservoir ID | level %, inflow/outflow mÂ³/s, days-to-full |
| `predictFlood(river_id, hours)` | river + forecast window | probability %, crest time, risk level |
| `detectLeak(pipeline_id)` | pipeline segment | leak probability, pressure drop bar, loss L/s |
| `getWaterQuality(zone_id)` | monitoring zone | WQI score, pH, turbidity, chlorine, violations |
| `forecastRain(location, days)` | location + days | mm/day breakdown, anomaly %, storm probability |
| `getGroundWater(aquifer_id)` | aquifer ID | depth m, recharge rate, depletion trend |
| `optimizeReservoir(id)` | reservoir ID | optimal release schedule mÂ³/s |
| `generateEmergencyPlan(type)` | incident type | response protocol, resource allocation |

MCP tools are accessible via the API at `GET /api/v1/mcp/tools` and `POST /api/v1/mcp/call`.

---

### ðŸ’¾ Agent Sessions

Every agent run creates a **persistent session record** in PostgreSQL (`agent_execution` table):

```sql
agent_execution (
  id              UUID PRIMARY KEY,
  agent_id        VARCHAR,      -- which agent ran
  session_id      VARCHAR,      -- groups related runs
  status          VARCHAR,      -- completed / failed
  result          JSONB,        -- full structured result
  reasoning_chain JSONB,        -- step-by-step trace
  tools_called    JSONB,        -- tool invocations
  agents_invoked  JSONB,        -- sub-agents called
  confidence      FLOAT,        -- 0.0 â€“ 1.0
  latency_ms      INTEGER,      -- wall-clock execution time
  started_at      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ
)
```

**Session ID** ties related runs together â€” all agents run from the same browser session share a session ID, enabling cross-agent correlation.

The frontend persists sessions in **two places**:
- **PostgreSQL** (via backend) â€” durable, survives restarts, queryable
- **localStorage** (via Zustand persist) â€” instant access, works offline, survives page refresh

Sessions are accessible via `GET /api/v1/agents/sessions` and displayed in the Observability panel.

---

### ðŸ§¬ Agent Memory

WaterOS implements **episodic memory** â€” agents remember past runs and use that knowledge to enrich future analysis:

```
Run 1: Flood Agent â†’ India/Assam
         â””â”€ result saved to agent_memory table
              { type: "episodic", content: "Last run for Assam: completed",
                context: { scope, confidence, tools_called, summary } }

Run 2: Flood Agent â†’ India/Assam (again)
         â””â”€ backend loads last 3 memories
         â””â”€ enriches context: { _memory: [...past results...] }
         â””â”€ agent now has historical context and can detect trends
```

```sql
agent_memory (
  id           UUID PRIMARY KEY,
  agent_id     VARCHAR,          -- which agent owns this memory
  memory_type  VARCHAR,          -- episodic / semantic / procedural
  content      TEXT,             -- human-readable summary
  context      JSONB,            -- structured data snapshot
  importance   FLOAT,            -- 0.0 â€“ 1.0 (based on confidence)
  created_at   TIMESTAMPTZ,
  expires_at   TIMESTAMPTZ       -- optional TTL
)
```

Memory types:
- **Episodic** â€” "what happened last time" (auto-written after each successful run)
- **Semantic** â€” domain knowledge about water systems (can be pre-seeded)
- **Procedural** â€” learned response patterns (for future automation)

Memory is retrieved via `GET /api/v1/agents/memory/{agent_id}` and shown in the Observability panel.

---

### ðŸ“Š Observability

WaterOS provides **full execution observability** at three levels:

#### 1. Live Step Trace (in the Agent Card)
While an agent is running, each reasoning step streams to the UI as it completes â€” showing exactly what the agent is "thinking" in real time:
```
âœ“ Retrieved river gauge data for Assam
âœ“ Applied ML flood prediction model (50-year training set)
âœ“ Computed crest arrival time and at-risk districts
âŸ³ Generating evacuation recommendations...
```

#### 2. Session Observability Panel (in the UI)
The **Observability tab** in the Agent Console right panel shows:
- **Stats**: Total Runs Â· Avg Latency Â· Success Rate Â· Tools Called
- **Live Execution**: active agents + their current step trace
- **Session History**: timeline of all past runs with agent, status, latency, timestamp, tools used
- **Agent Performance**: per-agent confidence bar chart + run count

#### 3. Backend Observability API
`GET /api/v1/agents/observability` returns:
```json
{
  "total_runs": 47,
  "completed_runs": 46,
  "failed_runs": 1,
  "success_rate": 97.9,
  "avg_latency_ms": 2840,
  "avg_confidence": 0.891,
  "per_agent": [
    { "agent_id": "flood_agent", "runs": 8, "avg_latency_ms": 3200, "avg_confidence": 0.91 },
    ...
  ],
  "timeline": [ { "agent_id", "status", "latency_ms", "started_at", ... } ]
}
```

All data is sourced live from PostgreSQL â€” no in-memory approximations.

---

### ðŸŒŠ Data Feeding Flow

WaterOS ingests water data through multiple parallel pipelines:

```
EXTERNAL DATA SOURCES
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
Satellite Rainfall (TRMM/GPM)   River Gauge Stations
Reservoir Level Sensors          Acoustic Leak Sensors
WHO Water Quality Labs           Weather Station APIs
Climate Models (ERA5, CMIP6)    Groundwater Wells
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
                â”‚                         â”‚
                â–¼                         â–¼
        REST API Ingestion         Apache Kafka Topics
        (scheduled batch)          (real-time streaming)
                â”‚                         â”‚
                â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                           â–¼
              â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
              â”‚     PostgreSQL (primary)    â”‚
              â”‚  sensors, reservoirs,       â”‚
              â”‚  rivers, quality readings   â”‚
              â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                           â”‚
              â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
              â–¼                            â–¼
         Redis Cache                  Qdrant Vector DB
         (hot data, TTL)              (semantic index,
         (pub/sub events)              knowledge graph)
                           â”‚
                           â–¼
              FastAPI Backend (:8000)
              (REST + WebSocket endpoints)
                           â”‚
              â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
              â–¼                             â–¼
      React Frontend              AI Agent Layer
      (live tables, charts,       (reads DB via context
       sensor grids, maps)         injected at invocation)
```

**WebSocket live feed** (`/ws/live-data`) pushes sensor updates every 5 seconds directly to the frontend â€” reservoir levels, river heights, quality scores, flood risk, active alert counts â€” enabling real-time dashboard updates without polling.

**Kafka** handles high-throughput sensor events: each sensor reading is published to a Kafka topic, consumed by backend workers, persisted to PostgreSQL, and fanned out to connected WebSocket clients.

---

### ðŸ”¬ Agent Analysis Pipeline

When you click **Run** on an agent, this is the full pipeline:

```
1. CONTEXT ASSEMBLY
   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   â€¢ Geographic scope: { country, state, city }
   â€¢ Agent memory: last 3 episodic memories from PostgreSQL
   â€¢ Enriched context passed to agent.execute()

2. AGENT EXECUTION  (BaseWaterAgent.execute)
   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   â€¢ Reset reasoning_chain, tools_called, agents_invoked
   â€¢ Start wall-clock timer
   â€¢ Call agent.run(enriched_context)

3. INSIDE agent.run()
   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   â€¢ add_reasoning_step("Agent started") â†’ reasoning_chain[]
   â€¢ Query sensor data / satellite APIs (via MCP tools or direct)
   â€¢ add_reasoning_step("Data retrieved") â†’ reasoning_chain[]
   â€¢ Invoke sub-agents if orchestrator (A2A protocol)
   â€¢ add_reasoning_step("Sub-agents complete") â†’ reasoning_chain[]
   â€¢ Build Gemini prompt with all gathered evidence
   â€¢ call_gemini(prompt) â†’ natural language analysis
   â€¢ add_reasoning_step("AI synthesis complete") â†’ reasoning_chain[]
   â€¢ Return AgentResult with structured result + analysis text

4. POST-EXECUTION  (backend /agents/run)
   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   â€¢ Calculate total latency_ms
   â€¢ Save AgentExecution â†’ PostgreSQL (full audit trail)
   â€¢ Write episodic AgentMemory â†’ PostgreSQL (for future context)
   â€¢ Return { result, reasoning_chain, confidence, execution_id, session_id }

5. FRONTEND RENDERING
   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   â€¢ Each reasoning step streamed live during mock execution (step animation)
   â€¢ AgentResult displayed in expanded card: rich result + reasoning chain + tools
   â€¢ AgentSession saved to localStorage + backend
   â€¢ Observability panel refreshes: stats, timeline, per-agent metrics
```

---

### ðŸ—ƒ Database Connections

WaterOS uses **async SQLAlchemy 2.0** with connection pooling for all DB access:

```python
# Connection pool: 10 base + 20 overflow connections
engine = create_async_engine(
    DATABASE_URL,           # postgresql+asyncpg://...
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,     # verify connection before checkout
)

# Dependency injection â€” every request gets its own session
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
        # auto-close on request completion
```

**Tables auto-created on startup** â€” `main.py` lifespan calls `Base.metadata.create_all()` on boot, ensuring all tables exist without requiring manual migrations for development.

**Key tables and relationships:**

```
users              â† authentication, RBAC
â”œâ”€â”€ countries      â† 195 countries with water metrics
â”‚   â”œâ”€â”€ states     â† state-level data
â”‚   â”‚   â””â”€â”€ cities â† city infrastructure
â”œâ”€â”€ rivers         â† river gauges + flow data
â”œâ”€â”€ reservoirs     â† storage levels + forecasts
â”œâ”€â”€ pipelines      â† network segments + pressure
â”œâ”€â”€ sensors        â† all sensor types (quality, level, flow, acoustic)
â”œâ”€â”€ alerts         â† AI-generated + manual alerts
â””â”€â”€ reports        â† generated report metadata

agent_execution    â† every agent run (session history, observability)
agent_memory       â† episodic/semantic agent memory
```

**Redis** is used for:
- Auth token cache (JWT validation without DB hit on every request)
- Agent state pub/sub (real-time status broadcasting)
- Rate limiting per user/IP

**Qdrant** stores Gemini embedding vectors for:
- Knowledge graph node relationships
- Semantic search across water domain knowledge
- Long-term agent memory retrieval by similarity

---

### ðŸŽ¯ Decision Making â€” How the Decision Agent Works

The **Decision Agent** is the master orchestrator â€” it runs a full **Multi-Criteria Decision Analysis (MCDA)** across all water domain inputs:

```
Step 1: GATHER
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
Decision Agent invokes (in parallel):
  â€¢ Emergency Agent  â†’ current crisis level + active alerts
  â€¢ Rainfall Agent   â†’ precipitation anomaly + storm probability
  â€¢ Reservoir Agent  â†’ capacity + overflow/shortage risk

Each sub-agent runs its own analysis chain and returns an AgentResult.
All results are collected as structured JSON evidence.

Step 2: WEIGHT
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
MCDA weights applied to each domain:
  â€¢ Water Security:    40%  (flood risk, quality violations, scarcity)
  â€¢ Economic Impact:   30%  (infrastructure cost, NRW losses, crop impact)
  â€¢ Environmental:     30%  (ecosystem health, groundwater, climate trend)

Each intervention option is scored across all three dimensions.

Step 3: RANK
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
Options sorted by weighted score â†’ cost-benefit ratio calculated.
Top recommendation selected with confidence score.

Step 4: SYNTHESIZE (Gemini 1.5 Pro)
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
Prompt constructed with:
  â€¢ All sub-agent results (structured JSON)
  â€¢ Geographic context + historical memory
  â€¢ MCDA rankings + cost-benefit ratios
  â€¢ WHO standards + SDG 6 benchmarks

Gemini generates:
  â€¢ Executive summary (3-5 sentences)
  â€¢ Top recommendation with justification
  â€¢ Secondary actions prioritized
  â€¢ Risk assessment with confidence intervals

Step 5: RETURN AgentResult
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
{
  "top_recommendation": "Prioritize pipe replacement in 3 critical sections",
  "confidence_score": 0.88,
  "cost_benefit_ratio": 4.2,
  "agents_invoked": ["emergency_agent", "rainfall_agent", "reservoir_agent"],
  "reasoning_chain": [ ... 8 steps ... ],
  "tools_called": ["runMCDA()", "weighTradeoffs()", "generateRecommendations()"],
  "ai_analysis": "Decision analysis for Assam: ..."
}
```

**Chat mode** â€” when you message the Decision Agent in the Chat panel, it bypasses the full cascade and directly answers your question using its domain knowledge + any available geo context:

```
User: "What's the flood risk in Assam this week?"
  â†’ Decision Agent fast-path (mode: "chat")
  â†’ Calls Gemini with flood domain prompt + current sensor context
  â†’ Returns natural language answer in < 2 seconds
  â†’ Persisted to agent_execution table with session_id
```

---

## ðŸŒ Real-World Scenarios

### Scenario 1 â€” Brahmaputra Flood Warning, Assam India

**Situation:** Heavy monsoon rainfall in Assam causes river levels to rise rapidly. District officials need to know: should they evacuate?

**What WaterOS does:**

1. **Rainfall Agent** detects 112mm of rainfall in 7 days (+18% above seasonal average via satellite data)
2. **Flood Agent** pulls gauge station data â€” Brahmaputra at **5.2m**, threshold is **6.0m** â€” and runs the ML crest prediction model: **storm probability 38% over 72h**, no immediate evacuation required
3. **Reservoir Agent** sees Hirakud Dam at **91.2%** capacity â†’ recommends controlled release of **320 mÂ³/s**
4. **Emergency Agent** assesses: crisis level **MEDIUM** â€” pre-position NDRF units, 6-hour monitoring intervals
5. **Decision Agent** synthesizes all four results â†’ issues recommendation: *"No evacuation at current levels. Release 320 mÂ³/s from Hirakud. Deploy 2 NDRF battalions to Guwahati. Escalate if gauge crosses 5.8m."*

**Time to insight: ~4 seconds.** All reasoning steps visible in the Agent Console.

---

### Scenario 2 â€” Mumbai Pipeline Leak â€” 680 MLD Water Loss Daily

**Situation:** Mumbai's water utility suspects significant water loss in the city's aging pipe network. They need to find and prioritize leaks.

**What WaterOS does:**

1. **Leak Detection Agent** processes acoustic sensor arrays across **1,840km** of Mumbai's network
2. Pressure differential analysis flags **284 active leak zones**
3. Severity ranking identifies **3 trunk main fractures in Dharavi sector** â€” highest priority (94% leak probability, 680 MLD daily loss)
4. **Infrastructure Agent** pulls GIS data: affected mains are **38 years old**, material: CI pipe â€” highest failure risk
5. **Decision Agent** calculates: emergency replacement of 3 sections has **cost-benefit ratio 4.2:1** (water recovered vs. repair cost)
6. Auto-generates: maintenance work order + material list + contractor briefing document via **Report Generation Agent**

**Economic impact prevented: â‚¹18,200/day per section.** Full audit trail in PostgreSQL.

---

### Scenario 3 â€” Rajasthan Groundwater Emergency

**Situation:** Groundwater depths in Rajasthan are hitting critical levels â€” farmers can't extract water, cities face rationing. How bad is it?

**What WaterOS does:**

1. **Groundwater Agent** pulls aquifer monitoring data â€” depth **42m below surface**, recharge rate declining 3m/year
2. **Climate Agent** loads ERA5 reanalysis: **+1.42Â°C temperature anomaly**, rainfall deficit **38% below 30-year average**, desertification index **0.82** (highest in India)
3. **Country Agent** benchmarks against SDG 6: India's water score for Rajasthan â€” **41/100 (Critical)**
4. **Decision Agent** MCDA analysis identifies: water security score **41**, economic impact HIGH (crop failure risk), environmental score CRITICAL
5. Output: Water rationing enforced across **12 districts**, emergency groundwater recharge programme recommended, alternative supply corridors prioritized

**3 adaptation strategies generated by Gemini:** (1) Expand rainwater harvesting +40%, (2) Early warning system for compound heat-drought events, (3) Shift 30% agricultural water to recycled wastewater

---

### Scenario 4 â€” WHO Water Quality Violation, Guwahati

**Situation:** A WaterOS sensor at the Guwahati treatment plant spikes. Is the drinking water safe?

**What WaterOS does:**

1. **Sensor Intelligence Agent** detects anomaly: turbidity at **8.4 NTU** (safe limit: 4 NTU) at Station S008
2. **Water Quality Agent** runs WHO compliance check across **1,400 parameters** â€” turbidity violation confirmed, pH normal (7.3), chlorine residual 0.72 mg/L (within range)
3. Alert auto-generated: **Zone 7 boil-water advisory** issued for ~84,000 residents
4. **Emergency Agent** activates: advisory distributed via alert broadcast system, water tanker fleet mobilized
5. Root cause analysis: heavy rainfall event caused sediment surge â€” treatment plant capacity increase recommended

**Time from sensor spike to public advisory: 8 seconds.**

---

### Scenario 5 â€” Murray-Darling Basin, Australia â€” Drought Planning

**Situation:** Australia's Murray-Darling Basin is at **18.4% reservoir capacity** â€” the lowest in 20 years. Long-term planning needed.

**What WaterOS does:**

1. **Reservoir Agent** confirms: Murray-Darling at 18.4%, Stage 4 restrictions active, **days-to-empty: 34**
2. **Climate Agent** projects: +1.2Â°C warming by 2035 will reduce basin inflows by **15%** under RCP 4.5
3. **Country Agent** (Australia): water score **71/100**, but Basin region critical â€” SDG 6 compliance at risk
4. **Decision Agent** generates 5-year water security plan with three scenarios:
   - **Optimistic** (wet year): restrictions ease by Q3, 65% capacity by end of year
   - **Baseline** (trend continues): rationing through 2026, 2 new desalination plants needed
   - **Pessimistic** (drought intensifies): emergency water import from northern catchments, agricultural buybacks
5. **Report Generation Agent** produces: 24-page executive report with all three scenarios, cost estimates, and parliamentary briefing summary

---

### Scenario 6 â€” Real-Time Agent Chat Example

```
User:  "What's the water situation in Delhi right now?"

Decision Agent:
  "Delhi water intelligence summary:

   Supply: Yamuna WQI at 51 â€” borderline for treatment, unsafe for direct contact.
   BOD levels 3Ã— the safe limit at Okhla station. WTP Sonia Vihar running at 94%
   capacity to compensate for quality deterioration.

   Infrastructure: 631 active leak zones, estimated 920 MLD of unaccounted-for water
   daily â€” equivalent to 12% of total supply lost before reaching consumers.
   Per capita supply: 172 LPCD vs. target 270 LPCD â€” a 36% shortfall.

   Priority actions:
   1. Accelerate Yamuna rejuvenation (sewage treatment capacity +40%)
   2. Replace 280km of pre-1970 CI pipes in Central Delhi â€” highest leak density
   3. Zone 4, 7, 11 now on alternate-day supply schedule

   Overall Delhi Water Score: 58/100 â€” Warning level."
```

---


## Shield Agent Governance

WaterOS implements a four-layer governance framework in `backend/app/agents/governance/` that wraps every agent execution ensuring safety, accountability, and human control.

```
Every agent.execute() call runs this pipeline:
================================================================
 1. Rate Limit Check       -- per-agent sliding window (60s)
 2. Input Guardrails       -- injection detection, range validation
 3. Agent Logic            -- Gemini 1.5 Pro + domain tools
 4. Output Guardrails      -- required fields, confidence floor, contradiction check
 5. Governance Rules       -- human-in-the-loop, escalation, SLA monitoring
 6. Circuit Breaker        -- trips after 3 failures, auto-resets in 120s
================================================================
```

### Layer 1 - Agent Instructions (`instructions.py`)

Every agent carries a formal instruction set injected directly into Gemini via `system_instruction` on every call.

| Component | Description |
|-----------|-------------|
| **Role** | Named specialist role (e.g. "Flood Risk Specialist") |
| **Domain** | Area of expertise the agent operates within |
| **System Prompt** | Full behavioural instructions — what to assert, cite, how to express uncertainty |
| **Forbidden Actions** | Explicit list of things the agent must never do |
| **Required Output Fields** | Fields that must be present — validated by output guardrails |
| **Confidence Floor** | Minimum confidence below which result is flagged for human review |
| **Escalation Triggers** | Risk levels that automatically route to human review |

Example — Emergency Agent forbidden actions:
```python
"forbidden_actions": [
    "Do not activate emergency protocols without HIGH/CRITICAL signal from a specialist agent",
    "Do not issue public evacuation orders autonomously — require human_approval flag = True",
    "Do not downgrade a HIGH risk to LOW without specialist agent re-assessment",
],
"human_in_the_loop": True,
```

### Layer 2 - Guardrails (`guardrails.py`)

**Input guardrails** — run before agent executes:
- Code injection detection (`eval`, `exec`, `os.system`, `__import__`)
- Numeric range validation (river levels 0-30m, rainfall >= 0)
- Circuit breaker check — blocks calls when agent is in OPEN state

**Output guardrails** — run after agent returns:
- All `output_required_fields` must be present or execution is rejected
- Confidence must meet the agent's `confidence_floor` or result is blocked
- WQI contradiction check: WQI < 50 cannot be marked WHO-compliant
- Emergency: HIGH/CRITICAL alerts must carry `human_approval_required = True`

**Circuit Breaker:**
```
3 consecutive failures  -->  OPEN (all calls blocked)
         120 seconds
AUTO-RESET              -->  CLOSED (normal operation)
```

### Layer 3 - Protocols (`protocols.py`)

**A2A Message Envelope (v1.0)** wraps every agent-to-agent call:
```json
{
  "protocol_version": "1.0",
  "message_id": "uuid",
  "caller": "flood_agent",
  "callee": "rainfall_agent",
  "trust_level": 3,
  "ttl_ms": 30000
}
```

**Agent Trust Hierarchy:**

| Level | Agents |
|-------|--------|
| 5 | Global Coordinator |
| 4 | Decision Agent, Emergency Agent |
| 3 | Flood Agent, Water Quality Agent |
| 2 | Rainfall, Reservoir, Climate, Country, Groundwater, Infrastructure, Leak Detection |
| 1 | Sensor Intelligence, Report Generation |

**Allowed A2A Invocation Topology** (enforced at runtime — violations are blocked and logged):
```
global_coordinator  --> country_agent, climate_agent, decision_agent
decision_agent      --> flood_agent, emergency_agent, rainfall_agent,
                        reservoir_agent, water_quality_agent, infrastructure_agent
flood_agent         --> rainfall_agent, reservoir_agent
water_quality_agent --> sensor_intelligence
country_agent       --> flood_agent, water_quality_agent, groundwater_agent
emergency_agent     --> (leaf node -- cannot invoke other agents)
```

**Rate Limits** (sliding 60-second window):

| Agent | Calls / 60s |
|-------|-------------|
| Sensor Intelligence | 20 |
| Rainfall Agent | 15 |
| Country Agent | 12 |
| Flood, Reservoir, Water Quality | 10 |
| Decision Agent | 6 |
| Emergency, Climate, Global Coordinator | 4-5 |

### Layer 4 - Governance Rules (`governance.py`)

**Human-in-the-Loop** — result flagged `human_review_required = True` when:
- Confidence < 0.65
- Risk level is HIGH or CRITICAL
- Any public alert or evacuation order is generated
- Agent is in the always-HIL list (emergency_agent, decision_agent)

**SLA Monitoring:**
```
> 5,000ms   --> WARNING logged
> 10,000ms  --> SLA BREACH + governance_report.sla_breach = True
```

**Audit Events** captured for every run:

| Event | Trigger |
|-------|---------|
| `AGENT_RUN_COMPLETE` | Every execution |
| `HIGH_RISK_ESCALATION` | Risk = high or critical |
| `LOW_CONFIDENCE` | Confidence below 0.65 |
| `HUMAN_LOOP_AGENT` | Emergency / Decision agent runs |
| `PUBLIC_ACTION_GATE` | Evacuation or public alert output |
| `SLA_BREACH` | Latency > 10s |
| `HUMAN_OVERRIDE` | Human overrides a recommendation |

**Human Override** — full audit trail:
```bash
POST /api/v1/agents/governance/override
{
  "agent_id": "flood_agent",
  "original_recommendation": "Evacuate Kamrup district immediately",
  "override_decision": "Issue watch-only -- evacuation deferred 6 hours",
  "reason": "NDRF teams not yet positioned"
}
```

### Governance REST API

| Endpoint | Description |
|----------|-------------|
| `GET /agents/governance/instructions` | All 14 agent system prompts and constraints |
| `GET /agents/governance/instructions/{id}` | Single agent full instruction set |
| `GET /agents/governance/audit` | Full audit log, filterable by agent and event type |
| `GET /agents/governance/circuit-breakers` | Circuit breaker state for all agents |
| `GET /agents/governance/rate-limits` | Rate limit usage per agent |
| `GET /agents/governance/summary` | Escalations, overrides, SLA breaches summary |
| `POST /agents/governance/override` | Record human override with full provenance |

---
## Hackathon Highlights

This project was built for **Google AI Hackathon 2026** and demonstrates:

1. **Google ADK** â€” purpose-built multi-agent orchestration using the Agent Development Kit
2. **Gemini 1.5 Pro** â€” powering all 14 agents with long-context reasoning and structured outputs
3. **Agent-to-Agent (A2A)** â€” agents invoke each other in directed chains, results flow as context
4. **MCP Integration** â€” Model Context Protocol server exposes water domain tools to all agents
5. **Real-world Impact** â€” water security is a top-3 global risk; this platform addresses monitoring, prediction, and response at scale
6. **Production Architecture** â€” not a demo toy: PostgreSQL, Kafka, Redis, Qdrant, Docker, JWT, async throughout

---

## ðŸ“ Project Structure

```
WaterOS/
â”œâ”€â”€ frontend/                   # React 19 + TypeScript application
â”‚   â””â”€â”€ src/
â”‚       â”œâ”€â”€ pages/              # 20 application pages
â”‚       â”œâ”€â”€ components/         # Reusable UI components
â”‚       â”œâ”€â”€ store/              # Zustand state stores
â”‚       â”‚   â”œâ”€â”€ authStore.ts    # JWT auth state (persisted)
â”‚       â”‚   â”œâ”€â”€ agentStore.ts   # Agent state
â”‚       â”‚   â””â”€â”€ agentSessionStore.ts  # Session + chat history (persisted)
â”‚       â”œâ”€â”€ services/api.ts     # Axios API client + all endpoint definitions
â”‚       â””â”€â”€ types/              # TypeScript type definitions
â”‚
â”œâ”€â”€ backend/                    # FastAPI Python application
â”‚   â””â”€â”€ app/
â”‚       â”œâ”€â”€ agents/             # 14 Google ADK agent implementations
â”‚       â”‚   â”œâ”€â”€ base_agent.py   # BaseWaterAgent + AgentResult
â”‚       â”‚   â”œâ”€â”€ decision_agent.py
â”‚       â”‚   â”œâ”€â”€ flood_agent.py
â”‚       â”‚   â””â”€â”€ ...
â”‚       â”œâ”€â”€ api/v1/endpoints/   # REST API routes
â”‚       â”‚   â””â”€â”€ agents.py       # Sessions, memory, observability
â”‚       â”œâ”€â”€ models/             # SQLAlchemy models
â”‚       â”‚   â””â”€â”€ agent.py        # AgentExecution + AgentMemory tables
â”‚       â”œâ”€â”€ mcp/server.py       # MCP tool server
â”‚       â””â”€â”€ main.py             # FastAPI app + WebSocket + DB init
â”‚
â”œâ”€â”€ docs/
â”‚   â””â”€â”€ architecture.md         # Full architecture diagram
â”œâ”€â”€ docker-compose.yml          # 8-service container orchestration
â””â”€â”€ README.md
```

---

## ðŸ“„ License

MIT License â€” see [LICENSE](LICENSE) for details.

---

<div align="center">

Built with â¤ï¸ for **Google AI Hackathon 2026**

*Protecting Earth's most precious resource with AI*

[![GitHub](https://img.shields.io/badge/GitHub-Muralee99%2FWaterOS-181717?style=for-the-badge&logo=github)](https://github.com/Muralee99/WaterOS)

</div>

