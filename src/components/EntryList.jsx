import { formatCurrency, formatDate } from '../utils/format.js'

export default function EntryList({ entries, readOnly, onEdit, onDelete }) {
  if (entries.length === 0) {
    return (
      <div className="card empty">
        <p>Nenhum lançamento neste evento.</p>
        <p className="muted">Cadastre a primeira entrada ou saída.</p>
      </div>
    )
  }

  return (
    <div className="card table-wrapper">
      <table className="table">
        <thead>
          <tr>
            <th>Descrição</th>
            <th>Categoria</th>
            <th>Data</th>
            <th className="right">Valor</th>
            {!readOnly && <th className="right">Ações</th>}
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id}>
              <td data-label="Descrição">{entry.description}</td>
              <td data-label="Categoria">
                <span className="tag">{entry.category}</span>
              </td>
              <td data-label="Data">{formatDate(entry.occurredOn)}</td>
              <td
                data-label="Valor"
                className={`right amount ${entry.type === 'Income' ? 'income' : 'expense'}`}
              >
                {entry.type === 'Income' ? '+' : '-'}
                {formatCurrency(entry.amount)}
              </td>
              {!readOnly && (
                <td data-label="Ações" className="right">
                  <button type="button" className="btn small" onClick={() => onEdit(entry)}>
                    Editar
                  </button>
                  <button
                    type="button"
                    className="btn small danger"
                    onClick={() => onDelete(entry)}
                  >
                    Excluir
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
