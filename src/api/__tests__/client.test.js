import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError, api, request, setSessionExpiredHandler } from '../client.js'
import { clearTokens, getAccessToken, getRefreshToken, setAccessToken, setRefreshToken } from '../../auth/tokenStorage.js'

/** Resposta pronta no formato que a API devolve. */
function jsonResponse(status, body) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  }
}

const session = (suffix) => ({
  accessToken: `novo-access-${suffix}`,
  refreshToken: `novo-refresh-${suffix}`,
  user: { id: 'u1', name: 'Caio', email: 'caio@example.com' },
})

describe('cliente HTTP', () => {
  beforeEach(() => {
    clearTokens()
    setAccessToken('access-velho')
    setRefreshToken('refresh-valido')
    setSessionExpiredHandler(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
    clearTokens()
  })

  it('envia o access token no cabeçalho', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, { ok: true }))
    vi.stubGlobal('fetch', fetchMock)

    await api.get('/api/events')

    const [, init] = fetchMock.mock.calls[0]
    expect(init.headers.Authorization).toBe('Bearer access-velho')
  })

  it('renova e repete a requisição depois de um 401', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(401, { detail: 'Token expirado.' }))
      .mockResolvedValueOnce(jsonResponse(200, session('a')))
      .mockResolvedValueOnce(jsonResponse(200, { eventos: [] }))
    vi.stubGlobal('fetch', fetchMock)

    const result = await api.get('/api/events')

    expect(result).toEqual({ eventos: [] })
    expect(fetchMock.mock.calls[1][0]).toContain('/api/auth/refresh')

    // A repetição já vai com o token novo.
    expect(fetchMock.mock.calls[2][1].headers.Authorization).toBe('Bearer novo-access-a')
    expect(getAccessToken()).toBe('novo-access-a')
    expect(getRefreshToken()).toBe('novo-refresh-a')
  })

  it('usa um único refresh para vários 401 simultâneos', async () => {
    const fetchMock = vi.fn((url) => {
      if (String(url).includes('/api/auth/refresh')) return Promise.resolve(jsonResponse(200, session('b')))
      // Só a primeira tentativa de cada chamada falha; a repetição passa.
      const token = fetchMock.mock.calls.at(-1)[1].headers.Authorization
      return Promise.resolve(
        token === 'Bearer access-velho'
          ? jsonResponse(401, { detail: 'Token expirado.' })
          : jsonResponse(200, { ok: true }),
      )
    })
    vi.stubGlobal('fetch', fetchMock)

    await Promise.all([api.get('/api/events'), api.get('/api/reports/cash'), api.get('/api/auth/me')])

    const refreshCalls = fetchMock.mock.calls.filter(([url]) => String(url).includes('/api/auth/refresh'))

    // Mais de um refresh gastaria tokens da rotação e o servidor derrubaria a
    // sessão por reuso — exatamente o que a fila em voo evita.
    expect(refreshCalls).toHaveLength(1)
  })

  it('encerra a sessão quando a renovação falha', async () => {
    const onExpired = vi.fn()
    setSessionExpiredHandler(onExpired)

    vi.stubGlobal('fetch', vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(401, { detail: 'Token expirado.' }))
      .mockResolvedValueOnce(jsonResponse(401, { detail: 'Sessão expirada.' })))

    await expect(api.get('/api/events')).rejects.toThrow(ApiError)

    expect(onExpired).toHaveBeenCalledOnce()
    expect(getAccessToken()).toBeNull()
    expect(getRefreshToken()).toBeNull()
  })

  it('não tenta renovar em rota anônima', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(401, { detail: 'E-mail ou senha inválidos.' }))
    vi.stubGlobal('fetch', fetchMock)

    await expect(
      request('/api/auth/login', { method: 'POST', body: {}, auth: false }),
    ).rejects.toThrow('E-mail ou senha inválidos.')

    expect(fetchMock).toHaveBeenCalledOnce()
  })

  it('repete a requisição apenas uma vez', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(401, { detail: 'Token expirado.' }))
      .mockResolvedValueOnce(jsonResponse(200, session('c')))
      .mockResolvedValueOnce(jsonResponse(401, { detail: 'Token expirado.' }))
    vi.stubGlobal('fetch', fetchMock)

    await expect(api.get('/api/events')).rejects.toThrow(ApiError)

    // Um 401 depois da renovação não vira laço infinito de refresh.
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })

  it('traduz os erros por campo do ProblemDetails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      jsonResponse(400, {
        title: 'Requisição inválida',
        status: 400,
        errors: { Password: ['A senha deve ter ao menos 8 caracteres.'] },
      }),
    ))

    const error = await request('/api/auth/register', { method: 'POST', body: {}, auth: false })
      .catch((thrown) => thrown)

    expect(error).toBeInstanceOf(ApiError)
    expect(error.status).toBe(400)
    expect(error.message).toBe('A senha deve ter ao menos 8 caracteres.')
    expect(error.fieldErrors.Password).toHaveLength(1)
  })

  it('envia arquivo sem definir o Content-Type', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, { fileName: 'contrato.pdf' }))
    vi.stubGlobal('fetch', fetchMock)

    await api.upload('/api/contracts/1/document', new File(['%PDF-1.4'], 'contrato.pdf'))

    const [, init] = fetchMock.mock.calls[0]
    expect(init.body).toBeInstanceOf(FormData)
    // Definir o Content-Type aqui apagaria o boundary que o navegador gera.
    expect(init.headers['Content-Type']).toBeUndefined()
    expect(init.headers.Authorization).toBe('Bearer access-velho')
  })

  it('baixa arquivo como blob, e não como json', async () => {
    const blob = new Blob(['%PDF-1.4'], { type: 'application/pdf' })
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, blob: async () => blob })
    vi.stubGlobal('fetch', fetchMock)

    const result = await api.download('/api/contracts/1/document')

    expect(result).toBe(blob)
    expect(fetchMock.mock.calls[0][1].headers.Accept).toBe('*/*')
  })

  it('renova e repete também o download de arquivo', async () => {
    const blob = new Blob(['%PDF-1.4'])
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(401, { detail: 'Token expirado.' }))
      .mockResolvedValueOnce(jsonResponse(200, session('d')))
      .mockResolvedValueOnce({ ok: true, status: 200, blob: async () => blob })
    vi.stubGlobal('fetch', fetchMock)

    await expect(api.download('/api/contracts/1/document')).resolves.toBe(blob)
  })

  it('devolve null em respostas 204', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 204, json: async () => null }))

    await expect(api.delete('/api/events/1')).resolves.toBeNull()
  })

  it('explica quando a API está inalcançável', async () => {
    // fetch rejeita, em vez de responder, quando a requisição nem chega.
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))

    const error = await api.get('/api/events', { auth: false }).catch((thrown) => thrown)

    expect(error).toBeInstanceOf(ApiError)
    expect(error.code).toBe('network.unreachable')
    expect(error.message).toContain('VITE_API_URL')
  })

  it('não tenta renovar a sessão quando a falha é de rede', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'))
    vi.stubGlobal('fetch', fetchMock)

    await expect(api.get('/api/events')).rejects.toThrow(ApiError)

    // Sem status 401 não há o que renovar: uma tentativa, e só.
    expect(fetchMock).toHaveBeenCalledOnce()
  })

  it('preserva o cancelamento da requisição', async () => {
    const abort = new DOMException('cancelado', 'AbortError')
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(abort))

    await expect(api.get('/api/events', { auth: false })).rejects.toThrow(abort)
  })

  it('não quebra quando o corpo do erro não é JSON', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => { throw new SyntaxError('não é json') },
    }))

    const error = await api.get('/api/events', { auth: false }).catch((thrown) => thrown)

    expect(error).toBeInstanceOf(ApiError)
    expect(error.status).toBe(500)
  })
})
