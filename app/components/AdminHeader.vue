<template>
  <header class="admin-top-nav">
    <div class="nav-brand">
      <NuxtLink to="/admin" class="nav-title">
        <img src="/favicon.png" alt="Logo" class="nav-logo" width="24" height="24" />
        <span>Admin Katalog</span>
      </NuxtLink>
    </div>
    <div class="nav-actions">
      <NuxtLink to="/" target="_blank" class="nav-link view-public" title="Buka Halaman Publik">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
          <polyline points="15 3 21 3 21 9"></polyline>
          <line x1="10" y1="14" x2="21" y2="3"></line>
        </svg>
        <span>Lihat Situs</span>
      </NuxtLink>
      <NuxtLink to="/admin/profil" class="nav-link" :class="{ active: currentRoute === '/admin/profil' }">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
        <span>Profil</span>
      </NuxtLink>
      <button type="button" class="nav-link logout-btn" @click="handleLogout" title="Keluar">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
          <polyline points="16 17 21 12 16 7"></polyline>
          <line x1="21" y1="12" x2="9" y2="12"></line>
        </svg>
        <span>Keluar</span>
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const currentRoute = computed(() => route.path)

const handleLogout = async () => {
  if (!confirm('Apakah kamu yakin ingin keluar dari panel admin?')) return
  try {
    await $fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
  } catch (err) {
    console.error('Logout error:', err)
    router.push('/admin/login')
  }
}
</script>

<style scoped>
.admin-top-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0 18px 0;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid var(--card-border);
}

.nav-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 700;
  color: var(--text-main);
  text-decoration: none;
}

.nav-logo {
  width: 24px;
  height: 24px;
  object-fit: contain;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  border-radius: var(--radius-sm);
  background: transparent;
  transition: all 0.15s ease;
}

.nav-link:hover {
  background-color: #E5E7EB;
  color: var(--text-main);
}

.nav-link.active {
  background-color: var(--primary-accent);
  color: var(--primary-text);
}

.view-public {
  background-color: #F3F4F6;
  border: 1px solid var(--card-border);
}

.logout-btn {
  color: var(--danger);
}
.logout-btn:hover {
  background-color: var(--danger-bg);
  color: var(--danger);
}

@media (max-width: 480px) {
  .nav-link span {
    display: none;
  }
  .nav-link {
    padding: 8px;
  }
}
</style>
