import { Link } from 'react-router-dom'
import { competenceLabel } from '../utils/competence.js'
import { formatCurrency } from '../utils/format.js'

/**
 * O caixa mês a mês. A coluna de saldo é a razão da tabela existir: cada linha
 * abre com o fechamento da anterior, então ler de cima a baixo conta a história
 * do dinheiro sem ninguém somar nada.
 */
export default function MonthlyCashTable({ months, bestIndex, worstIndex }) {
  if (months.length === 0) {
    return (
      <div className="card empty">
        <p>Nenhum mês no período.</p>
      </div>
    )
  }

  return (
    <div className="card table-wrapper">
      <table className="table">
        <thead>
          <tr>
            <th>Mês</th>
            <th className="right">Entradas</th>
            <th className="right">Saídas</th>
            <th className="right">Resultado</th>
            <th className="right">Saldo</th>
            <th className="right">Fixos</th>
            <th className="right">Pró-labore</th>
            <th className="right">Lanç.</th>
          </tr>
        </thead>
        <tbody>
          {months.map((month, index) => (
            <tr key={month.competence} className={month.entryCount === 0 ? 'row-quiet' : undefined}>
              <td data-label="Mês">
                <Link className="link" to={`/lancamentos?competencia=${month.competence}`}>
                  {competenceLabel(month.competence)}
                </Link>
                {index === bestIndex && <span className="tag good">melhor</span>}
                {index === worstIndex && <span className="tag bad">pior</span>}
              </td>
              <td data-label="Entradas" className="right amount income">
                {formatCurrency(month.income)}
              </td>
              <td data-label="Saídas" className="right amount expense">
                {formatCurrency(month.expense)}
              </td>
              <td
                data-label="Resultado"
                className={`right amount ${month.result < 0 ? 'expense' : 'income'}`}
              >
                {formatCurrency(month.result)}
              </td>
              <td
                data-label="Saldo"
                className={`right amount strong ${month.closingBalance < 0 ? 'expense' : ''}`}
              >
                {formatCurrency(month.closingBalance)}
              </td>
              <td data-label="Fixos" className="right muted-cell">
                {formatCurrency(month.fixedExpense)}
              </td>
              <td data-label="Pró-labore" className="right muted-cell">
                {formatCurrency(month.proLabore)}
              </td>
              <td data-label="Lançamentos" className="right muted-cell">
                {month.entryCount}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
