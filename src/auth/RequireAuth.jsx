import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './authContext.js'

export default function RequireAuth() {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  // Enquanto a sessão está sendo restaurada não dá para decidir nada: redirecionar
  // aqui expulsaria quem está logado a cada recarga da página.
  if (isLoading) {
    return (
      <div className="splash">
        <p className="muted">Carregando…</p>
      </div>
    )
  }

  // 'from' permite voltar à página pretendida depois do login.
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace state={{ from: location }} />
}
