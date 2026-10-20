import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { api, type Author } from '../api.ts'

export default function Search() {
  const [params] = useSearchParams()
  const q = params.get('q') ?? ''
  return <SearchResults key={q} q={q} />
}

function SearchResults({ q }: { q: string }) {
  const [results, setResults] = useState<Author[] | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!q) return
    api
      .search(q)
      .then((res) => setResults(res.users))
      .catch((err) => setError(err.message))
  }, [q])

  return (
    <section className="card">
      <h2 className="card-title">🔍 Seeking “{q}”</h2>
      {!q && <p className="muted">Type a name into the search bar to seek a soul.</p>}
      {error && <p className="error">{error}</p>}
      {q && !results && !error && <div className="loading">Consulting the spirits…</div>}
      {results?.length === 0 && <p className="empty">No souls answer to that name.</p>}
      {results && results.length > 0 && (
        <ul className="resident-list">
          {results.map((r) => (
            <li key={`${r.id}-${r.username}`}>
              <Link to={`/u/${r.username}`}>
                <span className="avatar avatar-sm">{r.avatar}</span>
                <span>
                  <span className="resident-name">{r.displayName}</span>
                  <span className="muted">@{r.username}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
