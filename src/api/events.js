import { api } from './client.js'

/** Monta a query string ignorando filtros vazios. */
function query(params) {
  const search = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') search.set(key, value)
  }

  const queryString = search.toString()
  return queryString ? `?${queryString}` : ''
}

export function listEvents({ from, to, status } = {}) {
  return api.get(`/api/events${query({ from, to, status })}`)
}

export function getEvent(eventId) {
  return api.get(`/api/events/${eventId}`)
}

export function createEvent({ name, description, eventDate }) {
  return api.post('/api/events', { name, description, eventDate })
}

export function updateEvent(eventId, { name, description, eventDate }) {
  return api.put(`/api/events/${eventId}`, { name, description, eventDate })
}

export function deleteEvent(eventId) {
  return api.delete(`/api/events/${eventId}`)
}

export function closeEvent(eventId) {
  return api.post(`/api/events/${eventId}/close`)
}

export function reopenEvent(eventId) {
  return api.post(`/api/events/${eventId}/reopen`)
}

export function addEntry(eventId, entry) {
  return api.post(`/api/events/${eventId}/entries`, entry)
}

export function updateEntry(eventId, entryId, entry) {
  return api.put(`/api/events/${eventId}/entries/${entryId}`, entry)
}

export function removeEntry(eventId, entryId) {
  return api.delete(`/api/events/${eventId}/entries/${entryId}`)
}

export function getCashReport({ from, to } = {}) {
  return api.get(`/api/reports/cash${query({ from, to })}`)
}
