import { useState } from 'react'
import AsyncBoundary from '../components/AsyncBoundary.jsx'
import MetricCards from '../components/MetricCards.jsx'
import MonthPicker from '../components/MonthPicker.jsx'
import RecurringForm from '../components/RecurringForm.jsx'
import RecurringList from '../components/RecurringList.jsx'
import {
  createRecurringItem,
  deleteRecurringItem,
  generateMonth,
  listRecurringItems,
  setRecurringItemActive,
  updateRecurringItem,
} from '../api/recurring.js'
import { useAsync } from '../hooks/useAsync.js'
import { competenceLongLabel, currentCompetence } from '../utils/competence.js'
import { formatCurrency } from '../utils/format.js'

/**
 * Gastos fixos e pró-labore usam a mesma tela, separadas por `kind`. São a
 * mesma mecânica — um valor que se repete todo mês — mas quem opera olha para
 * elas em momentos diferentes, e pró-labore não é custo do negócio.
 */
export default function RecurringPage({ kind, title, subtitle, kindLabel }) {
  const [competence, setCompetence] = useState(currentCompetence)
  const [editing, setEditing] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [busyId, setBusyId] = useState(null)
  const [actionError, setActionError] = useState(null)
  const [notice, setNotice] = useState(null)

  const { data, error, loading, reload } = useAsync(
    () => listRecurringItems({ kind, competence }),
    [kind, competence],
  )

  async function run(action) {
    setActionError(null)
    setNotice(null)

    try {
      await action()
      await reload()
      return true
    } catch (caught) {
      setActionError(caught)
      return false
    }
  }

  async function handleSubmit(item) {
    setSubmitting(true)
    const ok = await run(() => (editing ? updateRecurringItem(editing.id, item) : createRecurringItem(item)))
    if (ok) setEditing(null)
    setSubmitting(false)
  }

  async function handleToggle(item) {
    setBusyId(item.id)
    await run(() => setRecurringItemActive(item.id, !item.isActive))
    setBusyId(null)
  }

  async function handleDelete(item) {
    if (!window.confirm(`Excluir "${item.description}"? Os meses já lançados continuam no caixa.`)) {
      return
    }

    setBusyId(item.id)
    const ok = await run(() => deleteRecurringItem(item.id))
    if (ok && editing?.id === item.id) setEditing(null)
    setBusyId(null)
  }

  async function handleGenerate(itemIds) {
    setBusyId(itemIds?.[0] ?? 'all')

    await run(async () => {
      const result = await generateMonth(competence, itemIds)

      setNotice(
        result.generated === 0
          ? 'Nada a lançar: tudo deste mês já está no caixa.'
          : `${result.generated} lançamento(s) no caixa, somando ${formatCurrency(result.generatedAmount)}.`,
      )
    })

    setBusyId(null)
  }

  const pending = data?.pendingCount ?? 0

  return (
    <section className="stack">
      <header className="page-head">
        <div>
          <h2>{title}</h2>
          <p className="muted">{subtitle}</p>
        </div>
      </header>

      <div className="card filters">
        <MonthPicker value={competence} onChange={setCompetence} disabled={loading} />

        <button
          type="button"
          className="btn primary"
          onClick={() => handleGenerate(null)}
          disabled={loading || pending === 0 || busyId !== null}
        >
          {/* Enquanto carrega, pendingCount ainda é zero: dizer "mês já lançado"
              aí seria uma afirmação falsa sobre o caixa. */}
          {loading
            ? 'Carregando…'
            : pending === 0
              ? 'Mês já lançado'
              : `Lançar ${pending} item(ns) de ${competenceLongLabel(competence)}`}
        </button>
      </div>

      {notice && (
        <div className="card status-card" role="status">
          <p>{notice}</p>
        </div>
      )}

      {actionError && (
        <div className="card status-card" role="alert">
          <p className="expense">{actionError.message}</p>
        </div>
      )}

      <AsyncBoundary loading={loading} error={error} onRetry={reload}>
        {data && (
          <>
            <MetricCards
              metrics={[
                {
                  label: kind === 'ProLabore' ? 'Retirada do mês' : 'Previsto no mês',
                  value: kind === 'ProLabore' ? data.totalProLabore : data.totalFixedExpense,
                  tone: 'expense',
                },
                { label: 'Ainda não lançado', value: data.pendingAmount },
                {
                  label: 'Itens pendentes',
                  value: data.pendingCount,
                  text: String(data.pendingCount),
                },
              ]}
            />

            <div className="columns wide-first">
              <RecurringList
                items={data.items}
                onEdit={setEditing}
                onToggle={handleToggle}
                onDelete={handleDelete}
                onGenerateOne={(item) => handleGenerate([item.id])}
                busyId={busyId}
              />

              <RecurringForm
                item={editing}
                kind={kind}
                kindLabel={kindLabel}
                submitting={submitting}
                onSubmit={handleSubmit}
                onCancel={() => setEditing(null)}
              />
            </div>
          </>
        )}
      </AsyncBoundary>
    </section>
  )
}
