import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/AppLayout.jsx'
import RedirectIfAuthenticated from './auth/RedirectIfAuthenticated.jsx'
import RequireAuth from './auth/RequireAuth.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import ContractDetailPage from './pages/ContractDetailPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import EventDetailPage from './pages/EventDetailPage.jsx'
import EventsPage from './pages/EventsPage.jsx'
import InstallmentsPage from './pages/InstallmentsPage.jsx'
import LedgerPage from './pages/LedgerPage.jsx'
import QuoteDetailPage from './pages/QuoteDetailPage.jsx'
import QuotesPage from './pages/QuotesPage.jsx'
import RecurringPage from './pages/RecurringPage.jsx'
import ReportsPage from './pages/ReportsPage.jsx'

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
          {/* O caixa é a primeira tela: é a primeira pergunta de quem entra. */}
          <Route path="/" element={<DashboardPage />} />
          <Route path="/lancamentos" element={<LedgerPage />} />

          {/* Gasto fixo e pró-labore são o mesmo motor, com telas separadas
              porque quem opera olha para eles em momentos diferentes. */}
          <Route
            path="/gastos-fixos"
            element={
              <RecurringPage
                kind="FixedExpense"
                kindLabel="Gasto fixo"
                title="Gastos fixos"
                subtitle="O que sai todo mês, independentemente de haver trabalho."
              />
            }
          />
          <Route
            path="/pro-labore"
            element={
              <RecurringPage
                kind="ProLabore"
                kindLabel="Pró-labore"
                title="Pró-labore"
                subtitle="A retirada dos sócios, separada do custo do negócio."
              />
            }
          />

          <Route path="/orcamentos" element={<QuotesPage />} />
          <Route path="/orcamentos/:quoteId" element={<QuoteDetailPage />} />
          <Route path="/eventos" element={<EventsPage />} />
          <Route path="/eventos/:eventId" element={<EventDetailPage />} />
          <Route path="/contratos/:contractId" element={<ContractDetailPage />} />

          {/* A projeção que vivia aqui foi para o caixa; o que sobra é a lista
              de cobrança, que responde outra pergunta. */}
          <Route path="/parcelas" element={<InstallmentsPage />} />
          <Route path="/fluxo-de-caixa" element={<Navigate to="/parcelas" replace />} />
          <Route path="/relatorios" element={<ReportsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
