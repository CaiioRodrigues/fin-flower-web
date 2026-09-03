import { competenceLabel } from '../utils/competence.js'
import { formatCurrency, formatDate } from '../utils/format.js'

/**
 * Os itens fixos com a situação da competência escolhida. A coluna "no mês"
 * é o que a tela existe para responder: o que já foi lançado e o que falta.
 */
export default function RecurringList({ items, onEdit, onToggle, onDelete, onGenerateOne, busyId }) {
  if (items.length === 0) {
    return (
      <div className="card empty">
        <p>Nada cadastrado ainda.</p>
        <p className="muted">Cadastre o primeiro item para ele entrar no caixa todo mês.</p>
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
            <th>Vencimento</th>
            <th>Vigência</th>
            <th className="right">Valor</th>
            <th>No mês</th>
            <th className="right">Ações</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className={item.isActive ? undefined : 'row-quiet'}>
              <td data-label="Descrição">
                {item.description}
                {!item.isActive && <span className="tag">inativo</span>}
              </td>

              <td data-label="Categoria">
                <span className="tag">{item.category}</span>
              </td>

              <td data-label="Vencimento">
                {item.dueDate ? formatDate(item.dueDate) : `todo dia ${item.dayOfMonth}`}
              </td>

              <td data-label="Vigência" className="muted-cell">
                {competenceLabel(item.startMonth)}
                {item.endMonth ? ` a ${competenceLabel(item.endMonth)}` : ' em diante'}
              </td>

              <td
                data-label="Valor"
                className={`right amount ${item.type === 'Income' ? 'income' : 'expense'}`}
              >
                {formatCurrency(item.amount)}
              </td>

              <td data-label="No mês">
                {!item.dueInMonth ? (
                  <span className="muted">não se aplica</span>
                ) : item.generatedForMonth ? (
                  <span className="badge settled">lançado</span>
                ) : (
                  <button
                    type="button"
                    className="btn small primary"
                    onClick={() => onGenerateOne(item)}
                    disabled={busyId === item.id}
                  >
                    Lançar
                  </button>
                )}
              </td>

              <td data-label="Ações" className="right">
                <button
                  type="button"
                  className="btn small"
                  onClick={() => onEdit(item)}
                  disabled={busyId === item.id}
                >
                  Editar
                </button>
                <button
                  type="button"
                  className="btn small"
                  onClick={() => onToggle(item)}
                  disabled={busyId === item.id}
                >
                  {item.isActive ? 'Suspender' : 'Reativar'}
                </button>
                <button
                  type="button"
                  className="btn small danger"
                  onClick={() => onDelete(item)}
                  disabled={busyId === item.id}
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
