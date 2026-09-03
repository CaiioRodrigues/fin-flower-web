import { addMonths, currentCompetence } from '../utils/competence.js'

const PRESETS = [
  { label: '6 meses', months: 6 },
  { label: '12 meses', months: 12 },
  { label: '24 meses', months: 24 },
]

/**
 * O intervalo do fechamento mensal. Os atalhos cobrem o uso comum — "o ano" —
 * e os campos ficam para o recorte específico.
 */
export default function MonthRangePicker({ from, to, onChange, disabled }) {
  function applyPreset(months) {
    const end = currentCompetence()
    onChange({ from: addMonths(end, -(months - 1)), to: end })
  }

  return (
    <div className="range-picker">
      <div className="field">
        <label htmlFor="range-from">De</label>
        <input
          id="range-from"
          type="month"
          className="month-input"
          value={from}
          onChange={(event) => onChange({ from: event.target.value, to })}
          disabled={disabled}
        />
      </div>

      <div className="field">
        <label htmlFor="range-to">Até</label>
        <input
          id="range-to"
          type="month"
          className="month-input"
          value={to}
          onChange={(event) => onChange({ from, to: event.target.value })}
          disabled={disabled}
        />
      </div>

      <div className="range-presets">
        {PRESETS.map((preset) => (
          <button
            key={preset.months}
            type="button"
            className="btn small ghost"
            onClick={() => applyPreset(preset.months)}
            disabled={disabled}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  )
}
