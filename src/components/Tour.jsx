import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Logo from './Logo.jsx'
import { rememberTour } from './tourStorage.js'

/**
 * Os passos são pares "leve até a tela, aponte para um alvo". O alvo é um
 * seletor porque a posição muda com o tamanho da janela — guardar coordenadas
 * daria um balão fora do lugar no primeiro redimensionamento.
 */
const STEPS = [
  {
    to: '/',
    target: null,
    mood: 'happy',
    title: 'Oi! Sou a Fin.',
    body:
      'Em um minuto eu mostro onde fica cada coisa. Você pode sair a qualquer momento e voltar '
      + 'depois pelo botão Tutorial, ali em cima, ao lado do tema.',
  },
  {
    to: '/',
    target: '.nav-link[href="/"]',
    mood: 'neutral',
    title: 'O Caixa é o começo',
    body:
      'Esta tabela vai do passado ao futuro. Até o mês de hoje ela mostra o que de fato aconteceu; '
      + 'depois da linha azul, o que está previsto.',
  },
  {
    to: '/',
    target: '.metric:nth-child(2)',
    mood: 'thinking',
    title: 'Saldo projetado',
    body:
      'É o saldo se tudo que já está comprometido acontecer — contratos assinados e contas fixas. '
      + 'Trabalho que você ainda vai vender não entra aqui.',
  },
  {
    to: '/lancamentos',
    target: '.nav-link[href="/lancamentos"]',
    mood: 'neutral',
    title: 'Lançamentos',
    body:
      'Todo dinheiro que entra e sai. O evento é opcional: aluguel e contador não pertencem a '
      + 'trabalho nenhum, e nem por isso deixam de sair do caixa.',
  },
  {
    to: '/gastos-fixos',
    target: '.filters .btn.primary',
    mood: 'neutral',
    title: 'O mês de uma vez',
    body:
      'Cadastre o que se repete e clique aqui uma vez por mês. Clicar duas vezes não duplica nada, '
      + 'pode ficar tranquilo.',
  },
  {
    to: '/orcamentos',
    target: '.nav-link[href="/orcamentos"]',
    mood: 'neutral',
    title: 'Do orçamento ao caixa',
    body:
      'Monte a proposta linha a linha. Quando o cliente aceita, ela vira contrato com as parcelas — '
      + 'e as parcelas viram previsão no Caixa.',
  },
  {
    to: '/relatorios',
    target: '.nav-link[href="/relatorios"]',
    mood: 'happy',
    title: 'É isso!',
    body:
      'Os relatórios saem em Excel para trabalhar os números e em PDF para enviar. '
      + 'Bom trabalho — estou por aqui se precisar.',
  },
]

export default function Tour({ onClose }) {
  const [index, setIndex] = useState(0)
  const [spot, setSpot] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()

  const step = STEPS[index]
  const isLast = index === STEPS.length - 1

  const finish = useCallback(() => {
    rememberTour()
    onClose()
  }, [onClose])

  // Leva à tela do passo antes de procurar o alvo: apontar para um botão que
  // ainda não foi montado deixaria o balão solto no canto.
  useEffect(() => {
    if (step.to && location.pathname !== step.to) navigate(step.to)
  }, [step, location.pathname, navigate])

  // Mede o alvo depois que a tela trocou, e de novo a cada redimensionamento.
  useEffect(() => {
    if (!step.target || location.pathname !== step.to) {
      setSpot(null)
      return undefined
    }

    let frame = 0

    const measure = () => {
      const element = document.querySelector(step.target)
      if (!element) return setSpot(null)

      const rect = element.getBoundingClientRect()
      setSpot({ top: rect.top, left: rect.left, width: rect.width, height: rect.height })
    }

    // Um quadro de espera: a tela acabou de trocar e o layout ainda assenta.
    frame = window.requestAnimationFrame(() => window.requestAnimationFrame(measure))

    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, true)

    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure, true)
    }
  }, [step, location.pathname])

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') finish()
      if (event.key === 'ArrowRight' && !isLast) setIndex((current) => current + 1)
      if (event.key === 'ArrowLeft' && index > 0) setIndex((current) => current - 1)
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [finish, isLast, index])

  const bubbleStyle = useMemo(() => {
    if (!spot) return undefined

    // Abaixo do alvo, a menos que não caiba — aí vai para cima.
    const below = spot.top + spot.height + 14
    const fitsBelow = below + 190 < window.innerHeight

    return {
      top: fitsBelow ? below : Math.max(12, spot.top - 200),
      left: Math.min(Math.max(12, spot.left - 20), Math.max(12, window.innerWidth - 372)),
    }
  }, [spot])

  return (
    <div className="tour" role="dialog" aria-modal="true" aria-label="Tutorial do Fin Flower">
      <div className="tour-veil" onClick={finish} />

      {spot && (
        <div
          className="tour-spot"
          style={{ top: spot.top - 6, left: spot.left - 6, width: spot.width + 12, height: spot.height + 12 }}
        />
      )}

      <div className={`tour-bubble${spot ? '' : ' tour-bubble-centre'}`} style={bubbleStyle}>
        <div className="tour-mascot">
          <Logo size={52} mood={step.mood} title="Fin" />
        </div>

        <div className="tour-body">
          <h3>{step.title}</h3>
          <p>{step.body}</p>

          <div className="tour-actions">
            <span className="tour-count">
              {index + 1} de {STEPS.length}
            </span>

            <div className="tour-buttons">
              <button type="button" className="btn small ghost" onClick={finish}>
                {isLast ? 'Fechar' : 'Pular'}
              </button>
              {index > 0 && (
                <button
                  type="button"
                  className="btn small"
                  onClick={() => setIndex((current) => current - 1)}
                >
                  Voltar
                </button>
              )}
              <button
                type="button"
                className="btn small primary"
                onClick={() => (isLast ? finish() : setIndex((current) => current + 1))}
              >
                {isLast ? 'Começar' : 'Próximo'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
