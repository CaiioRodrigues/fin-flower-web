/**
 * Abre o passeio guiado. Fica ao lado do botão de tema porque é lá que se
 * procura ajuda — no rodapé ele só era encontrado por quem já sabia que existia.
 */
export default function TourButton({ onClick }) {
  return (
    <button
      type="button"
      className="btn small tutorial-button"
      onClick={onClick}
      title="Rever o tutorial guiado"
      aria-label="Rever o tutorial guiado"
    >
      <span className="tutorial-button-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="9" />
          <path strokeLinecap="round" d="M9.3 9.2a2.8 2.8 0 1 1 3.4 3.4v1.1" />
          <path strokeLinecap="round" d="M12 17.1h.01" />
        </svg>
      </span>
      <span className="tutorial-button-label">Tutorial</span>
    </button>
  )
}
