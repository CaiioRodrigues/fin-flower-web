/**
 * Marca do Fin Flower: uma flor com uma moeda no lugar do miolo. A leitura é
 * imediata — flor pelo formato, dinheiro pelo centro — e continua clara em
 * 16px, no favicon, onde desenho detalhado vira borrão.
 *
 * As pétalas são um grupo separado para poderem girar em torno do miolo sem
 * arrastar caule e folhas junto; a animação em si mora no CSS, para quem pediu
 * menos movimento receber a flor parada sem passar por aqui.
 */
export default function Logo({ size = 32, title = 'Fin Flower', animated = true, mood = 'neutral' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      role="img"
      aria-label={title}
      className={`logo${animated ? ' logo-animated' : ''} logo-${mood}`}
    >
      <title>{title}</title>

      {/*
        Caule primeiro, para as pétalas cobrirem onde ele encosta na flor. As
        folhas nascem abaixo da linha das pétalas: mais acima, a da esquerda
        sumia sob elas e a flor saía com uma folha só.
      */}
      <path className="logo-stem" d="M24 20 L24 43" stroke="var(--income)" strokeWidth="2.8" strokeLinecap="round" />
      <path
        className="logo-leaf logo-leaf-right"
        d="M24 33.5 C29.5 31, 34 33.5, 34 33.5 C31.5 38, 26 38, 24 33.5 Z"
        fill="var(--income)"
        opacity="0.75"
      />
      <path
        className="logo-leaf logo-leaf-left"
        d="M24 38.5 C18.5 36, 14 38.5, 14 38.5 C16.5 43, 22 43, 24 38.5 Z"
        fill="var(--income)"
      />

      {/*
        Dois grupos aninhados de propósito. O de fora posiciona a flor pelo
        atributo do SVG; o de dentro é o que a animação move. Animar o mesmo
        grupo que carrega o translate faria o CSS substituir o atributo inteiro,
        e a flor saltaria para o canto superior esquerdo.
      */}
      <g transform="translate(24 19)">
        <g className="logo-head">
          <g className="logo-petals">
            <g fill="var(--primary)">
              <ellipse cx="0" cy="-9.5" rx="5.6" ry="8.4" />
              <ellipse cx="0" cy="-9.5" rx="5.6" ry="8.4" transform="rotate(144)" />
              <ellipse cx="0" cy="-9.5" rx="5.6" ry="8.4" transform="rotate(288)" />
            </g>
            <g fill="var(--primary)" opacity="0.72">
              <ellipse cx="0" cy="-9.5" rx="5.6" ry="8.4" transform="rotate(72)" />
              <ellipse cx="0" cy="-9.5" rx="5.6" ry="8.4" transform="rotate(216)" />
            </g>
          </g>

          {/* Miolo em forma de moeda. */}
          <g className="logo-coin">
            <circle r="6.2" fill="var(--surface)" />
            <circle r="6.2" fill="none" stroke="var(--primary-dark)" strokeWidth="1.8" />
            <circle className="logo-pupil" r="2.1" fill="var(--primary-dark)" />
          </g>
        </g>
      </g>
    </svg>
  )
}
