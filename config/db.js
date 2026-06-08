// =====================================================================
// config/db.js
// Koneksi ke database MySQL menggunakan driver mysql2.
// Kita pakai "connection pool" agar koneksi bisa dipakai ulang (efisien)
// dan versi "promise" supaya bisa memakai async/await di routes.
// =====================================================================

const mysql = require('mysql2');

// Buat pool koneksi. Sesuaikan konfigurasi di bawah dengan server MySQL Anda.
// Default di bawah cocok untuk XAMPP (user root, password kosong).
const pool = mysql.createPool({
  host: 'localhost',     // alamat server database
  user: 'root',          // username MySQL (default XAMPP: root)
  password: '',          // password MySQL (default XAMPP: kosong)
  database: 'ebook_library', // nama database yang dibuat di database.sql
  port: 3306,            // port default MySQL
  waitForConnections: true,
  connectionLimit: 10,   // maksimal 10 koneksi aktif sekaligus
  queueLimit: 0
});

// Ekspor versi promise dari pool agar route bisa pakai: await pool.query(...)
module.exports = pool.promise();
