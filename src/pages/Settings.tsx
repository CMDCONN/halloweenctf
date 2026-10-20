import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { api } from '../api.ts'
import { useAuth } from '../auth.tsx'
import AvatarPicker from '../components/AvatarPicker.tsx'

export default function Settings() {
  const { user, setUser } = useAuth()
  const navigate = useNavigate()

  const [displayName, setDisplayName] = useState(user?.displayName ?? '')
  const [bio, setBio] = useState(user?.bio ?? '')
  const [avatar, setAvatar] = useState(user?.avatar ?? '🎃')
  const [note, setNote] = useState(user?.note ?? '')
  const [saveMsg, setSaveMsg] = useState('')
  const [saveError, setSaveError] = useState('')

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [password, setPassword] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const [deleting, setDeleting] = useState(false)

  async function saveProfile(e: FormEvent) {
    e.preventDefault()
    setSaveMsg('')
    setSaveError('')
    try {
      const res = await api.updateAccount({ displayName, bio, avatar, note })
      setUser(res.user)
      setSaveMsg('Your crypt has been redecorated. 🕸️')
    } catch (err) {
      setSaveError((err as Error).message)
    }
  }

  async function deleteAccount(e: FormEvent) {
    e.preventDefault()
    setDeleting(true)
    setDeleteError('')
    try {
      await api.deleteAccount(password)
      setUser(null)
      navigate('/login', { replace: true })
    } catch (err) {
      setDeleteError((err as Error).message)
      setDeleting(false)
    }
  }

  return (
    <>
      {user?.readOnly && (
        <p className="readonly-banner">
          🔒 This soul is bound to Ravenhollow. You can look around, but its account is read-only.
        </p>
      )}
      <form className="card form-card" onSubmit={saveProfile}>
        <h2 className="card-title">🕯️ Profile</h2>
        <label>
          Display name
          <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={40} required />
        </label>
        <label>
          Bio
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} maxLength={200} rows={3} />
        </label>
        <span className="label">Avatar</span>
        <AvatarPicker value={avatar} onChange={setAvatar} />
        <label>
          Private notes <span className="muted">(only you can see these)</span>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} maxLength={1000} rows={4} />
        </label>
        {saveMsg && <p className="success">{saveMsg}</p>}
        {saveError && <p className="error">{saveError}</p>}
        <button type="submit" className="btn btn-primary">
          Save changes
        </button>
      </form>

      <section className="card form-card danger-zone">
        <h2 className="card-title">💀 Danger Zone</h2>
        <p>
          Deleting your account is permanent. Your posts, comments and likes will be buried with you and cannot be
          resurrected.
        </p>
        {!confirmOpen ? (
          <button type="button" className="btn btn-danger" onClick={() => setConfirmOpen(true)}>
            Delete my account
          </button>
        ) : (
          <form onSubmit={deleteAccount} className="delete-form">
            <label>
              Enter your password to confirm
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </label>
            {deleteError && <p className="error">{deleteError}</p>}
            <div className="button-row">
              <button type="button" className="btn btn-ghost" onClick={() => setConfirmOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-danger" disabled={deleting}>
                {deleting ? 'Digging your grave…' : 'Delete forever'}
              </button>
            </div>
          </form>
        )}
      </section>
    </>
  )
}
