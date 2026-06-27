import { useState, type ReactElement } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Brain, Radio, Globe, Database, Satellite, Cpu, AlertTriangle,
  CheckCircle2, Waves, Droplets, CloudRain, Shield, Zap, Wind,
  Users, Building2, Wheat, Fish, ArrowRight, Activity, Map,
  MessageSquare, Clock, ChevronDown, ChevronRight, Lock, BarChart3
} from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'

// ─── Types ────────────────────────────────────────────────────────────────────
type SrcType = 'sensor' | 'satellite' | 'api' | 'manual' | 'model' | 'db'
type AgentStatus = 'collecting' | 'analyzing' | 'alert' | 'completed' | 'passing' | 'idle'
type Severity = 'critical' | 'high' | 'medium' | 'low'
type Stage = 'collection' | 'analysis' | 'coordination' | 'decision'
type TabId = 'sources' | 'analysis' | 'rules' | 'actions'

interface DataSource { name: string; type: SrcType; freshness: string; quality: number; detail: string }
interface Rule { condition: string; trigger: string; action: string; priority: Severity }
interface Step { n: number; action: string; finding: string; alert?: boolean }
interface Metric { name: string; value: string; threshold: string; ok: boolean }
interface Dispatch { target: string; targetType: 'dept' | 'agent' | 'public' | 'emergency' | 'farmer' | 'fisherman'; urgency: Severity; message: string; channel: string }
interface AgentDef {
  id: string; name: string; stage: Stage; status: AgentStatus; statusLabel: string
  summary: string; confidence: number; elapsed: string
  dataSources: DataSource[]; rules: Rule[]; steps: Step[]; metrics: Metric[]
  issueFound: boolean; severity?: Severity; issueSummary?: string
  dispatches: Dispatch[]
}
interface FinalVerdict {
  severity: Severity | 'clear'; title: string; summary: string
  agentsInput: string[]; precautions: string[]
  dispatches: { target: string; icon: string; urgency: string; message: string }[]
}
interface StateWorkflow { agents: AgentDef[]; verdict: FinalVerdict }

