# Sistem Manajemen BK Sekolah

Aplikasi web untuk mengelola Bimbingan dan Konseling (BK) di sekolah. Sistem ini memungkinkan **Admin**, **Guru BK**, dan **Siswa** mengelola kategori poin (pelanggaran & prestasi), catatan siswa, serta melihat skor dan riwayat BK.

---

## Fitur

- **Admin** — Mengelola kategori poin, pengguna, dan data sistem
- **Guru BK** — Mencatat pelanggaran/prestasi siswa, mengelola kategori, melihat daftar siswa dan detail
- **Siswa** — Melihat skor BK, riwayat catatan, dan profil sendiri
- **Publik** — Pencarian NIS untuk cek skor tanpa login
- Autentikasi berbasis Supabase Auth dengan role (admin, guru_bk, student)
- Database aman dengan Row Level Security (RLS)

---

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Database & Auth:** Supabase (PostgreSQL + Auth)
- **UI:** HeroUI v3, Tailwind CSS 4, Motion, GSAP
- **Bahasa:** TypeScript

---

## Prasyarat

- **Node.js** 18.x atau lebih baru
- **npm** (atau yarn/pnpm)
- **Akun Supabase** — [Daftar gratis](https://supabase.com)

---

## Cara Clone Repositori

Clone proyek ke komputer Anda:

```bash
git clone https://github.com/Shiroizx/Sistem-Manajemen-BK.git
cd Sistem-Manajemen-BK
```

Atau dengan SSH (jika sudah mengatur kunci SSH):

```bash
git clone git@github.com:Shiroizx/Sistem-Manajemen-BK.git
cd Sistem-Manajemen-BK
```

---

## Instalasi

### 1. Pasang dependensi

```bash
npm install
```

### 2. Konfigurasi environment variables

Buat file `.env.local` di **akar proyek** (sejajar dengan `package.json`), lalu isi dengan variabel dari project Supabase Anda:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Cara mendapatkan nilai:

1. Buka [Supabase Dashboard](https://app.supabase.com) → pilih project (atau buat baru)
2. **Settings** → **API**  
   - **Project URL** → salin ke `NEXT_PUBLIC_SUPABASE_URL`  
   - **anon public** key → salin ke `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Jangan commit `.env.local` ke Git (sudah diabaikan lewat `.gitignore`).

### 3. Setup database Supabase

Jalankan semua file migrasi di folder `supabase/migrations/` **secara berurutan** lewat Supabase:

- Buka **SQL Editor** di dashboard Supabase
- Jalankan isi setiap file dari `001_initial_schema.sql` sampai file migrasi terakhir (urut nomor)

Atau dengan Supabase CLI (jika sudah terpasang dan terhubung ke project):

```bash
supabase db push
```

Setelah migrasi selesai, buat user percobaan (admin/guru_bk/siswa) sesuai helper di migrasi (mis. `016_create_admin_user_helper.sql`, `009_create_guru_bk_user_helper.sql`, dan skema profil siswa).

---

## Menjalankan Proyek

### Mode development

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

### Build untuk production

```bash
npm run build
```

### Menjalankan build production

```bash
npm start
```

---

## Struktur Proyek (Ringkas)

```
Sistem-Manajemen-BK/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Halaman utama (landing + cek NIS)
│   │   ├── login/                # Login
│   │   ├── admin/                # Dashboard & fitur Admin
│   │   ├── guru-bk/              # Dashboard & fitur Guru BK
│   │   ├── student/              # Dashboard Siswa
│   │   └── ...
│   ├── components/               # Komponen UI
│   ├── lib/                      # Utilitas
│   ├── types/                    # TypeScript types (Supabase)
│   └── utils/
│       └── supabase/             # Client, server, middleware Supabase
├── supabase/
│   └── migrations/               # Skema & migrasi database
├── .env.local                    # Variabel lingkungan (buat sendiri)
└── package.json
```

---

## Peran (Role) Pengguna

| Role     | Deskripsi singkat                    |
|----------|--------------------------------------|
| `admin`  | Akses penuh: kategori, data, pengguna |
| `guru_bk`| Input catatan BK, kategori, lihat siswa |
| `student`| Hanya lihat skor & riwayat sendiri   |

Role disimpan di tabel `profiles` dan di-enforce lewat RLS di Supabase.

---

## Script NPM

| Perintah       | Kegunaan                |
|----------------|-------------------------|
| `npm run dev`  | Server development      |
| `npm run build`| Build production        |
| `npm start`    | Jalankan build production |
| `npm run lint` | Cek lint (ESLint)       |

---

## Repositori

- **GitHub:** [https://github.com/Shiroizx/Sistem-Manajemen-BK](https://github.com/Shiroizx/Sistem-Manajemen-BK)

Jika ada pertanyaan atau ingin berkontribusi, silakan buat Issue atau Pull Request di repositori tersebut.
