<template>
  <main class="catalog-container" id="main-content">
    <!-- Header Profil (FR-P1) -->
    <header class="profile-header">
      <div class="avatar-wrapper">
        <img
          v-if="profile?.avatarUrl && !imageLoadError"
          :src="profile.avatarUrl"
          :alt="profile.brandName || 'Foto Profil'"
          class="avatar-img"
          @error="imageLoadError = true"
          loading="eager"
          width="84"
          height="84"
        />
        <div v-else class="avatar-fallback" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="44" height="44" fill="none" stroke="#1F2937" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
      </div>

      <h1 class="brand-name">{{ profile?.brandName || 'Katalog Rekomendasi' }}</h1>
      <p v-if="profile?.bio" class="brand-bio">{{ profile.bio }}</p>

      <!-- Sosmed Links (disembunyikan jika URL kosong) -->
      <nav v-if="profile?.xUrl || profile?.facebookUrl" class="social-nav" aria-label="Media Sosial">
        <a
          v-if="profile?.xUrl"
          :href="profile.xUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="social-btn"
          aria-label="Profil X (Twitter)"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </a>
        <a
          v-if="profile?.facebookUrl"
          :href="profile.facebookUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="social-btn"
          aria-label="Profil Facebook"
        >
          <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        </a>
      </nav>
    </header>

    <!-- Error State jika API gagal (FR Keandalan) -->
    <div v-if="error" class="error-notice" role="alert">
      <p>{{ error.statusMessage || 'Katalog sedang tidak dapat dimuat. Silakan muat ulang halaman.' }}</p>
    </div>

    <!-- Kondisi Kosong (FR-P7) -->
    <div v-else-if="!categories || categories.length === 0" class="empty-state">
      <div class="empty-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="#4B5563" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      </div>
      <p class="empty-text">Koleksi sedang disiapkan</p>
    </div>

    <!-- Daftar Accordion Kategori (FR-P2 & FR-P3) -->
    <section v-else class="accordion-section" aria-label="Kategori Produk">
      <div
        v-for="cat in categories"
        :key="cat.id"
        :id="`category-${cat.id}`"
        class="category-card"
        :class="{ 'is-open': openCategoryId === cat.id }"
      >
        <!-- Header Kategori / Accordion Toggle Button -->
        <button
          type="button"
          :id="`btn-cat-${cat.id}`"
          class="category-header-btn"
          :aria-expanded="openCategoryId === cat.id ? 'true' : 'false'"
          :aria-controls="`panel-cat-${cat.id}`"
          @click="toggleCategory(cat.id)"
        >
          <span class="category-name">{{ cat.name }}</span>
          <div class="category-meta">
            <span class="category-count">{{ cat.productCount }} produk</span>
            <span class="accordion-chevron" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </span>
          </div>
        </button>

        <!-- Panel Isi Produk (FR-P4) -->
        <div
          v-show="openCategoryId === cat.id"
          :id="`panel-cat-${cat.id}`"
          role="region"
          :aria-labelledby="`btn-cat-${cat.id}`"
          class="category-panel"
        >
          <div class="product-list">
            <a
              v-for="product in cat.products"
              :key="product.id"
              :href="product.url"
              target="_blank"
              rel="noopener noreferrer sponsored nofollow"
              class="product-btn"
            >
              <span class="product-name">{{ product.name }}</span>
              <span class="product-arrow" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer Disclaimer Affiliate (FR-P5) -->
    <footer class="catalog-footer">
      <p class="disclaimer-text">
        Beberapa link di halaman ini adalah link affiliate. Kami bisa menerima komisi kecil dari pembelian, tanpa biaya tambahan untuk kamu.
      </p>
    </footer>
  </main>
</template>

<script setup lang="ts">
import { ref, nextTick, computed } from 'vue'

interface ProductItem {
  id: number
  categoryId: number
  name: string
  url: string
  sortOrder: number
}

interface CategoryItem {
  id: number
  name: string
  sortOrder: number
  productCount: number
  products: ProductItem[]
}

interface PublicData {
  profile: {
    brandName: string
    bio: string
    avatarUrl: string | null
    xUrl: string | null
    facebookUrl: string | null
  }
  categories: CategoryItem[]
}

const { data, error } = await useFetch<PublicData>('/api/public')

const profile = computed(() => data.value?.profile)
const categories = computed(() => data.value?.categories || [])

const imageLoadError = ref(false)
const openCategoryId = ref<number | null>(null) // Semua tertutup saat pertama kali dimuat (FR-P3)

// Toggle Accordion Eksklusif (FR-P3)
const toggleCategory = (id: number) => {
  if (openCategoryId.value === id) {
    openCategoryId.value = null
  } else {
    openCategoryId.value = id
    nextTick(() => {
      const el = document.getElementById(`category-${id}`)
      if (el) {
        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        el.scrollIntoView({
          behavior: prefersReduced ? 'auto' : 'smooth',
          block: 'nearest'
        })
      }
    })
  }
}

