import { formatCurrency } from '../utils/format.js'

/**
 * Resultado dos eventos — e não "caixa". Este painel soma apenas o que está
 * preso a um evento, e desde que o lançamento saiu de dentro do evento a maior
 * parte do custo do mês (aluguel, contador, pró-labore) ficou de fora. Chamar
 * de saldo daria um número que discorda do caixa mensal: errado com cara de certo.
 */
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
        <span className="muted">Resultado dos eventos</span>
        <strong className={balancePositive ? 'income' : 'expense'}>
          {formatCurrency(report.balance)}
        </strong>
        <span className="muted small-text">não é o saldo do caixa</span>
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
