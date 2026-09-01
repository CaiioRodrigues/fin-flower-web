import { formatCurrency } from '../utils/format.js'

/** Painel do caixa: quanto entrou, quanto saiu, o saldo e como os eventos foram. */
export default function CashSummary({ report }) {
  const balancePositive = report.balance >= 0

  return (
    <section className="summary summary-cash">
      <div className="card stat">
        <span className="muted">Entradas</span>
        <strong className="income">{formatCurrency(report.totalIncome)}</strong>
      </div>

      <div className="card stat">
        <span className="muted">Saídas</span>
        <strong className="expense">{formatCurrency(report.totalExpense)}</strong>
      </div>

      <div className="card stat">
        <span className="muted">Caixa</span>
        <strong className={balancePositive ? 'income' : 'expense'}>
          {formatCurrency(report.balance)}
        </strong>
      </div>

      <div className="card stat">
        <span className="muted">
          {report.eventCount} {report.eventCount === 1 ? 'evento' : 'eventos'}
        </span>
        <span className="stat-breakdown">
          <span className="income">{report.profitableEventCount} com lucro</span>
          {' · '}
          <span className="expense">{report.unprofitableEventCount} com prejuízo</span>
          {report.breakEvenEventCount > 0 && (
            <>
              {' · '}
              <span className="muted">{report.breakEvenEventCount} no zero</span>
            </>
          )}
        </span>
      </div>
    </section>
  )
}
