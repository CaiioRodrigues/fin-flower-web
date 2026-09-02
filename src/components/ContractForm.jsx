import { useState } from 'react'
import MoneyInput from './MoneyInput.jsx'
import { PAYMENT_METHODS, PAYMENT_METHOD_LABELS } from '../utils/labels.js'
import { addMonthsISO, formatCurrency, todayISO } from '../utils/format.js'

const empty = () => ({
  direction: 'Receivable',
  counterparty: '',
  description: '',
  totalAmount: '',
  paymentMethod: 'Boleto',
  installmentCount: '1',
  firstDueDate: addMonthsISO(todayISO(), 1),
  signedOn: todayISO(),
})

function validate(values) {
  const errors = {}

  if (!values.counterparty.trim()) errors.counterparty = 'Informe o contratante.'

  const total = Number(values.totalAmount)
  if (values.totalAmount === '') errors.totalAmount = 'Informe o valor total.'
  else if (Number.isNaN(total) || total <= 0) errors.totalAmount = 'O valor deve ser maior que zero.'

  const count = Number(values.installmentCount)
  if (!Number.isInteger(count) || count < 1 || count > 120) {
    errors.installmentCount = 'O número de parcelas deve estar entre 1 e 120.'
  }

  if (!values.firstDueDate) errors.firstDueDate = 'Informe o primeiro vencimento.'
  if (!values.signedOn) errors.signedOn = 'Informe a data de assinatura.'

  return errors
}

export default function ContractForm({ submitting, onSubmit, onCancel }) {
  const [values, setValues] = useState(empty)
  const [errors, setErrors] = useState({})

  function handleChange(event) {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const found = validate(values)
    setErrors(found)
    if (Object.keys(found).length > 0) return

    await onSubmit({
      direction: values.direction,
      counterparty: values.counterparty.trim(),
      description: values.description.trim() || null,
      totalAmount: Number(values.totalAmount),
      paymentMethod: values.paymentMethod,
      installmentCount: Number(values.installmentCount),
      firstDueDate: values.firstDueDate,
      signedOn: values.signedOn,
    })

    setValues(empty())
  }

  // Prévia do parcelamento enquanto o usuário digita: o valor exato de cada
  // parcela quem calcula é o servidor, mas a ordem de grandeza ajuda a conferir.
  const total = Number(values.totalAmount)
  const count = Number(values.installmentCount)
  const preview =
    total > 0 && Number.isInteger(count) && count > 1
      ? `${count}x de aproximadamente ${formatCurrency(total / count)}`
      : null

  return (
    <form className="card form" onSubmit={handleSubmit} noValidate>
      <h3>Novo contrato</h3>

      <div className="field">
        <label htmlFor="direction">Tipo</label>
        <select id="direction" name="direction" value={values.direction} onChange={handleChange}>
          <option value="Receivable">A receber — cliente</option>
          <option value="Payable">A pagar — fornecedor</option>
        </select>
      </div>

      <div className="field">
        <label htmlFor="counterparty">Contratante</label>
        <input
          id="counterparty"
          name="counterparty"
          value={values.counterparty}
          onChange={handleChange}
          placeholder="Ex.: Prefeitura Municipal"
          aria-invalid={Boolean(errors.counterparty)}
        />
        {errors.counterparty && <span className="error">{errors.counterparty}</span>}
      </div>

      <div className="field">
        <label htmlFor="contract-description">Serviço (opcional)</label>
        <input
          id="contract-description"
          name="description"
          value={values.description}
          onChange={handleChange}
          placeholder="Ex.: Show de encerramento"
        />
      </div>

      <div className="row">
        <div className="field">
          <label htmlFor="totalAmount">Valor total</label>
          <MoneyInput
            id="totalAmount"
            name="totalAmount"
            value={values.totalAmount}
            onChange={handleChange}
            invalid={Boolean(errors.totalAmount)}
          />
          {errors.totalAmount && <span className="error">{errors.totalAmount}</span>}
        </div>

        <div className="field">
          <label htmlFor="installmentCount">Parcelas</label>
          <input
            id="installmentCount"
            name="installmentCount"
            type="number"
            min="1"
            max="120"
            value={values.installmentCount}
            onChange={handleChange}
            aria-invalid={Boolean(errors.installmentCount)}
          />
          {errors.installmentCount && <span className="error">{errors.installmentCount}</span>}
        </div>
      </div>

      {preview && <p className="hint">{preview}</p>}

      <div className="field">
        <label htmlFor="paymentMethod">Forma de pagamento</label>
        <select
          id="paymentMethod"
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

      <div className="row">
        <div className="field">
          <label htmlFor="firstDueDate">1º vencimento</label>
          <input
            id="firstDueDate"
            name="firstDueDate"
            type="date"
            value={values.firstDueDate}
            onChange={handleChange}
            aria-invalid={Boolean(errors.firstDueDate)}
          />
          {errors.firstDueDate && <span className="error">{errors.firstDueDate}</span>}
        </div>

        <div className="field">
          <label htmlFor="signedOn">Assinatura</label>
          <input
            id="signedOn"
            name="signedOn"
            type="date"
            value={values.signedOn}
            onChange={handleChange}
            aria-invalid={Boolean(errors.signedOn)}
          />
          {errors.signedOn && <span className="error">{errors.signedOn}</span>}
        </div>
      </div>

      <div className="actions">
        <button type="submit" className="btn primary" disabled={submitting}>
          {submitting ? 'Criando…' : 'Criar contrato'}
        </button>
        {onCancel && (
          <button type="button" className="btn ghost" onClick={onCancel} disabled={submitting}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  )
}
