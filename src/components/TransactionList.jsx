import { formatCurrency, formatDate } from '../utils/format.js'

export default function TransactionList({ transactions, onEdit, onDelete }) {
  if (transactions.length === 0) {
    return (
      <div className="card empty">
        <p>Nenhum lançamento encontrado.</p>
        <p className="muted">Cadastre um novo lançamento ou ajuste os filtros.</p>
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
            <th className="right">Ações</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.id}>
              <td data-label="Descrição">{transaction.description}</td>
              <td data-label="Categoria">
                <span className="tag">{transaction.category}</span>
              </td>
              <td data-label="Data">{formatDate(transaction.date)}</td>
              <td data-label="Valor" className={`right amount ${transaction.type}`}>
                {transaction.type === 'expense' ? '-' : '+'}
                {formatCurrency(transaction.amount)}
              </td>
              <td data-label="Ações" className="right">
                <button
                  type="button"
                  className="btn small"
                  onClick={() => onEdit(transaction)}
                >
                  Editar
                </button>
                <button
                  type="button"
                  className="btn small danger"
                  onClick={() => onDelete(transaction)}
                >
                  Excluir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
