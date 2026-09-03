import { useEffect, useState } from 'react'
import MoneyInput from './MoneyInput.jsx'
import { todayISO } from '../utils/format.js'

/** Sugestões iniciais, para quem ainda não tem histórico de categorias. */
const SUGGESTED = [
  'Serviços',
  'Contratos',
  'Fornecedores',
  'Estrutura',
  'Equipe',
  'Escritório',
  'Impostos',
  'Marketing',
  'Transporte',
  'Sócios',
  'Outros',
]

const empty = (defaults) => ({
  type: 'Expense',
  description: '',
  amount: '',
  category: '',
  occurredOn: defaults?.occurredOn ?? todayISO(),
  eventId: defaults?.eventId ?? '',
})

function validate(values) {
  const errors = {}

  if (!values.description.trim()) errors.description = 'Informe a descrição.'
  else if (values.description.trim().length > 200) errors.description = 'Máximo de 200 caracteres.'

  const amount = Number(values.amount)
  if (values.amount === '') errors.amount = 'Informe o valor.'
  else if (Number.isNaN(amount) || amount <= 0) errors.amount = 'O valor deve ser maior que zero.'

  if (!values.category.trim()) errors.category = 'Informe a categoria.'
  if (!values.occurredOn) errors.occurredOn = 'Informe a data.'

  return errors
}

/**
 * Formulário do livro-caixa. O evento é opcional de propósito: a maior parte do
 * que sai do caixa — aluguel, contador, software — não pertence a evento nenhum.
 */
export default function LedgerForm({
  entry,
  events = [],
  categories = [],
  defaults,
  submitting,
  onSubmit,
  onCancel,
}) {
  const [values, setValues] = useState(() => empty(defaults))
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
            eventId: entry.eventId ?? '',
          }
        : empty(defaults),
    )
    setErrors({})
  }, [entry, defaults])

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
      category: values.category.trim(),
      occurredOn: values.occurredOn,
      eventId: values.eventId || null,
    })

    // Mantém tipo, categoria e data: lançar o mês inteiro é uma sequência de
    // registros parecidos, e recomeçar do zero a cada um seria trabalho à toa.
    if (!entry) {
      setValues((current) => ({
        ...empty(defaults),
        type: current.type,
        category: current.category,
        occurredOn: current.occurredOn,
        eventId: current.eventId,
      }))
    }
  }

  const knownCategories = [...new Set([...categories, ...SUGGESTED])]

  return (
    <form className="card form" onSubmit={handleSubmit} noValidate>
      <h2>{entry ? 'Editar lançamento' : 'Novo lançamento'}</h2>

      <div className="segmented" role="group" aria-label="Tipo do lançamento">
        <button
          type="button"
          className={values.type === 'Income' ? 'segment active income' : 'segment'}
          onClick={() => setValues((current) => ({ ...current, type: 'Income' }))}
        >
          Entrada
        </button>
        <button
          type="button"
          className={values.type === 'Expense' ? 'segment active expense' : 'segment'}
          onClick={() => setValues((current) => ({ ...current, type: 'Expense' }))}
        >
          Saída
        </button>
      </div>

      <div className="field">
        <label htmlFor="ledger-description">Descrição</label>
        <input
          id="ledger-description"
          name="description"
          value={values.description}
          onChange={handleChange}
          placeholder="Ex.: Aluguel do galpão"
          aria-invalid={Boolean(errors.description)}
        />
        {errors.description && <span className="error">{errors.description}</span>}
      </div>

      <div className="row">
        <div className="field">
          <label htmlFor="ledger-amount">Valor</label>
          <MoneyInput
            id="ledger-amount"
            name="amount"
            value={values.amount}
            onChange={handleChange}
            invalid={Boolean(errors.amount)}
          />
          {errors.amount && <span className="error">{errors.amount}</span>}
        </div>

        <div className="field">
          <label htmlFor="ledger-date">Data</label>
          <input
            id="ledger-date"
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
          <label htmlFor="ledger-category">Categoria</label>
          <input
            id="ledger-category"
            name="category"
            list="ledger-categories"
            value={values.category}
            onChange={handleChange}
            placeholder="Ex.: Estrutura"
            aria-invalid={Boolean(errors.category)}
          />
          <datalist id="ledger-categories">
            {knownCategories.map((category) => (
              <option key={category} value={category} />
            ))}
          </datalist>
          {errors.category && <span className="error">{errors.category}</span>}
        </div>

        <div className="field">
          <label htmlFor="ledger-event">Evento</label>
          <select id="ledger-event" name="eventId" value={values.eventId} onChange={handleChange}>
            <option value="">Sem evento</option>
            {events.map((event) => (
              <option key={event.id} value={event.id} disabled={event.status === 'Closed'}>
                {event.name}
                {event.status === 'Closed' ? ' (fechado)' : ''}
              </option>
            ))}
          </select>
          <span className="hint">Opcional. Serve para apurar o resultado por trabalho.</span>
        </div>
      </div>

      <div className="actions">
        <button type="submit" className="btn primary" disabled={submitting}>
          {submitting ? 'Salvando…' : entry ? 'Salvar alterações' : 'Lançar'}
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
