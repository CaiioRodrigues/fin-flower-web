import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './authContext.js'

/** Mantém quem já está autenticado fora das telas de login e cadastro. */
export default function RedirectIfAuthenticated() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="splash">
        <p className="muted">Carregando…</p>
      </div>
    )
  }

  return isAuthenticated ? <Navigate to="/" replace /> : <Outlet />
}
