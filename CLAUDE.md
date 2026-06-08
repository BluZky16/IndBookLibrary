# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Start here every session

**Read [`CHANGELOG.md`](CHANGELOG.md) at the start of each new chat** to catch up on what has changed. After making any meaningful change to the app, add a new entry at the top of `CHANGELOG.md` (newest first), grouped by Added/Changed/Fixed/Removed.

## Status

Implemented. The full app exists (`app.js`, `config/`, `middleware/`, `routes/`, `views/`, `public/`, `database.sql`). The authoritative build spec is [`instruction.md`](instruction.md); the exam brief is `document.pdf`. The grading constraints below are requirements, not suggestions — preserve them when editing.

## What this is

An **E-Book Library** web app submitted as a midterm exam (UTS Pemrograman Web II, Universitas Siber Asia). Stack: **Node.js + Express + EJS + MySQL + Bootstrap 5**. Three pages only: Login, Register, Dashboard. Code is graded on being clean, well-commented (Indonesian comments are fine), and fully functional, so prioritize clarity over cleverness.

## Graded requirements (do not deviate)

These map directly to the exam rubric in `document.pdf`. Breaking any of these loses marks:

- **Login ⇄ Register cross-links (10%)**: Login page links to Register and vice versa. The Register submit button itself performs **no action** by rubric — but since this is a real library app, wire Register to actually insert a user (the brief allows adapting to the study case). Keep the cross-navigation links regardless.
- **Login has exactly 3 inputs (15%)**: `username`, `password`, and `status`. `status` is a `<select>` with two options: **Admin** and **User**. Login succeeds only when all three match a registered row — i.e. the `status` is part of the credential check, not just the username/password.
- **Dashboard with ≥2 CRUD features (70%)**: This is the bulk of the grade. Dashboard must be Bootstrap 5 styled and expose at least **two** independent Create/Read/Update/Delete resources. For a library, natural choices are **Books** and **Members/Categories**. Full CRUD on each — list, add, edit, delete.
- **Logout button (5%)**: Dashboard has a logout that destroys the session and returns to Login.

## Architecture (intended)

A conventional Express MVC app rendered server-side with EJS — no SPA, no client framework.

- **Entry point**: `app.js` (or `server.js`) — configures Express, EJS as the view engine, `express-session` for auth state, static asset serving, and mounts routers.
- **Auth via session**: Login writes the user (including `status`) into `req.session`. Protect Dashboard routes with a middleware that redirects to `/login` when no session user is present. Logout calls `req.session.destroy()`.
- **DB layer**: A single MySQL connection/pool module (e.g. `config/db.js` using `mysql2`). Routes call it directly with parameterized queries — keep it simple, no ORM expected for this scope.
- **Routes → views**: Each page/feature has a route that runs a query and renders an EJS template. CRUD resources follow the pattern: GET list, GET/POST add, GET/POST edit, POST (or GET) delete.
- **Views**: EJS templates under `views/`, with a shared layout/partials for the Bootstrap navbar and `<head>`. Pull Bootstrap 5 via CDN unless told to vendor it.
- **Schema**: At minimum a `users` table (`username`, `password`, `status`) plus one table per CRUD resource (e.g. `books`). Provide a `.sql` seed/schema file so the grader can recreate the DB.

## Conventions

- Server-rendered EJS only; put interactivity in small inline scripts, not a build pipeline.
- Always use **parameterized queries** (`?` placeholders) — never string-concatenate SQL.
- Keep DB credentials in code via a config module or `.env`; if using `.env`, commit a `.env.example` so the grader can run it.

## Commands

No `package.json` exists yet. After scaffolding, expect roughly:

```powershell
npm install            # install deps (express, ejs, mysql2, express-session, dotenv)
node app.js            # run the server (or `npm start` once defined)
# import the schema, e.g.:  mysql -u root -p ebook_library < schema.sql
```

There is no test suite, linter, or build step for this project, and none is required by the rubric. Verification is manual: run the server, register a user, log in with the matching status, exercise both CRUD features, and log out.

## Deliverables (per the brief)

Beyond the code: screenshots of the running output and a face-on video walkthrough explaining the source code and features (uploaded to YouTube/Drive, link in the answer sheet). The repo should be self-contained enough that a grader can clone, set up the DB, and run it.
