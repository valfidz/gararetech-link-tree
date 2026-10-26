# Katalog Link Affiliate Berkategori

Website katalog link affiliate satu halaman ala Linktree dengan pengelompokan produk per kategori dalam accordion eksklusif. Dilengkapi dengan panel admin mandiri untuk mengelola kategori, produk, dan profil secara real-time tanpa perlu redeploy.

Dibuat sesuai spesifikasi dokumen [PRD Katalog Link Affiliate](./prd-katalog-link-affiliate.md).

---

## Fitur Utama

- **Halaman Publik Mobile-First**:
  - Header profil: Avatar foto lingkaran 84px, nama brand, bio singkat, dan tombol sosial media (X dan Facebook).
  - Accordion Kategori Eksklusif: Hanya satu kategori yang terbuka dalam satu waktu, mempermudah navigasi pada layar HP.
  - Tombol Produk Ramah Sentuhan: Tinggi minimal 48px dengan tautan affiliate yang aman (`target="_blank"` dan `rel="noopener noreferrer sponsored nofollow"`).
  - Footer Disclaimer Affiliate sesuai etika dan regulasi transparansi.
  - Meta tags & Open Graph preview lengkap saat tautan dibagikan ke sosmed.
- **Panel Admin Mandiri**:
  - Otentikasi berbasis kata sandi aman (bcrypt hash) dengan cookie sesi `HttpOnly`, `SameSite=Lax`, bertanda tangan HMAC-SHA256 (berlaku 7 hari).
  - Proteksi percobaan login (rate limiting 5 kali gagal per 15 menit) dan validasi origin CSRF.
  - CRUD Kategori: Tambah, ubah nama, naik/turunkan urutan, toggle aktif/nonaktif, dan hapus kategori beserta produknya (cascade).
  - CRUD Produk: Tambah link produk, ubah nama/URL/kategori tujuan, urutkan naik/turun, toggle aktif, dan hapus.
  - Pengaturan Profil: Ubah nama brand, bio (maks 200 karakter), URL avatar dengan pratinjau langsung, dan link sosmed.

---

## Teknologi yang Digunakan

