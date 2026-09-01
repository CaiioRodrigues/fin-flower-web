/**
 * Estados de carregamento e erro em um lugar só, para toda tela que busca
 * dados apresentá-los da mesma forma.
 */
export default function AsyncBoundary({ loading, error, onRetry, children }) {
  if (loading) {
    return (
      <div className="card status-card" role="status">
        <p className="muted">Carregando…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card status-card" role="alert">
        <p className="expense">{error.message}</p>
        {onRetry && (
          <button type="button" className="btn" onClick={onRetry}>
            Tentar novamente
          </button>
        )}
      </div>
    )
  }

  return children
}
