import { useState } from 'react'
import MoneyInput from './MoneyInput.jsx'
import { formatCurrency } from '../utils/format.js'

const empty = { description: '', quantity: '1', unitPrice: '', unit: '' }

/**
 * As linhas da proposta. O total de cada uma é calculado na hora, com o mesmo
 * arredondamento do servidor — o cliente confere linha a linha, e a soma
 * mostrada aqui tem de bater com a que ele vai receber.
 */
export default function QuoteItemsEditor({ items, readOnly, onAdd, onUpdate, onRemove, busy }) {
  const [values, setValues] = useState(empty)
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState(null)

  function handleChange(event) {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
  }

  function startEdit(item) {
    setEditingId(item.id)
    setValues({
      description: item.description,
      quantity: String(item.quantity),
      unitPrice: String(item.unitPrice),
      unit: item.unit ?? '',
    })
  }

  function reset() {
    setEditingId(null)
    setValues(empty)
    setError(null)
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const quantity = Number(values.quantity)
    const unitPrice = Number(values.unitPrice)

    if (!values.description.trim()) return setError('Informe a descrição do item.')
    if (!(quantity > 0)) return setError('A quantidade deve ser maior que zero.')
    if (!(unitPrice > 0)) return setError('O valor unitário deve ser maior que zero.')

    setError(null)

    const payload = {
      description: values.description.trim(),
      quantity,
      unitPrice,
      unit: values.unit.trim() || null,
    }

    if (editingId) await onUpdate(editingId, payload)
    else await onAdd(payload)

    reset()
  }

  const preview = Number(values.quantity) * Number(values.unitPrice)

  return (
    <div className="card">
      <h3>Itens da proposta</h3>

      {items.length === 0 ? (
        <p className="muted">Nenhum item ainda. Some as linhas do que vai ser cobrado.</p>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Descrição</th>
                <th className="right">Qtd.</th>
                <th className="right">Unitário</th>
                <th className="right">Total</th>
                {!readOnly && <th className="right">Ações</th>}
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td data-label="#">{item.position}</td>
                  <td data-label="Descrição">{item.description}</td>
                  <td data-label="Quantidade" className="right">
                    {formatQuantity(item.quantity)}
                    {item.unit ? ` ${item.unit}` : ''}
                  </td>
                  <td data-label="Unitário" className="right">
                    {formatCurrency(item.unitPrice)}
                  </td>
                  <td data-label="Total" className="right amount strong">
                    {formatCurrency(item.total)}
                  </td>
                  {!readOnly && (
                    <td data-label="Ações" className="right">
                      <button type="button" className="btn small" onClick={() => startEdit(item)} disabled={busy}>
                        Editar
                      </button>
                      <button
                        type="button"
                        className="btn small danger"
                        onClick={() => onRemove(item.id)}
                        disabled={busy}
                      >
                        Remover
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!readOnly && (
        <form className="form item-form" onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="item-description">Descrição do item</label>
            <input
              id="item-description"
              name="description"
              value={values.description}
              onChange={handleChange}
              placeholder="Ex.: Estrutura de palco"
            />
          </div>

          <div className="row">
            <div className="field">
              <label htmlFor="item-quantity">Quantidade</label>
              <input
                id="item-quantity"
                name="quantity"
                type="number"
                min="0"
                step="0.001"
                value={values.quantity}
                onChange={handleChange}
              />
            </div>

            <div className="field">
              <label htmlFor="item-unit">Unidade</label>
              <input
                id="item-unit"
                name="unit"
                value={values.unit}
                onChange={handleChange}
                placeholder="un, h, diária"
              />
            </div>

            <div className="field">
              <label htmlFor="item-price">Valor unitário</label>
              <MoneyInput
                id="item-price"
                name="unitPrice"
                value={values.unitPrice}
                onChange={handleChange}
              />
            </div>
          </div>

          {preview > 0 && (
            <p className="hint">Total da linha: {formatCurrency(preview)}</p>
          )}

          {error && <span className="error">{error}</span>}

          <div className="actions">
            <button type="submit" className="btn primary" disabled={busy}>
              {editingId ? 'Salvar item' : 'Adicionar item'}
            </button>
            {editingId && (
              <button type="button" className="btn ghost" onClick={reset} disabled={busy}>
                Cancelar
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  )
}

/** Quantidade sem casas decimais à toa: "3" em vez de "3,000". */
function formatQuantity(quantity) {
  return Number(quantity).toLocaleString('pt-BR', { maximumFractionDigits: 3 })
}
