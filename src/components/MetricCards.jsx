import { formatCurrency } from '../utils/format.js'

/**
 * A faixa de números do topo. `tone` colore só o que tem sentido financeiro —
 * entrada verde, saída vermelha, resultado conforme o sinal — para a cor
 * significar alguma coisa em vez de enfeitar.
 */
export default function MetricCards({ metrics }) {
  return (
    <div className="metrics">
      {metrics.map((metric) => (
        <div key={metric.label} className={`metric ${toneClass(metric)}`}>
          <span className="metric-label">{metric.label}</span>
          <strong className="metric-value">
            {metric.text ?? formatCurrency(metric.value)}
          </strong>
          {metric.hint && <span className="metric-hint">{metric.hint}</span>}
        </div>
      ))}
    </div>
  )
}

function toneClass(metric) {
  if (metric.tone === 'income') return 'income'
  if (metric.tone === 'expense') return 'expense'

  // 'result' pinta pelo sinal: o mesmo campo é lucro ou prejuízo.
  if (metric.tone === 'result') return Number(metric.value) < 0 ? 'expense' : 'income'

  return ''
}
