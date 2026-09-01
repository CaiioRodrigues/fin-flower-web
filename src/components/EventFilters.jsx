export default function EventFilters({ filters, onChange }) {
  function handleChange(event) {
    const { name, value } = event.target
    onChange({ ...filters, [name]: value })
  }

  const hasFilters = filters.from || filters.to || filters.status

  return (
    <div className="card filters">
      <div className="field">
        <label htmlFor="from">De</label>
        <input id="from" name="from" type="date" value={filters.from} onChange={handleChange} />
      </div>

      <div className="field">
        <label htmlFor="to">Até</label>
        <input id="to" name="to" type="date" value={filters.to} onChange={handleChange} />
      </div>

      <div className="field">
        <label htmlFor="status">Situação</label>
        <select id="status" name="status" value={filters.status} onChange={handleChange}>
          <option value="">Todas</option>
          <option value="Open">Abertos</option>
          <option value="Closed">Fechados</option>
        </select>
      </div>

      {hasFilters && (
        <button
          type="button"
          className="btn"
          onClick={() => onChange({ from: '', to: '', status: '' })}
        >
          Limpar
        </button>
      )}
    </div>
  )
}
