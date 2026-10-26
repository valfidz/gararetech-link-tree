import { requireAdmin } from '../../../utils/auth'
import { validateName } from '../../../utils/validation'
import { getDb, ensureTablesExist } from '../../../db'
import { categories } from '../../../db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  requireAdmin(event)

  const idParam = getRouterParam(event, 'id')
  const id = Number(idParam)
  if (!id || isNaN(id)) {
    throw createError({ statusCode: 400, statusMessage: 'ID kategori tidak valid.' })
  }

  const body = await readBody(event)
  await ensureTablesExist()
  const db = getDb()

  const existing = await db.select().from(categories).where(eq(categories.id, id)).get()
  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Kategori tidak ditemukan.' })
  }

  const updates: Partial<typeof categories.$inferInsert> = {
    updatedAt: new Date().toISOString()
  }

  if (body?.name !== undefined) {
    updates.name = validateName(body.name, 'Nama kategori')
  }

  if (body?.isActive !== undefined) {
    updates.isActive = body.isActive ? 1 : 0
  }

  const updated = await db
    .update(categories)
    .set(updates)
    .where(eq(categories.id, id))
    .returning()
    .get()

  return {
    success: true,
    message: 'Kategori berhasil diperbarui.',
    category: updated
  }
})
