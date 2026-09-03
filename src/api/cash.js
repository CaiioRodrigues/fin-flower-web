import { api } from './client.js'
import { query } from './query.js'

/** O caixa mês a mês. Competência no formato aaaa-mm; em branco, os últimos 12 meses. */
export function getMonthlyCash({ from, to } = {}) {
  return api.get(`/api/cash/monthly${query({ from, to })}`)
}
