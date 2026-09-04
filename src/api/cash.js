import { api } from './client.js'
import { query } from './query.js'

/** O caixa mês a mês. Competência no formato aaaa-mm; em branco, os últimos 12 meses. */
export function getMonthlyCash({ from, to } = {}) {
  return api.get(`/api/cash/monthly${query({ from, to })}`)
}

/**
 * O saldo que já existia quando o sistema começou a ser usado. Sem ele o "saldo
 * em caixa" é a soma do que foi digitado, e quem começou a usar o sistema no
 * meio do ano lê variação achando que lê saldo.
 *
 * Devolve null quando ninguém declarou nada — a API responde 204 nesse caso.
 */
export function getCashOpening() {
  return api.get('/api/cash/opening')
}

export function saveCashOpening({ amount, occurredOn, notes }) {
  return api.put('/api/cash/opening', { amount, occurredOn, notes: notes || null })
}

export function clearCashOpening() {
  return api.delete('/api/cash/opening')
}
