import { useRef, useState } from 'react'
import { formatDate } from '../utils/format.js'

function formatSize(bytes) {
  return bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function DocumentPanel({ attachment, submitting, onUpload, onOpen, onRemove }) {
  const inputRef = useRef(null)
  const [error, setError] = useState(null)

  async function handleChange(event) {
    const file = event.target.files?.[0]
    if (!file) return

    setError(null)

    // Barra o óbvio aqui para poupar o envio; o servidor confere a assinatura
    // do arquivo, que é o que realmente vale.
    if (file.type && file.type !== 'application/pdf') {
      setError('O arquivo precisa ser um PDF.')
      event.target.value = ''
      return
    }

    try {
      await onUpload(file)
    } finally {
      // Permite reenviar o mesmo arquivo depois de um erro.
      event.target.value = ''
    }
  }

  return (
    <div className="card document-panel">
      <h3>Documento</h3>

      {error && (
        <div className="alert" role="alert">
          {error}
        </div>
      )}

      {attachment ? (
        <>
          <p className="document-file">
            📄 {attachment.fileName}
            <span className="muted block">
              {formatSize(attachment.sizeInBytes)} · enviado em{' '}
              {formatDate(attachment.uploadedAt.slice(0, 10))}
            </span>
          </p>

          <div className="actions">
            <button type="button" className="btn small" onClick={onOpen} disabled={submitting}>
              Abrir PDF
            </button>
            <button
              type="button"
              className="btn small"
              onClick={() => inputRef.current?.click()}
              disabled={submitting}
            >
              Substituir
            </button>
            <button
              type="button"
              className="btn small danger"
              onClick={onRemove}
              disabled={submitting}
            >
              Remover
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="muted">Nenhum PDF anexado a este contrato.</p>
          <button
            type="button"
            className="btn"
            onClick={() => inputRef.current?.click()}
            disabled={submitting}
          >
            {submitting ? 'Enviando…' : 'Anexar PDF'}
          </button>
        </>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        onChange={handleChange}
        hidden
        aria-label="Selecionar PDF do contrato"
      />
    </div>
  )
}
