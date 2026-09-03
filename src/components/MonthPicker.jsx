import { addMonths, competenceLongLabel, currentCompetence } from '../utils/competence.js'

/**
 * Seletor de competência. As setas são o gesto real de quem opera o caixa —
 * "mês passado", "próximo mês" — e o campo nativo de mês fica para o salto
 * longo, sem o transbordo que datas completas causavam no celular.
 */
export default function MonthPicker({ value, onChange, label = 'Mês', disabled }) {
  const today = currentCompetence()

  return (
    <div className="month-picker">
      <button
        type="button"
        className="btn icon"
        onClick={() => onChange(addMonths(value, -1))}
        disabled={disabled}
        aria-label="Mês anterior"
      >
        ‹
      </button>

      <div className="month-picker-center">
        <label className="sr-only" htmlFor="competence">
          {label}
        </label>
        <input
          id="competence"
          type="month"
          className="month-input"
          value={value}
          onChange={(event) => event.target.value && onChange(event.target.value)}
          disabled={disabled}
        />
        <span className="month-picker-label">{competenceLongLabel(value)}</span>
      </div>

      <button
        type="button"
        className="btn icon"
        onClick={() => onChange(addMonths(value, 1))}
        disabled={disabled}
        aria-label="Próximo mês"
      >
        ›
      </button>

      {value !== today && (
        <button type="button" className="btn small ghost" onClick={() => onChange(today)}>
          Hoje
        </button>
      )}
    </div>
  )
}
