import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/AppLayout.jsx'
import RedirectIfAuthenticated from './auth/RedirectIfAuthenticated.jsx'
import RequireAuth from './auth/RequireAuth.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import CashFlowPage from './pages/CashFlowPage.jsx'
import ContractDetailPage from './pages/ContractDetailPage.jsx'
import EventDetailPage from './pages/EventDetailPage.jsx'
import EventsPage from './pages/EventsPage.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<RedirectIfAuthenticated />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cadastro" element={<RegisterPage />} />
      </Route>

      {/* Tudo abaixo da guarda exige sessão: rota nova já nasce protegida. */}
      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<EventsPage />} />
          <Route path="/eventos/:eventId" element={<EventDetailPage />} />
          <Route path="/contratos/:contractId" element={<ContractDetailPage />} />
          <Route path="/fluxo-de-caixa" element={<CashFlowPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
