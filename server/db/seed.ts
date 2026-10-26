import { getDb, ensureTablesExist } from './index'
import { categories, products, profile } from './schema'
import { eq } from 'drizzle-orm'

export async function runSeed() {
  console.log('Menjalankan database seed...')
  await ensureTablesExist()
  const db = getDb()

  const now = new Date().toISOString()

  // 1. Profil
  const existingProfile = await db.select().from(profile).where(eq(profile.id, 1)).get()
  if (!existingProfile) {
    await db.insert(profile).values({
      id: 1,
      brandName: 'GarareTech',
      bio: 'Rekomendasi gadget, aksesoris smartphone, dan setup meja kerja terbaik pilihan kami.',
      avatarUrl: '',
      xUrl: 'https://x.com/gararetech',
      facebookUrl: 'https://facebook.com/gararetech',
      updatedAt: now
    })
  }

  // 2. Kategori contoh: Kabel Data, Charger & Adaptor, Holder HP
  const sampleCategories = [
    {
      name: 'Kabel Data',
      sortOrder: 1,
      isActive: 1,
      products: [
        { name: 'Baseus USB Type-C to Type-C 100W Fast Charging', url: 'https://example.com/kabel-baseus-100w' },
        { name: 'UGREEN Kabel Lightning MFi 2.4A Braided', url: 'https://example.com/kabel-ugreen-lightning' },
        { name: 'Anker PowerLine III Flow Type-C Soft Silicone', url: 'https://example.com/anker-flow-c' }
      ]
    },
    {
      name: 'Charger & Adaptor',
      sortOrder: 2,
      isActive: 1,
      products: [
        { name: 'UGREEN Nexode 65W GaN Fast Charger 3-Port', url: 'https://example.com/ugreen-nexode-65w' },
        { name: 'Anker Nano II 30W Compact Charger', url: 'https://example.com/anker-nano-30w' },
        { name: 'Baseus GaN5 Pro 100W Desktop Charger', url: 'https://example.com/baseus-gan5-100w' }
      ]
    },
    {
      name: 'Holder HP & Tablet',
      sortOrder: 3,
      isActive: 1,
      products: [
        { name: 'Holder Meja Aluminium Foldable 360 Derajat', url: 'https://example.com/holder-meja-360' },
        { name: 'Car Phone Holder Magnetic MagSafe Dashboard', url: 'https://example.com/car-holder-magsafe' }
      ]
    }
  ]

  const existingCategories = await db.select().from(categories).all()
  if (existingCategories.length === 0) {
    for (const cat of sampleCategories) {
      const insertedCat = await db.insert(categories).values({
        name: cat.name,
        sortOrder: cat.sortOrder,
        isActive: cat.isActive,
        createdAt: now,
        updatedAt: now
      }).returning().get()

      let pOrder = 1
      for (const prod of cat.products) {
        await db.insert(products).values({
          categoryId: insertedCat.id,
          name: prod.name,
          url: prod.url,
          sortOrder: pOrder++,
          isActive: 1,
          createdAt: now,
          updatedAt: now
        })
      }
    }
    console.log('Seed berhasil diisi!')
  } else {
    console.log('Database sudah memiliki data kategori. Seed dilewati.')
  }
}

// Jika dijalankan langsung via node / tsx
if (import.meta.url === `file:///${process.argv[1]?.replace(/\\/g, '/')}`) {
  runSeed()
    .then(() => {
      console.log('Selesai.')
      process.exit(0)
    })
    .catch((err) => {
      console.error('Gagal seed:', err)
      process.exit(1)
    })
}
