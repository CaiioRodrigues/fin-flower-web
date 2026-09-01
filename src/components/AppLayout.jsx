import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { useAuth } from '../auth/authContext.js'

export default function AppLayout() {
  const { user, signOut } = useAuth()
  const [signingOut, setSigningOut] = useState(false)

  async function handleSignOut() {
    setSigningOut(true)
    try {
      await signOut()
    } finally {
      // O redirecionamento é da guarda de rota: aqui basta encerrar a sessão.
      setSigningOut(false)
    }
  }

  return (
    <div className="app">
      <header className="header topbar">
        <div>
          <h1>Fin Flower</h1>
          <p className="muted">Controle financeiro por eventos</p>
        </div>

        <div className="topbar-user">
          <span className="muted">{user?.name}</span>
          <button type="button" className="btn small" onClick={handleSignOut} disabled={signingOut}>
            {signingOut ? 'Saindo…' : 'Sair'}
          </button>
        </div>
      </header>

      <Outlet />
    </div>
  )
}
