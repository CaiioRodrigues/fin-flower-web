import { useState } from 'react'
import MoneyInput from './MoneyInput.jsx'
import { clearCashOpening, saveCashOpening } from '../api/cash.js'
import { formatCurrency, formatDate } from '../utils/format.js'

/**
 * O saldo que já existia quando o sistema começou a ser usado.
 *
 * Sem ele o número no topo da tela é a soma do que foi digitado: quem começou a
 * usar o sistema em setembro lê "saldo" onde está escrito "variação desde
 * setembro", e a projeção erra pelo mesmo valor. Por isso o convite aparece
 * enquanto ninguém declarou nada — é a diferença entre o caixa ser verdade e ser
 * um relatório bonito do que passou.
 *
 * O sinal fica num campo à parte porque a máscara de dinheiro só aceita
 * dígitos. Colocá-lo lá dentro pediria um menos digitado na posição certa; aqui
 * ele é uma escolha entre duas frases, e ninguém erra qual delas é a sua.
 */
export default function CashOpeningCard({ opening, onChange }) {
  const [editing, setEditing] = useState(false)

  if (!editing) {
    return opening
      ? <Declared opening={opening} onEdit={() => setEditing(true)} onChange={onChange} />
      : <Invitation onStart={() => setEditing(true)} />
  }

  return (
    <OpeningForm
      opening={opening}
      onDone={() => setEditing(false)}
      onChange={onChange}
    />
  )
}

function Invitation({ onStart }) {
  return (
    <div className="card status-card" role="status">
      <p>
        <strong>O saldo começa do zero.</strong> Enquanto você não disser quanto tinha em caixa
        no dia em que começou a usar o sistema, o número acima é quanto você movimentou daqui
        para cá — não quanto você tem.{' '}
        <button type="button" className="link as-button" onClick={onStart}>
          Informar o saldo inicial
        </button>
      </p>
    </div>
  )
}

function Declared({ opening, onEdit, onChange }) {
  const [busy, setBusy] = useState(false)

  async function handleClear() {
    if (!window.confirm('Remover o saldo inicial? O caixa volta a somar só os lançamentos.')) return

    setBusy(true)
    try {
      await clearCashOpening()
      await onChange()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="card status-card" role="status">
      <p>
        <strong>Saldo inicial:</strong>{' '}
        <span className={`amount ${opening.amount < 0 ? 'expense' : 'income'}`}>
          {formatCurrency(opening.amount)}
        </span>{' '}
        em {formatDate(opening.occurredOn)}
        {opening.notes && <> · {opening.notes}</>}
        {opening.ignoredEntries > 0 && (
          <>
            {' '}— {opening.ignoredEntries}{' '}
            {opening.ignoredEntries === 1 ? 'lançamento anterior' : 'lançamentos anteriores'} a essa
            data {opening.ignoredEntries === 1 ? 'fica' : 'ficam'} fora da conta, porque esse valor
            já {opening.ignoredEntries === 1 ? 'o contém' : 'os contém'}.
          </>
        )}
      </p>

      <div className="actions">
        <button type="button" className="btn small" onClick={onEdit} disabled={busy}>
          Corrigir
        </button>
        <button type="button" className="btn small ghost" onClick={handleClear} disabled={busy}>
          Remover
        </button>
      </div>
    </div>
  )
}

function OpeningForm({ opening, onDone, onChange }) {
  const [amount, setAmount] = useState(opening ? String(Math.abs(opening.amount)) : '')
  const [negative, setNegative] = useState((opening?.amount ?? 0) < 0)
  const [occurredOn, setOccurredOn] = useState(
    opening?.occurredOn ?? new Date().toISOString().slice(0, 10),
  )
  const [notes, setNotes] = useState(opening?.notes ?? '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(event) {
    event.preventDefault()
    setBusy(true)
    setError(null)

    try {
      const size = Number(amount) || 0
      await saveCashOpening({ amount: negative ? -size : size, occurredOn, notes })
      await onChange()
      onDone()
    } catch (caught) {
      setError(caught)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="card form" onSubmit={handleSubmit}>
      <h3>Saldo inicial</h3>
      <p className="muted">
        Quanto havia em caixa e no banco no dia em que você começou a usar o sistema. Lançamentos
        anteriores a essa data ficam fora do saldo — este valor já os contém.
      </p>

      {error && (
        <p className="expense" role="alert">
          {error.message}
        </p>
      )}

      <div className="row">
        <div className="field">
          <label htmlFor="opening-amount">Valor</label>
          <MoneyInput
            id="opening-amount"
            name="amount"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="opening-sign">Situação</label>
          <select
            id="opening-sign"
            value={negative ? 'negative' : 'positive'}
            onChange={(event) => setNegative(event.target.value === 'negative')}
          >
            <option value="positive">Tinha em caixa</option>
            <option value="negative">Estava no negativo</option>
          </select>
        </div>

        <div className="field">
          <label htmlFor="opening-date">Nesta data</label>
          <input
            id="opening-date"
            type="date"
            value={occurredOn}
            onChange={(event) => setOccurredOn(event.target.value)}
            required
          />
        </div>
      </div>

      <div className="field">
        <label htmlFor="opening-notes">De onde veio o número (opcional)</label>
        <input
          id="opening-notes"
          type="text"
          value={notes}
          maxLength={300}
          placeholder="Ex.: extrato do banco + dinheiro na gaveta"
          onChange={(event) => setNotes(event.target.value)}
        />
      </div>

      <div className="actions">
        <button type="submit" className="btn primary" disabled={busy}>
          {busy ? 'Salvando…' : 'Salvar'}
        </button>
        <button type="button" className="btn ghost" onClick={onDone} disabled={busy}>
          Cancelar
        </button>
      </div>
    </form>
  )
}
