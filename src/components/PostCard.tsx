import { useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { api, timeAgo, type Post } from '../api.ts'
import { useAuth } from '../auth.tsx'

interface Props {
  post: Post
  onDeleted: (id: number) => void
}

export default function PostCard({ post: initial, onDeleted }: Props) {
  const { user } = useAuth()
  const [post, setPost] = useState(initial)
  const [showComments, setShowComments] = useState(initial.comments.length > 0)
  const [draft, setDraft] = useState('')
  const [error, setError] = useState('')

  async function toggleLike() {
    try {
      const res = await api.toggleLike(post.id)
      setPost((p) => ({ ...p, liked: res.liked, likeCount: res.likeCount }))
    } catch (err) {
      setError((err as Error).message)
    }
  }

  async function submitComment(e: FormEvent) {
    e.preventDefault()
    if (!draft.trim()) return
    try {
      const { comment } = await api.addComment(post.id, draft)
      setPost((p) => ({ ...p, comments: [...p.comments, comment] }))
      setDraft('')
      setError('')
    } catch (err) {
      setError((err as Error).message)
    }
  }

  async function deletePost() {
    if (!confirm('Banish this post to the void forever?')) return
    try {
      await api.deletePost(post.id)
      onDeleted(post.id)
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <article className="card post">
      <header className="post-header">
        <Link to={`/u/${post.author.username}`} className="avatar">
          {post.author.avatar}
        </Link>
        <div className="post-meta">
          <Link to={`/u/${post.author.username}`} className="post-author">
            {post.author.displayName}
          </Link>
          <span className="muted">
            @{post.author.username} ·{' '}
            <Link to={`/p/${post.id}`} className="post-permalink">
              <time dateTime={post.createdAt}>{timeAgo(post.createdAt)}</time>
            </Link>
            {post.private && <span className="badge">🔒 Private</span>}
          </span>
        </div>
        {user?.id === post.author.id && (
          <button type="button" className="btn btn-icon" onClick={deletePost} title="Delete post">
            🗑️
          </button>
        )}
      </header>

      <p className="post-content">{post.content}</p>

      <footer className="post-actions">
        <button type="button" className={`btn btn-ghost ${post.liked ? 'liked' : ''}`} onClick={toggleLike}>
          {post.liked ? '🖤' : '🤍'} {post.likeCount}
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => setShowComments((s) => !s)}>
          💬 {post.comments.length}
        </button>
      </footer>

      {error && <p className="error">{error}</p>}

      {showComments && (
        <div className="comments">
          {post.comments.map((c) => (
            <div key={c.id} className="comment">
              <Link to={`/u/${c.author.username}`} className="avatar avatar-sm">
                {c.author.avatar}
              </Link>
              <div className="comment-body">
                <Link to={`/u/${c.author.username}`} className="post-author">
                  {c.author.displayName}
                </Link>{' '}
                <span className="muted">· {timeAgo(c.createdAt)}</span>
                <p>{c.content}</p>
              </div>
            </div>
          ))}
          <form className="comment-form" onSubmit={submitComment}>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Whisper a reply…"
              maxLength={300}
            />
            <button type="submit" className="btn btn-primary" disabled={!draft.trim()}>
              Reply
            </button>
          </form>
        </div>
      )}
    </article>
  )
}
