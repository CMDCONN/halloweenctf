import { useEffect, useState } from 'react'
import { api, type Post } from '../api.ts'
import Composer from '../components/Composer.tsx'
import PostCard from '../components/PostCard.tsx'

export default function Feed() {
  const [posts, setPosts] = useState<Post[] | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .feed()
      .then((res) => setPosts(res.posts))
      .catch((err) => setError(err.message))
  }, [])

  return (
    <>
      <Composer onPosted={(post) => setPosts((p) => [post, ...(p ?? [])])} />
      {error && <p className="error">{error}</p>}
      {!posts && !error && <div className="loading">Summoning the feed…</div>}
      {posts?.length === 0 && <p className="empty">The graveyard is silent…</p>}
      {posts?.map((post) => (
        <PostCard key={post.id} post={post} onDeleted={(id) => setPosts((p) => p!.filter((x) => x.id !== id))} />
      ))}
    </>
  )
}
