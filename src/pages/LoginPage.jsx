import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/authContext.js'
import AuthLayout from '../components/AuthLayout.jsx'

export default function LoginPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [values, setValues] = useState({ email: '', password: '' })
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      await signIn(values.email.trim(), values.password)
      // Volta para a página que o usuário tentou abrir antes de ser barrado.
      navigate(location.state?.from?.pathname ?? '/', { replace: true })
    } catch (submitError) {
      setError(submitError.message)
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout title="Entrar" subtitle="Acesse sua conta do Fin Flower">
      <form onSubmit={handleSubmit} noValidate>
        {error && (
          <div className="alert" role="alert">
            {error}
          </div>
        )}

        <div className="field">
          <label htmlFor="email">E-mail</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={handleChange}
            placeholder="voce@exemplo.com"
            required
          />
        </div>

        <div className="field">
          <label htmlFor="password">Senha</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={values.password}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className="btn primary block" disabled={submitting}>
          {submitting ? 'Entrando…' : 'Entrar'}
        </button>
      </form>

      <p className="auth-footer muted">
        Ainda não tem conta? <Link to="/cadastro">Criar conta</Link>
      </p>
    </AuthLayout>
  )
}
