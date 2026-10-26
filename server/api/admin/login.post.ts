import bcrypt from 'bcryptjs'
import { checkLoginRateLimit, recordLoginAttempt, createSessionCookie } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  // Cegah cache respons admin
  setResponseHeader(event, 'Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')

  const ip = getRequestIP(event, { xForwardedFor: true }) || '127.0.0.1'

  // Periksa rate limiting (5 kali gagal per 15 menit)
  const rateLimit = checkLoginRateLimit(ip)
  if (!rateLimit.allowed) {
    throw createError({
      statusCode: 429,
      statusMessage: `Terlalu banyak percobaan gagal. Silakan coba lagi dalam ${rateLimit.remainingMinutes} menit.`
    })
  }

  const body = await readBody(event)
  const password = body?.password

  if (!password || typeof password !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Kata sandi wajib diisi.'
    })
  }

  const adminHash = process.env.ADMIN_PASSWORD_HASH
  if (!adminHash) {
    console.error('ADMIN_PASSWORD_HASH belum dikonfigurasi di environment!')
    throw createError({
      statusCode: 500,
      statusMessage: 'Konfigurasi server belum lengkap (ADMIN_PASSWORD_HASH tidak ditemukan).'
    })
  }

  const isMatch = bcrypt.compareSync(password.trim(), adminHash.trim())
  if (!isMatch) {
    recordLoginAttempt(ip, false)
    throw createError({
      statusCode: 401,
      statusMessage: 'Kata sandi tidak sesuai.'
    })
  }

  recordLoginAttempt(ip, true)
  createSessionCookie(event)

  return { success: true, message: 'Login berhasil.' }
})
