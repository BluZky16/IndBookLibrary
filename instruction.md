# 📚 Cowork Instruction — E-Book Library Web App (UTS Pemrograman Web II)

## Project Overview
Build a complete **E-Book Library Web Application** using **Node.js + Express + EJS + MySQL + Bootstrap 5**.
The app has 3 pages: Login, Register, and Dashboard.
This is for a university midterm exam (UTS), so the code must be clean, well-commented, and fully functional.

---

## Tech Stack
| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Template Engine | EJS |
| Database | MySQL |
| DB Driver | mysql2 |
| Auth | express-session + bcryptjs |
| UI Framework | Bootstrap 5 (CDN) |
| Icons | Bootstrap Icons (CDN) |

---

## Database Schema

### Table: `users`
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  status ENUM('Admin', 'User') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Table: `books`
```sql
CREATE TABLE books (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  genre VARCHAR(100),
  year INT,
  description TEXT,
  cover_url VARCHAR(500),
  file_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## File & Folder Structure
```
ebook-library/
├── app.js
├── package.json
├── config/
│   └── db.js
├── middleware/
│   └── auth.js
├── routes/
│   ├── auth.js
│   └── dashboard.js
├── views/
│   ├── login.ejs
│   ├── register.ejs
│   ├── partials/
│   │   ├── sidebar.ejs
│   │   └── navbar.ejs
│   └── dashboard/
│       ├── index.ejs
│       ├── books.ejs
│       ├── books-create.ejs
│       ├── books-edit.ejs
│       └── users.ejs
└── public/
    └── css/
        └── style.css
```

---

## Page Requirements

### 1. Login Page (`/login`) — 10%
- Form fields: `username`, `password`, `status` (dropdown: Admin / User)
- Login button + Reset button
- Link: "Belum punya akun? Daftar disini" → goes to `/register`
- On submit: validate username + password + status against DB
- On success: redirect to `/dashboard`
- On fail: show error message inline (no alert popup)
- Use Bootstrap card centered on the page
- Show/hide password toggle on password field

### 2. Register Page (`/register`) — 10%
- Form fields: `username`, `password`, `status` (dropdown: Admin / User)
- Register button (NO action — button click does nothing, no form submission)
- Reset button clears the form
- Link: "Sudah punya akun? Masuk disini" → goes to `/login`
- Use Bootstrap card centered on the page
- Show/hide password toggle on password field

### 3. Dashboard (`/dashboard`) — 70% + 5%

#### Layout
- Sidebar (left) with navigation links
- Top navbar with: logged-in username, status badge, Logout button
- Main content area

#### Sidebar Menu Items
- 🏠 Dashboard (home/welcome screen)
- 📚 Books (CRUD for books)
- 👥 Users (view users list — Admin only)
- ⚙️ Settings (Admin only)
- 🔓 Logout

#### Dashboard Home (`/dashboard`)
- Welcome message: "Selamat datang, [username]!"
- Summary cards: Total Books, Total Users, Total Genres
- Recent books table (last 5 added)

#### Books CRUD (`/dashboard/books`)
- **Read**: Table with columns: No, Cover, Title, Author, Genre, Year, Actions
- **Create**: Button "+ Tambah Buku" → form page `/dashboard/books/create`
  - Fields: title, author, genre, year, description, cover_url, file_url
- **Update**: Edit button → form page `/dashboard/books/edit/:id`
- **Delete**: Delete button → confirm then DELETE, redirect back
- **Detail/View**: Eye button → modal or detail page showing full book info
- Pagination: show 5 books per page

#### Users Management (`/dashboard/users`) — Admin only
- **Read**: Table showing: No, Username, Status, Created At, Actions
- **Delete**: Admin can delete a user (not self)
- Non-admin users who try to access this URL get redirected to `/dashboard`

#### Logout (`/logout`)
- Destroys session, redirects to `/login`

---

## Business Logic & Rules

### Authentication
- Password must be hashed with `bcryptjs` before storing
- Use `express-session` to persist login state
- Session must store: `userId`, `username`, `status`
- All `/dashboard/*` routes are protected — redirect to `/login` if not logged in

### Role-Based Access
- **Admin**: Can access all pages including Users management
- **User**: Can only access Dashboard home and Books (read only — hide create/edit/delete buttons)

### Login Validation
- Must match: username + password (bcrypt compare) + status
- If status doesn't match (e.g., user tries to log in as Admin but registered as User) → show error

---

## UI / Design Requirements
- Use **Bootstrap 5** via CDN (no local install)
- Use **Bootstrap Icons** via CDN
- Sidebar should be collapsible on mobile
- Status badges: Admin = `badge bg-primary`, User = `badge bg-success`
- Action buttons: View = `btn-info`, Edit = `btn-warning`, Delete = `btn-danger`
- All forms must have client-side validation (required fields)
- Flash messages for success/error (use `connect-flash` or session-based)

---

## NPM Packages to Install
```bash
npm init -y
npm install express ejs mysql2 express-session bcryptjs connect-flash method-override
```

---

## app.js Setup Requirements
- Set EJS as view engine
- Serve static files from `/public`
- Use `express.urlencoded` and `express.json` middleware
- Use `method-override` for PUT/DELETE from HTML forms
- Set up `express-session` with a secret key
- Set up `connect-flash` for flash messages
- Mount routes: `/` → auth routes, `/dashboard` → dashboard routes

---

## config/db.js Requirements
- Create a MySQL connection pool using `mysql2`
- Export the pool for use in routes
- DB config:
  - host: `localhost`
  - user: `root`
  - password: `` (empty, default XAMPP)
  - database: `ebook_library`
  - port: `3306`

---

## middleware/auth.js Requirements
- Export `isLoggedIn` middleware: checks if `req.session.user` exists, else redirect to `/login`
- Export `isAdmin` middleware: checks if `req.session.user.status === 'Admin'`, else redirect to `/dashboard`

---

## Additional Notes
- Add an SQL file `database.sql` at root that creates the database, tables, and inserts 1 default Admin user
- Default Admin credentials: username: `admin`, password: `admin123`, status: `Admin`
- Add comments in every file explaining what each section does (for academic submission)
- Make sure the app runs with `node app.js` on port `3000`
- Add a `README.md` with setup instructions

---

## Deliverable
Generate ALL files completely — do not skip any file or leave placeholders.
Every `.ejs`, `.js`, and `.sql` file must be complete and working.
The app must run without errors after `npm install` and database setup.
