import { formatCurrency } from '../utils/format.js'

/**
 * Onde o dinheiro foi parar, no mês escolhido. A barra é proporcional à maior
 * categoria — comparar entre si é a pergunta real, não o percentual absoluto.
 */
export default function CategoryBreakdown({ title, categories, tone }) {
  if (categories.length === 0) {
    return (
      <div className="card">
        <h3>{title}</h3>
        <p className="muted">Nada neste mês.</p>
      </div>
    )
  }

  const biggest = Math.max(...categories.map((category) => Number(category.amount)))

  return (
    <div className="card">
      <h3>{title}</h3>
      <ul className="breakdown">
        {categories.map((category) => (
          <li key={category.category}>
            <div className="breakdown-head">
              <span>{category.category}</span>
              <strong className={`amount ${tone}`}>{formatCurrency(category.amount)}</strong>
            </div>
            <div className="breakdown-bar">
              <span
                className={tone}
                style={{ width: `${biggest > 0 ? (Number(category.amount) / biggest) * 100 : 0}%` }}
              />
            </div>
            <span className="muted small-text">
              {category.count} {category.count === 1 ? 'lançamento' : 'lançamentos'}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
