<template>
  <div class="admin-container">
    <AdminHeader />

    <!-- Feedback Banner / Alert -->
    <div v-if="feedback.message" class="feedback-banner" :class="feedback.type" role="status">
      <span>{{ feedback.message }}</span>
      <button type="button" class="close-feedback" @click="feedback.message = ''" aria-label="Tutup">&times;</button>
    </div>

    <!-- Page Header & Action -->
    <div class="page-title-row">
      <div>
        <h1 class="page-title">Kelola Kategori</h1>
        <p class="page-subtitle">Atur kategori link affiliate dan urutan tampilannya.</p>
      </div>
      <button type="button" class="primary-btn" @click="showAddModal = true">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        <span>Tambah Kategori</span>
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="pending" class="state-card">
      <p>Memuat daftar kategori...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="state-card error-card">
      <p>Gagal memuat kategori: {{ error.statusMessage }}</p>
      <button type="button" class="secondary-btn" @click="refresh">Coba Lagi</button>
    </div>

    <!-- Empty State -->
    <div v-else-if="!categories || categories.length === 0" class="state-card">
      <p>Belum ada kategori yang dibuat.</p>
      <button type="button" class="primary-btn mt-2" @click="showAddModal = true">Buat Kategori Pertama</button>
    </div>

    <!-- Categories List (Stacked Cards for Mobile UX) -->
    <div v-else class="categories-list">
      <div
        v-for="(cat, index) in categories"
        :key="cat.id"
        class="cat-item-card"
        :class="{ 'is-inactive': !cat.isActive }"
      >
        <div class="cat-card-main">
          <!-- Urutan Naik / Turun (FR-A4) -->
          <div class="reorder-controls">
            <button
              type="button"
              class="order-btn"
              :disabled="index === 0 || ordering"
              @click="moveCategory(cat.id, 'up')"
              title="Pindah ke atas"
              aria-label="Pindah ke atas"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="18 15 12 9 6 15"></polyline>
              </svg>
            </button>
            <span class="order-number">{{ index + 1 }}</span>
            <button
              type="button"
              class="order-btn"
              :disabled="index === categories.length - 1 || ordering"
              @click="moveCategory(cat.id, 'down')"
              title="Pindah ke bawah"
              aria-label="Pindah ke bawah"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
          </div>

          <!-- Info Kategori -->
          <div class="cat-info">
            <div class="cat-title-row">
              <h2 class="cat-name">{{ cat.name }}</h2>
              <span v-if="!cat.isActive" class="badge-inactive">Nonaktif</span>
            </div>
            <p class="cat-meta">
              {{ cat.activeProducts }} dari {{ cat.totalProducts }} produk aktif
            </p>
          </div>
        </div>

        <!-- Action Controls -->
        <div class="cat-actions">
          <NuxtLink :to="`/admin/kategori/${cat.id}`" class="action-btn manage-btn">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
            </svg>
            <span>Kelola Produk ({{ cat.totalProducts }})</span>
          </NuxtLink>

          <button
            type="button"
            class="action-btn toggle-btn"
            :class="{ active: cat.isActive }"
            @click="toggleActive(cat)"
            :title="cat.isActive ? 'Nonaktifkan kategori' : 'Aktifkan kategori'"
          >
            {{ cat.isActive ? 'Aktif' : 'Nonaktif' }}
          </button>

          <button
            type="button"
            class="action-btn edit-btn"
            @click="openEditModal(cat)"
            title="Ubah nama"
          >
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            <span>Ubah</span>
          </button>

          <button
            type="button"
            class="action-btn delete-btn"
            @click="confirmDelete(cat)"
            title="Hapus kategori"
          >
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
            <span>Hapus</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Tambah Kategori -->
    <div v-if="showAddModal" class="modal-overlay" @click.self="showAddModal = false">
      <div class="modal-card">
        <h3 class="modal-title">Tambah Kategori Baru</h3>
        <form @submit.prevent="handleAddCategory">
          <div class="form-group">
            <label for="new-cat-name" class="form-label">Nama Kategori (1–80 karakter)</label>
            <input
              id="new-cat-name"
              v-model="newCategoryName"
              type="text"
              required
              maxlength="80"
              placeholder="Contoh: Kabel Data, Audio & Speaker"
              class="form-input"
              autofocus
            />
          </div>
          <div class="modal-actions">
            <button type="button" class="secondary-btn" @click="showAddModal = false">Batal</button>
            <button type="submit" class="primary-btn" :disabled="submitting">
              {{ submitting ? 'Menyimpan...' : 'Tambah Kategori' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Ubah Kategori -->
    <div v-if="editingCategory" class="modal-overlay" @click.self="editingCategory = null">
      <div class="modal-card">
        <h3 class="modal-title">Ubah Nama Kategori</h3>
        <form @submit.prevent="handleUpdateCategory">
          <div class="form-group">
            <label for="edit-cat-name" class="form-label">Nama Kategori</label>
            <input
              id="edit-cat-name"
              v-model="editCategoryName"
              type="text"
              required
              maxlength="80"
              class="form-input"
              autofocus
            />
          </div>
          <div class="modal-actions">
            <button type="button" class="secondary-btn" @click="editingCategory = null">Batal</button>
            <button type="submit" class="primary-btn" :disabled="submitting">
              {{ submitting ? 'Menyimpan...' : 'Simpan Perubahan' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Konfirmasi Hapus (FR-A2) -->
    <div v-if="deletingCategory" class="modal-overlay" @click.self="deletingCategory = null">
      <div class="modal-card">
        <h3 class="modal-title text-danger">Hapus Kategori?</h3>
        <p class="modal-desc">
          Apakah kamu yakin ingin menghapus kategori <strong>"{{ deletingCategory.name }}"</strong>?
        </p>
        <p v-if="deletingCategory.totalProducts > 0" class="warning-text">
          Peringatan: Kategori ini memiliki {{ deletingCategory.totalProducts }} produk. Menghapus kategori ini akan ikut menghapus semua produk di dalamnya!
        </p>
        <div class="modal-actions">
          <button type="button" class="secondary-btn" @click="deletingCategory = null">Batal</button>
          <button type="button" class="danger-btn" :disabled="submitting" @click="handleDeleteCategory">
            {{ submitting ? 'Menghapus...' : 'Ya, Hapus Kategori' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

interface AdminCategory {
  id: number
  name: string
  sortOrder: number
  isActive: number
  totalProducts: number
  activeProducts: number
}

useHead({
  title: 'Kelola Kategori — Admin Katalog'
})

const { data: categories, pending, error, refresh } = await useFetch<AdminCategory[]>('/api/admin/categories')

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

// Tambah Kategori
const showAddModal = ref(false)
const newCategoryName = ref('')
const submitting = ref(false)

const handleAddCategory = async () => {
  if (!newCategoryName.value.trim()) return
  submitting.value = true
  try {
    const res = await $fetch<{ success: boolean; message: string }>('/api/admin/categories', {
      method: 'POST',
      body: { name: newCategoryName.value }
    })
    showFeedback(res.message || 'Kategori berhasil ditambahkan.')
    newCategoryName.value = ''
    showAddModal.value = false
    await refresh()
  } catch (err: any) {
    showFeedback(err?.data?.statusMessage || 'Gagal menambahkan kategori.', 'error')
  } finally {
    submitting.value = false
  }
}

// Ubah Kategori
const editingCategory = ref<AdminCategory | null>(null)
const editCategoryName = ref('')

const openEditModal = (cat: AdminCategory) => {
  editingCategory.value = cat
  editCategoryName.value = cat.name
}

const handleUpdateCategory = async () => {
  if (!editingCategory.value || !editCategoryName.value.trim()) return
  submitting.value = true
  try {
    const res = await $fetch<{ success: boolean; message: string }>(`/api/admin/categories/${editingCategory.value.id}`, {
      method: 'PATCH',
      body: { name: editCategoryName.value }
    })
    showFeedback(res.message || 'Kategori berhasil diperbarui.')
    editingCategory.value = null
    await refresh()
  } catch (err: any) {
    showFeedback(err?.data?.statusMessage || 'Gagal memperbarui kategori.', 'error')
  } finally {
    submitting.value = false
  }
}

// Toggle Aktif
const toggleActive = async (cat: AdminCategory) => {
  try {
    const nextState = cat.isActive ? 0 : 1
    const res = await $fetch<{ success: boolean; message: string }>(`/api/admin/categories/${cat.id}`, {
      method: 'PATCH',
      body: { isActive: nextState }
    })
    showFeedback(nextState ? 'Kategori diaktifkan.' : 'Kategori dinonaktifkan.')
    await refresh()
  } catch (err: any) {
    showFeedback(err?.data?.statusMessage || 'Gagal mengubah status kategori.', 'error')
  }
}

// Reorder Naik / Turun (FR-A4)
const ordering = ref(false)
const moveCategory = async (id: number, direction: 'up' | 'down') => {
  ordering.value = true
  try {
    await $fetch(`/api/admin/categories/${id}/move`, {
      method: 'POST',
      body: { direction }
    })
    await refresh()
  } catch (err: any) {
    showFeedback(err?.data?.statusMessage || 'Gagal memindahkan urutan.', 'error')
  } finally {
    ordering.value = false
  }
}

// Hapus Kategori
const deletingCategory = ref<AdminCategory | null>(null)
const confirmDelete = (cat: AdminCategory) => {
  deletingCategory.value = cat
}

const handleDeleteCategory = async () => {
  if (!deletingCategory.value) return
  submitting.value = true
  try {
    const res = await $fetch<{ success: boolean; message: string }>(`/api/admin/categories/${deletingCategory.value.id}`, {
      method: 'DELETE'
    })
    showFeedback(res.message || 'Kategori berhasil dihapus.')
    deletingCategory.value = null
    await refresh()
  } catch (err: any) {
    showFeedback(err?.data?.statusMessage || 'Gagal menghapus kategori.', 'error')
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
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.page-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-main);
}

.page-subtitle {
  font-size: 13px;
  color: var(--text-secondary);
}

.primary-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background-color: var(--primary-accent);
  color: var(--primary-text);
  font-size: 14px;
  font-weight: 600;
  padding: 9px 14px;
  border-radius: var(--radius-md);
  transition: background-color 0.15s ease;
  white-space: nowrap;
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
  padding: 9px 14px;
  border-radius: var(--radius-md);
}

.danger-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background-color: var(--danger);
  color: #FFFFFF;
  font-size: 14px;
  font-weight: 600;
  padding: 9px 14px;
  border-radius: var(--radius-md);
}

.danger-btn:hover:not(:disabled) {
  background-color: #B91C1C;
}

.state-card {
  padding: 2.5rem 1.5rem;
  text-align: center;
  background-color: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: var(--radius-lg);
  color: var(--text-secondary);
  font-size: 14px;
}

.categories-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cat-item-card {
  background-color: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: var(--radius-lg);
  padding: 14px 16px;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cat-item-card.is-inactive {
  background-color: #F9FAFB;
  opacity: 0.85;
}

.cat-card-main {
  display: flex;
  align-items: center;
  gap: 14px;
}

.reorder-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.order-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  background-color: #F3F4F6;
  color: var(--text-main);
  transition: all 0.15s ease;
}

.order-btn:hover:not(:disabled) {
  background-color: var(--primary-accent);
}

.order-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.order-number {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-secondary);
}

.cat-info {
  flex: 1;
}

.cat-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 2px;
}

.cat-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-main);
}

