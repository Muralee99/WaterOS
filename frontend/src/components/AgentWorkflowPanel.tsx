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

  maharashtra: {
    agents: [
      { id: 'sensor', name: 'Sensor Agent', stage: 'collection', status: 'completed', statusLabel: 'DATA READY', summary: '4,200 sensors — reservoir near overflow, 284 pipeline leak zones', confidence: 94, elapsed: '1.4s',
        dataSources: [
          { name: 'Tansa–Vaitarna Level Sensor', type: 'sensor', freshness: '2 min ago', quality: 98, detail: '91.1% fill — overflow risk HIGH within 48h' },
          { name: 'Mumbai Pipeline Pressure Network (284 zones)', type: 'sensor', freshness: '5 min ago', quality: 91, detail: '3 trunk main anomalies — Dharavi sector 4.1→2.8 bar drop' },
          { name: 'WQI Sensors — Bhandup WTP', type: 'sensor', freshness: '3 min ago', quality: 96, detail: 'pH 7.4, turbidity 1.8 NTU — within WHO limits' },
          { name: 'IMD Maharashtra Weather (280 stations)', type: 'sensor', freshness: '30 min ago', quality: 93, detail: '245mm 5-day accumulation — heavy rain active' },
        ],
        rules: [
          { condition: 'Reservoir fill > 90%', trigger: '91.1%', action: 'Overflow alert — notify BMC, increase outflow rate', priority: 'high' },
          { condition: 'Pressure drop > 1 bar in trunk main', trigger: '1.3 bar drop in Dharavi', action: 'ALERT: suspect trunk main fracture — dispatch repair crew', priority: 'critical' },
        ],
        steps: [
          { n: 1, action: 'Poll Tansa–Vaitarna reservoir sensor', finding: '91.1% fill. Inflow 24 m³/s, outflow 18 m³/s. Net: +6 m³/s — rising', alert: true },
          { n: 2, action: 'Scan 284 pipeline pressure zones', finding: '3 critical drops: Dharavi -1.3bar, Sion -0.9bar, Kurla -1.1bar — trunk fracture risk HIGH', alert: true },
          { n: 3, action: 'Sample WTP water quality readings', finding: 'pH 7.4, turbidity 1.8 NTU — SAFE. 3,800 MLD treatment capacity at 97%' },
          { n: 4, action: 'Process weather station array', finding: '245mm 5-day total. 78% storm probability. Reservoir rising expected to continue 72h' },
        ],
        metrics: [
          { name: 'Reservoir Fill', value: '91.1%', threshold: '< 85%', ok: false },
          { name: 'Leak Zones', value: '284', threshold: '< 50', ok: false },
          { name: 'WQI Score', value: '92', threshold: '> 80', ok: true },
          { name: 'Pipeline Uptime', value: '98.1%', threshold: '> 95%', ok: true },
        ],
        issueFound: true, severity: 'high', issueSummary: 'Reservoir 91.1% — overflow risk. 3 trunk main fractures losing 680 MLD daily.',
        dispatches: [
          { target: 'Infrastructure Agent', targetType: 'agent', urgency: 'critical', message: 'Trunk fractures: Dharavi (-1.3bar), Sion (-0.9bar), Kurla (-1.1bar) — dispatch repair teams', channel: 'agent-bus' },
          { target: 'Climate Agent', targetType: 'agent', urgency: 'high', message: 'Reservoir 91.1%, storm_prob=78%, 5d_rainfall=245mm — overflow risk assessment needed', channel: 'agent-bus' },
        ],
      },
      { id: 'infrastructure', name: 'Infrastructure Agent', stage: 'analysis', status: 'alert', statusLabel: 'LEAKS DETECTED', summary: '284 leak zones — 3 critical trunk fractures, 680 MLD daily water loss', confidence: 88, elapsed: '2.8s',
        dataSources: [
          { name: 'Sensor Agent — pressure network data', type: 'api', freshness: '0 sec', quality: 94, detail: '284 pressure anomalies — 3 critical zones' },
          { name: 'MCGM pipe asset database', type: 'db', freshness: '6 months ago', quality: 82, detail: 'Average pipe age: 32 years. Material: CI/DI mix. 1,840km network' },
          { name: 'Acoustic leak correlation sensors', type: 'sensor', freshness: '10 min ago', quality: 88, detail: '3 confirmed acoustic signatures in Dharavi sector' },
        ],
        rules: [
          { condition: 'Pressure drop > 1 bar AND acoustic confirmation', trigger: 'Dharavi: -1.3bar + 3 acoustic matches', action: 'CRITICAL: Dispatch repair crew + isolate segment if pressure < 1.5 bar', priority: 'critical' },
          { condition: 'Daily loss > 500 MLD', trigger: '680 MLD estimated loss', action: 'Escalate to BMC Water Dept — financial + environmental emergency', priority: 'high' },
        ],
        steps: [
          { n: 1, action: 'Localize leak zones from pressure differential analysis', finding: '3 critical: Dharavi 6.2L/s, Sion 4.8L/s, Kurla 5.1L/s — total 16.1L/s = 1,391 m³/h', alert: true },
          { n: 2, action: 'Cross-validate with acoustic sensor signatures', finding: 'Dharavi confirmed at 3 sensors. Sion 2 sensors. Kurla 1 sensor (possible)' },
          { n: 3, action: 'Estimate daily water loss and economic impact', finding: '680 MLD lost daily = ₹18 crore/day at Mumbai water tariff' },
          { n: 4, action: 'Check repair crew availability and dispatch', finding: '2 emergency crews available. ETA: Dharavi 45 min, Sion 90 min' },
        ],
        metrics: [
          { name: 'Critical Leaks', value: '3', threshold: '0', ok: false },
          { name: 'Daily Loss', value: '680 MLD', threshold: '< 100 MLD', ok: false },
          { name: 'Financial Loss', value: '₹18Cr/day', threshold: '—', ok: false },
        ],
        issueFound: true, severity: 'critical', issueSummary: '3 trunk main fractures losing 680 MLD daily. ₹18 crore economic loss per day.',
        dispatches: [
          { target: 'BMC Water Department', targetType: 'dept', urgency: 'critical', message: 'CRITICAL: 3 trunk main fractures. Dharavi (16.1L/s), Sion, Kurla. Dispatching 2 crews. Estimated 680 MLD daily loss.', channel: 'Emergency Portal + Phone' },
          { target: 'Decision Agent', targetType: 'agent', urgency: 'high', message: 'leaks_count=3, daily_loss=680MLD, zones=[Dharavi,Sion,Kurla], crews_dispatched=2', channel: 'agent-bus' },
        ],
      },
      { id: 'reservoir', name: 'Reservoir Agent', stage: 'analysis', status: 'alert', statusLabel: 'OVERFLOW RISK', summary: 'Tansa–Vaitarna 91.1% — controlled release required within 24h', confidence: 92, elapsed: '1.9s',
        dataSources: [
          { name: 'Sensor Agent — Tansa fill level', type: 'api', freshness: '0 sec', quality: 98, detail: '91.1% fill, inflow 24 m³/s, outflow 18 m³/s' },
          { name: 'Historical spillway records', type: 'db', freshness: 'static', quality: 95, detail: 'Maximum safe level 93% — last spillway event 2019' },
        ],
        rules: [
          { condition: 'Reservoir fill > 90% AND inflow > outflow', trigger: '91.1% + net +6m³/s', action: 'Controlled release — increase outflow to 36 m³/s to hold at 90%', priority: 'high' },
          { condition: 'Fill > 95%', trigger: 'Projected in 8h at current rate', action: 'Emergency spillway activation — alert downstream MCGM zones', priority: 'critical' },
        ],
        steps: [
          { n: 1, action: 'Calculate time to 95% overflow threshold', finding: 'Net fill rate +6 m³/s. At 153 MCM capacity, 4% = 6.12 MCM. Time to overflow: ~12 hours', alert: true },
          { n: 2, action: 'Compute safe controlled release rate', finding: 'Recommend outflow 36 m³/s (2× current) to stop rise and stabilise at 89–90%' },
          { n: 3, action: 'Assess downstream capacity for release', finding: 'Ulhas River can absorb 40 m³/s without flooding. Release safe at 36 m³/s' },
        ],
        metrics: [
          { name: 'Fill Level', value: '91.1%', threshold: '< 85%', ok: false },
          { name: 'Time to Overflow', value: '~12h', threshold: 'N/A', ok: false },
          { name: 'Recommended Outflow', value: '36 m³/s', threshold: '—', ok: true },
        ],
        issueFound: true, severity: 'high', issueSummary: 'Reservoir overflow in ~12 hours at current fill rate. Controlled release to 36 m³/s required immediately.',
        dispatches: [
          { target: 'Decision Agent', targetType: 'agent', urgency: 'high', message: 'reservoir=91.1%, overflow_eta=12h, safe_release=36m3s, downstream_safe=yes', channel: 'agent-bus' },
          { target: 'BMC Operations', targetType: 'dept', urgency: 'high', message: 'IMMEDIATE: Increase Tansa outflow to 36 m³/s. Current 18 m³/s causing overflow risk in 12 hours.', channel: 'Control Room' },
        ],
      },
      { id: 'decision', name: 'Decision Agent', stage: 'decision', status: 'alert', statusLabel: 'ACTION REQUIRED', summary: 'DUAL CRISIS: reservoir overflow + trunk leaks — coordinated response', confidence: 91, elapsed: '1.6s',
        dataSources: [
          { name: 'Sensor Agent', type: 'api', freshness: '0 sec', quality: 94, detail: 'Reservoir 91.1%, 3 leak zones, WQI 92' },
          { name: 'Infrastructure Agent', type: 'api', freshness: '0 sec', quality: 88, detail: '680 MLD loss, 3 trunk fractures' },
          { name: 'Reservoir Agent', type: 'api', freshness: '0 sec', quality: 92, detail: 'Overflow 12h, release 36 m³/s' },
        ],
        rules: [
          { condition: 'Simultaneous overflow + leak crisis', trigger: 'Both HIGH severity agents', action: 'Dual-track response: reservoir release + leak repair simultaneously', priority: 'high' },
        ],
        steps: [
          { n: 1, action: 'Synthesise reservoir and infrastructure inputs', finding: 'Two parallel HIGH crises — overflow and trunk fractures. Independent response tracks possible' },
          { n: 2, action: 'Check if leak repair affects water supply during reservoir release', finding: 'Segment isolation needed for Dharavi repair — 40,000 residents on 6h supply disruption' },
          { n: 3, action: 'Generate coordinated action plan', finding: 'Track A: reservoir release 36 m³/s NOW. Track B: Dharavi repair with 6h advance notice to residents' },
        ],
        metrics: [
          { name: 'Crisis Count', value: '2 concurrent', threshold: '0', ok: false },
          { name: 'Response Tracks', value: '2 parallel', threshold: '—', ok: true },
        ],
        issueFound: true, severity: 'high', issueSummary: 'Dual crisis: reservoir overflow + pipeline fractures. Parallel response activated.',
        dispatches: [
          { target: 'BMC Water Department', targetType: 'dept', urgency: 'high', message: 'Track A: Increase Tansa outflow to 36 m³/s immediately. Track B: Isolate Dharavi trunk main — notify 40K residents of 6h supply disruption.', channel: 'Emergency Portal + Control Room' },
          { target: 'Citizens (Dharavi area)', targetType: 'public', urgency: 'medium', message: 'Water supply disruption for 6 hours from 2 PM for emergency pipeline repair. Store water. Supply restored by 8 PM.', channel: 'SMS + MCGM App' },
          { target: 'Irrigation / MCGM Repair Teams', targetType: 'emergency', urgency: 'critical', message: 'DISPATCH NOW: 2 crews to Dharavi trunk main fracture. GPS coordinates transmitted. Estimated repair 4–6 hours.', channel: 'Field Operations Radio' },
        ],
      },
    ],
    verdict: {
      severity: 'high', title: 'DUAL CRISIS — Maharashtra / Mumbai',
      summary: 'Tansa–Vaitarna reservoir at 91.1% — overflow in 12 hours without intervention. Simultaneously, 3 trunk main fractures in Mumbai losing 680 MLD daily (₹18 crore/day). Parallel response tracks activated.',
      agentsInput: ['Sensor Agent', 'Infrastructure Agent', 'Reservoir Agent'],
      precautions: [
        'IMMEDIATE: Increase Tansa reservoir outflow to 36 m³/s — stabilise at 89%',
        'Dispatch 2 emergency repair crews to Dharavi, Sion, Kurla trunk fractures',
        'Notify 40,000 Dharavi residents of 6-hour planned supply disruption',
        'Citizens: store water — emergency repair disruption 2 PM to 8 PM',
        'BMC: activate Stage 1 water conservation advisory — demand-side reduction 15%',
      ],
      dispatches: [
        { target: 'BMC Water Operations', icon: 'building', urgency: 'HIGH', message: 'Increase Tansa outflow 18→36 m³/s. Overflow in 12h if unchanged.' },
        { target: 'MCGM Repair Crews', icon: 'emergency', urgency: 'CRITICAL', message: 'Deploy to 3 trunk fractures: Dharavi, Sion, Kurla. Estimated 680 MLD daily loss.' },
        { target: 'Dharavi Residents (40K)', icon: 'public', urgency: 'MEDIUM', message: 'Supply disruption 2 PM–8 PM for emergency pipe repair. Store water.' },
        { target: 'Maharashtra Farmers', icon: 'farmer', urgency: 'LOW', message: 'Heavy rainfall expected 72h. Avoid field irrigation — rain will be sufficient. Protect low-lying crops.' },
      ],
    },
  },

  odisha: {
    agents: [
      { id: 'sensor', name: 'Sensor Agent', stage: 'collection', status: 'completed', statusLabel: 'DATA READY', summary: '1,600 sensors — Hirakud at 91.2%, 8 river gauges above warning level', confidence: 96, elapsed: '1.1s',
        dataSources: [
          { name: 'Hirakud Reservoir Level (OWS)', type: 'sensor', freshness: '1 min ago', quality: 99, detail: 'Fill 91.2% (7,420 MCM / 8,136 MCM). Inflow 480 m³/s, outflow 320 m³/s' },
          { name: 'Mahanadi River Gauge Network (8 stations)', type: 'sensor', freshness: '5 min ago', quality: 95, detail: 'Cuttack station: 6.8m vs 6.2m warning level' },
          { name: 'IMD Odisha Weather Network (190 stations)', type: 'sensor', freshness: '30 min ago', quality: 91, detail: '185mm 3-day accumulation — monsoon trough active' },
        ],
        rules: [
          { condition: 'Reservoir fill > 90% AND inflow > outflow', trigger: '91.2%, net +160 m³/s', action: 'OVERFLOW ALERT — escalate to ReservoirAgent and DecisionAgent', priority: 'high' },
          { condition: 'River gauge > warning level', trigger: 'Cuttack 6.8m > 6.2m', action: 'Issue downstream flood watch — alert coastal districts', priority: 'high' },
        ],
        steps: [
          { n: 1, action: 'Query Hirakud reservoir level — OWS telemetry', finding: '91.2% fill. Net inflow +160 m³/s. Time to full: ~6 hours at current rate', alert: true },
          { n: 2, action: 'Poll 8 Mahanadi river gauge stations', finding: 'Cuttack: 6.8m (warning 6.2m). Naraj: 7.1m. All 8 stations above seasonal average' },
          { n: 3, action: 'Aggregate IMD weather data', finding: '185mm 3-day total. Heavy rainfall belt active over Chhattisgarh catchment → increasing inflow' },
        ],
        metrics: [
          { name: 'Hirakud Fill', value: '91.2%', threshold: '< 85%', ok: false },
          { name: 'Cuttack Level', value: '6.8m', threshold: '< 6.2m', ok: false },
          { name: '3-Day Rainfall', value: '185mm', threshold: '< 100mm', ok: false },
        ],
        issueFound: true, severity: 'high', issueSummary: 'Hirakud 91.2% — full in 6h. Mahanadi above warning at Cuttack and Naraj.',
        dispatches: [
          { target: 'Reservoir Agent', targetType: 'agent', urgency: 'high', message: 'hirakud=91.2%, inflow=480m3s, outflow=320m3s, time_to_full=6h', channel: 'agent-bus' },
          { target: 'Decision Agent', targetType: 'agent', urgency: 'high', message: 'flood_watch: cuttack=6.8m, naraj=7.1m, rainfall_3d=185mm, catchment_active=true', channel: 'agent-bus' },
        ],
      },
      { id: 'reservoir', name: 'Reservoir Agent', stage: 'analysis', status: 'alert', statusLabel: 'CONTROLLED RELEASE', summary: 'Emergency controlled release 320→580 m³/s — downstream alert required', confidence: 93, elapsed: '2.2s',
        dataSources: [
          { name: 'Sensor Agent — Hirakud fill data', type: 'api', freshness: '0 sec', quality: 96, detail: '91.2%, time_to_full 6h' },
          { name: 'Hirakud Dam Operation Manual', type: 'db', freshness: 'static', quality: 100, detail: 'Gate operation protocol: max 580 m³/s, open 4 spillways sequentially' },
          { name: 'HEC-RAS downstream flood routing model', type: 'model', freshness: 'static', quality: 88, detail: '580 m³/s release — Cuttack +0.6m rise in 4 hours' },
        ],
        rules: [
          { condition: 'Fill > 90% AND time_to_full < 8h', trigger: '91.2%, 6h to full', action: 'Emergency controlled release — increase outflow to 580 m³/s, open 4 spillways', priority: 'critical' },
          { condition: 'Downstream level > danger level', trigger: 'Cuttack approaching 7.5m danger', action: 'Alert: downstream communities — release will add 0.6m to current level', priority: 'high' },
        ],
        steps: [
          { n: 1, action: 'Assess spillway capacity and gate configuration', finding: '4 spillway gates available. Max combined release: 580 m³/s. Current: 320 m³/s' },
          { n: 2, action: 'Model downstream impact of 580 m³/s release', finding: 'Cuttack: 6.8 + 0.6 = 7.4m — below 7.5m danger level. Acceptable.', alert: true },
          { n: 3, action: 'Recommend controlled release protocol', finding: 'Open gates sequentially over 2 hours: 320→400→480→580 m³/s. Alert issued 4h before' },
        ],
        metrics: [
          { name: 'Current Outflow', value: '320 m³/s', threshold: '—', ok: true },
          { name: 'Required Outflow', value: '580 m³/s', threshold: '—', ok: false },
          { name: 'Cuttack Impact', value: '+0.6m', threshold: '< 0.7m danger', ok: true },
        ],
        issueFound: true, severity: 'high', issueSummary: 'Controlled release 320→580 m³/s recommended. Cuttack will reach 7.4m — below 7.5m danger level.',
        dispatches: [
          { target: 'Decision Agent', targetType: 'agent', urgency: 'high', message: 'release_plan: 320→580m3s over 2h, cuttack_impact=+0.6m, max_level=7.4m, below_danger=true', channel: 'agent-bus' },
          { target: 'Irrigation Dept (Odisha)', targetType: 'dept', urgency: 'high', message: 'OPEN SPILLWAYS: Hirakud controlled release 580 m³/s from 14:00 IST. Open gates G1→G4 over 2 hours.', channel: 'Dam Control Room' },
        ],
      },
      { id: 'decision', name: 'Decision Agent', stage: 'decision', status: 'alert', statusLabel: 'RELEASE APPROVED', summary: 'Controlled release approved — downstream alert issued to 3 coastal districts', confidence: 94, elapsed: '1.4s',
        dataSources: [
          { name: 'Sensor Agent', type: 'api', freshness: '0 sec', quality: 96, detail: 'Hirakud 91.2%, Cuttack 6.8m' },
          { name: 'Reservoir Agent', type: 'api', freshness: '0 sec', quality: 93, detail: '580 m³/s release, 7.4m Cuttack peak' },
        ],
        rules: [
          { condition: 'Controlled release does not exceed danger level downstream', trigger: '7.4m < 7.5m danger', action: 'APPROVE release — issue downstream alert and evacuation advisory for low-lying areas', priority: 'high' },
        ],
        steps: [
          { n: 1, action: 'Verify downstream impact within safe limits', finding: 'Cuttack peak 7.4m < 7.5m danger level — release approved with advisory' },
          { n: 2, action: 'Identify low-lying villages at risk', finding: '18 villages within 2km of Mahanadi floodplain, 8,400 residents — evacuation advisory' },
          { n: 3, action: 'Issue multi-channel alert', finding: 'Alert dispatched to Cuttack, Puri, Khordha DMs and Emergency Services' },
        ],
        metrics: [
          { name: 'Release Decision', value: 'APPROVED', threshold: '—', ok: true },
          { name: 'Villages at Risk', value: '18', threshold: '0', ok: false },
          { name: 'Residents Advisory', value: '8,400', threshold: '—', ok: false },
        ],
        issueFound: true, severity: 'high', issueSummary: 'Controlled release approved. 18 villages (8,400 residents) on evacuation advisory for low-lying areas.',
        dispatches: [
          { target: 'Irrigation Dept', targetType: 'dept', urgency: 'high', message: 'PROCEED with controlled Hirakud release 580 m³/s starting 14:00 IST. Open G1→G4 over 2 hours.', channel: 'Dam Control Room' },
          { target: 'Emergency Services (ODRAF)', targetType: 'emergency', urgency: 'high', message: 'Pre-position ODRAF rescue teams at Cuttack, Puri, Khordha. River will rise to 7.4m by ~18:00 IST.', channel: 'ODRAF Command' },
          { target: '18 Riverbank Villages', targetType: 'public', urgency: 'high', message: 'RIVER RISING: Mahanadi will rise to 7.4m by 6 PM due to Hirakud controlled release. Move to higher ground now.', channel: 'SMS + Village PA System' },
          { target: 'Fishermen (Mahanadi Delta)', targetType: 'fisherman', urgency: 'high', message: 'Dam release in progress — avoid river and coastal areas until 10 PM. Strong currents expected.', channel: 'Fisheries Dept + Radio' },
        ],
      },
    ],
    verdict: {
      severity: 'high', title: 'CONTROLLED RELEASE — Hirakud / Odisha',
      summary: 'Hirakud reservoir at 91.2% — overflow in 6 hours without intervention. Controlled release of 580 m³/s approved after confirming Cuttack downstream peak (7.4m) remains below 7.5m danger level. 18 villages on evacuation advisory.',
      agentsInput: ['Sensor Agent', 'Reservoir Agent'],
      precautions: [
        'Hirakud: controlled release 320→580 m³/s, gates G1–G4, starting 14:00 IST',
        '18 Mahanadi floodplain villages — move to high ground by 15:00 IST',
        'ODRAF: pre-position rescue teams at Cuttack, Puri, Khordha',
        'Fishermen: no river or coastal activity 14:00–22:00 IST',
        'Monitor Cuttack gauge every 30 minutes — halt release if approaching 7.4m',
      ],
      dispatches: [
        { target: 'Irrigation Dept', icon: 'building', urgency: 'HIGH', message: 'Open Hirakud gates G1–G4 to achieve 580 m³/s outflow by 16:00 IST.' },
        { target: 'ODRAF / Emergency', icon: 'emergency', urgency: 'HIGH', message: 'Pre-position rescue teams at 3 districts. River rising to 7.4m by 18:00 IST.' },
        { target: '18 Villages (8,400 people)', icon: 'public', urgency: 'HIGH', message: 'Evacuate low-lying areas now — Mahanadi rising due to dam release, peak 7.4m at 18:00 IST.' },
        { target: 'Fishermen (Delta)', icon: 'fisherman', urgency: 'HIGH', message: 'No river activity 14:00–22:00. Strong currents from controlled dam release.' },
      ],
    },
  },

  'west-bengal': {
    agents: [
      { id: 'satellite', name: 'Satellite Agent', stage: 'collection', status: 'alert', statusLabel: 'CYCLONE TRACKED', summary: 'Deep depression tracking NW — 72h landfall probability 68% near Digha', confidence: 91, elapsed: '4.2s',
        dataSources: [
          { name: 'INSAT-3DR Thermal/Visible (ISRO)', type: 'satellite', freshness: '45 min ago', quality: 96, detail: 'Deep depression 14.8°N 88.4°E, MSLP 989 hPa, moving NW at 16 km/h' },
          { name: 'NOAA GOES-18 Wind Shear Analysis', type: 'satellite', freshness: '1 hr ago', quality: 88, detail: 'Low wind shear 5–8 m/s — favourable for intensification' },
          { name: 'Sentinel-1 SAR Ocean Surface', type: 'satellite', freshness: '6 hr ago', quality: 84, detail: 'Wave heights 2.8–3.4m in deep Bay of Bengal sector' },
        ],
        rules: [
          { condition: 'Landfall probability > 60% AND system within 500km', trigger: '68% landfall, 320km from Digha', action: 'CYCLONE WARNING — escalate to ClimateAgent and DecisionAgent. Fishermen ban immediate.', priority: 'critical' },
        ],
        steps: [
          { n: 1, action: 'Track INSAT-3DR deep depression position and movement', finding: '14.8°N 88.4°E, speed 16 km/h NW. ETA Digha coast: 56–62 hours', alert: true },
          { n: 2, action: 'Analyse wind shear environment for intensification', finding: 'Low shear 5–8 m/s + SST 29.8°C — likely intensification to cyclonic storm in 24h' },
          { n: 3, action: 'Compute landfall probability distribution', finding: '68% landfall near Digha–Sagar Island corridor. 22% Odisha border. 10% dissipation' },
          { n: 4, action: 'Estimate surge height at Digha coast', finding: 'Expected storm surge 1.2–1.8m above high tide — inundation 2–4km inland' },
        ],
        metrics: [
          { name: 'Landfall Probability', value: '68%', threshold: '< 30%', ok: false },
          { name: 'ETA to Coast', value: '56–62h', threshold: 'N/A', ok: false },
          { name: 'Wind Shear', value: '5–8 m/s', threshold: '> 15 m/s', ok: false },
          { name: 'Surge Height', value: '1.2–1.8m', threshold: '< 0.5m', ok: false },
        ],
        issueFound: true, severity: 'critical', issueSummary: 'Deep depression → cyclone intensification likely. 68% landfall near Digha in 56–62 hours. Storm surge 1.2–1.8m.',
        dispatches: [
          { target: 'Climate Agent', targetType: 'agent', urgency: 'critical', message: 'cyclone_track: 14.8N 88.4E, landfall_prob=68%, eta_hours=58, surge_m=1.5, intensification=likely', channel: 'agent-bus' },
          { target: 'Decision Agent', targetType: 'agent', urgency: 'critical', message: 'CYCLONE WARNING: WB coast 56-62h. Surge 1.2-1.8m. Fishermen ban immediate.', channel: 'agent-bus' },
        ],
      },
      { id: 'climate', name: 'Climate Agent', stage: 'analysis', status: 'alert', statusLabel: 'STORM CRITICAL', summary: 'Cyclone intensification confirmed — 120km/h winds expected at landfall', confidence: 87, elapsed: '3.1s',
        dataSources: [
          { name: 'Satellite Agent — cyclone track', type: 'api', freshness: '0 sec', quality: 91, detail: '14.8°N 88.4°E, 68% landfall, ETA 58h' },
          { name: 'ECMWF ensemble forecast (51 members)', type: 'model', freshness: '6 hr ago', quality: 89, detail: '43/51 members agree on West Bengal landfall. Peak winds 100–130 km/h' },
          { name: 'IMD Cyclone warning bulletin', type: 'api', freshness: '2 hr ago', quality: 95, detail: 'Yellow alert upgraded to Orange. 3-day accumulated rain forecast 340mm' },
        ],
        rules: [
          { condition: 'Landfall probability > 60% AND ECMWF ensemble agreement > 80%', trigger: '68% AND 43/51 members', action: 'CYCLONE EMERGENCY — coastal evacuation advisory. Mass alert all departments.', priority: 'critical' },
        ],
        steps: [
          { n: 1, action: 'Synthesise satellite track with ECMWF ensemble', finding: 'Consensus: landfall 68–72h near Digha at 100–130 km/h sustained winds' },
          { n: 2, action: 'Compute 3-day rainfall forecast for landfall zone', finding: '340mm expected in 72h over coastal West Bengal — severe flooding inland' },
          { n: 3, action: 'Assess infrastructure vulnerability (low-lying coastal areas)', finding: '180,000 residents within 5km of coast in Purba Medinipur — evacuation required' },
        ],
        metrics: [
          { name: 'Peak Winds', value: '120 km/h', threshold: '< 60 km/h', ok: false },
          { name: '3-Day Rain', value: '340mm', threshold: '< 100mm', ok: false },
          { name: 'Coastal Residents', value: '180K at risk', threshold: '—', ok: false },
        ],
        issueFound: true, severity: 'critical', issueSummary: 'Cyclone landfall confirmed 68h. 120 km/h winds. 340mm rain. 180K coastal residents at risk.',
        dispatches: [
          { target: 'Decision Agent', targetType: 'agent', urgency: 'critical', message: 'CYCLONE EMERGENCY: landfall_72h, winds=120kmh, rain_3d=340mm, coast_pop=180K, surge=1.5m', channel: 'agent-bus' },
          { target: 'Fishermen (Bay of Bengal)', targetType: 'fisherman', urgency: 'critical', message: 'CYCLONE WARNING — RETURN TO PORT IMMEDIATELY. All vessels within 500km of coast must dock. System will be cyclonic storm within 24 hours.', channel: 'Coast Guard VHF Ch 16 + SMS' },
        ],
      },
      { id: 'decision', name: 'Decision Agent', stage: 'decision', status: 'alert', statusLabel: 'CYCLONE EMERGENCY', summary: 'CYCLONE EMERGENCY declared — 180K coastal evacuation, NDRF deployment', confidence: 93, elapsed: '1.8s',
        dataSources: [
          { name: 'Satellite Agent', type: 'api', freshness: '0 sec', quality: 91, detail: '68% landfall, 1.5m surge' },
          { name: 'Climate Agent', type: 'api', freshness: '0 sec', quality: 87, detail: '120 km/h winds, 340mm rain, 180K at risk' },
        ],
        rules: [
          { condition: 'Cyclone landfall > 60% AND winds > 100 km/h', trigger: '68% AND 120 km/h', action: 'DECLARE CYCLONE EMERGENCY — mandatory coastal evacuation, NDRF full deployment', priority: 'critical' },
        ],
        steps: [
          { n: 1, action: 'Synthesise cyclone intelligence from 2 agents', finding: 'CYCLONE EMERGENCY — 68% landfall, 120 km/h, 180K at risk. Full emergency activation' },
          { n: 2, action: 'Compute evacuation scope and timeline', finding: '180,000 residents — 35 evacuation centres, 48h pre-landfall window available' },
          { n: 3, action: 'Deploy response assets', finding: 'NDRF 8 teams, SDRF 12 teams, 240 boats, 18 helipads activated' },
        ],
        metrics: [
          { name: 'Emergency Level', value: 'CYCLONE', threshold: '—', ok: false },
          { name: 'Evacuation Target', value: '180,000', threshold: '—', ok: false },
          { name: 'Evacuation Window', value: '48 hours', threshold: '> 24h', ok: true },
        ],
        issueFound: true, severity: 'critical', issueSummary: 'CYCLONE EMERGENCY — 180K mandatory evacuation, 120 km/h winds, 340mm rain, 1.5m storm surge.',
        dispatches: [
          { target: 'WB State Government', targetType: 'dept', urgency: 'critical', message: 'DECLARE CYCLONE EMERGENCY. Mandatory evacuation Purba Medinipur coastal belt — 180,000 residents. Open 35 cyclone shelters.', channel: 'CM Office + Cabinet' },
          { target: 'NDRF / SDRF', targetType: 'emergency', urgency: 'critical', message: 'Deploy 8 NDRF + 12 SDRF teams immediately. Pre-position at Digha, Contai, Haldia. 240 rescue boats + 18 helipads.', channel: 'NDRF Command Portal' },
          { target: 'Coastal Citizens (180K)', targetType: 'public', urgency: 'critical', message: 'CYCLONE WARNING: Move to nearest shelter IMMEDIATELY. System making landfall in 48–60 hours with 120 km/h winds + 1.5m storm surge.', channel: 'SMS + DD Bangla + Loudspeakers' },
          { target: 'Fishermen (All)', targetType: 'fisherman', urgency: 'critical', message: 'ALL BOATS RETURN TO PORT — cyclone landfall in 60 hours. No fishing in Bay of Bengal for 7 days.', channel: 'Coast Guard + Fisheries Radio' },
          { target: 'Farmers (Coastal Bengal)', targetType: 'farmer', urgency: 'high', message: '340mm rain expected. Harvest standing crops immediately. Move stored grain above flood level. Protect poultry and livestock.', channel: 'ATMA Krishi + DD Bangla' },
        ],
      },
    ],
    verdict: {
      severity: 'critical', title: 'CYCLONE EMERGENCY — West Bengal',
      summary: 'Deep depression in Bay of Bengal intensifying to cyclonic storm — 68% landfall probability near Digha in 56–62 hours. Peak winds 120 km/h, storm surge 1.2–1.8m, 340mm rainfall over 72 hours. 180,000 coastal residents require mandatory evacuation.',
      agentsInput: ['Satellite Agent', 'Climate Agent'],
      precautions: [
        'MANDATORY EVACUATION: 180,000 Purba Medinipur coastal residents — move to 35 cyclone shelters within 48 hours',
        'ALL FISHERMEN: Return to port immediately — no Bay of Bengal access for 7 days',
        'NDRF + SDRF: Pre-position 8+12 teams with 240 rescue boats at Digha, Contai, Haldia',
        'Farmers: harvest standing crops NOW — 340mm rain will flatten and waterlog fields',
        'State Government: declare Cyclone Emergency, activate SEOC, coordinate Army/Navy standby',
      ],
      dispatches: [
        { target: 'WB State Government', icon: 'dept', urgency: 'CRITICAL', message: 'Declare Cyclone Emergency. Mandatory evacuation Purba Medinipur. Open 35 shelters.' },
        { target: 'NDRF / SDRF / Navy', icon: 'emergency', urgency: 'CRITICAL', message: 'Deploy 20 teams + 240 boats to coast. Cyclone landfall 60h at 120 km/h.' },
        { target: 'Coastal Citizens (180K)', icon: 'public', urgency: 'CRITICAL', message: 'Evacuate NOW — cyclone landfall 48–60h. Storm surge 1.5m, winds 120 km/h.' },
        { target: 'All Fishermen', icon: 'fisherman', urgency: 'CRITICAL', message: 'ALL VESSELS RETURN PORT — cyclone in 60h. 7-day Bay of Bengal closure.' },
        { target: 'Coastal Farmers', icon: 'farmer', urgency: 'HIGH', message: 'Harvest immediately. 340mm rain in 72h will destroy standing crops.' },
      ],
    },
  },

  california: {
    agents: [
      { id: 'sensor', name: 'Sensor Agent', stage: 'collection', status: 'completed', statusLabel: 'DATA READY', summary: '8,400 sensors — Shasta Lake 54.1%, drought D3 conditions statewide', confidence: 93, elapsed: '1.6s',
        dataSources: [
          { name: 'CA DWR Shasta Lake Level', type: 'sensor', freshness: '15 min ago', quality: 98, detail: '54.1% capacity — 37.4% below historical average for date' },
          { name: 'CDFA Groundwater Well Network (12K wells)', type: 'sensor', freshness: '1 hr ago', quality: 90, detail: 'San Joaquin Valley average depth: 28m — record low' },
          { name: 'CA Aqueduct Flow Sensors', type: 'sensor', freshness: '5 min ago', quality: 96, detail: 'Delivery: 3,200 ML/day — 62% of contracted entitlement' },
        ],
        rules: [
          { condition: 'Major reservoir < 60% AND groundwater record low', trigger: 'Shasta 54%, SJV 28m', action: 'DROUGHT D3 — mandatory conservation, agriculture curtailments', priority: 'critical' },
        ],
        steps: [
          { n: 1, action: 'Poll major reservoir levels: Shasta, Oroville, Folsom', finding: 'Shasta 54.1%, Oroville 48.6%, Folsom 61.3%. All below average', alert: true },
          { n: 2, action: 'Query groundwater network — San Joaquin Valley', finding: '28m average depth — 4.2m below 10-year average. Subsidence active in 6 counties' },
          { n: 3, action: 'Check aqueduct delivery vs contracted entitlement', finding: '3,200 ML/day delivered = 62% of entitlement. Agriculture at 38% contracted amount' },
        ],
        metrics: [
          { name: 'Shasta Level', value: '54.1%', threshold: '> 70%', ok: false },
          { name: 'Groundwater Depth', value: '28m', threshold: '< 22m', ok: false },
          { name: 'Aqueduct Delivery', value: '62%', threshold: '> 90%', ok: false },
        ],
        issueFound: true, severity: 'critical', issueSummary: 'Drought D3 statewide. Shasta 54.1%, groundwater record 28m, aqueduct delivery at 62%.',
        dispatches: [
          { target: 'Decision Agent', targetType: 'agent', urgency: 'critical', message: 'drought_D3: shasta=54%, oroville=48.6%, gw_depth=28m, delivery=62%, curtailment_active=true', channel: 'agent-bus' },
        ],
      },
      { id: 'decision', name: 'Decision Agent', stage: 'decision', status: 'alert', statusLabel: 'DROUGHT EMERGENCY', summary: 'Stage 2 mandatory restrictions. Agriculture priority curtailments activated.', confidence: 90, elapsed: '1.9s',
        dataSources: [{ name: 'Sensor Agent — drought data', type: 'api', freshness: '0 sec', quality: 93, detail: 'D3 drought, Shasta 54%, delivery 62%' }],
        rules: [{ condition: 'USGS drought D3 AND major reservoir < 55%', trigger: 'D3 + Shasta 54.1%', action: 'Mandatory Stage 2 restrictions + agriculture curtailments', priority: 'critical' }],
        steps: [
          { n: 1, action: 'Classify drought severity per USGS/CDWR', finding: 'D3 Extreme Drought — 41% of state area. 12 counties in D4 Exceptional' },
          { n: 2, action: 'Generate water use curtailment plan', finding: 'Agriculture: 38% curtailment (junior water rights first). Urban: Stage 2 = 20% mandatory reduction' },
          { n: 3, action: 'Activate conservation and recycled water programs', finding: '420 MLD recycled water capacity available — expand to 680 MLD by Q4' },
        ],
        metrics: [
          { name: 'Drought Class', value: 'D3 Extreme', threshold: '< D2', ok: false },
          { name: 'Urban Reduction', value: '20% mandatory', threshold: '—', ok: false },
          { name: 'Ag Curtailment', value: '38%', threshold: '—', ok: false },
        ],
        issueFound: true, severity: 'critical', issueSummary: 'D3 Extreme Drought — Stage 2 mandatory 20% urban reduction, 38% agriculture curtailment.',
        dispatches: [
          { target: 'State Water Board', targetType: 'dept', urgency: 'critical', message: 'Enforce Stage 2 mandatory 20% reduction. Curtail junior water rights statewide. Activate recycled water expansion.', channel: 'Emergency Order' },
          { target: 'Citizens (Urban CA)', targetType: 'public', urgency: 'high', message: 'DROUGHT EMERGENCY: 20% mandatory water reduction. Outdoor watering 2 days/week only. Fines up to $500/day for violations.', channel: 'Emergency Broadcast + SMS' },
          { target: 'Farmers (San Joaquin)', targetType: 'farmer', urgency: 'critical', message: 'Agriculture curtailment 38% — junior rights first. Drip irrigation required. Fallow program incentives available: $800/acre.', channel: 'CDFA Agricultural Alert' },
        ],
      },
    ],
    verdict: {
      severity: 'critical', title: 'DROUGHT D3 EMERGENCY — California',
      summary: 'D3 Extreme Drought across 41% of state. Shasta Lake at 54.1% (37% below historical). Groundwater record 28m depth in San Joaquin Valley. Aqueduct delivery at 62% of contracted entitlement. Mandatory Stage 2 restrictions activated.',
      agentsInput: ['Sensor Agent'],
      precautions: [
        'Stage 2 Mandatory: 20% urban water reduction — enforce immediately, $500/day fines',
        'Agriculture curtailment 38% — junior water rights suspended, senior rights restricted',
        'Fallow incentive program: $800/acre for farmers to take land out of production',
        'Accelerate recycled water: 420→680 MLD capacity expansion by Q4 2026',
        'Citizens: outdoor watering max 2 days/week, no ornamental fountain use, short showers',
      ],
      dispatches: [
        { target: 'State Water Resources Board', icon: 'dept', urgency: 'CRITICAL', message: 'Stage 2 mandatory restrictions. Curtail junior rights. Enforce 20% urban reduction.' },
        { target: 'Urban Residents (CA)', icon: 'public', urgency: 'HIGH', message: '20% mandatory reduction. Outdoor 2 days/week. Fines up to $500/day.' },
        { target: 'Farmers (San Joaquin Valley)', icon: 'farmer', urgency: 'CRITICAL', message: '38% curtailment. Drip irrigation required. Fallow program $800/acre.' },
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
          { n: 3, action: 'Package data bundle for analysis agents', finding: 'Bundle prepared — passing to analysis and satellite stages.' },
        ],
        metrics: [
          { name: 'Sensor Uptime', value: '98.2%', threshold: '> 95%', ok: true },
          { name: 'Data Quality', value: '88%', threshold: '> 80%', ok: true },
          { name: 'Readings Ingested', value: '42K', threshold: 'N/A', ok: true },
        ],
        issueFound: false,
        dispatches: [
          { target: 'Analysis Agent', targetType: 'agent', urgency: 'medium', message: 'Sensor bundle ready — 42K readings packaged', channel: 'agent-bus' },
          { target: 'Satellite Agent', targetType: 'agent', urgency: 'low', message: 'Request current imagery for water body change detection', channel: 'agent-bus' },
        ],
      },
      {
        id: 'satellite', name: 'Satellite Agent', stage: 'collection', status: 'completed', statusLabel: 'IMAGERY PROCESSED',
        summary: `${stateName} — Sentinel-2 NDWI analysis complete. Water bodies within seasonal norms.`,
        confidence: 84, elapsed: '5.2s',
        dataSources: [
          { name: 'Sentinel-2 NDWI Water Index', type: 'satellite', freshness: '2 days ago', quality: 91, detail: 'Water body extent within seasonal baseline ±5%' },
          { name: 'MODIS Land Surface Temperature', type: 'satellite', freshness: '1 day ago', quality: 87, detail: 'LST normal range — no thermal anomalies' },
          { name: 'GRACE-FO Groundwater Anomaly', type: 'satellite', freshness: '1 month ago', quality: 82, detail: `${stateName} groundwater storage: -2.1 cm vs baseline — marginal deficit` },
        ],
        rules: [
          { condition: 'NDWI change > 15% vs baseline', trigger: 'Not triggered', action: 'Flag for FloodAgent or DroughtAgent depending on direction', priority: 'medium' },
          { condition: 'GRACE anomaly > -10 cm', trigger: '-2.1 cm — within normal', action: 'No action — monitor monthly', priority: 'low' },
        ],
        steps: [
          { n: 1, action: 'Retrieve Sentinel-2 latest overpass for region', finding: 'Scene acquired 2 days ago — 10m resolution. NDWI computed.' },
          { n: 2, action: 'Compare current water extent vs seasonal baseline', finding: 'Water bodies within ±5% of seasonal norm — no significant change' },
          { n: 3, action: 'Analyse GRACE-FO groundwater storage anomaly', finding: 'Groundwater -2.1 cm below baseline — marginal, monitoring recommended' },
          { n: 4, action: 'Package imagery summary and pass to AnalysisAgent', finding: 'All normal. Passing green-status bundle to Analysis stage.' },
        ],
        metrics: [
          { name: 'NDWI Change', value: '±4%', threshold: '< ±15%', ok: true },
          { name: 'GRACE Anomaly', value: '-2.1 cm', threshold: '> -10 cm', ok: true },
          { name: 'Scene Age', value: '2 days', threshold: '< 7 days', ok: true },
        ],
        issueFound: false,
        dispatches: [
          { target: 'Analysis Agent', targetType: 'agent', urgency: 'low', message: 'Satellite: NORMAL — water extent ±4%, GRACE -2.1cm, no anomalies', channel: 'agent-bus' },
        ],
      },
      {
        id: 'analysis', name: 'Water Analysis Agent', stage: 'analysis', status: 'completed', statusLabel: 'NORMAL',
        summary: `${stateName} — all parameters within safe thresholds. Seasonal outlook moderate.`,
        confidence: 86, elapsed: '2.4s',
        dataSources: [
          { name: 'Sensor Agent bundle', type: 'api', freshness: '0 sec', quality: 88, detail: '42K readings — all within normal range' },
          { name: 'Satellite Agent imagery summary', type: 'api', freshness: '0 sec', quality: 84, detail: 'Water extent normal, GRACE -2.1cm' },
          { name: 'Open-Meteo API (7-day forecast)', type: 'api', freshness: '5 min ago', quality: 90, detail: '7-day rainfall 120mm, temp 32°C avg — seasonal' },
        ],
        rules: [
          { condition: 'All inputs within normal band', trigger: 'No threshold breaches', action: 'Report NORMAL to DecisionAgent — continuous monitoring', priority: 'low' },
          { condition: '7-day rainfall > 150% seasonal average', trigger: 'Not triggered (120mm is seasonal)', action: 'Escalate to FloodAgent', priority: 'medium' },
        ],
        steps: [
          { n: 1, action: 'Merge sensor + satellite data for composite analysis', finding: 'All 42K readings normal. Satellite confirms — no anomalies detected' },
          { n: 2, action: 'Run WHO water quality screening', finding: 'pH 7.2, turbidity 2.1 NTU, chlorine 0.9 mg/L — all within WHO safe range' },
          { n: 3, action: 'Compute seasonal water stress index', finding: 'Water stress index 0.38 — LOW (below 0.4 threshold for concern)' },
          { n: 4, action: 'Generate 7-day outlook from Open-Meteo', finding: '120mm forecast — within seasonal norms. No extreme event predicted.' },
        ],
        metrics: [
          { name: 'Water Stress Index', value: '0.38', threshold: '< 0.40', ok: true },
          { name: 'WQI Score', value: '87', threshold: '> 80', ok: true },
          { name: '7-Day Rainfall', value: '120mm', threshold: 'Seasonal', ok: true },
        ],
        issueFound: false,
        dispatches: [
          { target: 'Decision Agent', targetType: 'agent', urgency: 'low', message: 'status=NORMAL, wsi=0.38, wqi=87, rainfall_7d=120mm — no action required', channel: 'agent-bus' },
        ],
      },
      {
        id: 'decision', name: 'Decision Agent', stage: 'decision', status: 'completed', statusLabel: 'MONITORING',
        summary: `${stateName} — normal conditions. Continuous monitoring active. No immediate action required.`,
        confidence: 85, elapsed: '1.4s',
        dataSources: [
          { name: 'Sensor Agent bundle', type: 'api', freshness: '0 sec', quality: 88, detail: '42K readings — all within normal range' },
          { name: 'Satellite Agent', type: 'api', freshness: '0 sec', quality: 84, detail: 'Water extent normal, GRACE -2.1cm' },
          { name: 'Water Analysis Agent', type: 'api', freshness: '0 sec', quality: 86, detail: 'WSI 0.38, WQI 87, rainfall normal' },
        ],
        rules: [
          { condition: 'All agents report NORMAL', trigger: 'No threshold breaches from 3 agents', action: 'Continue monitoring. Report to dashboard. Next full review: 4 hours.', priority: 'low' },
          { condition: 'Any single agent reports ELEVATED', trigger: 'Not triggered', action: 'Convene 2-agent consensus check before escalating', priority: 'medium' },
        ],
        steps: [
          { n: 1, action: 'Aggregate inputs from 3 upstream agents', finding: 'All 3 agents: NORMAL. Confidence-weighted synthesis: 86%' },
          { n: 2, action: 'Apply governance decision thresholds', finding: 'No thresholds breached. No emergency or precautionary actions triggered.' },
          { n: 3, action: 'Generate routine status report for dashboard', finding: `${stateName}: NORMAL status confirmed. Monitoring continues at 30-min cadence.` },
          { n: 4, action: 'Schedule next agent cycle', finding: 'Next full cycle: 4 hours. Continuous sensor monitoring: 30 minutes.' },
        ],
        metrics: [
          { name: 'Overall Status', value: 'NORMAL', threshold: 'N/A', ok: true },
          { name: 'Agents Consulted', value: '3/3', threshold: '3/3', ok: true },
          { name: 'Confidence', value: '86%', threshold: '> 80%', ok: true },
        ],
        issueFound: false,
        dispatches: [
          { target: 'Dashboard', targetType: 'dept', urgency: 'low', message: `${stateName} routine status: NORMAL. No alerts. Next review 4 hours.`, channel: 'API' },
          { target: 'Operations Team', targetType: 'dept', urgency: 'low', message: 'All systems nominal. Routine monitoring continues. No action required.', channel: 'Ops Portal' },
        ],
      },
    ],
    verdict: {
      severity: 'clear', title: `Normal Operations — ${stateName}`,
      summary: `All water parameters within normal range for ${stateName}. 42K sensor readings, satellite imagery, and climate forecast all confirm seasonal norms. Continuous AI monitoring active. No immediate action required.`,
      agentsInput: ['Sensor Agent', 'Satellite Agent', 'Water Analysis Agent'],
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
