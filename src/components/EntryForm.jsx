import { useEffect, useState } from 'react'
import { todayISO } from '../utils/format.js'

const CATEGORIES = [
  'Ingressos',
  'Patrocínio',
  'Alimentação',
  'Bebidas',
  'Estrutura',
  'Equipe',
  'Divulgação',
  'Transporte',
  'Outros',
]

const empty = (eventDate) => ({
  type: 'Expense',
  description: '',
  amount: '',
  category: 'Outros',
  occurredOn: eventDate ?? todayISO(),
})

function validate(values) {
  const errors = {}

  if (!values.description.trim()) errors.description = 'Informe a descrição.'
  else if (values.description.trim().length > 200) errors.description = 'Máximo de 200 caracteres.'

  const amount = Number(values.amount)
  if (values.amount === '') errors.amount = 'Informe o valor.'
  else if (Number.isNaN(amount) || amount <= 0) errors.amount = 'O valor deve ser maior que zero.'

  if (!values.occurredOn) errors.occurredOn = 'Informe a data.'

  return errors
}

export default function EntryForm({ entry, eventDate, disabled, submitting, onSubmit, onCancel }) {
  const [values, setValues] = useState(() => empty(eventDate))
  const [errors, setErrors] = useState({})

  useEffect(() => {
    setValues(
      entry
        ? {
            type: entry.type,
            description: entry.description,
            amount: String(entry.amount),
            category: entry.category,
            occurredOn: entry.occurredOn,
          }
        : empty(eventDate),
    )
    setErrors({})
  }, [entry, eventDate])

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
      type: values.type,
      description: values.description.trim(),
      amount: Number(values.amount),
      category: values.category,
      occurredOn: values.occurredOn,
    })

    if (!entry) setValues((current) => ({ ...empty(eventDate), type: current.type }))
  }

  if (disabled) {
    return (
      <div className="card empty">
        <p>Evento fechado.</p>
        <p className="muted">Reabra o evento para incluir ou alterar lançamentos.</p>
      </div>
    )
  }

  return (
    <form className="card form" onSubmit={handleSubmit} noValidate>
      <h2>{entry ? 'Editar lançamento' : 'Novo lançamento'}</h2>

      <div className="field">
        <label htmlFor="entry-description">Descrição</label>
        <input
          id="entry-description"
          name="description"
          value={values.description}
          onChange={handleChange}
          placeholder="Ex.: Venda de ingressos"
          aria-invalid={Boolean(errors.description)}
        />
        {errors.description && <span className="error">{errors.description}</span>}
      </div>

      <div className="row">
        <div className="field">
          <label htmlFor="entry-amount">Valor (R$)</label>
          <input
            id="entry-amount"
            name="amount"
            type="number"
            min="0"
            step="0.01"
            value={values.amount}
            onChange={handleChange}
            placeholder="0,00"
            aria-invalid={Boolean(errors.amount)}
          />
          {errors.amount && <span className="error">{errors.amount}</span>}
        </div>

        <div className="field">
          <label htmlFor="entry-date">Data</label>
          <input
            id="entry-date"
            name="occurredOn"
            type="date"
            value={values.occurredOn}
            onChange={handleChange}
            aria-invalid={Boolean(errors.occurredOn)}
          />
          {errors.occurredOn && <span className="error">{errors.occurredOn}</span>}
        </div>
      </div>

      <div className="row">
        <div className="field">
          <label htmlFor="entry-type">Tipo</label>
          <select id="entry-type" name="type" value={values.type} onChange={handleChange}>
            <option value="Income">Entrada</option>
            <option value="Expense">Saída</option>
          </select>
        </div>

        <div className="field">
          <label htmlFor="entry-category">Categoria</label>
          <select id="entry-category" name="category" value={values.category} onChange={handleChange}>
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="actions">
        <button type="submit" className="btn primary" disabled={submitting}>
          {submitting ? 'Salvando…' : entry ? 'Salvar alterações' : 'Adicionar'}
        </button>
        {entry && (
          <button type="button" className="btn ghost" onClick={onCancel} disabled={submitting}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  )
}
