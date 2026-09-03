import { api } from './client.js'
import { query } from './query.js'

export function listQuotes({ status, eventId, search } = {}) {
  return api.get(`/api/quotes${query({ status, eventId, search })}`)
}

export function getQuote(quoteId) {
  return api.get(`/api/quotes/${quoteId}`)
}

export function createQuote(quote) {
  return api.post('/api/quotes', quote)
}

export function updateQuote(quoteId, quote) {
  return api.put(`/api/quotes/${quoteId}`, quote)
}

export function deleteQuote(quoteId) {
  return api.delete(`/api/quotes/${quoteId}`)
}

export function addQuoteItem(quoteId, item) {
  return api.post(`/api/quotes/${quoteId}/items`, item)
}

export function updateQuoteItem(quoteId, itemId, item) {
  return api.put(`/api/quotes/${quoteId}/items/${itemId}`, item)
}

export function removeQuoteItem(quoteId, itemId) {
  return api.delete(`/api/quotes/${quoteId}/items/${itemId}`)
}

export function applyDiscount(quoteId, amount) {
  return api.put(`/api/quotes/${quoteId}/discount`, { amount })
}

export function sendQuote(quoteId) {
  return api.post(`/api/quotes/${quoteId}/send`)
}

export function rejectQuote(quoteId) {
  return api.post(`/api/quotes/${quoteId}/reject`)
}

export function reopenQuote(quoteId) {
  return api.post(`/api/quotes/${quoteId}/reopen`)
}

/** Aprovar é o momento em que a proposta vira previsão de caixa. */
export function approveQuote(quoteId, approval) {
  return api.post(`/api/quotes/${quoteId}/approve`, approval)
}
