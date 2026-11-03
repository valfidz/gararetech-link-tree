export function validateName(name: unknown, fieldName: string = 'Nama'): string {
  if (typeof name !== 'string' || !name.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: `${fieldName} wajib diisi.`
    })
  }
  const trimmed = name.trim()
  if (trimmed.length > 80) {
    throw createError({
      statusCode: 400,
      statusMessage: `${fieldName} maksimal 80 karakter.`
    })
  }
  return trimmed
}

export function validateProductUrl(url: unknown): string {
  if (typeof url !== 'string' || !url.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: 'URL produk wajib diisi.'
    })
  }
  const trimmed = url.trim()
  const lower = trimmed.toLowerCase()
  if (!lower.startsWith('http://') && !lower.startsWith('https://')) {
    throw createError({
      statusCode: 400,
      statusMessage: 'URL produk harus diawali dengan http:// atau https://'
    })
  }
  if (lower.startsWith('javascript:') || lower.startsWith('data:') || lower.startsWith('vbscript:')) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Skema URL tidak diperbolehkan.'
    })
  }
  try {
    new URL(trimmed)
  } catch {
    throw createError({
      statusCode: 400,
      statusMessage: 'Format URL produk tidak valid.'
    })
  }
  return trimmed
}

export function validateOptionalUrl(url: unknown, fieldName: string): string | null {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return null
  }
  const trimmed = url.trim()
  if (trimmed.startsWith('/')) {
    return trimmed
  }
  const lower = trimmed.toLowerCase()
  if (!lower.startsWith('http://') && !lower.startsWith('https://')) {
    throw createError({
      statusCode: 400,
      statusMessage: `URL ${fieldName} harus diawali dengan http://, https://, atau path /`
    })
  }
  try {
    new URL(trimmed)
  } catch {
    throw createError({
      statusCode: 400,
      statusMessage: `Format URL ${fieldName} tidak valid.`
    })
  }
  return trimmed
}

export function validateBio(bio: unknown): string {
  if (!bio || typeof bio !== 'string') {
    return ''
  }
  const trimmed = bio.trim()
  if (trimmed.length > 200) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bio maksimal 200 karakter.'
    })
  }
  return trimmed
}
