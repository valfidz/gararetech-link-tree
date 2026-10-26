<template>
  <div class="admin-container">
    <AdminHeader />

    <!-- Feedback Banner / Alert -->
    <div v-if="feedback.message" class="feedback-banner" :class="feedback.type" role="status">
      <span>{{ feedback.message }}</span>
      <button type="button" class="close-feedback" @click="feedback.message = ''" aria-label="Tutup">&times;</button>
    </div>

    <!-- Page Header -->
    <div class="page-title-row">
      <div>
        <h1 class="page-title">Profil & Tampilan Publik</h1>
        <p class="page-subtitle">Atur nama brand, bio deskripsi, foto avatar, dan akun sosial media.</p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="pending" class="state-card">
      <p>Memuat data profil...</p>
    </div>

    <!-- Form Profil -->
    <form v-else @submit.prevent="handleSaveProfile" class="profile-form-card">
      <!-- Nama / Brand -->
      <div class="form-group">
        <label for="brand-name" class="form-label">
          Nama / Brand <span class="required-mark">*</span>
        </label>
        <input
          id="brand-name"
          v-model="form.brandName"
          type="text"
          required
          maxlength="80"
          placeholder="Contoh: GarareTech"
          class="form-input"
        />
        <small class="form-hint">Maksimal 80 karakter. Ditampilkan sebagai judul utama halaman dan meta title.</small>
      </div>

      <!-- Bio -->
      <div class="form-group">
        <div class="label-with-counter">
          <label for="brand-bio" class="form-label">Bio Singkat</label>
          <span class="char-counter" :class="{ 'text-danger': (form.bio?.length || 0) > 200 }">
            {{ form.bio?.length || 0 }}/200
          </span>
        </div>
        <textarea
          id="brand-bio"
          v-model="form.bio"
          rows="3"
          maxlength="200"
          placeholder="Tulis deskripsi singkat mengenai rekomendasi produk pilihanmu..."
          class="form-textarea"
        ></textarea>
        <small class="form-hint">Maksimal 200 karakter. Ditampilkan di bawah nama brand dan deskripsi Open Graph.</small>
      </div>

      <!-- URL Foto Avatar & Preview (FR-A5) -->
      <div class="form-group">
        <label for="avatar-url" class="form-label">URL Foto Profil</label>
        <div class="avatar-field-row">
          <div class="avatar-preview-box">
            <img
              v-if="form.avatarUrl && !previewError"
              :src="form.avatarUrl"
              alt="Pratinjau Foto"
              class="avatar-preview-img"
              @error="previewError = true"
              @load="previewError = false"
            />
            <div v-else class="avatar-preview-fallback">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#1F2937" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
          </div>
          <div class="avatar-input-container">
            <input
              id="avatar-url"
              v-model="form.avatarUrl"
              type="url"
              placeholder="https://contoh.com/foto-profil.jpg"
              class="form-input"
              @input="previewError = false"
            />
            <small class="form-hint">Masukkan tautan langsung gambar (JPG, PNG, WebP). Pratinjau muncul di sebelah kiri.</small>
          </div>
        </div>
      </div>

      <!-- Akun X (Twitter) -->
      <div class="form-group">
        <label for="x-url" class="form-label">URL Akun X (Twitter)</label>
        <input
          id="x-url"
          v-model="form.xUrl"
          type="url"
          placeholder="https://x.com/username"
          class="form-input"
        />
        <small class="form-hint">Kosongkan jika tidak ingin menampilkan tombol X di halaman publik.</small>
      </div>

      <!-- Akun Facebook -->
      <div class="form-group">
        <label for="facebook-url" class="form-label">URL Akun Facebook</label>
        <input
          id="facebook-url"
          v-model="form.facebookUrl"
          type="url"
          placeholder="https://facebook.com/username"
          class="form-input"
        />
        <small class="form-hint">Kosongkan jika tidak ingin menampilkan tombol Facebook di halaman publik.</small>
      </div>

      <div class="form-submit-row">
        <NuxtLink to="/admin" class="secondary-btn">Kembali</NuxtLink>
        <button type="submit" class="primary-btn" :disabled="submitting">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
            <polyline points="17 21 17 13 7 13 7 21"></polyline>
            <polyline points="7 3 7 8 15 8"></polyline>
          </svg>
          <span>{{ submitting ? 'Menyimpan...' : 'Simpan Profil' }}</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'

interface ProfileData {
  id: number
  brandName: string
  bio: string
  avatarUrl: string | null
  xUrl: string | null
  facebookUrl: string | null
}

useHead({
  title: 'Pengaturan Profil — Admin Katalog'
})