- **Framework**: [Nuxt 3](https://nuxt.com/) (Vue 3, Nitro server engine)
- **Database & ORM**: [Drizzle ORM](https://orm.drizzle.team/) + [@libsql/client](https://github.com/tursodatabase/libsql-client-ts) (SQLite untuk lokal, [Turso](https://turso.tech/) untuk produksi)
- **Keamanan & Auth**: `bcryptjs` untuk verifikasi kata sandi admin dan Web Crypto API / Node `crypto` untuk session signing
- **Styling**: CSS Desain Sistem responsif (Plus Jakarta Sans, palet `#F7F7F7`, `#1F2937`, `#FFC107`, `#F97316`)
- **Hosting**: Netlify dengan preset `@nuxt/nitro`

---

## Daftar Environment Variable

Buat file `.env` berdasarkan template `.env.example`:

| Nama Variabel | Wajib? | Keterangan | Contoh Nilai |
|---|---|---|---|
| `DATABASE_URL` | Ya | URL database libSQL / SQLite | `file:./local.db` (lokal) atau `libsql://nama-db-org.turso.io` (Turso) |
| `DATABASE_AUTH_TOKEN` | Opsional | Token otentikasi Turso | Diisi jika menggunakan database cloud Turso |
| `ADMIN_PASSWORD_HASH` | Ya | Hash bcrypt dari kata sandi login admin | Dibuat menggunakan perintah `npm run hash-password` |
| `SESSION_SECRET` | Ya | Kunci rahasia penandatangan cookie sesi (≥ 32 karakter) | String acak minimal 32 karakter |
| `SITE_URL` | Ya | URL publik situs untuk preview Open Graph | `http://localhost:3000` (lokal) atau `https://katalog.netlify.app` |

---

## Cara Menjalankan Secara Lokal

### 1. Prasyarat
- Node.js versi 20 atau lebih baru (direkomendasikan v22+)
- NPM v10+

### 2. Instalasi Dependensi
```bash
npm install
```

### 3. Konfigurasi `.env`
Salin template `.env.example` ke `.env`:
```bash
cp .env.example .env
```
Isi nilai `SESSION_SECRET` dan buat `ADMIN_PASSWORD_HASH` (lihat bagian di bawah).

### 4. Membuat Kata Sandi Admin (`ADMIN_PASSWORD_HASH`)
Jalankan script CLI pembantu:
```bash
npm run hash-password
```
Masukkan kata sandi yang diinginkan (misal `katalogadmin2026`). Salin hasil hash ke dalam variabel `ADMIN_PASSWORD_HASH` di file `.env`.

*(Catatan: untuk pengujian awal lokal, file `.env` bawaan telah disiapkan dengan kata sandi default `admin123`).*

### 5. Mengisi Data Contoh (Seed Database)
Jalankan perintah seed untuk mengisi kategori dan produk contoh awal:
```bash
npm run db:seed
```

### 6. Menjalankan Server Development
```bash
npm run dev
```
Buka browser pada alamat:
- Halaman Publik: `http://localhost:3000`
- Panel Admin: `http://localhost:3000/admin` (atau `http://localhost:3000/admin/login`)

---

## Menyiapkan Database Produksi (Turso)

1. Buat akun gratis di [turso.tech](https://turso.tech/).
2. Buat database baru melalui CLI atau web dashboard Turso:
   ```bash
   turso db create katalog-affiliate
   ```
3. Dapatkan URL database dan auth token:
   ```bash
   turso db show katalog-affiliate --url
   turso db tokens create katalog-affiliate
   ```
4. Masukkan URL ke `DATABASE_URL` dan token ke `DATABASE_AUTH_TOKEN`.
5. Saat aplikasi dijalankan pertama kali, tabel-tabel database (`categories`, `products`, `profile`) akan dibuat secara otomatis jika belum ada.

---

## Cara Deploy ke Netlify

1. Simpan dan push kode ke repositori GitHub:
   ```bash
   git add .
   git commit -m "feat: inisialisasi katalog affiliate"
   git push origin main
   ```
2. Buka dashboard [Netlify](https://app.netlify.com/) dan pilih **Add new site > Import an existing project > GitHub**.
3. Pilih repository proyek ini.
4. Pada bagian pengaturan build Netlify:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist` (atau biarkan default yang dideteksi Netlify)
5. Pada menu **Environment variables**, tambahkan:
   - `DATABASE_URL`: URL database Turso kamu (`libsql://...`)
   - `DATABASE_AUTH_TOKEN`: Token Turso kamu
   - `ADMIN_PASSWORD_HASH`: Hash bcrypt kata sandi admin
   - `SESSION_SECRET`: String acak ≥ 32 karakter
   - `SITE_URL`: Domain Netlify kamu (contoh `https://katalog-kamu.netlify.app`)
   - `NODE_VERSION`: `22`
6. Klik **Deploy site**.

---

## Struktur Folder

```text
├── app/
│   ├── assets/css/main.css         # Token desain & stylesheet utama
│   ├── components/AdminHeader.vue  # Navigasi atas panel admin
│   ├── middleware/admin-auth.global.ts # Proteksi rute /admin/*
│   ├── pages/
│   │   ├── index.vue               # Halaman publik (accordion mobile-first)
│   │   └── admin/
│   │       ├── index.vue           # Manajemen kategori
│   │       ├── login.vue           # Halaman login admin
│   │       ├── profil.vue          # Manajemen profil & sosmed
│   │       └── kategori/[id].vue   # Manajemen produk per kategori
├── server/
│   ├── api/
│   │   ├── public.get.ts           # Endpoint publik data katalog (di-cache)
│   │   └── admin/                  # Endpoint API CRUD dan otentikasi admin
│   ├── db/
│   │   ├── index.ts                # Koneksi database libSQL & auto-table init
│   │   ├── schema.ts               # Skema Drizzle ORM
│   │   └── seed.ts                 # Script pengisi data contoh awal
│   └── utils/
│       ├── auth.ts                 # Utilitas otentikasi sesi & rate limiting
│       └── validation.ts           # Validasi input sesuai FR-A6
├── scripts/
│   └── hash-password.ts            # CLI generator hash password bcrypt
├── netlify.toml                    # Konfigurasi build Netlify
├── nuxt.config.ts                  # Konfigurasi Nuxt
└── prd-katalog-link-affiliate.md   # Dokumen spesifikasi PRD asli
```
