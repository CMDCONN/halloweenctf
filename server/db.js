import { DatabaseSync } from 'node:sqlite'
import { mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { hashPassword } from './auth.js'
import { seedUsers, seedPosts, seedComments, seedEvidence } from './seed.js'

const DB_PATH =
  process.env.DB_PATH ??
  join(dirname(fileURLToPath(import.meta.url)), '..', 'data', 'cryptbook.db')

mkdirSync(dirname(DB_PATH), { recursive: true })

// Bump whenever the schema or seed data changes: an out-of-date database is wiped and re-seeded on boot.
const SCHEMA_VERSION = 5

export const db = new DatabaseSync(DB_PATH)

const { user_version: currentVersion } = db.prepare('PRAGMA user_version').get()
if (currentVersion !== SCHEMA_VERSION) {
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'").all()
  if (tables.length > 0) {
    db.exec('PRAGMA foreign_keys = OFF')
    for (const { name } of tables) db.exec(`DROP TABLE IF EXISTS "${name}"`)
    console.log(`🧹 Database schema changed (v${currentVersion} → v${SCHEMA_VERSION}) — rebuilding the crypt`)
  }
}

db.exec('PRAGMA foreign_keys = ON')

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    username      TEXT NOT NULL UNIQUE COLLATE NOCASE,
    display_name  TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    avatar        TEXT NOT NULL DEFAULT '🎃',
    bio           TEXT NOT NULL DEFAULT '',
    note          TEXT NOT NULL DEFAULT '',
    protected     INTEGER NOT NULL DEFAULT 0,
    memorial      INTEGER NOT NULL DEFAULT 0,
    created_at    TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token      TEXT PRIMARY KEY,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS posts (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content    TEXT NOT NULL,
    private    INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS comments (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id    INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content    TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS likes (
    post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, user_id)
  );

  CREATE TABLE IF NOT EXISTS evidence_locker (
    id    INTEGER PRIMARY KEY AUTOINCREMENT,
    item  TEXT NOT NULL,
    notes TEXT NOT NULL
  );
`)

function seed() {
  const insertUser = db.prepare(
    `INSERT INTO users (username, display_name, password_hash, avatar, bio, note, protected, memorial, created_at)
     VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)`,
  )
  const insertPost = db.prepare(
    'INSERT INTO posts (user_id, content, private, created_at) VALUES (?, ?, ?, ?)',
  )
  const insertComment = db.prepare(
    'INSERT INTO comments (post_id, user_id, content, created_at) VALUES (?, ?, ?, ?)',
  )

  const userIds = {}
  for (const u of seedUsers) {
    const { lastInsertRowid } = insertUser.run(
      u.username,
      u.displayName,
      hashPassword(u.password),
      u.avatar,
      u.bio,
      u.note ?? '',
      u.memorial ? 1 : 0,
      u.createdAt,
    )
    userIds[u.username] = lastInsertRowid
  }

  const postIds = {}
  for (const p of seedPosts) {
    const { lastInsertRowid } = insertPost.run(userIds[p.author], p.content, p.private ? 1 : 0, p.createdAt)
    postIds[p.key] = lastInsertRowid
  }

  for (const c of seedComments) {
    insertComment.run(postIds[c.post], userIds[c.author], c.content, c.createdAt)
  }

  const insertEvidence = db.prepare('INSERT INTO evidence_locker (item, notes) VALUES (?, ?)')
  for (const e of seedEvidence) insertEvidence.run(e.item, e.notes)
}

const { count } = db.prepare('SELECT COUNT(*) AS count FROM users').get()
if (count === 0) {
  seed()
  console.log('🕯️  Seeded a fresh crypt at', DB_PATH)
}
db.exec(`PRAGMA user_version = ${SCHEMA_VERSION}`)

// Sweep expired sessions on boot.
db.prepare('DELETE FROM sessions WHERE expires_at <= ?').run(Date.now())
