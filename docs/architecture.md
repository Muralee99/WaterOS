# WaterOS Architecture

```
                        ┌──────────────────────────────────────────────────────────────┐
                        │                    WaterOS Platform                          │
                        └──────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                   PRESENTATION LAYER                                    │
│                                                                                         │
│   ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│   │              React 19 + TypeScript + Vite  (Docker :3000)                       │   │
│   │                                                                                 │   │
│   │  Dashboard   Countries  Rivers  Pipelines  Sensors  Cities  Water Quality       │   │
│   │                                                                                 │   │
│   │  ┌───────────────────┐  ┌──────────────────┐  ┌──────────────────────────┐     │   │
│   │  │  Agent Console    │  │  Observability   │  │  Knowledge Graph /       │     │   │
│   │  │  - 14 AI Agents   │  │  - Session Hist  │  │  Digital Twin /          │     │   │
│   │  │  - Live Trace     │  │  - Live Metrics  │  │  Workflow / Reports      │     │   │
│   │  │  - Decision Chat  │  │  - Agent Memory  │  │                          │     │   │
│   │  └───────────────────┘  └──────────────────┘  └──────────────────────────┘     │   │
│   │                                                                                 │   │
│   │  State: Zustand (persist) · React Query · Framer Motion · Tailwind CSS         │   │
│   └─────────────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────────────┘
                                          │ HTTP / WebSocket
                                          ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                     API LAYER                                           │
│                                                                                         │
│   ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│   │           FastAPI + Python  (Docker :8000)  · JWT Auth · CORS                   │   │
│   │                                                                                 │   │
│   │  /auth  /dashboard  /countries  /states  /cities  /rivers  /reservoirs          │   │
│   │  /pipelines  /sensors  /water-quality  /climate  /forecast  /alerts             │   │
│   │  /reports  /simulation  /graph  /mcp                                            │   │
│   │                                                                                 │   │
│   │  ┌─────────────────────────────────────────────────────────────────────────┐   │   │
│   │  │  /agents                                                                 │   │   │
│   │  │  POST /run      → execute agent + save AgentExecution + write memory     │   │   │
│   │  │  POST /chat     → Decision Agent chat + persist session                  │   │   │
│   │  │  GET  /sessions → list runs from PostgreSQL                              │   │   │
│   │  │  GET  /observability → aggregate stats, per-agent metrics, timeline      │   │   │
│   │  │  GET  /memory/{id}  → retrieve episodic agent memories                  │   │   │
│   │  └─────────────────────────────────────────────────────────────────────────┘   │   │
│   │                                                                                 │   │
│   │  WebSocket /ws/live-data  · WebSocket /ws/agents                               │   │
│   └─────────────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────────────┘
                                          │
                    ┌─────────────────────┼──────────────────────┐
                    ▼                     ▼                      ▼
┌───────────────────────┐   ┌─────────────────────────┐  ┌──────────────────────────────┐
│   AI AGENT LAYER      │   │   MESSAGE STREAMING      │  │   MCP SERVER                 │
│                       │   │                          │  │                              │
│  Google ADK Agents    │   │  Apache Kafka :9092      │  │  Model Context Protocol      │
│  (Gemini 1.5 Pro)     │   │  · Sensor telemetry      │  │  · Water data tools          │
│                       │   │  · Alert events          │  │  · Sensor query tools        │
│  · Flood Agent        │   │  · Agent results         │  │  · Forecast tools            │
│  · Rainfall Agent     │   │                          │  │  · Report generation         │
│  · Reservoir Agent    │   │  Zookeeper (coordination)│  │                              │
│  · Water Quality      │   └─────────────────────────┘  └──────────────────────────────┘
│  · Leak Detection     │
│  · Climate Agent      │   ┌─────────────────────────────────────────────────────────┐
│  · Emergency Agent    │   │              DATA LAYER                                  │
│  · Country Agent      │   │                                                         │
│  · Groundwater        │   │  PostgreSQL :5432    Redis :6379     Qdrant :6333        │
│  · Decision Agent     │   │  · Countries          · Auth cache    · Vector search    │
│  · Global Coordinator │   │  · Rivers/Pipelines   · Session TTL   · Semantic query   │
│  · Infrastructure     │   │  · Sensors/Cities     · Rate limits   · Knowledge graph  │
│  · Report Generation  │   │  · AgentExecution     · Pub/Sub       · Embeddings       │
│                       │   │  · AgentMemory        ·               ·                  │
│  Celery Workers       │   │  · Users/Alerts       ·               ·                  │
│  (async task queue)   │   └─────────────────────────────────────────────────────────┘
└───────────────────────┘
```

## Component Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 19 + TypeScript + Vite | Interactive water intelligence dashboard |
| State | Zustand (persist) + React Query | Client state, server cache, localStorage persist |
| API | FastAPI + Python + JWT | REST API + WebSocket + auth |
| Agents | Google ADK + Gemini 1.5 Pro | 14 AI agents with reasoning chains |
| Agent Memory | PostgreSQL `agent_memory` | Episodic memory — context across runs |
| Agent Sessions | PostgreSQL `agent_execution` | Full run history + observability |
| Streaming | Apache Kafka + Zookeeper | Real-time sensor telemetry |
| Cache | Redis | Auth tokens, session TTL, pub/sub |
| Vector DB | Qdrant | Semantic search, knowledge graph embeddings |
| Task Queue | Celery | Async background agent tasks |
| MCP | Model Context Protocol Server | Standardised tool interface for agents |

## Data Flow — Agent Run

```
User clicks Run
     │
     ▼
AgentConsolePage
 setLiveTrace → step animation
     │
     ▼
POST /api/v1/agents/run
     │
     ├─ Load AgentMemory (past context)
     │
     ├─ Execute Agent (Gemini 1.5 Pro or fallback)
     │   └─ reasoning_chain built step-by-step
     │
     ├─ Save AgentExecution → PostgreSQL
     │
     ├─ Write episodic AgentMemory → PostgreSQL
     │
     └─ Return {result, reasoning_chain, execution_id, session_id}
          │
          ▼
     Frontend: agentSessionStore (localStorage + backend sync)
     Observability tab refreshes: stats, timeline, per-agent metrics
```
