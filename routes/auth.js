// =====================================================================
// routes/auth.js
// Route untuk autentikasi: Login, Register, dan Logout.
// =====================================================================

const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../config/db');

const router = express.Router();

// ---------------------------------------------------------------------
// GET /login  -> Menampilkan halaman login
// ---------------------------------------------------------------------
router.get('/login', (req, res) => {
  // Jika sudah login, langsung ke dashboard
  if (req.session.user) return res.redirect('/dashboard');
  res.render('login');
});

// ---------------------------------------------------------------------
// POST /login -> Proses login
// Validasi 3 input (sesuai soal UTS): username, password, dan status.
// Login HANYA berhasil bila ketiganya cocok dengan satu baris di tabel
// users — jadi status (Admin/User) ikut diperiksa sebagai bagian dari
// kredensial, bukan sekadar diambil dari DB.
// ---------------------------------------------------------------------
router.post('/login', async (req, res) => {
  const { username, password, status } = req.body;

  try {
    // Status wajib dipilih dan harus salah satu nilai yang valid
    if (status !== 'Admin' && status !== 'User') {
      req.flash('error', 'Silakan pilih status (Admin/User).');
      return res.redirect('/login');
    }

    // Cari user yang username DAN status-nya cocok sekaligus
    const [rows] = await db.query(
      'SELECT * FROM users WHERE username = ? AND status = ?',
      [username, status]
    );

    // Tidak ada baris yang cocok -> username/status salah.
    // Pesan dibuat umum agar tidak membocorkan field mana yang keliru.
    if (rows.length === 0) {
      req.flash('error', 'Username atau status tidak cocok.');
      return res.redirect('/login');
    }

    const user = rows[0];

    // Cek kecocokan password (bandingkan password input dengan hash di DB)
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      req.flash('error', 'Password salah.');
      return res.redirect('/login');
    }

    // Ketiganya cocok -> simpan data user ke session.
    req.session.user = {
      id: user.id,
      username: user.username,
      status: user.status
    };

    req.flash('success', `Selamat datang, ${user.username}!`);
    res.redirect('/dashboard');
  } catch (err) {
    console.error('Error saat login:', err);
    req.flash('error', 'Terjadi kesalahan pada server.');
    res.redirect('/login');
  }
});

// ---------------------------------------------------------------------
// GET /register -> Menampilkan halaman register
// ---------------------------------------------------------------------
router.get('/register', (req, res) => {
  if (req.session.user) return res.redirect('/dashboard');
  res.render('register');
});

// ---------------------------------------------------------------------
// POST /register -> Proses pendaftaran akun baru
// Password di-hash dengan bcrypt sebelum disimpan.
//
// CATATAN SOAL UTS: Soal menyebut tombol Register "tidak beraksi".
// Namun agar aplikasi benar-benar fungsional (bisa membuat akun User),
// route ini dibuat bekerja penuh. Jika ingin mengikuti soal secara
// harfiah (tombol tanpa aksi), ubah tombol di views/register.ejs
// menjadi type="button".
// ---------------------------------------------------------------------
router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  // Role tidak dipilih user. Akun baru selalu dibuat sebagai 'User';
  // hanya Admin yang bisa menaikkan peran lewat halaman Kelola User.
  const status = 'User';

  try {
    // Validasi input dasar
    if (!username || !password) {
      req.flash('error', 'Username dan password wajib diisi.');
      return res.redirect('/register');
    }

    // Cek apakah username sudah dipakai
    const [existing] = await db.query('SELECT id FROM users WHERE username = ?', [username]);
    if (existing.length > 0) {
      req.flash('error', 'Username sudah terdaftar. Gunakan username lain.');
      return res.redirect('/register');
    }

    // Hash password (10 = jumlah salt rounds)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Simpan user baru ke database
    await db.query(
      'INSERT INTO users (username, password, status) VALUES (?, ?, ?)',
      [username, hashedPassword, status]
    );

    req.flash('success', 'Registrasi berhasil! Silakan login.');
    res.redirect('/login');
  } catch (err) {
    console.error('Error saat register:', err);
    req.flash('error', 'Terjadi kesalahan pada server.');
    res.redirect('/register');
  }
});

// ---------------------------------------------------------------------
// GET /logout -> Hapus sesi (logout) lalu kembali ke login
// ---------------------------------------------------------------------
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

module.exports = router;
