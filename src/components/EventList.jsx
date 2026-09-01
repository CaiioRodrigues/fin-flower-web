import { Link } from 'react-router-dom'
import StatusBadge from './StatusBadge.jsx'
import { formatCurrency, formatDate } from '../utils/format.js'

export default function EventList({ events }) {
  if (events.length === 0) {
    return (
      <div className="card empty">
        <p>Nenhum evento encontrado.</p>
        <p className="muted">Crie um evento ou ajuste os filtros.</p>
      </div>
    )
  }

  return (
    <div className="card table-wrapper">
      <table className="table">
        <thead>
          <tr>
            <th>Evento</th>
            <th>Data</th>
            <th>Situação</th>
            <th className="right">Entradas</th>
            <th className="right">Saídas</th>
            <th className="right">Resultado</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => (
            <tr key={event.id}>
              <td data-label="Evento">
                <Link to={`/eventos/${event.id}`} className="link-strong">
                  {event.name}
                </Link>
                <span className="muted block">
                  {event.entryCount} {event.entryCount === 1 ? 'lançamento' : 'lançamentos'}
                </span>
              </td>
              <td data-label="Data">{formatDate(event.eventDate)}</td>
              <td data-label="Situação">
                <StatusBadge status={event.status} />
              </td>
              <td data-label="Entradas" className="right amount income">
                {formatCurrency(event.totalIncome)}
              </td>
              <td data-label="Saídas" className="right amount expense">
                {formatCurrency(event.totalExpense)}
              </td>
              <td
                data-label="Resultado"
                className={`right amount ${event.result >= 0 ? 'income' : 'expense'}`}
              >
                {formatCurrency(event.result)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
