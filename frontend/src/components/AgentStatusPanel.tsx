import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Waves, Droplets, CloudRain, Activity, AlertTriangle,
  Brain, Database, Globe, Radio, Cpu, ChevronRight,
  CheckCircle2, Clock, Zap, Shield, Wind
} from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'

// ─── Types ────────────────────────────────────────────────────────────────────
type DataSource = { name: string; type: 'db' | 'api' | 'sensor' | 'satellite' | 'model' }
type Metric     = { label: string; value: string; unit?: string; alert?: boolean }

type AgentState = {
  id:             string
  name:           string
  status:         'alert' | 'running' | 'completed' | 'idle'
  statusLabel:    string
  currentAction:  string
  confidence:     number
  lastRun:        string
  dataSources:    DataSource[]
  decision:       string
  keyMetrics:     Metric[]
  reasoningSteps: string[]
  toolsCalled:    string[]
}

// ─── Per-country agent contexts ───────────────────────────────────────────────
const AGENTS_BY_COUNTRY: Record<string, AgentState[]> = {
  india: [
    {
      id: 'flood_agent', name: 'Flood Agent', status: 'alert', statusLabel: 'ALERT',
      currentAction: 'CRITICAL: Brahmaputra 7.2m — issuing 48h flood forecast for 4 Assam districts',
      confidence: 94, lastRun: '2 min ago',
      dataSources: [
        { name: 'River gauge BWO-GHY-01 (Guwahati)', type: 'sensor' },
        { name: 'Open-Meteo rainfall forecast API',   type: 'api' },
        { name: 'ISRO satellite SAR imagery',         type: 'satellite' },
        { name: 'PostgreSQL rivers table',            type: 'db' },
        { name: 'IMD storm probability model',        type: 'model' },
      ],
      decision: 'Brahmaputra at Guwahati gauge exceeded 6.0m flood threshold by 1.2m (now 7.2m). Storm probability 78% over 48h from Open-Meteo. Kopili reservoir at 87.4% adds upstream release risk. Combined flood score = CRITICAL. Evacuation advisory issued for Kamrup, Barpeta, Morigaon, Nagaon.',
      keyMetrics: [
        { label: 'Current Level',  value: '7.2',  unit: 'm',  alert: true  },
        { label: 'Flood Threshold', value: '6.0',  unit: 'm'               },
        { label: 'Overshoot',      value: '+1.2', unit: 'm',  alert: true  },
        { label: 'Storm Prob',     value: '78',   unit: '%',  alert: true  },
        { label: 'Pop at Risk',    value: '240K',             alert: true  },
        { label: 'Crest ETA',      value: '6',    unit: 'h',  alert: true  },
      ],
      reasoningSteps: [
        'Fetched live level from BWO-GHY-01 gauge: 7.2m (threshold: 6.0m → EXCEEDED by 1.2m)',
        'Queried Open-Meteo forecast for Guwahati: 78% storm probability, 590mm 7-day total',
        'Checked Kopili reservoir from PostgreSQL: 87.4% → overflow release risk HIGH',
        'Computed flood crest ETA: margin 1.2m ÷ 0.15 m/h × 6 = 48h... capped at 6h (emergency threshold)',
        'Evaluated 50-year historical flood model: 2022 peak was 8.1m — current trajectory similar',
        'Cross-correlated with satellite SAR: confirmed 18km² inundation already active in Kamrup',
        'Decision: CRITICAL flood alert — trigger immediate evacuation advisory for 4 districts',
      ],
      toolsCalled: ['fetchRiverGauge("BWO-GHY-01")', 'forecastRain("Guwahati")', 'getReservoirStatus("Kopili")', 'computeFloodCrest()', 'generateAlert("critical")'],
    },
    {
      id: 'reservoir_agent', name: 'Reservoir Agent', status: 'alert', statusLabel: 'HIGH RISK',
      currentAction: 'Hirakud 91.2% — recommending controlled release of 480 m³/s to prevent overflow',
      confidence: 90, lastRun: '5 min ago',
      dataSources: [
        { name: 'Hirakud reservoir level sensor',  type: 'sensor' },
        { name: 'Open-Meteo 7-day rainfall',       type: 'api'    },
        { name: 'PostgreSQL reservoirs table',     type: 'db'     },
        { name: 'OHPC dam management system',      type: 'api'    },
      ],
      decision: 'Hirakud at 91.2% (7,420 MCM of 8,136 MCM). Inflow 480 m³/s vs outflow 320 m³/s — net surplus +160 m³/s. At this rate, full capacity reached in 20 hours. 7-day rainfall forecast adds 380mm to Mahanadi catchment. Recommendation: increase outflow to 480 m³/s immediately and alert downstream communities in Bargarh and Sambalpur.',
      keyMetrics: [
        { label: 'Fill Level',     value: '91.2', unit: '%',   alert: true },
        { label: 'Capacity',       value: '8,136', unit: 'MCM'             },
        { label: 'Inflow',         value: '480',  unit: 'm³/s'             },
        { label: 'Current Outflow', value: '320',  unit: 'm³/s'            },
        { label: 'Net Surplus',    value: '+160', unit: 'm³/s', alert: true },
        { label: 'Hours to Full',  value: '~20',  unit: 'h',   alert: true },
      ],
      reasoningSteps: [
        'Fetched live level from Hirakud sensor: 192m MSL → 91.2% of 8,136 MCM capacity',
        'Computed net inflow: 480 - 320 = +160 m³/s → filling at ~0.7% per hour',
        'Queried 7-day rainfall forecast for Mahanadi basin: 380mm → HIGH inflow continuation',
        'Overflow threshold: 92% → only 0.8% headroom = ~1.1h at current fill rate',
        'Downstream assessment: Mundali Barrage can absorb max 550 m³/s safely',
        'Optimal outflow computed: 480 m³/s brings net to 0 and maintains safe downstream level',
        'Decision: increase release to 480 m³/s, alert Bargarh and Sambalpur districts',
      ],
      toolsCalled: ['getReservoirStatus("Hirakud")', 'forecastRain("Mahanadi_basin")', 'optimizeReservoir("Hirakud",75)', 'computeDownstreamCapacity()', 'generateAlert("high")'],
    },
    {
      id: 'rainfall_agent', name: 'Rainfall Agent', status: 'running', statusLabel: 'RUNNING',
      currentAction: 'Processing Open-Meteo 7-day forecast for Assam + IMD real-time rain radar data',
      confidence: 88, lastRun: '1 min ago',
      dataSources: [
        { name: 'Open-Meteo real-time API',   type: 'api'       },
        { name: 'IMD Doppler rain radar',     type: 'satellite' },
        { name: 'CMIP6 ensemble model',       type: 'model'     },
        { name: '284K IoT rain gauge network', type: 'sensor'   },
      ],
      decision: 'Northeast India 7-day forecast: 590mm total (2.1× seasonal average). Storm probability 78%. Peak rainfall day 5 at 124mm. All 7 days classified as heavy rain (>20mm). Drought risk: LOW. Immediate impact: Brahmaputra and Barak Valley basins at HIGH flood risk. Monsoon onset 2 weeks ahead of normal.',
      keyMetrics: [
        { label: '7-Day Total',    value: '590',  unit: 'mm',  alert: true },
        { label: 'Storm Prob',     value: '78',   unit: '%',   alert: true },
        { label: 'Peak Day',       value: '124',  unit: 'mm/d',alert: true },
        { label: 'Heavy Rain Days', value: '7/7', alert: true              },
        { label: 'Seasonal Avg',   value: '281',  unit: 'mm'               },
        { label: 'Data Source',    value: 'Live API'                        },
      ],
      reasoningSteps: [
        'Called Open-Meteo API for Guwahati (lat 26.18, lon 91.77): 7-day precipitation data received',
        'Computed 7-day total: 590.4mm — 2.1× the 30-year seasonal average of 281mm',
        'Identified heavy rain days (>20mm): all 7 days qualify → storm probability algorithm',
        'Storm probability: min(95, 7×13 + (124/150×30) + noise) = 78%',
        'Cross-validated with IMD Doppler radar: consistent pattern, monsoon trough established over Assam',
        'Drought risk assessment: total > 60mm → risk = LOW',
        'Output: storm probability 78%, peak day 5 (124mm), flood risk HIGH for Brahmaputra basin',
      ],
      toolsCalled: ['fetchOpenMeteo("Guwahati",7)', 'analyzeRainfallPattern()', 'computeStormProbability()', 'assessDroughtRisk()', 'forecastFloodImpact()'],
    },
    {
      id: 'water_quality_agent', name: 'Water Quality Agent', status: 'alert', statusLabel: 'WARNING',
      currentAction: 'Mumbai Zone 7 turbidity 6.8 NTU — 70% above WHO limit; Delhi Yamuna 12.4 NTU',
      confidence: 91, lastRun: '8 min ago',
      dataSources: [
        { name: 'Bhandup WTP turbidity sensor',    type: 'sensor' },
        { name: 'Yamuna WTP turbidity sensor',     type: 'sensor' },
        { name: 'PostgreSQL water_quality table',  type: 'db'     },
        { name: 'WHO water quality guidelines',    type: 'model'  },
      ],
      decision: 'Mumbai Bhandup WTP: turbidity 6.8 NTU (WHO limit 4.0 NTU) — violation. 1 WHO breach → WARNING (66.7% safety score). Cause: monsoon surface runoff into Tansa reservoir. Delhi Yamuna WTP: turbidity 12.4 NTU (3× limit), DO 5.6 mg/L (below 6.0). Safety score 50% → WARNING. Issued boil-water advisory for 2 eastern Mumbai wards and downstream Delhi zones.',
      keyMetrics: [
        { label: 'Mumbai Turbidity', value: '6.8',  unit: 'NTU',    alert: true },
        { label: 'WHO Turbidity Limit', value: '4.0', unit: 'NTU'              },
        { label: 'Mumbai Safety Score', value: '67', unit: '%'                 },
        { label: 'Delhi Turbidity',  value: '12.4', unit: 'NTU',    alert: true },
        { label: 'Delhi DO',         value: '5.6',  unit: 'mg/L',   alert: true },
        { label: 'Delhi Safety Score', value: '50', unit: '%',       alert: true },
      ],
      reasoningSteps: [
        'Queried PostgreSQL water_quality for Mumbai: turbidity 6.8 NTU vs WHO limit 4.0 → VIOLATION',
        'Mumbai safety score: 1 violation of 6 parameters = (5/6)×100 = 83.3% → WARNING (≥67%)',
        'Queried PostgreSQL water_quality for Delhi: turbidity 12.4 NTU + DO 5.6 mg/L = 2 violations',
        'Delhi safety score: 4 of 6 parameters pass = (4/6)×100 = 66.7% → WARNING threshold',
        'Root cause analysis: monsoon runoff increasing silt load in surface intakes',
        'Treatment recommendation: increase alum coagulant dose 25%, enhance pre-sedimentation',
        'Decision: issue boil-water advisory for affected zones, 4-hourly monitoring protocol',
      ],
      toolsCalled: ['getWaterQuality("Mumbai")', 'getWaterQuality("Delhi")', 'compareWHOStandards()', 'analyzeViolations()', 'generateBoilWaterAdvisory()'],
    },
    {
      id: 'leak_detection_agent', name: 'Leak Detection Agent', status: 'alert', statusLabel: 'LEAK DETECTED',
      currentAction: 'Zone 7 Dharavi–Kurla: pressure drop 2.4 bar — 22.3% flow loss (4,130 m³/day)',
      confidence: 89, lastRun: '1 min ago',
      dataSources: [
        { name: 'Dharavi trunk main inlet pressure sensor',  type: 'sensor' },
        { name: 'Kurla outlet pressure sensor',             type: 'sensor' },
        { name: 'Bhandup WTP flow meter',                   type: 'sensor' },
        { name: 'PostgreSQL sensors table',                 type: 'db'     },
        { name: 'Acoustic leak correlation model',          type: 'model'  },
      ],
      decision: 'Inlet pressure 5.8 bar vs outlet 3.4 bar on MUM-ZONE7-DN600 (DN600 cast iron, 1968, 57yr old). Pressure drop 2.4 bar = 41% of inlet. Flow loss estimated 22.3% (4,130 m³/day). Leak probability 0.89. Economic impact ₹2.1M/month. Acoustic correlation model localises fracture to J-14–J-22 segment (Dharavi sector). Urgent repair required within 6 hours.',
      keyMetrics: [
        { label: 'Inlet Pressure',   value: '5.8',  unit: 'bar'              },
        { label: 'Outlet Pressure',  value: '3.4',  unit: 'bar',  alert: true },
        { label: 'Pressure Drop',    value: '2.4',  unit: 'bar',  alert: true },
        { label: 'Flow Loss',        value: '22.3', unit: '%',    alert: true },
        { label: 'Daily Loss',       value: '4,130', unit: 'm³',  alert: true },
        { label: 'Monthly Cost',     value: '₹2.1M', alert: true              },
      ],
      reasoningSteps: [
        'Queried PostgreSQL sensors for pipeline MUM-ZONE7-DN600: found inlet (5.8 bar) and outlet (3.4 bar)',
        'Computed pressure drop: 5.8 - 3.4 = 2.4 bar = 41% of inlet pressure → SIGNIFICANT',
        'Estimated flow loss: 2.4 / 5.8 × 100 = 41% → corrected for pipe hydraulics = 22.3%',
        'Leak probability: min(0.99, 22.3/50) = 0.89 → LEAK DETECTED',
        'Pipe age: DN600 cast iron commissioned 1968 = 57 years → high corrosion risk',
        'Acoustic correlation model: signal delay between J-14 and J-22 manholes = 340ms → 2m accuracy',
        'Economic impact: 4,130 m³/day × ₹16/m³ × 32 days = ₹2.1M/month',
        'Decision: deploy repair crew within 6 hours, isolate J-14 to J-22 segment',
      ],
      toolsCalled: ['detectLeak("MUM-ZONE7-DN600")', 'fetchPressureSensors()', 'computeFlowLoss()', 'runAcousticCorrelation()', 'estimateEconomicImpact()'],
    },
    {
      id: 'climate_agent', name: 'Climate Agent', status: 'completed', statusLabel: 'COMPLETED',
      currentAction: 'India climate brief complete — +1.48°C anomaly, monsoon onset 2 weeks early',
      confidence: 87, lastRun: '15 min ago',
      dataSources: [
        { name: 'Open-Meteo real-time climate API', type: 'api'      },
        { name: 'NOAA global temperature dataset',  type: 'api'      },
        { name: 'CMIP6 climate ensemble model',     type: 'model'    },
        { name: 'IMD monsoon tracker',              type: 'api'      },
        { name: 'ISRO satellite thermal data',      type: 'satellite'},
      ],
      decision: 'India current temperature anomaly +1.2°C above 30-year average. Open-Meteo live data: Mumbai 32.9°C, humidity 84%. Guwahati 28.4°C, humidity 91%, 112.6mm current rainfall. Monsoon onset was 2 weeks early — 2.1× above-normal precipitation in northeast. 7-day forecast shows continued heavy monsoon pattern. Long-term: India groundwater stress intensifying (251 BCM/yr withdrawal). Jal Jeevan Mission recommended for rural supply coverage.',
      keyMetrics: [
        { label: 'Mumbai Temp',      value: '32.9', unit: '°C'               },
        { label: 'Mumbai Humidity',  value: '84',   unit: '%'                },
        { label: 'Guwahati Rainfall', value: '112.6', unit: 'mm'             },
        { label: 'Temp Anomaly',     value: '+1.2', unit: '°C',  alert: true },
        { label: 'Monsoon Onset',    value: '2 wk early',        alert: true },
        { label: 'GW Withdrawal',    value: '251',  unit: 'BCM/yr'           },
      ],
      reasoningSteps: [
        'Fetched real-time weather from Open-Meteo for Mumbai (lat 19.08, lon 72.88): 32.9°C, 84% humidity',
        'Fetched Guwahati weather: 28.4°C, 91% humidity, current rainfall 112.6mm',
        'Computed temperature anomaly vs 1990 baseline: +1.2°C for India → aligns with global +1.48°C',
        'Monsoon onset date: IMD confirms June 1 arrival at Guwahati (normal: June 15) → 2 weeks early',
        'CMIP6 ensemble: 87% models agree extreme monsoon pattern continues through July',
        'Groundwater assessment: India withdrawing 251 BCM/year → aquifer depletion accelerating',
        'Policy recommendation: Jal Jeevan Mission has achieved 65% rural tap connection — target 100% by 2025',
      ],
      toolsCalled: ['fetchOpenMeteo("Mumbai")', 'fetchOpenMeteo("Guwahati")', 'analyzeClimateAnomaly()', 'forecastMonsoon()', 'assessGroundwaterStress()'],
    },
  ],

  bangladesh: [
    {
      id: 'flood_agent', name: 'Flood Agent', status: 'alert', statusLabel: 'CRITICAL',
      currentAction: 'Buriganga 6.8m — 1.3m above threshold; 890K residents at risk in 3 districts',
      confidence: 96, lastRun: '1 min ago',
      dataSources: [
        { name: 'BWDB Sadarghat gauge sensor', type: 'sensor' },
        { name: 'Open-Meteo rainfall forecast', type: 'api'   },
        { name: 'Bangladesh Meteorological Dept', type: 'api' },
        { name: 'PostgreSQL rivers table',      type: 'db'    },
      ],
      decision: 'Buriganga at 6.8m — 1.3m above 5.5m flood threshold. Storm probability 84% from Open-Meteo (427mm 7-day forecast). Padma–Brahmaputra discharge 22% above seasonal average — downstream pressure expected in 24–36h. 890K people in Dhaka, Narayanganj, Munshiganj at risk. 120 BIWTA rescue boats deployed.',
      keyMetrics: [
        { label: 'Current Level',   value: '6.8',  unit: 'm',  alert: true },
        { label: 'Flood Threshold', value: '5.5',  unit: 'm'               },
        { label: 'Storm Prob',      value: '84',   unit: '%',  alert: true },
        { label: '7-Day Rainfall',  value: '427',  unit: 'mm', alert: true },
        { label: 'Pop at Risk',     value: '890K',             alert: true },
        { label: 'Rescue Boats',    value: '120'               },
      ],
      reasoningSteps: [
        'Fetched Buriganga level from BWDB Sadarghat gauge: 6.8m (threshold 5.5m → EXCEEDED by 1.3m)',
        'Queried Open-Meteo for Dhaka: 84% storm probability, 427mm 7-day total',
        'Assessed Padma–Brahmaputra discharge: 22% above seasonal average — upstream surge incoming',
        'Computed downstream crest timing: 24–36h for Padma pressure to reach Buriganga',
        'District risk mapping: Dhaka (5.2M), Narayanganj (3.5M), Munshiganj (1.5M) — in flood zone: 890K',
        'Emergency resources: 120 BIWTA boats + BNDR search teams deployed',
        'Decision: CRITICAL flood alert; coordinate with city corporation on evacuation routes',
      ],
      toolsCalled: ['fetchRiverGauge("Sadarghat")', 'forecastRain("Dhaka")', 'analyzeUpstreamFlow()', 'mapFloodRisk()', 'deployEmergencyResources()'],
    },
    {
      id: 'water_quality_agent', name: 'Water Quality Agent', status: 'alert', statusLabel: 'DANGER',
      currentAction: 'Dhaka Buriganga: 3 WHO violations — DANGER level; 8.9M residents at risk',
      confidence: 97, lastRun: '5 min ago',
      dataSources: [
        { name: 'Dhaka WASA WTP sensors',        type: 'sensor' },
        { name: 'PostgreSQL water_quality table', type: 'db'    },
        { name: 'WHO water quality database',     type: 'model' },
        { name: 'Industrial discharge monitoring', type: 'sensor'},
      ],
      decision: 'Buriganga River intake shows: turbidity 18.2 NTU (WHO limit 4.0 → 4.5× over), chlorine 0.12 mg/L (below 0.2 minimum), DO 4.8 mg/L (below 6.0), Lead 12.4 ppb and Arsenic 8.9 ppb both above WHO 10 ppb limit. 3 critical WHO violations → DANGER (safety score 17%). 8.9M Dhaka metro residents at risk. Mandatory boil-water advisory issued.',
      keyMetrics: [
        { label: 'Turbidity',      value: '18.2', unit: 'NTU',   alert: true },
        { label: 'Chlorine',       value: '0.12', unit: 'mg/L',  alert: true },
        { label: 'DO',             value: '4.8',  unit: 'mg/L',  alert: true },
        { label: 'Lead',           value: '12.4', unit: 'ppb',   alert: true },
        { label: 'Safety Score',   value: '17',   unit: '%',      alert: true },
        { label: 'Pop at Risk',    value: '8.9M',                alert: true },
      ],
      reasoningSteps: [
        'Queried PostgreSQL water_quality for Dhaka: retrieved latest reading from Buriganga intake',
        'Parameter check 1: turbidity 18.2 NTU vs WHO 4.0 limit → VIOLATION (4.55× over limit)',
        'Parameter check 2: chlorine 0.12 mg/L vs 0.2 minimum → VIOLATION (below minimum)',
        'Parameter check 3: dissolved oxygen 4.8 mg/L vs 6.0 threshold → VIOLATION',
        'Heavy metals: Lead 12.4 ppb (limit 10 ppb → VIOLATION), Arsenic 8.9 ppb (limit 10 ppb → marginal)',
        'Safety score: 1 of 6 parameters pass = 16.7% → DANGER status',
        'Decision: mandatory boil-water for all 8.9M residents, emergency chlorination upgrade required',
      ],
      toolsCalled: ['getWaterQuality("Dhaka")', 'compareWHOStandards()', 'assessHealthRisk()', 'generateBoilWaterAdvisory()', 'alertPublicHealth()'],
    },
    {
      id: 'rainfall_agent', name: 'Rainfall Agent', status: 'alert', statusLabel: 'HIGH',
      currentAction: 'Bangladesh 7-day forecast: 427mm total, storm probability 84%',
      confidence: 88, lastRun: '3 min ago',
      dataSources: [
        { name: 'Open-Meteo API (Dhaka)',    type: 'api'    },
        { name: 'Bangladesh Meteorological Dept', type: 'api' },
        { name: 'CMIP6 Bay of Bengal model', type: 'model'  },
      ],
      decision: '427mm 7-day forecast for Bangladesh. Peak day 3 at 92.4mm. 7 of 7 days are heavy rain days (>20mm). Storm probability 84%. Cyclone advisory: Bay of Bengal low-pressure system tracking northeast at 18 km/h — potential landfall probability 61% within 72h.',
      keyMetrics: [
        { label: '7-Day Total',   value: '427',  unit: 'mm', alert: true },
        { label: 'Storm Prob',    value: '84',   unit: '%',  alert: true },
        { label: 'Peak Day',      value: '92.4', unit: 'mm' },
        { label: 'Heavy Days',    value: '7/7',              alert: true },
        { label: 'Cyclone Prob',  value: '61',   unit: '%',  alert: true },
      ],
      reasoningSteps: [
        'Fetched Open-Meteo 7-day forecast for Dhaka: 427mm total across 7 days',
        'Heavy rain threshold (>20mm): all 7 days qualify — unprecedented for this date',
        'Storm probability: min(95, 7×13 + (92.4/150×30) + noise) = 84%',
        'Bay of Bengal assessment: low-pressure system at 14°N, 89°E moving NE at 18 km/h',
        'CMIP6 ensemble (12 models): 61% agree system will intensify to cyclone before landfall',
        'Recommended actions: coastal evacuation advisory for Cox\'s Bazar, Chittagong',
      ],
      toolsCalled: ['fetchOpenMeteo("Dhaka",7)', 'analyzeRainPattern()', 'trackLowPressure()', 'computeCycloneProbability()', 'issueCycloneAdvisory()'],
    },
  ],

  usa: [
    {
      id: 'reservoir_agent', name: 'Reservoir Agent', status: 'alert', statusLabel: 'LOW',
      currentAction: 'Shasta Lake 54.1% | Lake Mead 38% — Tier 2 shortage active on Colorado River',
      confidence: 89, lastRun: '10 min ago',
      dataSources: [
        { name: 'USBR Shasta Lake telemetry',     type: 'sensor' },
        { name: 'USBR Lake Mead gauge',           type: 'sensor' },
        { name: 'PostgreSQL reservoirs table',    type: 'db'     },
        { name: 'NOAA drought monitor',           type: 'api'    },
      ],
      decision: 'Shasta Lake at 54.1% (2,462 MCM of 4,552 MCM) — below 68% seasonal average. Lake Mead at 38% (13,947 MCM of 36,703 MCM) — triggered Tier 2 shortage declaration under Colorado River Compact, affecting water allocations for Arizona, Nevada, and Mexico. Net inflow positive at +20 m³/s. D3 Extreme Drought across 41% of California.',
      keyMetrics: [
        { label: 'Shasta Level',    value: '54.1', unit: '%',  alert: true },
        { label: 'Lake Mead Level', value: '38.0', unit: '%',  alert: true },
        { label: 'Shortage Tier',   value: 'Tier 2',           alert: true },
        { label: 'States Impacted', value: '3'                             },
        { label: 'Drought Area',    value: '41',   unit: '%CA', alert: true },
        { label: 'Shasta Inflow',   value: '+20',  unit: 'm³/s'            },
      ],
      reasoningSteps: [
        'Queried PostgreSQL reservoirs: Shasta 2,462 MCM / 4,552 MCM = 54.1% (below 68% seasonal average)',
        'Queried Lake Mead: 13,947 MCM / 36,703 MCM = 38% → below Tier 2 threshold of 40%',
        'Colorado River Compact: Tier 2 at <39% triggers mandatory reduction for AZ, NV, and Mexico',
        'NOAA drought monitor: D3 Extreme Drought covers 41% of California — water year critically low',
        'Shasta net inflow: 310 - 290 = +20 m³/s → fills ~61 days at current rate (improving)',
        'Recommendation: maintain Tier 2 restrictions, accelerate desalination project (+420 MLD by 2027)',
      ],
      toolsCalled: ['getReservoirStatus("Shasta")', 'getReservoirStatus("Lake_Mead")', 'checkColoradoCompact()', 'assessDroughtLevel()', 'optimizeWaterAllocation()'],
    },
    {
      id: 'water_quality_agent', name: 'Water Quality Agent', status: 'running', statusLabel: 'MONITORING',
      currentAction: 'Scanning 45 PFAS-flagged systems across 18 states — updating compliance database',
      confidence: 87, lastRun: '20 min ago',
      dataSources: [
        { name: 'EPA PFAS monitoring network', type: 'sensor' },
        { name: 'SDWIS federal database',      type: 'db'     },
        { name: 'PostgreSQL water_quality',    type: 'db'     },
        { name: 'CDC public health data',      type: 'api'    },
      ],
      decision: '45 public water systems across 18 states flagged for PFAS contamination above EPA 4 ppt limit (new 2024 standard). Priority states: Michigan (14 systems), Pennsylvania (8), New York (7). Los Angeles Municipal WTP: pH 7.6, turbidity 0.3 NTU, chlorine 1.2 mg/L — all within WHO limits. Safety score: 94.8%.',
      keyMetrics: [
        { label: 'PFAS Systems Flagged', value: '45',   alert: true },
        { label: 'States Affected',  value: '18',       alert: true },
        { label: 'EPA PFAS Limit',   value: '4',    unit: 'ppt'    },
        { label: 'LA Turbidity',     value: '0.3',  unit: 'NTU'    },
        { label: 'LA Safety Score',  value: '94.8', unit: '%'       },
      ],
      reasoningSteps: [
        'Scanned EPA SDWIS database: 45 systems exceed new 4 ppt PFAS limit (effective 2024)',
        'Highest priority: Michigan 14 systems (Camp Lejeune legacy contamination corridor)',
        'LA WTP quality check: turbidity 0.3 NTU (far below 4.0 limit) → SAFE',
        'Chloramine disinfection confirmed: chlorine 1.2 mg/L within 0.2-2.0 safe band',
        'National compliance: 91% of systems meet all WHO primary drinking water standards',
        'Recommendation: EPA should accelerate PFAS remediation fund disbursement to 45 flagged systems',
      ],
      toolsCalled: ['getWaterQuality("Los_Angeles")', 'scanPFASDatabase()', 'compareEPAStandards()', 'generateComplianceReport()', 'alertEPAOfficials()'],
    },
    {
      id: 'climate_agent', name: 'Climate Agent', status: 'completed', statusLabel: 'COMPLETED',
      currentAction: 'California D3 Extreme Drought brief complete — desalination expansion recommended',
      confidence: 91, lastRun: '12 min ago',
      dataSources: [
        { name: 'Open-Meteo (Los Angeles)', type: 'api'      },
        { name: 'NOAA drought monitor',     type: 'api'      },
        { name: 'NASA GRACE-FO satellite',  type: 'satellite'},
        { name: 'CMIP6 western US model',   type: 'model'    },
      ],
      decision: 'California: D3 Extreme Drought across 41% of state, with D4 Exceptional in Central Valley corridor. Temperature 24.6°C, 62% humidity (below normal for season). 7-day rainfall: 2.4mm total — critically low. GRACE-FO satellite shows groundwater deficit of 42 km³ in Central Valley since 2002. Recommended: desalination +420 MLD by 2027, atmospheric water generation pilot scale-up.',
      keyMetrics: [
        { label: 'Drought Area',    value: '41',   unit: '% CA',  alert: true },
        { label: 'LA Temperature',  value: '24.6', unit: '°C'                 },
        { label: '7-Day Rain',      value: '2.4',  unit: 'mm',    alert: true },
        { label: 'GW Deficit',      value: '42',   unit: 'km³',   alert: true },
        { label: 'Desal Target',    value: '+420', unit: 'MLD'                },
      ],
      reasoningSteps: [
        'Open-Meteo LA: temperature 24.6°C, 7-day precipitation only 2.4mm — drought conditions confirmed',
        'NOAA drought monitor: D3 Extreme across 41% of California, D4 Exceptional in Central Valley',
        'GRACE-FO satellite: groundwater storage anomaly -42 km³ from 2002–2026 trend (accelerating)',
        'CMIP6 western US ensemble: 78% models project drier conditions persisting through 2027',
        'Water supply projection: at current rate, state reservoirs reach 30% by October without intervention',
        'Recommended path: desalination +420 MLD (25% capacity increase), PFAS-treated recycled water mandate',
      ],
      toolsCalled: ['fetchOpenMeteo("Los_Angeles")', 'queryNOAADrought()', 'analyzeGRACESatellite()', 'projectReservoirTrajectory()', 'optimizeWaterStrategy()'],
    },
  ],

  australia: [
    {
      id: 'reservoir_agent', name: 'Reservoir Agent', status: 'alert', statusLabel: 'CRITICAL LOW',
      currentAction: 'Lake Wivenhoe at 18.4% — SE Queensland emergency supply protocols active',
      confidence: 87, lastRun: '8 min ago',
      dataSources: [
        { name: 'Seqwater Wivenhoe telemetry', type: 'sensor' },
        { name: 'Bureau of Meteorology API',   type: 'api'    },
        { name: 'PostgreSQL reservoirs table', type: 'db'     },
        { name: 'La Niña/ENSO model',          type: 'model'  },
      ],
      decision: 'Lake Wivenhoe at 18.4% (214.4 MCM of 1,165 MCM) — below critical 20% threshold. Net outflow -10 m³/s (12 inflow vs 22 outflow for supply). At this rate, depletion in ~62 days. Murray-Darling Basin aggregate at 40-year low. Desalination plant at Gold Coast running at 85%. Stage 3 water restrictions active across SE Queensland (3.7M people).',
      keyMetrics: [
        { label: 'Wivenhoe Level', value: '18.4', unit: '%',   alert: true },
        { label: 'Critical Threshold', value: '20', unit: '%'              },
        { label: 'Net Flow',        value: '-10',  unit: 'm³/s',alert: true },
        { label: 'Days to Empty',   value: '~62',  unit: 'd',   alert: true },
        { label: 'Desal Running',   value: '85',   unit: '%'               },
        { label: 'Restrictions',    value: 'Stage 3'                       },
      ],
      reasoningSteps: [
        'Queried PostgreSQL: Wivenhoe at 214.4 MCM / 1,165 MCM = 18.4% — below 20% critical threshold',
        'Net flow: inflow 12 m³/s - outflow 22 m³/s = -10 m³/s (deficit)',
        'Depletion timeline: 214.4 MCM / (10 m³/s × 86400 s/day) = 248 days... corrected for evap = 62 days',
        'Bureau of Meteorology: La Niña transition in progress → rainfall recovery expected in 8-10 weeks',
        'Gold Coast desalination: operating at 85% capacity (delivering 46 GL/year vs 54 GL capacity)',
        'Recommendation: accelerate groundwater emergency abstraction, defer low-priority irrigation allocations',
      ],
      toolsCalled: ['getReservoirStatus("Wivenhoe")', 'fetchBOMForecast()', 'analyzeENSOPhase()', 'computeDepletionTimeline()', 'optimizeDesalinationDispatch()'],
    },
    {
      id: 'climate_agent', name: 'Climate Agent', status: 'alert', statusLabel: 'DROUGHT',
      currentAction: 'Murray-Darling Basin D3-D4 drought active — 38% continent coverage',
      confidence: 88, lastRun: '15 min ago',
      dataSources: [
        { name: 'Bureau of Meteorology climate', type: 'api'    },
        { name: 'CSIRO drought model',           type: 'model'  },
        { name: 'NASA MODIS land surface',       type: 'satellite'},
        { name: 'Open-Meteo Australia',          type: 'api'    },
      ],
      decision: 'Australia in D3-D4 drought across 38% of continent. Murray River flow at 40-year low (280 m³/s vs 580 m³/s average). Murray-Darling Basin water trading price at record A$620/ML. La Niña phase transitioning — some rainfall relief expected in 8-10 weeks but insufficient to recover reservoirs to safe levels before next summer.',
      keyMetrics: [
        { label: 'Drought Coverage', value: '38',  unit: '% continent', alert: true },
        { label: 'Murray Flow',      value: '280', unit: 'm³/s',        alert: true },
        { label: 'Normal Murray',    value: '580', unit: 'm³/s'                     },
        { label: 'Water Price',      value: 'A$620', unit: '/ML',        alert: true },
        { label: 'Recovery ETA',     value: '8-10', unit: 'wk'                      },
      ],
      reasoningSteps: [
        'CSIRO drought monitor: D3 Extreme across 28%, D4 Exceptional across 10% of continent',
        'Murray River: 280 m³/s at Wentworth gauge — 52% below 30-year average of 580 m³/s',
        'Murray-Darling trading: water allocation prices at A$620/ML (record for this period)',
        'ENSO analysis: La Niña phase 2 transitioning — modelled rainfall recovery 8-10 weeks',
        'Recovery projection: Wivenhoe needs 12 weeks of normal inflow to return to 40%',
        'Risk window: 62 days to Wivenhoe depletion vs 56-70 days to rainfall recovery — CRITICAL GAP',
      ],
      toolsCalled: ['fetchBOMClimate()', 'queryCSIRODrought()', 'analyzeENSOPhase()', 'projectWaterRecovery()', 'assessCriticalGap()'],
    },
  ],
}

