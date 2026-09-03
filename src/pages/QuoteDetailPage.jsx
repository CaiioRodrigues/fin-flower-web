import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import ApproveQuotePanel from '../components/ApproveQuotePanel.jsx'
import AsyncBoundary from '../components/AsyncBoundary.jsx'
import MetricCards from '../components/MetricCards.jsx'
import MoneyInput from '../components/MoneyInput.jsx'
import QuoteForm from '../components/QuoteForm.jsx'
import QuoteItemsEditor from '../components/QuoteItemsEditor.jsx'
import {
  addQuoteItem,
  applyDiscount,
  approveQuote,
  deleteQuote,
  getQuote,
  rejectQuote,
  removeQuoteItem,
  reopenQuote,
  sendQuote,
  updateQuote,
  updateQuoteItem,
} from '../api/quotes.js'
import { listEvents } from '../api/events.js'
import { useAsync } from '../hooks/useAsync.js'
import { formatCurrency, formatDate } from '../utils/format.js'
import { QUOTE_STATUS_LABELS } from '../utils/labels.js'

export default function QuoteDetailPage() {
  const { quoteId } = useParams()
  const navigate = useNavigate()

  const { data: quote, error, loading, reload } = useAsync(() => getQuote(quoteId), [quoteId])
  const events = useAsync(() => listEvents(), [])

  const [editingDetails, setEditingDetails] = useState(false)
  const [discount, setDiscount] = useState('')
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState(null)

  async function run(action) {
    setBusy(true)
    setActionError(null)

    try {
      await action()
      await reload()
      return true
    } catch (caught) {
      setActionError(caught)
      return false
    } finally {
      setBusy(false)
    }
  }

  async function handleApprove(approval) {
    setBusy(true)
    setActionError(null)

    try {
      const approved = await approveQuote(quoteId, approval)
      // Segue para o contrato gerado: é lá que as parcelas são liquidadas.
      navigate(`/contratos/${approved.contractId}`)
    } catch (caught) {
      setActionError(caught)
      setBusy(false)
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Excluir o orçamento ${quote.number}?`)) return

    const ok = await run(() => deleteQuote(quoteId))
    if (ok) navigate('/orcamentos')
  }

  return (
    <section className="stack">
      <nav className="breadcrumb">
        <Link className="link" to="/orcamentos">
          ← Orçamentos
        </Link>
      </nav>

      {actionError && (
        <div className="card status-card" role="alert">
          <p className="expense">{actionError.message}</p>
        </div>
      )}

      <AsyncBoundary loading={loading} error={error} onRetry={reload}>
        {quote && (
          <>
            <header className="page-head">
              <div>
                <h2>
                  {quote.number}
                  <span className={`badge ${quote.status.toLowerCase()}`}>
                    {QUOTE_STATUS_LABELS[quote.status]}
                  </span>
                  {quote.isExpired && <span className="tag bad">vencido</span>}
                </h2>
                <p className="muted">
                  {quote.clientName} · {quote.title} · válido até {formatDate(quote.validUntil)}
                </p>
              </div>

              <div className="header-actions">
                {quote.status === 'Draft' && (
                  <button
                    type="button"
                    className="btn"
                    onClick={() => run(() => sendQuote(quoteId))}
                    disabled={busy || quote.items.length === 0}
                  >
                    Marcar como enviado
                  </button>
                )}
                {quote.isEditable && (
                  <button
                    type="button"
                    className="btn"
                    onClick={() => run(() => rejectQuote(quoteId))}
                    disabled={busy}
                  >
                    Cliente recusou
                  </button>
                )}
                {quote.status === 'Rejected' && (
                  <button
                    type="button"
                    className="btn primary"
                    onClick={() => run(() => reopenQuote(quoteId))}
                    disabled={busy}
                  >
                    Reabrir para renegociar
                  </button>
                )}
                {!quote.contractId && (
                  <button type="button" className="btn danger" onClick={handleDelete} disabled={busy}>
                    Excluir
                  </button>
                )}
              </div>
            </header>

            <MetricCards
              metrics={[
                { label: 'Subtotal', value: quote.subtotal },
                { label: 'Desconto', value: quote.discountAmount },
                { label: 'Total da proposta', value: quote.total, tone: 'income' },
              ]}
            />

            {quote.contractId && (
              <div className="card status-card" role="status">
                <p>
                  Aprovado e convertido em contrato.{' '}
                  <Link className="link" to={`/contratos/${quote.contractId}`}>
                    Ver o contrato e as parcelas
                  </Link>
                </p>
              </div>
            )}

            <QuoteItemsEditor
              items={quote.items}
              readOnly={!quote.isEditable}
              busy={busy}
              onAdd={(item) => run(() => addQuoteItem(quoteId, item))}
              onUpdate={(itemId, item) => run(() => updateQuoteItem(quoteId, itemId, item))}
              onRemove={(itemId) => run(() => removeQuoteItem(quoteId, itemId))}
            />

            {quote.isEditable && (
              <div className="columns">
                <form
                  className="card form"
                  onSubmit={async (event) => {
                    event.preventDefault()
                    const ok = await run(() => applyDiscount(quoteId, Number(discount) || 0))
                    if (ok) setDiscount('')
                  }}
                >
                  <h3>Desconto</h3>
                  <p className="muted">
                    Abatido do subtotal de {formatCurrency(quote.subtotal)}.
                  </p>

                  <div className="field">
                    <label htmlFor="quote-discount">Valor do desconto</label>
                    <MoneyInput
                      id="quote-discount"
                      name="discount"
                      value={discount}
                      onChange={(event) => setDiscount(event.target.value)}
                    />
                  </div>

                  <div className="actions">
                    <button type="submit" className="btn primary" disabled={busy}>
                      Aplicar
                    </button>
                    {quote.discountAmount > 0 && (
                      <button
                        type="button"
                        className="btn ghost"
                        onClick={() => run(() => applyDiscount(quoteId, 0))}
                        disabled={busy}
                      >
                        Remover desconto
                      </button>
                    )}
                  </div>
                </form>

                {quote.items.length > 0 && (
                  <ApproveQuotePanel quote={quote} submitting={busy} onApprove={handleApprove} />
                )}
              </div>
            )}

            {editingDetails ? (
              <QuoteForm
                quote={quote}
                events={events.data ?? []}
                submitting={busy}
                onSubmit={async (values) => {
                  const ok = await run(() => updateQuote(quoteId, values))
                  if (ok) setEditingDetails(false)
                }}
                onCancel={() => setEditingDetails(false)}
              />
            ) : (
              <div className="card">
                <div className="page-head">
                  <h3>Dados da proposta</h3>
                  {quote.isEditable && (
                    <button type="button" className="btn small" onClick={() => setEditingDetails(true)}>
                      Editar
                    </button>
                  )}
                </div>

                <dl className="details">
                  <div>
                    <dt>Cliente</dt>
                    <dd>{quote.clientName}</dd>
                  </div>
                  <div>
                    <dt>Emissão</dt>
                    <dd>{formatDate(quote.issuedOn)}</dd>
                  </div>
                  <div>
                    <dt>Validade</dt>
                    <dd>{formatDate(quote.validUntil)}</dd>
                  </div>
                  <div>
                    <dt>Evento</dt>
                    <dd>
                      {quote.eventId ? (
                        <Link className="link" to={`/eventos/${quote.eventId}`}>
                          {quote.eventName}
                        </Link>
                      ) : (
                        '—'
                      )}
                    </dd>
                  </div>
                </dl>

                {quote.notes && <p className="notes">{quote.notes}</p>}
              </div>
            )}
          </>
        )}
      </AsyncBoundary>
    </section>
  )
}
