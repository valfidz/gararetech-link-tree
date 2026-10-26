import { verifyAdminSession } from '../../utils/auth'

export default defineEventHandler((event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  const isValid = verifyAdminSession(event)
  return { authenticated: isValid }
})
