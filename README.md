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
| `DATABASE_URL` (atau `TURSO_DATABASE_URL`) | Ya | URL database libSQL / SQLite | `file:./local.db` (lokal) atau `libsql://nama-db-org.turso.io` (Turso) |
| `DATABASE_AUTH_TOKEN` (atau `TURSO_AUTH_TOKEN`) | Opsional | Token otentikasi Turso | Diisi jika menggunakan database cloud Turso |
| `DATABASE_SYNC_URL` (atau `TURSO_SYNC_URL`) | Opsional | URL Turso untuk embedded replica | Diisi jika menggunakan mode embedded replica lokal |
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

## Menyiapkan Database Turso (SQLite Cloud)

Proyek ini menggunakan **[Turso](https://docs.turso.tech/)** (SQLite terdistribusi berbasis libSQL) yang sangat cepat, serverless-ready, dan hemat biaya.

### 1. Membuat Database di Turso

Kamu dapat membuat database melalui **Web Dashboard** atau **Turso CLI**:

#### Opsi A: Lewat Web Dashboard (Tanpa Install CLI)
1. Buka dan login ke [app.turso.tech](https://app.turso.tech/).
2. Klik **Create Database**, beri nama misalnya `katalog-affiliate`, lalu pilih grup/region terdekat (contoh: Singapore `sin`).
3. Setelah database dibuat, salin **Database URL** (berawalan `libsql://...`).
4. Klik tab **Tokens** atau tombol **Generate Token**, lalu salin Token yang dihasilkan.

#### Opsi B: Lewat Turso CLI (Terminal / WSL)
1. Install Turso CLI:
   ```bash
   # Di WSL / macOS / Linux:
   curl -sSfL https://get.tur.so/install.sh | bash
   ```
2. Login dan buat database:
   ```bash
   turso auth login
   turso db create katalog-affiliate
   ```
3. Dapatkan Database URL dan Auth Token:
   ```bash
   turso db show katalog-affiliate --url
   turso db tokens create katalog-affiliate
   ```

---

### 2. Memasang Kredensial ke `.env`

Masukkan kredensial Turso ke dalam file `.env`:
```env
DATABASE_URL=libsql://katalog-affiliate-username.turso.io
DATABASE_AUTH_TOKEN=eyJh...
```
*(Catatan: Anda juga dapat menggunakan nama variabel `TURSO_DATABASE_URL` dan `TURSO_AUTH_TOKEN`).*

---

### 3. Menguji Koneksi ke Turso

Jalankan perintah pengujian koneksi:
```bash
npm run db:test
```
Perintah ini akan memverifikasi URL, konektivitas libSQL, dan ketersediaan tabel database.

---

### 4. Mendorong Skema & Mengisi Data Awal ke Turso

1. **Push Skema Database ke Turso**:
   ```bash
   npm run db:push
   ```
   *(Skema tabel `categories`, `products`, `profile` serta indeks akan langsung diterapkan ke Turso).*

2. **Isi Data Contoh (Seeding)**:
   ```bash
   npm run db:seed
   ```

3. **Buka Drizzle Studio (Database GUI)**:
   ```bash
   npm run db:studio
   ```
   Buka URL lokal yang muncul (biasanya `https://local.drizzle.studio`) untuk melihat, mengedit, dan memfilter data di Turso secara langsung dari browser.

---

### 5. Fitur Turso Lainnya: Embedded Replicas (Opsional)

Jika ingin aplikasi membaca dari file SQLite lokal berkecepatan mikrodetik namun otomatis tersinkronisasi dengan database cloud Turso, atur di `.env`:
```env
DATABASE_URL=file:./local.db
DATABASE_SYNC_URL=libsql://katalog-affiliate-username.turso.io
DATABASE_AUTH_TOKEN=token_turso_kamu
```

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
# gararetech-link-tree
