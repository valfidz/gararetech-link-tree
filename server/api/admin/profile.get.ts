import { requireAdmin } from '../../utils/auth'
import { getDb, ensureTablesExist } from '../../db'
import { profile } from '../../db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  requireAdmin(event)

  await ensureTablesExist()
  const db = getDb()

  let userProfile = await db.select().from(profile).where(eq(profile.id, 1)).get()
  if (!userProfile) {
    userProfile = {
      id: 1,
      brandName: '',
      bio: '',
      avatarUrl: null,
      xUrl: null,
      facebookUrl: null,
      updatedAt: new Date().toISOString()
    }
  }

  return userProfile
})
