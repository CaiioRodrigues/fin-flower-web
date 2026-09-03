import { describe, expect, it } from 'vitest'
import {
  addMonths,
  competenceLabel,
  competenceRange,
  isCompetence,
  parseCompetence,
  toCompetence,
} from '../competence.js'

describe('competência', () => {
  it('lê e recusa o formato', () => {
    expect(parseCompetence('2026-09')).toEqual({ year: 2026, month: 9 })
    expect(parseCompetence('2026-9')).toEqual({ year: 2026, month: 9 })
    expect(parseCompetence(' 2026-12 ')).toEqual({ year: 2026, month: 12 })

    expect(isCompetence('2026-13')).toBe(false)
    expect(isCompetence('2026-00')).toBe(false)
    expect(isCompetence('setembro')).toBe(false)
    expect(isCompetence('')).toBe(false)
    expect(isCompetence(null)).toBe(false)
  })

  it('vira o ano ao somar meses', () => {
    expect(addMonths('2026-11', 3)).toBe('2027-02')
    expect(addMonths('2026-01', -1)).toBe('2025-12')
    expect(addMonths('2026-12', 1)).toBe('2027-01')
    expect(addMonths('2026-06', 12)).toBe('2027-06')
  })

  it('mantém o mês ao somar doze', () => {
    for (let month = 1; month <= 12; month += 1) {
      expect(addMonths(toCompetence(2026, month), 12)).toBe(toCompetence(2027, month))
    }
  })

  it('cobre o mês inteiro no intervalo de datas', () => {
    // Um intervalo que parasse no dia 30 deixaria 31/01 fora do mês.
    expect(competenceRange('2026-01')).toEqual({ from: '2026-01-01', to: '2026-01-31' })
    expect(competenceRange('2026-02')).toEqual({ from: '2026-02-01', to: '2026-02-28' })
    expect(competenceRange('2028-02')).toEqual({ from: '2028-02-01', to: '2028-02-29' })
    expect(competenceRange('2026-04')).toEqual({ from: '2026-04-01', to: '2026-04-30' })
  })

  it('rotula em português', () => {
    expect(competenceLabel('2026-09')).toBe('set/2026')
    expect(competenceLabel('2026-03')).toBe('mar/2026')
    expect(competenceLabel('lixo')).toBe('—')
  })
})
