# IndBook Library

**IndBook Library** adalah aplikasi perpustakaan digital berbasis web yang memungkinkan pengguna untuk mengakses dan mengelola koleksi buku secara online — mulai dari **novel**, **jurnal ilmiah**, **komik**, **buku pengembangan diri**, hingga berbagai jenis buku lainnya.

---

## Fitur Utama

- **Autentikasi pengguna** — Login, Register, dan Logout dengan sistem session
- **Role-based access** — dua peran: **Admin** (kelola buku & user) dan **User** (akses member biasa)
- **Manajemen Buku (CRUD)** — tambah, lihat, edit, dan hapus koleksi buku perpustakaan
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

---

## Struktur Proyek

```
IndBookLibrary/
├── app.js                  # Entry point — konfigurasi Express & mount routes
├── package.json
├── database.sql            # Skema DB + data awal (seed)
│
├── config/
│   └── db.js               # Koneksi MySQL pool
│
├── middleware/
│   └── auth.js             # Middleware proteksi route (cek session & role)
│
├── routes/
│   ├── auth.js             # /login, /register, /logout
│   └── dashboard.js        # /dashboard, /books, /users (CRUD)
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
│       └── users.ejs       # Daftar user (admin only)
│
└── public/                 # Asset statis (CSS, gambar)
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
- Tambah buku baru
- Edit data buku
- Hapus buku

### 5. Manajemen User (`/dashboard/users`) — Admin Only
- Lihat seluruh daftar member terdaftar
- Kelola akun pengguna

---

## Skema Database

```sql
-- Tabel pengguna
users (id, username, password, status ENUM('Admin','User'), created_at)

-- Tabel koleksi buku
books (id, title, author, genre, year, description, cover_url, file_url, created_at)
```

---

## Catatan Teknis

- Password disimpan dalam bentuk **hash bcrypt** — tidak pernah disimpan plaintext
- Semua query SQL menggunakan **parameterized queries** (`?`) untuk mencegah SQL Injection
- Session login berlaku selama **1 jam**
- Method `PUT`/`DELETE` di-override via `method-override` karena HTML form hanya mendukung GET & POST
- Untuk saat ini buku hanya bisa ditambahkan dan tidak bisa langsung dibaca

---