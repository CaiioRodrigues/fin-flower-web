/** Rótulos em português para os enums que a API devolve em inglês. */

export const DIRECTION_LABELS = {
  Receivable: 'A receber',
  Payable: 'A pagar',
}

export const PAYMENT_METHOD_LABELS = {
  Pix: 'Pix',
  Boleto: 'Boleto',
  CreditCard: 'Cartão de crédito',
  DebitCard: 'Cartão de débito',
  BankTransfer: 'Transferência',
  Cash: 'Dinheiro',
  Check: 'Cheque',
  Other: 'Outro',
}

export const INSTALLMENT_STATUS_LABELS = {
  Pending: 'Em aberto',
  Settled: 'Liquidada',
  Canceled: 'Cancelada',
}

export const PAYMENT_METHODS = Object.keys(PAYMENT_METHOD_LABELS)

/** "Recebida" ou "Paga", conforme o sentido do contrato. */
export function settlementLabel(direction) {
  return direction === 'Payable' ? 'Paga' : 'Recebida'
}

export function settleVerb(direction) {
  return direction === 'Payable' ? 'Pagar' : 'Receber'
}
