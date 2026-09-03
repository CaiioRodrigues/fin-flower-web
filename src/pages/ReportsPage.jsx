import { useState } from 'react'
import AsyncBoundary from '../components/AsyncBoundary.jsx'
import ExportButtons from '../components/ExportButtons.jsx'
import MonthRangePicker from '../components/MonthRangePicker.jsx'
import { listEvents } from '../api/events.js'
import {
  downloadCashFlow,
  downloadCashReport,
  downloadEventStatement,
  downloadInstallments,
  downloadMonthlyCash,
} from '../api/reports.js'
import { useAsync } from '../hooks/useAsync.js'
import { addMonths, competenceRange, currentCompetence } from '../utils/competence.js'
import { formatDate } from '../utils/format.js'

/**
 * Um lugar só para tirar os relatórios. Antes cada um vivia escondido na tela
 * do assunto — o de caixa nos eventos, o de parcelas no fluxo — e quem precisa
 * mandar um número para o contador não sabia onde procurar.
 */
export default function ReportsPage() {
  const today = currentCompetence()
  const [range, setRange] = useState({ from: addMonths(today, -11), to: today })
  const [monthsAhead, setMonthsAhead] = useState(6)

  const events = useAsync(() => listEvents(), [])

  // O caixa por evento filtra por data, não por competência: converte o
  // intervalo escolhido para o primeiro e o último dia dele.
  const dateRange = {
    from: competenceRange(range.from).from,
    to: competenceRange(range.to).to,
  }

  return (
    <section className="stack">
      <header className="page-head">
        <div>
          <h2>Relatórios</h2>
          <p className="muted">Excel para trabalhar os números, PDF para enviar.</p>
        </div>
      </header>

      <div className="card">
        <h3>Período</h3>
        <p className="muted">Vale para o caixa mês a mês e para o caixa por evento.</p>
        <MonthRangePicker from={range.from} to={range.to} onChange={setRange} />
      </div>

      <div className="columns">
        <article className="card report-card">
          <h3>Caixa mês a mês</h3>
          <p className="muted">
            Entradas, saídas, resultado e saldo acumulado de cada mês, com o previsto dos meses
            futuros e as categorias somadas do período. É o retrato completo do caixa.
          </p>
          <ExportButtons
            label="Baixar"
            onExport={(format) => downloadMonthlyCash(format, range)}
          />
        </article>

        <article className="card report-card">
          <h3>Resultado por evento</h3>
          <p className="muted">
            O resultado de cada evento no período — quais deram lucro e quais não. Soma apenas o
            que foi lançado com evento, então não é o saldo do caixa.
          </p>
          <p className="hint">
            De {formatDate(dateRange.from)} a {formatDate(dateRange.to)}
          </p>
          <ExportButtons
            label="Baixar"
            onExport={(format) => downloadCashReport(format, dateRange)}
          />
        </article>

        <article className="card report-card">
          <h3>Fluxo de caixa</h3>
          <p className="muted">
            O previsto visto pelos contratos: o que está vencido, o que cai neste mês e a projeção
            dos próximos, separando a receber de a pagar.
          </p>

          <div className="field">
            <label htmlFor="months-ahead">Meses à frente</label>
            <select
              id="months-ahead"
              value={monthsAhead}
              onChange={(event) => setMonthsAhead(Number(event.target.value))}
            >
              {[3, 6, 12, 24].map((months) => (
                <option key={months} value={months}>
                  {months} meses
                </option>
              ))}
            </select>
          </div>

          <ExportButtons
            label="Baixar"
            onExport={(format) => downloadCashFlow(format, { monthsAhead })}
          />
        </article>

        <article className="card report-card">
          <h3>Parcelas em aberto</h3>
          <p className="muted">
            Tudo que ainda não foi liquidado, a receber e a pagar, com vencimento e forma de
            pagamento. É a lista de cobrança.
          </p>
          <ExportButtons label="Baixar" onExport={(format) => downloadInstallments(format)} />
        </article>
      </div>

      <article className="card">
        <h3>Extrato de um evento</h3>
        <p className="muted">
          Os lançamentos, contratos e parcelas de um evento específico, com o resultado apurado.
        </p>

        <AsyncBoundary loading={events.loading} error={events.error} onRetry={events.reload}>
          {events.data && events.data.length === 0 ? (
            <p className="muted">Nenhum evento cadastrado.</p>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Evento</th>
                    <th>Data</th>
                    <th className="right">Extrato</th>
                  </tr>
                </thead>
                <tbody>
                  {events.data?.map((event) => (
                    <tr key={event.id}>
                      <td data-label="Evento">{event.name}</td>
                      <td data-label="Data">{formatDate(event.eventDate)}</td>
                      <td data-label="Extrato" className="right">
                        <ExportButtons
                          label=""
                          onExport={(format) => downloadEventStatement(event.id, format, event.name)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </AsyncBoundary>
      </article>
    </section>
  )
}
