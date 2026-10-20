import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { api } from '../api.ts'
import { useAuth } from '../auth.tsx'
import AvatarPicker from '../components/AvatarPicker.tsx'

export default function Register() {
  const { setUser } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [avatar, setAvatar] = useState('🎃')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    setBusy(true)
    setError('')
    try {
      const { user } = await api.register({ username, displayName, password, avatar })
      setUser(user)
      navigate('/', { replace: true })
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
        <p className="tagline">Join the residents of Ravenhollow… forever.</p>

        <label>
          Username
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            pattern="[A-Za-z0-9_]{3,20}"
            title="3–20 letters, numbers or underscores"
            required
          />
        </label>
        <label>
          Display name
          <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={40} required />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            minLength={6}
            required
          />
        </label>
        <label>
          Confirm password
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            minLength={6}
            required
          />
        </label>

        <span className="label">Choose your form</span>
        <AvatarPicker value={avatar} onChange={setAvatar} />

        {error && <p className="error">{error}</p>}

        <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
          {busy ? 'Signing in blood…' : 'Create Account'}
        </button>

        <p className="auth-switch">
          Already haunting us? <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  )
}
