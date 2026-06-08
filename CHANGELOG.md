# Changelog

All notable changes to the E-Book Library app are recorded here.
Newest entries go on top. Format: `## [version] — YYYY-MM-DD`, grouped by
**Added / Changed / Fixed / Removed**.

## [Unreleased]

### Changed
- **Login card is wider and shorter** — `views/login.ejs` column changed from `col-md-5 col-lg-4` to `col-md-10 col-lg-9`, and the form fields restructured into a Bootstrap `row g-3` grid: Username | Password on the first row (`col-md-6` each), Status full-width on the second row, and Login | Reset placed side-by-side on the third row (`col-md-8` / `col-md-4` with `w-100`) instead of stacked in a `d-grid`. Title block tightened from `mb-4` to `mb-3`. Net effect: card uses its new horizontal space, and total vertical height drops by one form row plus one button.
- **Elevated the "Reading Room" theme across the whole app** (visual polish only — markup, routes, and rubric features unchanged). `public/css/style.css` rewritten to push the antiquarian-library concept: a reusable gilt (gold-foil) gradient token used on the card ribbon, page-head underline, stat-card top edge, modal header, sidebar foil and pagination; the dark sidebar now reads as an **embossed leather book-spine** (subtle leather-grain texture, gilt top + right foil edges, embossed brand, staggered menu reveal, a "NAVIGASI" section label and an `Est. MMXXVI` gilt footer); auth cards gained an inner double-rule frame, a slowly-gilding logo medallion and staggered field reveals; dashboard stat numbers are now gilt Fraunces with a hover top-rule; tables gain a gilt left-edge indicator and a lift/tilt on book covers per row; the modal opens with a gentle rise-and-scale.
- **Editorial typography touches.** Added the Fraunces *italic* axis to the Google Fonts link (`head.ejs`, `login.ejs`, `register.ejs`) and used it for the topbar greeting and page sub-titles. New `.kicker` + `.page-head` pattern adds a small-caps gold kicker over each page title (Dashboard, Books, Tambah/Edit Buku, Kelola User) with a gilt underline; auth pages gained a `Universitas Siber Asia · Pemrograman Web II` footer line.

### Fixed
- **Modal gilt top-bar looked detached.** The modal's gold ribbon was an absolutely-positioned strip sitting inside the 1px border, so the rounded border showed above it and its square ends didn't nest into the rounded corners (it read as a floating bar). It now uses the **same technique as the login card** (`.auth-card::before`): a `display:block` 5px ribbon in normal flow, clipped by `overflow:hidden` on `.modal-content`, so it fuses flush into the rounded top edge.
- **Hardened the modal-stacking fix:** the `riseIn`/`slideInLeft` entrance keyframes now resolve to `transform: none` (not `translateY(0)`) at their end state, so an animated element — notably `.content` with `animation-fill-mode: both` — no longer leaves behind a lingering stacking context that could re-trap the Bootstrap modal under its backdrop after the load animation. Verified in-browser: modal z-index 1055 sits above backdrop 1050 and the close button is the top element at its position.
- **Book detail modal was blocked by its own backdrop.** `public/css/style.css` applied `position: relative; z-index: 1` to every `.d-flex`, which included the outer dashboard shell in `views/partials/head.ejs`. That created a stacking context, trapping the Bootstrap modal (z-index 1055) below the body-level `.modal-backdrop` (z-index 1050), so clicks landed on the backdrop and the modal looked greyed out. The rule is now scoped to `.auth-page` so the dashboard wrapper stays out of the stack.

### Added
- **`status` (Admin/User) is now the 3rd login input**, restoring the exam-rubric requirement of exactly three login fields. The login form has a styled `<select name="status">` (icon-chip matching username/password) with a required "Pilih status" placeholder and options **Admin** / **User**. `POST /login` now treats status as part of the credential check: it queries `WHERE username = ? AND status = ?` and only logs in when username **and** status match a row and the bcrypt password verifies.

### Changed
- **Roles simplified to exactly two: `Admin` and `User`.** Removed the **Guest** and **Super Admin** tiers so the login `status` select (two options, exact match) can never strand an account. `users.status` is now `ENUM('Admin','User')` defaulting to `User`; self-registration creates a **User**; `isAdmin` middleware checks `status === 'Admin'`; `ALL_ROLES`, `VALID_ROLES`, and the role badge map updated accordingly.
- Seed data now provides one account per status for testing both login paths: `admin` / `admin123` (Admin) and `user` / `admin123` (User). (Replaces the former `superadmin` Super Admin seed.)
- `app.js` now reads the port from `process.env.PORT` (falling back to 3000) so it can run on an alternate port; `.claude/launch.json` sets `autoPort: true`.

### Removed
- **Guest** and **Super Admin** roles and all references to them (schema ENUM/comments, `routes/auth.js`, `routes/dashboard.js`, `middleware/auth.js`, `app.js` helpers, `views/register.ejs` note, `views/partials/sidebar.ejs` comment).

