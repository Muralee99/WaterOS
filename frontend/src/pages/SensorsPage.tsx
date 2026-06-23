import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Radio, Brain, Wifi, WifiOff, Zap } from 'lucide-react'
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
  const { data } = useQuery({
    queryKey: ['sensors-live'],
    queryFn: async () => {
      try { const r = await sensorsApi.live(); return r.data?.sensors ?? r.data }
      catch { return mockSensors }
    },
    refetchInterval: 5000,
  })
  const sensors = data ?? mockSensors
  const onlineCount = sensors.filter((s: typeof mockSensors[0]) => s.status === 'Online').length
  const alertCount = sensors.filter((s: typeof mockSensors[0]) => s.status === 'Alert').length
  const offlineCount = sensors.filter((s: typeof mockSensors[0]) => s.status === 'Offline').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2"><Radio className="w-5 h-5 text-blue-400" /> Live Sensor Network</h1>
          <p className="text-sm text-slate-500 mt-0.5">284K sensors globally · Refreshing every 5 seconds</p>
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

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {sensors.map((sensor: typeof mockSensors[0], i: number) => {
          const sc = statusConfig[sensor.status] ?? statusConfig.Offline
          const StatusIcon = sc.icon
          const sparkData = generateSparkline(sensor.value || 50)
          return (
            <motion.div key={sensor.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <GlassCard className={`p-4 ${sensor.alert ? 'border border-red-500/20' : ''}`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[10px] text-slate-500 font-mono">{sensor.id}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${typeColors[sensor.type] ?? 'text-slate-400 bg-white/5'}`}>{sensor.type}</span>
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

      <GlassCard className="p-4" glow="blue">
        <div className="flex items-center gap-2 mb-2"><Brain className="w-4 h-4 text-blue-400" /><h3 className="text-sm font-semibold text-white">AI Insights</h3><span className="ml-auto text-xl font-bold text-blue-400">95%</span></div>
        <p className="text-xs text-slate-400 mb-2">Sensor Intelligence Agent is processing 284K live feeds. Anomaly detection identified 4 sensors showing irregular patterns. Predictive maintenance recommends battery replacement for 3 units within 7 days.</p>
        <div className="flex flex-wrap gap-1.5">
          {['Sensor Intelligence', 'Anomaly Detection Agent', 'Maintenance Agent'].map(a => <span key={a} className="text-[10px] px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20">{a}</span>)}
          {['detectAnomalies()', 'predictFailure()', 'getSensorData()'].map(t => <span key={t} className="text-[10px] px-2 py-0.5 bg-purple-500/10 text-purple-400 rounded-full border border-purple-500/20">{t}</span>)}
        </div>
      </GlassCard>
    </div>
  )
}
