// =====================================================================
// app.js  —  Titik masuk utama aplikasi (entry point)
// Aplikasi: E-Book Library (UTS Pemrograman Web II)
// Menjalankan server Express, mengatur view engine EJS, session, flash,
// file statis, dan memuat (mount) semua route.
// Jalankan dengan: node app.js  -> buka http://localhost:3000
// =====================================================================

const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const path = require('path');

// Import route handlers
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
// Port server: pakai env PORT bila ada, jika tidak default ke 3000.
const PORT = process.env.PORT || 3000;

// --- View engine: EJS ---
// Semua tampilan (.ejs) berada di folder "views".
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// --- File statis (CSS, gambar, dll) dari folder "public" ---
app.use(express.static(path.join(__dirname, 'public')));

// --- Parsing body form & JSON ---
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// --- method-override ---
// HTML form hanya mendukung GET & POST. Override ini memungkinkan kita
// mengirim PUT/DELETE lewat input hidden _method (dipakai untuk edit/hapus).
app.use(methodOverride('_method'));

// --- Session ---
// Menyimpan status login user di server. Cookie sesi dikirim ke browser.
app.use(session({
  secret: 'ebook-library-rahasia-uts-2026', // kunci rahasia tanda tangan cookie
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 } // sesi berlaku 1 jam
}));

// --- Flash message ---
// Pesan sekali-tampil (sukses/error) yang muncul setelah redirect.
app.use(flash());

// --- Variabel global untuk semua view ---
// Agar setiap file .ejs bisa mengakses "user" dan pesan flash tanpa
// harus dikirim manual di tiap route.
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');

  // --- Helper role (dipakai bersama oleh view & route) ---
  // Daftar semua role yang valid (urut dari tertinggi ke terendah).
  res.locals.ALL_ROLES = ['Admin', 'User'];
  // Role yang dianggap punya hak Admin (boleh kelola user/settings).
  res.locals.isAdminRole = (status) => status === 'Admin';
  // Warna badge Bootstrap untuk tiap role.
  res.locals.roleBadgeClass = (status) => ({
    'Admin': 'bg-primary',
    'User': 'bg-success'
  }[status] || 'bg-secondary');

  next();
});

// --- Mount routes ---
app.use('/', authRoutes);              // /login, /register, /logout
app.use('/dashboard', dashboardRoutes); // /dashboard dan turunannya

// --- Halaman root: arahkan ke login ---
app.get('/', (req, res) => res.redirect('/login'));

// --- Handler 404 (halaman tidak ditemukan) ---
app.use((req, res) => {
  res.status(404).send('404 - Halaman tidak ditemukan');
});

// --- Jalankan server ---
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
