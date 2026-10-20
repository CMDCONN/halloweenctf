import { useEffect, useState } from 'react'
import { api } from '../api.ts'

export default function CoronersOffice() {
  const [data, setData] = useState<{ flag: string; report: string[] } | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .coronersReport()
      .then(setData)
      .catch((err) => setError(err.message))
  }, [])

  return (
    <section className="card office">
      <h2 className="card-title">🩺 Ravenhollow Coroner's Office</h2>
      {!data && !error && <div className="loading">Unlocking the filing cabinet…</div>}
      {error && (
        <div className="office-locked">
          <p className="office-door">🚪🔒</p>
          <p>{error}</p>
        </div>
      )}
      {data && (
        <>
          <p className="muted">Case file #1031 — post-mortem examination report. CONFIDENTIAL.</p>
          <ul className="ledger">
            {data.report.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <code className="flag">{data.flag}</code>
        </>
      )}
    </section>
  )
}
