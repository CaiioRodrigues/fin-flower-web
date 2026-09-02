import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import AsyncBoundary from '../components/AsyncBoundary.jsx'
import { getCashFlow } from '../api/contracts.js'
import { useAsync } from '../hooks/useAsync.js'
import { DIRECTION_LABELS } from '../utils/labels.js'
import { formatCurrency, formatDate, formatMonth } from '../utils/format.js'

function ScheduleTable({ title, installments, emptyMessage }) {
  return (
    <section className="panel">
      <h3 className="section-title">{title}</h3>

      {installments.length === 0 ? (
        <div className="card empty">
          <p className="muted">{emptyMessage}</p>
        </div>
      ) : (
        <div className="card table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Vencimento</th>
                <th>Contratante</th>
                <th>Evento</th>
                <th>Tipo</th>
                <th className="right">Valor</th>
              </tr>
            </thead>
            <tbody>
              {installments.map((item) => (
                <tr
                  key={`${item.contractId}-${item.number}`}
                  className={item.isOverdue ? 'row-overdue' : undefined}
                >
                  <td data-label="Vencimento">{formatDate(item.dueDate)}</td>
                  <td data-label="Contratante">
                    <Link to={`/contratos/${item.contractId}`} className="link-strong">
                      {item.counterparty}
                    </Link>
                    <span className="muted block">parcela {item.number}</span>
                  </td>
                  <td data-label="Evento">{item.eventName}</td>
                  <td data-label="Tipo">
                    <span className={`badge badge-${item.direction.toLowerCase()}`}>
                      {DIRECTION_LABELS[item.direction]}
                    </span>
                  </td>
                  <td
                    data-label="Valor"
                    className={`right amount ${item.direction === 'Receivable' ? 'income' : 'expense'}`}
                  >
                    {formatCurrency(item.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export default function CashFlowPage() {
  const [monthsAhead, setMonthsAhead] = useState(6)

  const load = useCallback(() => getCashFlow({ monthsAhead }), [monthsAhead])
  const { data: report, loading, error, reload } = useAsync(load, [load])

  return (
    <>
      <div className="page-intro">
        <h2>Fluxo de caixa</h2>
        <p className="muted">
          O que já entrou e saiu, somado ao que está contratado — vencido, neste mês e nos próximos.
        </p>
      </div>

      <AsyncBoundary loading={loading} error={error} onRetry={reload}>
        {report && (
          <>
            <section className="summary summary-cash">
              <div className="card stat">
                <span className="muted">Realizado</span>
                <strong className={report.realizedBalance >= 0 ? 'income' : 'expense'}>
                  {formatCurrency(report.realizedBalance)}
                </strong>
                <span className="muted">saldo dos lançamentos</span>
              </div>

              <div className="card stat">
                <span className="muted">Vencido</span>
                <strong className={report.overdue.receivable > 0 ? 'expense' : undefined}>
                  {formatCurrency(report.overdue.receivable)}
                </strong>
                <span className="muted">
                  a receber
                  {report.overdue.payable > 0 &&
                    ` · ${formatCurrency(report.overdue.payable)} a pagar`}
                </span>
              </div>

              <div className="card stat">
                <span className="muted">
                  Este mês — {formatMonth(report.currentMonth.year, report.currentMonth.month)}
                </span>
                <strong className={report.currentMonth.net >= 0 ? 'income' : 'expense'}>
                  {formatCurrency(report.currentMonth.net)}
                </strong>
                <span className="muted">
                  {formatCurrency(report.currentMonth.receivable)} a receber ·{' '}
                  {formatCurrency(report.currentMonth.payable)} a pagar
                </span>
              </div>

              <div className="card stat">
                <span className="muted">Saldo projetado</span>
                <strong className={report.projectedBalance >= 0 ? 'income' : 'expense'}>
                  {formatCurrency(report.projectedBalance)}
                </strong>
                <span className="muted">realizado + tudo em aberto</span>
              </div>
            </section>

            <section className="panel">
              <div className="section-header">
                <h3 className="section-title">Próximos meses</h3>
                <div className="field">
                  <label htmlFor="monthsAhead">Horizonte</label>
                  <select
                    id="monthsAhead"
                    value={monthsAhead}
                    onChange={(event) => setMonthsAhead(Number(event.target.value))}
                  >
                    <option value={3}>3 meses</option>
                    <option value={6}>6 meses</option>
                    <option value={12}>12 meses</option>
                  </select>
                </div>
              </div>

              <div className="card table-wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Mês</th>
                      <th className="right">A receber</th>
                      <th className="right">A pagar</th>
                      <th className="right">Líquido</th>
                      <th className="right">Parcelas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.upcomingMonths.map((month) => (
                      <tr key={`${month.year}-${month.month}`}>
                        <td data-label="Mês">{formatMonth(month.year, month.month)}</td>
                        <td data-label="A receber" className="right amount income">
                          {formatCurrency(month.receivable)}
                        </td>
                        <td data-label="A pagar" className="right amount expense">
                          {formatCurrency(month.payable)}
                        </td>
                        <td
                          data-label="Líquido"
                          className={`right amount ${month.net >= 0 ? 'income' : 'expense'}`}
                        >
                          {formatCurrency(month.net)}
                        </td>
                        <td data-label="Parcelas" className="right">
                          {month.installmentCount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <ScheduleTable
              title="Vencidas"
              installments={report.overdues}
              emptyMessage="Nenhuma parcela vencida."
            />

            <ScheduleTable
              title="Próximas a vencer"
              installments={report.nextDue}
              emptyMessage="Nenhuma parcela em aberto."
            />
          </>
        )}
      </AsyncBoundary>
    </>
  )
}
