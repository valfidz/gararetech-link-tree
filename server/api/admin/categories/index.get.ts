import { requireAdmin } from '../../../utils/auth'
import { getDb, ensureTablesExist } from '../../../db'
import { categories, products } from '../../../db/schema'
import { asc, eq, sql } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  requireAdmin(event)

  await ensureTablesExist()
  const db = getDb()

  // Ambil semua kategori diurutkan berdasarkan sortOrder
  const allCategories = await db
    .select()
    .from(categories)
    .orderBy(asc(categories.sortOrder))
    .all()

  // Hitung jumlah produk per kategori
  const productCounts = await db
    .select({
      categoryId: products.categoryId,
      totalCount: sql<number>`count(*)`.as('totalCount'),
      activeCount: sql<number>`sum(case when ${products.isActive} = 1 then 1 else 0 end)`.as('activeCount')
    })
    .from(products)
    .groupBy(products.categoryId)
    .all()

  const countMap = new Map(productCounts.map((c) => [c.categoryId, c]))

  const result = allCategories.map((cat) => {
    const counts = countMap.get(cat.id)
    return {
      ...cat,
      totalProducts: Number(counts?.totalCount || 0),
      activeProducts: Number(counts?.activeCount || 0)
    }
  })

  return result
})
