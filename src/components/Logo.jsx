/**
 * Marca do Fin Flower: uma flor com uma moeda no lugar do miolo. A leitura é
 * imediata — flor pelo formato, dinheiro pelo centro — e continua clara em
 * 16px, no favicon, onde desenho detalhado vira borrão.
 */
export default function Logo({ size = 32, title = 'Fin Flower' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      role="img"
      aria-label={title}
      className="logo"
    >
      <title>{title}</title>

      {/* Caule primeiro, para as pétalas cobrirem onde ele encosta na flor. */}
      <path
        d="M24 20 L24 43"
        stroke="#15803d"
        strokeWidth="2.8"
        strokeLinecap="round"
      />
      <path d="M24 34 C29.5 31.5, 34 34, 34 34 C31.5 38.5, 26 38.5, 24 34 Z" fill="#22a355" />
      <path d="M24 28 C18.5 25.5, 14 28, 14 28 C16.5 32.5, 22 32.5, 24 28 Z" fill="#15803d" />

      <g transform="translate(24 19)">
        {/* Cinco pétalas em volta do miolo. */}
        <g fill="#2563eb">
          <ellipse cx="0" cy="-9.5" rx="5.6" ry="8.4" />
          <ellipse cx="0" cy="-9.5" rx="5.6" ry="8.4" transform="rotate(144)" />
          <ellipse cx="0" cy="-9.5" rx="5.6" ry="8.4" transform="rotate(288)" />
        </g>
        <g fill="#4f83f1">
          <ellipse cx="0" cy="-9.5" rx="5.6" ry="8.4" transform="rotate(72)" />
          <ellipse cx="0" cy="-9.5" rx="5.6" ry="8.4" transform="rotate(216)" />
        </g>

        {/* Miolo em forma de moeda. */}
        <circle r="6.2" fill="#ffffff" />
        <circle r="6.2" fill="none" stroke="#1d4ed8" strokeWidth="1.8" />
        <circle r="2.1" fill="#1d4ed8" />
      </g>
    </svg>
  )
}
