import { useId } from 'react'
import { digitsToCents, formatCents, valueToCents } from '../utils/money.js'

/**
 * Campo de dinheiro em formato brasileiro. O usuário digita só números e a
 * máscara monta o valor da direita para a esquerda — digitar "123456" mostra
 * "1.234,56". Devolve o valor em reais para quem usa o campo.
 */
export default function MoneyInput({
  id,
  name,
  value,
  onChange,
  placeholder = '0,00',
  invalid,
  disabled,
  required,
}) {
  const generatedId = useId()
  const inputId = id ?? generatedId

  const cents = valueToCents(value)
  const display = cents === null ? '' : formatCents(cents)

  function handleChange(event) {
    const nextCents = digitsToCents(event.target.value)

    onChange({
      target: {
        name,
        // Devolve em reais, para os formulários seguirem lidando com número.
        value: nextCents === null ? '' : String(nextCents / 100),
      },
    })
  }

  return (
    <div className="money-field">
      <span className="money-prefix" aria-hidden="true">
        R$
      </span>
      <input
        id={inputId}
        name={name}
        // 'decimal' abre o teclado numérico no celular sem trazer o sinal de menos.
        inputMode="decimal"
        value={display}
        onChange={handleChange}
        placeholder={placeholder}
        aria-invalid={invalid}
        disabled={disabled}
        required={required}
        autoComplete="off"
      />
    </div>
  )
}
