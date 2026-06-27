import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { AppLayout } from '@/components/layout/AppLayout'
import { LoginPage } from '@/pages/LoginPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { MapPage } from '@/pages/MapPage'
import { AgentConsolePage } from '@/pages/AgentConsolePage'
import { WorkflowPage } from '@/pages/WorkflowPage'
import { SimulationPage } from '@/pages/SimulationPage'
import { WaterQualityPage } from '@/pages/WaterQualityPage'
import { ReservoirsPage } from '@/pages/ReservoirsPage'
import { ForecastPage } from '@/pages/ForecastPage'
import { AlertsPage } from '@/pages/AlertsPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { GlobalPage } from '@/pages/GlobalPage'
import { CountriesPage } from '@/pages/CountriesPage'
import { CountryDashboard } from '@/pages/CountryDashboard'
import { StatesPage } from '@/pages/StatesPage'
import { CitiesPage } from '@/pages/CitiesPage'
import { RiversPage } from '@/pages/RiversPage'
import { PipelinesPage } from '@/pages/PipelinesPage'
import { SensorsPage } from '@/pages/SensorsPage'
import { ClimatePage } from '@/pages/ClimatePage'
import { KnowledgeGraphPage } from '@/pages/KnowledgeGraphPage'
import { ReportsPage } from '@/pages/ReportsPage'
import { AgentObservabilityPage } from '@/pages/AgentObservabilityPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <>{children}</>
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        {/* Overview */}
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="global" element={<GlobalPage />} />
        {/* Geography */}
        <Route path="countries" element={<CountriesPage />} />
        <Route path="countries/:countryId" element={<CountryDashboard />} />
        <Route path="states" element={<StatesPage />} />
        <Route path="cities" element={<CitiesPage />} />
        <Route path="rivers" element={<RiversPage />} />
        <Route path="reservoirs" element={<ReservoirsPage />} />
        <Route path="pipelines" element={<PipelinesPage />} />
        <Route path="sensors" element={<SensorsPage />} />
        {/* Intelligence */}
        <Route path="water-quality" element={<WaterQualityPage />} />
        <Route path="climate" element={<ClimatePage />} />
        <Route path="forecast" element={<ForecastPage />} />
        {/* AI Systems */}
        <Route path="agents" element={<AgentConsolePage />} />
        <Route path="observability" element={<AgentObservabilityPage />} />
        <Route path="workflow" element={<WorkflowPage />} />
        <Route path="knowledge-graph" element={<KnowledgeGraphPage />} />
        <Route path="digital-twin" element={<SimulationPage />} />
        <Route path="simulation" element={<SimulationPage />} />
        {/* Operations */}
        <Route path="alerts" element={<AlertsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        {/* Legacy */}
        <Route path="map" element={<MapPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
