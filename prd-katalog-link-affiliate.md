# PRD — Katalog Link Affiliate Berkategori

Versi 1.0 · 22 Oktober 2026 · Status: siap dikerjakan

## 1. Ringkasan

Website satu halaman ala Linktree, tetapi isinya adalah **koleksi link affiliate yang dikelompokkan per kategori** (misalnya "Kabel Data", "Charger & Adaptor"). Pengunjung datang dari bio sosmed (X, Facebook), membuka kategori yang diminati, lalu menekan tombol produk untuk menuju link affiliate. Pemilik mengelola semua isi lewat **admin panel sendiri** tanpa perlu deploy ulang.

**Tujuan utama**

- Menggantikan Linktree dengan struktur yang sesuai kebutuhan (kategori → produk).
- Update isi cepat dari admin (tambah, ubah, urutkan, nonaktifkan link).
- Hosting gratis, tanpa mengurus server.

**Referensi visual:** mockup halaman publik di https://claude.ai/artifact/ARroZNgPNJJyvNwJdTpTQY (dua kondisi: semua tertutup, dan satu kategori terbuka).

## 2. Ruang Lingkup Versi 1

**Termasuk**

- Halaman publik tunggal dengan header profil dan accordion kategori.
- Admin panel: login, CRUD kategori, CRUD produk, atur urutan, toggle aktif, edit profil.
- Disclaimer affiliate, meta tag, dan preview OG untuk dibagikan.

**Tidak termasuk (lihat bagian 13)**

- Tracking klik, foto/harga/catatan produk, upload gambar, drag-and-drop, domain sendiri, multi-admin, pencarian.

## 3. Pengguna

| Peran | Deskripsi | Kebutuhan utama |
|---|---|---|
| Pengunjung | Datang dari bio sosmed, kebanyakan lewat HP | Menemukan kategori dan membuka link produk dengan sedikit ketukan |
| Admin | Satu orang (pemilik), tanpa registrasi | Mengelola kategori, produk, dan profil dengan cepat, termasuk dari HP |

## 4. Keputusan Produk yang Sudah Final

| Topik | Keputusan |
|---|---|
| Relasi produk–kategori | Satu produk hanya di satu kategori (one-to-many) |
| Tampilan item produk | Hanya nama + tombol (tanpa foto, harga, catatan) |
| Accordion | Eksklusif: hanya satu kategori terbuka; semua tertutup saat halaman dimuat |
| Header profil | Nama/brand, bio singkat, foto, ikon X dan Facebook |
| Urutan | Tombol naik/turun (bukan drag-and-drop) |
| Tracking klik | Ditunda ke versi berikutnya |
| Hosting | Netlify (`.netlify.app`), tanpa server sendiri, gratis |
| Database | Layanan gratis di luar Netlify (Turso atau Neon) |
| Admin | Panel sendiri, satu akun |
| Warna | `#F7F7F7` latar, `#1F2937` teks, `#FFC107` tombol, `#F97316` aksen |

## 5. Kebutuhan Fungsional — Halaman Publik

**FR-P1 Header profil.** Menampilkan foto (lingkaran), nama/brand, bio, dan ikon X dan Facebook. Ikon sosmed disembunyikan jika URL-nya kosong.

**FR-P2 Daftar kategori.** Menampilkan semua kategori aktif sesuai urutan. Setiap baris menampilkan nama kategori dan jumlah produk aktif di dalamnya. Kategori tanpa produk aktif tidak ditampilkan.

**FR-P3 Accordion eksklusif.**

- Semua kategori tertutup saat halaman dimuat.
- Menekan satu kategori membukanya dan menutup kategori lain.
- Menekan kategori yang sedang terbuka menutupnya.
- Saat sebuah kategori terbuka, halaman scroll halus ke baris kategori itu (hormati `prefers-reduced-motion`).
- Aksesibilitas: header kategori adalah `<button>` dengan `aria-expanded` dan `aria-controls`; panel isi memakai `role="region"`.

**FR-P4 Tombol produk.** Satu tombol penuh lebar per produk berisi nama produk, tinggi minimal 48 px. Link dibuka di tab baru dengan `target="_blank"` dan `rel="noopener noreferrer sponsored nofollow"`. Hanya produk aktif yang tampil, sesuai urutan.

