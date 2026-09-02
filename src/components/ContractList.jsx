import { Link } from 'react-router-dom'
import { DIRECTION_LABELS, PAYMENT_METHOD_LABELS } from '../utils/labels.js'
import { formatCurrency, formatDate } from '../utils/format.js'

export default function ContractList({ contracts, showEvent = false }) {
  if (contracts.length === 0) {
    return (
      <div className="card empty">
        <p>Nenhum contrato cadastrado.</p>
        <p className="muted">Cadastre um contrato para acompanhar o que há a receber e a pagar.</p>
      </div>
    )
  }

  return (
    <div className="card table-wrapper">
      <table className="table">
        <thead>
          <tr>
            <th>Contratante</th>
            {showEvent && <th>Evento</th>}
            <th>Tipo</th>
            <th>Pagamento</th>
            <th>Próx. venc.</th>
            <th className="right">Total</th>
            <th className="right">Em aberto</th>
          </tr>
        </thead>
        <tbody>
          {contracts.map((contract) => (
            <tr key={contract.id}>
              <td data-label="Contratante">
                <Link to={`/contratos/${contract.id}`} className="link-strong">
                  {contract.counterparty}
                </Link>
                <span className="muted block">
                  {contract.installmentCount}x
                  {contract.hasAttachment ? ' · PDF anexado' : ' · sem PDF'}
                </span>
              </td>
              {showEvent && <td data-label="Evento">{contract.eventName}</td>}
              <td data-label="Tipo">
                <span className={`badge badge-${contract.direction.toLowerCase()}`}>
                  {DIRECTION_LABELS[contract.direction]}
                </span>
              </td>
              <td data-label="Pagamento">{PAYMENT_METHOD_LABELS[contract.paymentMethod]}</td>
              <td data-label="Próx. venc.">
                {contract.nextDueDate ? formatDate(contract.nextDueDate) : '—'}
                {contract.overdueAmount > 0 && (
                  <span className="expense block">
                    {formatCurrency(contract.overdueAmount)} vencido
                  </span>
                )}
              </td>
              <td data-label="Total" className="right amount">
                {formatCurrency(contract.totalAmount)}
              </td>
              <td data-label="Em aberto" className="right amount">
                {formatCurrency(contract.openAmount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
