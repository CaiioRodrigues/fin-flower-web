/**
 * Competência no formato "aaaa-mm", o mesmo que a API usa. É um mês, não uma
 * data: tratar como data convida ao erro de ">= 01/09" deixar o resto de
 * setembro de fora.
 */

const SHORT = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

const LONG = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
]

const PATTERN = /^(\d{4})-(\d{1,2})$/

export function parseCompetence(value) {
  const match = PATTERN.exec(String(value ?? '').trim())
  if (!match) return null

  const year = Number(match[1])
  const month = Number(match[2])

  return month >= 1 && month <= 12 ? { year, month } : null
}

export function isCompetence(value) {
  return parseCompetence(value) !== null
}

export function toCompetence(year, month) {
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}`
}

/** A competência do mês corrente, no fuso local — é o mês que a pessoa vive. */
export function currentCompetence() {
  const now = new Date()
  return toCompetence(now.getFullYear(), now.getMonth() + 1)
}

export function addMonths(competence, months) {
  const parsed = parseCompetence(competence)
  if (!parsed) return competence

  const zeroBased = parsed.year * 12 + (parsed.month - 1) + months
  return toCompetence(Math.floor(zeroBased / 12), (zeroBased % 12) + 1)
}

/** "set/2026" — o rótulo curto das tabelas. */
export function competenceLabel(competence) {
  const parsed = parseCompetence(competence)
  return parsed ? `${SHORT[parsed.month - 1]}/${parsed.year}` : '—'
}

/** "setembro de 2026" — o rótulo dos títulos de tela. */
export function competenceLongLabel(competence) {
  const parsed = parseCompetence(competence)
  return parsed ? `${LONG[parsed.month - 1]} de ${parsed.year}` : '—'
}

/** Primeiro e último dia da competência, para filtrar o livro-caixa por data. */
export function competenceRange(competence) {
  const parsed = parseCompetence(competence)
  if (!parsed) return { from: '', to: '' }

  const lastDay = new Date(Date.UTC(parsed.year, parsed.month, 0)).getUTCDate()

  return {
    from: `${toCompetence(parsed.year, parsed.month)}-01`,
    to: `${toCompetence(parsed.year, parsed.month)}-${String(lastDay).padStart(2, '0')}`,
  }
}

/** A data de hoje como competência da data informada — usada para pré-preencher. */
export function competenceOf(isoDate) {
  return String(isoDate ?? '').slice(0, 7)
}
