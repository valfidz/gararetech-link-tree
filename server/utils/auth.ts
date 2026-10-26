import crypto from 'crypto'
import type { H3Event } from 'h3'

const COOKIE_NAME = 'admin_session'
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 hari

// Rate limiting in-memory untuk percobaan login
// 5 kali gagal per 15 menit per IP
interface RateLimitEntry {
  failures: number
  lockedUntil: number
}
const loginRateLimits = new Map<string, RateLimitEntry>()

export function checkLoginRateLimit(ip: string): { allowed: boolean; remainingMinutes?: number } {
  const now = Date.now()
  const entry = loginRateLimits.get(ip)

  if (!entry) {
    return { allowed: true }
  }

  if (now < entry.lockedUntil) {
    const remainingMinutes = Math.ceil((entry.lockedUntil - now) / 60000)
    return { allowed: false, remainingMinutes }
  }

  if (now >= entry.lockedUntil && entry.lockedUntil > 0) {
    loginRateLimits.delete(ip)
  }

  return { allowed: true }
}

export function recordLoginAttempt(ip: string, success: boolean) {
  const now = Date.now()
  if (success) {
    loginRateLimits.delete(ip)
    return
  }

  const entry = loginRateLimits.get(ip) || { failures: 0, lockedUntil: 0 }
  entry.failures += 1

  if (entry.failures >= 5) {
    entry.lockedUntil = now + 15 * 60 * 1000 // 15 menit
  }

  loginRateLimits.set(ip, entry)
}

function getSecretKey(): string {
  const secret = process.env.SESSION_SECRET
  if (!secret || secret.length < 32) {
    console.warn('PERINGATAN: SESSION_SECRET belum disetel atau kurang dari 32 karakter!')
    return secret || 'default-fallback-insecure-secret-key-32-chars!'
  }
  return secret
}

function sign(value: string, secret: string): string {
  const hmac = crypto.createHmac('sha256', secret).update(value).digest('hex')
  return `${value}.${hmac}`
}

function unsign(input: string, secret: string): string | null {
  const lastDot = input.lastIndexOf('.')
  if (lastDot === -1) return null

  const value = input.slice(0, lastDot)
  const signature = input.slice(lastDot + 1)

  const expectedHmac = crypto.createHmac('sha256', secret).update(value).digest('hex')
  if (crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedHmac))) {
    return value
  }
  return null
}

export function createSessionCookie(event: H3Event) {
  const secret = getSecretKey()
  const payload = JSON.stringify({
    role: 'admin',
    exp: Date.now() + SESSION_DURATION
  })
  const signed = sign(payload, secret)

  setCookie(event, COOKIE_NAME, signed, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60,
    path: '/'
  })
}

export function clearSessionCookie(event: H3Event) {
  deleteCookie(event, COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  })
}

export function verifyAdminSession(event: H3Event): boolean {
  const cookieValue = getCookie(event, COOKIE_NAME)
  if (!cookieValue) return false

  const secret = getSecretKey()
  const rawPayload = unsign(cookieValue, secret)
  if (!rawPayload) return false

  try {
    const data = JSON.parse(rawPayload)
    if (data.role === 'admin' && data.exp > Date.now()) {
      return true
    }
  } catch {
    return false
  }

  return false
}

export function requireAdmin(event: H3Event) {
  if (!verifyAdminSession(event)) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Sesi tidak valid atau telah berakhir. Silakan login kembali.'
    })
  }

  // Pengecekan CSRF / Origin untuk metode modifikasi data (POST, PUT, PATCH, DELETE)
  const method = getMethod(event)
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    validateOrigin(event)
  }
}

export function validateOrigin(event: H3Event) {
  const origin = getRequestHeader(event, 'origin')
  const host = getRequestHeader(event, 'host')

  if (!origin) {
    // Jika tidak ada origin header (misal di beberapa request browser terisolasi), periksa referer
    const referer = getRequestHeader(event, 'referer')
    if (referer && host && !referer.includes(host)) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Akses ditolak: Referer tidak sesuai.'
      })
    }
    return
  }

  if (host) {
    const originHost = origin.replace(/^https?:\/\//, '').split(':')[0]
    const currentHost = host.split(':')[0]
    if (originHost !== currentHost) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Akses ditolak: Origin tidak sesuai.'
      })
    }
  }
}
