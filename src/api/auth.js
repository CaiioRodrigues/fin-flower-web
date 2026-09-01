import { api, applySession, request } from './client.js'
import { clearTokens, getRefreshToken } from '../auth/tokenStorage.js'

export async function login(email, password) {
  const session = await request('/api/auth/login', {
    method: 'POST',
    body: { email, password },
    auth: false,
  })

  applySession(session)
  return session
}

export async function register(name, email, password) {
  const session = await request('/api/auth/register', {
    method: 'POST',
    body: { name, email, password },
    auth: false,
  })

  applySession(session)
  return session
}

export async function logout() {
  const refreshToken = getRefreshToken()

  try {
    if (refreshToken) {
      // Revoga no servidor para o token não continuar válido depois do logout.
      await request('/api/auth/logout', {
        method: 'POST',
        body: { refreshToken },
        auth: false,
      })
    }
  } finally {
    clearTokens()
  }
}

export function getCurrentUser() {
  return api.get('/api/auth/me')
}
