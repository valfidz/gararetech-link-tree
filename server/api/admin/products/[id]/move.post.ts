import { requireAdmin } from '../../../../utils/auth'
import { getDb, ensureTablesExist } from '../../../../db'
import { products } from '../../../../db/schema'
import { asc, eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  requireAdmin(event)

  const idParam = getRouterParam(event, 'id')
  const id = Number(idParam)
  if (!id || isNaN(id)) {
    throw createError({ statusCode: 400, statusMessage: 'ID produk tidak valid.' })
  }

  const body = await readBody(event)
  const direction = body?.direction
  if (direction !== 'up' && direction !== 'down') {
    throw createError({ statusCode: 400, statusMessage: 'Arah urutan harus "up" atau "down".' })
  }

  await ensureTablesExist()
  const db = getDb()

  const currentProduct = await db.select().from(products).where(eq(products.id, id)).get()
  if (!currentProduct) {
    throw createError({ statusCode: 404, statusMessage: 'Produk tidak ditemukan.' })
  }

  // Ambil semua produk dalam kategori yang sama
  const categoryProducts = await db
    .select()
    .from(products)
    .where(eq(products.categoryId, currentProduct.categoryId))
    .orderBy(asc(products.sortOrder))
    .all()

  const currentIndex = categoryProducts.findIndex((p) => p.id === id)
  if (currentIndex === -1) {
    throw createError({ statusCode: 404, statusMessage: 'Produk tidak ditemukan dalam kategori.' })
  }

  const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
  if (targetIndex < 0 || targetIndex >= categoryProducts.length) {
    return { success: true, message: 'Item sudah berada di batas urutan.' }
  }

  const targetProduct = categoryProducts[targetIndex]

  // Tukar sortOrder
  await db
    .update(products)
    .set({ sortOrder: targetProduct.sortOrder, updatedAt: new Date().toISOString() })
    .where(eq(products.id, currentProduct.id))

  await db
    .update(products)
    .set({ sortOrder: currentProduct.sortOrder, updatedAt: new Date().toISOString() })
    .where(eq(products.id, targetProduct.id))

  return { success: true, message: 'Urutan produk berhasil diubah.' }
})
