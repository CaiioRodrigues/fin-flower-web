import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Carrega dados de uma chamada assíncrona, guardando estado de carregamento e
 * erro. A resposta de uma chamada antiga é descartada quando outra já começou,
 * para um filtro trocado rápido não deixar a tela com o resultado errado.
 */
export function useAsync(operation, dependencies = []) {
  const [state, setState] = useState({ data: null, error: null, loading: true })
  const requestId = useRef(0)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(operation, dependencies)

  const reload = useCallback(async () => {
    const current = ++requestId.current
    setState((previous) => ({ ...previous, loading: true, error: null }))

    try {
      const data = await run()
      if (current === requestId.current) setState({ data, error: null, loading: false })
    } catch (error) {
      if (current === requestId.current) setState({ data: null, error, loading: false })
    }
  }, [run])

  useEffect(() => {
    reload()
  }, [reload])

  return { ...state, reload }
}