### Fixed
- **Accessibility (WCAG 2.1 AA) pass over the redesign.**
  - Contrast: primary buttons now use brass-dark (`#846020`) for white-text contrast of 5.7:1 (was 3.8:1); warning buttons switched to dark text (6.9:1, was 3.1:1); input/select borders darkened to `--field-border` (`#9c8a5e`) to clear the 3:1 non-text threshold (was 1.5:1); placeholder text darkened to ~4.7:1.
  - Added a visible keyboard focus indicator (`:focus-visible`) on buttons, links, fields, pagination, and sidebar items (brass-bright on the dark spine).
  - Form labels now associated via `for`/`id` on login, register, and the book create/edit forms.
  - Icon-only controls given accessible names: book detail/edit/delete buttons (`aria-label` incl. the title), the mobile sidebar toggle (`aria-controls`/`aria-expanded`), and the password show/hide button (`aria-label` + `aria-pressed`, kept in sync by JS). Decorative `<i>` icons marked `aria-hidden`.
  - Role change on the Users page no longer auto-submits on `change` (WCAG 3.2.2) — replaced with an explicit submit button and a visually-hidden label per row.
  - Landmarks/structure: dashboard content wrapped in `<main>`, sidebar menu wrapped in `<nav aria-label="Menu utama">` with `aria-current="page"` on the active item; page titles promoted to `<h1>`. Detail modals get `aria-labelledby`; book cover `<img>` alt text is now descriptive (`Sampul <title>`).

### Changed
- **Full visual redesign — "The Reading Room" theme.** Replaced the generic Bootstrap indigo/purple look with an antiquarian-library aesthetic: warm parchment backgrounds with a subtle paper-grain texture, a deep forest-ink sidebar styled like a book spine (brass foil edge, brass active-item accent), and brass/oxblood/botanical accents. All purely a layer over Bootstrap 5 — no markup/component structure removed, all CRUD/forms/modals/pagination unchanged.
- Typography: added **Fraunces** (high-contrast literary serif) for headings/brand and **Hanken Grotesk** (warm grotesque) for body/UI via Google Fonts, loaded in `views/partials/head.ejs`, `views/login.ejs`, `views/register.ejs`. Replaced the previous Segoe UI / system stack.
- Re-themed Bootstrap buttons (primary→brass, success→botanical green, warning→ochre, info→teal, danger→oxblood), cards, tables (uppercase catalog-style headers), forms (brass focus ring), badges, pagination, modals, and alerts via Bootstrap CSS variables.
- Auth pages: brass top "ribbon" on the card, medallion logo, an `auth-kicker` label and decorative double-rule (`auth-rule`), plus a tasteful page-load rise-in animation (respects `prefers-reduced-motion`).
- Added `.claude/launch.json` so the app can be launched/previewed by name (`node app.js`, port 3000).

### Added
- New roles: **Guest** (default for self-registered accounts) and **Super Admin** (top role). Role hierarchy is now Super Admin > Admin > User > Guest.
- Admin-only **role management** on the Users page: a per-user dropdown (PUT `/dashboard/users/:id/role`) lets Admins/Super Admins change anyone's role. Guarded by `isAdmin`, validates against the allowed role list, and blocks changing your own role.
- `database.sql` now seeds a `superadmin` / `admin123` (Super Admin) account alongside `admin`.
- Shared view helpers in `app.js`: `ALL_ROLES`, `isAdminRole(status)`, `roleBadgeClass(status)`.

### Changed
- Login no longer has a `status` (Admin/User) dropdown — it exposed the list of roles on a public page. Login now validates only `username` + `password`; the account's status is read from the DB. (Note: deviates from the exam rubric's "3 inputs incl. status" requirement, by user request.)
- Register no longer lets users pick a role; new accounts are always created as **Guest**. Role is changed afterward by an Admin.
- `users.status` is now `ENUM('Super Admin','Admin','User','Guest')` defaulting to `Guest`.
- `isAdmin` middleware and the admin-gated views (navbar, sidebar, books actions) now treat both **Admin** and **Super Admin** as admins.

### Fixed
- Books create/edit/delete routes (`GET /books/create`, `POST /books`, `GET /books/edit/:id`, `PUT /books/:id`, `DELETE /books/:id`) are now guarded by `isAdmin`. Previously they only required login, so a non-admin (e.g. a Guest) could modify books by posting directly to the endpoints even though the UI hid the buttons. Read routes (list/detail) remain open to all logged-in users.

## [1.0.0] — 2026-06-01

### Added
- Initial full scaffold of the E-Book Library app (Express + EJS + MySQL + Bootstrap 5).
- `app.js` entry point: EJS view engine, static files, `express-session`, `connect-flash`, `method-override`, route mounting, 404 handler. Runs on port 3000.
- `config/db.js`: mysql2 promise connection pool (XAMPP defaults — host `localhost`, user `root`, empty password, db `ebook_library`, port 3306).
- `middleware/auth.js`: `isLoggedIn` and `isAdmin` route guards.
- `routes/auth.js`: login (validates username + password + status), register (bcrypt-hashed, functional), logout.
- `routes/dashboard.js`: dashboard home with summary stats + recent books; full Books CRUD with pagination (5/page); Admin-only Users list + delete; Admin-only Settings page.
- Views: `login.ejs`, `register.ejs` (show/hide password, cross-links), dashboard partials (`head`, `footer`, `sidebar`, `navbar`), and `dashboard/` views (`index`, `books`, `books-create`, `books-edit`, `users`).
- `public/css/style.css`: custom styling (auth gradient, sidebar, stat cards, responsive collapsible sidebar).
- `database.sql`: schema for `users` + `books`, default admin (`admin` / `admin123` / Admin), and 6 sample books.
- `README.md` (setup guide) and `.gitignore`.

### Notes
- Registration is fully functional (deviates from the exam rubric's "no-action" register button by design — see README). To follow the rubric literally, change the submit button in `views/register.ejs` to `type="button"`.
- Verified end-to-end against a running MySQL: login → 302, dashboard → 200 with live stats, books page renders DB data.
