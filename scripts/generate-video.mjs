/**
 * WaterOS Demo Video Generator
 * 1920x1080 Â· H.264 Â· YouTube-ready Â· Ken Burns + crossfade
 */

import { execSync } from 'child_process'
import { mkdirSync, existsSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT  = join(__dirname, '..')
const SHOTS = join(ROOT, 'demo', 'screenshots')
const TMP   = join(ROOT, 'demo', 'tmp_clips')
const OUT   = join(ROOT, 'demo', 'wateros-demo.mp4')
mkdirSync(TMP, { recursive: true })

const FONT_BOLD   = 'C\\:/Windows/Fonts/arialbd.ttf'
const FONT_NORMAL = 'C\\:/Windows/Fonts/arial.ttf'

function run(cmd, label) {
  console.log(`  [ffmpeg] ${label}`)
  execSync(cmd, { stdio: 'pipe' })
}

// â”€â”€ Sequence â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const SEQ = [
  // Intro
  { type: 'title', title: 'WaterOS',               sub: 'AI-Native Multi-Agent Water Intelligence Platform',        dur: 4 },
  { type: 'title', title: 'Google AI Hackathon 2026', sub: 'Google ADK   Gemini 1.5 Pro   14 Autonomous Agents',   dur: 3 },

  // Platform
  { type: 'title', title: 'The Platform',           sub: 'A complete water intelligence nerve center',               dur: 2 },
  { type: 'slide', file: '01-login.png',            dur: 4,  zoom: 'in'  },
  { type: 'slide', file: '02-dashboard.png',        dur: 6,  zoom: 'pan' },
  { type: 'slide', file: '03-global.png',           dur: 5,  zoom: 'in'  },

  // Geographic
  { type: 'title', title: 'Geographic Intelligence', sub: 'Global to Country to State to City drill-down',           dur: 2 },
  { type: 'slide', file: '04-countries.png',        dur: 5,  zoom: 'pan' },
  { type: 'slide', file: '04b-countries-ai-insights.png', dur: 6, zoom: 'in' },
  { type: 'slide', file: '08b-rivers-ai-insights.png',    dur: 5, zoom: 'pan' },
  { type: 'slide', file: '06b-cities-ai-insights.png',    dur: 5, zoom: 'in' },
  { type: 'slide', file: '07-sensors.png',          dur: 4,  zoom: 'pan' },
  { type: 'slide', file: '09-pipelines.png',        dur: 4,  zoom: 'in'  },
  { type: 'slide', file: '19-reservoirs.png',       dur: 4,  zoom: 'pan' },
  { type: 'slide', file: '10-water-quality.png',    dur: 4,  zoom: 'in'  },

  // Agents
  { type: 'title', title: '14 Autonomous AI Agents', sub: 'Built on Google ADK   Powered by Gemini 1.5 Pro',       dur: 3 },
  { type: 'slide', file: '13-agents-overview.png',  dur: 5,  zoom: 'in'  },
  { type: 'slide', file: '13b-agents-geo-context.png', dur: 4, zoom: 'pan' },
  { type: 'title', title: 'Live Step Trace',        sub: 'Every reasoning step streams to the UI in real time',     dur: 2 },
  { type: 'slide', file: '13c-agents-live-trace.png',  dur: 6, zoom: 'in' },
  { type: 'slide', file: '13d-agents-result.png',   dur: 6,  zoom: 'pan' },
  { type: 'slide', file: '13e-agents-reasoning-chain.png', dur: 5, zoom: 'in' },

  // A2A
  { type: 'title', title: 'Agent-to-Agent Protocol', sub: 'Decision Agent orchestrates Emergency Rainfall Reservoir agents', dur: 3 },
  { type: 'slide', file: '13g-decision-agent-running.png', dur: 5, zoom: 'pan' },
  { type: 'slide', file: '13h-decision-agent-result.png',  dur: 6, zoom: 'in'  },

  // Observability
  { type: 'title', title: 'Full Observability',     sub: 'Sessions   Memory   Performance   Live Status',           dur: 3 },
  { type: 'slide', file: '13f-agents-observability.png',   dur: 5, zoom: 'pan' },
  { type: 'slide', file: '21-observability.png',    dur: 7,  zoom: 'in'  },
  { type: 'slide', file: '21b-observability-performance.png', dur: 6, zoom: 'pan' },

  // Intelligence
  { type: 'title', title: 'Intelligence and Analytics', sub: 'Climate   Forecast   Knowledge Graph   Digital Twin', dur: 2 },
  { type: 'slide', file: '11-climate.png',          dur: 4,  zoom: 'in'  },
  { type: 'slide', file: '12-forecast.png',         dur: 4,  zoom: 'pan' },
  { type: 'slide', file: '14-workflow.png',         dur: 5,  zoom: 'in'  },
  { type: 'slide', file: '15-knowledge-graph.png',  dur: 5,  zoom: 'pan' },
  { type: 'slide', file: '16-digital-twin.png',     dur: 5,  zoom: 'in'  },
  { type: 'slide', file: '17-alerts.png',           dur: 4,  zoom: 'pan' },
  { type: 'slide', file: '18-reports.png',          dur: 4,  zoom: 'in'  },

  // Stack
  { type: 'title', title: 'Production-Grade Stack', sub: 'FastAPI   PostgreSQL   Redis   Kafka   Qdrant   Docker',  dur: 3 },
  { type: 'slide', file: '20-settings.png',         dur: 3,  zoom: 'pan' },

  // Outro
  { type: 'title', title: 'WaterOS',               sub: '4 billion people. Real-time crises. Real-time intelligence.', dur: 4 },
  { type: 'title', title: 'github.com/Muralee99/WaterOS', sub: 'Google AI Hackathon 2026',                          dur: 5 },
]

