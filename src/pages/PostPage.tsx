import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { api, type Post } from '../api.ts'
import PostCard from '../components/PostCard.tsx'

export default function PostPage() {
  const { id = '' } = useParams()
  return <PostView key={id} id={Number(id)} />
}

function PostView({ id }: { id: number }) {
  const navigate = useNavigate()
  const [post, setPost] = useState<Post | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .post(id)
      .then((res) => setPost(res.post))
      .catch((err) => setError(err.message))
  }, [id])

  return (
    <>
      <Link to="/" className="back-link">
        ← Back to the feed
      </Link>
      {error && <p className="empty">{error} 👻</p>}
      {!post && !error && <div className="loading">Exhuming post…</div>}
      {post && <PostCard post={post} onDeleted={() => navigate('/')} />}
    </>
  )
}
