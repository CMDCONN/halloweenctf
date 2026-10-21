import express from 'express'
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { db } from './db.js'
import { FLAGS, SOLUTION, BONUS_FLAGS } from './flags.js'
import {
  SESSION_COOKIE,
  SESSION_TTL_MS,
  hashPassword,
  newSessionToken,
  parseCookies,
  verifyPassword,
} from './auth.js'

const PORT = Number(process.env.PORT ?? 3001)
const ROLE_COOKIE = 'cryptbook_role'
const AVATARS = ['🎃', '👻', '💀', '🦇', '🕷️', '🧛', '🧟', '🧙', '🕯️', '⚰️', '🔮', '🥀', '💉']
const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/

const app = express()
app.use(express.json({ limit: '16kb' }))

// BONUS CHALLENGE (easy, unrelated to the case): every response carries this header — check your network tab.
app.use((_req, res, next) => {
  res.set('X-Candy-Bowl', BONUS_FLAGS.header)
  next()
})

// ---------- helpers ----------

class HttpError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

// `self` adds fields only the account owner should see.
function toUser(row, { self = false } = {}) {
  const user = {
    id: row.id,
    username: row.username,
    displayName: row.display_name,
    avatar: row.avatar,
    bio: row.bio,
    memorial: Boolean(row.memorial),
    createdAt: row.created_at,
  }
  if (self) {
    user.note = row.note
    user.readOnly = Boolean(row.protected)
  }
  return user
}

function setSessionCookie(res, token) {
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: SESSION_TTL_MS,
    path: '/',
  })
}

// CHALLENGE (cookie tampering): the server trusts this client-editable cookie for authorisation.
function setRoleCookie(res) {
  res.cookie(ROLE_COOKIE, 'mortal', { sameSite: 'lax', maxAge: SESSION_TTL_MS, path: '/' })
}

function clearAuthCookies(res) {
  res.clearCookie(SESSION_COOKIE, { path: '/' })
  res.clearCookie(ROLE_COOKIE, { path: '/' })
}

function startSession(res, userId) {
  const token = newSessionToken()
  db.prepare('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)').run(
    token,
    userId,
    Date.now() + SESSION_TTL_MS,
  )
  setSessionCookie(res, token)
  setRoleCookie(res)
}

function cleanText(value, field, max) {
  if (typeof value !== 'string') throw new HttpError(400, `${field} is required`)
  const text = value.trim()
  if (!text) throw new HttpError(400, `${field} cannot be empty`)
  if (text.length > max) throw new HttpError(400, `${field} must be ${max} characters or fewer`)
  return text
}

// Loads posts (newest first) with author, like and comment info for the viewer.
// Private posts are only included for their author — except when fetching by postId (see below).
function loadPosts(viewerId, { userId, postId } = {}) {
  const clauses = []
  const params = [viewerId]
  if (postId) {
    // CHALLENGE (IDOR): fetching a single post deliberately skips the private-post check.
    clauses.push('p.id = ?')
    params.push(postId)
  } else {
    clauses.push('(p.private = 0 OR p.user_id = ?)')
    params.push(viewerId)
  }
  if (userId) {
    clauses.push('p.user_id = ?')
    params.push(userId)
  }

  const rows = db
    .prepare(
      `SELECT p.id, p.content, p.private, p.created_at,
              u.id AS author_id, u.username, u.display_name, u.avatar,
              (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id) AS like_count,
              EXISTS (SELECT 1 FROM likes l WHERE l.post_id = p.id AND l.user_id = ?) AS liked
       FROM posts p JOIN users u ON u.id = p.user_id
       WHERE ${clauses.join(' AND ')}
       ORDER BY p.created_at DESC, p.id DESC`,
    )
    .all(...params)

  if (rows.length === 0) return []

  const ids = rows.map((r) => r.id)
  const commentRows = db
    .prepare(
      `SELECT c.id, c.post_id, c.content, c.created_at,
              u.id AS author_id, u.username, u.display_name, u.avatar
       FROM comments c JOIN users u ON u.id = c.user_id
       WHERE c.post_id IN (${ids.map(() => '?').join(',')})
       ORDER BY c.created_at ASC, c.id ASC`,
    )
    .all(...ids)

  const commentsByPost = new Map()
  for (const c of commentRows) {
    const list = commentsByPost.get(c.post_id) ?? []
    list.push({
      id: c.id,
      content: c.content,
      createdAt: c.created_at,
      author: { id: c.author_id, username: c.username, displayName: c.display_name, avatar: c.avatar },
    })
    commentsByPost.set(c.post_id, list)
  }

  return rows.map((r) => ({
    id: r.id,
    content: r.content,
    private: Boolean(r.private),
    createdAt: r.created_at,
    author: { id: r.author_id, username: r.username, displayName: r.display_name, avatar: r.avatar },
    likeCount: r.like_count,
    liked: Boolean(r.liked),
    comments: commentsByPost.get(r.id) ?? [],
  }))
}

