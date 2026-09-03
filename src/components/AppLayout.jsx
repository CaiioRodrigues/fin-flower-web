import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import Logo from './Logo.jsx'
import { useAuth } from '../auth/authContext.js'

/** A ordem segue o uso: primeiro o caixa, depois o que o alimenta. */
const LINKS = [
  { to: '/', label: 'Caixa', end: true },
  { to: '/lancamentos', label: 'Lançamentos' },
  { to: '/gastos-fixos', label: 'Gastos fixos' },
  { to: '/pro-labore', label: 'Pró-labore' },
  { to: '/orcamentos', label: 'Orçamentos' },
  { to: '/eventos', label: 'Eventos' },
  { to: '/fluxo-de-caixa', label: 'Fluxo de caixa' },
  { to: '/relatorios', label: 'Relatórios' },
]

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
        <div className="brand">
          <Logo size={38} />
          <div>
            <h1>Fin Flower</h1>
            <p className="muted">Controle financeiro do seu negócio</p>
          </div>
        </div>

        <div className="topbar-user">
          <span className="muted">{user?.name}</span>
          <button type="button" className="btn small" onClick={handleSignOut} disabled={signingOut}>
            {signingOut ? 'Saindo…' : 'Sair'}
          </button>
        </div>
      </header>

      <nav className="nav">
        {LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <Outlet />
    </div>
  )
}
