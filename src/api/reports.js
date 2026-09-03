import { api } from './client.js'

const EXTENSIONS = { xlsx: 'xlsx', pdf: 'pdf' }

function fileName(stem, format) {
  const date = new Date().toISOString().slice(0, 10)
  return `${stem}-${date}.${EXTENSIONS[format]}`
}

export function downloadMonthlyCash(format, { from, to } = {}) {
  const search = new URLSearchParams({ format })
  if (from) search.set('from', from)
  if (to) search.set('to', to)

  return api.saveAs(`/api/reports/monthly/export?${search}`, fileName('caixa-mensal', format))
}

export function downloadCashReport(format, { from, to } = {}) {
  const search = new URLSearchParams({ format })
  if (from) search.set('from', from)
  if (to) search.set('to', to)

  return api.saveAs(`/api/reports/cash/export?${search}`, fileName('resultado-por-evento', format))
}

export function downloadCashFlow(format, { monthsAhead = 6 } = {}) {
  return api.saveAs(
    `/api/reports/cash-flow/export?format=${format}&monthsAhead=${monthsAhead}`,
    fileName('fluxo-de-caixa', format),
  )
}

export function downloadInstallments(format) {
  return api.saveAs(
    `/api/reports/installments/export?format=${format}`,
    fileName('parcelas-em-aberto', format),
  )
}

export function downloadEventStatement(eventId, format, eventName = 'evento') {
  const stem = `extrato-${eventName.toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g, '-')}`
  return api.saveAs(
    `/api/events/${eventId}/statement/export?format=${format}`,
    fileName(stem.replace(/^-|-$/g, ''), format),
  )
}
