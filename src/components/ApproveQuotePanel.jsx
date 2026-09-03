import { useState } from 'react'
import { addMonthsISO, formatCurrency, todayISO } from '../utils/format.js'
import { PAYMENT_METHODS, PAYMENT_METHOD_LABELS } from '../utils/labels.js'

/**
 * Aprovar é o momento em que a proposta vira previsão de caixa: aqui se define
 * em quantas vezes e como, porque é isso que gera as parcelas. A prévia mostra
 * o valor de cada uma antes de confirmar.
 */
export default function ApproveQuotePanel({ quote, submitting, onApprove }) {
  const [values, setValues] = useState(() => ({
    paymentMethod: 'Boleto',
    installmentCount: '1',
    firstDueDate: addMonthsISO(todayISO(), 1),
    signedOn: todayISO(),
    counterparty: '',
  }))
  const [error, setError] = useState(null)

  function handleChange(event) {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
  }

  const parts = Number(values.installmentCount)
  const perInstallment = parts > 0 ? Number(quote.total) / parts : 0

  async function handleSubmit(event) {
    event.preventDefault()

    if (!Number.isInteger(parts) || parts < 1 || parts > 120) {
      return setError('O número de parcelas deve estar entre 1 e 120.')
    }

    if (!values.firstDueDate) return setError('Informe o primeiro vencimento.')

    setError(null)

    await onApprove({
      paymentMethod: values.paymentMethod,
      installmentCount: parts,
      firstDueDate: values.firstDueDate,
      signedOn: values.signedOn,
      counterparty: values.counterparty.trim() || null,
    })
  }

  return (
    <form className="card form accent" onSubmit={handleSubmit} noValidate>
      <h3>Aprovar e gerar contrato</h3>
      <p className="muted">
        O contrato nasce com {formatCurrency(quote.total)} — o total já com desconto — e as parcelas
        entram na previsão de caixa.
      </p>

      <div className="row">
        <div className="field">
          <label htmlFor="approve-parts">Parcelas</label>
          <input
            id="approve-parts"
            name="installmentCount"
            type="number"
            min="1"
            max="120"
            value={values.installmentCount}
            onChange={handleChange}
          />
          {parts > 0 && (
            <span className="hint">
              {parts}× de aproximadamente {formatCurrency(perInstallment)}
            </span>
          )}
        </div>

        <div className="field">
          <label htmlFor="approve-method">Forma de pagamento</label>
          <select
            id="approve-method"
            name="paymentMethod"
            value={values.paymentMethod}
            onChange={handleChange}
          >
            {PAYMENT_METHODS.map((method) => (
              <option key={method} value={method}>
                {PAYMENT_METHOD_LABELS[method]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="row">
        <div className="field">
          <label htmlFor="approve-first-due">Primeiro vencimento</label>
          <input
            id="approve-first-due"
            name="firstDueDate"
            type="date"
            value={values.firstDueDate}
            onChange={handleChange}
          />
        </div>

        <div className="field">
          <label htmlFor="approve-signed">Assinado em</label>
          <input
            id="approve-signed"
            name="signedOn"
            type="date"
            value={values.signedOn}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="field">
        <label htmlFor="approve-counterparty">Contratante</label>
        <input
          id="approve-counterparty"
          name="counterparty"
          value={values.counterparty}
          onChange={handleChange}
          placeholder={quote.clientName}
        />
        <span className="hint">Em branco, usa o cliente do orçamento.</span>
      </div>

      {error && <span className="error">{error}</span>}

      <div className="actions">
        <button type="submit" className="btn primary" disabled={submitting}>
          {submitting ? 'Gerando…' : 'Aprovar orçamento'}
        </button>
      </div>
    </form>
  )
}