.badge-inactive {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  background-color: #E5E7EB;
  color: #6B7280;
}

.cat-meta {
  font-size: 12px;
  color: var(--text-secondary);
}

.cat-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  border-top: 1px solid #F3F4F6;
  padding-top: 10px;
  flex-wrap: wrap;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 10px;
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: 600;
  background-color: #F3F4F6;
  color: var(--text-main);
  border: 1px solid var(--card-border);
  transition: all 0.15s ease;
}

.manage-btn {
  background-color: #EFF6FF;
  border-color: #BFDBFE;
  color: #1D4ED8;
}

.manage-btn:hover {
  background-color: #DBEAFE;
}

.toggle-btn {
  background-color: #F3F4F6;
  color: #6B7280;
}

.toggle-btn.active {
  background-color: var(--success-bg);
  border-color: #86EFAC;
  color: var(--success);
}

.edit-btn:hover {
  background-color: #E5E7EB;
}

.delete-btn {
  color: var(--danger);
  border-color: #FCA5A5;
  background-color: #FEF2F2;
}

.delete-btn:hover {
  background-color: var(--danger-bg);
}

/* Modals */
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  z-index: 100;
}

.modal-card {
  width: 100%;
  max-width: 440px;
  background-color: var(--card-bg);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  box-shadow: var(--shadow-lg);
}

.modal-title {
  font-size: 17px;
  font-weight: 700;
  margin-bottom: 0.75rem;
  color: var(--text-main);
}

.modal-desc {
  font-size: 14px;
  color: var(--text-main);
  margin-bottom: 0.75rem;
}

.warning-text {
  font-size: 13px;
  color: var(--danger);
  background-color: var(--danger-bg);
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  margin-bottom: 1.25rem;
  line-height: 1.4;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 6px;
  color: var(--text-main);
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

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
