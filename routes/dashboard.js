// =====================================================================
// routes/dashboard.js
// Route untuk area Dashboard (dilindungi login).
// Berisi: halaman utama dashboard, CRUD Books, dan kelola Users (Admin).
// Semua route di file ini diawali prefix "/dashboard" (lihat app.js).
// =====================================================================

const express = require('express');
const path = require('path');
const fs = require('fs');
const db = require('../config/db');
const { isLoggedIn, isAdmin } = require('../middleware/auth');
const { uploadBookFile } = require('../config/upload');

// ---------------------------------------------------------------------
// Helper: hapus file PDF lokal milik sebuah buku (jika ada).
// Hanya menghapus file yang berada di /uploads/books — URL eksternal
// (http/https) dibiarkan karena bukan milik server ini.
// ---------------------------------------------------------------------
const deleteLocalBookFile = (fileUrl) => {
  if (!fileUrl || !fileUrl.startsWith('/uploads/books/')) return;
  const filePath = path.join(__dirname, '..', 'public', fileUrl);
  fs.unlink(filePath, () => {}); // abaikan error bila file sudah tidak ada
};

const router = express.Router();

// Terapkan proteksi: semua route dashboard wajib sudah login.
router.use(isLoggedIn);

// ---------------------------------------------------------------------
// GET /dashboard -> Halaman utama (welcome + kartu ringkasan + buku terbaru)
// ---------------------------------------------------------------------
router.get('/', async (req, res) => {
  try {
    // Hitung total buku
    const [[{ totalBooks }]] = await db.query('SELECT COUNT(*) AS totalBooks FROM books');
    // Hitung total user
    const [[{ totalUsers }]] = await db.query('SELECT COUNT(*) AS totalUsers FROM users');
    // Hitung total genre unik (yang tidak kosong)
    const [[{ totalGenres }]] = await db.query(
      "SELECT COUNT(DISTINCT genre) AS totalGenres FROM books WHERE genre IS NOT NULL AND genre <> ''"
    );
    // Ambil 5 buku terbaru
    const [recentBooks] = await db.query('SELECT * FROM books ORDER BY created_at DESC LIMIT 5');

    res.render('dashboard/index', {
      page: 'home',
      stats: { totalBooks, totalUsers, totalGenres },
      recentBooks
    });
  } catch (err) {
    console.error('Error dashboard home:', err);
    req.flash('error', 'Gagal memuat dashboard.');
    res.render('dashboard/index', {
      page: 'home',
      stats: { totalBooks: 0, totalUsers: 0, totalGenres: 0 },
      recentBooks: []
    });
  }
});

// =====================================================================
// CRUD BOOKS
// =====================================================================

// ---------------------------------------------------------------------
// READ: GET /dashboard/books -> Daftar buku dengan pagination (5 per halaman)
// ---------------------------------------------------------------------
router.get('/books', async (req, res) => {
  try {
    const perPage = 5; // jumlah buku per halaman
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const offset = (page - 1) * perPage;

    // Total buku untuk menghitung jumlah halaman
    const [[{ total }]] = await db.query('SELECT COUNT(*) AS total FROM books');
    const totalPages = Math.max(1, Math.ceil(total / perPage));

    // Ambil data buku sesuai halaman
    const [books] = await db.query(
      'SELECT * FROM books ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [perPage, offset]
    );

    res.render('dashboard/books', {
      page: 'books',
      books,
      currentPage: page,
      totalPages,
      offset // dipakai untuk penomoran "No" di tabel
    });
  } catch (err) {
    console.error('Error daftar buku:', err);
    req.flash('error', 'Gagal memuat daftar buku.');
    res.redirect('/dashboard');
  }
});

