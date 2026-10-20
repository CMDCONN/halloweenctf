import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'

export const SESSION_COOKIE = 'cryptbook_session'
export const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7 // 7 days

export function hashPassword(password) {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

export function verifyPassword(password, stored) {
  const [salt, hash] = stored.split(':')
  if (!salt || !hash) return false
  const expected = Buffer.from(hash, 'hex')
  const actual = scryptSync(password, salt, expected.length)
  return timingSafeEqual(expected, actual)
}

export function newSessionToken() {
  return randomBytes(32).toString('hex')
}

export function parseCookies(header = '') {
  const cookies = {}
  for (const part of header.split(';')) {
    const idx = part.indexOf('=')
    if (idx === -1) continue
    const key = part.slice(0, idx).trim()
    const value = part.slice(idx + 1).trim()
    if (key) cookies[key] = decodeURIComponent(value)
  }
  return cookies
}
