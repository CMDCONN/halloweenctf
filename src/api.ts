export interface User {
  id: number
  username: string
  displayName: string
  avatar: string
  bio: string
  memorial: boolean
  createdAt: string
  // Only present on the logged-in user's own record.
  note?: string
  readOnly?: boolean
}

export type Author = Pick<User, 'id' | 'username' | 'displayName' | 'avatar'>

export interface Comment {
  id: number
  content: string
  createdAt: string
  author: Author
}

export interface Post {
  id: number
  content: string
  private: boolean
  createdAt: string
  author: Author
  likeCount: number
  liked: boolean
  comments: Comment[]
}

export const AVATARS = ['🎃', '👻', '💀', '🦇', '🕷️', '🧛', '🧟', '🧙', '🕯️', '⚰️', '🔮', '🥀', '💉']

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`/api${path}`, {
    method,
    credentials: 'same-origin',
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new ApiError(res.status, data.error ?? `Request failed (${res.status})`)
  return data as T
}

export const api = {
  me: () => request<{ user: User | null }>('GET', '/auth/me'),
  register: (body: { username: string; displayName: string; password: string; avatar: string }) =>
    request<{ user: User }>('POST', '/auth/register', body),
  login: (username: string, password: string) =>
    request<{ user: User }>('POST', '/auth/login', { username, password }),
  logout: () => request<{ ok: true }>('POST', '/auth/logout'),

  updateAccount: (body: Partial<Pick<User, 'displayName' | 'bio' | 'avatar' | 'note'>>) =>
    request<{ user: User }>('PATCH', '/account', body),
  deleteAccount: (password: string) => request<{ ok: true }>('DELETE', '/account', { password }),

  users: () => request<{ users: User[] }>('GET', '/users'),
  search: (q: string) => request<{ users: Author[] }>('GET', `/search?q=${encodeURIComponent(q)}`),
  profile: (username: string) =>
    request<{ user: User; posts: Post[] }>('GET', `/users/${encodeURIComponent(username)}`),

  feed: () => request<{ posts: Post[] }>('GET', '/posts'),
  post: (id: number) => request<{ post: Post }>('GET', `/posts/${id}`),
  createPost: (content: string) => request<{ post: Post }>('POST', '/posts', { content }),
  deletePost: (id: number) => request<{ ok: true }>('DELETE', `/posts/${id}`),
  toggleLike: (id: number) => request<{ liked: boolean; likeCount: number }>('POST', `/posts/${id}/like`),
  addComment: (id: number, content: string) =>
    request<{ comment: Comment }>('POST', `/posts/${id}/comments`, { content }),

  accuse: (body: { killer: string; method: string; motive: string }) =>
    request<{ correct: true; flag: string; epilogue: string[] } | { correct: false; message: string }>(
      'POST',
      '/accuse',
      body,
    ),
  coronersReport: () => request<{ flag: string; report: string[] }>('GET', '/coroners-report'),
}

export function timeAgo(iso: string): string {
  const seconds = Math.round((Date.now() - new Date(iso).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  if (days < 30) return `${days}d ago`
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}
