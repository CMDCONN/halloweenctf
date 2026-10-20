import { useEffect, useState, type FormEvent } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router'
import { api, type User } from '../api.ts'
import { useAuth } from '../auth.tsx'

function useHalloweenCountdown() {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000)
    return () => clearInterval(id)
  }, [])
  const year = new Date(now).getFullYear()
  let target = new Date(year, 9, 31, 20, 0, 0).getTime()
  if (now > target + 1000 * 60 * 60 * 6) target = new Date(year + 1, 9, 31, 20, 0, 0).getTime()
  const diff = Math.max(0, target - now)
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff / 3_600_000) % 24),
    minutes: Math.floor((diff / 60_000) % 60),
  }
}

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const countdown = useHalloweenCountdown()
  const [residents, setResidents] = useState<User[]>([])
  const [query, setQuery] = useState('')

  useEffect(() => {
    api
      .users()
      .then((res) => setResidents(res.users))
      .catch(() => {})
  }, [])

  function handleSearch(e: FormEvent) {
    e.preventDefault()
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`)
  }

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  if (!user) return null

  return (
    <div className="app">
      <header className="topbar">
        <Link to="/" className="logo">
          <span className="logo-icon">🎃</span> Cryptbook
        </Link>
        <nav className="nav">
          <NavLink to="/" end>
            🕸️ <span>Feed</span>
          </NavLink>
          <NavLink to={`/u/${user.username}`}>
            ⚰️ <span>My Crypt</span>
          </NavLink>
          <NavLink to="/accuse">
            ⚖️ <span>Accuse</span>
          </NavLink>
          <NavLink to="/settings">
            🕯️ <span>Settings</span>
          </NavLink>
        </nav>
        <form className="topbar-search" onSubmit={handleSearch} role="search">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="🔍 Seek a soul…"
            aria-label="Search users"
          />
        </form>
        <div className="topbar-user">
          <Link to={`/u/${user.username}`} className="user-chip">
            <span className="avatar avatar-sm">{user.avatar}</span>
            <span className="user-chip-name">{user.displayName}</span>
          </Link>
          <button type="button" className="btn btn-ghost" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </header>

      <div className="columns">
        <main className="main">
          <Outlet />
        </main>

        <aside className="sidebar">
          <section className="card">
            <h3 className="card-title">🎂 Ben's Birthday Bash</h3>
            <p className="muted">The Old Mill · Halloween · 8pm · Costumes required</p>
            <div className="countdown">
              <div>
                <strong>{countdown.days}</strong>
                <span>days</span>
              </div>
              <div>
                <strong>{countdown.hours}</strong>
                <span>hours</span>
              </div>
              <div>
                <strong>{countdown.minutes}</strong>
                <span>mins</span>
              </div>
            </div>
          </section>

          <section className="card">
            <h3 className="card-title">👻 Souls of Ravenhollow</h3>
            <ul className="resident-list">
              {residents.map((r) => (
                <li key={r.id}>
                  <Link to={`/u/${r.username}`}>
                    <span className="avatar avatar-sm">{r.avatar}</span>
                    <span>
                      <span className="resident-name">
                        {r.displayName}
                        {r.memorial && ' 🕯️'}
                      </span>
                      <span className="muted">@{r.username}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  )
}
