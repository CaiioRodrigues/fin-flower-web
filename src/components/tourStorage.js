const STORAGE_KEY = 'finflower.tour.seen'

/** Em navegador sem armazenamento, damos por visto: melhor calar que repetir. */
export function hasSeenTour() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return true
  }
}

export function rememberTour() {
  try {
    window.localStorage.setItem(STORAGE_KEY, '1')
  } catch {
    // Sem armazenamento o passeio volta na próxima sessão. Não é o fim do mundo.
  }
}
