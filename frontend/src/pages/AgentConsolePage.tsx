import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bot, Play, ChevronDown, ChevronRight,
  Brain, Zap, MessageSquare, Loader2, Send, Globe, Flag, Building2, MapPin
} from 'lucide-react'
import { agentApi } from '@/services/api'
import { GlassCard } from '@/components/ui/GlassCard'
import { cn } from '@/utils/cn'
import type { AgentResult } from '@/types'
import toast from 'react-hot-toast'

const GEO_DATA: Record<string, { states: Record<string, string[]> }> = {
  'India':         { states: { 'Maharashtra': ['Mumbai', 'Pune', 'Nagpur'], 'Rajasthan': ['Jaipur', 'Jodhpur', 'Udaipur'], 'Assam': ['Guwahati', 'Dibrugarh'], 'Punjab': ['Ludhiana', 'Amritsar'] } },
  'United States': { states: { 'California': ['Los Angeles', 'San Francisco', 'San Diego'], 'Texas': ['Houston', 'Dallas', 'Austin'], 'Florida': ['Miami', 'Orlando', 'Tampa'] } },
  'China':         { states: { 'Sichuan': ['Chengdu', 'Mianyang'], 'Xinjiang': ['Ürümqi', 'Kashgar'], 'Hubei': ['Wuhan', 'Yichang'] } },
  'Brazil':        { states: { 'São Paulo': ['São Paulo City', 'Campinas', 'Santos'], 'Amazonas': ['Manaus', 'Parintins'] } },
  'Australia':     { states: { 'Queensland': ['Brisbane', 'Cairns', 'Townsville'], 'New South Wales': ['Sydney', 'Newcastle'] } },
  'Germany':       { states: { 'Bavaria': ['Munich', 'Nuremberg', 'Augsburg'], 'Berlin': ['Berlin City'] } },
  'Egypt':         { states: { 'Cairo Governorate': ['Cairo', 'Giza'], 'Aswan': ['Aswan City', 'Edfu'] } },
  'Nigeria':       { states: { 'Lagos': ['Lagos City', 'Ikeja'], 'Kano': ['Kano City', 'Wudil'] } },
  'Japan':         { states: { 'Tokyo': ['Tokyo City', 'Yokohama'], 'Osaka': ['Osaka City', 'Kyoto'] } },
  'Canada':        { states: { 'Ontario': ['Toronto', 'Ottawa', 'Hamilton'], 'British Columbia': ['Vancouver', 'Victoria'] } },
  'Russia':        { states: { 'Moscow Oblast': ['Moscow', 'Podolsk'], 'Siberia': ['Novosibirsk', 'Omsk'] } },
  'Indonesia':     { states: { 'Java': ['Jakarta', 'Surabaya', 'Bandung'], 'Sumatra': ['Medan', 'Palembang'] } },
  'Bangladesh':    { states: { 'Dhaka Division': ['Dhaka City', 'Narayanganj'], 'Chittagong': ['Chittagong City'] } },
  'France':        { states: { 'Île-de-France': ['Paris', 'Versailles'], 'Provence': ['Marseille', 'Nice'] } },
  'Argentina':     { states: { 'Buenos Aires': ['Buenos Aires City', 'La Plata'], 'Mendoza': ['Mendoza City'] } },
}

const AGENT_COLORS: Record<string, string> = {
  rainfall_agent: '#3B82F6',
  reservoir_agent: '#06B6D4',
  flood_agent: '#EF4444',
  water_quality_agent: '#10B981',
  leak_detection_agent: '#F59E0B',
  emergency_agent: '#DC2626',
  decision_agent: '#8B5CF6',
  global_coordinator: '#F59E0B',
  climate_agent: '#06B6D4',
  sensor_intelligence: '#10B981',
  infrastructure_agent: '#EC4899',
  country_agent: '#14B8A6',
  river_basin_agent: '#3B82F6',
  report_generation_agent: '#A855F7',
}

