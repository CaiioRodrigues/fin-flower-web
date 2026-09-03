import { useCallback, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AsyncBoundary from '../components/AsyncBoundary.jsx'
import ContractForm from '../components/ContractForm.jsx'
import ContractList from '../components/ContractList.jsx'
import LedgerForm from '../components/LedgerForm.jsx'
import LedgerTable from '../components/LedgerTable.jsx'
import EventForm from '../components/EventForm.jsx'
import ExportButtons from '../components/ExportButtons.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import { closeEvent, deleteEvent, getEvent, reopenEvent, updateEvent } from '../api/events.js'
import { createEntry, deleteEntry, updateEntry } from '../api/entries.js'
import { createContract, listContracts } from '../api/contracts.js'
import { downloadEventStatement } from '../api/reports.js'
import { useAsync } from '../hooks/useAsync.js'
import { formatCurrency, formatDate } from '../utils/format.js'

export default function EventDetailPage() {
  const { eventId } = useParams()
  const navigate = useNavigate()

  const [editingEvent, setEditingEvent] = useState(false)
  const [editingEntry, setEditingEntry] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const load = useCallback(() => getEvent(eventId), [eventId])
  const { data: event, loading, error: loadError, reload } = useAsync(load, [load])

  const loadContracts = useCallback(() => listContracts({ eventId }), [eventId])
  const {
    data: contracts,
    loading: loadingContracts,
    error: contractsError,
    reload: reloadContracts,
  } = useAsync(loadContracts, [loadContracts])

  /**
   * Toda ação recarrega o evento em vez de remendar o estado local: os totais
   * são calculados no servidor, então reler é o que garante que a tela mostre
   * o mesmo número que o caixa.
   */
  const run = useCallback(
    async (action, { after } = {}) => {
      setSubmitting(true)
      setError(null)

      try {
        await action()
        if (after) after()
        else await reload()
      } catch (actionError) {
        setError(actionError)
      } finally {
        setSubmitting(false)
      }
    },
    [reload],
  )

  function handleDeleteEvent() {
    // O evento com lançamentos é recusado pelo servidor: o dinheiro é do caixa,
    // e mover ou excluir cada lançamento é decisão de quem opera.
    if (!window.confirm(`Excluir o evento "${event.name}"?`)) return
    run(() => deleteEvent(eventId), { after: () => navigate('/eventos', { replace: true }) })
  }

  function handleDeleteEntry(entry) {
    if (!window.confirm(`Excluir o lançamento "${entry.description}"?`)) return
    if (editingEntry?.id === entry.id) setEditingEntry(null)
    run(() => deleteEntry(entry.id))
  }

  async function handleSubmitEntry(values) {
    await run(async () => {
      // O lançamento é do caixa; o evento entra como atributo dele.
      if (editingEntry) await updateEntry(editingEntry.id, values)
      else await createEntry(values)
      setEditingEntry(null)
    })
  }

  async function handleSubmitEvent(values) {
    await run(async () => {
      await updateEvent(eventId, values)
      setEditingEvent(false)
    })
  }

  const isClosed = event?.status === 'Closed'

  return (
    <>
      <div className="page-intro">
        <Link to="/eventos" className="back-link">
          ← Voltar para os eventos
        </Link>
      </div>

      <AsyncBoundary loading={loading} error={loadError} onRetry={reload}>
        {event && (
          <>
            <header className="event-header card">
              <div>
                <h2>
                  {event.name} <StatusBadge status={event.status} />
                </h2>
                <p className="muted">
                  {formatDate(event.eventDate)}
                  {event.description ? ` · ${event.description}` : ''}
                </p>
              </div>

              <div className="event-actions">
                <ExportButtons
                  label="Extrato:"
                  disabled={submitting}
                  onExport={(format) => downloadEventStatement(eventId, format, event.name)}
                />
                <button
                  type="button"
                  className="btn small"
                  onClick={() => setEditingEvent((current) => !current)}
                  disabled={submitting || isClosed}
                  title={isClosed ? 'Reabra o evento para editá-lo' : undefined}
                >
                  {editingEvent ? 'Cancelar edição' : 'Editar'}
                </button>

                <button
                  type="button"
                  className="btn small"
                  onClick={() => run(() => (isClosed ? reopenEvent(eventId) : closeEvent(eventId)))}
                  disabled={submitting}
                >
                  {isClosed ? 'Reabrir' : 'Fechar evento'}
                </button>

                <button
                  type="button"
                  className="btn small danger"
                  onClick={handleDeleteEvent}
                  disabled={submitting}
                >
                  Excluir
                </button>
              </div>
            </header>

            <section className="summary summary-event">
              <div className="card stat">
                <span className="muted">Entradas</span>
                <strong className="income">{formatCurrency(event.totalIncome)}</strong>
              </div>
              <div className="card stat">
                <span className="muted">Saídas</span>
                <strong className="expense">{formatCurrency(event.totalExpense)}</strong>
              </div>
              <div className="card stat">
                <span className="muted">Resultado</span>
                <strong className={event.result >= 0 ? 'income' : 'expense'}>
                  {formatCurrency(event.result)}
                </strong>
                <span className="muted">
                  {event.result > 0 ? 'Lucro' : event.result < 0 ? 'Prejuízo' : 'No zero a zero'}
                </span>
              </div>
            </section>

            {error && (
              <div className="alert" role="alert">
                {error.message}
              </div>
            )}

            {editingEvent && (
              <div className="content-single">
                <EventForm
                  event={event}
                  submitting={submitting}
                  onSubmit={handleSubmitEvent}
                  onCancel={() => setEditingEvent(false)}
                />
              </div>
            )}

            <div className="columns wide-first">
              <section className="panel">
                <LedgerTable
                  entries={event.entries}
                  onEdit={isClosed ? undefined : setEditingEntry}
                  onDelete={isClosed ? undefined : handleDeleteEntry}
                />
              </section>

              {isClosed ? (
                <div className="card empty">
                  <p>Evento fechado.</p>
                  <p className="muted">Reabra o evento para incluir ou alterar lançamentos.</p>
                </div>
              ) : (
                <LedgerForm
                  entry={editingEntry}
                  events={[event]}
                  defaults={{ occurredOn: event.eventDate, eventId }}
                  submitting={submitting}
                  onSubmit={handleSubmitEntry}
                  onCancel={() => setEditingEntry(null)}
                />
              )}
            </div>

            <div className="page-intro">
              <h3 className="section-title">Contratos</h3>
              <p className="muted">
                O que foi acordado e ainda vai entrar ou sair. Liquidar uma parcela cria o
                lançamento correspondente acima.
              </p>
            </div>

            <div className="content">
              <ContractForm
                submitting={submitting}
                onSubmit={(values) =>
                  run(async () => {
                    await createContract({ ...values, eventId })
                    await reloadContracts()
                  })
                }
              />

              <section className="panel">
                <AsyncBoundary
                  loading={loadingContracts}
                  error={contractsError}
                  onRetry={reloadContracts}
                >
                  {contracts && <ContractList contracts={contracts} />}
                </AsyncBoundary>
              </section>
            </div>
          </>
        )}
      </AsyncBoundary>
    </>
  )
}
