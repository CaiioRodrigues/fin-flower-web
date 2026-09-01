import { useEffect, useState } from 'react'
import { todayISO } from '../utils/format.js'

const EMPTY = { name: '', description: '', eventDate: todayISO() }

function validate(values) {
  const errors = {}

  if (!values.name.trim()) errors.name = 'Informe o nome do evento.'
  else if (values.name.trim().length > 120) errors.name = 'O nome deve ter no máximo 120 caracteres.'

  if (!values.eventDate) errors.eventDate = 'Informe a data.'
  if (values.description.length > 500) errors.description = 'A descrição deve ter no máximo 500 caracteres.'

  return errors
}

export default function EventForm({ event, submitting, onSubmit, onCancel }) {
  const [values, setValues] = useState(EMPTY)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    setValues(
      event
        ? { name: event.name, description: event.description ?? '', eventDate: event.eventDate }
        : EMPTY,
    )
    setErrors({})
  }, [event])

  function handleChange(changeEvent) {
    const { name, value } = changeEvent.target
    setValues((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit(submitEvent) {
    submitEvent.preventDefault()

    const found = validate(values)
    setErrors(found)
    if (Object.keys(found).length > 0) return

    await onSubmit({
      name: values.name.trim(),
      description: values.description.trim() || null,
      eventDate: values.eventDate,
    })

    if (!event) setValues(EMPTY)
  }

  return (
    <form className="card form" onSubmit={handleSubmit} noValidate>
      <h2>{event ? 'Editar evento' : 'Novo evento'}</h2>

      <div className="field">
        <label htmlFor="name">Nome</label>
        <input
          id="name"
          name="name"
          value={values.name}
          onChange={handleChange}
          placeholder="Ex.: Festa de Ano Novo"
          aria-invalid={Boolean(errors.name)}
        />
        {errors.name && <span className="error">{errors.name}</span>}
      </div>

      <div className="field">
        <label htmlFor="eventDate">Data</label>
        <input
          id="eventDate"
          name="eventDate"
          type="date"
          value={values.eventDate}
          onChange={handleChange}
          aria-invalid={Boolean(errors.eventDate)}
        />
        {errors.eventDate && <span className="error">{errors.eventDate}</span>}
      </div>

      <div className="field">
        <label htmlFor="description">Descrição (opcional)</label>
        <input
          id="description"
          name="description"
          value={values.description}
          onChange={handleChange}
          placeholder="Ex.: Réveillon na praia"
          aria-invalid={Boolean(errors.description)}
        />
        {errors.description && <span className="error">{errors.description}</span>}
      </div>

      <div className="actions">
        <button type="submit" className="btn primary" disabled={submitting}>
          {submitting ? 'Salvando…' : event ? 'Salvar alterações' : 'Criar evento'}
        </button>
        {event && (
          <button type="button" className="btn ghost" onClick={onCancel} disabled={submitting}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  )
}
