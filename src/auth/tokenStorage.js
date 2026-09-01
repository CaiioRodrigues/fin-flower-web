const REFRESH_KEY = 'fin-flower:refresh-token'

/**
 * O access token vive só em memória: some ao fechar a aba e nunca fica exposto
 * a um script que leia o localStorage. Só o refresh token é persistido, porque
 * sem ele a sessão não sobreviveria a um F5 — e ele é rotacionado a cada uso,
 * então um valor vazado deixa de valer no próximo refresh.
 */
let accessToken = null

export function getAccessToken() {
  return accessToken
}

export function setAccessToken(token) {
  accessToken = token
}

export function getRefreshToken() {
  try {
    return window.localStorage.getItem(REFRESH_KEY)
  } catch {
    return null
  }
}

export function setRefreshToken(token) {
  try {
    if (token) window.localStorage.setItem(REFRESH_KEY, token)
    else window.localStorage.removeItem(REFRESH_KEY)
  } catch {
    // Modo privado ou storage cheio: a sessão vale só para esta aba.
  }
}

export function clearTokens() {
  accessToken = null
  setRefreshToken(null)
}
