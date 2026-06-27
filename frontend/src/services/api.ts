import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const api = axios.create({
  baseURL: `${API_BASE}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    // Only clear auth for explicit token-validation endpoints, not every data 401.
    // Hard redirecting on every 401 causes a reload loop when using demo tokens,
    // because pages fall back to mock data and Zustand persist keeps isAuthenticated=true.
    const url: string = error.config?.url ?? ''
    if (error.response?.status === 401 && (url.includes('/auth/me') || url.includes('/auth/refresh'))) {
      const { useAuthStore } = await import('@/store/authStore')
      useAuthStore.getState().logout()
    }
    return Promise.reject(error)
  }
)

export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (data: { email: string; username: string; password: string; full_name: string }) =>
    api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
}

export const dashboardApi = {
  getData: () => api.get('/dashboard'),
  getStats: () => api.get('/dashboard/statistics'),
}

export const reservoirApi = {
  list: () => api.get('/reservoirs'),
  get: (id: string) => api.get(`/reservoirs/${id}`),
}

export const agentApi = {
  list: () => api.get('/agents'),
  run: (agentId: string, context: Record<string, unknown> = {}, sessionId?: string) =>
    api.post('/agents/run', { agent_id: agentId, context, session_id: sessionId }),
  chat: (message: string, agentId = 'decision_agent', sessionId?: string) =>
    api.post('/agents/chat', { message, agent_id: agentId, session_id: sessionId }),
  reason: (query: string, context: Record<string, unknown> = {}) =>
    api.post('/agents/reason', { query, context }),
  sessions: (limit = 50, agentId?: string) =>
    api.get('/agents/sessions', { params: { limit, ...(agentId ? { agent_id: agentId } : {}) } }),
  clearSessions: () => api.delete('/agents/sessions'),
  memory: (agentId: string) => api.get(`/agents/memory/${agentId}`),
  observability: () => api.get('/agents/observability'),
}

export const waterQualityApi = {
  list: () => api.get('/quality'),
}

export const alertApi = {
  list: () => api.get('/alerts'),
  create: (data: Record<string, unknown>) => api.post('/alerts', data),
}

export const forecastApi = {
  get: (location = 'Global', days = 7) =>
    api.get(`/forecast?location=${location}&days=${days}`),
}

export const simulationApi = {
  digitalTwin: () => api.get('/simulation/digital-twin'),
  run: (scenarioType: string, parameters: Record<string, unknown> = {}) =>
    api.post('/simulation/run', { scenario_type: scenarioType, parameters }),
}

export const mcpApi = {
  tools: () => api.get('/mcp/tools'),
  call: (tool: string, params: Record<string, unknown> = {}) =>
    api.post('/mcp/call', { tool, params }),
}

export const globalApi = {
  dashboard: () => api.get('/global/dashboard'),
  statistics: () => api.get('/global/statistics'),
  map: () => api.get('/global/map'),
}

export const countriesApi = {
  list: () => api.get('/countries'),
  get: (id: string) => api.get(`/countries/${id}`),
  dashboard: (id: string) => api.get(`/countries/${id}/dashboard`),
  forecast: (id: string) => api.get(`/countries/${id}/forecast`),
}

export const statesApi = {
  list: (countryId?: string) => api.get('/states', { params: countryId ? { country_id: countryId } : {} }),
  get: (id: string) => api.get(`/states/${id}`),
}

export const citiesApi = {
  list: (stateId?: string) => api.get('/cities', { params: stateId ? { state_id: stateId } : {} }),
  get: (id: string) => api.get(`/cities/${id}`),
}

export const riversApi = {
  list: (countryId?: string) => api.get('/rivers', { params: countryId ? { country_id: countryId } : {} }),
  get: (id: string) => api.get(`/rivers/${id}`),
}

export const pipelinesApi = {
  list: (cityId?: string) => api.get('/pipelines', { params: cityId ? { city_id: cityId } : {} }),
}

export const sensorsApi = {
  list: () => api.get('/sensors'),
  live: () => api.get('/sensors/live'),
}

export const weatherApi = {
  get: (countryId?: string) => api.get('/weather', { params: countryId ? { country_id: countryId } : {} }),
}

export const climateApi = {
  global: () => api.get('/climate'),
  region: (region: string) => api.get(`/climate/${region}`),
}

export const graphApi = {
  get: () => api.get('/graph'),
}

export const reportsApi = {
  list: () => api.get('/reports'),
  get: (id: string) => api.get(`/reports/${id}`),
  generate: (data: Record<string, unknown>) => api.post('/reports/generate', data),
}
