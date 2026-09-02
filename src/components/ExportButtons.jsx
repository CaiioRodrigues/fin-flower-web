import { useState } from 'react'

/**
 * Par de botões de exportação. Mantém o próprio estado de "baixando" para a
 * tela inteira não travar enquanto o arquivo é gerado no servidor.
 */
export default function ExportButtons({ label = 'Exportar', onExport, disabled }) {
  const [downloading, setDownloading] = useState(null)
  const [error, setError] = useState(null)

  async function handleClick(format) {
    setDownloading(format)
    setError(null)

    try {
      await onExport(format)
    } catch (downloadError) {
      setError(downloadError.message)
    } finally {
      setDownloading(null)
    }
  }

  return (
    <div className="export">
      <span className="muted">{label}</span>

      <button
        type="button"
        className="btn small excel"
        onClick={() => handleClick('xlsx')}
        disabled={disabled || downloading !== null}
      >
        {downloading === 'xlsx' ? 'Gerando…' : 'Excel'}
      </button>

      <button
        type="button"
        className="btn small pdf"
        onClick={() => handleClick('pdf')}
        disabled={disabled || downloading !== null}
      >
        {downloading === 'pdf' ? 'Gerando…' : 'PDF'}
      </button>

      {error && (
        <span className="error" role="alert">
          {error}
        </span>
      )}
    </div>
  )
}
