"""
WaterOS Demo Audio Generator
Uses Microsoft Edge TTS (free, no API key, neural voices)
Produces: demo/voiceover.mp3

Install:  pip install edge-tts
Run:      python scripts/generate-audio.py
Merge:    ffmpeg -i demo/wateros-demo.mp4 -i demo/voiceover.mp3
              -c:v copy -c:a aac -shortest demo/wateros-demo-final.mp4
"""

import asyncio
import edge_tts
import os

VOICE = "en-US-AndrewMultilingualNeural"
RATE  = "-8%"
PITCH = "-3Hz"

OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "demo")
OUT_MP3 = os.path.join(OUT_DIR, "voiceover.mp3")
OUT_SRT = os.path.join(OUT_DIR, "voiceover.srt")

# Plain text — no SSML tags. Natural pauses come from punctuation and line breaks.
NARRATION = """
Water stress affects 4 billion people, nearly half of humanity.

WaterOS is an AI-native, multi-agent water intelligence platform
built for the Google AI Hackathon 2026.

Under the hood, WaterOS runs 14 specialized autonomous agents,
each built on Google's Agent Development Kit, ADK,
and powered by Gemini 1.5 Pro.
These agents don't just retrieve data.
They reason, collaborate, and act.

The platform opens with a secure JSON Web Token authenticated session.
The real-time dashboard surfaces global KPIs,
Water Quality Index, flood risk scores, reservoir capacity, and pipeline pressure,
alongside a live AI inference feed where agents stream their findings directly to the UI.

The Global Intelligence view ingests data from 195 countries,
satellite feeds, IoT sensors, hydrological APIs, and climate models,
running continuous anomaly detection to flag emerging crises before they escalate.

Geographic Intelligence gives you full drill-down,
from global to country, state, city, and basin level.
Click any country, and the Country Agent fires instantly,
aggregating multi-source data and generating an AI risk assessment
using Gemini's one-million-token context window.

River basins show live gauge readings with flood crest predictions.
Cities display infrastructure health scores and WHO water quality compliance.
The sensor grid refreshes every 5 seconds from over 10,000 IoT data points.
Pipeline networks run continuous leak detection using acoustic pressure analysis.
Reservoir monitoring tracks real-time inflow, outflow, and overflow risk.

Here is where WaterOS goes beyond dashboards.
14 autonomous AI agents, each a specialist.
The Flood Agent. Rainfall Agent. Reservoir Agent.
Water Quality Agent. Leak Detection Agent. Climate Agent.
Emergency Agent. Country Agent. Groundwater Agent.
Decision Agent. Global Coordinator. Infrastructure Agent.
Sensor Intelligence. And Report Generation Agent.

Every agent runs on Google ADK's multi-turn reasoning loop.
Select a geographic scope, here India, Assam,
and fire the Flood Agent.

Watch the live step trace animate in real time.
The agent loads episodic memory from prior runs stored in PostgreSQL,
then calls Model Context Protocol tools,
predictFloodCrest, calculateDischarge, detectAnomalies,
builds a multi-step reasoning chain,
and returns a structured result with confidence score and latency metrics.

This is Agent-to-Agent protocol, A2A.
The Decision Agent acts as orchestrator.
It invokes the Emergency, Rainfall, and Reservoir agents as sub-agents,
collects their outputs, runs Multi-Criteria Decision Analysis,
and returns a ranked recommendation with cost-benefit ratio.
All agent-to-agent calls are logged, traceable, and observable.

Full Observability is built in at every layer.
The Observability Dashboard shows live agent status via WebSocket,
execution timelines across all 14 agents,
per-agent latency and confidence performance bars,
tool call frequency analytics,
and an Agent Memory Browser,
showing the episodic memories each agent carries forward between runs.
Sessions persist in both PostgreSQL and browser local storage via Zustand.

The intelligence layer adds Climate Analysis with drought indices,
7-day rainfall and temperature forecasting,
a 60-node Knowledge Graph connecting sensors, regions, and alerts,
a Digital Twin for flood and drought scenario simulation,
AI-generated real-time alerts, and automated executive and technical reports.

WaterOS.
Real-time intelligence for the world's most critical resource.
github dot com slash Muralee99 slash WaterOS.
"""


async def main():
    os.makedirs(OUT_DIR, exist_ok=True)

    print(f"Voice:  {VOICE}")
    print(f"Rate:   {RATE}  Pitch: {PITCH}")
    print(f"Output: {OUT_MP3}")
    print("Generating audio via Microsoft Edge TTS...")

    communicate = edge_tts.Communicate(NARRATION.strip(), VOICE, rate=RATE, pitch=PITCH)

    subs = []
    audio_chunks = []

    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            audio_chunks.append(chunk["data"])
        elif chunk["type"] == "WordBoundary":
            subs.append({
                "start": chunk["offset"] / 10_000_000,
                "end":   (chunk["offset"] + chunk["duration"]) / 10_000_000,
                "word":  chunk["text"],
            })

    with open(OUT_MP3, "wb") as f:
        for chunk in audio_chunks:
            f.write(chunk)

    if subs:
        def fmt(s):
            h, r = divmod(s, 3600)
            m, r = divmod(r, 60)
            return f"{int(h):02}:{int(m):02}:{r:06.3f}".replace(".", ",")

        lines = []
        group_size = 6
        for i in range(0, len(subs), group_size):
            group = subs[i:i + group_size]
            text  = " ".join(w["word"] for w in group)
            lines.append(f"{i // group_size + 1}\n{fmt(group[0]['start'])} --> {fmt(group[-1]['end'])}\n{text}\n")

        with open(OUT_SRT, "w", encoding="utf-8") as f:
            f.write("\n".join(lines))
        print(f"Subtitles: {OUT_SRT}")

    print(f"\nDone!  {OUT_MP3}")
    print("\nNext steps:")
    print("  1. Preview:  ffplay demo/voiceover.mp3")
    print("  2. Merge:    ffmpeg -i demo/wateros-demo.mp4 -i demo/voiceover.mp3 \\")
    print("                      -c:v copy -c:a aac -shortest demo/wateros-demo-final.mp4")


asyncio.run(main())
