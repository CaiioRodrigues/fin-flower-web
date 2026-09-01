const LABELS = {
  Open: 'Aberto',
  Closed: 'Fechado',
}

export default function StatusBadge({ status }) {
  return <span className={`badge badge-${status.toLowerCase()}`}>{LABELS[status] ?? status}</span>
}