// ---------- session middleware ----------

app.use((req, res, next) => {
  const cookies = parseCookies(req.headers.cookie)
  const token = cookies[SESSION_COOKIE]
  if (token) {
    const row = db
      .prepare(
        `SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id
         WHERE s.token = ? AND s.expires_at > ?`,
      )
      .get(token, Date.now())
    if (row) {
      req.user = toUser(row, { self: true })
      req.sessionToken = token
      if (!cookies[ROLE_COOKIE]) setRoleCookie(res)
    }
  }
  req.role = cookies[ROLE_COOKIE] ?? 'mortal'
  next()
})

function requireAuth(req, _res, next) {
  if (!req.user) throw new HttpError(401, 'You must be logged in to enter the crypt')
  next()
}

// Seeded characters are read-only so players who log in as them can't spoil challenges for others.
function requireWritable(req, _res, next) {
  if (req.user.readOnly) {
    throw new HttpError(403, 'This soul is bound to Ravenhollow — its account is read-only')
  }
  next()
}

// ---------- auth ----------

app.get('/api/auth/me', (req, res) => {
  res.json({ user: req.user ?? null })
})

app.post('/api/auth/register', (req, res) => {
  const { username, displayName, password, avatar } = req.body ?? {}

  if (typeof username !== 'string' || !USERNAME_RE.test(username)) {
    throw new HttpError(400, 'Username must be 3–20 characters: letters, numbers or underscores')
  }
  const name = cleanText(displayName, 'Display name', 40)
  if (typeof password !== 'string' || password.length < 6) {
    throw new HttpError(400, 'Password must be at least 6 characters')
  }
  if (password.length > 128) throw new HttpError(400, 'Password is too long')
  const chosenAvatar = AVATARS.includes(avatar) ? avatar : '🎃'

  const exists = db.prepare('SELECT 1 FROM users WHERE username = ?').get(username)
  if (exists) throw new HttpError(409, 'That username has already been claimed by another soul')

  const { lastInsertRowid } = db
    .prepare(
      `INSERT INTO users (username, display_name, password_hash, avatar, bio, created_at)
       VALUES (?, ?, ?, ?, '', ?)`,
    )
    .run(username, name, hashPassword(password), chosenAvatar, new Date().toISOString())

  startSession(res, lastInsertRowid)
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(lastInsertRowid)
  res.status(201).json({ user: toUser(row, { self: true }) })
})

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body ?? {}
  if (typeof username !== 'string' || typeof password !== 'string') {
    throw new HttpError(400, 'Username and password are required')
  }
  const row = db.prepare('SELECT * FROM users WHERE username = ?').get(username.trim())
  if (!row || !verifyPassword(password, row.password_hash)) {
    throw new HttpError(401, 'The spirits do not recognise that username or password')
  }
  startSession(res, row.id)
  // CHALLENGE (HTTP headers): only visible in the network tab.
  res.set('X-Spirit-Whisper', FLAGS.header)
  res.json({ user: toUser(row, { self: true }) })
})