// ---------------------------------------------------------------------
// READ (baca buku): GET /dashboard/books/read/:id
// Halaman pembaca e-book: menampilkan PDF buku langsung di aplikasi
// (lewat <iframe>, memakai penampil PDF bawaan browser).
// Terbuka untuk semua role yang sudah login.
// ---------------------------------------------------------------------
router.get('/books/read/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM books WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      req.flash('error', 'Buku tidak ditemukan.');
      return res.redirect('/dashboard/books');
    }
    const book = rows[0];
    if (!book.file_url) {
      req.flash('error', `Buku "${book.title}" belum memiliki file e-book.`);
      return res.redirect('/dashboard/books');
    }
    res.render('dashboard/books-read', { page: 'books', book });
  } catch (err) {
    console.error('Error baca buku:', err);
    req.flash('error', 'Gagal membuka buku.');
    res.redirect('/dashboard/books');
  }
});

// ---------------------------------------------------------------------
// CREATE (form): GET /dashboard/books/create
// ---------------------------------------------------------------------
router.get('/books/create', isAdmin, (req, res) => {
  res.render('dashboard/books-create', { page: 'books' });
});

// ---------------------------------------------------------------------
// CREATE (proses): POST /dashboard/books
// ---------------------------------------------------------------------
// uploadBookFile memproses <input type="file" name="book_file"> (PDF, maks 25 MB)
router.post('/books', isAdmin, uploadBookFile, async (req, res) => {
  const { title, author, genre, year, description, cover_url, file_url } = req.body;
  try {
    if (!title || !author) {
      req.flash('error', 'Judul dan penulis wajib diisi.');
      return res.redirect('/dashboard/books/create');
    }
    // Prioritas file e-book: PDF yang di-upload > URL eksternal yang diketik
    const finalFileUrl = req.file
      ? `/uploads/books/${req.file.filename}`
      : (file_url || null);
    await db.query(
      `INSERT INTO books (title, author, genre, year, description, cover_url, file_url)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [title, author, genre || null, year || null, description || null, cover_url || null, finalFileUrl]
    );
    req.flash('success', 'Buku berhasil ditambahkan.');
    res.redirect('/dashboard/books');
  } catch (err) {
    console.error('Error tambah buku:', err);
    req.flash('error', 'Gagal menambah buku.');
    res.redirect('/dashboard/books/create');
  }
});

// ---------------------------------------------------------------------
// UPDATE (form): GET /dashboard/books/edit/:id
// ---------------------------------------------------------------------
router.get('/books/edit/:id', isAdmin, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM books WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      req.flash('error', 'Buku tidak ditemukan.');
      return res.redirect('/dashboard/books');
    }
    res.render('dashboard/books-edit', { page: 'books', book: rows[0] });
  } catch (err) {
    console.error('Error form edit buku:', err);
    req.flash('error', 'Gagal memuat data buku.');
    res.redirect('/dashboard/books');
  }
});

// ---------------------------------------------------------------------
// UPDATE (proses): PUT /dashboard/books/:id  (via method-override)
// ---------------------------------------------------------------------
router.put('/books/:id', isAdmin, uploadBookFile, async (req, res) => {
  const { title, author, genre, year, description, cover_url, file_url } = req.body;
  try {
    // Ambil file_url lama untuk dibersihkan bila diganti file baru
    const [[oldBook]] = await db.query('SELECT file_url FROM books WHERE id = ?', [req.params.id]);

    // Prioritas: PDF baru yang di-upload > nilai file_url dari form (URL/lama)
    const finalFileUrl = req.file
      ? `/uploads/books/${req.file.filename}`
      : (file_url || null);

    await db.query(
      `UPDATE books
       SET title = ?, author = ?, genre = ?, year = ?, description = ?, cover_url = ?, file_url = ?
       WHERE id = ?`,
      [title, author, genre || null, year || null, description || null, cover_url || null, finalFileUrl, req.params.id]
    );

    // Hapus PDF lama dari disk bila sudah digantikan file/URL lain
    if (oldBook && oldBook.file_url !== finalFileUrl) {
      deleteLocalBookFile(oldBook.file_url);
    }
    req.flash('success', 'Buku berhasil diperbarui.');
    res.redirect('/dashboard/books');
  } catch (err) {
    console.error('Error update buku:', err);
    req.flash('error', 'Gagal memperbarui buku.');
    res.redirect(`/dashboard/books/edit/${req.params.id}`);
  }
});

// ---------------------------------------------------------------------
// DELETE: DELETE /dashboard/books/:id  (via method-override)
// ---------------------------------------------------------------------
router.delete('/books/:id', isAdmin, async (req, res) => {
  try {
    // Hapus juga file PDF lokal milik buku ini (bila ada)
    const [[book]] = await db.query('SELECT file_url FROM books WHERE id = ?', [req.params.id]);
    await db.query('DELETE FROM books WHERE id = ?', [req.params.id]);
    if (book) deleteLocalBookFile(book.file_url);
    req.flash('success', 'Buku berhasil dihapus.');
    res.redirect('/dashboard/books');
  } catch (err) {
    console.error('Error hapus buku:', err);
    req.flash('error', 'Gagal menghapus buku.');
    res.redirect('/dashboard/books');
  }
});

// =====================================================================
// KELOLA USERS (khusus Admin)
// =====================================================================

// ---------------------------------------------------------------------
// READ: GET /dashboard/users -> Daftar user (hanya Admin)
// ---------------------------------------------------------------------
router.get('/users', isAdmin, async (req, res) => {
  try {
    const [users] = await db.query('SELECT id, username, status, created_at FROM users ORDER BY created_at DESC');
    res.render('dashboard/users', { page: 'users', users });
  } catch (err) {
    console.error('Error daftar user:', err);
    req.flash('error', 'Gagal memuat daftar user.');
    res.redirect('/dashboard');
  }
});

// ---------------------------------------------------------------------
// UPDATE ROLE: PUT /dashboard/users/:id/role -> Ubah peran user (Admin saja)
// Hanya Admin yang boleh; tidak boleh mengubah role diri sendiri
// (mencegah Admin mengunci dirinya keluar dari akses Admin).
// ---------------------------------------------------------------------
const VALID_ROLES = ['Admin', 'User'];

router.put('/users/:id/role', isAdmin, async (req, res) => {
  try {
    const { status } = req.body;

    // Validasi role yang dikirim
    if (!VALID_ROLES.includes(status)) {
      req.flash('error', 'Role tidak valid.');
      return res.redirect('/dashboard/users');
    }

    // Cegah Admin mengubah role akunnya sendiri
    if (parseInt(req.params.id) === req.session.user.id) {
      req.flash('error', 'Anda tidak bisa mengubah role akun sendiri.');
      return res.redirect('/dashboard/users');
    }

    await db.query('UPDATE users SET status = ? WHERE id = ?', [status, req.params.id]);
    req.flash('success', `Role user berhasil diubah menjadi ${status}.`);
    res.redirect('/dashboard/users');
  } catch (err) {
    console.error('Error ubah role user:', err);
    req.flash('error', 'Gagal mengubah role user.');
    res.redirect('/dashboard/users');
  }
});

// ---------------------------------------------------------------------
// DELETE: DELETE /dashboard/users/:id -> Hapus user (Admin, tidak boleh diri sendiri)
// ---------------------------------------------------------------------
router.delete('/users/:id', isAdmin, async (req, res) => {
  try {
    // Cegah Admin menghapus akunnya sendiri
    if (parseInt(req.params.id) === req.session.user.id) {
      req.flash('error', 'Anda tidak bisa menghapus akun sendiri.');
      return res.redirect('/dashboard/users');
    }
    await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    req.flash('success', 'User berhasil dihapus.');
    res.redirect('/dashboard/users');
  } catch (err) {
    console.error('Error hapus user:', err);
    req.flash('error', 'Gagal menghapus user.');
    res.redirect('/dashboard/users');
  }
});

// ---------------------------------------------------------------------
// GET /dashboard/settings -> Halaman pengaturan sederhana (khusus Admin)
// ---------------------------------------------------------------------
router.get('/settings', isAdmin, (req, res) => {
  res.render('dashboard/index', {
    page: 'settings',
    stats: { totalBooks: 0, totalUsers: 0, totalGenres: 0 },
    recentBooks: []
  });
});

module.exports = router;
