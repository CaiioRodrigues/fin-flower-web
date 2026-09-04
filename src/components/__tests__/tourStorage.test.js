import { afterEach, describe, expect, it, vi } from 'vitest'
import { hasSeenTour, rememberTour } from '../tourStorage.js'

const real = window.localStorage

function useStorage(stub) {
  Object.defineProperty(window, 'localStorage', { value: stub, configurable: true })
}

afterEach(() => {
  useStorage(real)
  window.localStorage.clear()
})

describe('memória do tutorial', () => {
  it('só considera visto depois de marcar', () => {
    expect(hasSeenTour()).toBe(false)
    rememberTour()
    expect(hasSeenTour()).toBe(true)
  })

  it('não insiste quando o armazenamento está bloqueado', () => {
    // Aba anônima ou navegador com dados de site desligados: ler lança. Repetir
    // o tutorial a cada carregamento seria pior que nunca mostrá-lo.
    useStorage({
      getItem: vi.fn(() => { throw new Error('bloqueado') }),
      setItem: vi.fn(() => { throw new Error('bloqueado') }),
    })

    expect(hasSeenTour()).toBe(true)
    expect(() => rememberTour()).not.toThrow()
  })
})