const BUILTIN_AGENTS = [
  { agent_id: 'global_coordinator', name: 'Global Coordinator', description: 'Orchestrates all water intelligence agents. Delegates tasks, synthesizes insights, and coordinates emergency responses across 195 countries.', category: 'coordination', tier: 'Global' },
  { agent_id: 'climate_agent', name: 'Climate Agent', description: 'Analyzes climate patterns, temperature anomalies, and long-term water cycle projections. Powers drought and heat stress forecasting.', category: 'analysis', tier: 'Global' },
  { agent_id: 'rainfall_agent', name: 'Rainfall Agent', description: 'Monitors precipitation levels and detects anomalies in real-time. Feeds flood and reservoir agents with hydrological data.', category: 'monitoring', tier: 'Country' },
  { agent_id: 'reservoir_agent', name: 'Reservoir Agent', description: 'Monitors reservoir levels across 12,840 sites. Generates optimized outflow recommendations and overflow risk assessments.', category: 'monitoring', tier: 'Country' },
  { agent_id: 'flood_agent', name: 'Flood Agent', description: 'Predicts flood events using ML models trained on 50 years of historical data. Issues early warnings with 87%+ accuracy.', category: 'emergency', tier: 'Country' },
  { agent_id: 'water_quality_agent', name: 'Water Quality Agent', description: 'Analyzes chemical composition across 284K sensor points. Detects contamination events and tracks WHO compliance levels.', category: 'analysis', tier: 'State' },
  { agent_id: 'sensor_intelligence', name: 'Sensor Intelligence', description: 'Processes 284K real-time IoT feeds. Detects anomalies, manages calibration alerts, and orchestrates sensor network health.', category: 'infrastructure', tier: 'Global' },
  { agent_id: 'infrastructure_agent', name: 'Infrastructure Agent', description: 'Models pipe networks, predicts failures using material degradation algorithms, and prioritizes maintenance for critical infrastructure.', category: 'infrastructure', tier: 'City' },
  { agent_id: 'leak_detection_agent', name: 'Leak Detection Agent', description: 'Uses acoustic sensor data and pressure differentials to localize pipeline leaks. Currently tracking 847 suspected leak zones.', category: 'monitoring', tier: 'City' },
  { agent_id: 'emergency_agent', name: 'Emergency Agent', description: 'Coordinates rapid response to water crises. Issues government alerts, activates emergency protocols, and tracks incident resolution.', category: 'emergency', tier: 'Global' },
  { agent_id: 'country_agent', name: 'Country Agent', description: 'Aggregates national water intelligence, generates country-level dashboards, and coordinates with government water authorities.', category: 'analysis', tier: 'Country' },
  { agent_id: 'river_basin_agent', name: 'River Basin Agent', description: 'Monitors transboundary river systems, tracks discharge rates, ecosystem health, and coordinates cross-border water agreements.', category: 'monitoring', tier: 'State' },
  { agent_id: 'decision_agent', name: 'Decision Agent', description: 'Multi-criteria decision analysis engine. Weighs tradeoffs in water allocation, infrastructure investment, and emergency response strategies.', category: 'coordination', tier: 'Global' },
  { agent_id: 'report_generation_agent', name: 'Report Generation Agent', description: 'Synthesizes multi-agent findings into executive reports, technical analyses, and scientific publications using Gemini 1.5 Pro.', category: 'analysis', tier: 'Global' },
]

const TIERS = ['All', 'Global', 'Country', 'State', 'City']

// ──────────────── Rich Agent Result Display ────────────────

