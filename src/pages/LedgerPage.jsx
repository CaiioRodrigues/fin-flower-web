import { useCallback, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import AsyncBoundary from '../components/AsyncBoundary.jsx'
import LedgerFilters from '../components/LedgerFilters.jsx'
import LedgerForm from '../components/LedgerForm.jsx'
import LedgerTable from '../components/LedgerTable.jsx'
import MetricCards from '../components/MetricCards.jsx'
import {
  createEntry,
  deleteEntry,
  listCategories,
  listEntries,
  updateEntry,
} from '../api/entries.js'
import { listEvents } from '../api/events.js'
import { useAsync } from '../hooks/useAsync.js'
import {
  competenceLongLabel,
  competenceRange,
  currentCompetence,
  isCompetence,
} from '../utils/competence.js'

const PAGE_SIZE = 50

/** O escopo de evento é um campo só na tela, mas dois filtros na API. */
function eventParams(scope) {
  if (scope === 'none') return { withoutEvent: true }
  if (scope === 'any') return { withoutEvent: false }
  return scope ? { eventId: scope } : {}
}

export default function LedgerPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  // A competência vem da URL para o link do painel mensal cair no mês certo.
  const fromUrl = searchParams.get('competencia')
  const [filters, setFilters] = useState(() => ({
    competence: isCompetence(fromUrl) ? fromUrl : currentCompetence(),
    type: '',
    source: '',
    eventScope: searchParams.get('evento') ?? '',
    category: '',
    search: '',
  }))

  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [busyId, setBusyId] = useState(null)
  const [actionError, setActionError] = useState(null)

  const range = useMemo(() => competenceRange(filters.competence), [filters.competence])

  const ledger = useAsync(
    () =>
      listEntries({
        ...range,
        type: filters.type,
        source: filters.source,
        ...eventParams(filters.eventScope),
        category: filters.category,
        search: filters.search,
        page,
        pageSize: PAGE_SIZE,
      }),
    [
      range.from,
      range.to,
      filters.type,
      filters.source,
      filters.eventScope,
      filters.category,
      filters.search,
      page,
    ],
  )

  const events = useAsync(() => listEvents(), [])
  const categories = useAsync(() => listCategories(), [])

  const handleFilters = useCallback(
    (next) => {
      setFilters(next)
      setPage(1)

      // A competência fica na URL: recarregar a página não perde o mês.
      setSearchParams(
        next.competence === currentCompetence() ? {} : { competencia: next.competence },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  async function handleSubmit(entry) {
    setSubmitting(true)
    setActionError(null)

    try {
      if (editing) await updateEntry(editing.id, entry)
      else await createEntry(entry)

      setEditing(null)
      await Promise.all([ledger.reload(), categories.reload()])
    } catch (error) {
      setActionError(error)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(entry) {
    if (!window.confirm(`Excluir "${entry.description}"?`)) return

    setBusyId(entry.id)
    setActionError(null)

    try {
      await deleteEntry(entry.id)
      if (editing?.id === entry.id) setEditing(null)
      await ledger.reload()
    } catch (error) {
      setActionError(error)
    } finally {
      setBusyId(null)
    }
  }

  const data = ledger.data
  const pageCount = data ? Math.max(1, Math.ceil(data.totalCount / data.pageSize)) : 1

  return (
    <section className="stack">
      <header className="page-head">
        <div>
          <h2>Lançamentos</h2>
          <p className="muted">
            Tudo que entrou e saiu em {competenceLongLabel(filters.competence)}.
          </p>
        </div>
      </header>

      <LedgerFilters
        filters={filters}
        events={events.data ?? []}
        categories={categories.data ?? []}
        onChange={handleFilters}
        disabled={ledger.loading}
      />

      {data && (
        <MetricCards
          metrics={[
            { label: 'Entradas', value: data.totalIncome, tone: 'income' },
            { label: 'Saídas', value: data.totalExpense, tone: 'expense' },
            { label: 'Resultado', value: data.result, tone: 'result' },
            {
              label: 'Lançamentos',
              value: data.totalCount,
              text: String(data.totalCount),
            },
          ]}
        />
      )}

      <div className="columns wide-first">
        <div className="stack">
          {actionError && (
            <div className="card status-card" role="alert">
              <p className="expense">{actionError.message}</p>
            </div>
          )}

          <AsyncBoundary loading={ledger.loading} error={ledger.error} onRetry={ledger.reload}>
            {data && (
              <>
                <LedgerTable
                  entries={data.entries}
                  onEdit={setEditing}
                  onDelete={handleDelete}
                  busyId={busyId}
                />

                {pageCount > 1 && (
                  <div className="pager">
                    <button
                      type="button"
                      className="btn small"
                      onClick={() => setPage((current) => Math.max(1, current - 1))}
                      disabled={page <= 1}
                    >
                      Anterior
                    </button>
                    <span className="muted">
                      Página {data.page} de {pageCount}
                    </span>
                    <button
                      type="button"
                      className="btn small"
                      onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
                      disabled={page >= pageCount}
                    >
                      Próxima
                    </button>
                  </div>
                )}
              </>
            )}
          </AsyncBoundary>
        </div>

        <LedgerForm
          entry={editing}
          events={events.data ?? []}
          categories={categories.data ?? []}
          defaults={{ occurredOn: range.from }}
          submitting={submitting}
          onSubmit={handleSubmit}
          onCancel={() => setEditing(null)}
        />
      </div>
    </section>
  )
}
