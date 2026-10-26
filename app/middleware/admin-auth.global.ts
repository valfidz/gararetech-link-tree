export default defineNuxtRouteMiddleware(async (to) => {
  // Hanya berlaku untuk rute /admin/*
  if (!to.path.startsWith('/admin')) {
    return
  }

  // Jika membuka halaman login
  if (to.path === '/admin/login') {
    try {
      const { data } = await useFetch('/api/admin/session')
      if (data.value?.authenticated) {
        return navigateTo('/admin')
      }
    } catch {
      // Abaikan jika gagal
    }
    return
  }

  // Untuk semua rute admin selain login, wajib terotentikasi
  try {
    const { data } = await useFetch('/api/admin/session')
    if (!data.value?.authenticated) {
      return navigateTo('/admin/login')
    }
  } catch {
    return navigateTo('/admin/login')
  }
})
