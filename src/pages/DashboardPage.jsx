import { useState } from 'react'
import { Link } from 'react-router-dom'
import AsyncBoundary from '../components/AsyncBoundary.jsx'
import CategoryBreakdown from '../components/CategoryBreakdown.jsx'
import ExportButtons from '../components/ExportButtons.jsx'
import MetricCards from '../components/MetricCards.jsx'
import MonthRangePicker from '../components/MonthRangePicker.jsx'
import MonthlyCashTable from '../components/MonthlyCashTable.jsx'
import { getMonthlyCash } from '../api/cash.js'
import { downloadMonthlyCash } from '../api/reports.js'
import { useAsync } from '../hooks/useAsync.js'
import { addMonths, competenceLongLabel, currentCompetence } from '../utils/competence.js'
import { formatCurrency } from '../utils/format.js'

const DEFAULT_MONTHS = 12

/**
 * O caixa completo. É a primeira tela porque é a primeira pergunta de quem
 * abre o sistema: quanto entrou, quanto saiu, e com quanto eu fiquei.
 */
export default function DashboardPage() {
  const today = currentCompetence()
  const [range, setRange] = useState({
    from: addMonths(today, -(DEFAULT_MONTHS - 1)),
    to: today,
  })

  const { data, error, loading, reload } = useAsync(
    () => getMonthlyCash(range),
    [range.from, range.to],
  )

  // O mês corrente quando ele está na janela; senão, o último do intervalo.
  const focused = data?.months.find((month) => month.competence === today) ?? data?.months.at(-1)

  return (
    <section className="stack">
      <header className="page-head">
        <div>
          <h2>Caixa</h2>
          <p className="muted">Entradas e saídas de todo o negócio, mês a mês.</p>
        </div>
        <ExportButtons
          label="Baixar o período"
          onExport={(format) => downloadMonthlyCash(format, range)}
          disabled={loading || Boolean(error)}
        />
      </header>

      <div className="card">
        <MonthRangePicker
          from={range.from}
          to={range.to}
          onChange={setRange}
          disabled={loading}
        />
      </div>

      <AsyncBoundary loading={loading} error={error} onRetry={reload}>
        {data && (
          <>
            <MetricCards
              metrics={[
                { label: 'Saldo em caixa', value: data.closingBalance, tone: 'result',
                  hint: `no fim de ${competenceLongLabel(data.to)}` },
                { label: 'Entradas do período', value: data.totalIncome, tone: 'income' },
                { label: 'Saídas do período', value: data.totalExpense, tone: 'expense' },
                { label: 'Resultado', value: data.result, tone: 'result',
                  hint: `média de ${formatCurrency(data.averageMonthlyResult)} por mês` },
                { label: 'Custos fixos', value: data.totalFixedExpense },
                { label: 'Pró-labore', value: data.totalProLabore },
              ]}
            />

            {data.openingBalance !== 0 && (
              <p className="muted">
                O período começa com {formatCurrency(data.openingBalance)} vindos de antes de{' '}
                {competenceLongLabel(data.from)}.
              </p>
            )}

            <MonthlyCashTable
              months={data.months}
              bestIndex={data.bestMonthIndex}
              worstIndex={data.worstMonthIndex}
            />

            {focused && (
              <>
                <header className="page-head">
                  <div>
                    <h3>Composição de {competenceLongLabel(focused.competence)}</h3>
                    <p className="muted">
                      Onde o dinheiro entrou e saiu no mês.{' '}
                      <Link className="link" to={`/lancamentos?competencia=${focused.competence}`}>
                        Ver os lançamentos
                      </Link>
                    </p>
                  </div>
                </header>

                <div className="columns">
                  <CategoryBreakdown
                    title="Saídas por categoria"
                    categories={focused.expenseByCategory}
                    tone="expense"
                  />
                  <CategoryBreakdown
                    title="Entradas por categoria"
                    categories={focused.incomeByCategory}
                    tone="income"
                  />
                </div>
              </>
            )}
          </>
        )}
      </AsyncBoundary>
    </section>
  )
}
