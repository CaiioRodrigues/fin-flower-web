import { api } from './client.js'
import { query } from './query.js'

/** Gastos fixos, pró-labore e receitas recorrentes — separados por `kind`. */
export function listRecurringItems({ kind, onlyActive, competence } = {}) {
  return api.get(`/api/recurring-items${query({ kind, onlyActive, competence })}`)
}

export function createRecurringItem(item) {
  return api.post('/api/recurring-items', item)
}

export function updateRecurringItem(itemId, item) {
  return api.put(`/api/recurring-items/${itemId}`, item)
}

export function setRecurringItemActive(itemId, active) {
  return api.post(`/api/recurring-items/${itemId}/${active ? 'activate' : 'deactivate'}`)
}

export function deleteRecurringItem(itemId) {
  return api.delete(`/api/recurring-items/${itemId}`)
}

/** Lança a competência no caixa. Rodar duas vezes não duplica. */
export function generateMonth(competence, itemIds) {
  return api.post('/api/recurring-items/generate', { competence, itemIds })
}