app.post('/api/auth/logout', (req, res) => {
  if (req.sessionToken) {
    db.prepare('DELETE FROM sessions WHERE token = ?').run(req.sessionToken)
  }
  clearAuthCookies(res)
  res.json({ ok: true })
})

// ---------- account ----------

app.patch('/api/account', requireAuth, requireWritable, (req, res) => {
  const { displayName, bio, avatar, note } = req.body ?? {}
  const name = displayName === undefined ? req.user.displayName : cleanText(displayName, 'Display name', 40)
  let newBio = req.user.bio
  if (bio !== undefined) {
    if (typeof bio !== 'string' || bio.length > 200) throw new HttpError(400, 'Bio must be 200 characters or fewer')
    newBio = bio.trim()
  }
  let newNote = req.user.note
  if (note !== undefined) {
    if (typeof note !== 'string' || note.length > 1000) {
      throw new HttpError(400, 'Note must be 1000 characters or fewer')
    }
    newNote = note
  }
  const newAvatar = AVATARS.includes(avatar) ? avatar : req.user.avatar

  db.prepare('UPDATE users SET display_name = ?, bio = ?, avatar = ?, note = ? WHERE id = ?').run(
    name,
    newBio,
    newAvatar,
    newNote,
    req.user.id,
  )
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id)
  res.json({ user: toUser(row, { self: true }) })
})

app.delete('/api/account', requireAuth, requireWritable, (req, res) => {
  const { password } = req.body ?? {}
  const row = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(req.user.id)
  if (typeof password !== 'string' || !verifyPassword(password, row.password_hash)) {
    throw new HttpError(401, 'Incorrect password — your soul remains bound here')
  }
  // Sessions, posts, comments and likes are removed via ON DELETE CASCADE.
  db.prepare('DELETE FROM users WHERE id = ?').run(req.user.id)
  clearAuthCookies(res)
  res.json({ ok: true })
})

// ---------- users ----------

app.get('/api/users', requireAuth, (_req, res) => {
  const rows = db.prepare('SELECT * FROM users ORDER BY created_at ASC').all()
  res.json({ users: rows.map((r) => toUser(r)) })
})

app.get('/api/users/:username', requireAuth, (req, res) => {
  const row = db.prepare('SELECT * FROM users WHERE username = ?').get(req.params.username)
  if (!row) throw new HttpError(404, 'No such soul haunts Ravenhollow')
  res.json({ user: toUser(row), posts: loadPosts(req.user.id, { userId: row.id }) })
})

// CHALLENGE (SQL injection): the query is built by string concatenation and errors are echoed back.
// node:sqlite's prepare() runs a single statement, so stacked queries (DROP TABLE…) aren't possible.
app.get('/api/search', requireAuth, (req, res) => {
  const q = typeof req.query.q === 'string' ? req.query.q : ''
  const sql = `SELECT id, username, display_name, avatar FROM users
               WHERE username LIKE '%${q}%' OR display_name LIKE '%${q}%'
               ORDER BY id LIMIT 25`
  let rows
  try {
    rows = db.prepare(sql).all()
  } catch (err) {
    throw new HttpError(400, `The spirits are confused: ${err.message}`)
  }
  res.json({
    users: rows.map((r) => ({ id: r.id, username: r.username, displayName: r.display_name, avatar: r.avatar })),
  })
})

// ---------- coroner's office ----------

app.get('/api/coroners-report', requireAuth, (req, res) => {
  if (req.role !== 'admin' && req.role !== 'coroner') {
    throw new HttpError(403, `This report is restricted to the coroner. You are merely a ${req.role}.`)
  }
  res.json({
    flag: FLAGS.cookie,
    report: [
      'Deceased: James',
      'Found: east wing, Hallow Manor — 19 Oct',
      'Estimated time of death: around midnight, 18–19 Oct',
      'Cause of death: atropine poisoning, consistent with deadly nightshade (Atropa belladonna)',
      'Stomach contents: approx. one cup of a heavily spiced pumpkin latte; crushed dark berries',
      'Notes: no signs of a struggle. Victim\'s phone was open on a note titled "Speech for Ben\'s party — draft 14".',
    ],
  })
})