// â”€â”€ Title clip â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function titleClip(title, sub, dur, out) {
  const fps = 30
  const fi = 0.5   // fade-in duration
  const fo = dur - 0.5  // fade-out start
  const vf = [
    `drawtext=fontfile='${FONT_BOLD}':text='${title}':fontcolor=white:fontsize=68:x=(w-text_w)/2:y=(h-text_h)/2-55:shadowcolor=black:shadowx=2:shadowy=2`,
    `drawtext=fontfile='${FONT_NORMAL}':text='${sub}':fontcolor=0x94a3b8:fontsize=30:x=(w-text_w)/2:y=(h-text_h)/2+60:shadowcolor=black:shadowx=1:shadowy=1`,
    `fade=t=in:st=0:d=${fi}`,
    `fade=t=out:st=${fo}:d=0.5`,
  ].join(',')
  run(
    `ffmpeg -y -f lavfi -i "color=c=0x0d1117:s=1920x1080:r=${fps}" -vf "${vf}" -t ${dur} -c:v libx264 -preset ultrafast -crf 18 -pix_fmt yuv420p "${out}"`,
    `title: ${title}`
  )
}

// â”€â”€ Slide clip (Ken Burns) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function slideClip(imgPath, dur, zoom, out) {
  const fps = 30
  const d   = dur * fps

  let z, x, y
  if (zoom === 'in') {
    z = `min(1+on/${d}*0.12,1.12)`
    x = `iw/2-(iw/zoom/2)`
    y = `ih/2-(ih/zoom/2)`
  } else {
    // pan left to right
    z = `1.10`
    x = `(iw-iw/zoom)*on/${d}`
    y = `ih/2-(ih/zoom/2)`
  }

  const vf = [
    `scale=1920:1080:force_original_aspect_ratio=increase`,
    `crop=1920:1080`,
    `zoompan=z='${z}':x='${x}':y='${y}':d=${d}:s=1920x1080:fps=${fps}`,
    `setsar=1`,
    `fade=t=in:st=0:d=0.4`,
    `fade=t=out:st=${dur - 0.4}:d=0.4`,
  ].join(',')

  run(
    `ffmpeg -y -loop 1 -t ${dur} -i "${imgPath}" -vf "${vf}" -c:v libx264 -preset ultrafast -crf 18 -pix_fmt yuv420p -t ${dur} "${out}"`,
    `slide ${dur}s ${zoom}: ${imgPath.split(/[\\/]/).pop()}`
  )
}

// â”€â”€ Main â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
console.log('\n WaterOS Demo Video Generator')
console.log('================================\n')

const clips = []
let idx = 0

for (const item of SEQ) {
  idx++
  const clipOut = join(TMP, `clip_${String(idx).padStart(3, '0')}.mp4`)
  const tag = `[${idx}/${SEQ.length}]`

  if (item.type === 'title') {
    console.log(`${tag} Title: "${item.title}"`)
    titleClip(item.title, item.sub, item.dur, clipOut)
    clips.push(clipOut)
    continue
  }

  const imgPath = join(SHOTS, item.file)
  if (!existsSync(imgPath)) {
    console.log(`${tag} SKIP (missing): ${item.file}`)
    continue
  }
  console.log(`${tag} Slide: ${item.file}`)
  slideClip(imgPath, item.dur, item.zoom, clipOut)
  clips.push(clipOut)
}

console.log(`\n Concatenating ${clips.length} clips...`)
const listPath = join(TMP, 'concat.txt')
writeFileSync(listPath, clips.map(c => `file '${c.replace(/\\/g, '/')}'`).join('\n'), 'utf8')

const rawPath = join(TMP, 'raw.mp4')
run(`ffmpeg -y -f concat -safe 0 -i "${listPath}" -c copy "${rawPath}"`, 'concat clips')

// Get duration for fade-out
const totalDur = parseFloat(
  execSync(`ffprobe -v error -show_entries format=duration -of csv=p=0 "${rawPath}"`, { encoding: 'utf8' }).trim()
)
const fadeOutStart = Math.max(totalDur - 1.5, totalDur - 2)

console.log(`\n Total duration: ${(totalDur / 60).toFixed(1)} minutes`)
console.log(` Final encode (YouTube H.264, -movflags faststart)...`)

run(
  `ffmpeg -y -i "${rawPath}" ` +
  `-vf "fade=t=in:st=0:d=1,fade=t=out:st=${fadeOutStart.toFixed(2)}:d=1.5" ` +
  `-c:v libx264 -preset slow -crf 17 -pix_fmt yuv420p -movflags +faststart -an "${OUT}"`,
  'final encode'
)

const size = (existsSync(OUT) ? Math.round(require('fs').statSync(OUT).size / 1024 / 1024) : 0)
console.log(`\n Video ready: demo/wateros-demo.mp4`)
console.log(`   Size: ${size}MB  |  Duration: ${(totalDur / 60).toFixed(2)} min`)
console.log(`\n Add voiceover (optional):`)
console.log(`   ffmpeg -i demo/wateros-demo.mp4 -i voiceover.mp3 -c:v copy -c:a aac -shortest demo/wateros-demo-final.mp4`)

