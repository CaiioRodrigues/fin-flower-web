import { useCallback, useEffect, useMemo, useState } from 'react'
import * as authApi from '../api/auth.js'
import { refreshSession, setSessionExpiredHandler } from '../api/client.js'
import { AuthContext } from './authContext.js'
import { getRefreshToken } from './tokenStorage.js'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  // 'loading' enquanto tentamos restaurar a sessão: sem isso a guarda de rota
  // mandaria o usuário para o login antes de saber que ele já está autenticado.
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    let cancelled = false

    async function restore() {
      // O access token vive só em memória, então depois de um F5 ele não existe:
      // a sessão é reconstruída a partir do refresh token.
      if (!getRefreshToken()) {
        if (!cancelled) setStatus('anonymous')
        return
      }

      try {
        const session = await refreshSession()
        if (!cancelled) {
          setUser(session.user)
          setStatus('authenticated')
        }
      } catch {
        if (!cancelled) {
          setUser(null)
          setStatus('anonymous')
        }
      }
    }

    restore()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    // Quando a renovação falha no meio de uma chamada qualquer, a aplicação
    // inteira precisa voltar ao estado anônimo.
    setSessionExpiredHandler(() => {
      setUser(null)
      setStatus('anonymous')
    })

    return () => setSessionExpiredHandler(() => {})
  }, [])

  const signIn = useCallback(async (email, password) => {
    const session = await authApi.login(email, password)
    setUser(session.user)
    setStatus('authenticated')
    return session.user
  }, [])

  const signUp = useCallback(async (name, email, password) => {
    const session = await authApi.register(name, email, password)
    setUser(session.user)
    setStatus('authenticated')
    return session.user
  }, [])

  const signOut = useCallback(async () => {
    await authApi.logout()
    setUser(null)
    setStatus('anonymous')
  }, [])

  const value = useMemo(
    () => ({
      user,
      status,
      isAuthenticated: status === 'authenticated',
      isLoading: status === 'loading',
      signIn,
      signUp,
      signOut,
    }),
    [user, status, signIn, signUp, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
