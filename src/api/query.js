/** Monta a query string ignorando filtros vazios. */
export function query(params) {
  const search = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') search.set(key, value)
  }

  const queryString = search.toString()
  return queryString ? `?${queryString}` : ''
}
