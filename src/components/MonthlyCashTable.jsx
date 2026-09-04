import { Link } from 'react-router-dom'
import { competenceLabel } from '../utils/competence.js'
import { formatCurrency } from '../utils/format.js'

/**
 * A linha do tempo do caixa. As colunas mudam de sentido no meio da tabela: até
 * o mês corrente elas contam o que de fato se moveu; do mês corrente em diante,
 * o que está previsto. A coluna de saldo projetado só começa onde a previsão
 * começa — antes dela seria uma cópia do saldo realizado.
 *
 * Meses anteriores ao saldo inicial saem em branco de propósito: o que
 * aconteceu antes dele já está dentro dele. Mostrar "R$ 0,00" ali seria afirmar
 * que o caixa estava zerado, e a pessoa que digitou aqueles meses acharia que
 * perdeu os dados.
 */
export default function MonthlyCashTable({ months, bestIndex, worstIndex, openingOn }) {
  if (months.length === 0) {
    return (
      <div className="card empty">
        <p>Nenhum mês no período.</p>
      </div>
    )
  }

  const firstForecast = months.findIndex(
    (month) => month.expectedIncome > 0 || month.expectedExpense > 0 || month.isForecast,
  )

  // A competência do saldo inicial: tudo antes dela é anterior ao começo da
  // história registrada.
  const openingCompetence = openingOn ? openingOn.slice(0, 7) : null

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
            <th className="right">A entrar</th>
            <th className="right">A sair</th>
            <th className="right">Projetado</th>
          </tr>
        </thead>
        <tbody>
          {months.map((month, index) => {
            const expects = month.expectedIncome > 0 || month.expectedExpense > 0
            const projects = firstForecast >= 0 && index >= firstForecast
            const beforeOpening = openingCompetence !== null && month.competence < openingCompetence

            return (
              <tr
                key={month.competence}
                className={rowClass(month, index === firstForecast, beforeOpening)}
              >
                <td data-label="Mês">
                  <Link className="link" to={`/lancamentos?competencia=${month.competence}`}>
                    {competenceLabel(month.competence)}
                  </Link>
                  {month.isForecast && <span className="tag">previsto</span>}
                  {beforeOpening && <span className="tag">antes do saldo inicial</span>}
                  {index === bestIndex && <span className="tag good">melhor</span>}
                  {index === worstIndex && <span className="tag bad">pior</span>}
                </td>

                <td data-label="Entradas" className="right amount income">
                  {month.income > 0 ? formatCurrency(month.income) : <Dash />}
                </td>
                <td data-label="Saídas" className="right amount expense">
                  {month.expense > 0 ? formatCurrency(month.expense) : <Dash />}
                </td>
                <td
                  data-label="Resultado"
                  className={`right amount ${month.result < 0 ? 'expense' : 'income'}`}
                >
                  {month.entryCount > 0 ? formatCurrency(month.result) : <Dash />}
                </td>
                <td
                  data-label="Saldo"
                  className={`right amount strong ${month.closingBalance < 0 ? 'expense' : ''}`}
                >
                  {beforeOpening ? <Dash /> : formatCurrency(month.closingBalance)}
                </td>

                <td data-label="A entrar" className="right amount forecast income">
                  {expects && month.expectedIncome > 0 ? formatCurrency(month.expectedIncome) : <Dash />}
                </td>
                <td data-label="A sair" className="right amount forecast expense">
                  {expects && month.expectedExpense > 0 ? formatCurrency(month.expectedExpense) : <Dash />}
                </td>
                <td
                  data-label="Projetado"
                  className={`right amount forecast strong ${month.projectedBalance < 0 ? 'expense' : ''}`}
                >
                  {projects ? formatCurrency(month.projectedBalance) : <Dash />}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

/** O traço diz "nada aqui" sem competir com os números da coluna. */
function Dash() {
  return <span className="muted">—</span>
}

function rowClass(month, startsForecast, beforeOpening) {
  const classes = []

  // Mês sem movimento continua na série, mas não disputa a atenção.
  if (month.entryCount === 0 && !month.isForecast) classes.push('row-quiet')
  if (beforeOpening) classes.push('row-quiet')
  if (month.isForecast) classes.push('row-forecast')

  // Uma linha marca onde o registrado acaba e a projeção começa.
  if (startsForecast) classes.push('row-horizon')

  // O fundo diz o sinal antes de a pessoa ler o número. Um mês previsto é
  // tingido pelo resultado projetado, que é o único que ele tem; um mês sem
  // movimento não é tingido, porque zero não é lucro nem prejuízo.
  const result = month.isForecast ? month.projectedResult : month.result
  if (month.entryCount > 0 || month.isForecast) {
    if (result > 0) classes.push('row-positive')
    else if (result < 0) classes.push('row-negative')
  }

  return classes.join(' ') || undefined
}
