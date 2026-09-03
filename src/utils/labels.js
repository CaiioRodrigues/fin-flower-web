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

export const ENTRY_TYPE_LABELS = {
  Income: 'Entrada',
  Expense: 'Saída',
}

/** De onde o lançamento veio — define o que a tela deixa editar. */
export const ENTRY_SOURCE_LABELS = {
  Manual: 'Manual',
  Contract: 'Contrato',
  Recurring: 'Fixo',
}

export const RECURRING_KIND_LABELS = {
  FixedExpense: 'Gasto fixo',
  ProLabore: 'Pró-labore',
  FixedIncome: 'Receita fixa',
}

export const QUOTE_STATUS_LABELS = {
  Draft: 'Rascunho',
  Sent: 'Enviado',
  Approved: 'Aprovado',
  Rejected: 'Recusado',
}
