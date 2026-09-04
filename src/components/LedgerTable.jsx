import { Link } from 'react-router-dom'
import { formatCurrency, formatDate } from '../utils/format.js'
import { ENTRY_SOURCE_LABELS } from '../utils/labels.js'

/**
 * O extrato. Lançamento vindo de contrato aparece igual aos outros — é dinheiro
 * do mesmo jeito — mas sem botão de editar: quem manda nele é a parcela.
 */
export default function LedgerTable({ entries, onEdit, onDelete, busyId }) {
  // Sem os dois manipuladores a tabela é só leitura — é como o evento fechado a
  // usa, e uma coluna de ações vazia só ocuparia espaço.
  const readOnly = !onEdit && !onDelete

  if (entries.length === 0) {
    return (
      <div className="card empty">
        <p>Nenhum lançamento no período.</p>
        <p className="muted">Ajuste os filtros ou registre a primeira entrada ou saída.</p>
      </div>
    )
  }

  return (
    <div className="card table-wrapper">
      <table className="table">
        <thead>
          <tr>
            <th>Data</th>
            <th>Descrição</th>
            <th>Categoria</th>
            <th>Evento</th>
            <th className="right">Valor</th>
            {!readOnly && <th className="right">Ações</th>}
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr
              key={entry.id}
              className={entry.type === 'Income' ? 'row-positive' : 'row-negative'}
            >
              <td data-label="Data">{formatDate(entry.occurredOn)}</td>

              <td data-label="Descrição">
                {entry.description}
                {entry.source !== 'Manual' && (
                  <span className="tag origin">{ENTRY_SOURCE_LABELS[entry.source]}</span>
                )}
              </td>

              <td data-label="Categoria">
                <span className="tag">{entry.category}</span>
              </td>

              <td data-label="Evento">
                {entry.eventId ? (
                  <Link className="link" to={`/eventos/${entry.eventId}`}>
                    {entry.eventName}
                  </Link>
                ) : (
                  <span className="muted">—</span>
                )}
              </td>

              <td
                data-label="Valor"
                className={`right amount ${entry.type === 'Income' ? 'income' : 'expense'}`}
              >
                {entry.type === 'Income' ? '+' : '−'}
                {formatCurrency(entry.amount)}
              </td>

              {!readOnly && (
              <td data-label="Ações" className="right">
                {entry.isEditable ? (
                  <>
                    <button
                      type="button"
                      className="btn small"
                      onClick={() => onEdit(entry)}
                      disabled={busyId === entry.id}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className="btn small danger"
                      onClick={() => onDelete(entry)}
                      disabled={busyId === entry.id}
                    >
                      Excluir
                    </button>
                  </>
                ) : (
                  <span className="muted small-text">Gerido pelo contrato</span>
                )}
              </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