**FR-P5 Footer.** Disclaimer affiliate singkat: "Beberapa link di halaman ini adalah link affiliate. Kami bisa menerima komisi kecil dari pembelian, tanpa biaya tambahan untuk kamu."

**FR-P6 Meta dan preview.** `<title>` memakai nama/brand, deskripsi memakai bio, serta tag Open Graph dan Twitter Card. Gambar OG memakai foto profil, dengan gambar statis sebagai cadangan.

**FR-P7 Kondisi kosong.** Jika belum ada kategori aktif, tampilkan header profil dan pesan singkat "Koleksi sedang disiapkan".

## 6. Kebutuhan Fungsional — Admin

**FR-A1 Login.** Satu akun admin. Kata sandi dibandingkan dengan hash di environment variable. Sesi lewat cookie `HttpOnly`, `Secure`, `SameSite=Lax`, bertanda tangan, berlaku 7 hari. Batasi percobaan login (mis. 5 kali gagal per 15 menit per IP). Tidak ada registrasi dan tidak ada "lupa password" (ganti lewat environment variable).

**FR-A2 Kategori.** Daftar semua kategori (termasuk nonaktif) dengan aksi: tambah, ubah nama, naik/turun, toggle aktif, hapus. Menghapus kategori yang berisi produk meminta konfirmasi dan ikut menghapus produknya.

**FR-A3 Produk.** Dikelola per kategori. Aksi: tambah, ubah (nama, URL, kategori), naik/turun di dalam kategori, toggle aktif, hapus (dengan konfirmasi). Memindahkan produk ke kategori lain menaruhnya di urutan paling bawah kategori tujuan.

**FR-A4 Urutan.** Tombol naik/turun menukar `sort_order` dengan item tetangga dalam lingkup yang sama (semua kategori, atau produk dalam satu kategori). Tombol naik di item pertama dan turun di item terakhir dinonaktifkan. Item baru masuk di posisi paling bawah.

**FR-A5 Profil.** Satu form: nama/brand, bio, URL foto, URL X, URL Facebook. Pratinjau foto kecil di samping field.

**FR-A6 Validasi.**

- Nama kategori dan produk: wajib, 1–80 karakter.
- URL produk: wajib, harus diawali `https://` (atau `http://`), tidak boleh berisi `javascript:` atau skema lain.
- Bio: maksimal 200 karakter.
- URL sosmed dan foto: opsional, harus URL valid jika diisi.
- Pesan kesalahan berbahasa Indonesia dan jelas.

**FR-A7 Pengalaman admin.** Tata letak responsif dan nyaman dipakai dari HP. Setiap aksi menampilkan umpan balik singkat (berhasil/gagal). Tombol ke halaman publik tersedia di navigasi.

## 7. Model Data

Tiga tabel. Skema di bawah ditulis dalam bentuk SQL generik; agent menerjemahkannya ke ORM yang dipilih.

```sql
CREATE TABLE categories (
  id          INTEGER PRIMARY KEY,
  name        TEXT NOT NULL,
  sort_order  INTEGER NOT NULL,
  is_active   INTEGER NOT NULL DEFAULT 1,
  created_at  TEXT NOT NULL,
  updated_at  TEXT NOT NULL
);

CREATE TABLE products (
  id          INTEGER PRIMARY KEY,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  url         TEXT NOT NULL,
  sort_order  INTEGER NOT NULL,
  is_active   INTEGER NOT NULL DEFAULT 1,
  created_at  TEXT NOT NULL,
  updated_at  TEXT NOT NULL
);
CREATE INDEX idx_products_category ON products(category_id, sort_order);

-- Satu baris saja (id = 1)
CREATE TABLE profile (
  id           INTEGER PRIMARY KEY CHECK (id = 1),
  brand_name   TEXT NOT NULL DEFAULT '',
  bio          TEXT NOT NULL DEFAULT '',
  avatar_url   TEXT,
  x_url        TEXT,
  facebook_url TEXT,
  updated_at   TEXT NOT NULL
);
```

