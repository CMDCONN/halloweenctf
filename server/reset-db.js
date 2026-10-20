import { rmSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const DB_PATH =
  process.env.DB_PATH ??
  join(dirname(fileURLToPath(import.meta.url)), '..', 'data', 'cryptbook.db')

for (const suffix of ['', '-wal', '-shm']) rmSync(DB_PATH + suffix, { force: true })
console.log('💀 Crypt wiped. It will be re-seeded the next time the server starts.')
