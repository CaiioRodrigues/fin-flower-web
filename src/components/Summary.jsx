import { formatCurrency } from '../utils/format.js'

export default function Summary({ income, expense }) {
  const balance = income - expense

  return (
    <section className="summary">
      <div className="card stat">
        <span className="muted">Receitas</span>
        <strong className="income">{formatCurrency(income)}</strong>
      </div>
      <div className="card stat">
        <span className="muted">Despesas</span>
        <strong className="expense">{formatCurrency(expense)}</strong>
      </div>
      <div className="card stat">
        <span className="muted">Saldo</span>
        <strong className={balance < 0 ? 'expense' : 'income'}>
          {formatCurrency(balance)}
        </strong>
      </div>
    </section>
  )
}
