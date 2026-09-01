const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

const date = new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' })

export function formatCurrency(value) {
  return currency.format(Number(value) || 0)
}

export function formatDate(isoDate) {
  if (!isoDate) return '-'
  const parsed = new Date(`${isoDate}T00:00:00Z`)
  return Number.isNaN(parsed.getTime()) ? '-' : date.format(parsed)
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10)
}
