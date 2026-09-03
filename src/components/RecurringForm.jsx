import { useEffect, useState } from 'react'
import MoneyInput from './MoneyInput.jsx'
import { currentCompetence, isCompetence } from '../utils/competence.js'

const empty = (competence) => ({
  description: '',
  amount: '',
  category: '',
  dayOfMonth: '5',
  startMonth: competence,
  endMonth: '',
  notes: '',
})

function validate(values) {
  const errors = {}

  if (!values.description.trim()) errors.description = 'Informe a descrição.'

  const amount = Number(values.amount)
  if (values.amount === '') errors.amount = 'Informe o valor.'
  else if (Number.isNaN(amount) || amount <= 0) errors.amount = 'O valor deve ser maior que zero.'

  if (!values.category.trim()) errors.category = 'Informe a categoria.'

  const day = Number(values.dayOfMonth)
  if (!Number.isInteger(day) || day < 1 || day > 31) errors.dayOfMonth = 'Entre 1 e 31.'

  if (!isCompetence(values.startMonth)) errors.startMonth = 'Informe o mês inicial.'
  if (values.endMonth && !isCompetence(values.endMonth)) errors.endMonth = 'Mês inválido.'

  if (isCompetence(values.startMonth) && isCompetence(values.endMonth)
    && values.endMonth < values.startMonth) {
    errors.endMonth = 'Não pode ser antes do inicial.'
  }

  return errors
}

/**
 * Cadastro de um item fixo. Alterar o valor vale para os meses ainda não
 * gerados — o aluguel de março já foi pago, e o reajuste não reescreve o
 * passado. O formulário diz isso ao editar, para não haver surpresa.
 */
export default function RecurringForm({ item, kind, kindLabel, submitting, onSubmit, onCancel }) {
  const [values, setValues] = useState(() => empty(currentCompetence()))
  const [errors, setErrors] = useState({})

  useEffect(() => {
    setValues(
      item
        ? {
            description: item.description,
            amount: String(item.amount),
            category: item.category,
            dayOfMonth: String(item.dayOfMonth),
            startMonth: item.startMonth,
            endMonth: item.endMonth ?? '',
            notes: item.notes ?? '',
          }
        : empty(currentCompetence()),
    )
    setErrors({})
  }, [item])

  function handleChange(event) {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const found = validate(values)
    setErrors(found)
    if (Object.keys(found).length > 0) return

    const payload = {
      description: values.description.trim(),
      amount: Number(values.amount),
      category: values.category.trim(),
      dayOfMonth: Number(values.dayOfMonth),
      endMonth: values.endMonth || null,
      notes: values.notes.trim() || null,
    }

    await onSubmit(item ? payload : { ...payload, kind, startMonth: values.startMonth })

    if (!item) setValues(empty(currentCompetence()))
  }

  return (
    <form className="card form" onSubmit={handleSubmit} noValidate>
      <h2>{item ? `Editar ${kindLabel.toLowerCase()}` : `Novo ${kindLabel.toLowerCase()}`}</h2>

      <div className="field">
        <label htmlFor="recurring-description">Descrição</label>
        <input
          id="recurring-description"
          name="description"
          value={values.description}
          onChange={handleChange}
          placeholder={kind === 'ProLabore' ? 'Ex.: Retirada do sócio' : 'Ex.: Aluguel do galpão'}
          aria-invalid={Boolean(errors.description)}
        />
        {errors.description && <span className="error">{errors.description}</span>}
      </div>

      <div className="row">
        <div className="field">
          <label htmlFor="recurring-amount">Valor por mês</label>
          <MoneyInput
            id="recurring-amount"
            name="amount"
            value={values.amount}
            onChange={handleChange}
            invalid={Boolean(errors.amount)}
          />
          {errors.amount && <span className="error">{errors.amount}</span>}
        </div>

        <div className="field">
          <label htmlFor="recurring-day">Dia do vencimento</label>
          <input
            id="recurring-day"
            name="dayOfMonth"
            type="number"
            min="1"
            max="31"
            value={values.dayOfMonth}
            onChange={handleChange}
            aria-invalid={Boolean(errors.dayOfMonth)}
          />
          {errors.dayOfMonth ? (
            <span className="error">{errors.dayOfMonth}</span>
          ) : (
            <span className="hint">Meses curtos usam o último dia.</span>
          )}
        </div>
      </div>

      <div className="field">
        <label htmlFor="recurring-category">Categoria</label>
        <input
          id="recurring-category"
          name="category"
          value={values.category}
          onChange={handleChange}
          placeholder={kind === 'ProLabore' ? 'Ex.: Sócios' : 'Ex.: Estrutura'}
          aria-invalid={Boolean(errors.category)}
        />
        {errors.category && <span className="error">{errors.category}</span>}
      </div>

      <div className="row">
        <div className="field">
          <label htmlFor="recurring-start">Começa em</label>
          <input
            id="recurring-start"
            name="startMonth"
            type="month"
            className="month-input"
            value={values.startMonth}
            onChange={handleChange}
            disabled={Boolean(item)}
            aria-invalid={Boolean(errors.startMonth)}
          />
          {errors.startMonth && <span className="error">{errors.startMonth}</span>}
        </div>

        <div className="field">
          <label htmlFor="recurring-end">Termina em</label>
          <input
            id="recurring-end"
            name="endMonth"
            type="month"
            className="month-input"
            value={values.endMonth}
            onChange={handleChange}
            aria-invalid={Boolean(errors.endMonth)}
          />
          {errors.endMonth ? (
            <span className="error">{errors.endMonth}</span>
          ) : (
            <span className="hint">Em branco, não tem fim.</span>
          )}
        </div>
      </div>

      <div className="field">
        <label htmlFor="recurring-notes">Observações</label>
        <textarea
          id="recurring-notes"
          name="notes"
          rows="2"
          value={values.notes}
          onChange={handleChange}
          placeholder="Opcional"
        />
      </div>

      {item && (
        <p className="hint">
          O novo valor vale para os meses ainda não lançados. O que já foi para o caixa continua
          como está.
        </p>
      )}

      <div className="actions">
        <button type="submit" className="btn primary" disabled={submitting}>
          {submitting ? 'Salvando…' : item ? 'Salvar alterações' : 'Cadastrar'}
        </button>
        {item && (
          <button type="button" className="btn ghost" onClick={onCancel} disabled={submitting}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  )
}
