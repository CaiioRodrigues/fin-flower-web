import { useEffect, useState } from 'react'
import { addMonthsISO, todayISO } from '../utils/format.js'

const empty = () => ({
  clientName: '',
  title: '',
  issuedOn: todayISO(),
  validUntil: addMonthsISO(todayISO(), 1),
  notes: '',
  eventId: '',
  number: '',
})

function validate(values) {
  const errors = {}

  if (!values.clientName.trim()) errors.clientName = 'Informe o cliente.'
  if (!values.title.trim()) errors.title = 'Informe o título da proposta.'
  if (!values.issuedOn) errors.issuedOn = 'Informe a emissão.'
  if (!values.validUntil) errors.validUntil = 'Informe a validade.'
  else if (values.validUntil < values.issuedOn) errors.validUntil = 'Não pode ser antes da emissão.'

  return errors
}

export default function QuoteForm({ quote, events = [], submitting, onSubmit, onCancel }) {
  const [values, setValues] = useState(empty)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    setValues(
      quote
        ? {
            clientName: quote.clientName,
            title: quote.title,
            issuedOn: quote.issuedOn,
            validUntil: quote.validUntil,
            notes: quote.notes ?? '',
            eventId: quote.eventId ?? '',
            number: quote.number,
          }
        : empty(),
    )
    setErrors({})
  }, [quote])

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
      clientName: values.clientName.trim(),
      title: values.title.trim(),
      issuedOn: values.issuedOn,
      validUntil: values.validUntil,
      notes: values.notes.trim() || null,
      eventId: values.eventId || null,
    }

    await onSubmit(quote ? payload : { ...payload, number: values.number.trim() || null })
  }

  return (
    <form className="card form" onSubmit={handleSubmit} noValidate>
      <h2>{quote ? 'Dados da proposta' : 'Novo orçamento'}</h2>

      <div className="field">
        <label htmlFor="quote-client">Cliente</label>
        <input
          id="quote-client"
          name="clientName"
          value={values.clientName}
          onChange={handleChange}
          placeholder="Ex.: Prefeitura Municipal"
          aria-invalid={Boolean(errors.clientName)}
        />
        {errors.clientName && <span className="error">{errors.clientName}</span>}
      </div>

      <div className="field">
        <label htmlFor="quote-title">Título</label>
        <input
          id="quote-title"
          name="title"
          value={values.title}
          onChange={handleChange}
          placeholder="Ex.: Show de encerramento"
          aria-invalid={Boolean(errors.title)}
        />
        {errors.title && <span className="error">{errors.title}</span>}
      </div>

      <div className="row">
        <div className="field">
          <label htmlFor="quote-issued">Emissão</label>
          <input
            id="quote-issued"
            name="issuedOn"
            type="date"
            value={values.issuedOn}
            onChange={handleChange}
            aria-invalid={Boolean(errors.issuedOn)}
          />
          {errors.issuedOn && <span className="error">{errors.issuedOn}</span>}
        </div>

        <div className="field">
          <label htmlFor="quote-valid">Válido até</label>
          <input
            id="quote-valid"
            name="validUntil"
            type="date"
            value={values.validUntil}
            onChange={handleChange}
            aria-invalid={Boolean(errors.validUntil)}
          />
          {errors.validUntil && <span className="error">{errors.validUntil}</span>}
        </div>
      </div>

      <div className="row">
        <div className="field">
          <label htmlFor="quote-event">Evento</label>
          <select id="quote-event" name="eventId" value={values.eventId} onChange={handleChange}>
            <option value="">Sem evento</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.name}
              </option>
            ))}
          </select>
        </div>

        {!quote && (
          <div className="field">
            <label htmlFor="quote-number">Número</label>
            <input
              id="quote-number"
              name="number"
              value={values.number}
              onChange={handleChange}
              placeholder="Automático"
            />
            <span className="hint">Em branco, numeramos por ano.</span>
          </div>
        )}
      </div>

      <div className="field">
        <label htmlFor="quote-notes">Observações</label>
        <textarea
          id="quote-notes"
          name="notes"
          rows="3"
          value={values.notes}
          onChange={handleChange}
          placeholder="Condições, prazos, o que estiver combinado"
        />
      </div>

      <div className="actions">
        <button type="submit" className="btn primary" disabled={submitting}>
          {submitting ? 'Salvando…' : quote ? 'Salvar alterações' : 'Criar orçamento'}
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
