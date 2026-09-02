import { useCallback, useMemo, useState } from 'react'
import AsyncBoundary from '../components/AsyncBoundary.jsx'
import CashSummary from '../components/CashSummary.jsx'
import EventFilters from '../components/EventFilters.jsx'
import ExportButtons from '../components/ExportButtons.jsx'
import EventForm from '../components/EventForm.jsx'
import EventList from '../components/EventList.jsx'
import { createEvent, getCashReport, listEvents } from '../api/events.js'
import { downloadCashReport } from '../api/reports.js'
import { useAsync } from '../hooks/useAsync.js'

const NO_FILTERS = { from: '', to: '', status: '' }

export default function EventsPage() {
  const [filters, setFilters] = useState(NO_FILTERS)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const { from, to, status } = filters

  // O caixa acompanha o período filtrado, mas ignora a situação: fechar um
  // evento consolida o resultado, não o tira do caixa.
  const load = useCallback(
    () => Promise.all([listEvents({ from, to, status }), getCashReport({ from, to })]),
    [from, to, status],
  )

  const { data, loading, error: loadError, reload } = useAsync(load, [load])

  const [events, report] = useMemo(() => data ?? [null, null], [data])

  async function handleCreate(values) {
    setSubmitting(true)
    setError(null)

    try {
      await createEvent(values)
      await reload()
    } catch (submitError) {
      setError(submitError)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <div className="page-intro">
        <h2>Eventos</h2>
        <p className="muted">
          Cada evento soma suas entradas e saídas; o caixa é a soma dos resultados.
        </p>

        <div className="export-bar">
          <ExportButtons
            label="Caixa por evento:"
            onExport={(format) => downloadCashReport(format, { from, to })}
          />
        </div>
      </div>

      <AsyncBoundary loading={loading} error={loadError} onRetry={reload}>
        {report && <CashSummary report={report} />}

        <div className="content">
          <EventForm submitting={submitting} onSubmit={handleCreate} />

          <section className="panel">
            {error && (
              <div className="alert" role="alert">
                {error.message}
              </div>
            )}

            <EventFilters filters={filters} onChange={setFilters} />
            {events && <EventList events={events} />}
          </section>
        </div>
      </AsyncBoundary>
    </>
  )
}
