import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import * as schema from './schema'

let _client: ReturnType<typeof createClient> | null = null
let _db: ReturnType<typeof drizzle> | null = null
let _initialized = false

export function getTursoConfig() {
  let url = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || process.env.NUXT_TURSO_DATABASE_URL
  let authToken = process.env.TURSO_AUTH_TOKEN || process.env.DATABASE_AUTH_TOKEN || process.env.NUXT_TURSO_AUTH_TOKEN
  const syncUrl = process.env.TURSO_SYNC_URL || process.env.DATABASE_SYNC_URL

  // Read from Nuxt Nitro runtimeConfig if available
  try {
    // @ts-ignore
    if (typeof useRuntimeConfig === 'function') {
      // @ts-ignore
      const config = useRuntimeConfig()
      if (config?.turso?.databaseUrl) {
        url = config.turso.databaseUrl
      }
      if (config?.turso?.authToken) {
        authToken = config.turso.authToken
      }
    }
  } catch {
    // Outside of Nuxt runtime context (e.g. standalone scripts or drizzle-kit)
  }

  return {
    url: url || 'file:./local.db',
    authToken: authToken || undefined,
    syncUrl: syncUrl || undefined
  }
}

export function getClient() {
  if (!_client) {
    const config = getTursoConfig()
    _client = createClient({
      url: config.url,
      authToken: config.authToken,
      syncUrl: config.syncUrl
    })
  }
  return _client
}

export function getDb() {
  if (!_db) {
    const client = getClient()
    _db = drizzle(client, { schema })
  }
  return _db
}

export async function ensureTablesExist() {
  if (_initialized) return
  const db = getDb()
  
  // DDL definitions according to PRD Section 7
  await db.run(`
    CREATE TABLE IF NOT EXISTS categories (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT NOT NULL,
      sort_order  INTEGER NOT NULL,
      is_active   INTEGER NOT NULL DEFAULT 1,
      created_at  TEXT NOT NULL,
      updated_at  TEXT NOT NULL
    );
  `)

  await db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
      name        TEXT NOT NULL,
      url         TEXT NOT NULL,
      sort_order  INTEGER NOT NULL,
      is_active   INTEGER NOT NULL DEFAULT 1,
      created_at  TEXT NOT NULL,
      updated_at  TEXT NOT NULL
    );
  `)

  await db.run(`
    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id, sort_order);
  `)

  await db.run(`
    CREATE TABLE IF NOT EXISTS profile (
      id           INTEGER PRIMARY KEY CHECK (id = 1),
      brand_name   TEXT NOT NULL DEFAULT '',
      bio          TEXT NOT NULL DEFAULT '',
      avatar_url   TEXT,
      x_url        TEXT,
      facebook_url TEXT,
      updated_at   TEXT NOT NULL
    );
  `)

  _initialized = true
}
