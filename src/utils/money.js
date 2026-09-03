const formatter = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/** Centavos inteiros → "1.234,56". Trabalhar em centavos evita erro de ponto flutuante. */
export function formatCents(cents) {
  return formatter.format(cents / 100)
}

/** Só os dígitos importam: o que a pessoa digita vira centavos, da direita para a esquerda. */
export function digitsToCents(text) {
  const digits = String(text).replace(/\D/g, '').slice(0, 15)
  return digits === '' ? null : Number(digits)
}

/** Reais → centavos. O arredondamento evita que 335.99 vire 33598. */
export function valueToCents(value) {
  if (value === '' || value === null || value === undefined) return null
  return Math.round(Number(value) * 100)
}
