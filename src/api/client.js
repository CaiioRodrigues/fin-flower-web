import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
} from '../auth/tokenStorage.js'

// Padrão igual à porta http de desenvolvimento da API, para quem ainda não criou
// o .env.local não bater numa porta inexistente.
const BASE_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:5212').replace(/\/$/, '')

/** Erro de API com o status e os erros por campo, quando a resposta os traz. */
export class ApiError extends Error {
  constructor(message, { status, code, fieldErrors } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.fieldErrors = fieldErrors ?? null
  }
}

/** Avisado quando a sessão morre de vez, para a aplicação voltar ao login. */
let onSessionExpired = () => {}

export function setSessionExpiredHandler(handler) {
  onSessionExpired = handler
}

async function parseError(response) {
  const fallback = 'Não foi possível concluir a operação. Tente novamente.'

  let problem = null
  try {
    problem = await response.json()
  } catch {
    return new ApiError(fallback, { status: response.status })
  }

  // A API responde ProblemDetails: 'errors' por campo na validação,
  // 'detail' e 'code' nos demais casos.
  const fieldErrors = problem?.errors ?? null
  const message =
    problem?.detail ??
    (fieldErrors ? Object.values(fieldErrors).flat()[0] : null) ??
    problem?.title ??
    fallback

  return new ApiError(message, { status: response.status, code: problem?.code, fieldErrors })
}

async function send(path, { method = 'GET', body, auth = true, signal, responseType = 'json' } = {}) {
  // FormData carrega o próprio boundary no Content-Type: defini-lo aqui
  // quebraria o envio do arquivo.
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData

  const headers = { Accept: responseType === 'blob' ? '*/*' : 'application/json' }
  if (body !== undefined && !isFormData) headers['Content-Type'] = 'application/json'

  const token = getAccessToken()
  if (auth && token) headers.Authorization = `Bearer ${token}`

  let response
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined || isFormData ? body : JSON.stringify(body),
      signal,
    })
  } catch (networkError) {
    // fetch só rejeita quando a requisição nem chegou: API fora do ar, endereço
    // errado ou CORS. "Failed to fetch" não diz nada disso a quem está usando.
    if (networkError.name === 'AbortError') throw networkError

    throw new ApiError(
      `Não foi possível falar com a API em ${BASE_URL}. Verifique se ela está rodando e se VITE_API_URL aponta para o endereço certo.`,
      { code: 'network.unreachable' },
    )
  }

  if (!response.ok) throw await parseError(response)
  if (response.status === 204) return null

  return responseType === 'blob' ? response.blob() : response.json()
}

/**
 * Renovação em voo. Se várias chamadas tomarem 401 ao mesmo tempo, todas
 * esperam o mesmo refresh — sem isso, cada uma gastaria um token da rotação e
 * as concorrentes derrubariam a sessão por reuso.
 */
let refreshInFlight = null

export async function refreshSession() {
  if (refreshInFlight) return refreshInFlight

  const refreshToken = getRefreshToken()
  if (!refreshToken) throw new ApiError('Sessão expirada.', { status: 401 })

  refreshInFlight = send('/api/auth/refresh', {
    method: 'POST',
    body: { refreshToken },
    auth: false,
  })
    .then((session) => {
      applySession(session)
      return session
    })
    .finally(() => {
      refreshInFlight = null
    })

  return refreshInFlight
}

export function applySession(session) {
  setAccessToken(session.accessToken)
  setRefreshToken(session.refreshToken)
}

/**
 * Chamada autenticada com renovação transparente: um 401 dispara o refresh e
 * a requisição original é repetida uma única vez.
 */
export async function request(path, options = {}) {
  try {
    return await send(path, options)
  } catch (error) {
    const canRetry = error instanceof ApiError && error.status === 401 && options.auth !== false

    if (!canRetry) throw error

    try {
      await refreshSession()
    } catch {
      clearTokens()
      onSessionExpired()
      throw new ApiError('Sua sessão expirou. Faça login novamente.', { status: 401 })
    }

    return send(path, options)
  }
}

export const api = {
  get: (path, options) => request(path, { ...options, method: 'GET' }),
  post: (path, body, options) => request(path, { ...options, method: 'POST', body }),
  put: (path, body, options) => request(path, { ...options, method: 'PUT', body }),
  delete: (path, options) => request(path, { ...options, method: 'DELETE' }),

  /** Envia um arquivo. O navegador monta o multipart e o boundary. */
  upload: (path, file) => {
    const form = new FormData()
    form.append('file', file)
    return request(path, { method: 'POST', body: form })
  },

  /** Baixa um arquivo autenticado: um link comum não leva o token. */
  download: (path) => request(path, { method: 'GET', responseType: 'blob' }),
}
