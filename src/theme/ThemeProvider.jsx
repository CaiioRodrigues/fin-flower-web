import { useCallback, useEffect, useMemo, useState } from 'react'
import { ThemeContext } from './themeContext.js'

const STORAGE_KEY = 'finflower.theme'
const DARK_QUERY = '(prefers-color-scheme: dark)'

/** Lê a escolha guardada. Navegador com armazenamento bloqueado cai em 'system'. */
function storedTheme() {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY)
    return value === 'light' || value === 'dark' ? value : 'system'
  } catch {
    return 'system'
  }
}

function systemPrefersDark() {
  return typeof window.matchMedia === 'function' && window.matchMedia(DARK_QUERY).matches
}

/**
 * Três estados, não dois: claro, escuro e "seguir o sistema". Sem o terceiro
 * não haveria como voltar atrás — a primeira vez que alguém tocasse no botão,
 * a preferência do sistema estaria descartada para sempre.
 */
export default function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(storedTheme)
  const [systemDark, setSystemDark] = useState(systemPrefersDark)

  // Acompanha o sistema enquanto a escolha for 'system': quem deixa no
  // automático espera que o app escureça junto com o resto do computador.
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return undefined

    const query = window.matchMedia(DARK_QUERY)
    const listen = (event) => setSystemDark(event.matches)

    query.addEventListener('change', listen)
    return () => query.removeEventListener('change', listen)
  }, [])

  const resolved = theme === 'system' ? (systemDark ? 'dark' : 'light') : theme

  useEffect(() => {
    const root = document.documentElement

    // Sem atributo quando é 'system': aí quem manda é o @media do CSS, e não
    // precisamos duplicar a decisão em dois lugares.
    if (theme === 'system') root.removeAttribute('data-theme')
    else root.setAttribute('data-theme', theme)

    try {
      if (theme === 'system') window.localStorage.removeItem(STORAGE_KEY)
      else window.localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      // Armazenamento indisponível: o tema vale para esta aba e pronto.
    }
  }, [theme])

  const setTheme = useCallback((next) => setThemeState(next), [])

  const value = useMemo(() => ({ theme, resolved, setTheme }), [theme, resolved, setTheme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
