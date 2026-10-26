import { requireAdmin } from '../../utils/auth'
import { validateName, validateBio, validateOptionalUrl } from '../../utils/validation'
import { getDb, ensureTablesExist } from '../../db'
import { profile } from '../../db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  requireAdmin(event)

  const body = await readBody(event)
  const brandName = validateName(body?.brandName, 'Nama / Brand')
  const bio = validateBio(body?.bio)
  const avatarUrl = validateOptionalUrl(body?.avatarUrl, 'Foto')
  const xUrl = validateOptionalUrl(body?.xUrl, 'Akun X')
  const facebookUrl = validateOptionalUrl(body?.facebookUrl, 'Akun Facebook')

  await ensureTablesExist()
  const db = getDb()

  const now = new Date().toISOString()

  const existing = await db.select().from(profile).where(eq(profile.id, 1)).get()
  let updated

  if (!existing) {
    updated = await db
      .insert(profile)
      .values({
        id: 1,
        brandName,
        bio,
        avatarUrl,
        xUrl,
        facebookUrl,
        updatedAt: now
      })
      .returning()
      .get()
  } else {
    updated = await db
      .update(profile)
      .set({
        brandName,
        bio,
        avatarUrl,
        xUrl,
        facebookUrl,
        updatedAt: now
      })
      .where(eq(profile.id, 1))
      .returning()
      .get()
  }

  return {
    success: true,
    message: 'Profil berhasil disimpan.',
    profile: updated
  }
})
