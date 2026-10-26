import { requireAdmin } from '../../../utils/auth'
import { validateName, validateProductUrl } from '../../../utils/validation'
import { getDb, ensureTablesExist } from '../../../db'
import { categories, products } from '../../../db/schema'
import { desc, eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  requireAdmin(event)

  const idParam = getRouterParam(event, 'id')
  const id = Number(idParam)
  if (!id || isNaN(id)) {
    throw createError({ statusCode: 400, statusMessage: 'ID produk tidak valid.' })
  }

  const body = await readBody(event)
  await ensureTablesExist()
  const db = getDb()

  const existing = await db.select().from(products).where(eq(products.id, id)).get()
  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Produk tidak ditemukan.' })
  }

  const updates: Partial<typeof products.$inferInsert> = {
    updatedAt: new Date().toISOString()
  }

  if (body?.name !== undefined) {
    updates.name = validateName(body.name, 'Nama produk')
  }

  if (body?.url !== undefined) {
    updates.url = validateProductUrl(body.url)
  }

  if (body?.isActive !== undefined) {
    updates.isActive = body.isActive ? 1 : 0
  }

  // Jika memindahkan ke kategori lain
  if (body?.categoryId !== undefined && Number(body.categoryId) !== existing.categoryId) {
    const targetCategoryId = Number(body.categoryId)
    const targetCat = await db.select().from(categories).where(eq(categories.id, targetCategoryId)).get()
    if (!targetCat) {
      throw createError({ statusCode: 404, statusMessage: 'Kategori tujuan tidak ditemukan.' })
    }

    // Urutan paling bawah kategori tujuan (FR-A3)
    const lastProd = await db
      .select({ sortOrder: products.sortOrder })
      .from(products)
      .where(eq(products.categoryId, targetCategoryId))
      .orderBy(desc(products.sortOrder))
      .limit(1)
      .get()

    updates.categoryId = targetCategoryId
    updates.sortOrder = lastProd ? lastProd.sortOrder + 1 : 1
  }

  const updated = await db
    .update(products)
    .set(updates)
    .where(eq(products.id, id))
    .returning()
    .get()

  return {
    success: true,
    message: 'Produk berhasil diperbarui.',
    product: updated
  }
})