// Generic agent states for countries not in the lookup
function genericAgents(countryName: string): AgentState[] {
  return [
    {
      id: 'country_agent', name: 'Country Agent', status: 'completed', statusLabel: 'COMPLETED',
      currentAction: `${countryName} national water intelligence brief generated — 6 agents coordinated`,
      confidence: 85, lastRun: '10 min ago',
      dataSources: [
        { name: 'National water database',    type: 'db'    },
        { name: 'Open-Meteo API',             type: 'api'   },
        { name: 'PostgreSQL reservoirs table', type: 'db'   },
        { name: 'Global IoT sensor network',  type: 'sensor'},
      ],
      decision: `Coordinated 6 sub-agents for ${countryName} national water analysis. Reservoir aggregate, rainfall forecast, water quality, groundwater, leak detection, and climate all queried. National water score computed from weighted multi-agent consensus.`,
      keyMetrics: [
        { label: 'Sub-agents Run',    value: '6'                           },
        { label: 'Data Sources',      value: '18'                          },
        { label: 'Sensors Queried',   value: '42K'                         },
        { label: 'Response Time',     value: '2.3',    unit: 's'           },
        { label: 'Confidence',        value: '85',     unit: '%'           },
      ],
      reasoningSteps: [
        `Dispatched 6 parallel agent calls for ${countryName} national water analysis`,
        'Collected results from: Flood, Reservoir, Rainfall, Water Quality, Leak Detection, Climate agents',
        'Computed weighted national water score from 18 data dimensions',
        'Generated government alert list from active PostgreSQL alerts',
        'Synthesized AI recommendations with confidence-weighted ranking',
        'Produced national water brief for dashboard display',
      ],
      toolsCalled: ['runFloodAgent()', 'runReservoirAgent()', 'runRainfallAgent()', 'runWaterQualityAgent()', 'synthesizeResults()', 'generateDashboard()'],
    },
    {
      id: 'rainfall_agent', name: 'Rainfall Agent', status: 'completed', statusLabel: 'COMPLETED',
      currentAction: `${countryName} 7-day rainfall forecast complete — Open-Meteo API data retrieved`,
      confidence: 82, lastRun: '5 min ago',
      dataSources: [
        { name: 'Open-Meteo API',     type: 'api'   },
        { name: 'CMIP6 model',        type: 'model' },
        { name: 'IoT rain gauges',    type: 'sensor'},
      ],
      decision: `7-day precipitation forecast retrieved from Open-Meteo for ${countryName}. Storm probability computed from heavy-rain-day frequency and peak-day intensity. Drought risk assessed from 7-day total.`,
      keyMetrics: [
        { label: 'Data Source',    value: 'Open-Meteo' },
        { label: 'Forecast Days',  value: '7'          },
        { label: 'Confidence',     value: '88', unit: '%' },
      ],
      reasoningSteps: [
        `Called Open-Meteo API for ${countryName} primary coordinates`,
        'Extracted 7-day precipitation_mm array from daily forecast',
        'Counted heavy rain days (>20mm threshold)',
        'Computed storm probability using ensemble formula',
        'Assessed drought risk from 7-day total vs 20mm and 60mm thresholds',
      ],
      toolsCalled: ['fetchOpenMeteo()', 'analyzeRainPattern()', 'computeStormProbability()', 'assessDroughtRisk()'],
    },
    {
      id: 'reservoir_agent', name: 'Reservoir Agent', status: 'completed', statusLabel: 'COMPLETED',
      currentAction: `${countryName} reservoirs queried from PostgreSQL — fill levels and release schedule computed`,
      confidence: 83, lastRun: '8 min ago',
      dataSources: [
        { name: 'PostgreSQL reservoirs table', type: 'db'    },
        { name: 'IoT reservoir sensors',       type: 'sensor'},
        { name: 'Hydrological model',          type: 'model' },
      ],
      decision: `Reservoir levels queried from PostgreSQL for ${countryName}. Fill percentage, inflow/outflow rates, overflow and shortage risks computed. Optimal release schedule generated using 7-day rainfall forecast.`,
      keyMetrics: [
        { label: 'Reservoirs Monitored', value: '12'    },
        { label: 'Data Source',          value: 'PostgreSQL + IoT' },
        { label: 'Confidence',           value: '83', unit: '%'    },
      ],
      reasoningSteps: [
        `Queried PostgreSQL v_reservoir_status view for ${countryName} country filter`,
        'Computed fill percentage: current_level_mcm / capacity_mcm × 100',
        'Assessed overflow risk from fill % and 7-day rainfall forecast',
        'Assessed shortage risk from fill % threshold bands (critical <20%, high <35%, medium <50%)',
        'Generated optimal release schedule using net flow optimisation',
      ],
      toolsCalled: ['queryReservoirDB()', 'computeWaterBalance()', 'optimizeReservoir()', 'assessFloodShortagRisk()'],
    },
  ]
}

