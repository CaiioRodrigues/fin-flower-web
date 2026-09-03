import { api } from './client.js'

export function listContracts({ eventId, direction, onlyOpen } = {}) {
  const search = new URLSearchParams()
  if (eventId) search.set('eventId', eventId)
  if (direction) search.set('direction', direction)
  if (onlyOpen) search.set('onlyOpen', 'true')

  const queryString = search.toString()
  return api.get(`/api/contracts${queryString ? `?${queryString}` : ''}`)
}

export function getContract(contractId) {
  return api.get(`/api/contracts/${contractId}`)
}

/** O evento vai no corpo e é opcional: há contrato que não pertence a evento nenhum. */
export function createContract(contract) {
  return api.post('/api/contracts', contract)
}

export function updateContract(contractId, contract) {
  return api.put(`/api/contracts/${contractId}`, contract)
}

export function deleteContract(contractId) {
  return api.delete(`/api/contracts/${contractId}`)
}

export function settleInstallment(contractId, number, settlement) {
  return api.post(`/api/contracts/${contractId}/installments/${number}/settle`, settlement)
}

export function unsettleInstallment(contractId, number) {
  return api.post(`/api/contracts/${contractId}/installments/${number}/unsettle`)
}

export function cancelInstallment(contractId, number) {
  return api.post(`/api/contracts/${contractId}/installments/${number}/cancel`)
}

export function rescheduleInstallment(contractId, number, dueDate) {
  return api.put(`/api/contracts/${contractId}/installments/${number}/due-date`, { dueDate })
}

export function changeInstallmentAmount(contractId, number, amount) {
  return api.put(`/api/contracts/${contractId}/installments/${number}/amount`, { amount })
}

export function uploadDocument(contractId, file) {
  return api.upload(`/api/contracts/${contractId}/document`, file)
}

export function removeDocument(contractId) {
  return api.delete(`/api/contracts/${contractId}/document`)
}

/**
 * Abre o PDF numa aba nova. O download precisa passar pelo cliente autenticado,
 * porque um link comum não leva o token — daí buscar o blob e criar a URL local.
 */
export async function openDocument(contractId) {
  const blob = await api.download(`/api/contracts/${contractId}/document`)
  const url = URL.createObjectURL(blob)

  window.open(url, '_blank', 'noopener')

  // A URL fica válida enquanto a aba nova carrega; liberá-la evita segurar o
  // arquivo inteiro em memória pelo resto da sessão.
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
}

export function getCashFlow({ monthsAhead = 6 } = {}) {
  return api.get(`/api/reports/cash-flow?monthsAhead=${monthsAhead}`)
}
