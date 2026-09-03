import { api } from './client.js'
import { query } from './query.js'

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

export function getCashReport({ from, to } = {}) {
  return api.get(`/api/reports/cash${query({ from, to })}`)
}
