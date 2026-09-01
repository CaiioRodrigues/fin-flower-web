export default function Filters({ search, type, onSearchChange, onTypeChange }) {
  return (
    <div className="card filters">
      <div className="field grow">
        <label htmlFor="search">Buscar</label>
        <input
          id="search"
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Descrição ou categoria"
        />
      </div>
      <div className="field">
        <label htmlFor="filter-type">Tipo</label>
        <select
          id="filter-type"
          value={type}
          onChange={(event) => onTypeChange(event.target.value)}
        >
          <option value="all">Todos</option>
          <option value="income">Receitas</option>
          <option value="expense">Despesas</option>
        </select>
      </div>
    </div>
  )
}
