import { clearSessionCookie, requireAdmin } from '../../utils/auth'

export default defineEventHandler((event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  requireAdmin(event)
  clearSessionCookie(event)
  return { success: true, message: 'Berhasil keluar.' }
})
