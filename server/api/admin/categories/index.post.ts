import { requireAdmin } from '../../../utils/auth'
import { validateName } from '../../../utils/validation'
import { getDb, ensureTablesExist } from '../../../db'
import { categories } from '../../../db/schema'
import { desc } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  requireAdmin(event)

  const body = await readBody(event)
  const name = validateName(body?.name, 'Nama kategori')

  await ensureTablesExist()
  const db = getDb()

  // Dapatkan sort_order tertinggi saat ini
  const lastCategory = await db
    .select({ sortOrder: categories.sortOrder })
    .from(categories)
    .orderBy(desc(categories.sortOrder))
    .limit(1)
    .get()

  const nextOrder = lastCategory ? lastCategory.sortOrder + 1 : 1
  const now = new Date().toISOString()

  const newCategory = await db
    .insert(categories)
    .values({
      name,
      sortOrder: nextOrder,
      isActive: 1,
      createdAt: now,
      updatedAt: now
    })
    .returning()
    .get()

  return {
    success: true,
    message: 'Kategori berhasil ditambahkan.',
    category: newCategory
  }
})
