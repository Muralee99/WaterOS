import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Radio, Brain, Wifi, WifiOff, Zap, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { MetricCard } from '@/components/ui/MetricCard'
import { sensorsApi } from '@/services/api'
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts'

const generateSparkline = (base: number) =>
  Array.from({ length: 12 }, (_, i) => ({ v: base + (Math.random() - 0.5) * base * 0.2 }))

const mockSensors = [
  { id: 'S001', name: 'Ganges River Gauge', location: 'Varanasi, India', type: 'Flow', status: 'Online', value: 8420, unit: 'm³/s', battery: 87, signal: 92, alert: false },
  { id: 'S002', name: 'Hirakud Dam Level', location: 'Odisha, India', type: 'Level', status: 'Online', value: 91.2, unit: '%', battery: 64, signal: 78, alert: true },
  { id: 'S003', name: 'Brahmaputra Flood Sensor', location: 'Guwahati, India', type: 'Flow', status: 'Alert', value: 19800, unit: 'm³/s', battery: 71, signal: 85, alert: true },
  { id: 'S004', name: 'Rajasthan Groundwater', location: 'Jodhpur, India', type: 'Groundwater', status: 'Online', value: 42.3, unit: 'm depth', battery: 93, signal: 67, alert: false },
  { id: 'S005', name: 'Nile Flow Monitor', location: 'Aswan, Egypt', type: 'Flow', status: 'Online', value: 2830, unit: 'm³/s', battery: 45, signal: 74, alert: false },
  { id: 'S006', name: 'Three Gorges Outflow', location: 'Hubei, China', type: 'Flow', status: 'Online', value: 30150, unit: 'm³/s', battery: 98, signal: 99, alert: false },
  { id: 'S007', name: 'Amazon Discharge', location: 'Manaus, Brazil', type: 'Flow', status: 'Online', value: 209000, unit: 'm³/s', battery: 82, signal: 88, alert: false },
  { id: 'S008', name: 'Murray Critical Level', location: 'Adelaide, Australia', type: 'Level', status: 'Alert', value: 18.4, unit: '%', battery: 31, signal: 61, alert: true },
  { id: 'S009', name: 'Paris Water Quality', location: 'Paris, France', type: 'Quality', status: 'Online', value: 98.7, unit: 'WQI', battery: 89, signal: 97, alert: false },
  { id: 'S010', name: 'Mekong Sediment', location: 'Vientiane, Laos', type: 'Quality', status: 'Offline', value: 0, unit: 'NTU', battery: 5, signal: 0, alert: false },
  { id: 'S011', name: 'Dhaka Pipe Pressure', location: 'Dhaka, Bangladesh', type: 'Pressure', status: 'Alert', value: 1.9, unit: 'bar', battery: 52, signal: 49, alert: true },
  { id: 'S012', name: 'Tokyo Reservoir Monitor', location: 'Tokyo, Japan', type: 'Level', status: 'Online', value: 84.1, unit: '%', battery: 96, signal: 99, alert: false },
]

