<template>
  <div class="admin-container">
    <AdminHeader />

    <!-- Feedback Banner / Alert -->
    <div v-if="feedback.message" class="feedback-banner" :class="feedback.type" role="status">
      <span>{{ feedback.message }}</span>
      <button type="button" class="close-feedback" @click="feedback.message = ''" aria-label="Tutup">&times;</button>
    </div>

    <!-- Back to Categories & Breadcrumb -->
    <div class="breadcrumb-row">
      <NuxtLink to="/admin" class="back-nav-btn">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        <span>Daftar Kategori</span>
      </NuxtLink>
    </div>

    <!-- Page Header & Action -->
    <div class="page-title-row">
      <div>
        <h1 class="page-title">
          Produk: {{ categoryData?.category?.name || 'Kategori' }}
        </h1>
        <p class="page-subtitle">Kelola daftar link affiliate di dalam kategori ini.</p>
      </div>
      <button type="button" class="primary-btn" @click="showAddModal = true">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        <span>Tambah Produk</span>
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="pending" class="state-card">
      <p>Memuat data produk...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="state-card error-card">
      <p>Gagal memuat produk: {{ error.statusMessage }}</p>
      <NuxtLink to="/admin" class="secondary-btn mt-2">Kembali ke Kategori</NuxtLink>
    </div>

    <!-- Empty State -->
    <div v-else-if="!products || products.length === 0" class="state-card">
      <p>Belum ada produk di dalam kategori ini.</p>
      <button type="button" class="primary-btn mt-2" @click="showAddModal = true">Tambah Produk Pertama</button>
    </div>

    <!-- Products List (Stacked Cards for Mobile UX) -->
    <div v-else class="products-list">
      <div
        v-for="(prod, index) in products"
        :key="prod.id"
        class="prod-item-card"
        :class="{ 'is-inactive': !prod.isActive }"
      >
        <div class="prod-card-main">
          <!-- Urutan Naik / Turun (FR-A4) -->
          <div class="reorder-controls">
            <button
              type="button"
              class="order-btn"
              :disabled="index === 0 || ordering"
              @click="moveProduct(prod.id, 'up')"
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
              :disabled="index === products.length - 1 || ordering"
              @click="moveProduct(prod.id, 'down')"
              title="Pindah ke bawah"
              aria-label="Pindah ke bawah"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
          </div>

          <!-- Info Produk -->
          <div class="prod-info">
            <div class="prod-title-row">
              <h2 class="prod-name">{{ prod.name }}</h2>
              <span v-if="!prod.isActive" class="badge-inactive">Nonaktif</span>
            </div>
            <a
              :href="prod.url"
              target="_blank"
              rel="noopener noreferrer"
              class="prod-url-link"
              title="Tes buka link affiliate"
            >
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
              <span>{{ prod.url }}</span>
            </a>
          </div>
        </div>

        <!-- Action Controls -->
        <div class="prod-actions">
          <button
            type="button"
            class="action-btn toggle-btn"
            :class="{ active: prod.isActive }"
            @click="toggleActive(prod)"
            :title="prod.isActive ? 'Nonaktifkan produk' : 'Aktifkan produk'"
          >
            {{ prod.isActive ? 'Aktif' : 'Nonaktif' }}
          </button>

          <button
            type="button"
            class="action-btn edit-btn"
            @click="openEditModal(prod)"
            title="Ubah produk"
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
            @click="confirmDelete(prod)"
            title="Hapus produk"
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

    <!-- Modal Tambah Produk -->
    <div v-if="showAddModal" class="modal-overlay" @click.self="showAddModal = false">
      <div class="modal-card">
        <h3 class="modal-title">Tambah Produk Baru</h3>
        <form @submit.prevent="handleAddProduct">
          <div class="form-group">
            <label for="new-prod-name" class="form-label">Nama Produk (1–80 karakter)</label>
            <input
              id="new-prod-name"
              v-model="newProduct.name"
              type="text"
              required
              maxlength="80"
              placeholder="Contoh: Baseus USB-C 100W Fast Charging"
              class="form-input"
              autofocus
            />
          </div>
          <div class="form-group">
            <label for="new-prod-url" class="form-label">URL Affiliate (harus https:// atau http://)</label>
            <input
              id="new-prod-url"
              v-model="newProduct.url"
              type="url"
              required
              placeholder="https://shope.ee/..."
              class="form-input"
            />
          </div>
          <div class="modal-actions">
            <button type="button" class="secondary-btn" @click="showAddModal = false">Batal</button>
            <button type="submit" class="primary-btn" :disabled="submitting">
              {{ submitting ? 'Menyimpan...' : 'Tambah Produk' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Ubah Produk (FR-A3) -->
    <div v-if="editingProduct" class="modal-overlay" @click.self="editingProduct = null">
      <div class="modal-card">
        <h3 class="modal-title">Ubah Produk</h3>
        <form @submit.prevent="handleUpdateProduct">
          <div class="form-group">
            <label for="edit-prod-name" class="form-label">Nama Produk</label>
            <input
              id="edit-prod-name"
              v-model="editProductForm.name"
              type="text"
              required
              maxlength="80"
              class="form-input"
              autofocus
            />
          </div>
          <div class="form-group">
            <label for="edit-prod-url" class="form-label">URL Affiliate</label>
            <input
              id="edit-prod-url"
              v-model="editProductForm.url"
              type="url"
              required
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label for="edit-prod-category" class="form-label">Pindah ke Kategori Lain</label>
            <select
              id="edit-prod-category"
              v-model="editProductForm.categoryId"
              class="form-input"
            >
              <option
                v-for="c in allCategoriesList"
                :key="c.id"
                :value="c.id"
              >
                {{ c.name }}
              </option>
            </select>
            <small class="form-hint">Memindahkan produk akan menaruhnya di urutan paling bawah kategori tujuan.</small>
          </div>
          <div class="modal-actions">
            <button type="button" class="secondary-btn" @click="editingProduct = null">Batal</button>
            <button type="submit" class="primary-btn" :disabled="submitting">
              {{ submitting ? 'Menyimpan...' : 'Simpan Perubahan' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Konfirmasi Hapus Produk -->
    <div v-if="deletingProduct" class="modal-overlay" @click.self="deletingProduct = null">
      <div class="modal-card">
        <h3 class="modal-title text-danger">Hapus Produk?</h3>
        <p class="modal-desc">
          Apakah kamu yakin ingin menghapus produk <strong>"{{ deletingProduct.name }}"</strong>?
        </p>
        <div class="modal-actions">
          <button type="button" class="secondary-btn" @click="deletingProduct = null">Batal</button>
          <button type="button" class="danger-btn" :disabled="submitting" @click="handleDeleteProduct">
            {{ submitting ? 'Menghapus...' : 'Ya, Hapus Produk' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRoute } from 'vue-router'

interface AdminProduct {
  id: number
  categoryId: number
  name: string
  url: string
  sortOrder: number
  isActive: number
}

interface CategoryDetailResponse {
  category: {
    id: number
    name: string
    sortOrder: number
    isActive: number
  }
  products: AdminProduct[]
}

const route = useRoute()
const categoryId = computed(() => Number(route.params.id))

useHead({
  title: 'Kelola Produk — Admin Katalog'
})

const { data: categoryData, pending, error, refresh } = await useFetch<CategoryDetailResponse>(
  () => `/api/admin/categories/${categoryId.value}/products`
)

const products = computed(() => categoryData.value?.products || [])

// Ambil semua kategori untuk opsi pemindahan kategori
const { data: allCategories } = await useFetch<any[]>('/api/admin/categories')
const allCategoriesList = computed(() => allCategories.value || [])

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

// Tambah Produk
const showAddModal = ref(false)
const newProduct = reactive({
  name: '',
  url: ''
})
const submitting = ref(false)

const handleAddProduct = async () => {
  if (!newProduct.name.trim() || !newProduct.url.trim()) return
  submitting.value = true
  try {
    const res = await $fetch<{ success: boolean; message: string }>('/api/admin/products', {
      method: 'POST',
      body: {
        categoryId: categoryId.value,
        name: newProduct.name,
        url: newProduct.url
      }
    })
    showFeedback(res.message || 'Produk berhasil ditambahkan.')
    newProduct.name = ''
    newProduct.url = ''
    showAddModal.value = false
    await refresh()
  } catch (err: any) {
    showFeedback(err?.data?.statusMessage || 'Gagal menambahkan produk.', 'error')
  } finally {
    submitting.value = false
  }
}

// Ubah Produk & Pindah Kategori (FR-A3)
const editingProduct = ref<AdminProduct | null>(null)
const editProductForm = reactive({
  name: '',
  url: '',
  categoryId: 0
})

const openEditModal = (prod: AdminProduct) => {
  editingProduct.value = prod
  editProductForm.name = prod.name
  editProductForm.url = prod.url
  editProductForm.categoryId = prod.categoryId
}

const handleUpdateProduct = async () => {
  if (!editingProduct.value || !editProductForm.name.trim() || !editProductForm.url.trim()) return
  submitting.value = true
  try {
    const res = await $fetch<{ success: boolean; message: string }>(`/api/admin/products/${editingProduct.value.id}`, {
      method: 'PATCH',
      body: {
        name: editProductForm.name,
        url: editProductForm.url,
        categoryId: editProductForm.categoryId
      }
    })
    showFeedback(res.message || 'Produk berhasil diperbarui.')
    editingProduct.value = null
    await refresh()
  } catch (err: any) {
    showFeedback(err?.data?.statusMessage || 'Gagal memperbarui produk.', 'error')
  } finally {
    submitting.value = false
  }
}

// Toggle Aktif
const toggleActive = async (prod: AdminProduct) => {
  try {
    const nextState = prod.isActive ? 0 : 1
    await $fetch(`/api/admin/products/${prod.id}`, {
      method: 'PATCH',
      body: { isActive: nextState }
    })
    showFeedback(nextState ? 'Produk diaktifkan.' : 'Produk dinonaktifkan.')
    await refresh()
  } catch (err: any) {
    showFeedback(err?.data?.statusMessage || 'Gagal mengubah status produk.', 'error')
  }
}

// Reorder Naik / Turun (FR-A4)
const ordering = ref(false)
const moveProduct = async (id: number, direction: 'up' | 'down') => {
  ordering.value = true
  try {
    await $fetch(`/api/admin/products/${id}/move`, {
      method: 'POST',
      body: { direction }
    })
    await refresh()
  } catch (err: any) {
    showFeedback(err?.data?.statusMessage || 'Gagal mengubah urutan produk.', 'error')
  } finally {
    ordering.value = false
  }
}

// Hapus Produk
const deletingProduct = ref<AdminProduct | null>(null)
const confirmDelete = (prod: AdminProduct) => {
  deletingProduct.value = prod
}

const handleDeleteProduct = async () => {
  if (!deletingProduct.value) return
  submitting.value = true
  try {
    const res = await $fetch<{ success: boolean; message: string }>(`/api/admin/products/${deletingProduct.value.id}`, {
      method: 'DELETE'
    })
    showFeedback(res.message || 'Produk berhasil dihapus.')
    deletingProduct.value = null
    await refresh()
  } catch (err: any) {
    showFeedback(err?.data?.statusMessage || 'Gagal menghapus produk.', 'error')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.breadcrumb-row {
  margin-bottom: 0.75rem;
}

.back-nav-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  transition: color 0.15s ease;
}

.back-nav-btn:hover {
  color: var(--text-main);
}

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

.state-card {
  padding: 2.5rem 1.5rem;
  text-align: center;
  background-color: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: var(--radius-lg);
  color: var(--text-secondary);
  font-size: 14px;
}

.products-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.prod-item-card {
  background-color: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: var(--radius-lg);
  padding: 14px 16px;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.prod-item-card.is-inactive {
  background-color: #F9FAFB;
  opacity: 0.85;
}

.prod-card-main {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}

.reorder-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding-top: 2px;
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

.prod-info {
  flex: 1;
  min-width: 0;
}

.prod-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.prod-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-main);
  word-break: break-word;
}

.badge-inactive {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  background-color: #E5E7EB;
  color: #6B7280;
  flex-shrink: 0;
}

.prod-url-link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: #2563EB;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.prod-url-link:hover {
  text-decoration: underline;
}

.prod-actions {
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
  max-width: 460px;
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

.form-hint {
  display: block;
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 4px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
