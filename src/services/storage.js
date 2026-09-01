const STORAGE_KEY = 'fin-flower:transactions'

export function loadTransactions() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    // Storage indisponível (modo privado, cota, JSON corrompido): começa vazio.
    return []
  }
}

export function saveTransactions(transactions) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions))
  } catch {
    // Persistir é um extra: falhar aqui não pode quebrar a tela.
  }
}
