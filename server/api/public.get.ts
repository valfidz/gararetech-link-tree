import { getDb, ensureTablesExist } from '../db'
import { categories, products, profile } from '../db/schema'
import { eq, asc } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  // Set cache headers according to PRD Section 11
  setResponseHeaders(event, {
    'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=600'
  })

  try {
    await ensureTablesExist()
    const db = getDb()

    // 1. Ambil data profil (id = 1)
    let userProfile = await db.select().from(profile).where(eq(profile.id, 1)).get()
    if (!userProfile) {
      userProfile = {
        id: 1,
        brandName: 'Katalog Affiliate',
        bio: '',
        avatarUrl: null,
        xUrl: null,
        facebookUrl: null,
        updatedAt: new Date().toISOString()
      }
    }

    // 2. Ambil semua kategori aktif yang diurutkan berdasarkan sortOrder
    const activeCategories = await db
      .select()
      .from(categories)
      .where(eq(categories.isActive, 1))
      .orderBy(asc(categories.sortOrder))
      .all()

    // 3. Ambil semua produk aktif yang diurutkan
    const activeProducts = await db
      .select({
        id: products.id,
        categoryId: products.categoryId,
        name: products.name,
        url: products.url,
        sortOrder: products.sortOrder
      })
      .from(products)
      .where(eq(products.isActive, 1))
      .orderBy(asc(products.sortOrder))
      .all()

    // 4. Kelompokkan produk ke dalam kategori
    // Sesuai FR-P2: Kategori tanpa produk aktif TIDAK ditampilkan
    const categoriesWithProducts = activeCategories
      .map((cat) => {
        const catProducts = activeProducts.filter((p) => p.categoryId === cat.id)
        return {
          id: cat.id,
          name: cat.name,
          sortOrder: cat.sortOrder,
          productCount: catProducts.length,
          products: catProducts
        }
      })
      .filter((cat) => cat.products.length > 0)

    return {
      profile: {
        brandName: userProfile.brandName,
        bio: userProfile.bio,
        avatarUrl: userProfile.avatarUrl,
        xUrl: userProfile.xUrl,
        facebookUrl: userProfile.facebookUrl
      },
      categories: categoriesWithProducts
    }
  } catch (error) {
    console.error('Database error in /api/public:', error)
    // Sesuai FR keandalan: pesan ramah
    throw createError({
      statusCode: 503,
      statusMessage: 'Layanan katalog sedang dalam pemeliharaan. Silakan coba beberapa saat lagi.'
    })
  }
})
