// =====================================================================
// middleware/auth.js
// Middleware untuk mengatur hak akses (proteksi halaman).
// Middleware adalah fungsi yang dijalankan SEBELUM route handler,
// berguna untuk mengecek apakah user boleh mengakses halaman tertentu.
// =====================================================================

// isLoggedIn: memastikan user sudah login.
// Jika belum login (tidak ada req.session.user), arahkan ke /login.
function isLoggedIn(req, res, next) {
  if (req.session && req.session.user) {
    return next(); // user sudah login -> lanjutkan ke route berikutnya
  }
  req.flash('error', 'Silakan login terlebih dahulu.');
  return res.redirect('/login');
}

// isAdmin: memastikan user punya hak Admin ('Admin').
// Dipakai untuk halaman yang hanya boleh diakses Admin (mis. kelola user).
function isAdmin(req, res, next) {
  const status = req.session && req.session.user && req.session.user.status;
  if (status === 'Admin') {
    return next(); // user adalah Admin -> lanjutkan
  }
  req.flash('error', 'Akses ditolak. Halaman ini khusus Admin.');
  return res.redirect('/dashboard');
}

module.exports = { isLoggedIn, isAdmin };
