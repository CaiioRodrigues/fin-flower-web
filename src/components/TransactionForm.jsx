import { useEffect, useState } from 'react'
import { todayISO } from '../utils/format.js'

const CATEGORIES = [
  'Alimentação',
  'Moradia',
  'Transporte',
  'Lazer',
  'Saúde',
  'Educação',
  'Salário',
  'Investimentos',
  'Outros',
]

const EMPTY = {
  description: '',
  amount: '',
  type: 'expense',
  category: 'Outros',
  date: todayISO(),
}

function validate(values) {
  const errors = {}

  if (!values.description.trim()) {
    errors.description = 'Informe uma descrição.'
  } else if (values.description.trim().length < 3) {
    errors.description = 'A descrição precisa ter ao menos 3 caracteres.'
  }

  const amount = Number(values.amount)
  if (values.amount === '') {
    errors.amount = 'Informe o valor.'
  } else if (Number.isNaN(amount) || amount <= 0) {
    errors.amount = 'O valor deve ser maior que zero.'
  }

  if (!values.date) errors.date = 'Informe a data.'

  return errors
}

export default function TransactionForm({ editing, onSubmit, onCancel }) {
  const [values, setValues] = useState(EMPTY)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (editing) {
      setValues({
        description: editing.description,
        amount: String(editing.amount),
        type: editing.type,
        category: editing.category,
        date: editing.date,
      })
    } else {
      setValues(EMPTY)
    }
    setErrors({})
  }, [editing])

  function handleChange(event) {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    const found = validate(values)
    setErrors(found)
    if (Object.keys(found).length > 0) return

    onSubmit({
      description: values.description.trim(),
      amount: Number(values.amount),
      type: values.type,
      category: values.category,
      date: values.date,
    })

    if (!editing) setValues({ ...EMPTY, type: values.type })
  }

  return (
    <form className="card form" onSubmit={handleSubmit} noValidate>
      <h2>{editing ? 'Editar lançamento' : 'Novo lançamento'}</h2>

      <div className="field">
        <label htmlFor="description">Descrição</label>
        <input
          id="description"
          name="description"
          value={values.description}
          onChange={handleChange}
          placeholder="Ex.: Mercado do mês"
          aria-invalid={Boolean(errors.description)}
        />
        {errors.description && <span className="error">{errors.description}</span>}
      </div>

      <div className="row">
        <div className="field">
          <label htmlFor="amount">Valor (R$)</label>
          <input
            id="amount"
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
          <label htmlFor="date">Data</label>
          <input
            id="date"
            name="date"
            type="date"
            value={values.date}
            onChange={handleChange}
            aria-invalid={Boolean(errors.date)}
          />
          {errors.date && <span className="error">{errors.date}</span>}
        </div>
      </div>

      <div className="row">
        <div className="field">
          <label htmlFor="type">Tipo</label>
          <select id="type" name="type" value={values.type} onChange={handleChange}>
            <option value="income">Receita</option>
            <option value="expense">Despesa</option>
          </select>
        </div>

        <div className="field">
          <label htmlFor="category">Categoria</label>
          <select id="category" name="category" value={values.category} onChange={handleChange}>
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="actions">
        <button type="submit" className="btn primary">
          {editing ? 'Salvar alterações' : 'Adicionar'}
        </button>
        {editing && (
          <button type="button" className="btn ghost" onClick={onCancel}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  )
}
