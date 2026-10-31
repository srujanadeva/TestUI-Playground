# Test Automation Playground

A React frontend built specifically for practising web automation. It covers 27 interaction types on the main page — from basic inputs to Shadow DOM — each built with deliberate, stable locator attributes so you can focus on writing tests rather than fighting selectors.

The app also includes a login-gated **Test Pet Store** page backed by a real Express + MongoDB API, so you can practise authentication flows (signup, login, remember-me, forgot-password) and full CRUD against a persisted backend — not just client-side state.

A login-gated **Media** page adds image, video and banner widgets: images and videos that load, fail, or only load when scrolled into view, plus a carousel, a promo banner, an announcement bar and a cookie-consent banner.

A login-gated **Frames** page covers iframes: a basic frame, three levels of nested frames, a frame that is added late, several look-alike frames with no ids, and a cross-origin frame served by the API that talks to the page through `postMessage`. Clicking inside a frame expands its card into a large overlay; two cards (F5, F6) expand only from their Expand button.

A login-gated **Spreadsheet** page covers file uploads into data tables: upload an `.xlsx`, `.xls` or `.csv` file, the API reads it, and a table fills with its rows, with a sheet picker, search and pagination.

A login-gated **Verification** page covers the checks found in sign-up and KYC flows: an image CAPTCHA with test-mode bypasses, an "I'm not a robot" checkbox inside an iframe, a one-time code (OTP) with a dev inbox to read the code from, a camera selfie, and a simulated ID-card OCR.

A login-gated **Data** page covers data that isn't simply sitting in the page: a sortable table with inline editing and expandable rows, a tree view with half-checked folders, an SVG chart whose values only appear in tooltips, a skeleton loader, an infinite scroll list, a virtualised list of 10,000 rows, and a back-to-top button.

A login-gated **Controls** page covers custom form controls: an autocomplete combobox whose options arrive late, a multi-select with chips, toggle switches, a number stepper, colour and time pickers, a rich text editor and masked inputs.

A login-gated **Navigation** page covers moving around an app: an accordion, breadcrumbs that live in the URL, a right-click context menu, a menu with a submenu, a side drawer, and a guard that stops you leaving with unsaved changes.

A login-gated **Interactions** page covers interactions beyond a click: resizable panels, a sortable grid (mouse or keyboard), a Ctrl+K command palette and copying to the clipboard.

A login-gated **Live** page covers content that changes on its own: a live order feed, a countdown timer, a button that keeps moving, rows that are rebuilt every few seconds (stale elements), and a session-timeout warning.

A login-gated **Browser** page covers things owned by the browser: nested Shadow DOM with a slot and a closed shadow root, real location and notification permission prompts, and full-screen mode.

