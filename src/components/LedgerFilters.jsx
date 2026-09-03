import MonthPicker from './MonthPicker.jsx'
import { ENTRY_SOURCE_LABELS } from '../utils/labels.js'

/**
 * Filtros do livro-caixa. O mês vem primeiro porque é assim que se olha um
 * caixa; os demais recortam dentro dele.
 */
export default function LedgerFilters({ filters, events, categories, onChange, disabled }) {
  function update(patch) {
    onChange({ ...filters, ...patch })
  }

  return (
    <div className="card filters">
      <MonthPicker
        value={filters.competence}
        onChange={(competence) => update({ competence })}
        disabled={disabled}
      />

      <div className="filter-row">
        <div className="field">
          <label htmlFor="filter-type">Tipo</label>
          <select
            id="filter-type"
            value={filters.type}
            onChange={(event) => update({ type: event.target.value })}
          >
            <option value="">Todos</option>
            <option value="Income">Entradas</option>
            <option value="Expense">Saídas</option>
          </select>
        </div>

        <div className="field">
          <label htmlFor="filter-source">Origem</label>
          <select
            id="filter-source"
            value={filters.source}
            onChange={(event) => update({ source: event.target.value })}
          >
            <option value="">Todas</option>
            {Object.entries(ENTRY_SOURCE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="filter-event">Evento</label>
          <select
            id="filter-event"
            value={filters.eventScope}
            onChange={(event) => update({ eventScope: event.target.value })}
          >
            <option value="">Todos</option>
            <option value="none">Sem evento</option>
            <option value="any">Com evento</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.name}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="filter-category">Categoria</label>
          <select
            id="filter-category"
            value={filters.category}
            onChange={(event) => update({ category: event.target.value })}
          >
            <option value="">Todas</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="field grow">
          <label htmlFor="filter-search">Buscar</label>
          <input
            id="filter-search"
            type="search"
            value={filters.search}
            onChange={(event) => update({ search: event.target.value })}
            placeholder="Descrição ou categoria"
          />
        </div>
      </div>
    </div>
  )
}
