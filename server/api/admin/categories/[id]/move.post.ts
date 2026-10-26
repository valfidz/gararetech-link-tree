import { requireAdmin } from '../../../../utils/auth'
import { getDb, ensureTablesExist } from '../../../../db'
import { categories } from '../../../../db/schema'
import { asc, eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  requireAdmin(event)

  const idParam = getRouterParam(event, 'id')
  const id = Number(idParam)
  if (!id || isNaN(id)) {
    throw createError({ statusCode: 400, statusMessage: 'ID kategori tidak valid.' })
  }

  const body = await readBody(event)
  const direction = body?.direction
  if (direction !== 'up' && direction !== 'down') {
    throw createError({ statusCode: 400, statusMessage: 'Arah urutan harus "up" atau "down".' })
  }

  await ensureTablesExist()
  const db = getDb()

  const allCategories = await db
    .select()
    .from(categories)
    .orderBy(asc(categories.sortOrder))
    .all()

  const currentIndex = allCategories.findIndex((c) => c.id === id)
  if (currentIndex === -1) {
    throw createError({ statusCode: 404, statusMessage: 'Kategori tidak ditemukan.' })
  }

  const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
  if (targetIndex < 0 || targetIndex >= allCategories.length) {
    return { success: true, message: 'Item sudah berada di batas urutan.' }
  }

  const currentItem = allCategories[currentIndex]
  const targetItem = allCategories[targetIndex]

  // Tukar nilai sortOrder
  await db
    .update(categories)
    .set({ sortOrder: targetItem.sortOrder, updatedAt: new Date().toISOString() })
    .where(eq(categories.id, currentItem.id))

  await db
    .update(categories)
    .set({ sortOrder: currentItem.sortOrder, updatedAt: new Date().toISOString() })
    .where(eq(categories.id, targetItem.id))

  return { success: true, message: 'Urutan kategori berhasil diubah.' }
})
