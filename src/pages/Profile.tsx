import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { api, type Post, type User } from '../api.ts'
import { useAuth } from '../auth.tsx'
import Composer from '../components/Composer.tsx'
import PostCard from '../components/PostCard.tsx'

export default function Profile() {
  const { username = '' } = useParams()
  // Keyed so navigating between profiles starts with fresh state.
  return <ProfileView key={username} username={username} />
}

function ProfileView({ username }: { username: string }) {
  const { user: me } = useAuth()
  const [profile, setProfile] = useState<{ user: User; posts: Post[] } | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .profile(username)
      .then(setProfile)
      .catch((err) => setError(err.message))
  }, [username])

  if (error) return <p className="empty">{error} 👻</p>
  if (!profile) return <div className="loading">Exhuming profile…</div>

  const { user, posts } = profile
  const isMe = me?.id === user.id
  const joined = new Date(user.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })

  return (
    <>
      {user.memorial && (
        <p className="memorial-banner">
          🕯️ <strong>Remembering {user.displayName}.</strong> This account has been memorialised.
        </p>
      )}
      <section className="card profile-card">
        <div className={`profile-banner ${user.memorial ? 'memorial' : ''}`} />
        <div className="profile-body">
          <span className="avatar avatar-xl">{user.avatar}</span>
          <div className="profile-info">
            <h1>{user.displayName}</h1>
            <p className="muted">@{user.username}</p>
            {user.bio && <p className="profile-bio">{user.bio}</p>}
            <p className="muted">
              ⚰️ Haunting since {joined} · {posts.length} {posts.length === 1 ? 'post' : 'posts'}
            </p>
          </div>
          {isMe && (
            <Link to="/settings" className="btn btn-ghost">
              Edit crypt
            </Link>
          )}
        </div>
      </section>

      {isMe && (
        <Composer onPosted={(post) => setProfile((p) => p && { ...p, posts: [post, ...p.posts] })} />
      )}

      {posts.length === 0 && <p className="empty">No posts yet. Eerily quiet…</p>}
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onDeleted={(id) => setProfile((p) => p && { ...p, posts: p.posts.filter((x) => x.id !== id) })}
        />
      ))}
    </>
  )
}
