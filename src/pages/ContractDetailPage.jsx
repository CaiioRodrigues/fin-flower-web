import { useCallback, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AsyncBoundary from '../components/AsyncBoundary.jsx'
import DocumentPanel from '../components/DocumentPanel.jsx'
import InstallmentList from '../components/InstallmentList.jsx'
import {
  cancelInstallment,
  deleteContract,
  getContract,
  openDocument,
  removeDocument,
  settleInstallment,
  unsettleInstallment,
  uploadDocument,
} from '../api/contracts.js'
import { useAsync } from '../hooks/useAsync.js'
import { DIRECTION_LABELS, PAYMENT_METHOD_LABELS, settlementLabel } from '../utils/labels.js'
import { formatCurrency, formatDate } from '../utils/format.js'

export default function ContractDetailPage() {
  const { contractId } = useParams()
  const navigate = useNavigate()

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const load = useCallback(() => getContract(contractId), [contractId])
  const { data: contract, loading, error: loadError, reload } = useAsync(load, [load])

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

  function handleDelete() {
    if (!window.confirm(`Excluir o contrato de "${contract.counterparty}"?`)) return
    run(() => deleteContract(contractId), {
      after: () => navigate(`/eventos/${contract.eventId}`, { replace: true }),
    })
  }

  function handleUnsettle(installment) {
    const confirmed = window.confirm(
      `Estornar a parcela ${installment.number}? O lançamento criado no evento será removido.`,
    )
    if (!confirmed) return
    run(() => unsettleInstallment(contractId, installment.number))
  }

  function handleCancelInstallment(installment) {
    if (!window.confirm(`Cancelar a parcela ${installment.number}?`)) return
    run(() => cancelInstallment(contractId, installment.number))
  }

  return (
    <>
      <div className="page-intro">
        {contract && (
          // O contrato pode não pertencer a evento nenhum: nesse caso o caminho
          // de volta é a lista de contratos em aberto.
          <Link
            to={contract.eventId ? `/eventos/${contract.eventId}` : '/fluxo-de-caixa'}
            className="back-link"
          >
            {contract.eventId ? '← Voltar para o evento' : '← Voltar para o fluxo de caixa'}
          </Link>
        )}
      </div>

      <AsyncBoundary loading={loading} error={loadError} onRetry={reload}>
        {contract && (
          <>
            <header className="event-header card">
              <div>
                <h2>
                  {contract.counterparty}{' '}
                  <span className={`badge badge-${contract.direction.toLowerCase()}`}>
                    {DIRECTION_LABELS[contract.direction]}
                  </span>
                </h2>
                <p className="muted">
                  {formatCurrency(contract.totalAmount)} em {contract.installments.length}x ·{' '}
                  {PAYMENT_METHOD_LABELS[contract.paymentMethod]} · assinado em{' '}
                  {formatDate(contract.signedOn)}
                  {contract.description ? ` · ${contract.description}` : ''}
                  {contract.quoteId ? ` · do orçamento ${contract.quoteNumber}` : ''}
                </p>
              </div>

              <div className="event-actions">
                <button
                  type="button"
                  className="btn small danger"
                  onClick={handleDelete}
                  disabled={submitting}
                >
                  Excluir contrato
                </button>
              </div>
            </header>

            <section className="summary summary-event">
              <div className="card stat">
                <span className="muted">{settlementLabel(contract.direction)}</span>
                <strong className="income">{formatCurrency(contract.settledAmount)}</strong>
              </div>
              <div className="card stat">
                <span className="muted">Em aberto</span>
                <strong>{formatCurrency(contract.openAmount)}</strong>
              </div>
              <div className="card stat">
                <span className="muted">Vencido</span>
                <strong className={contract.overdueAmount > 0 ? 'expense' : undefined}>
                  {formatCurrency(contract.overdueAmount)}
                </strong>
              </div>
            </section>

            {error && (
              <div className="alert" role="alert">
                {error.message}
              </div>
            )}

            <div className="content">
              <DocumentPanel
                attachment={contract.attachment}
                submitting={submitting}
                onUpload={(file) => run(() => uploadDocument(contractId, file))}
                onOpen={() => run(() => openDocument(contractId), { after: () => {} })}
                onRemove={() => run(() => removeDocument(contractId))}
              />

              <section className="panel">
                <InstallmentList
                  installments={contract.installments}
                  direction={contract.direction}
                  submitting={submitting}
                  onSettle={(installment, settlement) =>
                    run(() => settleInstallment(contractId, installment.number, settlement))
                  }
                  onUnsettle={handleUnsettle}
                  onCancel={handleCancelInstallment}
                />
              </section>
            </div>
          </>
        )}
      </AsyncBoundary>
    </>
  )
}
