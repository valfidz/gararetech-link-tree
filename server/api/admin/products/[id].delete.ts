import { requireAdmin } from '../../../utils/auth'
import { getDb, ensureTablesExist } from '../../../db'
import { products } from '../../../db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  requireAdmin(event)

  const idParam = getRouterParam(event, 'id')
  const id = Number(idParam)
  if (!id || isNaN(id)) {
    throw createError({ statusCode: 400, statusMessage: 'ID produk tidak valid.' })
  }

  await ensureTablesExist()
  const db = getDb()

  const existing = await db.select().from(products).where(eq(products.id, id)).get()
  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Produk tidak ditemukan.' })
  }

  await db.delete(products).where(eq(products.id, id))

  return {
    success: true,
    message: 'Produk berhasil dihapus.'
  }
})
