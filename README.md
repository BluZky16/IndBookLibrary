# IndBook Library

**IndBook Library** adalah aplikasi perpustakaan digital berbasis web yang memungkinkan pengguna untuk mengakses dan mengelola koleksi buku secara online — mulai dari **novel**, **jurnal ilmiah**, **komik**, **buku pengembangan diri**, hingga berbagai jenis buku lainnya.

---

## Fitur Utama

- **Autentikasi pengguna** — Login, Register, dan Logout dengan sistem session
- **Role-based access** — dua peran: **Admin** (kelola buku & user) dan **User** (akses member biasa)
- **Manajemen Buku (CRUD)** — tambah, lihat, edit, dan hapus koleksi buku perpustakaan
- **Baca Buku di aplikasi** — e-book PDF bisa dibaca langsung di halaman reader, tanpa perlu mengunduh
- **Upload e-book (PDF)** — Admin bisa mengunggah file PDF saat menambah/mengedit buku (maks. 25 MB)
- **Manajemen User (Admin only)** — lihat daftar member dan kelola akun pengguna
- **Tampilan responsif** — dibangun dengan Bootstrap 5

---

## Tech Stack

| Layer | Teknologi |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| View Engine | EJS (Embedded JavaScript) |
| Database | MySQL |
| Styling | Bootstrap 5 (CDN) |
| Auth | express-session + bcryptjs |
| Query | mysql2 (parameterized queries) |
| Upload | multer (file e-book PDF) |

---

## Struktur Proyek

```
IndBookLibrary/
├── app.js                  # Entry point — konfigurasi Express & mount routes
├── package.json
├── database.sql            # Skema DB + data awal (seed)
│
├── config/
│   ├── db.js               # Koneksi MySQL pool
│   └── upload.js           # Konfigurasi multer (upload PDF e-book)
│
├── middleware/
│   └── auth.js             # Middleware proteksi route (cek session & role)
│
├── routes/
│   ├── auth.js             # /login, /register, /logout
│   └── dashboard.js        # /dashboard, /books (CRUD + baca), /users
│
├── views/
│   ├── login.ejs
│   ├── register.ejs
│   ├── partials/           # head, navbar, sidebar, footer
│   └── dashboard/
│       ├── index.ejs       # Halaman utama dashboard
│       ├── books.ejs       # Daftar buku
│       ├── books-create.ejs
│       ├── books-edit.ejs
│       ├── books-read.ejs  # Halaman baca e-book (PDF reader)
│       └── users.ejs       # Daftar user (admin only)
│
└── public/                 # Asset statis (CSS, gambar)
    └── uploads/books/      # File PDF e-book hasil upload (di-gitignore)
```

---

## Cara Menjalankan

### Prasyarat
- Node.js (v18+)
- MySQL / XAMPP (jalankan modul MySQL)

### 1. Clone & Install

```bash
git clone <repo-url>
cd IndBookLibrary
npm install
```

### 2. Siapkan Database

Import skema dan data awal ke MySQL:

```bash
# Via terminal
mysql -u root -p < database.sql
```

Atau lewat **phpMyAdmin** → Import → pilih file `database.sql` → Go.

Skrip ini membuat database `ebook_library`, tabel `users` & `books`, akun default, dan beberapa contoh buku.

### 3. Konfigurasi Koneksi DB

Sesuaikan konfigurasi MySQL di `config/db.js` jika host/user/password berbeda dari default XAMPP.

### 4. Jalankan Server

```bash
npm start
# atau
node app.js
```

Buka browser di **http://localhost:3000**

---

## Akun Default

| Username | Password   | Role  |
|----------|------------|-------|
| `admin`  | `admin123` | Admin |
| `user`   | `admin123` | User  |

> Login memerlukan **username + password + status (role)** yang cocok. Pilih status yang sesuai di form login.

---

## Halaman Aplikasi

### 1. Login (`/login`)
Form login dengan tiga input: **username**, **password**, dan **status** (Admin / User). Ketiga field divalidasi bersamaan terhadap database.

### 2. Register (`/register`)
Pendaftaran akun baru. Role default adalah **User**.

### 3. Dashboard (`/dashboard`)
Halaman utama setelah login — menampilkan ringkasan koleksi buku dan data member terbaru.

### 4. Manajemen Buku (`/dashboard/books`)
CRUD lengkap untuk koleksi perpustakaan:
- Lihat daftar buku (judul, penulis, genre, tahun terbit)
- Tambah buku baru — termasuk **upload file e-book PDF** (maks. 25 MB) atau mengisi URL eksternal
- Edit data buku — termasuk mengganti/menghapus file PDF
- Hapus buku — file PDF lokal milik buku ikut dihapus dari server

### 5. Baca Buku (`/dashboard/books/read/:id`)
Halaman **reader** untuk membaca e-book langsung di aplikasi (semua role yang sudah login):
- PDF ditampilkan lewat penampil bawaan browser (`<iframe>`), tanpa library tambahan
- Tombol **Baca** muncul di tabel buku dan modal detail hanya jika buku punya file e-book
- Tersedia tombol **Buka di Tab Baru** sebagai fallback bila sumber eksternal memblokir embed

### 6. Manajemen User (`/dashboard/users`) — Admin Only
- Lihat seluruh daftar member terdaftar
- Kelola akun pengguna

---

## Skema Database

```sql
-- Tabel pengguna
users (id, username, password, status ENUM('Admin','User'), created_at)

-- Tabel koleksi buku
-- file_url: path PDF hasil upload ('/uploads/books/..') atau URL eksternal
books (id, title, author, genre, year, description, cover_url, file_url, created_at)
```

---

## Catatan Teknis

- Password disimpan dalam bentuk **hash bcrypt** — tidak pernah disimpan plaintext
- Semua query SQL menggunakan **parameterized queries** (`?`) untuk mencegah SQL Injection
- Session login berlaku selama **24 jam**
- Method `PUT`/`DELETE` di-override via `method-override` karena HTML form hanya mendukung GET & POST
- Upload e-book ditangani **multer**: hanya menerima PDF (validasi mimetype + ekstensi), maksimal 25 MB, disimpan di `public/uploads/books/` dengan nama unik; folder ini di-gitignore (kecuali `.gitkeep`)
- PDF lama otomatis dihapus dari disk saat diganti (edit) atau saat bukunya dihapus — URL eksternal tidak disentuh

---