Catatan: tipe boolean dan tanggal menyesuaikan database yang dipilih (SQLite/libSQL memakai integer dan teks ISO 8601; Postgres boleh memakai `boolean` dan `timestamptz`).

## 8. Arsitektur dan Stack

**Prinsip:** satu project, satu deploy, tanpa server yang dirawat, kode seminimal mungkin.

| Lapisan | Rekomendasi | Catatan |
|---|---|---|
| Framework | Nuxt 3 (Vue) dengan server routes | Next.js atau Astro SSR juga boleh jika agent lebih nyaman; yang penting satu project dengan preset Netlify |
| Hosting | Netlify (Functions) | Domain `.netlify.app`; deploy otomatis dari GitHub |
| Database | Turso (libSQL/SQLite) atau Neon (Postgres), tier gratis | Salah satu saja |
| ORM/query | Drizzle ORM | Ringan untuk serverless; Prisma boleh jika terbukti stabil di Netlify |
| Styling | CSS biasa atau Tailwind | Warna dan ukuran mengikuti bagian 10 |
| Auth | Sesi cookie buatan sendiri | Jangan pakai Netlify Identity (sudah tidak direkomendasikan) |

Agent **wajib memeriksa dokumentasi terbaru** untuk preset Netlify framework yang dipilih, driver database, dan batas tier gratis Netlify/Turso/Neon sebelum mulai, karena hal-hal ini sering berubah. Semua dependensi dipin ke versi pasti.

**Environment variable**

| Nama | Fungsi |
|---|---|
| `DATABASE_URL` | URL koneksi database |
| `DATABASE_AUTH_TOKEN` | Token database (jika Turso) |
| `ADMIN_PASSWORD_HASH` | Hash kata sandi admin (bcrypt atau argon2) |
| `SESSION_SECRET` | Kunci penandatangan cookie sesi (≥ 32 karakter acak) |
| `SITE_URL` | URL publik situs, untuk meta dan OG |

Rahasia tidak boleh masuk repository. Sediakan `.env.example` tanpa nilai asli.

## 9. Rute dan Endpoint

**Halaman**

| Rute | Akses | Fungsi |
|---|---|---|
| `/` | Publik | Halaman utama (header + accordion) |
| `/admin/login` | Publik | Form login |
| `/admin` | Admin | Daftar kategori dan aksinya |
| `/admin/kategori/[id]` | Admin | Daftar produk dalam satu kategori |
| `/admin/profil` | Admin | Form profil |

Semua rute `/admin/*` (kecuali login) mengalihkan ke login jika belum ada sesi valid.

**API**

| Metode dan path | Akses | Fungsi |
|---|---|---|
| `GET /api/public` | Publik | Profil + kategori aktif beserta produk aktif (di-cache) |
| `POST /api/admin/login` | Publik | Verifikasi kata sandi, set cookie sesi |
| `POST /api/admin/logout` | Admin | Hapus sesi |
| `GET /api/admin/categories` | Admin | Semua kategori + jumlah produk |
| `POST /api/admin/categories` | Admin | Tambah kategori |
| `PATCH /api/admin/categories/:id` | Admin | Ubah nama / toggle aktif |
| `DELETE /api/admin/categories/:id` | Admin | Hapus kategori (cascade produk) |
| `POST /api/admin/categories/:id/move` | Admin | Body `{direction: "up"\|"down"}` |
| `GET /api/admin/categories/:id/products` | Admin | Semua produk dalam kategori |
| `POST /api/admin/products` | Admin | Tambah produk |
| `PATCH /api/admin/products/:id` | Admin | Ubah nama/URL/kategori / toggle aktif |
| `DELETE /api/admin/products/:id` | Admin | Hapus produk |
| `POST /api/admin/products/:id/move` | Admin | Body `{direction: "up"\|"down"}` |
| `GET /api/admin/profile` | Admin | Ambil profil |
| `PUT /api/admin/profile` | Admin | Simpan profil |

Semua endpoint admin memvalidasi sesi di server dan memvalidasi input di server (jangan hanya di klien). Aksi yang mengubah data memeriksa header `Origin` sama dengan situs sendiri.

## 10. Desain Visual

