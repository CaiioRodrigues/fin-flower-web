import { useState } from 'react'
import { Link } from 'react-router-dom'
import AsyncBoundary from '../components/AsyncBoundary.jsx'
import CashOpeningCard from '../components/CashOpeningCard.jsx'
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

const MONTHS_BACK = 5
const MONTHS_AHEAD = 6

/**
 * O caixa completo, numa linha do tempo só: o que já se moveu e o que está
 * previsto. É a primeira tela porque é a primeira pergunta de quem abre o
 * sistema — quanto entrou, quanto saiu, com quanto eu fiquei e o que vem aí.
 *
 * A janela nasce centrada no mês corrente pelo mesmo motivo: um caixa serve
 * tanto para ver de onde se veio quanto para saber se dá para pagar as contas
 * do trimestre.
 */
export default function DashboardPage() {
  const today = currentCompetence()
  const [range, setRange] = useState({
    from: addMonths(today, -MONTHS_BACK),
    to: addMonths(today, MONTHS_AHEAD),
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
          <p className="muted">
            Entradas e saídas de todo o negócio, mês a mês — o que já aconteceu e o que está previsto.
          </p>
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
                  hint: 'o que de fato se moveu' },
                { label: 'Saldo projetado', value: data.projectedBalance, tone: 'result',
                  hint: `se tudo previsto acontecer até ${competenceLongLabel(data.to)}` },
                { label: 'Entradas do período', value: data.totalIncome, tone: 'income' },
                { label: 'Saídas do período', value: data.totalExpense, tone: 'expense' },
                { label: 'Resultado', value: data.result, tone: 'result',
                  hint: `média de ${formatCurrency(data.averageMonthlyResult)} por mês` },
                { label: 'Custos fixos', value: data.totalFixedExpense },
                { label: 'Pró-labore', value: data.totalProLabore },
                { label: 'A entrar previsto', value: data.totalExpectedIncome, tone: 'income' },
              ]}
            />

            <CashOpeningCard opening={data.opening} onChange={reload} />

            {(data.overdueReceivable > 0 || data.overduePayable > 0) && (
              <div className="card status-card" role="status">
                <p>
                  <strong>Vencido e não liquidado:</strong>{' '}
                  <span className="amount income">{formatCurrency(data.overdueReceivable)}</span> a
                  receber e{' '}
                  <span className="amount expense">{formatCurrency(data.overduePayable)}</span> a
                  pagar. Não entra na projeção — é dívida de agora, não previsão de mês nenhum.{' '}
                  <Link className="link" to="/parcelas">
                    Ver as parcelas
                  </Link>
                </p>
              </div>
            )}

            <p className="muted">
              {data.openingBalance !== 0 && (
                <>
                  O período começa com {formatCurrency(data.openingBalance)} vindos de antes de{' '}
                  {competenceLongLabel(data.from)}.{' '}
                </>
              )}
              A projeção conta só o que já está comprometido — parcelas de contratos assinados e
              itens fixos. Trabalho que você ainda vai vender não aparece nela.
            </p>

            <MonthlyCashTable
              months={data.months}
              bestIndex={data.bestMonthIndex}
              worstIndex={data.worstMonthIndex}
              openingOn={data.opening?.occurredOn}
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