const SENSOR_INSIGHTS: Record<string, { confidence: number; analysis: string; recommendations: string[]; agents: string[]; tools: string[] }> = {
  S001: { confidence: 86, analysis: 'Ganges River Gauge at Varanasi reading 8,420 m³/s — within normal monsoon range. Anomaly Detection Agent tracking 3-day trend: +12% increase in 72h correlating with Uttarakhand rainfall. Sensor calibration verified in September 2025 — readings certified accurate to ±0.5%.', recommendations: ['Maintain 6-hour measurement intervals during active monsoon season', 'Cross-validate with Allahabad gauge 180km downstream for discharge continuity', 'Schedule next calibration: December 2026'], agents: ['Sensor Intelligence', 'Rainfall Agent', 'River Basin Agent'], tools: ['getSensorData()', 'detectAnomalies()', 'validateCalibration()'] },
  S002: { confidence: 91, analysis: 'ALERT: Hirakud Dam Level at 91.2% fill — 1.8% above safe operating limit. Inflow from Mahanadi catchment: 480 m³/s vs outflow 320 m³/s — net positive 160 m³/s. At current rate, overflow threshold (93%) reached in 18 hours. Controlled release protocol recommended immediately.', recommendations: ['URGENT: Increase outflow to 520 m³/s to stabilize reservoir level', 'Alert downstream Cuttack and Sambalpur districts for controlled release surge', 'Deploy 2 additional monitoring sensors at dam crest for overflow early detection'], agents: ['Reservoir Agent', 'Flood Agent', 'Emergency Agent'], tools: ['monitorReservoirLevel()', 'calculateInflow()', 'assessOverflowRisk()'] },
  S003: { confidence: 97, analysis: 'CRITICAL FLOOD ALERT: Brahmaputra Flood Sensor reporting 19,800 m³/s — 3,200 m³/s above flood trigger threshold. River level at 7.2m (threshold 6.0m). Sensor has been in Alert status for 14 consecutive hours. Reliability: 99.2% uptime, last calibrated 3 months ago. Data confidence: HIGH.', recommendations: ['IMMEDIATE: Activate NDRF flood response protocol for 4 Assam districts', 'Upgrade sensor data transmission to 15-minute intervals for real-time tracking', 'Pre-position 8 additional temporary sensors at predicted crest locations'], agents: ['Flood Agent', 'Emergency Agent', 'Rainfall Agent'], tools: ['predictFloodCrest()', 'issueEmergencyAlert()', 'trackRiverLevel()'] },
  S004: { confidence: 88, analysis: 'Rajasthan Groundwater sensor showing 42.3m depth — 8.3m deeper than 5-year average for this season. Depletion rate: 2.1m/year acceleration noted. At current extraction rate, economically viable groundwater (<60m) will be exhausted in 8.5 years. Agricultural pumping accounts for 89% of extraction.', recommendations: ['Implement district-level groundwater extraction permits with monthly quotas', 'Install 12 additional sensors in the Shekhawati region to map depletion gradient', 'Fast-track drip irrigation subsidy programme — reduces groundwater use 43%'], agents: ['Sensor Intelligence', 'Climate Agent', 'Country Agent'], tools: ['trackGroundwaterLevel()', 'modelDepletionRate()', 'assessExtractionQuotas()'] },
  S005: { confidence: 79, analysis: 'Nile Flow Monitor at Aswan reading 2,830 m³/s — 9% below historical average for this period. Battery at 45% — requires replacement within 45 days to ensure data continuity. Signal strength acceptable at 74%. GERD filling operations upstream significantly affecting seasonal flow patterns.', recommendations: ['Schedule battery replacement mission within 30 days (below 40% causes data dropout)', 'Cross-validate flow data with satellite altimetry for GERD impact verification', 'Add redundant sensor 50km upstream as backup monitoring point'], agents: ['Sensor Intelligence', 'River Basin Agent', 'Maintenance Agent'], tools: ['getSensorData()', 'scheduleMaintenance()', 'validateWithSatellite()'] },
  S006: { confidence: 94, analysis: 'Three Gorges Outflow sensor performing at benchmark levels — 98% battery, 99% signal, zero anomalies in 90-day window. Reading 30,150 m³/s outflow as Three Gorges reservoir management protocol releases water during high inflow period. Data certified by dual-redundant sensor array.', recommendations: ['Sensor performing optimally — maintain current maintenance schedule', 'Share Three Gorges sensor architecture as template for Nile Delta sensor upgrade', 'Annual calibration due Q4 2026 — pre-schedule for minimal downtime'], agents: ['Sensor Intelligence', 'Reservoir Agent', 'River Basin Agent'], tools: ['validateSensorArray()', 'monitorOutflow()', 'predictMaintenance()'] },
  S007: { confidence: 82, analysis: 'Amazon Discharge sensor at Manaus measuring 209,000 m³/s — highest in the global WaterOS network. Solar-powered remote unit functioning normally. Signal routed via Inmarsat-4 satellite link. Ecosystem health correlation: 82.4% index confirms healthy Amazon basin conditions. Deforestation detection sub-module active.', recommendations: ['Upgrade satellite link from L-band to Ka-band for 4× higher data frequency', 'Add 3 tributary sensors on major Amazon sub-basins for full basin coverage', 'Integrate deforestation detection alerts with INPE system for automated reporting'], agents: ['Sensor Intelligence', 'River Basin Agent', 'Climate Agent'], tools: ['getSensorData()', 'monitorEcosystem()', 'trackDeforestation()'] },
  S008: { confidence: 95, analysis: 'CRITICAL ALERT: Murray-Darling Critical Level sensor reading 18.4% — 0.6% above the 17.8% crisis threshold. Battery at 31% — risk of sensor dropout within 21 days. Current reading represents lowest Murray River level since records began. 31 native fish species at acute habitat risk.', recommendations: ['URGENT: Battery replacement mission — drone deployment authorized for remote location', 'Stage 4 water restrictions across Murray-Darling Basin based on this reading', 'Emergency fish translocation programme for 5 critically endangered species'], agents: ['Emergency Agent', 'Climate Agent', 'Sensor Intelligence'], tools: ['assessDroughtSeverity()', 'scheduleBatteryReplacement()', 'triggerEmergencyProtocol()'] },
  S009: { confidence: 96, analysis: 'Paris Water Quality sensor performing excellently — WQI 98.7, highest in European network. All 1,400 WHO parameters within limits. Optical sensor array detecting turbidity at 0.08 NTU (limit 1 NTU). Continuous chlorine residual monitoring confirms 0.24 mg/L — optimal disinfection coverage throughout distribution zone.', recommendations: ['Continue biannual calibration programme — current accuracy ±0.1 WQI units', 'Share Paris sensor calibration methodology via EU Water Quality Network', 'Evaluate PFAS detection module upgrade for emerging contaminant monitoring'], agents: ['Water Quality Agent', 'Sensor Intelligence', 'Infrastructure Agent'], tools: ['analyzeWaterQuality()', 'detectContaminants()', 'monitorCompliance()'] },
  S010: { confidence: 45, analysis: 'OFFLINE: Mekong Sediment sensor non-responsive for 72+ hours. Battery depleted (5%) and signal lost. Last reading before dropout: 8,400 NTU turbidity — extremely high, indicating major upstream sediment pulse. Loss of this sensor creates monitoring gap in a critical transboundary water body.', recommendations: ['PRIORITY: Emergency battery and electronics replacement mission — budget cleared', 'Deploy temporary floating sensor buoy as interim monitoring solution', 'Investigate 8,400 NTU reading before dropout — possible dam flushing event upstream'], agents: ['Sensor Intelligence', 'Maintenance Agent', 'River Basin Agent'], tools: ['diagnoseFailure()', 'scheduleMaintenance()', 'deployBackupSensor()'] },
  S011: { confidence: 93, analysis: 'CRITICAL ALERT: Dhaka Pipe Pressure sensor reading 1.9 bar — 1.1 bar below the minimum safe supply pressure of 3.0 bar. Multiple pipe fractures confirmed upstream causing pressure loss. 380,000 residents receiving sub-standard pressure, enabling contamination backflow risk. Signal weak at 49% — urban interference.', recommendations: ['IMMEDIATE: Activate emergency pressure management protocol for Old Dhaka district', 'Issue boil-water advisory — sub-3-bar pressure allows contamination ingress', 'Emergency pipe repair — deploy 4 repair teams to highest pressure-loss sections'], agents: ['Infrastructure Agent', 'Emergency Agent', 'Water Quality Agent'], tools: ['assessPressureLoss()', 'detectPipeFractures()', 'issueContaminationAlert()'] },
  S012: { confidence: 97, analysis: 'Tokyo Reservoir Monitor performing at global benchmark — 96% battery, 99% signal, WQI 99.1. Tama River intake quality score within optimal parameters. Sensor array includes IoT vibration detection for seismic pipe protection — 0 alerts in past 6 months. Okutama reservoir at 84.1%: optimal storage level.', recommendations: ['Sensor performing optimally — no immediate action required', 'Plan 10-year comprehensive sensor upgrade review for 2027', 'Share Tokyo IoT sensor integration architecture with WHO Water Safety Initiative'], agents: ['Sensor Intelligence', 'Reservoir Agent', 'Infrastructure Agent'], tools: ['monitorReservoirLevel()', 'validateSensorHealth()', 'trackSeismicRisk()'] },
}