Mengikuti mockup. Halaman utama dirancang **mobile-first** (lebar acuan 390 px); di layar lebar, konten tetap satu kolom di tengah dengan lebar maksimal sekitar 480 px.

**Palet**

| Peran | Warna |
|---|---|
| Latar halaman | `#F7F7F7` |
| Teks utama, header kategori terbuka, ikon sosmed | `#1F2937` |
| Tombol produk, aksen utama | `#FFC107` (teks `#1F2937`) |
| Aksen sekunder: panah accordion, hover tombol | `#F97316` |
| Teks sekunder (bio, jumlah, footer) | `#4B5563` |
| Kartu kategori tertutup | `#FFFFFF` dengan border `#E5E7EB` |

Teks putih di atas `#F97316` kontrasnya kurang baik, jadi oranye hanya dipakai sebagai aksen atau latar tombol dengan teks gelap, bukan sebagai latar teks panjang.

**Tipografi:** Plus Jakarta Sans (400, 600, 700) dengan cadangan `sans-serif`. Nama brand 22 px/700, nama kategori 16 px/600, tombol produk 15 px/600, bio 14 px, footer 12 px.

**Komponen**

- Foto profil: lingkaran 84 px; jika belum ada foto, tampilkan lingkaran `#FFC107` dengan ikon orang.
- Ikon sosmed: lingkaran 44 px `#1F2937` dengan ikon `#FFC107`.
- Baris kategori: tinggi 56 px, sudut membulat 14 px, nama di kiri, jumlah dan panah di kanan. Saat terbuka: latar `#1F2937`, teks `#F7F7F7`, panah menghadap atas.
- Tombol produk: tinggi 48 px, sudut 10 px, jarak antar tombol 8 px.
- Ikon memakai SVG inline bergaya garis. **Jangan memakai emoji** sebagai ikon.

**Aksesibilitas:** semua kontrol memakai elemen asli (`button`, `a`), target sentuh ≥ 44 px, fokus keyboard terlihat jelas, kontras teks ≥ 4,5:1, ikon-saja punya `aria-label`.

**Tampilan admin:** sederhana dan fungsional, memakai palet yang sama; tabel/daftar yang tetap terbaca di HP (kartu bertumpuk, bukan tabel lebar).

## 11. Kebutuhan Non-Fungsional

- **Performa:** halaman publik dirender di server dengan data awal sudah tertanam; tanpa framework UI berat di sisi klien selain yang dibutuhkan accordion. Target Lighthouse mobile ≥ 90 untuk performa, aksesibilitas, dan SEO.
- **Cache:** respons halaman publik memakai `Cache-Control: public, max-age=60, s-maxage=300, stale-while-revalidate=600`. Perubahan dari admin boleh tampil dengan jeda beberapa menit. Respons admin tidak boleh di-cache.
- **Keamanan:** hash kata sandi kuat, cookie sesi aman, validasi server, pembatasan percobaan login, pengecekan `Origin`, escape output (cegah XSS), URL produk hanya skema `http`/`https`, rahasia hanya di environment variable.
- **Keandalan:** jika database gagal, halaman publik menampilkan pesan ramah, bukan galat mentah.
- **Bahasa:** seluruh teks antarmuka berbahasa Indonesia.

## 12. Rencana Pengerjaan

| Tahap | Isi | Selesai bila |
|---|---|---|
| M0 | Inisialisasi project, repo GitHub, deploy "hello" ke Netlify | Situs kosong tampil di `.netlify.app` |
| M1 | Skema database, koneksi, migrasi, data contoh (seed) | Query kategori/produk berjalan dari server |
| M2 | Halaman publik dengan accordion, membaca data dari `/api/public` | Sesuai mockup, termasuk kondisi kosong |
| M3 | Login, sesi, proteksi rute `/admin/*` | Hanya admin yang bisa masuk |
| M4 | Admin kategori (CRUD, urutan, toggle) | FR-A2 dan FR-A4 lolos |
| M5 | Admin produk (CRUD, urutan, toggle, pindah kategori) | FR-A3 dan FR-A4 lolos |
| M6 | Admin profil + tampil di header publik | FR-A5 dan FR-P1 lolos |
| M7 | Polesan: meta/OG, disclaimer, cache, aksesibilitas, galat | Semua kriteria bagian 14 lolos |
| M8 | Pengujian akhir di perangkat nyata dan deploy produksi | Dipakai di bio sosmed |

