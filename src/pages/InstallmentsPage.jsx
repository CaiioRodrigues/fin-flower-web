import { Link } from 'react-router-dom'
import AsyncBoundary from '../components/AsyncBoundary.jsx'
import ExportButtons from '../components/ExportButtons.jsx'
import MetricCards from '../components/MetricCards.jsx'
import { getCashFlow } from '../api/contracts.js'
import { downloadInstallments } from '../api/reports.js'
import { useAsync } from '../hooks/useAsync.js'
import { formatCurrency, formatDate } from '../utils/format.js'
import { DIRECTION_LABELS } from '../utils/labels.js'

function ScheduleTable({ title, subtitle, installments, emptyMessage }) {
  return (
    <section className="stack">
      <header className="page-head">
        <div>
          <h3>{title}</h3>
          <p className="muted">{subtitle}</p>
        </div>
      </header>

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
                  <td data-label="Evento">
                    {item.eventName ?? <span className="muted">—</span>}
                  </td>
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

/**
 * A lista de cobrança: quem eu cobro e o que eu pago. A projeção que antes
 * vivia aqui foi para o caixa, onde ela pertence — misturada ao realizado, na
 * mesma linha do tempo. O que sobra é a pergunta operacional, que é outra.
 */
export default function InstallmentsPage() {
  const { data, error, loading, reload } = useAsync(() => getCashFlow({ monthsAhead: 12 }), [])

  return (
    <section className="stack">
      <header className="page-head">
        <div>
          <h2>Parcelas</h2>
          <p className="muted">
            O que está em aberto, a receber e a pagar.{' '}
            <Link className="link" to="/">
              A projeção no caixa
            </Link>{' '}
            mostra como isso muda o saldo mês a mês.
          </p>
        </div>
        <ExportButtons label="Baixar" onExport={(format) => downloadInstallments(format)} />
      </header>

      <AsyncBoundary loading={loading} error={error} onRetry={reload}>
        {data && (
          <>
            <MetricCards
              metrics={[
                { label: 'Vencido a receber', value: data.overdue.receivable, tone: 'expense',
                  hint: `${data.overdue.installmentCount} parcela(s) em atraso` },
                { label: 'Vencido a pagar', value: data.overdue.payable, tone: 'expense' },
                { label: 'Total a receber', value: data.totalReceivable, tone: 'income' },
                { label: 'Total a pagar', value: data.totalPayable, tone: 'expense' },
              ]}
            />

            <ScheduleTable
              title="Vencidas"
              subtitle="Passou do vencimento e não foi liquidada. É a fila de cobrança."
              installments={data.overdues}
              emptyMessage="Nada vencido. Tudo em dia."
            />

            <ScheduleTable
              title="A vencer"
              subtitle="As próximas parcelas, na ordem em que vencem."
              installments={data.nextDue}
              emptyMessage="Nenhuma parcela em aberto."
            />
          </>
        )}
      </AsyncBoundary>
    </section>
  )
}
