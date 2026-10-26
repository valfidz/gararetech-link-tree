import { requireAdmin } from '../../../utils/auth'
import { getDb, ensureTablesExist } from '../../../db'
import { categories, products } from '../../../db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  requireAdmin(event)

  const idParam = getRouterParam(event, 'id')
  const id = Number(idParam)
  if (!id || isNaN(id)) {
    throw createError({ statusCode: 400, statusMessage: 'ID kategori tidak valid.' })
  }

  await ensureTablesExist()
  const db = getDb()

  const existing = await db.select().from(categories).where(eq(categories.id, id)).get()
  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Kategori tidak ditemukan.' })
  }

  // Hapus semua produk dalam kategori ini terlebih dahulu (cascade)
  await db.delete(products).where(eq(products.categoryId, id))
  // Hapus kategori
  await db.delete(categories).where(eq(categories.id, id))

  return {
    success: true,
    message: 'Kategori beserta semua produk di dalamnya berhasil dihapus.'
  }
})
