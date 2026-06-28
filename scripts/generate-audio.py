"""
WaterOS Demo Audio Generator
Uses Microsoft Edge TTS (free, no API key, neural voices)
Produces: demo/voiceover.mp3

Install:  pip install edge-tts asyncio
Run:      python scripts/generate-audio.py
Merge:    ffmpeg -i demo/wateros-demo.mp4 -i demo/voiceover.mp3
              -c:v copy -c:a aac -shortest demo/wateros-demo-final.mp4
"""

import asyncio
import edge_tts
import os

# â”€â”€ Voice selection â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
# Options (all free Microsoft neural voices):
#   en-US-AndrewMultilingualNeural  â€” deep, authoritative male (best for tech demos)
#   en-US-BrianMultilingualNeural   â€” warm, confident male
#   en-US-EmmaMultilingualNeural    â€” clear, professional female
#   en-US-AvaMultilingualNeural     â€” friendly, expressive female
#   en-GB-RyanNeural                â€” British male, polished
VOICE = "en-US-AndrewMultilingualNeural"

# Speech rate: +0% normal, -10% slightly slower (better for technical content)
RATE  = "-8%"

# Pitch: +0Hz normal, slightly lower sounds more authoritative
PITCH = "-3Hz"

OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "demo")
OUT_MP3 = os.path.join(OUT_DIR, "voiceover.mp3")
OUT_SRT = os.path.join(OUT_DIR, "voiceover.srt")

# â”€â”€ Narration â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
# Timed to the 2m57s demo video.
# SSML pauses <break time="Xs"/> control exact sync with video cuts.
NARRATION = """
Water stress affects 4 billion people â€” nearly half of humanity.
<break time="0.6s"/>
WaterOS is an AI-native, multi-agent water intelligence platform
built for the Google AI Hackathon 2026.
<break time="0.8s"/>

Under the hood, WaterOS runs 14 specialized autonomous agents,
each built on Google's Agent Development Kit â€” ADK â€”
and powered by Gemini 1.5 Pro.
<break time="0.4s"/>
These agents don't just retrieve data.
They reason, collaborate, and act.
<break time="0.9s"/>

The platform opens with a secure JSON Web Token authenticated session.
The real-time dashboard surfaces global KPIs â€”
Water Quality Index, flood risk scores, reservoir capacity, and pipeline pressure â€”
alongside a live AI inference feed where agents stream their findings directly to the UI.
<break time="0.7s"/>

The Global Intelligence view ingests data from 195 countries â€”
satellite feeds, IoT sensors, hydrological APIs, and climate models â€”
running continuous anomaly detection to flag emerging crises before they escalate.
<break time="0.8s"/>

Geographic Intelligence gives you full drill-down â€”
global to country, state, city, and basin level.
<break time="0.4s"/>
Click any country, and the Country Agent fires instantly â€”
aggregating multi-source data and generating an AI risk assessment
using Gemini's 1-million-token context window.
<break time="0.8s"/>

River basins show live gauge readings with flood crest predictions.
<break time="0.3s"/>
Cities display infrastructure health scores and WHO water quality compliance.
<break time="0.3s"/>
The sensor grid refreshes every 5 seconds from over 10,000 IoT data points.
<break time="0.3s"/>
Pipeline networks run continuous leak detection using acoustic pressure analysis.
<break time="0.3s"/>
Reservoir monitoring tracks real-time inflow, outflow, and overflow risk.
<break time="0.9s"/>

Here is where WaterOS goes beyond dashboards â€”
14 autonomous AI agents, each a specialist.
<break time="0.4s"/>
The Flood Agent. Rainfall Agent. Reservoir Agent.
Water Quality Agent. Leak Detection Agent. Climate Agent.
Emergency Agent. Country Agent. Groundwater Agent.
Decision Agent. Global Coordinator. Infrastructure Agent.
Sensor Intelligence. And Report Generation Agent.
<break time="0.7s"/>

Every agent runs on Google ADK's multi-turn reasoning loop.
<break time="0.4s"/>
Select a geographic scope â€” here, India, Assam â€”
and fire the Flood Agent.
<break time="0.8s"/>

Watch the live step trace animate in real time.
<break time="0.4s"/>
The agent loads episodic memory from prior runs stored in PostgreSQL,
then calls Model Context Protocol tools â€”
predictFloodCrest, calculateDischarge, detectAnomalies â€”
builds a multi-step reasoning chain,
and returns a structured result with confidence score and latency metrics.
<break time="0.9s"/>

This is Agent-to-Agent protocol â€” A2A.
<break time="0.4s"/>
The Decision Agent acts as orchestrator.
It invokes the Emergency, Rainfall, and Reservoir agents as sub-agents,
collects their outputs, runs Multi-Criteria Decision Analysis,
and returns a ranked recommendation with cost-benefit ratio.
<break time="0.5s"/>
All agent-to-agent calls are logged, traceable, and observable.
<break time="0.9s"/>

Full Observability is built in at every layer.
<break time="0.4s"/>
The Observability Dashboard shows live agent status via WebSocket,
execution timelines across all 14 agents,
per-agent latency and confidence performance bars,
tool call frequency analytics,
and an Agent Memory Browser â€”
showing the episodic memories each agent carries forward between runs.
<break time="0.5s"/>
Sessions persist in both PostgreSQL and browser local storage via Zustand.
<break time="0.9s"/>

The intelligence layer adds Climate Analysis with drought indices,
7-day rainfall and temperature forecasting,
a 60-node Knowledge Graph connecting sensors, regions, and alerts,
a Digital Twin for flood and drought scenario simulation,
AI-generated real-time alerts, and automated executive and technical reports.
<break time="1.0s"/>

WaterOS.
<break time="0.5s"/>
Real-time intelligence for the world's most critical resource.
<break time="0.6s"/>
github dot com slash Muralee99 slash WaterOS.
"""

