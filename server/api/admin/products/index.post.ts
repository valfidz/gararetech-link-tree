import { requireAdmin } from '../../../utils/auth'
import { validateName, validateProductUrl } from '../../../utils/validation'
import { getDb, ensureTablesExist } from '../../../db'
import { categories, products } from '../../../db/schema'
import { desc, eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  requireAdmin(event)

  const body = await readBody(event)
  const categoryId = Number(body?.categoryId)
  if (!categoryId || isNaN(categoryId)) {
    throw createError({ statusCode: 400, statusMessage: 'Kategori harus dipilih.' })
  }

  const name = validateName(body?.name, 'Nama produk')
  const url = validateProductUrl(body?.url)

  await ensureTablesExist()
  const db = getDb()

  // Pastikan kategori ada
  const cat = await db.select().from(categories).where(eq(categories.id, categoryId)).get()
  if (!cat) {
    throw createError({ statusCode: 404, statusMessage: 'Kategori tujuan tidak ditemukan.' })
  }

  // Dapatkan urutan terakhir di kategori ini
  const lastProd = await db
    .select({ sortOrder: products.sortOrder })
    .from(products)
    .where(eq(products.categoryId, categoryId))
    .orderBy(desc(products.sortOrder))
    .limit(1)
    .get()

  const nextOrder = lastProd ? lastProd.sortOrder + 1 : 1
  const now = new Date().toISOString()

  const newProd = await db
    .insert(products)
    .values({
      categoryId,
      name,
      url,
      sortOrder: nextOrder,
      isActive: 1,
      createdAt: now,
      updatedAt: now
    })
    .returning()
    .get()

  return {
    success: true,
    message: 'Produk berhasil ditambahkan.',
    product: newProd
  }
})