// ─── Source icon helper ───────────────────────────────────────────────────────
const sourceIcon = (type: DataSource['type']) => {
  const cls = 'w-3 h-3 shrink-0'
  if (type === 'db')        return <Database className={`${cls} text-blue-400`} />
  if (type === 'api')       return <Globe    className={`${cls} text-emerald-400`} />
  if (type === 'sensor')    return <Radio    className={`${cls} text-amber-400`} />
  if (type === 'satellite') return <Globe    className={`${cls} text-purple-400`} />
  return                           <Cpu      className={`${cls} text-cyan-400`} />
}

const statusConfig: Record<AgentState['status'], { dot: string; badge: string }> = {
  alert:     { dot: 'bg-red-500 animate-pulse',    badge: 'text-red-400 bg-red-500/10 border-red-500/20'     },
  running:   { dot: 'bg-emerald-500 animate-pulse', badge: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  completed: { dot: 'bg-blue-500',                 badge: 'text-blue-400 bg-blue-500/10 border-blue-500/20'  },
  idle:      { dot: 'bg-slate-500',                badge: 'text-slate-400 bg-slate-500/10 border-slate-500/20'},
}

const agentIcon = (id: string) => {
  const cls = 'w-4 h-4'
  if (id.includes('flood'))    return <Waves      className={cls} />
  if (id.includes('reservoir'))return <Droplets   className={cls} />
  if (id.includes('rainfall')) return <CloudRain  className={cls} />
  if (id.includes('quality'))  return <Activity   className={cls} />
  if (id.includes('leak'))     return <AlertTriangle className={cls} />
  if (id.includes('climate'))  return <Wind       className={cls} />
  if (id.includes('ground'))   return <Shield     className={cls} />
  if (id.includes('emergency'))return <Zap        className={cls} />
  return                              <Brain       className={cls} />
}

// ─── Main component ───────────────────────────────────────────────────────────
interface AgentStatusPanelProps {
  countryId:   string
  countryName: string
}

export function AgentStatusPanel({ countryId, countryName }: AgentStatusPanelProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const agents = AGENTS_BY_COUNTRY[countryId] ?? genericAgents(countryName)
  const selected = agents.find(a => a.id === selectedId) ?? null

  return (
    <GlassCard className="p-5">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-4 h-4 text-blue-400" />
        <h3 className="text-sm font-semibold text-white">Active AI Agents</h3>
        <span className="ml-auto text-[10px] text-slate-500">
          {agents.filter(a => a.status !== 'idle').length} of {agents.length} active
          · click agent to inspect
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Agent list */}
        <div className="lg:col-span-2 space-y-2">
          {agents.map(agent => {
            const cfg = statusConfig[agent.status]
            const isSelected = selectedId === agent.id
            return (
              <motion.button
                key={agent.id}
                onClick={() => setSelectedId(isSelected ? null : agent.id)}
                whileHover={{ scale: 1.01 }}
                className={`w-full text-left p-3 rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-blue-500/15 border-blue-500/40'
                    : 'bg-white/3 border-white/5 hover:bg-white/6'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />
                  <div className="w-6 h-6 flex items-center justify-center rounded-lg bg-white/5 text-slate-300 shrink-0">
                    {agentIcon(agent.id)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-white truncate">{agent.name}</p>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full border shrink-0 ${cfg.badge}`}>
                        {agent.statusLabel}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">{agent.currentAction}</p>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 shrink-0 transition-transform ${isSelected ? 'rotate-90 text-blue-400' : 'text-slate-600'}`} />
                </div>

                <div className="flex items-center gap-3 mt-2 pl-9">
                  <div className="flex items-center gap-1">
                    <div className="h-1 w-12 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-blue-500" style={{ width: `${agent.confidence}%` }} />
                    </div>
                    <span className="text-[9px] text-slate-500">{agent.confidence}%</span>
                  </div>
                  <div className="flex items-center gap-1 text-[9px] text-slate-600">
                    <Clock className="w-2.5 h-2.5" />
                    {agent.lastRun}
                  </div>
                </div>
              </motion.button>
            )
          })}
        </div>

        {/* Detail panel */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.2 }}
                className="space-y-3"
              >
                {/* Header */}
                <div className="flex items-center gap-2 p-3 bg-white/3 rounded-xl border border-white/8">
                  <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
                    {agentIcon(selected.id)}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">{selected.name}</p>
                    <p className="text-[10px] text-slate-500">
                      Confidence {selected.confidence}% · {selected.dataSources.length} data sources
                    </p>
                  </div>
                  <span className={`ml-auto text-[9px] px-2 py-0.5 rounded-full border ${statusConfig[selected.status].badge}`}>
                    {selected.statusLabel}
                  </span>
                </div>

                {/* Key metrics */}
                <div>
                  <p className="text-[9px] text-slate-500 uppercase tracking-wider mb-1.5 font-medium">Key Metrics</p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {selected.keyMetrics.map((m, i) => (
                      <div key={i} className={`p-2 rounded-lg border text-center ${m.alert ? 'bg-red-500/5 border-red-500/20' : 'bg-white/3 border-white/5'}`}>
                        <p className={`text-xs font-bold ${m.alert ? 'text-red-400' : 'text-white'}`}>
                          {m.value}{m.unit ? <span className="text-[9px] font-normal ml-0.5">{m.unit}</span> : null}
                        </p>
                        <p className="text-[9px] text-slate-500 leading-tight">{m.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Data sources */}
                <div>
                  <p className="text-[9px] text-slate-500 uppercase tracking-wider mb-1.5 font-medium">Data Sources</p>
                  <div className="space-y-1">
                    {selected.dataSources.map((src, i) => (
                      <div key={i} className="flex items-center gap-2 px-2 py-1.5 bg-white/3 rounded-lg border border-white/5">
                        {sourceIcon(src.type)}
                        <span className="text-[10px] text-slate-300">{src.name}</span>
                        <span className="ml-auto text-[9px] text-slate-600 capitalize">{src.type}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reasoning chain */}
                <div>
                  <p className="text-[9px] text-slate-500 uppercase tracking-wider mb-1.5 font-medium">Reasoning Chain</p>
                  <div className="space-y-1">
                    {selected.reasoningSteps.map((step, i) => (
                      <div key={i} className="flex items-start gap-2 px-2 py-1.5 bg-white/3 rounded-lg border border-white/5">
                        <span className="text-[9px] text-blue-400 font-mono shrink-0 mt-0.5">{i + 1}.</span>
                        <p className="text-[10px] text-slate-400 leading-relaxed">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Decision */}
                <div className="p-3 bg-blue-500/5 rounded-xl border border-blue-500/15">
                  <p className="text-[9px] text-blue-400 uppercase tracking-wider mb-1 font-medium">Decision</p>
                  <p className="text-[10px] text-slate-300 leading-relaxed">{selected.decision}</p>
                </div>

                {/* Tools called */}
                <div>
                  <p className="text-[9px] text-slate-500 uppercase tracking-wider mb-1.5 font-medium">MCP Tools Called</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.toolsCalled.map(t => (
                      <span key={t} className="text-[9px] px-2 py-0.5 bg-purple-500/10 text-purple-400 rounded-full border border-purple-500/20 font-mono">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-full min-h-[260px] text-center"
              >
                <Brain className="w-10 h-10 text-slate-700 mb-3" />
                <p className="text-sm text-slate-600">Select an agent</p>
                <p className="text-xs text-slate-700 mt-1">to see data sources, reasoning chain, and decision logic</p>
                <div className="flex items-center gap-2 mt-4">
                  {agents.filter(a => a.status === 'alert').map(a => (
                    <button
                      key={a.id}
                      onClick={() => setSelectedId(a.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg transition-colors"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-[10px] text-red-400">{a.name}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </GlassCard>
  )
}
