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

const monthName = new Intl.DateTimeFormat('pt-BR', { month: 'short', year: 'numeric', timeZone: 'UTC' })

/** "out. de 2026" a partir do ano e mês que o relatório devolve. */
export function formatMonth(year, month) {
  return monthName.format(new Date(Date.UTC(year, month - 1, 1)))
}

/** Data de hoje somada de meses, no formato aceito por input[type=date]. */
export function addMonthsISO(isoDate, months) {
  const date = new Date(`${isoDate}T00:00:00Z`)
  date.setUTCMonth(date.getUTCMonth() + months)
  return date.toISOString().slice(0, 10)
}
