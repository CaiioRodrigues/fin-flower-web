export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="auth-page">
      <main className="auth-card card">
        <header className="auth-header">
          <h1>Fin Flower</h1>
          <h2>{title}</h2>
          <p className="muted">{subtitle}</p>
        </header>
        {children}
      </main>
    </div>
  )
}
