<template>
  <main class="login-wrapper">
    <div class="login-card">
      <div class="login-header">
        <div class="login-badge">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#1F2937" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </div>
        <h1 class="login-title">Admin Katalog</h1>
        <p class="login-subtitle">Masukkan kata sandi untuk mengelola kategori, produk, dan profil.</p>
      </div>

      <div v-if="errorMessage" class="error-box" role="alert">
        {{ errorMessage }}
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="password" class="form-label">Kata Sandi</label>
          <div class="input-container">
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Masukkan kata sandi..."
              required
              autocomplete="current-password"
              class="form-input"
              :disabled="loading"
            />
            <button
              type="button"
              class="toggle-visibility-btn"
              :aria-label="showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'"
              @click="showPassword = !showPassword"
            >
              <svg v-if="!showPassword" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              <svg v-else viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
              </svg>
            </button>
          </div>
        </div>

        <button type="submit" class="submit-btn" :disabled="loading">
          <span v-if="loading">Memverifikasi...</span>
          <span v-else>Masuk ke Admin</span>
        </button>
      </form>

      <div class="login-footer">
        <NuxtLink to="/" class="back-link">
          &larr; Kembali ke halaman publik
        </NuxtLink>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const errorMessage = ref('')

useHead({
  title: 'Login Admin — Katalog Affiliate'
})

const handleLogin = async () => {
  if (!password.value.trim()) return

  loading.value = true
  errorMessage.value = ''

  try {
    const res = await $fetch<{ success: boolean; message: string }>('/api/admin/login', {
      method: 'POST',
      body: { password: password.value }
    })

    if (res.success) {
      router.push('/admin')
    }
  } catch (err: any) {
    errorMessage.value = err?.data?.statusMessage || 'Gagal masuk. Periksa kembali kata sandi kamu.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background-color: var(--bg-page);
}

.login-card {
  width: 100%;
  max-width: 400px;
  background-color: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: var(--radius-lg);
  padding: 2rem 1.5rem;
  box-shadow: var(--shadow-md);
}

.login-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.login-badge {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-full);
  background-color: var(--primary-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem auto;
}

.login-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 0.35rem;
}

.login-subtitle {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.45;
}

.error-box {
  padding: 10px 14px;
  background-color: var(--danger-bg);
  border: 1px solid #FCA5A5;
  color: var(--danger);
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 1.25rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-main);
}

.input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.form-input {
  width: 100%;
  height: 46px;
  padding: 0 42px 0 14px;
  font-size: 14px;
  font-family: inherit;
  border: 1px solid var(--card-border);
  border-radius: var(--radius-md);
  background-color: #FAFAFA;
  color: var(--text-main);
  transition: border-color 0.15s ease, background-color 0.15s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--secondary-accent);
  background-color: #FFFFFF;
}

.toggle-visibility-btn {
  position: absolute;
  right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  padding: 4px;
}

.submit-btn {
  width: 100%;
  height: 48px;
  background-color: var(--primary-accent);
  color: var(--primary-text);
  font-weight: 600;
  font-size: 15px;
  border-radius: var(--radius-md);
  transition: background-color 0.15s ease;
  box-shadow: var(--shadow-sm);
}

.submit-btn:hover:not(:disabled) {
  background-color: #FFB300;
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.login-footer {
  margin-top: 1.5rem;
  text-align: center;
}

.back-link {
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 500;
}

.back-link:hover {
  color: var(--text-main);
  text-decoration: underline;
}
</style>