// Meta Tags & SEO Preview (FR-P6)
const pageTitle = computed(() => profile.value?.brandName ? `${profile.value.brandName} — Rekomendasi Link Affiliate` : 'Katalog Link Affiliate')
const pageDescription = computed(() => profile.value?.bio || 'Kumpulan rekomendasi link produk affiliate pilihan terkurasi.')
const ogImage = computed(() => profile.value?.avatarUrl || '/og-fallback.svg')

useHead({
  title: pageTitle,
  meta: [
    { name: 'description', content: pageDescription },
    { property: 'og:title', content: pageTitle },
    { property: 'og:description', content: pageDescription },
    { property: 'og:image', content: ogImage },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary' },
    { name: 'twitter:title', content: pageTitle },
    { name: 'twitter:description', content: pageDescription },
    { name: 'twitter:image', content: ogImage }
  ]
})
</script>

<style scoped>
/* Profile Header (FR-P1) */
.profile-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: 2rem;
}

.avatar-wrapper {
  margin-bottom: 1rem;
}

.avatar-img {
  width: 84px;
  height: 84px;
  border-radius: var(--radius-full);
  object-fit: cover;
  border: 3px solid var(--primary-accent);
  box-shadow: var(--shadow-sm);
}

.avatar-fallback {
  width: 84px;
  height: 84px;
  border-radius: var(--radius-full);
  background-color: var(--primary-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-sm);
}

.brand-name {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-main);
  line-height: 1.3;
  margin-bottom: 0.5rem;
}

.brand-bio {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.5;
  max-width: 360px;
  margin-bottom: 1.25rem;
}

/* Sosmed Nav */
.social-nav {
  display: flex;
  gap: 14px;
  justify-content: center;
  margin-top: 0.25rem;
}

.social-btn {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-full);
  background-color: var(--text-main);
  color: var(--primary-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s ease, background-color 0.15s ease;
  box-shadow: var(--shadow-sm);
}

.social-btn:hover {
  transform: translateY(-2px);
  background-color: #111827;
}

/* Accordion Section (FR-P2, FR-P3) */
.accordion-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
}

.category-card {
  border-radius: var(--radius-lg);
  border: 1px solid var(--card-border);
  background-color: var(--card-bg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.category-card:hover {
  border-color: var(--card-border-hover);
}

.category-header-btn {
  width: 100%;
  height: 56px;
  padding: 0 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  text-align: left;
  background-color: var(--card-bg);
  color: var(--text-main);
  transition: background-color 0.2s ease, color 0.2s ease;
}

.category-card.is-open .category-header-btn {
  background-color: var(--category-open-bg);
  color: var(--category-open-text);
}

.category-name {
  font-size: 16px;
  font-weight: 600;
  line-height: 1.3;
}

.category-meta {
  display: flex;
  align-items: center;
  gap: 10px;
}

.category-count {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
}

.category-card.is-open .category-count {
  color: #9CA3AF;
}

.accordion-chevron {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--secondary-accent);
  transition: transform 0.25s ease;
}

.category-card.is-open .accordion-chevron {
  transform: rotate(180deg);
}

/* Panel & Product List (FR-P4) */
.category-panel {
  padding: 12px 14px 14px 14px;
  background-color: #FAFAFA;
  border-top: 1px solid var(--card-border);
}

.category-card.is-open .category-panel {
  border-top-color: #374151;
}

.product-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.product-btn {
  width: 100%;
  min-height: 48px;
  padding: 10px 14px;
  border-radius: var(--radius-md);
  background-color: var(--primary-accent);
  color: var(--primary-text);
  font-size: 15px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
  transition: background-color 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease;
  line-height: 1.35;
}

.product-btn:hover {
  background-color: #FFB300;
  color: var(--text-main);
  transform: translateY(-1px);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
}

.product-btn:active {
  transform: translateY(0);
}

.product-name {
  flex: 1;
  text-align: left;
}

.product-arrow {
  display: flex;
  align-items: center;
  opacity: 0.8;
  color: var(--text-main);
}

/* Kondisi Kosong (FR-P7) */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1.5rem;
  background-color: var(--card-bg);
  border: 1px dashed var(--card-border);
  border-radius: var(--radius-lg);
  margin-top: 1rem;
}

.empty-icon {
  margin-bottom: 0.75rem;
  color: var(--text-secondary);
}

.empty-text {
  font-size: 15px;
  font-weight: 500;
  color: var(--text-secondary);
}

.error-notice {
  padding: 1.25rem;
  background-color: #FFFBEB;
  border: 1px solid #FCD34D;
  border-radius: var(--radius-md);
  color: #92400E;
  text-align: center;
  font-size: 14px;
  margin-top: 1rem;
}

/* Footer (FR-P5) */
.catalog-footer {
  margin-top: 3rem;
  text-align: center;
}

.disclaimer-text {
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.6;
}
</style>
