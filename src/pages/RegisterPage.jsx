import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/authContext.js'
import AuthLayout from '../components/AuthLayout.jsx'

const PASSWORD_RULES = [
  { test: (value) => value.length >= 8, label: 'ao menos 8 caracteres' },
  { test: (value) => /[A-Z]/.test(value), label: 'uma letra maiúscula' },
  { test: (value) => /[a-z]/.test(value), label: 'uma letra minúscula' },
  { test: (value) => /[0-9]/.test(value), label: 'um número' },
]

export default function RegisterPage() {
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const [values, setValues] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState(null)
  const [fieldErrors, setFieldErrors] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError(null)
    setFieldErrors(null)
    setSubmitting(true)

    try {
      await signUp(values.name.trim(), values.email.trim(), values.password)
      navigate('/', { replace: true })
    } catch (submitError) {
      setError(submitError.message)
      // A API devolve os erros por campo; espelhamos as mesmas regras aqui só
      // para dar retorno imediato — a validação que vale é a do servidor.
      setFieldErrors(submitError.fieldErrors ?? null)
      setSubmitting(false)
    }
  }

  const unmetRules = PASSWORD_RULES.filter((rule) => !rule.test(values.password))

  return (
    <AuthLayout title="Criar conta" subtitle="Comece a controlar o caixa dos seus eventos">
      <form onSubmit={handleSubmit} noValidate>
        {error && (
          <div className="alert" role="alert">
            {error}
          </div>
        )}

        <div className="field">
          <label htmlFor="name">Nome</label>
          <input
            id="name"
            name="name"
            autoComplete="name"
            value={values.name}
            onChange={handleChange}
            required
          />
          {fieldErrors?.Name && <span className="error">{fieldErrors.Name[0]}</span>}
        </div>

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
          {fieldErrors?.Email && <span className="error">{fieldErrors.Email[0]}</span>}
        </div>

        <div className="field">
          <label htmlFor="password">Senha</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            value={values.password}
            onChange={handleChange}
            required
          />
          {values.password.length > 0 && unmetRules.length > 0 && (
            <span className="hint">Falta: {unmetRules.map((rule) => rule.label).join(', ')}.</span>
          )}
          {fieldErrors?.Password && <span className="error">{fieldErrors.Password[0]}</span>}
        </div>

        <button type="submit" className="btn primary block" disabled={submitting}>
          {submitting ? 'Criando conta…' : 'Criar conta'}
        </button>
      </form>

      <p className="auth-footer muted">
        Já tem conta? <Link to="/login">Entrar</Link>
      </p>
    </AuthLayout>
  )
}