const statusConfig: Record<string, { color: string; icon: typeof Wifi }> = {
  Online: { color: 'text-emerald-400', icon: Wifi },
  Alert: { color: 'text-red-400', icon: Zap },
  Offline: { color: 'text-slate-500', icon: WifiOff },
}

const typeColors: Record<string, string> = {
  Flow: 'text-blue-400 bg-blue-500/10',
  Level: 'text-cyan-400 bg-cyan-500/10',
  Quality: 'text-emerald-400 bg-emerald-500/10',
  Pressure: 'text-orange-400 bg-orange-500/10',
  Groundwater: 'text-purple-400 bg-purple-500/10',
}

export function SensorsPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const { data } = useQuery({
    queryKey: ['sensors-live'],
    queryFn: async () => {
      try {
        const r = await sensorsApi.live()
        const raw = r.data?.sensors ?? r.data
        if (!Array.isArray(raw) || !raw[0]) return mockSensors
        return raw.map((s: Record<string, unknown>) => ({
          id: String(s.id ?? ''), name: String(s.name ?? ''),
          location: String(s.city_id ?? s.location ?? 'Unknown'),
          type: String(s.type ?? 'flow').replace(/^./, (c: string) => c.toUpperCase()),
          status: s.status === 'online' ? 'Online' : s.status === 'offline' ? 'Offline' : s.status === 'flood' ? 'Alert' : 'Online',
          value: (s.current_value ?? s.value ?? 0) as number,
          unit: String(s.unit ?? ''),
          battery: (s.battery_pct ?? s.battery ?? 80) as number,
          signal: (s.signal ?? Math.floor(Math.random() * 30 + 65)) as number,
          alert: s.status === 'flood' || s.status === 'alert',
        }))
      }
      catch { return mockSensors }
    },
    refetchInterval: 5000,
  })
  const sensors = data ?? mockSensors
  const onlineCount = sensors.filter((s: typeof mockSensors[0]) => s.status === 'Online').length
  const alertCount = sensors.filter((s: typeof mockSensors[0]) => s.status === 'Alert').length
  const offlineCount = sensors.filter((s: typeof mockSensors[0]) => s.status === 'Offline').length
  const selectedSensor = sensors.find((s: typeof mockSensors[0]) => s.id === selectedId) ?? null
  const insight = selectedId ? (SENSOR_INSIGHTS[selectedId] ?? null) : null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2"><Radio className="w-5 h-5 text-blue-400" /> Live Sensor Network</h1>
          <p className="text-sm text-slate-500 mt-0.5">284K sensors globally · Refreshing every 5 seconds · Click a sensor for AI analysis</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-xs text-emerald-400 font-medium">Live</span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Online" value={onlineCount} icon={Wifi} status="good" />
        <MetricCard title="Alert" value={alertCount} icon={Zap} status="critical" />
        <MetricCard title="Offline" value={offlineCount} icon={WifiOff} status="warning" />
        <MetricCard title="Global Coverage" value="284K" icon={Radio} status="info" />
      </div>

      <AnimatePresence mode="wait">
        {selectedSensor && insight ? (
          <motion.div key={selectedId} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}>
            <GlassCard className="p-5" glow="blue">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-blue-400" />
                  <h3 className="text-sm font-semibold text-white">AI Insights — {selectedSensor.name}</h3>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xl font-bold text-blue-400">{insight.confidence}%</span>
                    <p className="text-[10px] text-slate-500">confidence</p>
                  </div>
                  <span className={`text-[10px] px-2 py-1 rounded-full border font-medium ${
                    selectedSensor.status === 'Alert' ? 'text-red-400 bg-red-500/10 border-red-500/20'
                    : selectedSensor.status === 'Offline' ? 'text-slate-400 bg-white/5 border-white/10'
                    : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                  }`}>{selectedSensor.status}</span>
                  <button onClick={() => setSelectedId(null)} className="px-2 py-1 text-[10px] bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-slate-400 transition-colors">Clear</button>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 space-y-3">
                  <div className="p-3 bg-blue-500/5 border border-blue-500/15 rounded-lg">
                    <p className="text-[10px] text-blue-400 font-semibold uppercase tracking-wider mb-1.5">Sensor Intelligence Analysis</p>
                    <p className="text-xs text-slate-300 leading-relaxed">{insight.analysis}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'Current Value', value: selectedSensor.status === 'Offline' ? '--' : `${selectedSensor.value.toLocaleString()} ${selectedSensor.unit}`, color: selectedSensor.alert ? 'text-red-400' : 'text-white' },
                      { label: 'Battery', value: `${selectedSensor.battery}%`, color: selectedSensor.battery > 50 ? 'text-emerald-400' : selectedSensor.battery > 20 ? 'text-amber-400' : 'text-red-400' },
                      { label: 'Signal', value: `${selectedSensor.signal}%`, color: selectedSensor.signal > 70 ? 'text-emerald-400' : selectedSensor.signal > 40 ? 'text-amber-400' : 'text-red-400' },
                    ].map(m => (
                      <div key={m.label} className="bg-white/3 rounded-lg p-2 border border-white/5">
                        <p className="text-[9px] text-slate-500 uppercase tracking-wider">{m.label}</p>
                        <p className={`text-sm font-bold mt-0.5 ${m.color}`}>{m.value}</p>
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium mb-2">Recommended Actions</p>
                    <div className="space-y-1.5">
                      {insight.recommendations.map((rec, i) => (
                        <div key={i} className="flex items-start gap-2">
                          {selectedSensor.status === 'Alert' || selectedSensor.status === 'Offline'
                            ? <AlertTriangle className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
                            : <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />}
                          <p className="text-xs text-slate-300">{rec}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium mb-2">Active Agents</p>
                    <div className="space-y-1.5">
                      {insight.agents.map(a => (
                        <div key={a} className="flex items-center gap-2 p-2 bg-white/3 rounded-lg border border-white/5">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                          <span className="text-xs text-white font-medium">{a}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {insight.tools.map(t => (
                      <span key={t} className="text-[10px] px-2 py-0.5 bg-purple-500/10 text-purple-400 rounded-full border border-purple-500/20">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ) : (
          <motion.div key="generic" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <GlassCard className="p-4" glow="blue">
              <div className="flex items-center gap-2 mb-2"><Brain className="w-4 h-4 text-blue-400" /><h3 className="text-sm font-semibold text-white">AI Insights</h3><span className="ml-auto text-xl font-bold text-blue-400">95%</span></div>
              <p className="text-xs text-slate-400 mb-2">Sensor Intelligence Agent processing 284K live feeds. Anomaly detection identified 4 sensors showing irregular patterns. Predictive maintenance recommends battery replacement for 3 units within 7 days. <span className="text-blue-400">Click any sensor card below for detailed AI analysis.</span></p>
              <div className="flex flex-wrap gap-1.5">
                {['Sensor Intelligence', 'Anomaly Detection Agent', 'Maintenance Agent'].map(a => <span key={a} className="text-[10px] px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20">{a}</span>)}
                {['detectAnomalies()', 'predictFailure()', 'getSensorData()'].map(t => <span key={t} className="text-[10px] px-2 py-0.5 bg-purple-500/10 text-purple-400 rounded-full border border-purple-500/20">{t}</span>)}
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {sensors.map((sensor: typeof mockSensors[0], i: number) => {
          const sc = statusConfig[sensor.status] ?? statusConfig.Offline
          const StatusIcon = sc.icon
          const sparkData = generateSparkline(sensor.value || 50)
          const isSelected = selectedId === sensor.id
          return (
            <motion.div key={sensor.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <GlassCard
                className={`p-4 cursor-pointer transition-all ${sensor.alert ? 'border border-red-500/20' : ''} ${isSelected ? 'border border-blue-500/40 bg-blue-500/5' : ''}`}
                onClick={() => setSelectedId(prev => prev === sensor.id ? null : sensor.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[10px] text-slate-500 font-mono">{sensor.id}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${typeColors[sensor.type] ?? 'text-slate-400 bg-white/5'}`}>{sensor.type}</span>
                      {isSelected && <span className="text-[9px] text-blue-400">● selected</span>}
                    </div>
                    <p className="text-xs font-semibold text-white">{sensor.name}</p>
                    <p className="text-[10px] text-slate-500">{sensor.location}</p>
                  </div>
                  <div className={`flex items-center gap-1 text-[10px] ${sc.color}`}>
                    <StatusIcon className="w-3 h-3" />
                    {sensor.status}
                  </div>
                </div>

                <div className="flex items-end gap-3 mb-3">
                  <div>
                    <p className="text-2xl font-bold text-white leading-none">
                      {sensor.status === 'Offline' ? '--' : sensor.value.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-slate-500">{sensor.unit}</p>
                  </div>
                  <div className="flex-1 h-10">
                    {sensor.status !== 'Offline' && (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={sparkData}>
                          <Line type="monotone" dataKey="v" stroke={sensor.alert ? '#EF4444' : '#3B82F6'} strokeWidth={1.5} dot={false} />
                          <Tooltip contentStyle={{ display: 'none' }} />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 text-[10px]">
                  <div className="flex items-center gap-1.5 flex-1">
                    <span className="text-slate-500">Battery</span>
                    <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{
                        width: `${sensor.battery}%`,
                        backgroundColor: sensor.battery > 50 ? '#10B981' : sensor.battery > 20 ? '#F59E0B' : '#EF4444'
                      }} />
                    </div>
                    <span className="text-white">{sensor.battery}%</span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-1">
                    <span className="text-slate-500">Signal</span>
                    <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-blue-500" style={{ width: `${sensor.signal}%` }} />
                    </div>
                    <span className="text-white">{sensor.signal}%</span>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )
        })}
      </div>

    </div>
  )
}
