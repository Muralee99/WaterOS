export interface User {
  id: string
  email: string
  username: string
  full_name: string
  is_superuser: boolean
}

export interface AuthState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

export interface Reservoir {
  id: string
  name: string
  location: string
  latitude: number
  longitude: number
  capacity_mcm: number
  current_level_mcm: number
  fill_percentage: number
  inflow_rate: number
  outflow_rate: number
  overflow_risk: 'low' | 'medium' | 'high' | 'critical'
  last_updated: string
  history?: number[]
}

export interface WaterQualityReading {
  id: string
  location: string
  latitude: number
  longitude: number
  ph: number
  turbidity_ntu: number
  chlorine_mg_l: number
  dissolved_oxygen: number
  safety_score: number
  status: 'safe' | 'warning' | 'danger'
  measured_at: string
}

export interface Alert {
  id: string
  alert_type: string
  severity: 'info' | 'warning' | 'high' | 'critical'
  title: string
  message: string
  location: string
  confidence: number
  is_active: boolean
  created_at: string
  evidence?: Record<string, unknown>
}

export interface AgentInfo {
  agent_id: string
  name: string
  description: string
  icon: string
  color: string
  category: string
  status: 'idle' | 'running' | 'completed' | 'failed'
}

export interface AgentResult {
  agent_id: string
  status: string
  result: Record<string, unknown>
  reasoning_chain: ReasoningStep[]
  confidence: number
  tools_called: string[]
  agents_invoked: string[]
  latency_ms: number
  error?: string
  timestamp: string
}

export interface ReasoningStep {
  step: string
  data?: unknown
  timestamp: string
}

export interface DashboardData {
  water_health_score: number
  avg_reservoir_level_pct: number
  flood_risk: string
  active_leak_alerts: number
  water_quality_score: number
  active_agents: number
  system_health: string
  total_reservoirs: number
  total_sensors: number
  alerts_today: number
  last_updated: string
}

export interface ForecastData {
  location: string
  days: number
  temperature: number[]
  rainfall_mm: number[]
  humidity_pct: number[]
  storm_probability: number
  drought_risk: string
}
