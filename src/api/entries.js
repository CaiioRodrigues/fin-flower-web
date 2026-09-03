import { api } from './client.js'
import { query } from './query.js'

/**
 * O livro-caixa. O evento é um filtro entre outros — `withoutEvent` traz o que
 * não pertence a trabalho nenhum, que é a maior parte do custo de um mês.
 */
export function listEntries({
  from,
  to,
  type,
  source,
  eventId,
  withoutEvent,
  category,
  search,
  page,
  pageSize,
} = {}) {
  return api.get(
    `/api/entries${query({ from, to, type, source, eventId, withoutEvent, category, search, page, pageSize })}`,
  )
}

export function getEntry(entryId) {
  return api.get(`/api/entries/${entryId}`)
}

export function createEntry(entry) {
  return api.post('/api/entries', entry)
}

export function updateEntry(entryId, entry) {
  return api.put(`/api/entries/${entryId}`, entry)
}

export function deleteEntry(entryId) {
  return api.delete(`/api/entries/${entryId}`)
}

export function listCategories() {
  return api.get('/api/entries/categories')
}
