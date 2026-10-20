import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { api } from '../api.ts'
import { useAuth } from '../auth.tsx'

export default function Login() {
  const { setUser } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const { user } = await api.login(username, password)
      setUser(user)
      navigate((location.state as { from?: string } | null)?.from ?? '/', { replace: true })
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-page">
      <form className="card auth-card" onSubmit={submit}>
        <h1 className="logo logo-lg">
          <span className="logo-icon">🎃</span> Cryptbook
        </h1>
        <p className="tagline">Where the dead keep in touch.</p>
        <p className="hint">The spirits whisper to those who listen closely as they enter…</p>

        <label>
          Username
          <input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" required />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>

        {error && <p className="error">{error}</p>}

        <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
          {busy ? 'Opening the coffin…' : 'Enter the Crypt'}
        </button>

        <p className="auth-switch">
          New to Ravenhollow? <Link to="/register">Sell your soul (sign up)</Link>
        </p>
      </form>
    </div>
  )
}