// ---------- final accusation ----------

// All-or-nothing on purpose: no hint about which part was wrong, so it can't be solved one field at a time.
app.post('/api/accuse', requireAuth, (req, res) => {
  const { killer, method, motive } = req.body ?? {}
  if (![killer, method, motive].every((v) => typeof v === 'string' && v)) {
    throw new HttpError(400, 'Name a killer, a method and a motive before you go to the police')
  }
  const correct = killer === SOLUTION.killer && method === SOLUTION.method && motive === SOLUTION.motive
  if (!correct) {
    return res.json({
      correct: false,
      message: 'The police hear you out… then release your suspect. Something in your theory doesn\'t add up.',
    })
  }
  res.json({
    correct: true,
    flag: FLAGS.accusation,
    epilogue: [
      'Halloween night. The Old Mill is strung with fairy lights and paper bats.',
      'Halfway through "Happy Birthday", the doors swing open. Two officers cross the dance floor to a figure in a black lace mask.',
      'Maryum doesn\'t run. She lifts her mask, smiles, and says only: "At least it\'s quiet now."',
      'The jar of belladonna berries is entered into evidence. Jonathan finally tells the police what he saw.',
      'Ben\'s party goes on. Everyone raises a glass to James. There are no speeches.',
    ],
  })
})

// ---------- posts ----------

app.get('/api/posts', requireAuth, (req, res) => {
  res.json({ posts: loadPosts(req.user.id) })
})

app.get('/api/posts/:id', requireAuth, (req, res) => {
  const [post] = loadPosts(req.user.id, { postId: Number(req.params.id) })
  if (!post) throw new HttpError(404, 'That post has already vanished')
  res.json({ post })
})

app.post('/api/posts', requireAuth, requireWritable, (req, res) => {
  const content = cleanText(req.body?.content, 'Post', 500)
  const { lastInsertRowid } = db
    .prepare('INSERT INTO posts (user_id, content, created_at) VALUES (?, ?, ?)')
    .run(req.user.id, content, new Date().toISOString())
  const [post] = loadPosts(req.user.id, { postId: Number(lastInsertRowid) })
  res.status(201).json({ post })
})

app.delete('/api/posts/:id', requireAuth, requireWritable, (req, res) => {
  const post = db.prepare('SELECT user_id FROM posts WHERE id = ?').get(Number(req.params.id))
  if (!post) throw new HttpError(404, 'That post has already vanished')
  if (post.user_id !== req.user.id) throw new HttpError(403, 'You cannot banish another soul\'s post')
  db.prepare('DELETE FROM posts WHERE id = ?').run(Number(req.params.id))
  res.json({ ok: true })
})

app.post('/api/posts/:id/like', requireAuth, requireWritable, (req, res) => {
  const postId = Number(req.params.id)
  if (!db.prepare('SELECT 1 FROM posts WHERE id = ?').get(postId)) {
    throw new HttpError(404, 'That post has already vanished')
  }
  const existing = db.prepare('SELECT 1 FROM likes WHERE post_id = ? AND user_id = ?').get(postId, req.user.id)
  if (existing) {
    db.prepare('DELETE FROM likes WHERE post_id = ? AND user_id = ?').run(postId, req.user.id)
  } else {
    db.prepare('INSERT INTO likes (post_id, user_id) VALUES (?, ?)').run(postId, req.user.id)
  }
  const { count } = db.prepare('SELECT COUNT(*) AS count FROM likes WHERE post_id = ?').get(postId)
  res.json({ liked: !existing, likeCount: count })
})

app.post('/api/posts/:id/comments', requireAuth, requireWritable, (req, res) => {
  const postId = Number(req.params.id)
  if (!db.prepare('SELECT 1 FROM posts WHERE id = ?').get(postId)) {
    throw new HttpError(404, 'That post has already vanished')
  }
  const content = cleanText(req.body?.content, 'Comment', 300)
  const createdAt = new Date().toISOString()
  const { lastInsertRowid } = db
    .prepare('INSERT INTO comments (post_id, user_id, content, created_at) VALUES (?, ?, ?, ?)')
    .run(postId, req.user.id, content, createdAt)
  const { id, username, displayName, avatar } = req.user
  res.status(201).json({
    comment: { id: Number(lastInsertRowid), content, createdAt, author: { id, username, displayName, avatar } },
  })
})