// ─── State Workflow Data ───────────────────────────────────────────────────────
const WORKFLOWS: Record<string, StateWorkflow> = {
  assam: {
    agents: [
      {
        id: 'sensor', name: 'Sensor Agent', stage: 'collection', status: 'completed', statusLabel: 'DATA READY',
        summary: '284K IoT readings ingested — river gauges, rain gauges, soil moisture sensors',
        confidence: 97, elapsed: '1.2s',
        dataSources: [
          { name: 'BWO-GHY-01 River Gauge (Guwahati)', type: 'sensor', freshness: '30 sec ago', quality: 99, detail: 'Current level 7.2m — CRITICAL above 6.0m threshold' },
          { name: 'Kopili Reservoir Level Sensor', type: 'sensor', freshness: '1 min ago', quality: 98, detail: 'Fill level 87.4% — HIGH overflow risk band' },
          { name: 'Assam Rain Gauge Network (142 nodes)', type: 'sensor', freshness: '5 min ago', quality: 94, detail: 'Average 28.4mm/h across northeast quadrant' },
          { name: 'Soil Moisture Array (ICAR stations)', type: 'sensor', freshness: '15 min ago', quality: 91, detail: 'Surface saturation 94% — no further absorption capacity' },
        ],
        rules: [
          { condition: 'River level > flood_threshold', trigger: '7.2m > 6.0m', action: 'ESCALATE to FloodAgent with CRITICAL priority', priority: 'critical' },
          { condition: 'Data staleness > 10 minutes', trigger: 'Any sensor offline', action: 'Flag data gap, use interpolation, alert ops team', priority: 'high' },
          { condition: 'Soil saturation > 90%', trigger: '94% > 90%', action: 'Pass saturation flag to FloodAgent — runoff multiplier = 1.8×', priority: 'high' },
          { condition: 'Reservoir fill > 85%', trigger: '87.4% > 85%', action: 'Alert ReservoirAgent, flag upstream release risk', priority: 'medium' },
        ],
        steps: [
          { n: 1, action: 'Poll BWO-GHY-01 gauge via SCADA protocol', finding: 'Reading: 7.2m. Threshold: 6.0m. Status: EXCEEDED by 1.2m', alert: true },
          { n: 2, action: 'Cross-validate with backup gauge BWO-GHY-02', finding: 'Backup confirms 7.19m — primary reading validated' },
          { n: 3, action: 'Query Kopili Reservoir sensor array', finding: 'Level 192m MSL = 87.4% of 8136 MCM. Inflow 480 m³/s > outflow 320 m³/s', alert: true },
          { n: 4, action: 'Aggregate 142 rain gauge readings — spatial interpolation', finding: '590mm 7-day accumulation across catchment. Peak 28.4mm/h in Meghalaya border' },
          { n: 5, action: 'Compute soil saturation index from ICAR moisture probes', finding: 'Surface 94% saturated — all further rain will become direct runoff', alert: true },
          { n: 6, action: 'Package sensor bundle and pass to FloodAgent + SatelliteAgent', finding: 'Data bundle: 284,192 readings. Latency 1.2s. Quality score 97%' },
        ],
        metrics: [
          { name: 'Brahmaputra Level', value: '7.2m', threshold: '6.0m', ok: false },
          { name: 'Kopili Fill', value: '87.4%', threshold: '< 85%', ok: false },
          { name: 'Peak Rainfall', value: '28.4mm/h', threshold: '< 15mm/h', ok: false },
          { name: 'Soil Saturation', value: '94%', threshold: '< 75%', ok: false },
          { name: 'Data Quality', value: '97%', threshold: '> 90%', ok: true },
          { name: 'Sensor Uptime', value: '99.2%', threshold: '> 95%', ok: true },
        ],
        issueFound: true, severity: 'critical',
        issueSummary: 'Brahmaputra 7.2m — 1.2m above flood threshold. Soil saturation 94% — maximum runoff risk.',
        dispatches: [
          { target: 'Flood Agent', targetType: 'agent', urgency: 'critical', message: 'Passing: river_level=7.2m, soil_sat=94%, kopili_fill=87.4%, rain_forecast=590mm', channel: 'agent-bus' },
          { target: 'Satellite Agent', targetType: 'agent', urgency: 'high', message: 'Request SAR inundation scan for Brahmaputra floodplain — coordinates passed', channel: 'agent-bus' },
        ],
      },
      {
        id: 'satellite', name: 'Satellite Agent', stage: 'collection', status: 'completed', statusLabel: 'IMAGERY PROCESSED',
        summary: 'ISRO SAR confirms 18.4 km² active inundation — cyclonic system tracked Bay of Bengal',
        confidence: 93, elapsed: '4.8s',
        dataSources: [
          { name: 'ISRO RISAT-2B SAR (Synthetic Aperture Radar)', type: 'satellite', freshness: '22 min ago', quality: 96, detail: 'Overpass 05:34 UTC — inundation mapping complete' },
          { name: 'NOAA GOES-18 Thermal Infrared', type: 'satellite', freshness: '1 hr ago', quality: 88, detail: 'Cloud-top temperature patterns confirm monsoon trough' },
          { name: 'Sentinel-2 NDWI Water Index', type: 'satellite', freshness: '2 days ago', quality: 91, detail: 'Baseline water extent established for change detection' },
          { name: 'INSAT-3DR Bay of Bengal Cyclone Track', type: 'satellite', freshness: '45 min ago', quality: 94, detail: 'Low-pressure system 14°N 89°E — tracking NE at 18 km/h' },
        ],
        rules: [
          { condition: 'Inundation extent > 10 km²', trigger: '18.4 km² detected', action: 'CRITICAL: alert FloodAgent, confirm evacuation zones', priority: 'critical' },
          { condition: 'Cyclone track intersects state boundary within 72h', trigger: '61% landfall probability', action: 'Pass cyclone data to ClimateAgent + DecisionAgent', priority: 'high' },
          { condition: 'SAR imagery age > 6 hours', trigger: 'Imagery 22 min old', action: 'Flag for re-analysis on next overpass', priority: 'low' },
        ],
        steps: [
          { n: 1, action: 'Retrieve RISAT-2B SAR overpass for Assam region', finding: 'Scene acquired 05:34 UTC — 10m resolution, dual polarization' },
          { n: 2, action: 'Apply inundation detection algorithm (threshold backscatter)', finding: '18.4 km² active flood inundation confirmed in Kamrup district', alert: true },
          { n: 3, action: 'Change detection vs Sentinel-2 baseline', finding: '+14.2 km² above historical water extent — 4.4× above normal monsoon spread' },
          { n: 4, action: 'Track INSAT-3DR Bay of Bengal low-pressure system', finding: 'System at 14°N 89°E, intensity 987 hPa, moving NE 18 km/h', alert: true },
          { n: 5, action: 'Compute landfall probability and ETA', finding: '61% probability of landfall near Odisha/West Bengal border within 72h' },
          { n: 6, action: 'Export flood polygon + cyclone track to Decision Agent', finding: 'GeoJSON packages prepared — passing to FloodAgent and ClimateAgent' },
        ],
        metrics: [
          { name: 'Inundation Extent', value: '18.4 km²', threshold: '< 5 km²', ok: false },
          { name: 'Cyclone Prob', value: '61%', threshold: '< 30%', ok: false },
          { name: 'SAR Image Age', value: '22 min', threshold: '< 6 hr', ok: true },
          { name: 'Detection Accuracy', value: '96%', threshold: '> 90%', ok: true },
        ],
        issueFound: true, severity: 'critical',
        issueSummary: '18.4 km² confirmed active flooding in Kamrup. Cyclone 61% landfall probability within 72h.',
        dispatches: [
          { target: 'Flood Agent', targetType: 'agent', urgency: 'critical', message: 'Confirmed 18.4km² inundation GeoJSON + displaced population estimate 38,000', channel: 'agent-bus' },
          { target: 'Climate Agent', targetType: 'agent', urgency: 'high', message: 'Cyclone track data: 14°N 89°E, 987 hPa, NE 18km/h, 61% landfall prob 72h', channel: 'agent-bus' },
        ],
      },
      {
        id: 'flood', name: 'Flood Agent', stage: 'analysis', status: 'alert', statusLabel: 'CRITICAL ALERT',
        summary: 'Brahmaputra CRITICAL — flood crest in 6h, 240K at risk across 4 districts',
        confidence: 94, elapsed: '2.1s',
        dataSources: [
          { name: 'Sensor Agent — river levels + soil saturation', type: 'api', freshness: '0 sec', quality: 97, detail: 'River 7.2m, soil 94%, Kopili 87.4%' },
          { name: 'Satellite Agent — 18.4km² inundation polygon', type: 'api', freshness: '0 sec', quality: 93, detail: 'Active flood confirmed in Kamrup district' },
          { name: 'PostgreSQL v_river_flood_status view', type: 'db', freshness: '2 min ago', quality: 99, detail: 'Historical flood records, 50yr flood = 8.1m' },
          { name: '50-Year HEC-RAS Flood Model', type: 'model', freshness: 'static', quality: 88, detail: 'Flood routing model for Brahmaputra basin' },
        ],
        rules: [
          { condition: 'River level > flood_threshold × 1.1', trigger: '7.2m > 6.6m (10% above)', action: 'CRITICAL ALERT — issue district-level evacuation advisory immediately', priority: 'critical' },
          { condition: 'Active inundation confirmed by SAR', trigger: '18.4km² > 0', action: 'Confirm flood, update population-at-risk count, escalate to DecisionAgent', priority: 'critical' },
          { condition: 'Upstream reservoir fill > 85%', trigger: 'Kopili 87.4%', action: 'Add reservoir release risk multiplier to crest forecast', priority: 'high' },
          { condition: 'Soil saturation > 90%', trigger: '94% saturated', action: 'Set runoff coefficient = 0.92 (near-impermeable), update crest ETA', priority: 'high' },
        ],
        steps: [
          { n: 1, action: 'Receive sensor bundle: river 7.2m, soil 94%, Kopili 87.4%', finding: 'All inputs validated — proceeding with flood risk computation' },
          { n: 2, action: 'Confirm active inundation from SatelliteAgent SAR polygon', finding: '18.4km² active — flood is in progress, not just risk', alert: true },
          { n: 3, action: 'Run HEC-RAS flood routing model with current inputs', finding: 'Crest estimate 7.8–8.1m within 6–8 hours (near 2022 record of 8.1m)', alert: true },
          { n: 4, action: 'Compute affected population via GIS overlay', finding: '240,000 residents in hazard zone: Kamrup 95K, Barpeta 72K, Morigaon 44K, Nagaon 29K', alert: true },
          { n: 5, action: 'Assess Kopili dam release risk', finding: 'If Kopili releases at 480 m³/s + natural inflow: additional 0.4m rise possible' },
          { n: 6, action: 'Compute evacuation urgency score', finding: 'Score 9.4/10 — mandatory evacuation required within 3 hours' },
          { n: 7, action: 'Package CRITICAL alert + population data → DecisionAgent + AlertAgent', finding: 'Alert dispatched with GIS boundaries, headcount, and crest ETA' },
        ],
        metrics: [
          { name: 'Current Level', value: '7.2m', threshold: '6.0m', ok: false },
          { name: 'Predicted Crest', value: '7.8–8.1m', threshold: '< 6.0m', ok: false },
          { name: 'Crest ETA', value: '6–8 hours', threshold: 'N/A', ok: false },
          { name: 'Population at Risk', value: '240,000', threshold: '< 10,000', ok: false },
          { name: 'Evacuation Score', value: '9.4/10', threshold: '> 7 = mandatory', ok: false },
          { name: 'Model Confidence', value: '94%', threshold: '> 80%', ok: true },
        ],
        issueFound: true, severity: 'critical',
        issueSummary: 'CRITICAL FLOOD IN PROGRESS — 240K at risk, crest 7.8–8.1m in 6–8h, mandatory evacuation.',
        dispatches: [
          { target: 'Decision Agent', targetType: 'agent', urgency: 'critical', message: 'CRITICAL: flood_level=7.2m, crest_eta=6h, pop_at_risk=240K, districts=[Kamrup,Barpeta,Morigaon,Nagaon]', channel: 'agent-bus' },
          { target: 'Alert Agent', targetType: 'agent', urgency: 'critical', message: 'Generate district-level evacuation alerts for 4 Assam districts — priority CRITICAL', channel: 'agent-bus' },
          { target: 'Irrigation Dept', targetType: 'dept', urgency: 'critical', message: 'HOLD: Do not release Kopili dam gates. Additional release will push crest to 8.5m. Hold for 48 hours.', channel: 'SMS + Emergency Portal' },
        ],
      },
      {
        id: 'climate', name: 'Climate Agent', stage: 'analysis', status: 'alert', statusLabel: 'STORM WARNING',
        summary: '78% storm probability — 590mm 7-day forecast, cyclone convergence risk',
        confidence: 88, elapsed: '3.4s',
        dataSources: [
          { name: 'Open-Meteo API (Guwahati coordinates)', type: 'api', freshness: '5 min ago', quality: 92, detail: '7-day precipitation: 590mm total, peak day 124mm' },
          { name: 'Satellite Agent — cyclone track data', type: 'api', freshness: '0 sec', quality: 94, detail: 'System 14°N 89°E, 61% landfall probability 72h' },
          { name: 'IMD monsoon track model', type: 'model', freshness: '1 hr ago', quality: 87, detail: 'Monsoon 2.1× above seasonal average — La Niña amplification' },
          { name: 'CMIP6 climate ensemble (12 models)', type: 'model', freshness: '24 hr ago', quality: 85, detail: '87% models agree extreme monsoon pattern continues through July' },
        ],
        rules: [
          { condition: '7-day rainfall > 2× seasonal average', trigger: '590mm > 281mm × 2 = 562mm', action: 'STORM WARNING — multiply flood risk, alert FloodAgent', priority: 'critical' },
          { condition: 'Cyclone landfall probability > 50%', trigger: '61% > 50%', action: 'Issue fishermen warning, pre-position coastal emergency assets', priority: 'high' },
          { condition: 'Storm probability > 75%', trigger: '78% > 75%', action: 'All-teams alert: irrigation, emergency, citizens', priority: 'high' },
          { condition: 'Monsoon onset > 2 weeks early', trigger: 'Onset June 1 vs normal June 15', action: 'Update seasonal forecast — extended heavy monsoon risk', priority: 'medium' },
        ],
        steps: [
          { n: 1, action: 'Fetch Open-Meteo 7-day forecast for Guwahati (26.18°N 91.77°E)', finding: '590.4mm total. Day breakdown: 92, 87, 124, 78, 68, 84, 57mm' },
          { n: 2, action: 'Compute storm probability from heavy-rain-day count', finding: '7/7 days qualify as heavy rain (>20mm). Storm prob = min(95, 7×13 + 30×peak/150) = 78%', alert: true },
          { n: 3, action: 'Integrate cyclone track from SatelliteAgent', finding: 'Cyclone convergence increases local rainfall amplification factor to 1.4×', alert: true },
          { n: 4, action: 'Compare with CMIP6 ensemble for seasonal outlook', finding: '87% of 12 CMIP6 models agree: above-normal monsoon through July 2025' },
          { n: 5, action: 'Compute drought risk counter-check', finding: '590mm total → drought risk = LOW. Flood and storm risk = CRITICAL' },
          { n: 6, action: 'Generate climate brief for DecisionAgent', finding: 'Storm prob 78%, cyclone conv. risk, 7-day total 590mm — CRITICAL weather window' },
        ],
        metrics: [
          { name: '7-Day Rainfall', value: '590mm', threshold: '< 281mm', ok: false },
          { name: 'Storm Probability', value: '78%', threshold: '< 30%', ok: false },
          { name: 'Cyclone Landfall', value: '61%', threshold: '< 20%', ok: false },
          { name: 'Peak Day Rainfall', value: '124mm', threshold: '< 50mm', ok: false },
          { name: 'Drought Risk', value: 'LOW', threshold: 'N/A', ok: true },
        ],
        issueFound: true, severity: 'high',
        issueSummary: '590mm 7-day forecast (2.1× average). 78% storm probability. Cyclone convergence risk.',
        dispatches: [
          { target: 'Decision Agent', targetType: 'agent', urgency: 'high', message: 'storm_prob=78%, total_7d=590mm, cyclone_prob=61%, flood_amplification=1.4×', channel: 'agent-bus' },
          { target: 'Fishermen (Bay of Bengal)', targetType: 'fisherman', urgency: 'critical', message: 'CYCLONE WARNING: Do not venture into Bay of Bengal for next 7 days. System tracking towards NE India coast.', channel: 'SMS Broadcast + Coast Guard Radio' },
        ],
      },
      {
        id: 'alert', name: 'Alert Agent', stage: 'coordination', status: 'passing', statusLabel: 'DISPATCHING',
        summary: 'Multi-channel alerts dispatched — 4 districts, 6 departments, 240K citizens notified',
        confidence: 99, elapsed: '0.8s',
        dataSources: [
          { name: 'Flood Agent — CRITICAL alert bundle', type: 'api', freshness: '0 sec', quality: 94, detail: 'Districts, population counts, crest ETA, evacuation zones' },
          { name: 'Climate Agent — storm and cyclone data', type: 'api', freshness: '0 sec', quality: 88, detail: 'Storm probability 78%, cyclone landfall 61%' },
          { name: 'Government contact database', type: 'db', freshness: '1 day ago', quality: 100, detail: 'DM contacts, NDRF/SDRF coordinators, CMO numbers' },
          { name: 'Citizen alert registry (Aarogya Setu integration)', type: 'db', freshness: '1 hr ago', quality: 97, detail: '2.1M registered citizens in 4 affected districts' },
        ],
        rules: [
          { condition: 'Severity == CRITICAL from upstream agent', trigger: 'FloodAgent CRITICAL', action: 'Send SMS + automated call to all DM offices. Wake NDRF duty officer.', priority: 'critical' },
          { condition: 'Population at risk > 100K', trigger: '240K > 100K', action: 'Activate state emergency operations centre. Notify CM office.', priority: 'critical' },
          { condition: 'All alert channels must confirm delivery', trigger: 'Any channel failure', action: 'Retry × 3, escalate to satellite backup channel', priority: 'high' },
          { condition: 'Public alert — plain language required', trigger: 'Citizen broadcast', action: 'Auto-translate to Assamese and Bengali. No technical jargon.', priority: 'medium' },
        ],
        steps: [
          { n: 1, action: 'Receive CRITICAL bundles from FloodAgent and ClimateAgent', finding: 'Two CRITICAL packages received — merging for unified alert' },
          { n: 2, action: 'Classify alert recipients by severity tier', finding: 'Tier 1: DMs, NDRF, SDRF. Tier 2: Health, PWD, Irrigation. Tier 3: Citizens' },
          { n: 3, action: 'Generate district-specific messages in Assamese + Bengali + English', finding: 'Auto-translated 4 district alerts — language validation passed' },
          { n: 4, action: 'Dispatch to government portal + SMS gateway', finding: 'Kamrup DM: delivered 09:14. Barpeta DM: delivered 09:14. All 4 DMs confirmed.', alert: true },
          { n: 5, action: 'Broadcast citizen alert via 240K SMS + 42 public PA systems', finding: '238,741 SMS delivered (99.4%). 42/42 PA systems activated.', alert: true },
          { n: 6, action: 'Notify fishermen via Coast Guard radio + SMS', finding: 'Bay of Bengal warning broadcast on VHF Ch 16 + 12,400 fisherman SMS' },
          { n: 7, action: 'Log all dispatches and confirm to DecisionAgent', finding: 'All channels confirmed. Passing dispatch log to DecisionAgent.' },
        ],
        metrics: [
          { name: 'SMS Delivery Rate', value: '99.4%', threshold: '> 95%', ok: true },
          { name: 'PA Systems Active', value: '42/42', threshold: '> 90%', ok: true },
          { name: 'DM Confirmation', value: '4/4', threshold: '4/4', ok: true },
          { name: 'Alert Latency', value: '0.8s', threshold: '< 60s', ok: true },
          { name: 'Translations Done', value: '3 langs', threshold: '≥ 2', ok: true },
        ],
        issueFound: false,
        issueSummary: 'All alerts dispatched successfully across all channels.',
        dispatches: [
          { target: 'Decision Agent', targetType: 'agent', urgency: 'high', message: 'Dispatch confirmed: 240K citizens, 4 DMs, NDRF, SDRF, Coast Guard. Log attached.', channel: 'agent-bus' },
          { target: 'Emergency Services', targetType: 'emergency', urgency: 'critical', message: 'NDRF: Pre-position 4 teams (120 boats) in Kamrup, Barpeta, Morigaon, Nagaon immediately.', channel: 'NDRF Command Portal + Phone' },
          { target: 'Citizens (4 Districts)', targetType: 'public', urgency: 'critical', message: 'ব্ৰহ্মপুত্ৰ নদীত বানপানী। আপুনাৰ এলেকা এৰি যাওক। (Brahmaputra flood — evacuate your area now)', channel: 'SMS + PA Broadcast' },
        ],
      },
      {
        id: 'decision', name: 'Decision Agent', stage: 'decision', status: 'alert', statusLabel: 'FINAL VERDICT',
        summary: 'CRITICAL: Multi-hazard event — flood + cyclone. Full emergency protocol activated.',
        confidence: 96, elapsed: '1.8s',
        dataSources: [
          { name: 'Sensor Agent — validated IoT readings', type: 'api', freshness: '0 sec', quality: 97, detail: 'River 7.2m, soil 94%, rain 28.4mm/h' },
          { name: 'Satellite Agent — inundation + cyclone track', type: 'api', freshness: '0 sec', quality: 93, detail: '18.4km² active, cyclone 61% landfall' },
          { name: 'Flood Agent — risk model output', type: 'api', freshness: '0 sec', quality: 94, detail: 'Crest 7.8–8.1m, 240K at risk, evacuation score 9.4' },
          { name: 'Climate Agent — storm forecast', type: 'api', freshness: '0 sec', quality: 88, detail: 'Storm 78%, 590mm 7-day, cyclone amplification' },
          { name: 'Alert Agent — dispatch confirmation', type: 'api', freshness: '0 sec', quality: 99, detail: 'All channels confirmed — 240K notified' },
        ],
        rules: [
          { condition: 'Severity CRITICAL from ≥ 2 upstream agents', trigger: 'FloodAgent + SatelliteAgent both CRITICAL', action: 'Declare STATE EMERGENCY — all government machinery activated', priority: 'critical' },
          { condition: 'Population at risk > 100K AND crest ETA < 12h', trigger: '240K AND 6h', action: 'Mandatory evacuation order — no exceptions. NDRF full deployment.', priority: 'critical' },
          { condition: 'Cyclone convergence risk > 50%', trigger: '61% landfall', action: 'Fishermen ban, coastal pre-positioning, Chief Secretary briefing', priority: 'high' },
          { condition: 'Reservoir overflow risk HIGH', trigger: 'Kopili 87.4%', action: 'HOLD all dam releases — Irrigation Dept immediate instruction', priority: 'critical' },
        ],
        steps: [
          { n: 1, action: 'Aggregate intelligence from 4 upstream agents', finding: 'All 4 agents reporting CRITICAL/HIGH. Confidence-weighted synthesis: 94%' },
          { n: 2, action: 'Cross-validate flood model with satellite inundation data', finding: 'HEC-RAS model consistent with SAR observation — increasing confidence to 96%' },
          { n: 3, action: 'Evaluate compound hazard: flood + cyclone convergence', finding: 'COMPOUND EVENT: simultaneous flood + approaching cyclone = HIGH emergency multiplier' },
          { n: 4, action: 'Apply governance rules for population threshold', finding: '240K > 100K threshold → Mandatory state emergency declaration triggered' },
          { n: 5, action: 'Generate prioritised precaution list', finding: '5 precautions generated: dam hold, NDRF deploy, evacuation, fishermen ban, crop advisory' },
          { n: 6, action: 'Compile final verdict and action dispatch', finding: 'Final verdict: CRITICAL. All actions dispatched. Monitoring cadence set to 10 minutes.' },
        ],
        metrics: [
          { name: 'Consensus Severity', value: 'CRITICAL', threshold: 'N/A', ok: false },
          { name: 'Agents Consulted', value: '4/4', threshold: '4/4', ok: true },
          { name: 'Decision Confidence', value: '96%', threshold: '> 85%', ok: true },
          { name: 'Response Time', value: '1.8s', threshold: '< 5s', ok: true },
        ],
        issueFound: true, severity: 'critical',
        issueSummary: 'MULTI-HAZARD CRITICAL — flood in progress + cyclone approaching. Full emergency activation.',
        dispatches: [
          { target: 'Irrigation Dept', targetType: 'dept', urgency: 'critical', message: 'IMMEDIATE: Hold all Kopili dam gate releases for 48 hours. Additional release will push Brahmaputra crest to 8.5m — catastrophic.', channel: 'Emergency Portal + Phone' },
          { target: 'NDRF / Emergency', targetType: 'emergency', urgency: 'critical', message: 'Deploy 120 rescue boats across 4 districts: 30 Kamrup, 30 Barpeta, 30 Morigaon, 30 Nagaon. Activate 4 NDRF teams within 2 hours.', channel: 'NDRF Command' },
          { target: 'Citizens (4 Districts)', targetType: 'public', urgency: 'critical', message: 'EVACUATE IMMEDIATELY — Brahmaputra flood crest expected in 6 hours. Move to nearest relief camp. Do not return until further notice.', channel: 'SMS + PA + Doordarshan' },
          { target: 'Fishermen (Bay of Bengal)', targetType: 'fisherman', urgency: 'critical', message: 'CYCLONE WARNING: Do not go to sea for the next 7 days. Cyclonic system approaching NE coast with 61% landfall probability.', channel: 'Coast Guard VHF + SMS' },
          { target: 'Farmers (Flood Zone)', targetType: 'farmer', urgency: 'high', message: 'Move livestock to higher ground immediately. Protect crop storage. After flood: prioritise Boro rice and flood-tolerant varieties for replanting.', channel: 'ATMA Krishi SMS + Radio' },
        ],
      },
    ],
    verdict: {
      severity: 'critical', title: 'MULTI-HAZARD EMERGENCY — Assam',
      summary: 'Brahmaputra at 7.2m (CRITICAL, 1.2m above threshold). SAR confirms 18.4km² active inundation. 240,000 residents at risk across 4 districts. Crest 7.8–8.1m expected in 6–8 hours. Cyclonic system 61% landfall probability within 72h. Full emergency protocol activated.',
      agentsInput: ['Sensor Agent', 'Satellite Agent', 'Flood Agent', 'Climate Agent', 'Alert Agent'],
      precautions: [
        'HOLD all Kopili dam gate releases for minimum 48 hours — additional release catastrophic',
        'Mandatory evacuation for 4 Assam districts — 240K residents to relief camps within 3 hours',
        'NDRF deploy 120 rescue boats across Kamrup, Barpeta, Morigaon, Nagaon immediately',
        'Fishermen: No fishing in Bay of Bengal for 7 days — cyclone warning active',
        'Farmers: Move livestock to high ground, protect grain stores, prepare flood-tolerant seed stock',
        'Citizens: Reduce non-essential water usage — WTP intake contamination risk HIGH',
      ],
      dispatches: [
        { target: 'Irrigation Department', icon: 'building', urgency: 'CRITICAL', message: 'Hold Kopili dam gates for 48 hours. Do not release additional water into already-critical Brahmaputra.' },
        { target: 'NDRF / Emergency Services', icon: 'emergency', urgency: 'CRITICAL', message: 'Deploy 120 rescue boats, 4 NDRF teams across 4 Assam districts. Evacuate 240,000 residents within 3 hours.' },
        { target: 'Citizens — 4 Districts', icon: 'public', urgency: 'CRITICAL', message: 'EVACUATE NOW. Flood crest arriving in 6 hours. Move to nearest relief camp. Do not use roads near riverbanks.' },
        { target: 'Bay of Bengal Fishermen', icon: 'fisherman', urgency: 'CRITICAL', message: 'CYCLONE WARNING — No fishing for 7 days. Cyclonic system approaching NE India coast at 18 km/h.' },
        { target: 'Farmers (Flood Zone)', icon: 'farmer', urgency: 'HIGH', message: 'Move livestock and grain to high ground. After flooding: replant with Swarna Sub-1 flood-tolerant rice variety.' },
        { target: 'Health Department', icon: 'dept', urgency: 'HIGH', message: 'Pre-position cholera, typhoid vaccines at 12 relief camps. Ensure ORS supply. Activate waterborne disease surveillance.' },
      ],
    },
  },

  rajasthan: {
    agents: [
      {
        id: 'sensor', name: 'Sensor Agent', stage: 'collection', status: 'completed', statusLabel: 'DATA READY',
        summary: '89K groundwater piezometers + 420 weather stations — drought conditions confirmed',
        confidence: 95, elapsed: '1.4s',
        dataSources: [
          { name: 'CGWB Piezometer Network (89K wells)', type: 'sensor', freshness: '6 hr ago', quality: 92, detail: 'Average depth 42m — all-time record for June' },
          { name: 'IMD Rajasthan Weather Station Network (420)', type: 'sensor', freshness: '1 hr ago', quality: 94, detail: 'Max temp 44.8°C Jaisalmer, 43.2°C Bikaner — above normal by 4.1°C' },
          { name: 'River gauges — Luni, Banas, Chambal', type: 'sensor', freshness: '2 hr ago', quality: 88, detail: 'All 3 rivers below seasonal average — Banas at 22% normal flow' },
          { name: 'Bisalpur Reservoir level sensor', type: 'sensor', freshness: '30 min ago', quality: 99, detail: 'Current fill: 41.3% (447MCM/1086MCM) — CRITICAL low' },
        ],
        rules: [
          { condition: 'Groundwater depth > 35m', trigger: '42m > 35m threshold', action: 'DROUGHT EMERGENCY flag — notify GroundwaterAgent, Climate Agent', priority: 'critical' },
          { condition: 'Reservoir fill < 50%', trigger: '41.3% < 50%', action: 'Flag water scarcity — pass to ReservoirAgent for allocation planning', priority: 'high' },
          { condition: 'Temperature > seasonal average + 3°C', trigger: '+4.1°C anomaly', action: 'Heat stress + evaporation alert — multiply water consumption estimate', priority: 'high' },
        ],
        steps: [
          { n: 1, action: 'Query CGWB piezometer database — 89K wells', finding: 'State average groundwater depth: 42m — record for this date. -8.4m vs 5-yr average', alert: true },
          { n: 2, action: 'Aggregate IMD weather station data — 420 stations', finding: 'Max temp: 44.8°C. Average: 42.1°C. Anomaly: +4.1°C vs 30-yr normal' },
          { n: 3, action: 'Check river flow rates for Luni, Banas, Chambal', finding: 'Banas: 22% of normal. Luni: 18% of normal. Chambal: 41% of normal' },
          { n: 4, action: 'Query Bisalpur reservoir — primary Jaipur supply', finding: 'Fill 41.3% (447 MCM / 1086 MCM). At current demand: 38 days of supply remaining', alert: true },
        ],
        metrics: [
          { name: 'Groundwater Depth', value: '42m', threshold: '< 35m', ok: false },
          { name: 'Bisalpur Fill', value: '41.3%', threshold: '> 50%', ok: false },
          { name: 'Temp Anomaly', value: '+4.1°C', threshold: '< +2°C', ok: false },
          { name: 'Banas River Flow', value: '22% normal', threshold: '> 60%', ok: false },
        ],
        issueFound: true, severity: 'critical',
        issueSummary: 'Groundwater at record 42m depth. Bisalpur reservoir 38 days supply. Temp +4.1°C above normal.',
        dispatches: [
          { target: 'Groundwater Agent', targetType: 'agent', urgency: 'critical', message: 'depth=42m, extraction=480mm/yr, recharge=120mm/yr, net_balance=-360mm/yr', channel: 'agent-bus' },
          { target: 'Climate Agent', targetType: 'agent', urgency: 'high', message: 'temp_anomaly=+4.1C, rainfall_deficit=62%, reservoir=41.3%, drought_index=D3', channel: 'agent-bus' },
        ],
      },
      {
        id: 'groundwater', name: 'Groundwater Agent', stage: 'analysis', status: 'alert', statusLabel: 'DROUGHT CRITICAL',
        summary: 'Aquifer depletion rate 360mm/yr net deficit — 8.2 years to critical depth at current extraction',
        confidence: 91, elapsed: '2.6s',
        dataSources: [
          { name: 'Sensor Agent — 89K piezometer readings', type: 'api', freshness: '0 sec', quality: 92, detail: 'State average 42m depth' },
          { name: 'GRACE-FO Satellite — groundwater storage anomaly', type: 'satellite', freshness: '3 days ago', quality: 87, detail: '-42 km³ storage deficit since 2002' },
          { name: 'CGWB annual extraction estimates', type: 'db', freshness: '6 months ago', quality: 85, detail: 'Extraction 480 mm/yr vs recharge 120 mm/yr' },
        ],
        rules: [
          { condition: 'Net deficit > 200mm/yr', trigger: '-360mm/yr', action: 'CRITICAL depletion — recommend extraction quotas immediately', priority: 'critical' },
          { condition: 'Aquifer years to critical < 10', trigger: '8.2 years', action: 'Long-term emergency planning — alert Agriculture + Urban Planning depts', priority: 'high' },
        ],
        steps: [
          { n: 1, action: 'Compute net groundwater balance', finding: 'Recharge 120mm/yr - extraction 480mm/yr = -360mm/yr deficit', alert: true },
          { n: 2, action: 'Project years to reach 60m critical depth', finding: 'At -360mm/yr: 8.2 years to pumps failing across 14 districts', alert: true },
          { n: 3, action: 'Identify highest-extraction districts', finding: 'Nagaur: 620mm/yr. Jodhpur: 580mm/yr. Barmer: 560mm/yr — all unsustainable' },
          { n: 4, action: 'Compute emergency rationing requirement', finding: 'Need 40% extraction reduction across state to reach sustainable balance' },
        ],
        metrics: [
          { name: 'Net Balance', value: '-360mm/yr', threshold: '> 0', ok: false },
          { name: 'Years to Critical', value: '8.2 yr', threshold: '> 20 yr', ok: false },
          { name: 'GRACE Deficit', value: '-42 km³', threshold: '0 km³', ok: false },
        ],
        issueFound: true, severity: 'critical',
        issueSummary: 'Aquifer losing 360mm/yr. 8.2 years until 14 districts lose groundwater access. Immediate extraction quotas required.',
        dispatches: [
          { target: 'Decision Agent', targetType: 'agent', urgency: 'critical', message: 'DROUGHT: net_deficit=360mm/yr, years_critical=8.2, extraction_cut_needed=40%, districts_at_risk=14', channel: 'agent-bus' },
          { target: 'Irrigation Dept', targetType: 'dept', urgency: 'critical', message: 'IMMEDIATE: Reduce groundwater extraction permits by 40%. Ban new deep borewells. Enforce existing quotas in Nagaur, Jodhpur, Barmer.', channel: 'Official Order + Portal' },
        ],
      },
      {
        id: 'decision', name: 'Decision Agent', stage: 'decision', status: 'alert', statusLabel: 'DROUGHT EMERGENCY',
        summary: 'DROUGHT EMERGENCY declared — water rationing, crop advisory, extraction quotas',
        confidence: 92, elapsed: '1.6s',
        dataSources: [
          { name: 'Sensor Agent', type: 'api', freshness: '0 sec', quality: 95, detail: 'Groundwater 42m, temp +4.1°C, Bisalpur 41.3%' },
          { name: 'Groundwater Agent', type: 'api', freshness: '0 sec', quality: 91, detail: 'Deficit 360mm/yr, 8.2 years critical' },
          { name: 'Climate Agent', type: 'api', freshness: '0 sec', quality: 88, detail: 'Rainfall 62% below normal, drought D3 classification' },
        ],
        rules: [
          { condition: 'Groundwater years_to_critical < 10 AND reservoir < 50%', trigger: '8.2yr AND 41.3%', action: 'DROUGHT EMERGENCY — declare Section 6A Water Crisis', priority: 'critical' },
          { condition: 'Rainfall deficit > 50%', trigger: '62% deficit', action: 'Crop failure risk HIGH — issue farmer advisory for drought-resistant varieties', priority: 'high' },
        ],
        steps: [
          { n: 1, action: 'Synthesize inputs from 3 agents', finding: 'Consensus: DROUGHT EMERGENCY D3. All indicators at historic lows.' },
          { n: 2, action: 'Apply water crisis governance rules', finding: 'Section 6A threshold crossed — state-level water emergency declaration warranted' },
          { n: 3, action: 'Generate rationing plan for 240 urban areas', finding: 'Jaipur: 3 days/week supply. Rural: emergency tanker deployment to 1,840 villages' },
          { n: 4, action: 'Compute crop advisory for Kharif season', finding: 'Expected monsoon: 38% below normal. Recommend: pearl millet, moth bean, drought-resistant maize' },
        ],
        metrics: [
          { name: 'Drought Classification', value: 'D3 Extreme', threshold: '< D2', ok: false },
          { name: 'Rainfall Deficit', value: '62%', threshold: '< 25%', ok: false },
          { name: 'Bisalpur Days', value: '38 days', threshold: '> 120 days', ok: false },
        ],
        issueFound: true, severity: 'critical',
        issueSummary: 'DROUGHT EMERGENCY D3. Water rationing required. 40% extraction reduction. Crop advisory for drought-resistant varieties.',
        dispatches: [
          { target: 'State Government', targetType: 'dept', urgency: 'critical', message: 'Declare Section 6A Water Emergency. Deploy emergency tankers to 1,840 villages. Activate MGNREGA water conservation works.', channel: 'Chief Secretary Briefing + Gazette' },
          { target: 'Citizens (Urban)', targetType: 'public', urgency: 'high', message: 'Water supply reduced to 3 days per week in Jaipur, Jodhpur, Bikaner due to severe drought. Store water. Avoid wastage.', channel: 'SMS + DD Rajasthan' },
          { target: 'Farmers (Rajasthan)', targetType: 'farmer', urgency: 'high', message: 'Monsoon 2025 expected 38% below normal. Cultivate drought-resistant crops: Pearl Millet (Bajra), Moth Bean, Cluster Bean (Guar). Avoid water-intensive paddy and sugarcane.', channel: 'ATMA Krishi SMS + Kisan Call Centre' },
          { target: 'Irrigation Dept', targetType: 'dept', urgency: 'critical', message: 'Reduce groundwater extraction permits 40%. Enforce borewell quotas. Prioritise drinking water over agriculture.', channel: 'Official Order' },
        ],
      },
    ],
    verdict: {
      severity: 'critical', title: 'DROUGHT EMERGENCY D3 — Rajasthan',
      summary: 'Groundwater at record 42m depth with -360mm/yr net deficit. Bisalpur reservoir 38 days of supply remaining. Temperature +4.1°C above normal. Monsoon 2025 forecast 62% below normal. Immediate water rationing and agricultural intervention required.',
      agentsInput: ['Sensor Agent', 'Groundwater Agent', 'Climate Agent'],
      precautions: [
        'Declare Section 6A Water Emergency — activate all government drought machinery',
        'Reduce groundwater extraction permits by 40% — immediate enforcement in Nagaur, Jodhpur, Barmer',
        'Urban water supply: 3 days/week rationing for Jaipur, Jodhpur, Bikaner',
        'Emergency tankers to 1,840 rural villages within 48 hours',
        'Farmers: switch to pearl millet, moth bean — avoid paddy and sugarcane for Kharif 2025',
        'Citizens: reduce household water usage by 30% — install water meters in top-consuming households',
      ],
      dispatches: [
        { target: 'State Government', icon: 'dept', urgency: 'CRITICAL', message: 'Declare Section 6A Water Emergency. Activate MGNREGA water conservation. Emergency cabinet session.' },
        { target: 'Irrigation Department', icon: 'building', urgency: 'CRITICAL', message: 'Reduce extraction permits 40%. Enforce borewell quotas. Prioritise drinking water over irrigation.' },
        { target: 'Citizens (Urban)', icon: 'public', urgency: 'HIGH', message: 'Water supply 3 days/week. Store water. Avoid wastage. Emergency helpline: 1916.' },
        { target: 'Farmers (Rajasthan)', icon: 'farmer', urgency: 'HIGH', message: 'Kharif 2025: Grow pearl millet (bajra), moth bean, guar. Avoid paddy and sugarcane — monsoon will be 38% below normal.' },
        { target: 'Rural Villages (1,840)', icon: 'public', urgency: 'HIGH', message: 'Emergency water tankers deployed within 48 hours. Report shortage to district collector.' },
      ],
    },
  },
}

