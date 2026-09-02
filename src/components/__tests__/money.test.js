import { describe, expect, it } from 'vitest'
import { digitsToCents, formatCents, valueToCents } from '../../utils/money.js'

describe('máscara de dinheiro', () => {
  it('monta o valor da direita para a esquerda', () => {
    expect(formatCents(digitsToCents('1'))).toBe('0,01')
    expect(formatCents(digitsToCents('12'))).toBe('0,12')
    expect(formatCents(digitsToCents('123'))).toBe('1,23')
    expect(formatCents(digitsToCents('123456'))).toBe('1.234,56')
    expect(formatCents(digitsToCents('123456789'))).toBe('1.234.567,89')
  })

  it('ignora o que não é dígito', () => {
    // Colar "R$ 1.234,56" precisa resultar no mesmo valor.
    expect(digitsToCents('R$ 1.234,56')).toBe(123456)
    expect(digitsToCents('abc')).toBeNull()
    expect(digitsToCents('')).toBeNull()
  })

  it('converte reais para centavos sem erro de ponto flutuante', () => {
    // 335.99 * 100 dá 33598.999... em ponto flutuante.
    expect(valueToCents(335.99)).toBe(33599)
    expect(valueToCents(0.07)).toBe(7)
    expect(valueToCents(1234.56)).toBe(123456)
    expect(valueToCents('')).toBeNull()
  })

  it('mantém o valor ao ir e voltar da máscara', () => {
    for (const reais of [0.01, 9.99, 100, 1234.56, 999999.99]) {
      expect(digitsToCents(formatCents(valueToCents(reais)))).toBe(valueToCents(reais))
    }
  })
})
