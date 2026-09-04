import { useTheme } from '../theme/themeContext.js'

const LABELS = {
  light: 'Tema claro',
  dark: 'Tema escuro',
  system: 'Seguindo o sistema',
}

/**
 * Alterna claro e escuro. O toque longo — ou o segundo clique com a tecla Alt —
 * devolve ao automático, que é o estado inicial de quem nunca escolheu.
 */
export default function ThemeToggle() {
  const { theme, resolved, setTheme } = useTheme()

  function handleClick(event) {
    // Alt volta ao automático sem precisar de um terceiro estado no ciclo, que
    // deixaria o botão imprevisível para quem só quer escurecer a tela.
    if (event.altKey) return setTheme('system')
    setTheme(resolved === 'dark' ? 'light' : 'dark')
  }

  return (
    <button
      type="button"
      className="btn small theme-toggle"
      onClick={handleClick}
      title={`${LABELS[theme]} — clique para ${resolved === 'dark' ? 'clarear' : 'escurecer'}, Alt+clique para o automático`}
      aria-label={`${LABELS[theme]}. Alternar tema.`}
    >
      <span className="theme-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
          {/* Sol e lua no mesmo lugar: um encolhe enquanto o outro cresce. */}
          <g className="theme-sun">
            <circle cx="12" cy="12" r="4.2" />
            <path
              strokeLinecap="round"
              d="M12 2.6v2.2M12 19.2v2.2M2.6 12h2.2M19.2 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6"
            />
          </g>
          <path
            className="theme-moon"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20 14.4A8.4 8.4 0 0 1 9.6 4a8.4 8.4 0 1 0 10.4 10.4Z"
          />
        </svg>
      </span>
      <span className="theme-label">{resolved === 'dark' ? 'Escuro' : 'Claro'}</span>
    </button>
  )
}
