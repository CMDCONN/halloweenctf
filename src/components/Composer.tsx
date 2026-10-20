import { useState, type FormEvent } from 'react'
import { api, type Post } from '../api.ts'
import { useAuth } from '../auth.tsx'

const MAX = 500

export default function Composer({ onPosted }: { onPosted: (post: Post) => void }) {
  const { user } = useAuth()
  const [content, setContent] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!content.trim()) return
    setBusy(true)
    try {
      const { post } = await api.createPost(content)
      onPosted(post)
      setContent('')
      setError('')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="card composer" onSubmit={submit}>
      <div className="composer-row">
        <span className="avatar">{user?.avatar}</span>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What haunts you tonight?"
          maxLength={MAX}
          rows={3}
        />
      </div>
      <div className="composer-footer">
        <span className="muted">
          {content.length}/{MAX}
        </span>
        <button type="submit" className="btn btn-primary" disabled={busy || !content.trim()}>
          {busy ? 'Conjuring…' : 'Post 🕯️'}
        </button>
      </div>
      {error && <p className="error">{error}</p>}
    </form>
  )
}