SSML = f"""<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis"
       xmlns:mstts="https://www.w3.org/2001/mstts"
       xml:lang="en-US">
  <voice name="{VOICE}">
    <prosody rate="{RATE}" pitch="{PITCH}">
      {NARRATION}
    </prosody>
  </voice>
</speak>"""


async def main():
    os.makedirs(OUT_DIR, exist_ok=True)

    print(f"Voice:  {VOICE}")
    print(f"Rate:   {RATE}  Pitch: {PITCH}")
    print(f"Output: {OUT_MP3}")
    print("Generating audio via Microsoft Edge TTS...")

    communicate = edge_tts.Communicate(NARRATION.strip(), VOICE, rate=RATE, pitch=PITCH)

    # Generate MP3 + word-level subtitles simultaneously
    subs = []
    audio_chunks = []

    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            audio_chunks.append(chunk["data"])
        elif chunk["type"] == "WordBoundary":
            subs.append({
                "start": chunk["offset"] / 10_000_000,   # 100-ns â†’ seconds
                "end":   (chunk["offset"] + chunk["duration"]) / 10_000_000,
                "word":  chunk["text"],
            })

    # Write MP3
    with open(OUT_MP3, "wb") as f:
        for chunk in audio_chunks:
            f.write(chunk)

    # Write SRT subtitles
    if subs:
        def fmt(s):
            h, r = divmod(s, 3600)
            m, r = divmod(r, 60)
            return f"{int(h):02}:{int(m):02}:{r:06.3f}".replace(".", ",")

        lines = []
        # Group words into ~6-word subtitle lines
        group_size = 6
        for i in range(0, len(subs), group_size):
            group = subs[i:i + group_size]
            start = group[0]["start"]
            end   = group[-1]["end"]
            text  = " ".join(w["word"] for w in group)
            lines.append(f"{i // group_size + 1}\n{fmt(start)} --> {fmt(end)}\n{text}\n")

        with open(OUT_SRT, "w", encoding="utf-8") as f:
            f.write("\n".join(lines))
        print(f"Subtitles: {OUT_SRT}")

    print(f"\nDone!  {OUT_MP3}")
    print("\nNext steps:")
    print("  1. Preview:  ffplay demo/voiceover.mp3")
    print("  2. Merge:    ffmpeg -i demo/wateros-demo.mp4 -i demo/voiceover.mp3 \\")
    print("                      -c:v copy -c:a aac -shortest demo/wateros-demo-final.mp4")
    print("  3. With subs: ffmpeg -i demo/wateros-demo-final.mp4 \\")
    print("                      -vf subtitles=demo/voiceover.srt demo/wateros-demo-subtitled.mp4")


asyncio.run(main())