// Generic fallback for other states
function genericWorkflow(stateName: string): StateWorkflow {
  return {
    agents: [
      {
        id: 'sensor', name: 'Sensor Agent', stage: 'collection', status: 'completed', statusLabel: 'DATA READY',
        summary: `${stateName} IoT network — 42K readings ingested from sensors, gauges, and weather stations`,
        confidence: 88, elapsed: '1.8s',
        dataSources: [
          { name: 'IoT Sensor Network', type: 'sensor', freshness: '5 min ago', quality: 91, detail: `42K active sensors across ${stateName}` },
          { name: 'Weather Station Array', type: 'sensor', freshness: '1 hr ago', quality: 88, detail: 'Temperature, humidity, rainfall measurements' },
          { name: 'River Gauge Network', type: 'sensor', freshness: '30 min ago', quality: 94, detail: 'River levels and discharge rates' },
          { name: 'PostgreSQL WaterOS DB', type: 'db', freshness: '2 min ago', quality: 99, detail: 'Historical baselines and thresholds' },
        ],
        rules: [
          { condition: 'Any parameter > threshold × 0.85', trigger: 'Early warning band', action: 'Escalate to analysis agents', priority: 'high' },
          { condition: 'Data gap > 10 minutes', trigger: 'Sensor offline', action: 'Use interpolation, alert ops team', priority: 'medium' },
        ],
        steps: [
          { n: 1, action: 'Poll all IoT sensors via SCADA', finding: '42,184 readings received. Latency 1.8s. Quality 88%.' },
          { n: 2, action: 'Cross-validate readings with redundant sensors', finding: 'Validation passed. 3 sensors flagged for maintenance.' },
          { n: 3, action: 'Package data bundle for analysis agents', finding: 'Bundle prepared — passing to analysis stage.' },
        ],
        metrics: [
          { name: 'Sensor Uptime', value: '98.2%', threshold: '> 95%', ok: true },
          { name: 'Data Quality', value: '88%', threshold: '> 80%', ok: true },
          { name: 'Readings Ingested', value: '42K', threshold: 'N/A', ok: true },
        ],
        issueFound: false,
        dispatches: [{ target: 'Analysis Agents', targetType: 'agent', urgency: 'medium', message: 'Sensor bundle ready — 42K readings packaged', channel: 'agent-bus' }],
      },
      {
        id: 'decision', name: 'Decision Agent', stage: 'decision', status: 'completed', statusLabel: 'MONITORING',
        summary: `${stateName} — normal conditions. Continuous monitoring active. No immediate action required.`,
        confidence: 85, elapsed: '2.1s',
        dataSources: [
          { name: 'Sensor Agent bundle', type: 'api', freshness: '0 sec', quality: 88, detail: '42K readings — all within normal range' },
          { name: 'Open-Meteo API', type: 'api', freshness: '5 min ago', quality: 90, detail: '7-day forecast — moderate conditions' },
        ],
        rules: [
          { condition: 'All agents report NORMAL', trigger: 'No threshold breaches', action: 'Continue monitoring. Report to dashboard.', priority: 'low' },
        ],
        steps: [
          { n: 1, action: 'Aggregate all agent inputs', finding: 'All agents reporting within normal parameters' },
          { n: 2, action: 'Apply governance thresholds', finding: 'No thresholds breached — no emergency actions required' },
          { n: 3, action: 'Generate routine status report', finding: `${stateName} water status: NORMAL. Next review: 4 hours.` },
        ],
        metrics: [{ name: 'Overall Status', value: 'NORMAL', threshold: 'N/A', ok: true }],
        issueFound: false,
        dispatches: [{ target: 'Dashboard', targetType: 'dept', urgency: 'low', message: 'Routine status update — no alerts', channel: 'API' }],
      },
    ],
    verdict: {
      severity: 'clear', title: `Normal Operations — ${stateName}`,
      summary: `All water parameters within normal range for ${stateName}. Continuous AI monitoring active. No immediate action required.`,
      agentsInput: ['Sensor Agent', 'Decision Agent'],
      precautions: ['Continue routine monitoring', 'Ensure sensor network maintenance schedule is current', 'Review seasonal outlook for upcoming quarter'],
      dispatches: [
        { target: 'Operations Team', icon: 'dept', urgency: 'LOW', message: 'Normal status. Routine monitoring continues. Next scheduled report in 4 hours.' },
      ],
    },
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const STAGE_LABELS: Record<Stage, string> = { collection: 'Data Collection', analysis: 'Analysis', coordination: 'Coordination', decision: 'Decision' }
const STATUS_DOT: Record<AgentStatus, string> = {
  collecting: 'bg-blue-500 animate-pulse', analyzing: 'bg-amber-500 animate-pulse',
  alert: 'bg-red-500 animate-pulse', completed: 'bg-emerald-500',
  passing: 'bg-purple-500 animate-pulse', idle: 'bg-slate-500',
}
const STATUS_BORDER: Record<AgentStatus, string> = {
  collecting: 'border-blue-500/40', analyzing: 'border-amber-500/40',
  alert: 'border-red-500/40 shadow-red-500/10 shadow-lg', completed: 'border-emerald-500/30',
  passing: 'border-purple-500/40', idle: 'border-white/5',
}
const SEVERITY_STYLE: Record<string, string> = {
  critical: 'text-red-400 bg-red-500/10 border-red-500/30',
  high:     'text-orange-400 bg-orange-500/10 border-orange-500/30',
  medium:   'text-amber-400 bg-amber-500/10 border-amber-500/30',
  low:      'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  clear:    'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
}
const SRC_ICON: Record<SrcType, ReactElement> = {
  sensor:    <Radio className="w-3 h-3 text-amber-400" />,
  satellite: <Satellite className="w-3 h-3 text-purple-400" />,
  api:       <Globe className="w-3 h-3 text-emerald-400" />,
  manual:    <Map className="w-3 h-3 text-cyan-400" />,
  model:     <Cpu className="w-3 h-3 text-blue-400" />,
  db:        <Database className="w-3 h-3 text-blue-400" />,
}
const DISPATCH_ICON: Record<string, ReactElement> = {
  building:  <Building2 className="w-4 h-4" />,
  emergency: <Zap className="w-4 h-4" />,
  public:    <Users className="w-4 h-4" />,
  farmer:    <Wheat className="w-4 h-4" />,
  fisherman: <Fish className="w-4 h-4" />,
  dept:      <Building2 className="w-4 h-4" />,
}
const AGENT_ICON = (id: string) => {
  const c = 'w-4 h-4'
  if (id === 'flood')       return <Waves className={c} />
  if (id === 'satellite')   return <Satellite className={c} />
  if (id === 'climate')     return <CloudRain className={c} />
  if (id === 'reservoir')   return <Droplets className={c} />
  if (id === 'groundwater') return <Shield className={c} />
  if (id === 'alert')       return <AlertTriangle className={c} />
  if (id === 'decision')    return <Brain className={c} />
  return <Radio className={c} />
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function AgentNode({ agent, selected, onClick }: { agent: AgentDef; selected: boolean; onClick: () => void }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className="text-[8px] text-slate-600 uppercase tracking-wider">{STAGE_LABELS[agent.stage]}</span>
      <motion.button
        onClick={onClick}
        whileHover={{ scale: 1.05 }}
        className={`relative flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all min-w-[88px] ${
          selected ? 'bg-blue-500/15 border-blue-400/50 shadow-blue-500/20 shadow-lg' : `bg-white/3 ${STATUS_BORDER[agent.status]} hover:bg-white/6`
        }`}
      >
        <div className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ${STATUS_DOT[agent.status]}`} />
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${agent.id === 'decision' ? 'bg-amber-500/20 text-amber-400' : 'bg-white/8 text-slate-300'}`}>
          {AGENT_ICON(agent.id)}
        </div>
        <p className="text-[9px] font-semibold text-white text-center leading-tight">{agent.name}</p>
        <span className={`text-[8px] px-1.5 py-0.5 rounded-full border ${agent.issueFound ? 'text-red-400 bg-red-500/10 border-red-500/20' : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'}`}>
          {agent.statusLabel}
        </span>
      </motion.button>
    </div>
  )
}

function FlowLine({ active }: { active: boolean }) {
  return (
    <div className="flex items-center mt-5 mx-1">
      <div className={`h-px w-8 relative overflow-hidden rounded-full ${active ? 'bg-blue-500/20' : 'bg-white/5'}`}>
        {active && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-flow" />}
      </div>
      <ArrowRight className={`w-3 h-3 shrink-0 ${active ? 'text-blue-500' : 'text-slate-700'}`} />
    </div>
  )
}

function TabBar({ active, onChange }: { active: TabId; onChange: (t: TabId) => void }) {
  const tabs: { id: TabId; label: string }[] = [
    { id: 'sources', label: 'Data Sources' },
    { id: 'analysis', label: 'Analysis' },
    { id: 'rules', label: 'Governance Rules' },
    { id: 'actions', label: 'Actions & Dispatch' },
  ]
  return (
    <div className="flex gap-1 p-1 bg-white/3 rounded-lg border border-white/5">
      {tabs.map(t => (
        <button key={t.id} onClick={() => onChange(t.id)}
          className={`flex-1 text-[10px] py-1.5 rounded-md transition-all font-medium ${active === t.id ? 'bg-blue-500/20 text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}>
          {t.label}
        </button>
      ))}
    </div>
  )
}

function DetailPanel({ agent }: { agent: AgentDef }) {
  const [tab, setTab] = useState<TabId>('sources')
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}
      className="space-y-3">
      {/* Agent header */}
      <div className="flex items-center gap-3 p-3 bg-white/3 rounded-xl border border-white/8">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${agent.id === 'decision' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/15 text-blue-400'}`}>
          {AGENT_ICON(agent.id)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-white">{agent.name}</p>
          <p className="text-[10px] text-slate-400 truncate">{agent.summary}</p>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className={`text-[9px] px-2 py-0.5 rounded-full border ${agent.issueFound ? SEVERITY_STYLE[agent.severity || 'high'] : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'}`}>
            {agent.issueFound ? `ISSUE: ${(agent.severity || '').toUpperCase()}` : 'NO ISSUES'}
          </span>
          <div className="flex items-center gap-2 text-[9px] text-slate-600">
            <Clock className="w-2.5 h-2.5" />
            {agent.elapsed} · {agent.confidence}% confidence
          </div>
        </div>
      </div>

      {agent.issueFound && agent.issueSummary && (
        <div className="p-2.5 bg-red-500/5 border border-red-500/20 rounded-lg flex items-start gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
          <p className="text-[10px] text-red-300">{agent.issueSummary}</p>
        </div>
      )}

      <TabBar active={tab} onChange={setTab} />

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>

          {tab === 'sources' && (
            <div className="space-y-1.5">
              {agent.dataSources.map((s, i) => (
                <div key={i} className="p-2.5 bg-white/3 rounded-lg border border-white/5 flex items-start gap-2.5">
                  <div className="mt-0.5">{SRC_ICON[s.type]}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-medium text-slate-200">{s.name}</p>
                    <p className="text-[9px] text-slate-500 mt-0.5">{s.detail}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-[9px] text-slate-500">{s.freshness}</p>
                    <p className="text-[9px] text-emerald-400">{s.quality}% quality</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'analysis' && (
            <div className="space-y-1.5">
              {agent.steps.map(s => (
                <div key={s.n} className={`p-2.5 rounded-lg border flex items-start gap-2.5 ${s.alert ? 'bg-red-500/5 border-red-500/15' : 'bg-white/3 border-white/5'}`}>
                  <span className={`text-[9px] font-mono font-bold shrink-0 mt-0.5 ${s.alert ? 'text-red-400' : 'text-blue-400'}`}>{s.n}.</span>
                  <div>
                    <p className="text-[9px] text-slate-500 uppercase tracking-wider">{s.action}</p>
                    <p className={`text-[10px] mt-0.5 ${s.alert ? 'text-red-300' : 'text-slate-300'}`}>{s.finding}</p>
                  </div>
                </div>
              ))}
              <div className="grid grid-cols-3 gap-1.5 mt-2">
                {agent.metrics.map((m, i) => (
                  <div key={i} className={`p-2 rounded-lg border text-center ${m.ok ? 'bg-white/3 border-white/5' : 'bg-red-500/5 border-red-500/20'}`}>
                    <p className={`text-[10px] font-bold ${m.ok ? 'text-white' : 'text-red-400'}`}>{m.value}</p>
                    <p className="text-[8px] text-slate-500 leading-tight">{m.name}</p>
                    <p className="text-[8px] text-slate-600">threshold: {m.threshold}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'rules' && (
            <div className="space-y-1.5">
              {agent.rules.map((r, i) => (
                <div key={i} className={`p-2.5 rounded-lg border ${SEVERITY_STYLE[r.priority]} bg-opacity-5`}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[9px] font-semibold uppercase tracking-wider">Rule {i + 1}</p>
                    <span className={`text-[8px] px-1.5 py-0.5 rounded-full border ${SEVERITY_STYLE[r.priority]}`}>{r.priority.toUpperCase()}</span>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[9px]"><span className="text-slate-500">IF </span><span className="text-slate-300 font-mono">{r.condition}</span></p>
                    <p className="text-[9px]"><span className="text-slate-500">TRIGGER: </span><span className="text-amber-300">{r.trigger}</span></p>
                    <p className="text-[9px]"><span className="text-slate-500">THEN: </span><span className="text-emerald-300">{r.action}</span></p>
                  </div>
                </div>
              ))}
              <div className="p-2.5 bg-blue-500/5 border border-blue-500/15 rounded-lg mt-2">
                <div className="flex items-center gap-1.5 mb-1"><Lock className="w-3 h-3 text-blue-400" /><p className="text-[9px] text-blue-400 font-medium">Governance Constraints</p></div>
                <p className="text-[9px] text-slate-400">All decisions logged to immutable audit trail. Human override available at any time. Critical actions require 2-agent consensus.</p>
              </div>
            </div>
          )}

          {tab === 'actions' && (
            <div className="space-y-1.5">
              {agent.dispatches.map((d, i) => {
                const icons: Record<string, ReactElement> = {
                  dept: <Building2 className="w-3.5 h-3.5" />, agent: <Brain className="w-3.5 h-3.5" />,
                  public: <Users className="w-3.5 h-3.5" />, emergency: <Zap className="w-3.5 h-3.5" />,
                  farmer: <Wheat className="w-3.5 h-3.5" />, fisherman: <Fish className="w-3.5 h-3.5" />,
                }
                const colors: Record<string, string> = {
                  critical: 'border-red-500/30 bg-red-500/5', high: 'border-orange-500/30 bg-orange-500/5',
                  medium: 'border-amber-500/30 bg-amber-500/5', low: 'border-white/10 bg-white/3',
                }
                return (
                  <div key={i} className={`p-2.5 rounded-lg border ${colors[d.urgency]}`}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className={`${d.urgency === 'critical' ? 'text-red-400' : d.urgency === 'high' ? 'text-orange-400' : 'text-slate-400'}`}>{icons[d.targetType]}</span>
                        <p className="text-[10px] font-semibold text-white">{d.target}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[8px] px-1.5 py-0.5 rounded-full border ${SEVERITY_STYLE[d.urgency]}`}>{d.urgency.toUpperCase()}</span>
                        <span className="text-[8px] text-slate-600">{d.channel}</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-300 leading-relaxed">{d.message}</p>
                  </div>
                )
              })}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}

function FinalDecisionCard({ verdict }: { verdict: FinalVerdict }) {
  const [expanded, setExpanded] = useState(true)
  const bg = verdict.severity === 'critical' ? 'from-red-950/40 to-transparent border-red-500/20' :
             verdict.severity === 'high'     ? 'from-orange-950/40 to-transparent border-orange-500/20' :
             verdict.severity === 'clear'    ? 'from-emerald-950/20 to-transparent border-emerald-500/15' :
                                              'from-amber-950/30 to-transparent border-amber-500/20'
  const icon = verdict.severity === 'critical' ? <Zap className="w-4 h-4 text-red-400" /> :
               verdict.severity === 'clear'    ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> :
                                                <AlertTriangle className="w-4 h-4 text-amber-400" />

  return (
    <div className={`rounded-2xl border bg-gradient-to-b ${bg} p-5`}>
      <button onClick={() => setExpanded(!expanded)} className="w-full text-left">
        <div className="flex items-center gap-3 mb-1">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${verdict.severity === 'critical' ? 'bg-red-500/20' : verdict.severity === 'clear' ? 'bg-emerald-500/20' : 'bg-amber-500/20'}`}>
            {icon}
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold text-white flex items-center gap-2">
              {verdict.title}
              <span className={`text-[9px] px-2 py-0.5 rounded-full border ${SEVERITY_STYLE[verdict.severity]}`}>{verdict.severity.toUpperCase()}</span>
            </p>
            <p className="text-[10px] text-slate-500">Synthesised from {verdict.agentsInput.length} agents · Decision Agent final verdict</p>
          </div>
          {expanded ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <p className="text-[10px] text-slate-400 leading-relaxed mt-3 mb-4">{verdict.summary}</p>

            {/* Precautions */}
            <div className="mb-4">
              <p className="text-[9px] text-slate-500 uppercase tracking-wider mb-2 font-medium">Required Precautions</p>
              <div className="space-y-1.5">
                {verdict.precautions.map((p, i) => (
                  <div key={i} className="flex items-start gap-2 p-2 bg-white/3 rounded-lg border border-white/5">
                    <span className={`text-[9px] font-bold shrink-0 mt-0.5 ${verdict.severity === 'critical' ? 'text-red-400' : 'text-amber-400'}`}>{i + 1}.</span>
                    <p className="text-[10px] text-slate-300">{p}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Dispatch actions */}
            <div>
              <p className="text-[9px] text-slate-500 uppercase tracking-wider mb-2 font-medium">Actions Dispatched</p>
              <div className="grid grid-cols-1 gap-2">
                {verdict.dispatches.map((d, i) => (
                  <div key={i} className={`p-3 rounded-xl border flex items-start gap-3 ${d.urgency === 'CRITICAL' ? 'bg-red-500/5 border-red-500/20' : d.urgency === 'HIGH' ? 'bg-orange-500/5 border-orange-500/20' : 'bg-white/3 border-white/5'}`}>
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${d.urgency === 'CRITICAL' ? 'bg-red-500/20 text-red-400' : d.urgency === 'HIGH' ? 'bg-orange-500/20 text-orange-400' : 'bg-white/5 text-slate-400'}`}>
                      {DISPATCH_ICON[d.icon] ?? <MessageSquare className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-[10px] font-semibold text-white">{d.target}</p>
                        <span className={`text-[8px] px-1.5 py-0.5 rounded-full border shrink-0 ${SEVERITY_STYLE[d.urgency.toLowerCase()]}`}>{d.urgency}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-relaxed">{d.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/5">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <p className="text-[9px] text-slate-500">All decisions logged · Audit trail immutable · Human override available</p>
              <BarChart3 className="w-3 h-3 text-slate-600 ml-auto" />
              <p className="text-[9px] text-slate-600">Agents consulted: {verdict.agentsInput.join(', ')}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
interface Props { stateId: string; stateName: string }

export function AgentWorkflowPanel({ stateId, stateName }: Props) {
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null)
  const workflow = WORKFLOWS[stateId] ?? genericWorkflow(stateName)
  const { agents, verdict } = workflow
  const selectedAgent = agents.find(a => a.id === selectedAgentId) ?? null

  const alertCount  = agents.filter(a => a.status === 'alert').length
  const activeCount = agents.filter(a => a.status !== 'idle').length

  return (
    <GlassCard className="p-5 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-blue-500/15 flex items-center justify-center">
          <Activity className="w-4 h-4 text-blue-400" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white">Live AI Intelligence Pipeline — {stateName}</h3>
          <p className="text-[10px] text-slate-500">{activeCount} agents active · {alertCount > 0 ? `${alertCount} alerts` : 'no alerts'} · click agent to inspect reasoning</p>
        </div>
        {alertCount > 0 && (
          <div className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] text-red-400 font-semibold">{alertCount} ACTIVE ALERT{alertCount > 1 ? 'S' : ''}</span>
          </div>
        )}
      </div>

      {/* Pipeline */}
      <div className="overflow-x-auto pb-2">
        <div className="flex items-start gap-0 min-w-max">
          {agents.map((agent, i) => (
            <div key={agent.id} className="flex items-start">
              <AgentNode
                agent={agent}
                selected={selectedAgentId === agent.id}
                onClick={() => setSelectedAgentId(selectedAgentId === agent.id ? null : agent.id)}
              />
              {i < agents.length - 1 && (
                <FlowLine active={agent.status === 'completed' || agent.status === 'passing'} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Agent detail */}
      <AnimatePresence>
        {selectedAgent && (
          <motion.div key={selectedAgent.id} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="border-t border-white/5 pt-4">
            <DetailPanel agent={selectedAgent} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Final decision */}
      <div className="border-t border-white/5 pt-4">
        <FinalDecisionCard verdict={verdict} />
      </div>
    </GlassCard>
  )
}