// ---------- errors & static ----------

app.use('/api', (_req, _res) => {
  throw new HttpError(404, 'Nothing lurks here')
})

// CHALLENGE (robots.txt): listed as Disallowed in public/robots.txt, linked from nowhere else.
app.get('/east-wing', (_req, res) => {
  res.type('html').send(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>The East Wing</title>
  <link href="https://fonts.googleapis.com/css2?family=Creepster&display=swap" rel="stylesheet" />
  <style>
    body { margin: 0; min-height: 100vh; display: grid; place-items: center; padding: 16px; box-sizing: border-box;
           background: radial-gradient(circle at 50% 30%, #2a1020, #050307 70%); color: #d8cfe6;
           font-family: Georgia, serif; text-align: center; }
    h1 { font-family: Creepster, cursive; font-size: 3.5rem; color: #d7263d; margin: 0 0 16px;
         text-shadow: 0 0 20px rgba(215, 38, 61, .6); letter-spacing: 3px; }
    p { max-width: 520px; line-height: 1.7; font-style: italic; }
    code { display: inline-block; margin-top: 24px; padding: 12px 18px; border: 1px dashed #d7263d;
           color: #ff7a18; font-size: 1.1rem; background: rgba(0,0,0,.4); }
  </style>
</head>
<body>
  <main>
    <h1>The East Wing</h1>
    <p>Police tape flutters across the doorway. Chalk outlines a figure slumped beneath the window. Beside it,
       a Grind Reaper cup lies on its side, a few dark berries crushed into the dregs. A phone glows on the
       floorboards: <em>"Speech for Ben's party — draft 14"</em>. Scratched into the dust beside the outline:</p>
    <code>${FLAGS.eastWing}</code>
  </main>
</body>
</html>`)
})

// BONUS CHALLENGE (easy, unrelated to the case): listed as Disallowed in public/robots.txt, no story content.
app.get('/trick-or-treat', (_req, res) => {
  res.type('html').send(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Trick or Treat</title>
  <link href="https://fonts.googleapis.com/css2?family=Creepster&display=swap" rel="stylesheet" />
  <style>
    body { margin: 0; min-height: 100vh; display: grid; place-items: center; padding: 16px; box-sizing: border-box;
           background: radial-gradient(circle at 50% 30%, #1a1a2a, #050307 70%); color: #d8cfe6;
           font-family: Georgia, serif; text-align: center; }
    h1 { font-family: Creepster, cursive; font-size: 3.5rem; color: #ff7a18; margin: 0 0 16px;
         text-shadow: 0 0 20px rgba(255, 122, 24, .6); letter-spacing: 3px; }
    p { max-width: 520px; line-height: 1.7; font-style: italic; }
    code { display: inline-block; margin-top: 24px; padding: 12px 18px; border: 1px dashed #ff7a18;
           color: #8bd450; font-size: 1.1rem; background: rgba(0,0,0,.4); }
  </style>
</head>
<body>
  <main>
    <h1>🍬 Trick or Treat 🍬</h1>
    <p>No corpses here — just a bowl of candy somebody left by the door. A few wrappers rustle in the wind.</p>
    <code>${BONUS_FLAGS.hiddenPage}</code>
  </main>
</body>
</html>`)
})

const distDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist')
if (existsSync(distDir)) {
  app.use(express.static(distDir))
  app.get('/{*splat}', (_req, res) => res.sendFile(join(distDir, 'index.html')))
}

app.use((err, _req, res, _next) => {
  const status = err.status ?? 500
  if (status >= 500) console.error(err)
  res.status(status).json({ error: status >= 500 ? 'Something went bump in the night' : err.message })
})

app.listen(PORT, () => {
  console.log(`🦇 Cryptbook API haunting http://localhost:${PORT}`)
})
