import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AsyncBoundary from '../components/AsyncBoundary.jsx'
import QuoteForm from '../components/QuoteForm.jsx'
import { createQuote, listQuotes } from '../api/quotes.js'
import { listEvents } from '../api/events.js'
import { useAsync } from '../hooks/useAsync.js'
import { formatCurrency, formatDate } from '../utils/format.js'
import { QUOTE_STATUS_LABELS } from '../utils/labels.js'

export default function QuotesPage() {
  const navigate = useNavigate()
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')
  const [creating, setCreating] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [actionError, setActionError] = useState(null)

  const { data, error, loading, reload } = useAsync(
    () => listQuotes({ status, search }),
    [status, search],
  )

  const events = useAsync(() => listEvents(), [])

  async function handleCreate(quote) {
    setSubmitting(true)
    setActionError(null)

    try {
      const created = await createQuote(quote)
      // Vai direto para o montador: criar sem itens não serve para nada.
      navigate(`/orcamentos/${created.id}`)
    } catch (caught) {
      setActionError(caught)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="stack">
      <header className="page-head">
        <div>
          <h2>Orçamentos</h2>
          <p className="muted">Monte a proposta linha a linha. Aprovada, ela vira contrato.</p>
        </div>
        <button
          type="button"
          className="btn primary"
          onClick={() => setCreating((current) => !current)}
        >
          {creating ? 'Fechar' : 'Novo orçamento'}
        </button>
      </header>

      {actionError && (
        <div className="card status-card" role="alert">
          <p className="expense">{actionError.message}</p>
        </div>
      )}

      {creating && (
        <QuoteForm
          events={events.data ?? []}
          submitting={submitting}
          onSubmit={handleCreate}
          onCancel={() => setCreating(false)}
        />
      )}

      <div className="card filters">
        <div className="filter-row">
          <div className="field">
            <label htmlFor="quote-status">Situação</label>
            <select
              id="quote-status"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="">Todas</option>
              {Object.entries(QUOTE_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="field grow">
            <label htmlFor="quote-search">Buscar</label>
            <input
              id="quote-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Número, cliente ou título"
            />
          </div>
        </div>
      </div>

      <AsyncBoundary loading={loading} error={error} onRetry={reload}>
        {data && data.length === 0 ? (
          <div className="card empty">
            <p>Nenhum orçamento encontrado.</p>
            <p className="muted">Crie uma proposta para começar.</p>
          </div>
        ) : (
          <div className="card table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Número</th>
                  <th>Cliente</th>
                  <th>Proposta</th>
                  <th>Validade</th>
                  <th>Situação</th>
                  <th className="right">Total</th>
                </tr>
              </thead>
              <tbody>
                {data?.map((quote) => (
                  <tr key={quote.id}>
                    <td data-label="Número">
                      <Link className="link" to={`/orcamentos/${quote.id}`}>
                        {quote.number}
                      </Link>
                    </td>
                    <td data-label="Cliente">{quote.clientName}</td>
                    <td data-label="Proposta">
                      {quote.title}
                      {quote.eventName && <span className="tag">{quote.eventName}</span>}
                    </td>
                    <td data-label="Validade">
                      {formatDate(quote.validUntil)}
                      {quote.isExpired && <span className="tag bad">vencido</span>}
                    </td>
                    <td data-label="Situação">
                      <span className={`badge ${quote.status.toLowerCase()}`}>
                        {QUOTE_STATUS_LABELS[quote.status]}
                      </span>
                    </td>
                    <td data-label="Total" className="right amount strong">
                      {formatCurrency(quote.total)}
                      <span className="muted small-text"> · {quote.itemCount} item(ns)</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AsyncBoundary>
    </section>
  )
}
