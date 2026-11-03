if (typeof process.loadEnvFile === 'function') {
  try {
    process.loadEnvFile()
  } catch {}
}

import { getDb, ensureTablesExist } from '../server/db'
import { categories, products, profile } from '../server/db/schema'
import { count } from 'drizzle-orm'

async function testConnection() {
  const url = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || 'file:./local.db'
  const isTurso = url.startsWith('libsql://') || url.includes('.turso.io')

  console.log('--- Pengujian Koneksi Database Turso / libSQL ---')
  console.log(`URL Target : ${url}`)
  console.log(`Mode       : ${isTurso ? 'Turso Cloud (libSQL)' : 'SQLite Lokal (file)'}`)
  console.log(`Auth Token : ${process.env.TURSO_AUTH_TOKEN || process.env.DATABASE_AUTH_TOKEN ? '[TERSEDIA]' : '[TIDAK DISET]'}`)
  console.log('Memverifikasi tabel...')

  await ensureTablesExist()
  const db = getDb()

  const [catCount] = await db.select({ value: count() }).from(categories)
  const [prodCount] = await db.select({ value: count() }).from(products)
  const [profCount] = await db.select({ value: count() }).from(profile)

  console.log('\nKoneksi berhasil! Status tabel:')
  console.log(`- Kategori : ${catCount.value} baris`)
  console.log(`- Produk   : ${prodCount.value} baris`)
  console.log(`- Profil   : ${profCount.value} baris`)
  console.log('\nDatabase siap digunakan.')
}

testConnection().catch((err) => {
  console.error('\nKoneksi database gagal:', err)
  process.exit(1)
})
