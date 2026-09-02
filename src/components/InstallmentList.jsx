import { Fragment, useState } from 'react'
import MoneyInput from './MoneyInput.jsx'
import { INSTALLMENT_STATUS_LABELS, settleVerb, settlementLabel } from '../utils/labels.js'
import { formatCurrency, formatDate } from '../utils/format.js'

/**
 * Formulário de liquidação, aberto na própria linha. Vem preenchido com o valor
 * e o vencimento da parcela — o caso comum é pagar o combinado — e permite
 * ajustar quando houve desconto, juros ou data diferente.
 */
function SettleRow({ installment, submitting, onConfirm, onCancel }) {
  const [values, setValues] = useState({
    settledOn: installment.dueDate,
    amount: String(installment.amount),
    category: 'Contratos',
  })

  function handleChange(event) {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
  }

  return (
    <tr className="settle-row">
      <td colSpan={6}>
        <form
          className="settle-form"
          onSubmit={(event) => {
            event.preventDefault()
            onConfirm({
              settledOn: values.settledOn,
              amount: Number(values.amount),
              category: values.category.trim() || null,
            })
          }}
        >
          <div className="field">
            <label htmlFor={`settled-on-${installment.number}`}>Data</label>
            <input
              id={`settled-on-${installment.number}`}
              name="settledOn"
              type="date"
              value={values.settledOn}
              onChange={handleChange}
              required
            />
          </div>

          <div className="field">
            <label htmlFor={`settled-amount-${installment.number}`}>Valor</label>
            <MoneyInput
              id={`settled-amount-${installment.number}`}
              name="amount"
              value={values.amount}
              onChange={handleChange}
              required
            />
          </div>

          <div className="field">
            <label htmlFor={`settled-category-${installment.number}`}>Categoria</label>
            <input
              id={`settled-category-${installment.number}`}
              name="category"
              value={values.category}
              onChange={handleChange}
            />
          </div>

          <div className="actions">
            <button type="submit" className="btn primary small" disabled={submitting}>
              Confirmar
            </button>
            <button type="button" className="btn small" onClick={onCancel} disabled={submitting}>
              Cancelar
            </button>
          </div>
        </form>

        <p className="hint">
          Confirmar cria o lançamento correspondente no evento. Estornar depois desfaz os dois.
        </p>
      </td>
    </tr>
  )
}

export default function InstallmentList({
  installments,
  direction,
  submitting,
  onSettle,
  onUnsettle,
  onCancel,
}) {
  const [settling, setSettling] = useState(null)

  return (
    <div className="card table-wrapper">
      <table className="table">
        <thead>
          <tr>
            <th>Parcela</th>
            <th className="right">Valor</th>
            <th>Vencimento</th>
            <th>Situação</th>
            <th>{settlementLabel(direction)} em</th>
            <th className="right">Ações</th>
          </tr>
        </thead>
        <tbody>
          {installments.map((installment) => (
            <Fragment key={installment.number}>
              <tr className={installment.isOverdue ? 'row-overdue' : undefined}>
                <td data-label="Parcela">
                  {installment.number}/{installments.length}
                </td>
                <td data-label="Valor" className="right amount">
                  {formatCurrency(installment.amount)}
                </td>
                <td data-label="Vencimento">
                  {formatDate(installment.dueDate)}
                  {installment.isOverdue && <span className="expense block">vencida</span>}
                </td>
                <td data-label="Situação">
                  <span className={`badge badge-${installment.status.toLowerCase()}`}>
                    {INSTALLMENT_STATUS_LABELS[installment.status]}
                  </span>
                </td>
                <td data-label={`${settlementLabel(direction)} em`}>
                  {installment.settledOn ? (
                    <>
                      {formatDate(installment.settledOn)}
                      {installment.settledAmount !== installment.amount && (
                        <span className="muted block">
                          {formatCurrency(installment.settledAmount)}
                        </span>
                      )}
                    </>
                  ) : (
                    '—'
                  )}
                </td>
                <td data-label="Ações" className="right">
                  {installment.status === 'Pending' && (
                    <>
                      <button
                        type="button"
                        className="btn small primary"
                        onClick={() =>
                          setSettling((current) =>
                            current === installment.number ? null : installment.number,
                          )
                        }
                        disabled={submitting}
                      >
                        {settleVerb(direction)}
                      </button>
                      <button
                        type="button"
                        className="btn small"
                        onClick={() => onCancel(installment)}
                        disabled={submitting}
                      >
                        Cancelar
                      </button>
                    </>
                  )}

                  {installment.status === 'Settled' && (
                    <button
                      type="button"
                      className="btn small danger"
                      onClick={() => onUnsettle(installment)}
                      disabled={submitting}
                    >
                      Estornar
                    </button>
                  )}
                </td>
              </tr>

              {settling === installment.number && (
                <SettleRow
                  installment={installment}
                  submitting={submitting}
                  onCancel={() => setSettling(null)}
                  onConfirm={async (settlement) => {
                    await onSettle(installment, settlement)
                    setSettling(null)
                  }}
                />
              )}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  )
}
