import { requireAdmin } from '../../../../utils/auth'
import { getDb, ensureTablesExist } from '../../../../db'
import { categories, products } from '../../../../db/schema'
import { asc, eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  requireAdmin(event)

  const idParam = getRouterParam(event, 'id')
  const categoryId = Number(idParam)
  if (!categoryId || isNaN(categoryId)) {
    throw createError({ statusCode: 400, statusMessage: 'ID kategori tidak valid.' })
  }

  await ensureTablesExist()
  const db = getDb()

  const category = await db.select().from(categories).where(eq(categories.id, categoryId)).get()
  if (!category) {
    throw createError({ statusCode: 404, statusMessage: 'Kategori tidak ditemukan.' })
  }

  const categoryProducts = await db
    .select()
    .from(products)
    .where(eq(products.categoryId, categoryId))
    .orderBy(asc(products.sortOrder))
    .all()

  return {
    category,
    products: categoryProducts
  }
})