const { data: profile, pending, refresh } = await useFetch<ProfileData>('/api/admin/profile')

const form = reactive({
  brandName: '',
  bio: '',
  avatarUrl: '',
  xUrl: '',
  facebookUrl: ''
})

const previewError = ref(false)
const submitting = ref(false)

const feedback = reactive({
  message: '',
  type: 'success' as 'success' | 'error'
})

const showFeedback = (msg: string, type: 'success' | 'error' = 'success') => {
  feedback.message = msg
  feedback.type = type
  setTimeout(() => {
    if (feedback.message === msg) feedback.message = ''
  }, 4000)
}

// Sinkronkan data saat dimuat
watch(
  profile,
  (val) => {
    if (val) {
      form.brandName = val.brandName || ''
      form.bio = val.bio || ''
      form.avatarUrl = val.avatarUrl || ''
      form.xUrl = val.xUrl || ''
      form.facebookUrl = val.facebookUrl || ''
    }
  },
  { immediate: true }
)

const handleSaveProfile = async () => {
  if (!form.brandName.trim()) {
    showFeedback('Nama / Brand wajib diisi.', 'error')
    return
  }

  if (form.bio.length > 200) {
    showFeedback('Bio tidak boleh melebihi 200 karakter.', 'error')
    return
  }

  submitting.value = true
  try {
    const res = await $fetch<{ success: boolean; message: string }>('/api/admin/profile', {
      method: 'PUT',
      body: {
        brandName: form.brandName,
        bio: form.bio,
        avatarUrl: form.avatarUrl,
        xUrl: form.xUrl,
        facebookUrl: form.facebookUrl
      }
    })
    showFeedback(res.message || 'Profil berhasil disimpan.')
    await refresh()
  } catch (err: any) {
    showFeedback(err?.data?.statusMessage || 'Gagal menyimpan profil.', 'error')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.feedback-banner {
  padding: 10px 14px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.feedback-banner.success {
  background-color: var(--success-bg);
  color: var(--success);
  border: 1px solid #86EFAC;
}

.feedback-banner.error {
  background-color: var(--danger-bg);
  color: var(--danger);
  border: 1px solid #FCA5A5;
}

.close-feedback {
  font-size: 18px;
  line-height: 1;
  opacity: 0.7;
}

.page-title-row {
  margin-bottom: 1.5rem;
}

.page-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 0.25rem;
}

.page-subtitle {
  font-size: 13px;
  color: var(--text-secondary);
}

.profile-form-card {
  background-color: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
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

.required-mark {
  color: var(--danger);
}

.label-with-counter {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.char-counter {
  font-size: 12px;
  color: var(--text-secondary);
}

.form-input {
  width: 100%;
  height: 44px;
  padding: 0 12px;
  font-size: 14px;
  font-family: inherit;
  border: 1px solid var(--card-border);
  border-radius: var(--radius-md);
  background-color: #FAFAFA;
}

.form-input:focus {
  outline: none;
  border-color: var(--secondary-accent);
  background-color: #FFFFFF;
}

.form-textarea {
  width: 100%;
  padding: 10px 12px;
  font-size: 14px;
  font-family: inherit;
  border: 1px solid var(--card-border);
  border-radius: var(--radius-md);
  background-color: #FAFAFA;
  resize: vertical;
}

.form-textarea:focus {
  outline: none;
  border-color: var(--secondary-accent);
  background-color: #FFFFFF;
}

.form-hint {
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.4;
}

.avatar-field-row {
  display: flex;
  align-items: center;
  gap: 14px;
}

.avatar-preview-box {
  flex-shrink: 0;
}

.avatar-preview-img {
  width: 60px;
  height: 60px;
  border-radius: var(--radius-full);
  object-fit: cover;
  border: 2px solid var(--primary-accent);
}

.avatar-preview-fallback {
  width: 60px;
  height: 60px;
  border-radius: var(--radius-full);
  background-color: var(--primary-accent);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-input-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.form-submit-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--card-border);
}

.primary-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background-color: var(--primary-accent);
  color: var(--primary-text);
  font-size: 14px;
  font-weight: 600;
  padding: 10px 16px;
  border-radius: var(--radius-md);
  transition: background-color 0.15s ease;
}

.primary-btn:hover:not(:disabled) {
  background-color: #FFB300;
}

.secondary-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background-color: #F3F4F6;
  border: 1px solid var(--card-border);
  color: var(--text-main);
  font-size: 14px;
  font-weight: 600;
  padding: 10px 16px;
  border-radius: var(--radius-md);
}
</style>
