import { Fragment, useEffect, useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import Logo from './Logo.jsx'
import ThemeToggle from './ThemeToggle.jsx'
import Tour from './Tour.jsx'
import TourButton from './TourButton.jsx'
import { hasSeenTour } from './tourStorage.js'
import { useAuth } from '../auth/authContext.js'

/**
 * Dois grupos separados por um traço. O primeiro é o dinheiro em si — onde se
 * passa o dia. O segundo é o que o alimenta e o que se tira dele: orçamento,
 * cobrança, evento, relatório. O evento sai do primeiro plano porque virou um
 * atributo do lançamento, não a porta de entrada do sistema.
 */
const GROUPS = [
  [
    { to: '/', label: 'Caixa', end: true },
    { to: '/lancamentos', label: 'Lançamentos' },
    { to: '/gastos-fixos', label: 'Gastos fixos' },
    { to: '/pro-labore', label: 'Pró-labore' },
  ],
  [
    { to: '/orcamentos', label: 'Orçamentos' },
    { to: '/parcelas', label: 'Parcelas' },
    { to: '/eventos', label: 'Eventos' },
    { to: '/relatorios', label: 'Relatórios' },
  ],
]

export default function AppLayout() {
  const { user, signOut } = useAuth()
  const [signingOut, setSigningOut] = useState(false)
  const [tourOpen, setTourOpen] = useState(false)

  // Só na primeira visita, e depois de a tela existir: abrir o passeio sobre
  // um layout que ainda não assentou põe o balão no lugar errado.
  useEffect(() => {
    if (hasSeenTour()) return undefined

    const timer = window.setTimeout(() => setTourOpen(true), 700)
    return () => window.clearTimeout(timer)
  }, [])

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
        <button
          type="button"
          className="brand"
          onClick={() => setTourOpen(true)}
          title="Rever o tutorial"
        >
          <Logo size={38} />
          <div>
            <h1>Fin Flower</h1>
            <p className="muted">Controle financeiro do seu negócio</p>
          </div>
        </button>

        <div className="topbar-user">
          <TourButton onClick={() => setTourOpen(true)} />
          <ThemeToggle />
          <span className="muted">{user?.name}</span>
          <button type="button" className="btn small" onClick={handleSignOut} disabled={signingOut}>
            {signingOut ? 'Saindo…' : 'Sair'}
          </button>
        </div>
      </header>

      <nav className="nav">
        {GROUPS.map((group, index) => (
          <Fragment key={group[0].to}>
            {index > 0 && <span className="nav-divider" aria-hidden="true" />}
            {group.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              >
                {link.label}
              </NavLink>
            ))}
          </Fragment>
        ))}
      </nav>

      <Outlet />

      {tourOpen && <Tour onClose={() => setTourOpen(false)} />}
    </div>
  )
}