Compatible with **Playwright**, **Selenium**, **Cypress**, and any other browser automation framework. Fully bilingual (English / Arabic, with RTL layout).

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Running the App](#running-the-app)
- [What the App Does](#what-the-app-does)
- [Section Reference](#section-reference)
- [Auth & Test Pet Store Reference](#auth--test-pet-store-reference)
- [Media Page Reference](#media-page-reference)
- [Frames Page Reference](#frames-page-reference)
- [Spreadsheet Page Reference](#spreadsheet-page-reference)
- [Verification Page Reference](#verification-page-reference)
- [Data Page Reference](#data-page-reference)
- [Controls Page Reference](#controls-page-reference)
- [Navigation Page Reference](#navigation-page-reference)
- [Interactions Page Reference](#interactions-page-reference)
- [Live Page Reference](#live-page-reference)
- [Browser Page Reference](#browser-page-reference)
- [Locator Quick Reference](#locator-quick-reference)
- [Project Structure](#project-structure)
- [Automation Tester Notes](#automation-tester-notes)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

| Tool | Minimum Version | macOS | Windows |
|------|----------------|-------|---------|
| [Node.js](https://nodejs.org/) | 20.19+ or 22.12+ (needed by Vite 8 and React Router 7) | `brew install node` | `winget install OpenJS.NodeJS.LTS` |
| npm | 9.x or higher | Bundled with Node.js | Bundled with Node.js |
| [MongoDB Community](https://www.mongodb.com/try/download/community) | Any installed version is used; new installs get 8.0 | `brew tap mongodb/brew && brew install mongodb/brew/mongodb-community@8.0 --without-mongosh` | the 8.0.32 `.msi` from mongodb.com, installed as the `MongoDB` service |
| mongosh (optional shell) | any | `npm install -g mongosh` | `winget install MongoDB.Shell` |
| Package manager (used by the setup script) | — | [Homebrew](https://brew.sh) | `winget` (comes with Windows 10/11 as "App Installer") |
| A modern browser | Latest Chrome / Edge / Firefox / Safari | | |

You don't need to install Node or MongoDB by hand — the setup script does it for you (see [Installation](#installation)). This table is for reference or manual setup.

**Supported platforms:** the scripts support **macOS** (bash + Homebrew) and **Windows 10/11** (PowerShell + winget). On **Linux** the scripts don't work yet, because they rely on Homebrew services: install Node and MongoDB with your distro's package manager, start MongoDB with `sudo systemctl start mongod`, create `certs/` and `server/.env` the same way steps 5–6 of `scripts/setup.sh` do, then run `npm install`, `npm run seed` and `npm run dev`.

Verify your environment before proceeding:

```bash
node --version    # should print v20.19.x or higher (on the 22 line, v22.12.0 or higher)
npm --version     # should print 9.x.x or higher
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| UI framework | React 18 (+ React Router 7) |
| Build tool | Vite 8 |
| Styling | Plain CSS (custom properties, CSS Grid, Flexbox) |
| Backend | Express, Mongoose (MongoDB), JWT auth, bcrypt, multer (uploads), SheetJS (spreadsheet reading) |
| Language | JavaScript (ES Modules) |
| Package manager | npm |

No external UI libraries, no CSS frameworks. The 27 playground sections are self-contained with no backend dependency; the Test Pet Store page is login-gated and persists to a local MongoDB via the bundled Express API.

---

## Installation

```bash
# 1. Navigate to the project directory
cd test-playground

# 2. One-time setup
npm run setup        # macOS
npm run setup:win    # Windows
```

`npm run setup` runs `scripts/setup.sh`, and `npm run setup:win` runs `scripts/setup.ps1`. Both follow one rule for every step: **if it's already on the machine, use it and skip; if it's missing, create or install it.** Nothing that already exists is replaced.

| Step | Already there | Missing |
|------|---------------|---------|
| 1. Node.js 20.19+ or 22.12+ | Used as is. An older Node is left alone and setup tells you to upgrade it | Installed (Homebrew on macOS, winget on Windows) |
| 2. npm dependencies | Skipped when every package is installed at the version in `package-lock.json` | `npm install` (SheetJS is downloaded from `cdn.sheetjs.com`, see below) |
| 3. Dev TLS certs (`certs/cert.pem`, `certs/key.pem`) | Kept | Generated (self-signed, `localhost`, 1 year) |
| 4. `server/.env` | Kept | Created from `server/.env.example` with a random `JWT_SECRET` |
| 5. MongoDB | **Any installed version is used as is** | MongoDB 8.0 is installed (`mongodb-community@8.0` via Homebrew on macOS; the 8.0.32 installer as the `MongoDB` service on Windows) |
| 6. MongoDB running on `127.0.0.1:27017` | Used as is | Started (`brew services` for whichever MongoDB formula is installed on macOS; the `MongoDB` service on Windows) |
| 7. Sample users | Left as is | Created (see [Sample login](#sample-login)) |

It also installs the optional `mongosh` shell if it's missing (from npm on macOS, winget on Windows).

**SheetJS comes from its own site.** The spreadsheet reader, SheetJS (`xlsx`), is installed from `https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz`, not from the npm registry. The copy on npm (0.18.5) is no longer updated and has two known high-severity vulnerabilities in reading files (CVE-2023-30533, CVE-2024-22363), both fixed in the version from SheetJS's site. `package-lock.json` records the file's sha512 hash, so if the download ever changes, `npm install` fails instead of installing it. The first install needs `cdn.sheetjs.com` to be reachable; if it isn't, setup says so (see [Troubleshooting](#troubleshooting)).

Each step prints whether it was skipped, done, or failed. If a step fails, the steps that don't depend on it still run, the summary at the end lists what failed and why, and the command exits with an error. It's safe to re-run at any time.

Homebrew (macOS) or winget (Windows) is only needed when something has to be installed.

**If Node isn't installed yet**, `npm` doesn't exist either, so run the script directly instead:

```bash
# macOS
bash scripts/setup.sh
```

```powershell
# Windows (PowerShell)
powershell -ExecutionPolicy Bypass -File scripts\setup.ps1
```

**Windows notes:**
- Installing MongoDB, and starting or stopping its Windows service, may show a UAC prompt or require an **Administrator** PowerShell. If a script says it couldn't start or stop the service, run `Start-Service MongoDB` or `Stop-Service MongoDB` from an Administrator PowerShell.
- OpenSSL is needed to create the dev certs. The script uses the copy bundled with Git for Windows if it's installed, and otherwise installs one with `winget install ShiningLight.OpenSSL.Light`.
- If a newly installed tool isn't found, open a new PowerShell window (so it picks up the updated `PATH`) and run the setup again.
- If MongoDB has to be installed, its installer is about 750 MB, so that first run takes a while.

### MongoDB version

If a machine already has MongoDB, of any version, setup and the start/stop scripts use it as is.

Only when a machine has **no** MongoDB does setup install one, and then it installs the **8.0** long-term-support line:

| Platform | Where the version for new installs is set | Current value |
|----------|-------------------------------------------|---------------|
| macOS | `MONGO_INSTALL_FORMULA` in `scripts/setup.sh` | `mongodb-community@8.0` (Homebrew installs the newest 8.0.x patch) |
| Windows | `$MongoInstallVersion` in `scripts/setup.ps1` | `8.0.32` |

---

## Running the App

### Start everything (MongoDB + API + frontend)

The app includes a login-gated backend (Express + MongoDB), so the easiest way to run everything is the bundled start script. It first checks that Node matches the version `package.json` requires (`engines`) and that every npm package is installed at the version in `package-lock.json`. If either check fails, for example after pulling changes that need a newer Node or add a package, it stops and tells you what to do. It then starts MongoDB if it isn't already running (`brew services` on macOS, the `MongoDB` Windows service on Windows), then starts the Vite frontend and the Express API together:

```bash
npm run start:all        # macOS
npm run start:all:win    # Windows
```

The app will be available at **https://localhost:3000** and the API at **http://localhost:4000**. Press `Ctrl+C` to stop the frontend and API.

To stop everything (frontend, API, and MongoDB):

```bash
npm run stop:all         # macOS
npm run stop:all:win     # Windows
```

| Task | macOS | Windows |
|------|-------|---------|
| One-time setup | `npm run setup` → `scripts/setup.sh` | `npm run setup:win` → `scripts/setup.ps1` |
| Start everything | `npm run start:all` → `scripts/start.sh` | `npm run start:all:win` → `scripts/start.ps1` |
| Stop everything | `npm run stop:all` → `scripts/stop.sh` | `npm run stop:all:win` → `scripts/stop.ps1` |
| Re-seed sample users | `npm run seed` | `npm run seed` |

### Sample login

The app is login-gated. Use one of these seeded accounts, or sign up your own at `/signup`:

| Email | Password | Notes |
|-------|----------|-------|
| `alice@example.com` | `hunter2pass` | Has 2 pets in the Test Pet Store |
| `bob@example.com` | `hunter2pass` | Empty Test Pet Store |

### Development server only (frontend + API, no MongoDB check)

If MongoDB is already running, you can skip the start script and just run:

```bash
npm run dev
```

This starts the Vite frontend and Express API together via `concurrently`.

### Production build

```bash
npm run build      # Compiles and bundles output to /dist
npm run preview    # Serves the built output on a local static server
```

---

## What the App Does

The playground is a React Router app with two kinds of practice targets:

**1. The 27-section playground (`/`, login required)**

- A **fixed sidebar** on the left with collapsible grouped navigation. Click a group header to expand or collapse it. The **Advanced → Data & Tables** sub-group demonstrates nested menu navigation to the Pagination Table. The active section is highlighted as you scroll.
- A **scrollable content area** on the right with 27 independent sections, each covering one interaction type.
- Each section is self-contained and designed around a single testing concern:
  - One interaction type per section — no mixed responsibilities
  - Deliberate, stable locator attributes (`id`, `data-testid`, `data-row-id`, etc.) on every interactive element
  - Visible state feedback after every interaction — output messages, event logs, counters — so assertions have clear targets
  - No external API calls from within these 27 sections — they work entirely offline once installed

**2. Auth + Test Pet Store + feature pages (`/login`, `/signup`, `/forgot-password`, `/account`, `/petstore`, `/media`, `/frames`, `/spreadsheet`, `/verification`, `/controls`, `/navigation`, `/data`, `/interactions`, `/live`, `/browser`)**

- The whole app is login-gated: opening any URL while logged out redirects to `/login`.
- **Login** (`/login`) — email + password, show/hide password toggle, "Remember me" (persists the session in `localStorage`; unchecked uses `sessionStorage`), and a "Forgot password?" link.
- **Signup** (`/signup`) — name, email, password, confirm password, terms checkbox, with inline field-level validation.
- **Forgot password** (`/forgot-password`) — a UI-only stub: the backend endpoint always responds `{ ok: true }` and no email is actually sent.
- **Account** (`/account`) — shows the logged-in user's name, email, and member-since date, with a logout button and a shortcut into the Test Pet Store.
- **Test Pet Store** (`/petstore`) — reached from the gradient "🐾 Test Pet Store" entry at the top of the sidebar. Full pet CRUD (add / edit / delete), status filtering (available / pending / sold), live stat tiles, and toast notifications on every mutation. Pets are persisted in MongoDB and scoped per-user — each account only ever sees its own pets.
- **Pages group** — below the Test Pet Store entry, a collapsible **Pages** group (`data-testid="nav-pages-toggle"`, open by default) holds the entries for Media, Frames, Spreadsheet, Verification, Controls, Navigation, Data, Interactions, Live and Browser, in that order.
- **Media** (`/media`) — reached from the blue "🎬 Media" entry, the first one in the sidebar's Pages group. Nine widgets (M1–M9) for images, videos and banners; see [Media Page Reference](#media-page-reference). Works offline: the test image and video are bundled from `src/testresources/`.
- **Frames** (`/frames`) — reached from the green "🪟 Frames" entry under Media in the sidebar. Six widgets (F1–F6) for iframes; see [Frames Page Reference](#frames-page-reference).
- **Spreadsheet** (`/spreadsheet`) — reached from the "📊 Spreadsheet" entry under Frames in the sidebar. One widget so far (S1), an upload-to-table widget backed by the API; see [Spreadsheet Page Reference](#spreadsheet-page-reference).
- **Verification** (`/verification`) — reached from the "🛡️ Verification" entry under Spreadsheet in the sidebar. Five widgets (V1–V5): CAPTCHA, checkbox CAPTCHA, OTP, selfie and ID-card OCR, backed by the API; see [Verification Page Reference](#verification-page-reference).
- **Controls** (`/controls`) — "🎛️ Controls" in the Pages group. Eight widgets (C1–C8) for custom form controls; see [Controls Page Reference](#controls-page-reference).
- **Navigation** (`/navigation`) — "🧭 Navigation" in the Pages group. Six widgets (N1–N6) for menus, breadcrumbs, a drawer and leaving the page; see [Navigation Page Reference](#navigation-page-reference).
- **Data** (`/data`) — reached from the orange "🗂️ Data" entry under Navigation in the sidebar. Seven widgets (D1–D7) for tables, trees, charts, late-loading content and long lists; see [Data Page Reference](#data-page-reference). Works offline: all data is built into the page.
- **Interactions** (`/interactions`) — "🖐️ Interactions" in the Pages group. Four widgets (I1–I4): resizing, a sortable grid, a command palette, the clipboard; see [Interactions Page Reference](#interactions-page-reference).
- **Live** (`/live`) — "⏱️ Live" in the Pages group. Four widgets (L1–L4) that change on their own; see [Live Page Reference](#live-page-reference).
- **Browser** (`/browser`) — "🌐 Browser" in the Pages group. Three widgets (B1–B3): nested and closed Shadow DOM, permission prompts, full screen; see [Browser Page Reference](#browser-page-reference).

---

## Section Reference

| # | Section | What to Practise | Primary Locator |
|---|---------|-----------------|-----------------|
| 01 | Text Input | Type text, click a button, assert output | `id` |
| 02 | Password & Textarea | Toggle visibility, type multi-line text | `id`, `className` |
| 03 | Date Picker | Select a single date, select a date range | `id` |
| 04 | Range Slider | Move slider, assert the displayed value | `id` |
| 05 | File Upload | Browse files, drag-and-drop files onto zone | `id` |
| 06 | Form Validation | Submit with invalid data, assert error messages | `placeholder`, `aria-label` |
| 07 | Checkboxes | Check/uncheck items, assert selection summary | `label[for]` |
| 08 | Radio Group | Select one option, assert the selected plan | `name` attribute |
| 09 | Dropdown & Tags | Select from native dropdown, toggle tag buttons | `id`, `data-tag` |
| 10 | Click Counter | Click buttons, assert individual and total counts | `className` |
| 11 | Double Click | Single-click, double-click, right-click | `data-testid` |
| 12 | Dynamic Buttons | Observe loading states, appear/disappear, add/remove | `id`, `data-dynamic-id` |
| 13 | Mouse Hover | Hover over cards, assert tooltip visibility | `data-testid` |
| 14 | Focus / Blur | Tab through fields, assert focus/blur events logged | `id` |
| 15 | Drag & Drop | Drag items to reorder, assert new positions | `data-drag-id` |
| 16 | Browser Popups | Trigger alert, prompt, and confirm dialogs | `id` |
| 17 | Links & Windows | Click anchor, external, download, JS-opened tab/window | `id`, `href`, `target` |
| 18 | *(moved)* | The iFrame section now lives on the [Frames page](#frames-page-reference) as F1. Number 18 is left unused so the other section numbers stay the same. | — |
| 19 | Shadow DOM | Type into and read from an encapsulated shadow root | `data-testid`, shadow root |
| 20 | Pagination Table | Search, paginate, assert row data | `id`, `data-row-id`, `data-page` |
| 21 | Show / Hide & Tabs | Expand/collapse panels, switch tabs, assert content | `className`, `role` |
| 22 | Popup Alerts | Trigger warning, error, and exception modals, assert visibility and dismiss | `id`, `role` |
| 23 | Conditional Fields | Reveal hidden fields with a checkbox, then fill and assert them | `id`, `data-testid` |
| 24 | Delayed Widget | Wait for a widget that loads 1–6 s (random) after the page. Wait for `data-state="loaded"` on `[data-testid="delayed-widget"]`; `data-delay-ms` gives the delay picked. Add `?delay=<ms>` to the URL for a fixed delay. **Reload** repeats with a new delay. | `data-testid`, `data-state` |
| 25 | Ratings | Rate with radio-input stars, a half-star slider (hover previews, click commits, arrow keys / Home / End) and read a read-only rating. Assert `aria-valuenow` / `data-value`, not colours | `name`, `role="slider"`, `data-value` |
| 26 | Progress Bar | Start an upload bar that fills in random steps and wait for `aria-valuenow="100"`; tick **Stall at 60% and fail** to wait for `data-state="failed"`; cancel; run an indeterminate task that has no `aria-valuenow` until done | `role="progressbar"`, `aria-valuenow`, `data-state` |
| 27 | Stepper | 4-step wizard: per-step validation errors, Back, jump back via the step indicator, review page, submit, start over | `id`, `data-step`, `data-state`, `aria-current` |
| 28 | Signature Pad | Draw on a canvas with mouse down/move/up (touch and pen work too), undo, clear, save as PNG. A single click is rejected as too short | `data-empty`, `data-strokes` |

---

## Auth & Test Pet Store Reference

### Pages & routes

| Route | Access | Purpose |
|-------|--------|---------|
| `/login` | Public | Email + password, remember-me, forgot-password link |
| `/signup` | Public | Name, email, password, confirm, terms |
| `/forgot-password` | Public | Stub — always confirms, no email sent |
| `/` | Protected | The 27-section playground |
| `/account` | Protected | Logged-in user's profile + logout |
| `/petstore` | Protected | Test Pet Store — pet CRUD |
| `/media` | Protected | Media page — images, videos, banners |
| `/frames` | Protected | Frames page — basic, nested, late-loading and multiple iframes |
| `/verification` | Protected | Verification page — CAPTCHA, checkbox CAPTCHA, OTP, selfie, ID-card OCR |

### Backend API (Express + MongoDB, `http://localhost:4000`)

| Method & Path | Auth | Description |
|---|---|---|
| `POST /api/auth/signup` | — | `{ name, email, password }` → `{ user, token }`; `409` on duplicate email |
| `POST /api/auth/login` | — | `{ email, password }` → `{ user, token }`; `401` on bad credentials |
| `POST /api/auth/forgot-password` | — | `{ email }` → always `{ ok: true }` (stub) |
| `GET /api/auth/me` | Bearer token | Returns the current user |
| `POST /api/auth/logout` | Bearer token | `{ ok: true }` (JWT is stateless — client discards the token) |
| `GET /api/pets?status=` | Bearer token | List the current user's pets, optional status filter |
| `POST /api/pets` | Bearer token | Create a pet |
| `GET /api/pets/:id` | Bearer token | Fetch one pet (`404` if not owned) |
| `PUT /api/pets/:id` | Bearer token | Update a pet (`404` if not owned) |
| `DELETE /api/pets/:id` | Bearer token | Delete a pet (`404` if not owned) |
| `POST /api/spreadsheets/parse` | Bearer token | Multipart upload, one file in the `file` field → `{ fileName, sheets: [{ name, headers, rows }] }`; see [Spreadsheet Page Reference](#spreadsheet-page-reference) for limits and errors |
| `GET /api/verification/captcha?mode=test&ttl=` | Bearer token | New CAPTCHA → `{ id, image, expiresIn, testMode }`; `image` is an SVG data URL. `mode=test` makes the answer `TEST42`; `ttl` is seconds (5–600, default 120) |
| `POST /api/verification/captcha/verify` | Bearer token | `{ id, answer }` → `{ ok, bypassed }`; header `X-Captcha-Test-Key: playground-test-key` always passes. Each CAPTCHA can be answered once; `400` wrong/unknown, `410` expired |
| `POST /api/verification/otp/send?ttl=&cooldown=` | Bearer token | `{ phone }` (8–15 digits) → `{ sentTo, expiresIn, resendIn }`; `429` with `retryAfter` during the resend cooldown. Defaults: 300 s expiry, 30 s cooldown |
| `POST /api/verification/otp/verify` | Bearer token | `{ code }` → `{ verified, phone }`; `400` wrong (with `attemptsLeft`), `410` expired, `429` after 3 wrong codes |
| `GET /api/verification/dev-inbox` | Bearer token | `{ messages: [{ id, to, text, code, sentAt }] }`, newest first, last 20 — the current user's "sent" OTP messages |
| `DELETE /api/verification/dev-inbox` | Bearer token | Empties the current user's dev inbox (`204`) |
| `POST /api/verification/selfie` | Bearer token | Multipart, PNG or JPEG in the `file` field (2 MB max) → `{ received, type, bytes }`; nothing is stored |
| `POST /api/verification/ocr?delay=` | Bearer token | Multipart, PNG or JPEG in the `file` field → `{ sample, documentType, fields: [{ key, value, confidence }] }` for the sample cards; `422` for any other image. `delay` in ms (default 1500) |

Passwords are hashed with bcrypt before storage; access tokens are JWTs valid for 24 hours.

---

## Media Page Reference

Every widget exposes its state as a `data-state` attribute, so wait on the attribute instead of sleeping. Each one also shows its state as text in an output line below it. There are no URL settings — each widget always behaves the same way.

| # | Widget | What to Practise | Key attributes |
|---|--------|-----------------|----------------|
| M1 | Image — Loads | Wait for an image to load, check its natural size | `data-testid="image-loaded"`, `data-state`: `loading` → `loaded` |
| M2 | Image — Broken | Detect an image whose file doesn't exist; a fallback replaces it | `data-testid="image-broken"`, `data-state`: `loading` → `broken` |
| M3 | Image — Lazy Load | Scroll inside a box to bring the image into view; it has no `src` until then | `data-testid="image-lazy"`, `data-state`: `idle` → `loading` → `loaded` |
| M4 | Video — Plays | Play, pause, mute/unmute with custom buttons; read the time | `data-testid="video-playing"`, `data-state`, `data-muted` |
| M5 | Video — Broken | Detect a video whose file doesn't exist; buttons are disabled | `data-testid="video-broken"`, `data-state="error"` |
| M6 | Video — Lazy Load | Scroll inside a box to load the video, then play it | `data-testid="video-lazy"`, `data-state`: `idle` → `loading` → `ready` → … |
| M7 | Hero Carousel | Move between 3 slides with previous/next/dots; wraps around; no autoplay | `data-testid="hero-carousel"`, `data-active-slide` (1–3) |
| M8 | Promo Banner | Claim the offer to reveal a code; close it; show it again. Closing is not remembered across reloads | `data-testid="promo-banner"` |
| M9 | Announcement & Cookie Banners | Close the announcement bar; accept/reject the cookie banner, which blocks the whole page until you choose. Both choices survive a reload; **Reset banners** clears them | `data-testid="announcement-bar"`, `data-testid="cookie-banner"` |

**Video `data-state` values:** `idle` (lazy video not revealed yet) · `loading` · `ready` (loaded, not started) · `playing` · `paused` · `ended` · `error`. `data-muted` is `true` or `false`.

**Banner storage:** the announcement bar and cookie banner store their state in `localStorage` under `tp-media-announcement-dismissed` (`"true"`) and `tp-media-cookie-consent` (`"accepted"` / `"rejected"`). A fresh browser context always shows both banners. To skip the cookie banner in a test, set the key before the page loads (see the [Media page notes](#media-page)).

**Media files:** `src/testresources/testimage.jpg` and `src/testresources/testvideo.mp4`. Vite adds a content hash to their file names, so check `data-state`, not the `src` path. The broken widgets point to `/testresources/missing-image.jpg` and `/testresources/missing-video.mp4`, which don't exist.

---

## Frames Page Reference

All frames use `srcdoc`, so they are same-origin and work offline. Inside every frame there is an input, a **Read** button and a result line: clicking **Read** writes `<prefix><what you typed>` into the result.

| # | Widget | What to Practise | Frame locator → inner ids |
|---|--------|-----------------|---------------------------|
| F1 | Basic iFrame | Switch into one frame (moved from main-page section 18, locators unchanged) | `#practice-iframe` → `#iframe-input`, `#iframe-btn`, `#iframe-result` (`Value: …`) |
| F2 | Nested iFrames | Switch down three levels, then back up with `parentFrame()` / `defaultContent()` | `#nested-level-1` → `#nested-level-2` → `#nested-level-3`; inside level *n*: `#level{n}-input`, `#level{n}-btn`, `#level{n}-result` (`Level n: …`) |
| F3 | Late-loading iFrame | Wait for a frame that is added 1–6 s after the page loads. `?delay=<ms>` fixes the delay; **Reload frame** removes it and adds it again | `[data-testid="late-frame-slot"]` (`data-state`: `loading` → `loaded`, `data-delay-ms`) → `#late-iframe` → `#late-input`, `#late-btn`, `#late-result` (`Value: …`) |
| F4 | Multiple iFrames without ids | Pick the right frame when none has an id and all three share the same inner ids | `iframe[name="orders-frame"]`, `iframe[title="Payments frame"]`, and the third by index only (`#sec-frames-multiple iframe` → `nth(2)`) → `#frame-input`, `#frame-btn`, `#frame-result` (`Orders: …` / `Payments: …` / `Reviews: …`) |
| F5 | Expand-button only | A card that ignores clicks inside its frame and on the card; only **⤢ Expand** opens it | `#button-only-iframe` → `#button-only-input`, `#button-only-btn`, `#button-only-result` (`Value: …`) |
| F6 | Cross-origin iFrame | Switch into a frame from another origin (the API, port 4000); send messages both ways with `postMessage`; see that the page can't read the frame's DOM. Expands only from **⤢ Expand** | `[data-testid="xo-frame-slot"]` (`data-state`: `loading` → `ready`, or `unreachable`) → `#cross-origin-iframe` → `#xo-input`, `#xo-btn`, `#xo-result` (`Value: …`), `#xo-send`, `#xo-inbox`, `#xo-origin` |

**Expanding a card:** each card has `data-expand-on` set to `click` or `button`, and `data-expanded="true|false"`.

- **F1–F4 (`data-expand-on="click"`)** expand when you press anywhere inside one of their frames, click the card itself, or click **⤢ Expand** (`data-testid="{section-id}-toggle"`). Events inside a frame never reach the page, so each frame tells the page about presses with `window.top.postMessage({ type: 'tp-frame-click', card: '<section id>' }, '*')`. This works from every nesting level in F2. The press still reaches the element it landed on, so a test can click the input, let the card expand, and keep typing.
- **F5 and F6 (`data-expand-on="button"`)** expand only from **⤢ Expand**. Their frames don't report presses, and clicking the card does nothing.

The card element stays the same when it expands, so frames don't reload and what you typed stays put. Close it with **✕ Close**, the backdrop (`data-testid="frame-backdrop"`) or `Escape` (Escape only works while focus is outside the frame).

**Language switch:** switching English ↔ Arabic rebuilds each frame's content, which reloads all frames and clears what was typed in them.

**Cross-origin frame (F6):** the frame page comes from the API at `http://<same host>:4000/frames/cross-origin`, so its origin differs from the app's (`https://localhost:3000`). The page gets `contentDocument === null` for it (**Try to read the frame** shows this), but test tools can still switch into it. The frame says it's ready with `postMessage`; if that doesn't arrive within 5 s the slot shows `data-state="unreachable"` (usually the API isn't running). **Send to page** posts the frame's text to the page (`#xo-status` shows it); **Send to frame** posts `#xo-page-input` to the frame (`#xo-inbox`). Browsers allow an `http://localhost` frame inside an `https://localhost` page, but if you open the app from another machine by IP address the frame is blocked as mixed content. If the API runs on another port, add `?apiPort=<port>` to `/frames`.

---

## Spreadsheet Page Reference

| # | Widget | What to Practise | Key attributes |
|---|--------|-----------------|----------------|
| S1 | Excel Upload Table | Upload a file through a hidden file input, wait for the table to fill, pick a sheet, search, page through rows, clear, and check error messages | `#sec-sheet-upload` with `data-state`, `data-sheet`, `data-row-count` |

**How S1 works:** the widget starts with an empty table. Uploading a file sends it to `POST /api/spreadsheets/parse`, which reads every sheet and returns them all in one response. The first row of each sheet becomes the column headers; blank headers become `Column N` and repeated ones become `Name (2)`, `Name (3)`. Fully blank rows are dropped, and every cell comes back as the text Excel shows (dates as dates, not serial numbers). The sheet dropdown appears only when the file has more than one sheet; switching sheets needs no new request. A new upload replaces the table; **Clear** empties it.

**`data-state` values:** `empty` → `uploading` → `loaded`, or `error`. A failed upload shows the message in `#sheet-error` and leaves the table that was already showing as it was.

**Search and pagination:** search matches any cell (case-insensitive) and returns to page 1; 10 rows per page; up to 7 page-number buttons are shown at once. `data-row-index` is the row's position in the sheet (1 = first row under the headers) and doesn't change while a search is filtering.

**Limits and errors** (checked on the server; the page also checks type and size before uploading):

| Check | Status | Message |
|---|---|---|
| Not `.xlsx` / `.xls` / `.csv` | 400 | Only .xlsx, .xls and .csv files are accepted. |
| File content doesn't match its extension (e.g. an image renamed `.xlsx`) | 400 | This file is not a valid .xlsx spreadsheet. |
| CSV that isn't UTF-8 text | 400 | CSV files must be UTF-8 text. |
| No file, more than one file, extra fields, or a field other than `file` | 400 | (specific message) |
| File over 2 MB | 413 | The file is larger than 2 MB. |
| `.xlsx` that would unpack to more than 50 MB (ZIP bomb) | 413 | The spreadsheet expands to more than 50 MB when unpacked. |
| Unreadable file | 422 | The spreadsheet could not be read. |
| More than 10 sheets / 5,000 rows in a sheet / 100 columns | 422 | (names the limit) |
| No data in any sheet | 422 | The spreadsheet has no data. |
| Not logged in | 401 | Missing or invalid Authorization header |

**Upload security:** the file stays in memory and is never written to disk, and its name is only echoed back as text. SheetJS reads values only (no formulas, HTML, styles or macros). Rows are returned as arrays of strings rather than objects keyed by header, so a header like `__proto__` is just text, and React shows every cell as plain text, so cells containing `<script>` or HTML are never run. Not included, since this is a local practice app: rate limiting, reading files in a separate worker with a timeout, and spreadsheet formula-injection escaping (only relevant once a widget exports data).

**Test files** in `src/testresources/spreadsheets/`:

| File | What it shows |
|---|---|
| `employees.xlsx` | 3 sheets: Employees (42 rows), Departments (6), Projects (12) — dropdown, search, pagination |
| `inventory.xls` | Older Excel format, one sheet (15 rows) |
| `products.csv` | CSV with quoted commas, quotes and non-ASCII text (18 rows) |
| `messy-headers.xlsx` | Blank and repeated headers, blank rows, dates, a short row |
| `headers-only.csv` | Headers but no rows — table shows the headers and "This sheet has headers but no rows" |
| `script-cells.xlsx` | `<script>`/HTML cells, formulas, `__proto__` header — all shown as plain text |
| `empty.xlsx` | 422, no data |
| `corrupt.xlsx` | 422, starts like an `.xlsx` but isn't one |
| `renamed-image.xlsx` | 400, a PNG with an `.xlsx` extension |
| `too-many-rows.csv` | 422, 5,001 rows |
| `too-large.csv` | Over 2 MB — the page rejects it before uploading; sent straight to the API it gets 413 |

There's no ZIP-bomb test file on purpose, since one can upset editors and virus scanners.

---

## Verification Page Reference

Each widget has its own `data-state` on its card and works on its own. All state lives in the API's memory, so restarting the API clears CAPTCHAs, codes and the dev inbox. None of this is real security; each widget gives tests a documented way through, the way real teams test these flows.

| # | Widget | What to Practise | Key attributes |
|---|--------|-----------------|----------------|
| V1 | Image CAPTCHA | A form guarded by a CAPTCHA drawn as an image. Get through it with the test mode or the test key (below), not by reading the image. A wrong answer loads a new CAPTCHA; it expires after 2 min | `#sec-verify-captcha` `data-state`: `loading` → `ready` → `verifying` → `passed` (or `expired`, `error`) |
| V2 | Checkbox CAPTCHA | An "I'm not a robot" checkbox inside an iframe. Switch into the frame, click it, wait ~1.2 s for `aria-checked="true"`, switch back; the frame posts a token to the page, which enables **Submit** | `#robot-frame` → `#robot-checkbox` (`role="checkbox"`, `data-state`: `unchecked` → `checking` → `checked`); card `data-state`: `unchecked` → `verified` → `sent` |
| V3 | One-Time Code | Send a code to a phone number, read it from the dev inbox, type it into six boxes. Practise auto-advance, Backspace, paste, wrong codes (3 locks it), expiry and the resend cooldown | `#sec-verify-otp` `data-state`: `idle` → `sent` → `verifying` → `verified` (or `locked`, `expired`); `[data-testid="otp-input"]` `data-value`; inbox `li[data-code]` |
| V4 | Selfie | Start the camera, take a photo, retake, submit. Grant or deny camera permission, feed a fake camera, or upload a photo when there is no camera | `#sec-verify-selfie` `data-state`: `idle` → `requesting` → `live` → `captured` → `uploading` → `uploaded` (or `denied`, `unavailable`) |
| V5 | ID Card OCR (simulated) | Upload an ID card; fields fill in. Fields under 80% confidence are flagged; fix them and confirm. Empty fields block **Confirm** | `#sec-verify-ocr` `data-state`: `idle` → `reading` → `done` → `confirmed` (or `error`); each field has `data-confidence`, `data-low-confidence`, `data-edited` |

**URL settings** (add to `/verification`, combine with `&`):

| Setting | Effect |
|---|---|
| `?captcha=test` | V1 shows a **Test mode** badge and every CAPTCHA's answer is `TEST42` |
| `?captchaTtl=<s>` | V1 CAPTCHAs expire after `<s>` seconds (5–600) |
| `?otpTtl=<s>` | V3 codes expire after `<s>` seconds (5–3600) |
| `?otpCooldown=<s>` | V3 resend waits `<s>` seconds (0–600) |
| `?ocrDelay=<ms>` | V5 reading takes `<ms>` milliseconds (0–10000, default 1500) |

**Why CAPTCHA has bypasses:** a real CAPTCHA exists to stop automation, so tests should never try to solve one. Real providers give test keys that always pass, and teams turn CAPTCHA off in test environments. V1 copies both: `?captcha=test` (works from any tool, including Selenium) and the `X-Captcha-Test-Key: playground-test-key` header (set it with request interception). The key can be changed with `CAPTCHA_TEST_KEY` in `server/.env`. The image is an SVG data URL, so the letters are not in the page's DOM.

**Why OCR is simulated:** real OCR gives slightly different text from run to run, which makes assertions flaky. The server instead recognises the three sample cards in `src/testresources/ocr/` by their content (sha256), so renaming them is fine but editing them breaks the match. Their answers are in `server/fixtures/ocr.js`:

| File | What it shows |
|---|---|
| `id-clean.png` | Every field read with 96–99% confidence |
| `id-blurry.png` | Low confidence on most fields, and the ID number misread as `PG-5O93-1182` (letter O instead of zero). Correct it to `PG-5093-1182` |
| `id-partial.png` | A sticky note covers the expiry date, so it comes back empty with "Not found on the card" |
| any other PNG/JPEG | `422`: "No document could be read from this image" |

The sample cards say "SAMPLE – NOT A REAL DOCUMENT" and use made-up names. The page links to all three for download.

---

## Data Page Reference

Every widget keeps its state in attributes (`aria-sort`, `aria-checked`, `aria-busy`, `data-state`, `data-loaded`, `data-rendered`…), so wait on those instead of sleeping. Each one also shows its state as text in an output line below it. All data is built into the page; nothing calls the API.

| # | Widget | What to Practise | Key attributes |
|---|--------|-----------------|----------------|
| D1 | Sortable table with inline edit | Sort by clicking headers (click again to reverse), double-click a salary to edit it (Enter saves, Escape cancels, blur saves or cancels if invalid), open detail rows with ▸ | `th[data-key][aria-sort]`, `tr[data-row-id]`, `td[data-col]`, `#salary-edit-{id}`, `[data-testid="row-expand-{id}"]` |
| D2 | Tree view with checkboxes | Check a folder to check everything inside it; read the indeterminate (half-checked) state; expand/collapse folders | `[role="treeitem"][data-path]`, checkbox `aria-checked="mixed"` / `data-state` |
| D3 | Chart with hover tooltips | Hover or focus an SVG bar to show its tooltip; read the value from attributes, not pixels | `[data-testid="bar-chart"] rect[data-month][data-value]`, `#chart-tooltip` |
| D4 | Skeleton loader, avatar and badges | Wait for placeholders to be replaced by the real card (2 s), then read the badges | `[data-testid="profile-card"]` `aria-busy`, `data-state`: `loading` → `loaded`; `.data-badge[data-status][data-count]` |
| D5 | Infinite scroll list | Scroll to the bottom of the box to load 20 more rows, up to 100 | `[data-testid="infinite-list"]` `data-loaded`, `data-state`: `idle` → `loading` → … → `end` |
| D6 | Virtualised list | 10,000 rows, but only the visible ones (plus 4 spare each side) exist in the DOM. Scroll or jump to a row before locating it | `[data-testid="virtual-list"]` `data-total`, `data-rendered`, `data-first-visible`; rows `[data-index]` (1-based) |
| D7 | Back-to-top button | Scroll the box past 150 px to show the button, click it, wait for `scrollTop` to reach 0 | `#backtotop-box[data-scroll-top]`, `#back-to-top` (only in the DOM when shown) |

**URL settings** (add to `/data`, combine with `&`):

| Setting | Effect |
|---|---|
| `?skeletonDelay=<ms>` | D4 swaps in the real card after `<ms>` milliseconds (0–10000, default 2000) |
| `?scrollDelay=<ms>` | D5 waits `<ms>` milliseconds before each new batch of rows (0–10000, default 700) |

**D1 data:** 8 employees with fixed ids 1–8. Sorting compares names and departments as text, start dates as ISO dates, and salaries as numbers. A salary must be a whole number from 1 to 1,000,000; anything else shows `#data-table-error` and keeps the cell in edit mode. **Reset** restores the original rows and clears sorting.

**D2 states:** each checkbox has `data-state` set to `checked`, `unchecked` or `mixed`. `mixed` is the indeterminate state: the browser shows a dash, `aria-checked="mixed"` is set, and the DOM property `indeterminate` is `true`. There is no HTML attribute for it, so `isChecked()` alone can't tell you about it. Two tests (`login.spec.ts`, `signup.spec.ts`) start checked.

**D3 data:** sign-ups for Jan–Oct 2026: 420, 380, 510, 640, 590, 720, 810, 760, 880, 950. `data-month` is always the English short month name, even in Arabic.

---

## Controls Page Reference

Custom form controls that don't behave like plain inputs. Every widget shows its state in an output line and in attributes on its card. Nothing calls the API.

| # | Widget | What to Practise | Key attributes |
|---|--------|-----------------|----------------|
| C1 | Autocomplete combobox | Type to search countries; options arrive after 400 ms. Pick with ↑/↓ + Enter or a click; Escape closes the list | `#combo-input[role="combobox"]` (`aria-expanded`, `aria-activedescendant`), `#combo-listbox [role="option"][data-value]`; card `data-state`: `idle` → `loading` → `open` → `selected`, `data-selected` |
| C2 | Multi-select with chips | Add up to 5 skills (Enter or click), remove with ✕ or Backspace in the empty input; a 6th shows an error | `[data-testid="chip"][data-value]`, `[data-testid="chip-remove-{slug}"]`, `#chips-input`, `#chips-listbox`, `#chips-error`; card `data-count` |
| C3 | Toggle switches | Flip `role="switch"` buttons (not checkboxes); one is disabled and stays on | `#switch-email / -sms / -digest / -beta` with `aria-checked`; card `data-on` |
| C4 | Number stepper | − / + between 0 and 10 (buttons disable at the limits), ↑/↓ in the box, typed values clamped on Enter or blur | `#stepper-dec`, `#stepper-input`, `#stepper-inc`; card `data-value` |
| C5 | Colour picker | Set the native picker's value, type a hex code, or click a swatch | `#color-input[type="color"]`, `#color-hex`, `#color-apply`, `[data-color]` swatches (`aria-pressed`), `#color-error`; card `data-color` |
| C6 | Time and date-time pickers | Fill native pickers with ISO values; time must be 09:00–17:00, date in 2026 | `#time-input`, `#datetime-input`, `#time-error`, `#datetime-error`; card `data-time`, `data-datetime`, `data-valid` |
| C7 | Rich text editor | Type into a `contenteditable` area, select text, format it from the toolbar, assert the HTML | `#rte[contenteditable]`, `[data-cmd="bold|italic|underline|insertUnorderedList|insertOrderedList"]` (`aria-pressed`), `#rte-clear`, `#rte-html` |
| C8 | Masked inputs | Phone, card and amount fields that format as you type; the card field detects the brand and runs a Luhn check | `#mask-phone`, `#mask-card` (`data-brand`, `data-valid`), `#mask-amount`, each with `data-raw`; `#mask-card-error` |

**URL setting:** `?comboDelay=<ms>` sets how long C1's options take to arrive (0–10000, default 400).

**C8 formats:** phone `(555) 123-4567`, `data-raw="5551234567"`. Cards group as `4242 4242 4242 4242`, or `3782 822463 10005` for Amex (`34…`/`37…`). `data-brand` is `visa`, `mastercard`, `amex` or `unknown`. `data-valid` is empty until the number is complete, then `true` or `false` (Luhn). The amount fills from the right like a till: typing `123456` shows `$1,234.56`, `data-raw="1234.56"`.

---

## Navigation Page Reference

| # | Widget | What to Practise | Key attributes |
|---|--------|-----------------|----------------|
| N1 | Accordion | Open one panel at a time (or several, after ticking the box); closed panels stay in the DOM with `hidden`. ↑/↓, Home and End move between headers | `#acc-btn-{shipping|returns|warranty|payments}` (`aria-expanded`, `aria-controls`), `#acc-panel-{key}[role="region"]`, `#acc-multi`; card `data-open` |
| N2 | Breadcrumbs | Open folders, go back up by clicking a crumb, use the browser's Back button and reload; the folder lives in the URL | `?folder=Home/Projects/Website`; `[data-crumb-depth]`, `[aria-current="page"]` (current crumb), `[data-folder]` links; card `data-path` |
| N3 | Custom context menu | Right-click the file (or Shift+F10) for the app's own menu; Paste is disabled until Copy; Escape or an outside click closes it | `[data-testid="context-zone"]`, `#context-menu[role="menu"]`, `[role="menuitem"][data-action]` (`aria-disabled`); card `data-menu-open` |
| N4 | Menu with a submenu | Open a menu button, move with arrow keys, open Export's submenu with → or hover, pick an item; Escape returns focus to the button | `#menu-btn` (`aria-expanded`), `#menu-list`, `#menu-item-{duplicate|archive|export|share}`, `#menu-sub-export`, `#menu-item-export-{csv|pdf|json}`; card `data-open`, `data-submenu-open` |
| N5 | Side drawer | Open a drawer that animates in for 250 ms, fill its filters, apply or close it (✕, backdrop, Escape) | `#drawer-open`, `[data-testid="drawer"]` (`data-state`: `closed` → `opening` → `open` → `closing` → `closed`), `#drawer-close`, `[data-testid="drawer-backdrop"]`, `#drawer-active`, `#drawer-archived`, `#drawer-owner`, `#drawer-apply` |
| N6 | Unsaved-changes guard | Edit the note, then leave by the card's link or the sidebar: an in-page dialog asks first. Closing or reloading the tab raises the browser's `beforeunload` dialog | `#guard-title`, `#guard-notes`, `#guard-save`, `#guard-leave-link`; card `data-dirty`; `[data-testid="leave-dialog"]` (`data-target`), `#leave-stay`, `#leave-save`, `#leave-discard` |

**N2 folders:** `Home` › `Projects` › `Website` › (`Design`, `Copy`) and `Mobile app` › `Release 2.4`; `Home` › `Reports` › (`Q3 2026`, `Q4 2026`); `Home` › `Settings`. An unknown `?folder=` falls back to `Home`. The sidebar's active link also has `aria-current="page"`, so scope that locator to `#sec-nav-breadcrumbs`.

**N6 scope:** the guard stops clicks on in-app links (`<a href>`) that leave the page, which covers the card's link and the sidebar's page entries. The sidebar's playground items are buttons, and the browser's own Back button isn't intercepted; both leave without asking. Links that stay on `/navigation` (the breadcrumbs) aren't blocked.

---

## Interactions Page Reference

| # | Widget | What to Practise | Key attributes |
|---|--------|-----------------|----------------|
| I1 | Resizable panels | Drag the divider (mouse down → move → up) between 20% and 80%; or ←/→ in 5% steps, Home, End; double-click resets to 35% | `#split-handle[role="separator"]` (`aria-valuenow`), `[data-testid="split"]`, `#pane-first`, `#pane-second`; card `data-size`, `data-dragging` |
| I2 | Sortable grid | Put tiles 1–9 in order. Drag a tile onto another to swap them (HTML5 drag and drop), or Space to pick up, arrows to move, Space to drop, Escape to cancel | `[data-tile="{n}"][data-pos="{1-9}"]` (`aria-pressed` while picked up), `#grid-reset`, `#grid-live`; card `data-order`, `data-sorted` |
| I3 | Command palette | Ctrl+K / ⌘+K opens it anywhere on this page; type to filter, ↑/↓, Enter runs, Escape closes and returns focus. Three commands do real things | `[data-testid="command-palette"]`, `#palette-input[role="combobox"]`, `[role="option"][data-command]`, `#palette-empty`, `#palette-open`; card `data-open`, `data-last-command`, `data-compact` |
| I4 | Copy to clipboard | Copy a command (button shows "Copied" for 2 s), then paste into the box to check it | `#copy-btn` (`data-state`: `idle` → `copied`/`failed` → `idle`), `#copy-source`, `#paste-target` |

**I2 start order:** `3 1 2 / 6 4 5 / 9 7 8`. A tile in its right place turns green. `data-order` is the full order, comma-separated; `data-sorted="true"` once it reads `1,2,…,9`.

**I3 commands:** `new-test`, `run-all`, `export-report` only record themselves. `toggle-compact` toggles `data-compact`, `switch-language` switches English ↔ Arabic, and `go-data` navigates to `/data`. The filter matches the visible (translated) labels.

---

## Live Page Reference

Everything on this page changes on its own. The timers use `Date.now()` with `setInterval`, so Playwright's `page.clock` can fast-forward them.

| # | Widget | What to Practise | Key attributes |
|---|--------|-----------------|----------------|
| L1 | Live order feed | A new order every 2 s at the top; only the newest 20 stay. Pause, resume, clear | `[data-testid="live-feed"] li[data-order-id][data-amount]`, `#feed-toggle` (`aria-pressed`), `#feed-clear`; card `data-state` (`live`/`paused`), `data-count` |
| L2 | Countdown timer | Start, pause, resume and reset a 30 s countdown; wait for it to finish | `[data-testid="countdown"][role="timer"]`, `#countdown-start`, `#countdown-pause`, `#countdown-reset`, `#countdown-done[role="alert"]`; card `data-state` (`idle`/`running`/`paused`/`done`), `data-remaining` |
| L3 | Moving target and rebuilt rows | Click a button that jumps every 1.5 s; click Buy on rows whose DOM nodes are replaced every 3 s | `[data-testid="moving-button"][data-clicks]`, `#mover-toggle`; `[data-testid="rerender-list"][data-version]`, `[data-testid="buy-{keyboard|mouse|monitor}"]` |
| L4 | Session-timeout warning | Start a 12 s session; at 6 s left a dialog asks to stay; ignore it to be signed out | `#session-start`, `[data-testid="session-modal"][role="alertdialog"]`, `#session-remaining`, `#session-stay`, `#session-signout`; card `data-session-state` (`idle`/`active`/`warning`/`expired`/`signed-out`), `data-remaining` |

**URL settings** (add to `/live`, combine with `&`):

| Setting | Effect |
|---|---|
| `?feedInterval=<ms>` | L1 adds an order every `<ms>` (200–60000, default 2000) |
| `?countdown=<s>` | L2 counts down from `<s>` seconds (1–3600, default 30) |
| `?moveInterval=<ms>` | L3's button moves every `<ms>` (200–10000, default 1500) |
| `?rerenderInterval=<ms>` | L3's rows are rebuilt every `<ms>` (200–60000, default 3000) |
| `?sessionLength=<s>` | L4's session lasts `<s>` seconds (3–600, default 12) |
| `?sessionWarn=<s>` | L4 warns when `<s>` seconds are left (1–600, default 6; always less than the length) |

**L1 data:** order *n* is `ORD-{5000+n}`, so the first three on load are `ORD-5001`–`ORD-5003`. Customers and amounts follow a fixed pattern, so the same id always has the same amount.

---

## Browser Page Reference

| # | Widget | What to Practise | Key attributes |
|---|--------|-----------------|----------------|
| B1 | Nested Shadow DOM with a slot | Reach an input two open shadow roots deep; read slotted light-DOM content; meet a closed shadow root you can't look into | `[data-testid="outer-host"]` ▸ shadow ▸ `[data-testid="inner-host"]` ▸ shadow ▸ `#deep-input`, `#deep-btn`, `#deep-output`; `[data-testid="slotted-title"]`; `[data-testid="closed-host"]` (closed); card `data-deep-value`, `data-closed-clicks` |
| B2 | Permission prompts | Ask for location and notification permission for real; grant or deny them from the test before the page asks | `#geo-btn`, `#geo-permission`, `#geo-result` (`data-lat`, `data-lng`), `#notify-permission`, `#notify-request`, `#notify-send`, `[data-permission][data-state]`; card `data-geo-state`, `data-notify-permission` |
| B3 | Full-screen mode | Enter full screen from a click, leave with Exit or Escape, and assert the state | `#fs-enter`, `#fs-box` (`data-fullscreen`), `#fs-exit` (only while full screen), `#fs-error`; card `data-fullscreen`, `data-changes` |

**B2 states:** `data-geo-state` is `idle` → `requesting` → `granted` / `denied` / `error` (or `unavailable`). `#geo-permission` and `#notify-permission` show the browser's own values: `prompt` / `granted` / `denied` for location, `default` / `granted` / `denied` for notifications. Headless Chromium always reports `Notification.permission` as `denied`, even after `grantPermissions(['notifications'])`, so run notification tests headed.

**B1 and the language switch:** switching English ↔ Arabic rebuilds both shadow roots, which clears what was typed inside them.

---

## Locator Quick Reference

A quick cheat sheet of the key element identifiers used across sections.

### By `id`

```
#first-name-input       Text input field (section 01)
#greet-btn              Greet button (section 01)
#greeting-output        Greeting result text (section 01)
#password-input         Password field (section 02)
#toggle-password-btn    Show/hide toggle (section 02)
#notes-textarea         Textarea (section 02)
#single-date            Date picker (section 03)
#range-from             Date range start (section 03)
#range-to               Date range end (section 03)
#qty-slider             Quantity slider (section 04)
#brightness-slider      Brightness slider (section 04)
#brightness-preview     Visual brightness output (section 04)
#file-upload-input      File input (section 05)
#val-email              Email field (section 06)
#val-phone              Phone field (section 06)
#val-password           Password field (section 06)
#email-error            Email validation error (section 06)
#phone-error            Phone validation error (section 06)
#password-error         Password validation error (section 06)
#validate-submit-btn    Form submit button (section 06)
#form-success           Form success message (section 06)
#country-select         Country dropdown (section 09)
#tag-selector           Tag multi-select container (section 09)
#btn-load               Loading state button (section 12)
#btn-disappear          Button that hides itself (section 12)
#btn-reappear           Button that reappears (section 12)
#btn-add-dynamic        Adds a new button (section 12)
#btn-alert              Triggers alert dialog (section 16)
#btn-prompt             Triggers prompt dialog (section 16)
#btn-confirm            Triggers confirm dialog (section 16)
#popup-result           Dialog result output (section 16)
#link-anchor            Same-page anchor link (section 17)
#link-newtab            External link (new tab) (section 17)
#link-download          Download link (section 17)
#btn-js-newtab          JS-opened new tab (section 17)
#btn-js-newwindow       JS-opened new window (section 17)
#employee-search        Table search input (section 20)
#employee-table         The data table (section 20)
#page-first             First page button (section 20)
#page-prev              Previous page button (section 20)
#page-next              Next page button (section 20)
#page-last              Last page button (section 20)
#page-info              Pagination info text (section 20)
#toggle-panel-btn       Expand/collapse button (section 21)
#collapsible-content    The collapsible panel (section 21)
#tab-content            Active tab content area (section 21)
#btn-warning-popup      Opens warning modal (section 22)
#btn-error-popup        Opens error modal (section 22)
#btn-exception-popup    Opens exception modal (section 22)
#popup-title            Modal title text (section 22)
#popup-message          Modal message / stack trace (section 22)
#popup-close-btn        Modal close (✕) button (section 22)
#popup-dismiss-btn      Modal dismiss button (section 22)
#delayed-load-time      "Loaded in X.X s" text, shown once loaded (section 24)
#btn-reload-widget      Reloads the widget with a new random delay (section 24)
#rating-star-{1..5}     Radio inputs of the product rating (section 25)
#rating-product-output  Product rating text (section 25)
#rating-product-clear   Clears the product rating (section 25)
#rating-half-output     Half-star rating text, or the hover preview (section 25)
#rating-half-clear      Clears the half-star rating (section 25)
#progress-upload        Upload progress bar, role="progressbar" (section 26)
#progress-upload-pct    "NN%" label (section 26)
#progress-upload-status Status text: not started / uploading / complete / failed / cancelled (section 26)
#progress-fail-toggle   Makes the next upload stall at 60% and fail (section 26)
#progress-start         Start / restart the upload (section 26)
#progress-cancel        Cancel a running upload (section 26)
#progress-indeterminate Indeterminate task bar (section 26)
#progress-task-start    Runs the 2–4 s background task (section 26)
#progress-task-status   Task status text (section 26)
#stepper-name           Step 1 name (section 27)
#stepper-email          Step 1 email (section 27)
#stepper-city           Step 2 city (section 27)
#stepper-country        Step 2 country <select>, values in / ae / gb / us (section 27)
#stepper-contact-email  Step 3 contact radio (section 27)
#stepper-contact-sms    Step 3 contact radio (section 27)
#stepper-newsletter     Step 3 newsletter checkbox (section 27)
#stepper-error-{field}  Validation error for name / email / city / country / contact (section 27)
#stepper-review         Step 4 summary <dl>; each <dd> has data-field (section 27)
#stepper-back           Back button (section 27)
#stepper-next           Next button, steps 1–3 (section 27)
#stepper-submit         Submit button, step 4 (section 27)
#stepper-result         Success message after submit (section 27)
#stepper-reset          Start over (section 27)
#signature-pad          Signature <canvas> (section 28)
#signature-undo         Removes the last stroke (section 28)
#signature-clear        Clears the pad (section 28)
#signature-save         Saves the pad as a PNG (section 28)
#signature-error        "Signature is too short" error (section 28)
#signature-output       Saved size and stroke count (section 28)
#signature-preview      <img> of the saved PNG (section 28)
```

### By `data-testid`

```
data-testid="click-area"            Double-click target (section 11)
data-testid="hover-info"            Info hover card (section 13)
data-testid="hover-warn"            Warning hover card (section 13)
data-testid="hover-success"         Success hover card (section 13)
data-testid="hover-danger"          Danger hover card (section 13)
data-testid="hover-info-tooltip"    Info tooltip (section 13)
data-testid="shadow-host"           Shadow DOM host element (section 19)
data-testid="secret-value"          Hidden panel value (section 21)
data-testid="conditional-toggle"    Enables the conditional fields (section 23)
data-testid="conditional-text"      Conditional text field (section 23)
data-testid="conditional-dropdown"  Conditional dropdown (section 23)
data-testid="conditional-radio-{value}"  Conditional radio options (section 23)
data-testid="rating-half"           Half-star rating, role="slider" (section 25)
data-testid="rating-readonly"       Read-only rating, data-value="3.5" (section 25)
data-testid="stepper-step-{1..4}"   Step indicator buttons (section 27)
data-testid="stepper-panel"         Current step's form, data-step="1" … "4" (section 27)
data-testid="signature-pad"         Signature canvas (section 28)
```

### Sidebar

```
data-testid="nav-test-pet-store"    Gradient "Test Pet Store" nav entry
data-testid="nav-pages-toggle"      "Pages" group header (aria-expanded; open by default)
#nav-pages                          Container of the page entries below (only while open)
data-testid="nav-media"             Media nav entry
data-testid="nav-frames"            Frames nav entry
data-testid="nav-spreadsheet"       Spreadsheet nav entry
data-testid="nav-verification"      Verification nav entry
data-testid="nav-controls"          Controls nav entry
data-testid="nav-navigation"        Navigation nav entry
data-testid="nav-data"              Data nav entry
data-testid="nav-interactions"      Interactions nav entry
data-testid="nav-live"              Live nav entry
data-testid="nav-browser"           Browser nav entry
data-testid="sidebar-account"       Bottom account block container
data-testid="sidebar-account-link"  Link to /account (when logged in)
data-testid="sidebar-logout"        Logout button (when logged in)
data-testid="sidebar-login-link"    Link to /login (when logged out)
data-testid="sidebar-signup-link"   Link to /signup (when logged out)
```

### Login (`/login`)

```
data-testid="login-email"           Email input
data-testid="login-password"        Password input
data-testid="login-password-toggle" Show/hide password toggle
data-testid="login-remember"        "Remember me" checkbox
data-testid="login-forgot-link"     "Forgot password?" link
data-testid="login-submit"          Submit button
data-testid="login-error"           Inline error message
data-testid="login-signup-link"     Link to /signup
```

### Signup (`/signup`)

```
data-testid="signup-name"               Name input
data-testid="signup-email"              Email input
data-testid="signup-password"           Password input
data-testid="signup-password-toggle"    Show/hide toggle
data-testid="signup-confirm"            Confirm-password input
data-testid="signup-confirm-toggle"     Show/hide toggle
data-testid="signup-terms"              Terms checkbox
data-testid="signup-submit"             Submit button
data-testid="signup-error"              Form-level error message
data-testid="signup-name-error"         Field error (name)
data-testid="signup-email-error"        Field error (email)
data-testid="signup-password-error"     Field error (password)
data-testid="signup-confirm-error"      Field error (confirm password)
data-testid="signup-terms-error"        Field error (terms)
data-testid="signup-login-link"         Link to /login
```

### Forgot password (`/forgot-password`)

```
data-testid="forgot-email"          Email input
data-testid="forgot-submit"         Submit button
data-testid="forgot-confirm"        Stub confirmation message (after submit)
data-testid="forgot-login-link"     Link to /login
```

### Account (`/account`)

```
data-testid="account-welcome"           Welcome heading
data-testid="account-email"             Displayed email
data-testid="account-member-since"      Displayed join date
data-testid="account-goto-petstore"     Shortcut button into /petstore
data-testid="account-logout"            Logout button
```

### Test Pet Store (`/petstore`)

```
data-testid="petstore-welcome"          Hero welcome chip
data-testid="petstore-error"            Page-level error banner
data-testid="stat-total"                Total-pets stat tile
data-testid="stat-available"            Available stat tile
data-testid="stat-pending"              Pending stat tile
data-testid="stat-sold"                 Sold stat tile
data-testid="pets-filter-all"           "All" filter chip
data-testid="pets-filter-available"     "Available" filter chip
data-testid="pets-filter-pending"       "Pending" filter chip
data-testid="pets-filter-sold"          "Sold" filter chip
data-testid="pets-grid"                 Pet card grid container
data-testid="pets-empty"                Empty-state container
data-testid="pets-empty-add"            "Add Pet" CTA inside empty state
data-testid="pets-add-button"           Floating "Add Pet" button (FAB)
data-testid="pet-toast"                 Toast notification (add/update/delete)
data-testid="pet-card-{id}"             A pet card
data-testid="pet-name-{id}"             Pet name inside its card
data-testid="pet-status-{id}"           Status pill inside its card
data-testid="pet-edit-{id}"             Edit icon button on a card
data-testid="pet-delete-{id}"           Delete icon button on a card
data-testid="pet-form-modal"            Add/Edit modal container
data-testid="pet-form-name"             Name input (modal)
data-testid="pet-form-status"           Status select (modal)
data-testid="pet-form-category"         Category input (modal)
data-testid="pet-form-photos"           Photo URLs textarea (modal)
data-testid="pet-form-tags"             Tags input (modal)
data-testid="pet-form-error"            Modal error message
data-testid="pet-form-cancel"           Cancel button (modal)
data-testid="pet-form-save"             Save button (modal)
data-testid="pet-form-close"            Modal close (✕) button
```

### Media (`/media`)

```
data-testid="nav-media"                 Sidebar entry for the Media page
data-testid="media-welcome"             Hero welcome chip

data-testid="image-loaded"              M1 image (data-state)
data-testid="image-broken"              M2 image (data-state)
data-testid="image-broken-fallback"     M2 fallback shown in place of the image
data-testid="image-lazy-scroll"         M3 scroll box
data-testid="image-lazy"                M3 image (data-state)
#image-loaded-status / #image-broken-status / #image-lazy-status   Image output lines

data-testid="video-playing"             M4 player wrapper (data-state, data-muted)
data-testid="video-broken"              M5 player wrapper
data-testid="video-lazy"                M6 player wrapper
data-testid="video-lazy-scroll"         M6 scroll box
data-testid="{player}-element"          The <video> element, e.g. video-playing-element
data-testid="{player}-play"             Play / Pause button
data-testid="{player}-mute"             Mute / Unmute button
data-testid="{player}-time"             "0:03 / 0:10" readout
data-testid="{player}-fallback"         Shown when the video fails to load
#{player}-status                        Output line, e.g. #video-playing-status

data-testid="hero-carousel"             M7 carousel (data-active-slide)
data-slide="1" … "3"                    Slides (only the active one is visible)
data-testid="hero-prev"                 Previous slide
data-testid="hero-next"                 Next slide
data-testid="hero-dot-1" … "hero-dot-3" Slide dots
#hero-status                            "Slide n of 3"

data-testid="promo-banner"              M8 promo banner
data-testid="promo-cta"                 "Claim offer" button
data-testid="promo-close"               Close (✕)
data-testid="promo-show"                "Show again" (after closing)
#promo-status                           Output line (shows the promo code)

data-testid="announcement-bar"          Announcement bar (top of the page)
data-testid="announcement-close"        Close (✕)
data-testid="cookie-backdrop"           Full-screen backdrop that blocks clicks
data-testid="cookie-banner"             Cookie banner (role="dialog")
data-testid="cookie-accept"             Accept
data-testid="cookie-reject"             Reject
data-testid="announcement-status"       M9 "Announcement bar: shown/dismissed"
data-testid="cookie-status"             M9 "Cookie consent: …"
data-testid="reset-banners"             Reset banners (also #btn-reset-banners)
```

### By `data-*` attributes

```
data-drag-id="drag-1" … "drag-5"    Draggable list items (section 15)
data-drag-pos="1" … "5"             Current position of each item (section 15)
data-row-id="EMP001" … "EMP025"     Table rows (section 20)
data-page="1" … "5"                 Pagination page buttons (section 20)
data-dynamic-id="{timestamp}"       Dynamically added buttons (section 12)
data-tag="{tag-name}"               Tag selector buttons (section 09)
data-stat="primary|success|danger|total"  Counter stat boxes (section 10)
data-value / data-hover-value       Committed and hovered value of the half-star rating (section 25)
data-star="1" … "5"                 Each star of the half-star rating (section 25)
data-fill="full|half|empty"         Fill of each star (section 25)
data-state="idle|running|complete|failed|cancelled"  Upload progress bar (section 26)
data-state="idle|running|done"      Indeterminate task bar (section 26)
data-step="1" … "4"                 Stepper items and panel (section 27)
data-state="complete|active|upcoming"  Stepper items (section 27)
data-empty="true|false"             Whether the signature pad has ink (section 28)
data-strokes="N"                    Number of strokes on the signature pad (section 28)
```

### Frames (`/frames`)

Elements inside a frame can only be reached after switching to that frame.

```
data-testid="frames-welcome"            Hero welcome chip
#sec-frames-basic / -nested / -late / -multiple / -button-only   Cards (data-expanded, data-expand-on)
data-testid="{card-id}-toggle"          Expand / Close button, e.g. sec-frames-nested-toggle
data-testid="frame-backdrop"            Overlay behind an expanded card

#practice-iframe                        F1 frame → #iframe-input, #iframe-btn, #iframe-result
#nested-level-1                         F2 outer frame → #level1-input, #level1-btn, #level1-result
  #nested-level-2                       F2 middle frame (inside level 1) → #level2-*
    #nested-level-3                     F2 inner frame (inside level 2) → #level3-*
data-testid="late-frame-slot"           F3 wrapper (data-state, data-delay-ms)
#late-iframe                            F3 frame → #late-input, #late-btn, #late-result
#btn-reload-frame                       F3 reload button
#late-frame-status                      F3 output line
iframe[name="orders-frame"]             F4 frame 1 → #frame-input, #frame-btn, #frame-result
iframe[title="Payments frame"]          F4 frame 2 → same inner ids
#sec-frames-multiple iframe >> nth=2    F4 frame 3 (index only) → same inner ids
#button-only-iframe                     F5 frame → #button-only-input, #button-only-btn, #button-only-result
[data-testid="xo-frame-slot"]           F6 slot (data-state: loading / ready / unreachable, data-frame-origin)
#cross-origin-iframe                    F6 frame → #xo-input, #xo-btn, #xo-result, #xo-send, #xo-inbox, #xo-origin
#xo-page-input / #xo-page-send          F6 page → frame message
#xo-peek                                F6 "Try to read the frame"
#xo-unreachable                         F6 error when the frame doesn't load
#xo-status                              F6 output line
```

### Spreadsheet (`/spreadsheet`)

```
data-testid="spreadsheet-welcome"   Hero welcome chip
#sec-sheet-upload                   S1 card (data-state, data-sheet, data-row-count)
#sheet-upload-btn                   Upload button (opens the file picker; disabled while uploading)
#sheet-file-input                   Hidden <input type="file"> — set files on this directly
#sheet-select                       Sheet dropdown (only when the file has 2+ sheets)
#sheet-search                       Search box (disabled until a file is loaded)
#sheet-clear-btn                    Clear button
#sheet-file-info                    "<file> · N sheet(s) · N rows"
#sheet-error                        Error message (role="alert")
#sheet-table                        The table
#sheet-table th[data-col-index]     Header cells (0-based)
tr[data-row-index]                  Data rows (1-based position in the sheet)
td[data-col="<header>"]             Cells by column header (also data-col-index)
#sheet-no-results                   Empty / no rows / no matches row
#sheet-page-first / -prev / -next / -last   Pagination buttons
#sec-sheet-upload [data-page]       Page-number buttons
#sheet-page-info                    "Showing X of Y rows — Page N of M"
```

### Verification (`/verification`)

```
data-testid="verification-welcome"  Hero welcome chip
data-testid="nav-verification"      Sidebar entry

#sec-verify-captcha                 V1 card (data-state)
#captcha-message                    Message textarea
#captcha-image                      CAPTCHA <img> (SVG data URL)
#captcha-refresh                    Load a new CAPTCHA (↻)
#captcha-test-badge                 "Test mode" badge (only with ?captcha=test)
#captcha-timer                      "Expires in m:ss"
#captcha-answer                     Answer input (disabled unless data-state="ready")
#captcha-submit                     Send message
#captcha-error                      Error (role="alert")
#captcha-result                     Success message
#captcha-reset                      Send another

#sec-verify-robot                   V2 card (data-state)
#robot-frame                        The iframe
  #robot-checkbox                   role="checkbox", aria-checked, data-state (inside the frame)
  #robot-status                     "Checking…" / "Verified" (inside the frame)
#robot-submit                       Enabled once the frame posts its token
#robot-reset                        Reloads the frame
#robot-result                       "Submitted with token …"

#sec-verify-otp                     V3 card (data-state)
#otp-phone                          Mobile number
#otp-send                           Send code
#otp-sent-to                        "Code sent to ••••4567"
data-testid="otp-input"             The six boxes (data-value = digits entered)
#otp-digit-1 … #otp-digit-6         Each box
#otp-expiry                         "Code expires in m:ss" / expired message
#otp-verify                         Verify (enabled when all 6 boxes are filled)
#otp-resend                         Resend code (disabled during the cooldown)
#otp-resend-timer                   "You can resend in N s"
#otp-change-phone                   Back to the phone number
#otp-error                          Error (role="alert")
#otp-result                         Success message
#otp-reset                          Start over
#dev-inbox                          Dev inbox list
data-testid="inbox-message"         One message (data-message-id, data-code, data-to), newest first
#inbox-refresh / #inbox-clear       Inbox buttons

#sec-verify-selfie                  V4 card (data-state)
#selfie-start                       Start camera
#selfie-video                       Live camera <video> (only while data-state="live")
#selfie-capture                     Take photo
#selfie-preview                     Captured / chosen photo
#selfie-retake                      Retake
#selfie-submit                      Submit selfie
#selfie-file                        Photo upload fallback (<input type="file">)
#selfie-error                       Error (role="alert")
#selfie-result                      "Selfie received: N KB, type"

#sec-verify-ocr                     V5 card (data-state)
#ocr-sample-clean / -blurry / -partial   Download links for the sample cards
#ocr-upload-btn                     Upload button (opens the file picker)
#ocr-file                           Hidden <input type="file"> — set files on this directly
#ocr-clear                          Clear
#ocr-status                         "Reading document…"
#ocr-preview                        The uploaded image
#ocr-field-{key}                    fullName / idNumber / dateOfBirth / city / expiryDate
                                    (data-confidence, data-low-confidence, data-edited)
#ocr-hint-{key}                     Low-confidence / not-found hint
#ocr-error-{key}                    "This field is required" after Confirm
#ocr-confirm                        Confirm details
#ocr-error                          Upload error (role="alert")
#ocr-result                         Success message
```

### Data (`/data`)

```
data-testid="data-welcome"          Hero welcome chip

#sec-data-table                     D1 card (data-sort-key, data-sort-dir)
#data-table                         The table
#sort-name / -dept / -start / -salary   Sort buttons inside the headers
th[data-key="<col>"]                Header cells (aria-sort: none / ascending / descending)
tr[data-row-id="<1-8>"]             Data rows
td[data-col="name|dept|start|salary"]   Cells (salary cell also has data-value)
#salary-edit-{id}                   Salary input while editing (after a double-click)
#data-table-error                   Invalid salary message (role="alert")
[data-testid="row-expand-{id}"]     ▸ / ▾ detail toggle (aria-expanded)
tr[data-detail-for="{id}"]          Detail row
#data-table-reset                   Reset
#data-table-status                  "Sorted by: …" / "Saved: …" / "Edit cancelled"

#sec-data-tree                      D2 card (data-checked-count)
[role="treeitem"][data-path="test-suite/auth/login.spec.ts"]   Tree items by path
#tree-test-suite-auth               Checkbox ids: "tree-" + path with non-alphanumerics → "-"
[data-testid="tree-test-suite-auth-toggle"]   Folder expand/collapse buttons
#tree-expand-all / #tree-collapse-all
#tree-status                        "Selected tests: N of 7"

[data-testid="bar-chart"]           D3 chart wrapper
rect[data-month="Mar"]              Bars (data-value; focusable)
#chart-tooltip                      Tooltip (role="tooltip"; only while hovering/focused)
#chart-status                       "Hovered: Mar = 510"

[data-testid="profile-card"]        D4 card body (aria-busy, data-state)
[data-testid="profile-avatar"]      Avatar (after loading)
[data-testid="profile-name"]        Name (after loading)
.data-badge[data-status="passing|flaky|failing"]   Badges (data-count)
#skeleton-reload                    Reload card
#skeleton-status                    "State: loading" / "State: loaded"

[data-testid="infinite-list"]       D5 scroll box (data-loaded, data-state)
[data-testid="infinite-list"] [data-index]   Rows (1-based)
#infinite-status                    "Scroll down for more" / "Loading more…" / "End of list"
#infinite-reset                     Reset to 20 rows
#infinite-count                     "Loaded: N / 100"

[data-testid="virtual-list"]        D6 scroll box (data-total, data-rendered, data-first-visible)
[data-testid="virtual-list"] [data-index="5000"]   A row (only while it's rendered)
#virtual-jump-input / #virtual-jump-btn   Jump to a row number
#virtual-jump-error                 Out-of-range message (role="alert")
#virtual-status                     "Total rows: … · rows in DOM: … · first visible: …"

#backtotop-box                      D7 scroll box (data-scroll-top)
#back-to-top                        Button (only in the DOM after scrolling past 150 px)
#backtotop-status                   "scrollTop: N · button shown|hidden"
```

### Controls (`/controls`)

```
data-testid="controls-welcome"      Hero welcome chip

#sec-controls-combobox              C1 card (data-state, data-selected)
#combo-input                        Combobox input (role="combobox", aria-expanded, aria-activedescendant)
#combo-clear                        Clear
#combo-listbox [role="option"]      Options (data-value, id="combo-opt-{i}"; only after the delay)
#combo-status                       "Selected: …"

#sec-controls-chips                 C2 card (data-count)
[data-testid="chip"][data-value]    Chips
[data-testid="chip-remove-{slug}"]  ✕ on a chip (slug: lower-case, e.g. chip-remove-javascript)
#chips-input / #chips-listbox       Input and suggestions
#chips-error                        "You can pick up to 5 skills" (role="alert")
#chips-status                       "Selected (n): …"

#switch-email / -sms / -digest / -beta   Switches (role="switch", aria-checked; beta is disabled)
#switch-status                      "On: …"

#stepper-dec / #stepper-input / #stepper-inc   Stepper (card #sec-controls-stepper has data-value)
#stepper-status                     "Quantity: n"

#color-input                        <input type="color">
#color-hex / #color-apply / #color-error   Hex code entry
[data-color="#059669"]              Swatches (aria-pressed)
#color-preview                      Preview block (data-color)
#color-status                       "Colour: #059669 (Emerald)"

#time-input / #datetime-input       Native pickers (ISO values)
#time-error / #datetime-error       Out-of-range messages
#time-status                        "Time: … · Date & time: …"

#rte                                contenteditable editor
[data-cmd="bold"]                   Toolbar buttons (aria-pressed); also italic, underline, insertUnorderedList, insertOrderedList
#rte-clear                          Clear the editor
#rte-html                           The editor's HTML, as text
#rte-status                         "Characters: n"

#mask-phone / #mask-card / #mask-amount   Masked fields (data-raw; card also data-brand, data-valid)
[data-testid="card-brand"]          Brand label next to "Card number"
#mask-card-error                    "This card number isn't valid."
#mask-status                        "Raw: phone=… · card=… · amount=…"
```

### Navigation (`/navigation`)

```
data-testid="navigation-welcome"    Hero welcome chip

#sec-nav-accordion                  N1 card (data-open: comma-separated open keys)
#acc-multi                          "Allow several panels open"
#acc-btn-{shipping|returns|warranty|payments}   Headers (aria-expanded, aria-controls)
#acc-panel-{key}                    Panels (role="region"; hidden attribute when closed)
#acc-status                         "Open: …"

#sec-nav-breadcrumbs                N2 card (data-path)
#sec-nav-breadcrumbs [data-crumb-depth="0"]   Crumbs (0 = Home); current one has aria-current="page"
[data-folder="Projects"]            Folder links
#crumbs-empty                       "No subfolders"
#crumbs-status                      "Path: /Home/…"

[data-testid="context-zone"]        N3 right-click target (focusable; Shift+F10 opens the menu)
#context-menu                       The menu (role="menu")
#context-menu [data-action="open|copy|paste|rename|delete"]   Items (role="menuitem", aria-disabled)
#context-status                     "Last action: …"

#menu-btn                           N4 menu button (aria-expanded)
#menu-list                          Menu
#menu-item-{duplicate|archive|export|share}   Items
#menu-sub-export                    Submenu (only while open)
#menu-item-export-{csv|pdf|json}    Submenu items
#menu-status                        "Chosen: …"

#drawer-open                        N5 opener
[data-testid="drawer"]              Drawer (data-state; inert + aria-hidden while closed)
[data-testid="drawer-backdrop"]     Backdrop (click to close)
#drawer-close / #drawer-apply       Close / Apply
#drawer-active / #drawer-archived / #drawer-owner   Filter fields
#drawer-status                      "Drawer: … · Filters: …"

#sec-nav-guard                      N6 card (data-dirty)
#guard-title / #guard-notes         Fields
#guard-save                         Save (disabled while clean)
#guard-leave-link                   Link to /data
[data-testid="leave-dialog"]        "Leave without saving?" (role="alertdialog", data-target = where you were going)
#leave-stay / #leave-save / #leave-discard   Dialog buttons
#guard-status                       "Saved · no changes" / "Unsaved changes" / "Saved"
```

### Interactions (`/interactions`)

```
data-testid="interactions-welcome"  Hero welcome chip

[data-testid="split"]               I1 split container
#split-handle                       Divider (role="separator", aria-valuenow, aria-valuemin=20, aria-valuemax=80)
#pane-first / #pane-second          Panes
#split-status                       "First pane: n%"

#sec-int-grid                       I2 card (data-order, data-sorted)
[data-tile="5"]                     Tile by number (data-pos = 1-9 position; aria-pressed while picked up)
#grid-reset                         Reset to 3 1 2 / 6 4 5 / 9 7 8
#grid-live                          Live announcement ("Picked up tile 3…")
#grid-status                        "Order: …" / "Sorted! 1 2 3 4 5 6 7 8 9"

#palette-open                       I3 opener (Ctrl+K / ⌘+K also works anywhere on the page)
[data-testid="command-palette"]     Palette dialog
#palette-input                      Filter input (role="combobox")
[data-command="run-all"]            Commands: new-test, run-all, toggle-compact, export-report, switch-language, go-data
#palette-empty                      "No commands match"
#palette-status                     "Last command: …"

#copy-source                        I4 snippet
#copy-btn                           Copy (data-state: idle / copied / failed)
#paste-target                       Paste box
#copy-status                        "Clipboard: … · pasted n characters, matches the command"
```

### Live (`/live`)

```
data-testid="live-welcome"          Hero welcome chip

#sec-live-feed                      L1 card (data-state, data-count)
[data-testid="live-feed"] li[data-order-id="ORD-5001"]   Orders (data-amount), newest first
#feed-toggle / #feed-clear          Pause-resume / Clear
#feed-empty                         "Waiting for orders…" after Clear
#feed-status                        "Orders received: n · newest: ORD-…"

#sec-live-countdown                 L2 card (data-state, data-remaining)
[data-testid="countdown"]           Display "mm:ss" (role="timer")
#countdown-start / -pause / -reset  Controls
#countdown-done                     "Time's up!" (role="alert")
#countdown-status                   "Timer: … · n s left"

[data-testid="moving-button"]       L3 moving button (data-clicks)
#mover-toggle                       Pause / resume movement
[data-testid="rerender-list"]       Rebuilt rows (data-version)
[data-testid="buy-mouse"]           Buy buttons (also buy-keyboard, buy-monitor)
#mover-status                       "Caught: n · Bought: …"

#sec-live-session                   L4 card (data-session-state, data-remaining)
#session-start                      Start / Start a new session
[data-testid="session-modal"]       Warning dialog (role="alertdialog")
#session-remaining                  Seconds left in the dialog (data-remaining)
#session-stay / #session-signout    Dialog buttons
#session-status                     "Session: … · extended n×"
```

### Browser (`/browser`)

```
data-testid="browser-welcome"       Hero welcome chip

[data-testid="outer-host"]          B1 outer shadow host (open)
[data-testid="slotted-title"]       Light-DOM title projected through <slot name="title">
[data-testid="inner-host"]          Inner shadow host (inside the outer root, open)
#deep-input / #deep-btn / #deep-output   Inside the inner root
[data-testid="closed-host"]         Closed shadow root host (contents not reachable)
#shadow-status                      "Deep input: … · closed-root clicks: n"

#geo-btn                            B2 "Use my location"
#geo-permission                     Live permission state pill (prompt / granted / denied)
#geo-result                         Result text (data-lat, data-lng)
#notify-permission                  Notification.permission (default / granted / denied)
#notify-request / #notify-send      Ask permission / Send a test notification
#permissions-status                 "Location: … · notifications: … · sent: n"

#fs-box                             B3 box (data-fullscreen)
#fs-enter / #fs-exit                Enter / Exit (exit only while full screen)
#fs-error                           Shown if the browser refuses
#fs-status                          "Full screen: on|off · changes: n"
```

### Inside the Shadow DOM (`[data-testid="shadow-host"]`)

Access these only after piercing the shadow root:

```
#shadow-input     Input inside shadow root
#shadow-btn       Button inside shadow root
#shadow-output    Result text inside shadow root
```

---

## Project Structure

```
test-playground/
├── index.html              Entry point HTML
├── vite.config.js          Vite config — dev server on port 3000, proxies /api → :4000
├── package.json            Dependencies and npm scripts
├── .gitattributes          Keeps *.sh files LF-only on Windows checkouts
├── scripts/
│   ├── mongo.sh             Shared MongoDB start/stop helpers used by the macOS scripts
│   ├── setup.sh / .ps1      One-time bootstrap (Node, Mongo, certs, .env, seed) — npm run setup / setup:win
│   ├── start.sh / .ps1      Checks Node + npm packages, starts MongoDB (if needed) + frontend + API — npm run start:all / start:all:win
│   ├── check-deps.js        Checks Node matches package.json "engines" and npm packages match package-lock.json — used by setup and start
│   └── stop.sh / .ps1       Stops frontend + API + MongoDB — npm run stop:all / stop:all:win
├── server/                 Express + MongoDB API (port 4000)
│   ├── index.js             App bootstrap, middleware, route mounting
│   ├── db.js                Mongoose connection
│   ├── seed.js              Creates the sample users and pets — npm run seed
│   ├── .env / .env.example  MONGO_URI, JWT_SECRET, PORT (optional: CAPTCHA_TEST_KEY)
│   ├── models/
│   │   ├── User.js
│   │   └── Pet.js
│   ├── middleware/
│   │   └── auth.js          JWT verification (requireAuth)
│   ├── routes/
│   │   ├── auth.js          signup / login / forgot-password / me / logout
│   │   ├── pets.js          Pet CRUD, scoped to the authenticated user
│   │   ├── spreadsheets.js  Spreadsheet upload: checks the file and returns its sheets as JSON
│   │   ├── verification.js  CAPTCHA, OTP + dev inbox, selfie upload, simulated OCR (in memory)
│   │   └── frames.js        The cross-origin frame page for the Frames page's F6 (GET /frames/cross-origin)
│   └── fixtures/
│       └── ocr.js           What the simulated OCR returns for each sample ID card
└── src/
    ├── main.jsx            React root — BrowserRouter + AuthProvider + <App />
    ├── App.jsx             27 section components, sidebar nav, route shell
    ├── App.css             All styles — layout, components, utilities
    ├── i18n.jsx            English/Arabic translations + LanguageProvider
    ├── api/
    │   └── client.js        Shared fetch wrapper (ApiError)
    ├── auth/
    │   ├── AuthContext.jsx   Auth state, login/signup/logout, token storage
    │   ├── ProtectedRoute.jsx
    │   ├── AuthLayout.jsx
    │   ├── PasswordInput.jsx
    │   ├── LoginPage.jsx
    │   ├── SignupPage.jsx
    │   ├── ForgotPasswordPage.jsx
    │   └── AccountPage.jsx
    ├── petstore/
    │   ├── PetstorePage.jsx  Hero, stats, filters, grid, FAB, toasts
    │   ├── PetCard.jsx
    │   ├── PetFormModal.jsx
    │   ├── petAvatars.js     Emoji avatar mapping
    │   └── api.js            listPets / createPet / updatePet / deletePet
    ├── media/
    │   └── MediaPage.jsx     Media page — image, video and banner widgets (M1–M9)
    ├── frames/
    │   └── FramesPage.jsx    Frames page — basic, nested, late-loading, multiple, button-only and cross-origin iframes (F1–F6)
    ├── spreadsheet/
    │   └── SpreadsheetPage.jsx  Spreadsheet page — Excel upload table (S1)
    ├── verification/
    │   └── VerificationPage.jsx  Verification page — CAPTCHA, checkbox CAPTCHA, OTP, selfie, OCR (V1–V5)
    ├── controls/
    │   └── ControlsPage.jsx  Controls page — combobox, chips, switches, stepper, colour/time pickers, rich text, masks (C1–C8)
    ├── navigation/
    │   └── NavigationPage.jsx  Navigation page — accordion, breadcrumbs, context menu, submenu, drawer, unsaved guard (N1–N6)
    ├── data/
    │   └── DataPage.jsx      Data page — sortable table, tree, chart, skeleton, infinite + virtual lists, back-to-top (D1–D7)
    ├── interactions/
    │   └── InteractionsPage.jsx  Interactions page — resizable panels, sortable grid, command palette, clipboard (I1–I4)
    ├── live/
    │   └── LivePage.jsx      Live page — live feed, countdown, moving target + rebuilt rows, session timeout (L1–L4)
    ├── browser/
    │   └── BrowserPage.jsx   Browser page — nested/closed Shadow DOM, permission prompts, full screen (B1–B3)
    ├── testresources/
    │   ├── testimage.jpg     Image used by the Media page
    │   ├── testvideo.mp4     Video used by the Media page
    │   ├── spreadsheets/     Files for the Spreadsheet page (see its reference)
    │   └── ocr/              Sample ID cards for the Verification page's OCR widget
    └── ui.jsx              Shared SectionHeader / Output components and the numberParam URL helper
```

---

## Automation Tester Notes

### Spreadsheet page

The upload button only opens the browser's file picker, which automation can't control. Set the file on the hidden input instead, then wait on `data-state`:

```js
// Playwright
await page.setInputFiles('#sheet-file-input', 'src/testresources/spreadsheets/employees.xlsx')
await expect(page.locator('#sec-sheet-upload')).toHaveAttribute('data-state', 'loaded')
await expect(page.locator('#sheet-table tbody tr')).toHaveCount(10)
await page.selectOption('#sheet-select', { label: 'Projects' })
await expect(page.locator('td[data-col="Project"]').first()).toHaveText('Project A')
```

```js
// Cypress (the input is hidden, so force it)
cy.get('#sheet-file-input').selectFile('src/testresources/spreadsheets/employees.xlsx', { force: true })
cy.get('#sec-sheet-upload').should('have.attr', 'data-state', 'loaded')
```

In Selenium, call `sendKeys` with the file's absolute path on `#sheet-file-input`. If your driver refuses because the input is hidden, show it first with `executeScript("arguments[0].style.display='block'", input)`.

Uploading the same file twice in a row works: the input is reset after every upload.

### Verification page

**CAPTCHA (V1).** Pick one of the two bypasses:

```js
// Test mode: works from any tool
await page.goto('/verification?captcha=test')
await page.locator('#captcha-message').fill('Hello')
await page.locator('#captcha-answer').fill('TEST42')
await page.locator('#captcha-submit').click()
await expect(page.locator('#sec-verify-captcha')).toHaveAttribute('data-state', 'passed')

// Test key: add the header to the verify call
await page.route('**/api/verification/captcha/verify', route =>
  route.continue({ headers: { ...route.request().headers(), 'x-captcha-test-key': 'playground-test-key' } }))
```

**Checkbox CAPTCHA (V2).**

```js
const frame = page.frameLocator('#robot-frame')
await frame.locator('#robot-checkbox').click()
await expect(frame.locator('#robot-checkbox')).toHaveAttribute('aria-checked', 'true')
await page.locator('#robot-submit').click()
```

Selenium: `driver.switchTo().frame("robot-frame")`, click, wait, then `driver.switchTo().defaultContent()`.

**OTP (V3).** Read the code from the inbox on the page, or from the API with the token the app stores under `tp-auth-token`:

```js
await page.goto('/verification?otpCooldown=0')
await page.locator('#otp-phone').fill('+971 50 123 4567')
await page.locator('#otp-send').click()
const code = await page.getByTestId('inbox-message').first().getAttribute('data-code')

// or from the API
const token = await page.evaluate(() => localStorage.getItem('tp-auth-token') || sessionStorage.getItem('tp-auth-token'))
const res = await page.request.get('/api/verification/dev-inbox', { headers: { Authorization: `Bearer ${token}` } })
const apiCode = (await res.json()).messages[0].code

// Type it: focus moves on by itself
await page.locator('#otp-digit-1').click()
await page.keyboard.type(code)
await page.locator('#otp-verify').click()
await expect(page.locator('#sec-verify-otp')).toHaveAttribute('data-state', 'verified')
```

The inbox keeps earlier messages (the last 20), so after a resend wait for a **new** first message before reading the code, for example by comparing its `data-message-id` with the one before. Otherwise a test can read the previous, now-invalid code.

`fill()` on one box also works: the digits are spread across the boxes from that one onwards. A paste does the same.

**Selfie (V4).** Browsers can stand in a fake camera:

| Browser | Fake camera | Deny the permission |
|---|---|---|
| Chromium (Playwright) | `args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream']` and `permissions: ['camera']` | `args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream=deny']` |
| Chrome (Selenium) | `options.add_argument('--use-fake-device-for-media-stream')` and `--use-fake-ui-for-media-stream` | `--use-fake-ui-for-media-stream=deny` |
| Firefox | prefs `media.navigator.streams.fake: true` and `media.navigator.permission.disabled: true` | leave `permission.disabled` off and dismiss the prompt |
| WebKit / Safari | Limited fake-camera support; use the `#selfie-file` fallback | — |

Chrome's fake camera shows a green test pattern. To use your own video, add `--use-file-for-fake-video-capture=<path>.y4m` (or `.mjpeg`). Headless Chromium with no camera permission set answers `NotSupportedError`, which the card shows as `unavailable`. With no camera at all, set a file on `#selfie-file`:

```js
await page.locator('#selfie-file').setInputFiles('src/testresources/testimage.jpg')
await page.locator('#selfie-submit').click()
await expect(page.locator('#sec-verify-selfie')).toHaveAttribute('data-state', 'uploaded')
```

**OCR (V5).**

```js
await page.goto('/verification?ocrDelay=0')
await page.locator('#ocr-file').setInputFiles('src/testresources/ocr/id-blurry.png')
await expect(page.locator('#sec-verify-ocr')).toHaveAttribute('data-state', 'done')
await expect(page.locator('#ocr-field-idNumber')).toHaveAttribute('data-low-confidence', 'true')
await page.locator('#ocr-field-idNumber').fill('PG-5093-1182')
await page.locator('#ocr-confirm').click()
await expect(page.locator('#sec-verify-ocr')).toHaveAttribute('data-state', 'confirmed')
```

### Data page

**Sorting and inline edit (D1).** Assert `aria-sort` on the header, then read the rows in their new order. Editing needs a double-click, and the input only exists while editing:

```js
await page.locator('#sort-salary').click()
await expect(page.locator('th[data-key="salary"]')).toHaveAttribute('aria-sort', 'ascending')
await expect(page.locator('#data-table tbody tr[data-row-id] td[data-col="name"]').first()).toHaveText('Omar Haddad')

await page.locator('tr[data-row-id="1"] td[data-col="salary"]').dblclick()
await page.locator('#salary-edit-1').fill('120000')
await page.locator('#salary-edit-1').press('Enter')
await expect(page.locator('tr[data-row-id="1"] td[data-col="salary"]')).toHaveAttribute('data-value', '120000')
```

**Indeterminate checkboxes (D2).** `isChecked()` returns `false` for a half-checked folder. Check `aria-checked` or `data-state`, or read the DOM property:

```js
const auth = page.locator('#tree-test-suite-auth')
await expect(auth).toHaveAttribute('aria-checked', 'mixed')
expect(await auth.evaluate(el => el.indeterminate)).toBe(true)
await auth.check()
await expect(page.locator('#tree-status')).toHaveText('Selected tests: 3 of 7')
```

**Chart tooltips (D3).** The tooltip is added on hover and removed on mouse-out. For values, read the bar's attributes instead:

```js
await page.locator('rect[data-month="Mar"]').hover()
await expect(page.locator('#chart-tooltip')).toHaveText('Mar 2026: 510 sign-ups')
await expect(page.locator('rect[data-month="Mar"]')).toHaveAttribute('data-value', '510')
```

**Skeleton (D4).** Wait on `aria-busy`, or skip the wait with `?skeletonDelay=0`:

```js
await expect(page.getByTestId('profile-card')).toHaveAttribute('aria-busy', 'false')
await expect(page.locator('.data-badge[data-status="failing"]')).toHaveAttribute('data-count', '2')
```

**Infinite scroll (D5).** Scroll the box itself (not the page) to its bottom, then wait for `data-loaded` to grow. `?scrollDelay=0` makes each batch arrive at once:

```js
const list = page.getByTestId('infinite-list')
await list.evaluate(el => { el.scrollTop = el.scrollHeight })
await expect(list).toHaveAttribute('data-loaded', '40')
```

In Selenium: `driver.executeScript("arguments[0].scrollTop = arguments[0].scrollHeight", list)`, then wait for the attribute.

**Virtualised list (D6).** Rows outside the view aren't in the DOM, so `scrollIntoView` on a locator can't reach them: there's nothing to find yet. Scroll the box to where the row would be (`(n - 1) * 32` px), or use the jump box:

```js
const list = page.getByTestId('virtual-list')
await expect(list.locator('[data-index="5000"]')).toHaveCount(0)
await list.evaluate(el => { el.scrollTop = 4999 * 32 })
await expect(list.locator('[data-index="5000"]')).toBeVisible()
```

**Back to top (D7).** The button isn't in the DOM until the box is scrolled more than 150 px, and scrolling back up is smooth, so wait for the end state:

```js
const box = page.locator('#backtotop-box')
await box.evaluate(el => { el.scrollTop = 400 })
await page.locator('#back-to-top').click()
await expect(box).toHaveAttribute('data-scroll-top', '0')
await expect(page.locator('#back-to-top')).toHaveCount(0)
```

### Controls page

**Combobox (C1).** Options aren't in the DOM until the search finishes, so wait for them (Playwright's auto-waiting does this). Use `?comboDelay=0` to skip the wait:

```js
await page.locator('#combo-input').fill('uni')
await page.locator('[role="option"][data-value="United Kingdom"]').click()
await expect(page.locator('#sec-controls-combobox')).toHaveAttribute('data-selected', 'United Kingdom')

// Keyboard: the highlighted option is the one aria-activedescendant points at
await page.locator('#combo-input').fill('ind')
await page.locator('#combo-input').press('ArrowDown')
await expect(page.locator('#combo-input')).toHaveAttribute('aria-activedescendant', 'combo-opt-0')
await page.locator('#combo-input').press('Enter')
```

**Switches (C3).** `check()` only works on checkboxes and radios. Click the switch and assert `aria-checked` (Playwright's `toBeChecked()` also reads `aria-checked` on `role="switch"`):

```js
await page.getByRole('switch', { name: 'SMS alerts' }).click()
await expect(page.locator('#switch-sms')).toHaveAttribute('aria-checked', 'true')
await expect(page.locator('#switch-beta')).toBeDisabled()
```

**Colour and time pickers (C5, C6).** Don't open the native pickers. Fill the input with a value in its own format:

```js
await page.locator('#color-input').fill('#ff0000')          // lower-case hex
await page.locator('#time-input').fill('14:30')            // HH:mm
await page.locator('#datetime-input').fill('2026-12-24T10:15')
```

In Selenium, `sendKeys` on these inputs depends on the browser's locale. Setting the value with JavaScript and firing `input` is more reliable:

```java
js.executeScript("arguments[0].value = arguments[1]; arguments[0].dispatchEvent(new Event('input', {bubbles: true}))", el, "14:30");
```

**Rich text (C7).** `fill()` replaces the content and its formatting. Type with the keyboard, select with Shift+Home, then use the toolbar:

```js
await page.locator('#rte-clear').click()
await page.locator('#rte').click()
await page.keyboard.type('Hello world')
await page.keyboard.press('Shift+Home')
await page.locator('[data-cmd="bold"]').click()
await expect(page.locator('#rte-html')).toHaveText('<b>Hello world</b>')
```

**Masked inputs (C8).** Assert both what's shown and what's stored:

```js
await page.locator('#mask-phone').pressSequentially('5551234567')
await expect(page.locator('#mask-phone')).toHaveValue('(555) 123-4567')
await expect(page.locator('#mask-phone')).toHaveAttribute('data-raw', '5551234567')
await page.locator('#mask-card').fill('4242424242424242')
await expect(page.locator('#mask-card')).toHaveAttribute('data-valid', 'true')
```

### Navigation page

**Breadcrumbs and the Back button (N2).** The folder is in the URL, so history works:

```js
await page.locator('[data-folder="Projects"]').click()
await expect(page).toHaveURL(/folder=Home%2FProjects/)
await page.locator('#sec-nav-breadcrumbs [data-crumb-depth="0"]').click()
await page.goBack()
await expect(page.locator('#crumbs-status')).toHaveText('Path: /Home/Projects')
```

**Context menu (N3).** Right-click with `click({ button: 'right' })` (Selenium: `actions.contextClick(el)`). Playwright refuses to click `aria-disabled="true"` items, which is a check in itself:

```js
await page.getByTestId('context-zone').click({ button: 'right' })
await expect(page.locator('[data-action="paste"]')).toHaveAttribute('aria-disabled', 'true')
await page.locator('[data-action="copy"]').click()
```

**Drawer (N5).** Wait for the end of the animation on `data-state`, not on visibility. The closed drawer is hidden, so `waitForSelector` needs `state: 'attached'`:

```js
await page.locator('#drawer-open').click()
await expect(page.getByTestId('drawer')).toHaveAttribute('data-state', 'open')
await page.locator('#drawer-owner').fill('Priya')
await page.locator('#drawer-apply').click()
await expect(page.getByTestId('drawer')).toHaveAttribute('data-state', 'closed')
```

**Leaving with unsaved changes (N6).** The in-page dialog is ordinary DOM. The browser's `beforeunload` dialog only appears when the page is closed or reloaded, and Playwright only runs it when asked:

```js
await page.locator('#guard-title').fill('changed')
await page.getByTestId('nav-media').click()
await expect(page.getByTestId('leave-dialog')).toHaveAttribute('data-target', '/media')
await page.locator('#leave-stay').click()

page.once('dialog', d => { expect(d.type()).toBe('beforeunload'); d.dismiss() })
await page.close({ runBeforeUnload: true })
```

### Interactions page

**Dragging the divider (I1).** A resize needs mouse down, several moves, and up. Read the result from `aria-valuenow`:

```js
const handle = page.locator('#split-handle')
const box = await page.getByTestId('split').boundingBox()
const h = await handle.boundingBox()
await page.mouse.move(h.x + h.width / 2, h.y + h.height / 2)
await page.mouse.down()
await page.mouse.move(box.x + box.width * 0.6, h.y + h.height / 2, { steps: 8 })
await page.mouse.up()
await expect(handle).toHaveAttribute('aria-valuenow', '60')
```

**Sortable grid (I2).** The mouse path uses HTML5 drag and drop. Playwright's `dragTo` fires those events; Selenium's `Actions.dragAndDrop` does not (a long-standing WebDriver limitation), so in Selenium use the keyboard path instead:

```js
await page.locator('[data-tile="1"]').dragTo(page.locator('[data-tile="3"]'))
await expect(page.locator('#sec-int-grid')).toHaveAttribute('data-order', '1,3,2,6,4,5,9,7,8')
```

```java
WebElement tile = driver.findElement(By.cssSelector("[data-tile='3']"));
tile.sendKeys(Keys.SPACE, Keys.ARROW_RIGHT, Keys.SPACE);   // pick up, move right, drop
```

**Keyboard shortcut (I3).** Use `ControlOrMeta` so the same test runs on macOS and Windows:

```js
await page.keyboard.press('ControlOrMeta+K')
await page.locator('#palette-input').fill('compact')
await page.keyboard.press('Enter')
await expect(page.locator('#sec-int-palette')).toHaveAttribute('data-compact', 'true')
```

**Clipboard (I4).** Reading the clipboard needs permission. Grant it on the context, then read it directly or paste into the box:

```js
const context = await browser.newContext({ permissions: ['clipboard-read', 'clipboard-write'] })
// …
await page.locator('#copy-btn').click()
expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('npm install -D @playwright/test')
await page.locator('#paste-target').focus()
await page.keyboard.press('ControlOrMeta+V')
await expect(page.locator('#copy-status')).toContainText('matches the command')
```

### Live page

**Changing lists (L1).** Find orders by id, not position: the top row changes every 2 s. Pause first if you need a stable list.

**Long waits (L2, L4).** Shorten them with URL settings, or fake the clock. `page.clock` controls `Date.now()` and timers:

```js
await page.clock.install()
await page.goto('/live')
await page.locator('#countdown-start').click()
await page.clock.fastForward(30000)
await expect(page.locator('#sec-live-countdown')).toHaveAttribute('data-state', 'done')

await page.goto('/live?sessionLength=4&sessionWarn=2')
await page.locator('#session-start').click()
await expect(page.getByTestId('session-modal')).toBeVisible()
await page.locator('#session-stay').click()
```

**Moving target and stale elements (L3).** Playwright locators look the element up again on every action and wait until it's stable, so clicking the moving button just works. A saved element handle (or a Selenium `WebElement`) points at one DOM node; after the rows are rebuilt it's detached, and Selenium throws `StaleElementReferenceException`. Find the element again right before using it:

```js
const old = await page.getByTestId('buy-mouse').elementHandle()
await expect(page.getByTestId('rerender-list')).not.toHaveAttribute('data-version', '1')
expect(await old.evaluate(el => el.isConnected)).toBe(false)   // stale
await page.getByTestId('buy-mouse').click()                     // a fresh lookup works
```

### Browser page

**Shadow DOM (B1).** Playwright's CSS and text locators go through open shadow roots by themselves. Selenium needs `getShadowRoot()` at each level. Nothing reaches inside the closed root: click its host (the click lands on the button inside) or use the keyboard.

```js
await page.locator('#deep-input').fill('hello')
await page.locator('#deep-btn').click()
await expect(page.locator('#deep-output')).toHaveText('Deep value: hello')
await page.getByTestId('closed-host').click()
await expect(page.locator('#sec-browser-shadow')).toHaveAttribute('data-closed-clicks', '1')
```

```java
SearchContext outer = driver.findElement(By.cssSelector("[data-testid='outer-host']")).getShadowRoot();
SearchContext inner = outer.findElement(By.cssSelector("[data-testid='inner-host']")).getShadowRoot();
inner.findElement(By.cssSelector("#deep-input")).sendKeys("hello");
```

**Permissions (B2).** Tests can't click the browser's own permission prompt. Decide the answer on the context first:

```js
await context.grantPermissions(['geolocation'], { origin: 'https://localhost:3000' })
await context.setGeolocation({ latitude: 25.2048, longitude: 55.2708 })
await page.locator('#geo-btn').click()
await expect(page.locator('#geo-result')).toHaveAttribute('data-lat', '25.2048')
```

Without a grant, headless Chromium denies straight away (`data-geo-state="denied"`). Notifications only report `granted` in headed Chromium.

**Full screen (B3).** `requestFullscreen()` needs a real click, which `click()` provides. Assert on `data-fullscreen`, then leave with `#fs-exit`.

### Frames page

Switch to the frame context before interacting with elements inside it.

```js
// Playwright
await page.locator('[data-testid="nav-frames"]').click()

// F1 — basic
const frame = page.frameLocator('#practice-iframe')
await frame.locator('#iframe-input').fill('hello')
await frame.locator('#iframe-btn').click()
await expect(frame.locator('#iframe-result')).toHaveText('Value: hello')

// F2 — nested: chain frameLocator calls, one per level
const level3 = page.frameLocator('#nested-level-1')
  .frameLocator('#nested-level-2')
  .frameLocator('#nested-level-3')
await level3.locator('#level3-input').fill('deep')
await level3.locator('#level3-btn').click()
await expect(level3.locator('#level3-result')).toHaveText('Level 3: deep')

// F3 — late-loading: wait for the frame to be attached first
await page.goto('/frames?delay=1500')
await expect(page.locator('[data-testid="late-frame-slot"]')).toHaveAttribute('data-state', 'loaded')
await page.frameLocator('#late-iframe').locator('#late-input').fill('later')

// F4 — no ids: by name, by title, by index
await page.frameLocator('iframe[name="orders-frame"]').locator('#frame-input').fill('a')
await page.frameLocator('iframe[title="Payments frame"]').locator('#frame-input').fill('b')
await page.frameLocator('#sec-frames-multiple iframe').nth(2).locator('#frame-input').fill('c')

// Click inside a frame → its card expands (here from the innermost nested frame)
await level3.locator('#level3-input').click()
await expect(page.locator('#sec-frames-nested')).toHaveAttribute('data-expanded', 'true')
// Focus is now inside the frame, where Escape doesn't reach the page, so close with the button
await page.locator('[data-testid="sec-frames-nested-toggle"]').click()

// F5 — clicking inside does nothing; only the Expand button works
const f5 = page.locator('#sec-frames-button-only')
await page.frameLocator('#button-only-iframe').locator('#button-only-input').click()
await expect(f5).toHaveAttribute('data-expanded', 'false')
await page.locator('[data-testid="sec-frames-button-only-toggle"]').click()
await expect(f5).toHaveAttribute('data-expanded', 'true')

// F6 — a cross-origin frame: switching in works the same; the page and frame talk via postMessage
await expect(page.getByTestId('xo-frame-slot')).toHaveAttribute('data-state', 'ready')
const xo = page.frameLocator('#cross-origin-iframe')
await xo.locator('#xo-input').fill('from test')
await xo.locator('#xo-send').click()
await expect(page.locator('#xo-status')).toContainText('from frame: from test')
await page.locator('#xo-page-input').fill('hi frame')
await page.locator('#xo-page-send').click()
await expect(xo.locator('#xo-inbox')).toHaveText('hi frame')
```

```java
// Selenium — nested frames: switch down one level at a time, then back up
driver.switchTo().frame("nested-level-1");
driver.switchTo().frame("nested-level-2");
driver.switchTo().frame("nested-level-3");
driver.findElement(By.id("level3-input")).sendKeys("deep");
driver.switchTo().parentFrame();          // back to level 2
driver.switchTo().defaultContent();       // back to the page

// F4 — by name, by title, by index
driver.switchTo().frame("orders-frame");
driver.switchTo().defaultContent();
driver.switchTo().frame(driver.findElement(By.cssSelector("iframe[title='Payments frame']")));
driver.switchTo().defaultContent();
driver.switchTo().frame(driver.findElements(By.cssSelector("#sec-frames-multiple iframe")).get(2));
```

### Shadow DOM (Section 19)

Pierce the shadow root to reach encapsulated elements.

```js
// Playwright — CSS pierce selector
await page.locator('[data-testid="shadow-host"] >> css=#shadow-input').fill('test')
await page.locator('[data-testid="shadow-host"] >> css=#shadow-btn').click()

// Playwright — via shadowRoot in evaluate
const value = await page.evaluate(() =>
  document.querySelector('[data-testid="shadow-host"]')
    .shadowRoot.getElementById('shadow-output').textContent
)
```

### Popup Alerts — Warning / Error / Exception (Section 22)

Custom modal overlays rendered in the page DOM — no native browser dialog handling needed.

```js
// Playwright — open and dismiss a warning modal
await page.locator('#btn-warning-popup').click()
await expect(page.locator('[role="dialog"]')).toBeVisible()
await expect(page.locator('#popup-title')).toHaveText('Warning')
await page.locator('#popup-dismiss-btn').click()
await expect(page.locator('[role="dialog"]')).not.toBeVisible()

// Assert exception modal shows stack trace content
await page.locator('#btn-exception-popup').click()
await expect(page.locator('#popup-message')).toContainText('TypeError')
await page.locator('#popup-close-btn').click()

// Dismiss by clicking the backdrop
await page.locator('#btn-error-popup').click()
await page.locator('.popup-overlay').click({ position: { x: 10, y: 10 } })
await expect(page.locator('[role="dialog"]')).not.toBeVisible()
```

### Browser Popups — Alert / Prompt / Confirm (Section 16)

Register a dialog handler **before** clicking the trigger button.

```js
// Playwright — dismiss all dialogs
page.on('dialog', dialog => dialog.dismiss())
await page.locator('#btn-alert').click()

// Playwright — accept confirm and fill prompt
page.on('dialog', async dialog => {
  if (dialog.type() === 'prompt') await dialog.accept('Srujana')
  else await dialog.accept()
})
await page.locator('#btn-prompt').click()
await expect(page.locator('#popup-result')).toContainText('Srujana')
```

### New Tab / New Window (Section 17)

Wait for the new page event before clicking the trigger.

```js
// Playwright
const [newPage] = await Promise.all([
  page.context().waitForEvent('page'),
  page.locator('#btn-js-newtab').click()
])
await newPage.waitForLoadState()
console.log(newPage.url())
```

### Drag & Drop (Section 15)

```js
// Playwright — built-in dragAndDrop
await page.dragAndDrop(
  '[data-drag-id="drag-1"]',
  '[data-drag-id="drag-4"]'
)
await expect(page.locator('[data-drag-pos="1"]')).toHaveAttribute('data-drag-id', 'drag-2')
```

### Pagination Table (Section 20)

```js
// Assert a specific row by ID
const row = page.locator('[data-row-id="EMP003"]')
await expect(row.locator('.cell-name')).toHaveText('Carol')

// Navigate pages
await page.locator('#page-next').click()
await expect(page.locator('#page-info')).toContainText('Page 2')

// Filter and assert result count
await page.locator('#employee-search').fill('Engineering')
await expect(page.locator('#employee-table tbody tr')).toHaveCount(5)
```

### Dynamic Visibility (Section 12 & 21)

```js
// Assert element appears after a delay
await page.locator('#btn-load').click()
await expect(page.locator('#btn-load')).toHaveText('Done!', { timeout: 5000 })

// Assert collapsible panel toggles
await page.locator('#toggle-panel-btn').click()
await expect(page.locator('#collapsible-content')).toBeVisible()
await page.locator('#toggle-panel-btn').click()
await expect(page.locator('#collapsible-content')).not.toBeVisible()
```

### Ratings (Section 25)

The product rating's radio inputs are hidden on screen; their labels are the stars. Click the label, or use `check()` on the input.

```js
await page.locator('label[for="rating-star-4"]').click()
await expect(page.locator('#rating-star-4')).toBeChecked()

// Half stars: the first half of a star (left in English, right in Arabic) is worth n - 0.5
const rating = page.getByTestId('rating-half')
const star = await rating.locator('[data-star="3"]').boundingBox()
await page.mouse.move(star.x + star.width * 0.25, star.y + star.height / 2)
await expect(rating).toHaveAttribute('data-hover-value', '2.5')  // preview only
await expect(rating).toHaveAttribute('aria-valuenow', '0')       // nothing committed yet
await page.mouse.click(star.x + star.width * 0.25, star.y + star.height / 2)
await expect(rating).toHaveAttribute('aria-valuenow', '2.5')

// Keyboard: Right/Up +0.5, Left/Down -0.5 (Left/Right swap in Arabic), Home = 0, End = 5
await rating.focus()
await page.keyboard.press('End')
await expect(rating).toHaveAttribute('aria-valuenow', '5')
```

### Progress Bar (Section 26)

The upload takes a different time on every run. Wait on the bar's attributes, never on a fixed sleep.

```js
await page.locator('#progress-start').click()
await expect(page.locator('#progress-upload')).toHaveAttribute('aria-valuenow', '100', { timeout: 15000 })
await expect(page.locator('#progress-upload')).toHaveAttribute('data-state', 'complete')

// Failure path: stalls at 60% for 2 s, then fails
await page.locator('#progress-fail-toggle').check()
await page.locator('#progress-start').click()
await expect(page.locator('#progress-upload')).toHaveAttribute('data-state', 'failed', { timeout: 15000 })

// Indeterminate: no aria-valuenow while running
await page.locator('#progress-task-start').click()
await expect(page.locator('#progress-indeterminate')).not.toHaveAttribute('aria-valuenow')
await expect(page.locator('#progress-indeterminate')).toHaveAttribute('data-state', 'done', { timeout: 6000 })
```

### Stepper (Section 27)

Only earlier steps are clickable in the indicator. To move forward, use **Next**, which checks the current step first.

```js
await page.locator('#stepper-next').click()
await expect(page.locator('#stepper-error-name')).toBeVisible()

await page.locator('#stepper-name').fill('Alice')
await page.locator('#stepper-email').fill('alice@example.com')
await page.locator('#stepper-next').click()
await expect(page.getByTestId('stepper-panel')).toHaveAttribute('data-step', '2')
await expect(page.getByTestId('stepper-step-2')).toHaveAttribute('aria-current', 'step')
await expect(page.getByTestId('stepper-step-3')).toBeDisabled()

// Values are kept when going back
await page.getByTestId('stepper-step-1').click()
await expect(page.locator('#stepper-name')).toHaveValue('Alice')
```

### Signature Pad (Section 28)

A canvas has no DOM content, so draw with low-level mouse actions and assert the pad's data attributes. Save needs at least 60 px of ink, so a single click is rejected.

```js
const pad = page.getByTestId('signature-pad')
const box = await pad.boundingBox()
await page.mouse.move(box.x + 40, box.y + box.height / 2)
await page.mouse.down()
for (let i = 1; i <= 20; i++) {
  await page.mouse.move(box.x + 40 + i * 12, box.y + box.height / 2 + Math.sin(i) * 20)
}
await page.mouse.up()
await expect(pad).toHaveAttribute('data-empty', 'false')
await expect(pad).toHaveAttribute('data-strokes', '1')

await page.locator('#signature-save').click()
await expect(page.locator('#signature-preview')).toHaveAttribute('src', /^data:image\/png/)
```

Selenium: use `ActionChains(driver).move_to_element_with_offset(pad, -100, 0).click_and_hold().move_by_offset(...)...release().perform()`. Cypress: trigger `pointerdown`, `pointermove` and `pointerup` with `clientX`/`clientY`.

### Media page

```js
// Playwright — get past the cookie banner, which blocks the page until answered
await page.locator('[data-testid="nav-media"]').click()
await page.locator('[data-testid="cookie-accept"]').click()
await expect(page.locator('[data-testid="cookie-banner"]')).toBeHidden()

// Or skip it entirely: store the choice before the page loads
await page.addInitScript(() => localStorage.setItem('tp-media-cookie-consent', 'accepted'))

// Images: assert loaded vs broken
await expect(page.locator('[data-testid="image-loaded"]')).toHaveAttribute('data-state', 'loaded')
await expect(page.locator('[data-testid="image-broken"]')).toHaveAttribute('data-state', 'broken')
const width = await page.locator('[data-testid="image-loaded"]').evaluate(img => img.naturalWidth)
expect(width).toBeGreaterThan(0)

// Lazy image: no src until scrolled into view inside its box
const lazy = page.locator('[data-testid="image-lazy"]')
await expect(lazy).toHaveAttribute('data-state', 'idle')
await expect(lazy).not.toHaveAttribute('src', /.+/)
await lazy.scrollIntoViewIfNeeded()
await expect(lazy).toHaveAttribute('data-state', 'loaded')

// Video: play, mute, pause
const video = page.locator('[data-testid="video-playing"]')
await expect(video).toHaveAttribute('data-state', 'ready')
await page.locator('[data-testid="video-playing-play"]').click()
await expect(video).toHaveAttribute('data-state', 'playing')
await page.locator('[data-testid="video-playing-mute"]').click()
await expect(video).toHaveAttribute('data-muted', 'true')
await page.locator('[data-testid="video-playing-play"]').click()
await expect(video).toHaveAttribute('data-state', 'paused')

// Broken video
await expect(page.locator('[data-testid="video-broken"]')).toHaveAttribute('data-state', 'error')
await expect(page.locator('[data-testid="video-broken-play"]')).toBeDisabled()

// Carousel: wraps from slide 1 back to slide 3
const carousel = page.locator('[data-testid="hero-carousel"]')
await page.locator('[data-testid="hero-prev"]').click()
await expect(carousel).toHaveAttribute('data-active-slide', '3')
await expect(page.locator('[data-slide="3"]')).toBeVisible()

// Announcement bar stays closed after a reload
await page.locator('[data-testid="announcement-close"]').click()
await page.reload()
await expect(page.locator('[data-testid="announcement-bar"]')).toBeHidden()
await page.locator('[data-testid="reset-banners"]').click()
await expect(page.locator('[data-testid="announcement-bar"]')).toBeVisible()
```

### Login flow

```js
// Playwright — log in and land on the playground
await page.goto('https://localhost:3000/login')
await page.locator('[data-testid="login-email"]').fill('alice@example.com')
await page.locator('[data-testid="login-password"]').fill('hunter2pass')
await page.locator('[data-testid="login-submit"]').click()
await expect(page).toHaveURL('https://localhost:3000/')

// Toggle password visibility
await page.locator('[data-testid="login-password-toggle"]').click()
await expect(page.locator('[data-testid="login-password"]')).toHaveAttribute('type', 'text')
```

### Signup validation

```js
// Mismatched passwords surface a field-level error
await page.goto('https://localhost:3000/signup')
await page.locator('[data-testid="signup-password"]').fill('password123')
await page.locator('[data-testid="signup-confirm"]').fill('different123')
await page.locator('[data-testid="signup-submit"]').click()
await expect(page.locator('[data-testid="signup-confirm-error"]')).toBeVisible()
```

### Test Pet Store CRUD

```js
// Add a pet and assert it appears in the grid
await page.locator('[data-testid="pets-add-button"]').click()
await page.locator('[data-testid="pet-form-name"]').fill('Fido')
await page.locator('[data-testid="pet-form-status"]').selectOption('available')
await page.locator('[data-testid="pet-form-save"]').click()
await expect(page.locator('[data-testid="pet-toast"]')).toContainText('Pet added')

// Filter by status
await page.locator('[data-testid="pets-filter-available"]').click()
await expect(page.locator('[data-testid="pets-grid"] .pet-card')).toHaveCount(1)

// Delete a pet (confirm dialog is a native window.confirm)
page.on('dialog', dialog => dialog.accept())
await page.locator('[data-testid^="pet-delete-"]').first().click()
await expect(page.locator('[data-testid="pet-toast"]')).toContainText('Pet deleted')
```

### Ownership isolation

Each account only ever sees its own pets — useful for testing multi-tenant assumptions:

```js
// Log in as a second account and confirm the store starts empty
await page.goto('https://localhost:3000/login')
await page.locator('[data-testid="login-email"]').fill('bob@example.com')
await page.locator('[data-testid="login-password"]').fill('hunter2pass')
await page.locator('[data-testid="login-submit"]').click()
await page.locator('[data-testid="nav-test-pet-store"]').click()
await expect(page.locator('[data-testid="pets-empty"]')).toBeVisible()
```

---

## Troubleshooting

**Port 3000 already in use**

```bash
# macOS: find and kill the process using port 3000
lsof -ti:3000 | xargs kill -9
npm run dev
```

```powershell
# Windows (PowerShell): find and kill the process using port 3000
Get-NetTCPConnection -LocalPort 3000 -State Listen | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
npm run dev
```

**`npm install` fails with Node version errors**

Upgrade Node to 20.19+ or 22.12+ (setup prints which Node it found and where). Using [nvm](https://github.com/nvm-sh/nvm):

```bash
nvm install 22
nvm use 22
npm install
```

**Vite not found after install**

```bash
# Run directly via npx
npx vite
```

**Shadow DOM elements not found in automation**

Standard CSS selectors do not cross shadow boundaries. Use the pierce selector (`>>`) or evaluate to access `shadowRoot` directly, as shown in the [Shadow DOM note](#shadow-dom-section-19) above.

**Drag & drop not working with mouse simulation**

Some frameworks require explicit `pointerdown → pointermove → pointerup` sequences. If `dragAndDrop` fails, try Playwright's mouse API:

```js
const source = page.locator('[data-drag-id="drag-1"]')
const target = page.locator('[data-drag-id="drag-3"]')
await source.dragTo(target)
```

**API fails to start — `ECONNREFUSED 127.0.0.1:27017`**

MongoDB isn't running. Either use the bundled script, which starts Mongo for you:

```bash
npm run start:all        # macOS
npm run start:all:win    # Windows
```

or start it manually:

```bash
# macOS
brew services start <formula>   # find it with: brew list | grep mongodb-community
```

```powershell
# Windows (Administrator PowerShell)
Start-Service MongoDB
```

**macOS: `brew services` says "has not implemented #plist, #service or provided a locatable service file"**

Homebrew updated the MongoDB formula to a newer version than the one installed, so `brew services` looks for a service file that doesn't exist yet. The start and setup scripts detect this and start `mongod` directly instead (and `npm run stop:all` shuts it down), so they keep working. To fix `brew services` itself, upgrade the MongoDB formula you have installed (find it with `brew list | grep mongodb-community`):

```bash
brew upgrade <formula>   # e.g. mongodb-community or mongodb-community@8.0
```

**Setup says "Couldn't start MongoDB automatically"**

Your MongoDB isn't a Homebrew service and has no Homebrew config file, so setup can't know how you normally run it. Start MongoDB the way you usually do, so it listens on `127.0.0.1:27017`, then re-run `npm run setup`.

**macOS: Homebrew starts compiling Node or Rust from source**

Homebrew no longer ships prebuilt packages for Intel Macs, so installing or upgrading `mongosh` (or `node`) through Homebrew can mean hours of compiling. The setup avoids this by installing MongoDB with `--without-mongosh` and getting `mongosh` from npm instead. If a `brew upgrade` starts building `rust` or `node`, it's safe to press `Ctrl+C`; the packages you already have keep working.

**Port 4000 already in use**

```bash
# macOS
lsof -ti:4000 | xargs kill -9
```

```powershell
# Windows (PowerShell)
Get-NetTCPConnection -LocalPort 4000 -State Listen | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

**Windows: "running scripts is disabled on this system"**

PowerShell's execution policy is blocking the `.ps1` file. `npm run setup:win` / `start:all:win` / `stop:all:win` already bypass it for that one run. If you run a script yourself, launch it the same way:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\setup.ps1
```

**Windows: "Could not start (or stop) the MongoDB service"**

Controlling a Windows service usually needs admin rights. Open PowerShell with **Run as administrator** and run `Start-Service MongoDB` (or `Stop-Service MongoDB`), then run the npm command again.

**Setup fails with "cdn.sheetjs.com unreachable"**

SheetJS is installed from `cdn.sheetjs.com`, not the npm registry (see [Installation](#installation)), and your network blocked it. Allow `https://cdn.sheetjs.com` through your proxy or firewall, or set npm's proxy (`npm config set https-proxy http://your-proxy:port`), then re-run setup. Once it's installed, later installs reuse it.

**Start says "Node vX is too old for this project"**

The project needs Node 20.19+ or 22.12+. Upgrade Node the way it was installed (`brew upgrade node`, `nvm install 22`, `winget upgrade OpenJS.NodeJS.LTS`, or the installer from [nodejs.org](https://nodejs.org)); the message shows which `node` it found. Then run `npm run setup` (or `npm run setup:win`) so the packages are rebuilt for the new Node, and start again.

**Start says "Missing or out-of-date npm packages"**

The code needs packages that aren't installed yet, usually after pulling changes that add one. Run `npm run setup` (or `npm run setup:win`), then start again.

**Keeping SheetJS up to date**

Because SheetJS isn't installed from the npm registry, `npm audit`, `npm outdated` and Dependabot don't check it, and `npm audit` will always show it as clean. Check the [SheetJS advisories](https://cdn.sheetjs.com/advisories/) or the [release list](https://cdn.sheetjs.com/) now and then. To upgrade, run `npm install https://cdn.sheetjs.com/xlsx-<version>/xlsx-<version>.tgz` and commit `package.json` and `package-lock.json`.

**Logged in but every page redirects back to `/login`**

The stored JWT is missing, expired (tokens last 24h), or invalid. Log in again, or inspect storage in devtools — the token is under the key `tp-auth-token` in either `localStorage` (when "Remember me" was checked) or `sessionStorage`.

**Inspecting the database directly**

```bash
mongosh test-playground --eval 'db.users.find({}, {email:1,name:1}).pretty()'
mongosh test-playground --eval 'db.pets.find().pretty()'
```

These work the same in PowerShell on Windows.