function SeverityBadge({ label, severity }: { label: string; severity: string }) {
  const colors: Record<string, string> = {
    critical: 'text-red-400 bg-red-500/10 border-red-500/30',
    high: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
    medium: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    warning: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    low: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    safe: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    good: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    danger: 'text-red-400 bg-red-500/10 border-red-500/30',
  }
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${colors[severity.toLowerCase()] ?? 'text-blue-400 bg-blue-500/10 border-blue-500/30'}`}>
      {label}
    </span>
  )
}

function MetricMini({ label, value, unit = '' }: { label: string; value: string | number; unit?: string }) {
  return (
    <div className="bg-white/3 rounded-lg p-2 border border-white/5">
      <p className="text-[9px] text-slate-500 uppercase tracking-wider leading-none">{label}</p>
      <p className="text-sm font-bold text-white leading-tight mt-1">
        {value}<span className="text-[10px] text-slate-400 font-normal ml-0.5">{unit}</span>
      </p>
    </div>
  )
}

function AITextBlock({ text, label = 'AI Analysis' }: { text: string; label?: string }) {
  if (!text || text.startsWith('[Simulated') || text.length < 20) return null
  return (
    <div className="bg-blue-500/5 border border-blue-500/15 rounded-lg p-2.5">
      <p className="text-[9px] text-blue-400 font-semibold uppercase tracking-wider mb-1.5">{label}</p>
      <p className="text-xs text-slate-300 leading-relaxed">{text.slice(0, 500)}{text.length > 500 ? '…' : ''}</p>
    </div>
  )
}

function AgentResultDisplay({ agentId, result }: { agentId: string; result: Record<string, unknown> }) {
  const r = result

  if (agentId === 'leak_detection_agent') {
    const leaked = r.leak_detected as boolean
    const sev = String(r.severity ?? 'low')
    return (
      <div className="space-y-2.5">
        <div className="flex items-center gap-2 flex-wrap">
          <SeverityBadge label={leaked ? '⚠ LEAK DETECTED' : '✓ PIPELINE HEALTHY'} severity={leaked ? sev : 'safe'} />
          <span className="text-[10px] text-slate-500">probability {((r.leak_probability as number ?? 0) * 100).toFixed(0)}%</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <MetricMini label="Pressure Drop" value={(r.pressure_drop_bar as number ?? 0).toFixed(2)} unit="bar" />
          <MetricMini label="Flow Loss" value={(r.flow_loss_pct as number ?? 0).toFixed(1)} unit="%" />
          <MetricMini label="Leak Rate" value={(r.estimated_loss_l_s as number ?? 0).toFixed(1)} unit="L/s" />
          <MetricMini label="Daily Loss" value={((r.estimated_daily_loss_m3 as number ?? 0)).toLocaleString()} unit="m³" />
        </div>
        {!!r.zone && <p className="text-[10px] text-amber-400 bg-amber-500/5 border border-amber-500/15 rounded px-2 py-1.5">📍 {String(r.zone)}</p>}
        {!!r.economic_impact && <p className="text-[10px] text-slate-400">Economic impact: <span className="text-white">{String(r.economic_impact)}</span></p>}
        <AITextBlock text={String(r.ai_analysis ?? '')} />
        <div className="flex gap-2 flex-wrap">
          {!!r.isolation_recommended && <span className="text-[10px] px-2 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full">Isolation Required</span>}
          {!!r.maintenance_required && <span className="text-[10px] px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full">Maintenance Required</span>}
        </div>
      </div>
    )
  }

  if (agentId === 'flood_agent') {
    const risk = String(r.flood_risk ?? 'low')
    const hours = r.hours_to_flood_crest as number | null
    const rainfall = r.rainfall_analysis as Record<string, unknown> ?? {}
    const districts = r.at_risk_districts as string[] ?? []
    return (
      <div className="space-y-2.5">
        <div className="flex items-center gap-2 flex-wrap">
          <SeverityBadge label={`FLOOD: ${risk.toUpperCase()}`} severity={risk} />
          <span className="text-[10px] text-slate-500">score {((r.flood_risk_score as number ?? 0) * 100).toFixed(0)}%</span>
        </div>
        {!!r.river_name && <p className="text-[10px] text-blue-300">🌊 {String(r.river_name)} at {String(r.gauge_station ?? '')}</p>}
        <div className="grid grid-cols-2 gap-1.5">
          <MetricMini label="River Level" value={(r.river_level_m as number ?? 0).toFixed(2)} unit="m" />
          <MetricMini label="Flood Threshold" value={(r.flood_threshold_m as number ?? 0).toFixed(1)} unit="m" />
          <MetricMini label="Storm Prob." value={(rainfall.storm_probability_pct as number ?? 0).toFixed(0)} unit="%" />
          <MetricMini label="7-day Rain" value={(rainfall.total_7day_mm as number ?? 0).toFixed(0)} unit="mm" />
        </div>
        {hours != null && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-2 flex items-center gap-2">
            <span className="text-red-400 text-lg font-bold">{hours}h</span>
            <span className="text-xs text-red-300">estimated to flood crest</span>
          </div>
        )}
        {districts.length > 0 && (
          <p className="text-[10px] text-slate-400">At risk: <span className="text-white">{districts.join(', ')}</span> ({String(r.estimated_affected_population ?? '')})</p>
        )}
        <AITextBlock text={String(r.ai_analysis ?? '')} />
        <div className="flex gap-2 flex-wrap">
          {!!r.emergency_action_required && <span className="text-[10px] px-2 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full">Emergency Action</span>}
          {!!r.evacuation_recommended && <span className="text-[10px] px-2 py-0.5 bg-red-500/15 text-red-300 border border-red-500/30 rounded-full font-semibold">Evacuation Recommended</span>}
        </div>
      </div>
    )
  }

  if (agentId === 'water_quality_agent') {
    const status = String(r.status ?? 'safe')
    const score = r.safety_score as number ?? 0
    const m = r.measurements as Record<string, unknown> ?? {}
    const violations = r.violations as string[] ?? []
    return (
      <div className="space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <SeverityBadge label={`WATER: ${status.toUpperCase()}`} severity={status === 'safe' ? 'safe' : status === 'warning' ? 'medium' : 'critical'} />
          <div className="flex items-center gap-1.5">
            <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${score}%`, backgroundColor: score >= 80 ? '#10B981' : score >= 60 ? '#F59E0B' : '#EF4444' }} />
            </div>
            <span className="text-xs font-bold text-white">{score.toFixed(0)}%</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <MetricMini label="pH" value={(m.ph as number ?? 0).toFixed(2)} />
          <MetricMini label="Turbidity" value={(m.turbidity_ntu as number ?? 0).toFixed(1)} unit="NTU" />
          <MetricMini label="Chlorine" value={(m.chlorine_mg_l as number ?? 0).toFixed(2)} unit="mg/L" />
          <MetricMini label="Dissolved O₂" value={(m.dissolved_oxygen_mg_l as number ?? 0).toFixed(1)} unit="mg/L" />
        </div>
        {!!r.sampling_zone && <p className="text-[10px] text-slate-400 bg-white/3 rounded px-2 py-1">📍 {String(r.sampling_zone)}</p>}
        {violations.map((v, i) => <div key={i} className="text-[10px] text-red-400 flex items-center gap-1">⚠ {v}</div>)}
        {!!r.population_at_risk && <p className="text-[10px] text-orange-400">At risk: {String(r.population_at_risk)}</p>}
        <AITextBlock text={String(r.ai_analysis ?? '')} />
      </div>
    )
  }

  if (agentId === 'reservoir_agent') {
    const risk = String(r.overflow_risk ?? 'low')
    const level = r.current_level_pct as number ?? 0
    return (
      <div className="space-y-2.5">
        <div className="flex items-center gap-2 flex-wrap">
          <SeverityBadge label={`OVERFLOW RISK: ${risk.toUpperCase()}`} severity={risk} />
          {!!r.shortage_risk && r.shortage_risk !== 'low' && <SeverityBadge label={`SHORTAGE: ${String(r.shortage_risk).toUpperCase()}`} severity={String(r.shortage_risk)} />}
        </div>
        {!!r.reservoir_name && <p className="text-[10px] text-cyan-300">🏞 {String(r.reservoir_name)}</p>}
        <div className="relative pt-4">
          <span className="absolute right-0 top-0 text-[10px] text-white font-bold">{level.toFixed(1)}%</span>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <motion.div className="h-full rounded-full"
              style={{ backgroundColor: level > 90 ? '#EF4444' : level > 75 ? '#F59E0B' : '#3B82F6' }}
              initial={{ width: 0 }} animate={{ width: `${level}%` }} transition={{ duration: 0.8, ease: 'easeOut' }} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <MetricMini label="Inflow" value={(r.inflow_rate_m3s as number ?? 0).toFixed(1)} unit="m³/s" />
          <MetricMini label="Outflow" value={(r.outflow_rate_m3s as number ?? 0).toFixed(1)} unit="m³/s" />
          {r.days_to_full != null && <MetricMini label="Days to Full" value={(r.days_to_full as number).toFixed(1)} unit="d" />}
          {r.days_to_empty != null && <MetricMini label="Days to Empty" value={(r.days_to_empty as number).toFixed(1)} unit="d" />}
          <MetricMini label="Rec. Outflow" value={(r.recommended_outflow_m3s as number ?? 0).toFixed(1)} unit="m³/s" />
        </div>
        <AITextBlock text={String(r.ai_analysis ?? '')} />
      </div>
    )
  }

  if (agentId === 'climate_agent') {
    const weather = r.real_time_weather as Record<string, unknown> | null
    const cur = weather?.current as Record<string, unknown> | null
    const fc = weather?.forecast_7day as Record<string, unknown> | null
    const strategies = r.adaptation_strategies as string[] ?? []
    return (
      <div className="space-y-2.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-white">{String(r.region ?? 'Global')}</span>
          {weather && <span className="text-[10px] px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">Live Data</span>}
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <MetricMini label="Temp Anomaly" value={`+${(r.temperature_anomaly_c as number ?? 0).toFixed(2)}`} unit="°C" />
          <MetricMini label="Drought Index" value={(r.drought_index as number ?? 0).toFixed(2)} />
          <MetricMini label="Freshwater Δ" value={(r.freshwater_availability_change_pct as number ?? 0).toFixed(1)} unit="%" />
          <MetricMini label="Flood Freq Δ" value={`+${(r.flood_frequency_change_pct as number ?? 0).toFixed(1)}`} unit="%" />
        </div>
        {cur && (
          <div className="grid grid-cols-2 gap-1.5 border-t border-white/5 pt-2">
            <p className="col-span-2 text-[9px] text-emerald-400 uppercase tracking-wider">Open-Meteo Real-time</p>
            {cur.temperature_c != null && <MetricMini label="Current Temp" value={(cur.temperature_c as number).toFixed(1)} unit="°C" />}
            {cur.humidity_pct != null && <MetricMini label="Humidity" value={(cur.humidity_pct as number).toFixed(0)} unit="%" />}
            {fc?.total_precipitation_mm != null && <MetricMini label="7-day Precip" value={(fc.total_precipitation_mm as number).toFixed(1)} unit="mm" />}
            {cur.wind_speed_kmh != null && <MetricMini label="Wind" value={(cur.wind_speed_kmh as number).toFixed(1)} unit="km/h" />}
          </div>
        )}
        <AITextBlock text={String(r.ai_summary ?? '')} label="Climate AI Assessment" />
        {strategies.length > 0 && (
          <div className="space-y-1">
            <p className="text-[9px] text-slate-500 uppercase tracking-wider">Adaptation Strategies</p>
            {strategies.map((s: string, i: number) => (
              <div key={i} className="text-[10px] text-slate-400 flex items-start gap-1.5">
                <span className="text-blue-400 shrink-0">→</span>{s}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // Generic display for rainfall, decision, global coordinator, etc.
  const numericPairs = Object.entries(r).filter(([, v]) => typeof v === 'number').slice(0, 6)
  const aiText = String(r.ai_analysis || r.ai_summary || r.recommendation || r.final_recommendation || r.summary || '')
  return (
    <div className="space-y-2.5">
      {numericPairs.length > 0 && (
        <div className="grid grid-cols-2 gap-1.5">
          {numericPairs.map(([key, val]) => (
            <MetricMini key={key} label={key.replace(/_/g, ' ')} value={(val as number).toFixed(2)} />
          ))}
        </div>
      )}
      <AITextBlock text={aiText} />
    </div>
  )
}

// ──────────────────────────────────────────────────────────

function AgentCard({ agent, onRun, result, isRunning }: {
  agent: { agent_id: string; name: string; description: string; category: string }
  onRun: () => void
  result?: AgentResult
  isRunning: boolean
}) {
  const [expanded, setExpanded] = useState(false)
  const color = AGENT_COLORS[agent.agent_id] ?? '#3B82F6'

  return (
    <GlassCard className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: `${color}20`, border: `1px solid ${color}40` }}
          >
            <Bot className="w-4 h-4" style={{ color }} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">{agent.name}</h3>
            <p className="text-xs text-slate-500 capitalize">{agent.category}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {result && (
            <span className={cn(
              'text-xs px-2 py-0.5 rounded-full',
              result.status === 'completed' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
            )}>
              {result.confidence ? `${(result.confidence * 100).toFixed(0)}% conf.` : result.status}
            </span>
          )}
          <button
            onClick={onRun}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg text-xs text-blue-400 font-medium transition-colors disabled:opacity-50"
          >
            {isRunning ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
            {isRunning ? 'Running...' : 'Run'}
          </button>
        </div>
      </div>

      <p className="text-xs text-slate-400 mb-3 leading-relaxed">{agent.description}</p>

      {result && (
        <div className="border-t border-white/5 pt-3">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            View reasoning ({result.reasoning_chain?.length ?? 0} steps · {result.latency_ms}ms)
          </button>
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-3 space-y-3">
                  {/* Rich result display */}
                  <AgentResultDisplay agentId={agent.agent_id} result={(result.result ?? {}) as Record<string, unknown>} />
                  {/* Reasoning chain */}
                  <div className="space-y-1.5">
                    <p className="text-xs text-slate-500 font-medium">Reasoning Chain:</p>
                    {result.reasoning_chain?.map((step, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-blue-400 text-xs font-mono mt-0.5">{String(i + 1).padStart(2, '0')}</span>
                        <p className="text-xs text-slate-400">{step.step}</p>
                      </div>
                    ))}
                  </div>
                  {/* Tools called */}
                  {result.tools_called?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {result.tools_called.map((tool, i) => (
                        <span key={i} className="px-2 py-0.5 bg-purple-500/10 border border-purple-500/20 rounded text-xs text-purple-400">
                          {tool}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </GlassCard>
  )
}

export function AgentConsolePage() {
  const [chatInput, setChatInput] = useState('')
  const [chatHistory, setChatHistory] = useState<{ role: string; content: string; metadata?: unknown }[]>([])
  const [runningAgents, setRunningAgents] = useState<Set<string>>(new Set())
  const [agentResults, setAgentResults] = useState<Record<string, AgentResult>>({})
  const [tierFilter, setTierFilter] = useState('All')
  const [selectedCountry, setSelectedCountry] = useState('')
  const [selectedState, setSelectedState] = useState('')
  const [selectedCity, setSelectedCity] = useState('')

  const countries = Object.keys(GEO_DATA)
  const states = selectedCountry ? Object.keys(GEO_DATA[selectedCountry]?.states ?? {}) : []
  const cities = selectedCountry && selectedState ? (GEO_DATA[selectedCountry]?.states[selectedState] ?? []) : []

  const geoContext = {
    ...(selectedCountry && { country: selectedCountry }),
    ...(selectedState && { state: selectedState }),
    ...(selectedCity && { city: selectedCity }),
  }

  const CONTEXT_INSIGHTS: Record<string, { score: number; risk: string; agents: string[]; insights: string[]; alerts: string[] }> = {
    'India': { score: 68, risk: 'High', agents: ['Country Agent', 'Rainfall Agent', 'Flood Agent'], insights: ['Monsoon onset 2 weeks early — 34% flood probability increase in Brahmaputra basin', 'Groundwater depletion rate: 12cm/year in NW states (critical threshold)', 'Water stress index: 0.71 — ranks 13th globally'], alerts: ['Red alert: 5 Assam districts at flood risk', 'Conservation advisory active in Rajasthan'] },
    'United States': { score: 82, risk: 'Medium', agents: ['Country Agent', 'Reservoir Agent', 'Leak Detection Agent'], insights: ['Lake Mead at 38% capacity — Southwest water compact under review', 'Aging infrastructure: 240K water main breaks annually, ~14% water loss', 'PFAS contamination detected in 45 public water systems'], alerts: ['Drought watch: Colorado River Basin', 'Infrastructure advisory: Lead pipe replacement priority zones'] },
    'China': { score: 72, risk: 'Medium', agents: ['Country Agent', 'Flood Agent', 'River Basin Agent'], insights: ['Three Gorges reservoir at 89% — controlled release protocol active', 'North-South Water Diversion: 14.8B m³ transferred this year', 'Yangtze River flow 22% above seasonal average'], alerts: ['Warning: Yangtze flooding risk in 3 downstream provinces'] },
    'Maharashtra': { score: 65, risk: 'High', agents: ['Reservoir Agent', 'Rainfall Agent', 'Infrastructure Agent'], insights: ['Hirakud reservoir at 91% — overflow risk within 72h', 'Urban water demand exceeds supply by 18% in Greater Mumbai', 'Pipeline network age: avg 32 years, 284 active leak zones'], alerts: ['Overflow alert: Hirakud Dam — controlled release initiated'] },
    'Rajasthan': { score: 41, risk: 'Critical', agents: ['Groundwater Agent', 'Climate Agent', 'Emergency Agent'], insights: ['Groundwater depth: 42m below surface — critical depletion', 'Rainfall deficit: 38% below 30-year average this season', 'Desertification index: 0.82 — highest in India'], alerts: ['Emergency: Water rationing enforced in 12 districts', 'Critical: Groundwater below extraction threshold'] },
    'California': { score: 71, risk: 'High', agents: ['Reservoir Agent', 'Leak Detection Agent', 'Water Quality Agent'], insights: ['Shasta Lake at 54% — below historical average for this date', 'Drought conditions: D3 (Extreme) across 41% of state area', 'Desalination plant capacity being scaled: +420 MLD planned'], alerts: ['Drought emergency: Southern California water restrictions Stage 2'] },
    'Mumbai': { score: 62, risk: 'Warning', agents: ['Infrastructure Agent', 'Leak Detection Agent', 'Water Quality Agent'], insights: ['284 active pipeline leak zones — 680 MLD water loss daily', 'Powai Lake at 91.2% — 8% above safe operating level', 'WTP Bhandup: treating 3,800 MLD, running at 97% capacity', '74.2 WQI — within WHO safe limits, turbidity spike in Zone 7'], alerts: ['Leak priority: 3 trunk main fractures in Dharavi sector', 'Quality notice: Boil water advisory for 2 wards'] },
    'Delhi': { score: 58, risk: 'Warning', agents: ['Infrastructure Agent', 'Water Quality Agent', 'Emergency Agent'], insights: ['Yamuna WQI at 51 — unsafe for bathing, borderline for treatment', '631 active leak zones, estimated 920 MLD unaccounted water', 'Per capita supply: 172 LPCD vs target 270 LPCD — 36% shortfall'], alerts: ['Quality alert: Yamuna BOD levels 3× safe limit', 'Supply deficit: 12 zones on alternate-day supply schedule'] },
    'Houston': { score: 79, risk: 'Medium', agents: ['Flood Agent', 'Infrastructure Agent', 'Rainfall Agent'], insights: ['Bayou flood model: 28% probability of street-level flooding in 72h', 'Harvey-era infrastructure upgrades: 71% complete', '1,100 MLD daily demand, 88M gallons storage reserve'], alerts: ['Flood watch: Heavy rainfall forecast 48-72 hours'] },
    'Los Angeles': { score: 74, risk: 'Medium', agents: ['Reservoir Agent', 'Leak Detection Agent', 'Water Quality Agent'], insights: ['Aqueduct pressure nominal at 4.2 bar — all sectors operational', 'Recycled water usage: 32% of total supply (target 40% by 2027)', '142 low-priority leak zones — all scheduled for Q3 repair'], alerts: ['Conservation mandate: Outdoor watering restricted to 2 days/week'] },
  }

  const activeInsight = selectedCity ? CONTEXT_INSIGHTS[selectedCity] : selectedState ? CONTEXT_INSIGHTS[selectedState] : selectedCountry ? CONTEXT_INSIGHTS[selectedCountry] : null
  const activeScope = selectedCity || selectedState || selectedCountry

  const { data: fetchedAgents } = useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      try { return await agentApi.list().then((r) => r.data) }
      catch { return BUILTIN_AGENTS }
    },
  })

  const agents = (fetchedAgents && fetchedAgents.length > 0 ? fetchedAgents : BUILTIN_AGENTS)
    .filter((a: { tier?: string }) => tierFilter === 'All' || a.tier === tierFilter)

  const runMutation = useMutation({
    mutationFn: ({ agentId, context }: { agentId: string; context: Record<string, unknown> }) =>
      agentApi.run(agentId, context).then((r) => r.data),
    onSuccess: (data, variables) => {
      setAgentResults((prev) => ({ ...prev, [variables.agentId]: data }))
      setRunningAgents((prev) => { const s = new Set(prev); s.delete(variables.agentId); return s })
      toast.success(`${variables.agentId.replace('_', ' ')} completed`)
    },
    onError: (_, variables) => {
      setRunningAgents((prev) => { const s = new Set(prev); s.delete(variables.agentId); return s })
      toast.error('Agent execution failed')
    },
  })

  const chatMutation = useMutation({
    mutationFn: ({ message, agentId }: { message: string; agentId: string }) =>
      agentApi.chat(message, agentId).then((r) => r.data),
    onSuccess: (data) => {
      setChatHistory((prev) => [...prev, {
        role: 'assistant',
        content: typeof data.response === 'object'
          ? (data.response as Record<string, unknown>)?.final_recommendation as string ?? JSON.stringify(data.response)
          : String(data.response),
        metadata: data,
      }])
    },
  })

  const handleRunAgent = (agentId: string) => {
    setRunningAgents((prev) => new Set(prev).add(agentId))
    runMutation.mutate({ agentId, context: geoContext })
  }

  const handleChat = () => {
    if (!chatInput.trim()) return
    const contextPrefix = selectedCountry ? `[Context: ${[selectedCountry, selectedState, selectedCity].filter(Boolean).join(' › ')}] ` : ''
    setChatHistory((prev) => [...prev, { role: 'user', content: chatInput }])
    chatMutation.mutate({ message: contextPrefix + chatInput, agentId: 'decision_agent' })
    setChatInput('')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2"><Bot className="w-5 h-5 text-blue-400" />Agent Console</h1>
          <p className="text-sm text-slate-500 mt-0.5">14 AI agents · Global→Country→State→City hierarchy · Gemini-powered</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {TIERS.map(t => (
              <button key={t} onClick={() => setTierFilter(t)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${tierFilter === t ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20' : 'text-slate-400 hover:bg-white/5'}`}
              >{t}</button>
            ))}
          </div>
          <button
            onClick={() => agents?.forEach((a: { agent_id: string }) => handleRunAgent(a.agent_id))}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl text-sm font-medium text-white hover:opacity-90 transition-opacity"
          >
            <Zap className="w-4 h-4" />
            Run All
          </button>
        </div>
      </div>

      {/* Geographic Context Selector */}
      <GlassCard className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-semibold text-white">Geographic Context</h3>
          <span className="text-[10px] text-slate-500 ml-1">— agents will run with this scope</span>
          {(selectedCountry || selectedState || selectedCity) && (
            <button onClick={() => { setSelectedCountry(''); setSelectedState(''); setSelectedCity('') }}
              className="ml-auto text-[10px] text-slate-500 hover:text-red-400 transition-colors">
              Clear
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Country */}
          <div>
            <label className="flex items-center gap-1.5 text-[10px] text-slate-500 uppercase tracking-wider mb-1.5">
              <Globe className="w-3 h-3" /> Country
            </label>
            <select
              value={selectedCountry}
              onChange={e => { setSelectedCountry(e.target.value); setSelectedState(''); setSelectedCity('') }}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500/50 transition-colors"
            >
              <option value="">All Countries (Global)</option>
              {countries.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          {/* State */}
          <div>
            <label className="flex items-center gap-1.5 text-[10px] text-slate-500 uppercase tracking-wider mb-1.5">
              <Flag className="w-3 h-3" /> State / Province
            </label>
            <select
              value={selectedState}
              onChange={e => { setSelectedState(e.target.value); setSelectedCity('') }}
              disabled={!selectedCountry}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500/50 disabled:opacity-40 transition-colors"
            >
              <option value="">All States</option>
              {states.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          {/* City */}
          <div>
            <label className="flex items-center gap-1.5 text-[10px] text-slate-500 uppercase tracking-wider mb-1.5">
              <Building2 className="w-3 h-3" /> City
            </label>
            <select
              value={selectedCity}
              onChange={e => setSelectedCity(e.target.value)}
              disabled={!selectedState}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500/50 disabled:opacity-40 transition-colors"
            >
              <option value="">All Cities</option>
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        {/* Active context badge */}
        {(selectedCountry || selectedState || selectedCity) && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
            <span className="text-[10px] text-slate-500">Active scope:</span>
            {selectedCountry && <span className="text-[10px] px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20">{selectedCountry}</span>}
            {selectedState && <span className="text-[10px] text-slate-500">›</span>}
            {selectedState && <span className="text-[10px] px-2 py-0.5 bg-cyan-500/10 text-cyan-400 rounded-full border border-cyan-500/20">{selectedState}</span>}
            {selectedCity && <span className="text-[10px] text-slate-500">›</span>}
            {selectedCity && <span className="text-[10px] px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">{selectedCity}</span>}
          </div>
        )}
      </GlassCard>

      {/* Context-Specific Agentic Output */}
      <AnimatePresence>
        {activeScope && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <GlassCard className="p-5" glow="blue">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
                    <Brain className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">AI Intelligence: {activeScope}</h3>
                    <p className="text-[10px] text-slate-500">Real-time agent analysis for selected scope</p>
                  </div>
                </div>
                {activeInsight && (
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-400">{activeInsight.score}</p>
                      <p className="text-[10px] text-slate-500">Water Score</p>
                    </div>
                    <span className={`text-[10px] px-2 py-1 rounded-full border font-medium ${activeInsight.risk === 'Critical' ? 'text-red-400 bg-red-500/10 border-red-500/20' : activeInsight.risk === 'High' ? 'text-orange-400 bg-orange-500/10 border-orange-500/20' : 'text-amber-400 bg-amber-500/10 border-amber-500/20'}`}>
                      {activeInsight.risk} Risk
                    </span>
                  </div>
                )}
              </div>

              {activeInsight ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* AI Insights */}
                  <div className="lg:col-span-2 space-y-2">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium mb-2">Agent Insights</p>
                    {activeInsight.insights.map((insight, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                        className="flex items-start gap-2.5 p-2.5 bg-white/3 rounded-lg border border-white/5">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0 animate-pulse" />
                        <p className="text-xs text-slate-300">{insight}</p>
                      </motion.div>
                    ))}
                    {activeInsight.alerts.length > 0 && (
                      <div className="mt-2 space-y-1.5">
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">Active Alerts</p>
                        {activeInsight.alerts.map((alert, i) => (
                          <div key={i} className="flex items-start gap-2 p-2 bg-red-500/5 rounded-lg border border-red-500/20">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                            <p className="text-xs text-red-300">{alert}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {/* Participating Agents */}
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium mb-2">Analyzing Agents</p>
                    <div className="space-y-2">
                      {activeInsight.agents.map((agent, i) => (
                        <motion.div key={agent} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                          className="flex items-center gap-2 p-2.5 bg-white/3 rounded-lg border border-white/5">
                          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                          <span className="text-xs text-white font-medium">{agent}</span>
                        </motion.div>
                      ))}
                    </div>
                    <button
                      onClick={() => activeInsight.agents.forEach(name => {
                        const found = BUILTIN_AGENTS.find(a => a.name === name)
                        if (found) handleRunAgent(found.agent_id)
                      })}
                      className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg text-xs text-blue-400 font-medium transition-colors"
                    >
                      <Play className="w-3 h-3" /> Run These Agents
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500">No pre-loaded intelligence for "{activeScope}". Click Run All to generate analysis.</p>
              )}
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agent Grid */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(agents ?? []).map((agent: { agent_id: string; name: string; description: string; category: string }) => (
              <AgentCard
                key={agent.agent_id}
                agent={agent}
                onRun={() => handleRunAgent(agent.agent_id)}
                result={agentResults[agent.agent_id]}
                isRunning={runningAgents.has(agent.agent_id)}
              />
            ))}
          </div>
        </div>

        {/* Chat Panel */}
        <GlassCard className="flex flex-col h-[600px] p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
              <Brain className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Decision Agent Chat</h3>
              <p className="text-xs text-slate-500">Ask anything about water systems</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 mb-4">
            {chatHistory.length === 0 && (
              <div className="text-center text-xs text-slate-600 mt-8">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p>Ask the Decision Agent about</p>
                <p>flood risk, reservoir status, water quality...</p>
              </div>
            )}
            {chatHistory.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  'rounded-xl px-3 py-2.5 text-xs leading-relaxed max-w-[90%]',
                  msg.role === 'user'
                    ? 'bg-blue-600/20 text-blue-200 ml-auto'
                    : 'bg-white/5 text-slate-300'
                )}
              >
                {msg.content}
              </motion.div>
            ))}
            {chatMutation.isPending && (
              <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2.5 w-fit">
                <Loader2 className="w-3 h-3 animate-spin text-purple-400" />
                <span className="text-xs text-slate-400">Reasoning...</span>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleChat()}
              placeholder="Ask about water conditions..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50"
            />
            <button
              onClick={handleChat}
              disabled={chatMutation.isPending || !chatInput.trim()}
              className="p-2 bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/30 rounded-xl text-blue-400 disabled:opacity-50 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
