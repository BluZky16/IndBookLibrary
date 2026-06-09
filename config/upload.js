// =====================================================================
// config/upload.js
// Konfigurasi multer untuk upload file e-book (PDF).
// File disimpan ke public/uploads/books agar bisa disajikan statis
// oleh Express dan dibaca langsung di halaman "Baca Buku".
// =====================================================================

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Pastikan folder tujuan upload ada (dibuat otomatis saat server start)
const UPLOAD_DIR = path.join(__dirname, '..', 'public', 'uploads', 'books');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Simpan ke disk dengan nama unik: timestamp + nama asli yang dibersihkan
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    // Bersihkan nama file: hanya huruf/angka/titik/strip, sisanya jadi "-"
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-]/g, '-');
    cb(null, `${Date.now()}-${safeName}`);
  }
});

// Hanya terima file PDF (cek mimetype DAN ekstensi)
const fileFilter = (req, file, cb) => {
  const isPdf =
    file.mimetype === 'application/pdf' &&
    path.extname(file.originalname).toLowerCase() === '.pdf';
  if (isPdf) return cb(null, true);
  cb(new Error('File e-book harus berformat PDF.'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 25 * 1024 * 1024 } // maksimal 25 MB
});

// ---------------------------------------------------------------------
// Middleware pembungkus: jalankan upload.single('book_file') dan ubah
// error multer menjadi pesan flash (bukan halaman error mentah).
// ---------------------------------------------------------------------
const uploadBookFile = (req, res, next) => {
  upload.single('book_file')(req, res, (err) => {
    if (err) {
      const msg =
        err.code === 'LIMIT_FILE_SIZE'
          ? 'Ukuran file maksimal 25 MB.'
          : err.message || 'Gagal mengunggah file.';
      req.flash('error', msg);
      // Kembali ke halaman form sebelumnya
      return res.redirect(req.get('Referrer') || '/dashboard/books');
    }
    next();
  });
};

module.exports = { uploadBookFile, UPLOAD_DIR };
