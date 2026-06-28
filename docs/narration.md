# WaterOS Demo Narration Script
# Duration: 2m 57s · ~380 words · pace: ~130 wpm
# Voice: en-US-AndrewMultilingualNeural (Microsoft Edge TTS)

---

[0:00] Water stress affects 4 billion people — nearly half of humanity.
WaterOS is an AI-native, multi-agent water intelligence platform
built for the Google AI Hackathon 2025.

[0:08] Under the hood, WaterOS runs 14 specialized autonomous agents,
each built on Google's Agent Development Kit — ADK —
and powered by Gemini 1.5 Pro.
These agents don't just retrieve data.
They reason, collaborate, and act.

[0:20] The platform opens with a secure JSON Web Token authenticated session.
The real-time dashboard surfaces global KPIs —
Water Quality Index, flood risk scores, reservoir capacity, and pipeline pressure —
alongside a live AI inference feed where agents stream their findings directly to the UI.

[0:36] The Global Intelligence view ingests data from 195 countries —
satellite feeds, IoT sensors, hydrological APIs, and climate models —
running continuous anomaly detection to flag emerging crises before they escalate.

[0:49] Geographic Intelligence gives you full drill-down —
global to country, state, city, and basin level.
Click any country, and the Country Agent fires instantly —
aggregating multi-source data and generating an AI risk assessment
using Gemini's 1-million-token context window.

[1:03] River basins show live gauge readings with flood crest predictions.
Cities display infrastructure health scores and WHO water quality compliance.
The sensor grid refreshes every 5 seconds from over 10,000 IoT data points.
Pipeline networks run continuous leak detection using acoustic pressure analysis.
Reservoir monitoring tracks real-time inflow, outflow, and overflow risk.

[1:25] Here is where WaterOS goes beyond dashboards —
14 autonomous AI agents, each a specialist.
The Flood Agent, Rainfall Agent, Reservoir Agent,
Water Quality Agent, Leak Detection Agent, Climate Agent,
Emergency Agent, Country Agent, Groundwater Agent,
Decision Agent, Global Coordinator, Infrastructure Agent,
Sensor Intelligence, and Report Generation Agent.

[1:40] Every agent is built on Google ADK's multi-turn reasoning loop.
Select a geographic scope — here, India, Assam —
and fire the Flood Agent.

[1:48] Watch the live step trace animate in real time:
the agent loads episodic memory from prior runs stored in PostgreSQL,
calls the Model Context Protocol tools —
predictFloodCrest, calculateDischarge, detectAnomalies —
then builds a multi-step reasoning chain
before returning a structured result with confidence score and latency metrics.

[2:05] This is Agent-to-Agent protocol — A2A.
The Decision Agent acts as orchestrator.
It invokes the Emergency, Rainfall, and Reservoir agents as sub-agents,
collects their outputs, runs Multi-Criteria Decision Analysis — MCDA —
and returns a ranked recommendation with cost-benefit ratio and confidence.
All agent-to-agent calls are logged, traceable, and observable.

[2:22] Full Observability is built in at every layer.
The observability dashboard shows live agent status via WebSocket,
execution timelines across all 14 agents,
per-agent latency and confidence performance bars,
tool call frequency analytics,
and an Agent Memory Browser —
showing the episodic memories each agent carries forward between runs.
Sessions persist in both PostgreSQL and browser local storage via Zustand.

[2:42] The intelligence layer adds Climate Analysis with drought indices,
7-day rainfall and temperature forecasting,
a 60-node Knowledge Graph connecting sensors, regions, and alerts,
a Digital Twin for flood and drought scenario simulation,
AI-generated real-time alerts, and automated executive and technical reports.

[2:55] WaterOS — real-time intelligence for the world's most critical resource.
github dot com slash Muralee99 slash WaterOS.
