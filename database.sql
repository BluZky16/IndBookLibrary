-- =====================================================================
-- database.sql
-- Skrip pembuatan database untuk aplikasi E-Book Library (UTS Web II).
--
-- Cara pakai (XAMPP / phpMyAdmin):
--   1. Buka phpMyAdmin -> tab "Import" -> pilih file ini -> Go.
-- Atau lewat terminal MySQL:
--   mysql -u root -p < database.sql
-- =====================================================================

-- Buat database jika belum ada, lalu gunakan
CREATE DATABASE IF NOT EXISTS ebook_library
  CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE ebook_library;

-- ---------------------------------------------------------------------
-- Tabel users: menyimpan akun beserta perannya (status/role).
-- Hanya dua role (sesuai pilihan status di form login):
--   - Admin : bisa kelola buku & user (ubah role, hapus).
--   - User  : member biasa; role default saat registrasi mandiri.
-- Status ikut diperiksa saat login (username + password + status).
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS users;
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,          -- disimpan sebagai hash bcrypt
  status ENUM('Admin', 'User') NOT NULL DEFAULT 'User',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- Tabel books: data buku (objek CRUD utama)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS books;
CREATE TABLE books (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  genre VARCHAR(100),
  year INT,
  description TEXT,
  cover_url VARCHAR(500),
  -- file_url: path PDF hasil upload ('/uploads/books/..') ATAU URL eksternal.
  -- Dipakai halaman "Baca Buku" untuk menampilkan e-book langsung di aplikasi.
  file_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- Data awal
-- ---------------------------------------------------------------------

-- Akun default (password kedua-duanya: "admin123" — hash bcrypt yang sama).
-- Disediakan satu akun tiap status agar kedua pilihan login bisa diuji:
--   admin / admin123 + status Admin -> akses penuh (kelola buku & user)
--   user  / admin123 + status User  -> akses member biasa
INSERT INTO users (username, password, status) VALUES
('admin', '$2a$10$aBLlpTn7a/DaVXwfN9SvDerTBZP5IO36yygR37vWf5ABxBjteQ5Ny', 'Admin'),
('user', '$2a$10$aBLlpTn7a/DaVXwfN9SvDerTBZP5IO36yygR37vWf5ABxBjteQ5Ny', 'User');

-- Contoh data buku agar dashboard tidak kosong saat pertama dibuka.
INSERT INTO books (title, author, genre, year, description, cover_url) VALUES
('Laskar Pelangi', 'Andrea Hirata', 'Novel', 2005, 'Kisah inspiratif anak-anak Belitung yang penuh semangat.', 'https://covers.openlibrary.org/b/id/8231856-M.jpg'),
('Bumi Manusia', 'Pramoedya Ananta Toer', 'Sejarah', 1980, 'Roman sejarah perjuangan di masa kolonial.', 'https://covers.openlibrary.org/b/id/10523305-M.jpg'),
('Atomic Habits', 'James Clear', 'Pengembangan Diri', 2018, 'Panduan membangun kebiasaan baik dengan langkah kecil.', 'https://covers.openlibrary.org/b/id/10958382-M.jpg'),
('Filosofi Teras', 'Henry Manampiring', 'Filsafat', 2018, 'Pengantar filsafat Stoa untuk kehidupan modern.', NULL),
('Clean Code', 'Robert C. Martin', 'Teknologi', 2008, 'Prinsip menulis kode yang bersih dan mudah dirawat.', NULL),
('Sapiens', 'Yuval Noah Harari', 'Sejarah', 2011, 'Sejarah singkat umat manusia.', NULL);