Setiap tahap di-commit terpisah dengan pesan yang jelas.

## 13. Di Luar Lingkup Versi 1 (Ide Lanjutan)

- **Tracking klik** lewat redirect `/go/[id]` yang mencatat klik per produk dan kategori, plus dashboard sederhana. Skema tabel `clicks` sebaiknya tidak dibuat sekarang.
- Foto, harga, dan catatan singkat per produk; badge seperti "Terlaris" atau "Baru".
- Upload gambar (mis. Cloudinary) untuk foto profil dan produk.
- Drag-and-drop untuk urutan.
- Domain sendiri.
- Pencarian atau filter, ikon per kategori, dan mode gelap.
- Pengecekan otomatis link yang mati.

## 14. Kriteria Penerimaan

1. Halaman `/` menampilkan header profil dan semua kategori aktif dalam keadaan tertutup.
2. Membuka satu kategori menutup kategori lain; menekan lagi menutupnya; bisa dioperasikan dengan keyboard.
3. Produk nonaktif dan kategori tanpa produk aktif tidak tampil di publik.
4. Tombol produk membuka link di tab baru dengan atribut `rel` yang benar.
5. Rute admin tidak bisa diakses tanpa login; kata sandi salah ditolak dan dibatasi.
6. Admin dapat menambah, mengubah, mengurutkan, menonaktifkan, dan menghapus kategori maupun produk; perubahan tampil di publik setelah cache habis.
7. Input tidak valid (URL bukan http/https, nama kosong, bio > 200 karakter) ditolak dengan pesan jelas.
8. Tampilan sesuai mockup pada lebar 390 px dan tetap rapi di layar lebar.
9. Preview saat tautan dibagikan (judul, deskripsi, gambar) muncul dengan benar.
10. Tidak ada rahasia di repository; `.env.example` tersedia.

## 15. Panduan untuk AI Agent

**Aturan utama**

- Kerjakan **hanya** yang ada di dokumen ini. Jangan menambah fitur (terutama tracking klik, foto produk, atau drag-and-drop). Jika ada hal yang ambigu, pilih opsi paling sederhana dan catat asumsinya di README.
- Ikuti urutan tahap M0–M8. Selesaikan dan uji satu tahap sebelum lanjut.
- Periksa dokumentasi terbaru untuk setiap pustaka dan layanan; jangan mengandalkan ingatan untuk versi atau konfigurasi.
- Pin versi dependensi; hindari dependensi yang tidak perlu.
- Terapkan validasi dan pemeriksaan sesi **di server** pada setiap endpoint admin.
- Gunakan elemen HTML semantik, SVG inline untuk ikon, dan tanpa emoji sebagai ikon.
- Seluruh teks antarmuka dalam bahasa Indonesia; kode, nama variabel, dan komentar boleh bahasa Inggris.
- Jangan menaruh rahasia di kode atau repository.

**Data awal (seed)** — hanya untuk pengembangan: profil `[Nama Brand]` dengan bio placeholder, kategori contoh (Kabel Data, Charger & Adaptor, Holder HP) masing-masing 2–3 produk contoh dengan URL `https://example.com/...`. Seed tidak boleh dijalankan otomatis di produksi.

**Cara memverifikasi tiap tahap:** jalankan secara lokal, uji alur di lebar 390 px, lalu deploy preview Netlify dan uji ulang di HP.

**Keluaran akhir yang diharapkan:** repository GitHub yang rapi, README berisi cara menjalankan lokal, cara menyiapkan database, daftar environment variable, cara membuat `ADMIN_PASSWORD_HASH`, dan cara deploy ke Netlify.

## 16. Hal yang Diisi Pemilik Setelah Deploy

- Nama/brand, bio singkat, dan foto profil.
- URL akun X dan Facebook.
- Kategori dan produk asli beserta link affiliate-nya.
- Pilihan akhir penyedia database (Turso atau Neon), jika belum ditentukan sebelum M1.
