# Test Automation Playground

A React frontend built specifically for practising web automation. It covers 23 interaction types on the main page — from basic inputs to Shadow DOM — each built with deliberate, stable locator attributes so you can focus on writing tests rather than fighting selectors.

The app also includes a login-gated **Test Pet Store** page backed by a real Express + MongoDB API, so you can practise authentication flows (signup, login, remember-me, forgot-password) and full CRUD against a persisted backend — not just client-side state.

A login-gated **Media** page adds image, video and banner widgets: images and videos that load, fail, or only load when scrolled into view, plus a carousel, a promo banner, an announcement bar and a cookie-consent banner.

A login-gated **Frames** page covers iframes: a basic frame, three levels of nested frames, a frame that is added late, and several look-alike frames with no ids. Clicking inside a frame expands its card into a large overlay; one card (F5) expands only from its Expand button.

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
- [Locator Quick Reference](#locator-quick-reference)
- [Project Structure](#project-structure)
- [Automation Tester Notes](#automation-tester-notes)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

| Tool | Minimum Version | macOS | Windows |
|------|----------------|-------|---------|
| [Node.js](https://nodejs.org/) | 18.x or higher | `brew install node` | `winget install OpenJS.NodeJS.LTS` |
| npm | 9.x or higher | Bundled with Node.js | Bundled with Node.js |
| [MongoDB Community](https://www.mongodb.com/try/download/community) | Any installed version is used; new installs get 8.0 | `brew tap mongodb/brew && brew install mongodb/brew/mongodb-community@8.0 --without-mongosh` | the 8.0.32 `.msi` from mongodb.com, installed as the `MongoDB` service |
| mongosh (optional shell) | any | `npm install -g mongosh` | `winget install MongoDB.Shell` |
| Package manager (used by the setup script) | — | [Homebrew](https://brew.sh) | `winget` (comes with Windows 10/11 as "App Installer") |
| A modern browser | Latest Chrome / Edge / Firefox / Safari | | |

You don't need to install Node or MongoDB by hand — the setup script does it for you (see [Installation](#installation)). This table is for reference or manual setup.

**Supported platforms:** the scripts support **macOS** (bash + Homebrew) and **Windows 10/11** (PowerShell + winget). On **Linux** the scripts don't work yet, because they rely on Homebrew services: install Node and MongoDB with your distro's package manager, start MongoDB with `sudo systemctl start mongod`, create `certs/` and `server/.env` the same way steps 5–6 of `scripts/setup.sh` do, then run `npm install`, `npm run seed` and `npm run dev`.

Verify your environment before proceeding:

```bash
node --version    # should print v18.x.x or higher
npm --version     # should print 9.x.x or higher
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| UI framework | React 18 (+ React Router) |
| Build tool | Vite 8 |
| Styling | Plain CSS (custom properties, CSS Grid, Flexbox) |
| Backend | Express, Mongoose (MongoDB), JWT auth, bcrypt |
| Language | JavaScript (ES Modules) |
| Package manager | npm |

No external UI libraries, no CSS frameworks. The 23 playground sections are self-contained with no backend dependency; the Test Pet Store page is login-gated and persists to a local MongoDB via the bundled Express API.

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
| 1. Node.js 18+ | Used as is | Installed (Homebrew on macOS, winget on Windows) |
| 2. npm dependencies | `npm install` (no-op if up to date) | Installed |
| 3. Dev TLS certs (`certs/cert.pem`, `certs/key.pem`) | Kept | Generated (self-signed, `localhost`, 1 year) |
| 4. `server/.env` | Kept | Created from `server/.env.example` with a random `JWT_SECRET` |
| 5. MongoDB | **Any installed version is used as is** | MongoDB 8.0 is installed (`mongodb-community@8.0` via Homebrew on macOS; the 8.0.32 installer as the `MongoDB` service on Windows) |
| 6. MongoDB running on `127.0.0.1:27017` | Used as is | Started (`brew services` for whichever MongoDB formula is installed on macOS; the `MongoDB` service on Windows) |
| 7. Sample users | Left as is | Created (see [Sample login](#sample-login)) |

It also installs the optional `mongosh` shell if it's missing (from npm on macOS, winget on Windows).

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

The app includes a login-gated backend (Express + MongoDB), so the easiest way to run everything is the bundled start script. It starts MongoDB if it isn't already running (`brew services` on macOS, the `MongoDB` Windows service on Windows), then starts the Vite frontend and the Express API together:

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

**1. The 23-section playground (`/`, login required)**

- A **fixed sidebar** on the left with collapsible grouped navigation. Click a group header to expand or collapse it. The **Advanced → Data & Tables** sub-group demonstrates nested menu navigation to the Pagination Table. The active section is highlighted as you scroll.
- A **scrollable content area** on the right with 23 independent sections, each covering one interaction type.
- Each section is self-contained and designed around a single testing concern:
  - One interaction type per section — no mixed responsibilities
  - Deliberate, stable locator attributes (`id`, `data-testid`, `data-row-id`, etc.) on every interactive element
  - Visible state feedback after every interaction — output messages, event logs, counters — so assertions have clear targets
  - No external API calls from within these 23 sections — they work entirely offline once installed

**2. Auth + Test Pet Store + Media + Frames (`/login`, `/signup`, `/forgot-password`, `/account`, `/petstore`, `/media`, `/frames`)**

- The whole app is login-gated: opening any URL while logged out redirects to `/login`.
- **Login** (`/login`) — email + password, show/hide password toggle, "Remember me" (persists the session in `localStorage`; unchecked uses `sessionStorage`), and a "Forgot password?" link.
- **Signup** (`/signup`) — name, email, password, confirm password, terms checkbox, with inline field-level validation.
- **Forgot password** (`/forgot-password`) — a UI-only stub: the backend endpoint always responds `{ ok: true }` and no email is actually sent.
- **Account** (`/account`) — shows the logged-in user's name, email, and member-since date, with a logout button and a shortcut into the Test Pet Store.
- **Test Pet Store** (`/petstore`) — reached from the gradient "🐾 Test Pet Store" entry at the top of the sidebar. Full pet CRUD (add / edit / delete), status filtering (available / pending / sold), live stat tiles, and toast notifications on every mutation. Pets are persisted in MongoDB and scoped per-user — each account only ever sees its own pets.
- **Media** (`/media`) — reached from the blue "🎬 Media" entry under the Test Pet Store one in the sidebar. Nine widgets (M1–M9) for images, videos and banners; see [Media Page Reference](#media-page-reference). Works offline: the test image and video are bundled from `src/testresources/`.
- **Frames** (`/frames`) — reached from the green "🪟 Frames" entry under Media in the sidebar. Five widgets (F1–F5) for iframes; see [Frames Page Reference](#frames-page-reference).

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

---

## Auth & Test Pet Store Reference

### Pages & routes

| Route | Access | Purpose |
|-------|--------|---------|
| `/login` | Public | Email + password, remember-me, forgot-password link |
| `/signup` | Public | Name, email, password, confirm, terms |
| `/forgot-password` | Public | Stub — always confirms, no email sent |
| `/` | Protected | The 23-section playground |
| `/account` | Protected | Logged-in user's profile + logout |
| `/petstore` | Protected | Test Pet Store — pet CRUD |
| `/media` | Protected | Media page — images, videos, banners |
| `/frames` | Protected | Frames page — basic, nested, late-loading and multiple iframes |

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

**Expanding a card:** each card has `data-expand-on` set to `click` or `button`, and `data-expanded="true|false"`.

- **F1–F4 (`data-expand-on="click"`)** expand when you press anywhere inside one of their frames, click the card itself, or click **⤢ Expand** (`data-testid="{section-id}-toggle"`). Events inside a frame never reach the page, so each frame tells the page about presses with `window.top.postMessage({ type: 'tp-frame-click', card: '<section id>' }, '*')`. This works from every nesting level in F2. The press still reaches the element it landed on, so a test can click the input, let the card expand, and keep typing.
- **F5 (`data-expand-on="button"`)** expands only from **⤢ Expand**. Its frame doesn't report presses, and clicking the card does nothing.

The card element stays the same when it expands, so frames don't reload and what you typed stays put. Close it with **✕ Close**, the backdrop (`data-testid="frame-backdrop"`) or `Escape` (Escape only works while focus is outside the frame).

**Language switch:** switching English ↔ Arabic rebuilds each frame's content, which reloads all frames and clears what was typed in them.

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
```

### Sidebar

```
data-testid="nav-test-pet-store"    Gradient "Test Pet Store" nav entry
data-testid="nav-media"             Media nav entry
data-testid="nav-frames"            Frames nav entry
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
│   ├── start.sh / .ps1      Starts MongoDB (if needed) + frontend + API — npm run start:all / start:all:win
│   └── stop.sh / .ps1       Stops frontend + API + MongoDB — npm run stop:all / stop:all:win
├── server/                 Express + MongoDB API (port 4000)
│   ├── index.js             App bootstrap, middleware, route mounting
│   ├── db.js                Mongoose connection
│   ├── seed.js              Creates the sample users and pets — npm run seed
│   ├── .env / .env.example  MONGO_URI, JWT_SECRET, PORT
│   ├── models/
│   │   ├── User.js
│   │   └── Pet.js
│   ├── middleware/
│   │   └── auth.js          JWT verification (requireAuth)
│   └── routes/
│       ├── auth.js          signup / login / forgot-password / me / logout
│       └── pets.js          Pet CRUD, scoped to the authenticated user
└── src/
    ├── main.jsx            React root — BrowserRouter + AuthProvider + <App />
    ├── App.jsx             23 section components, sidebar nav, route shell
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
    │   └── FramesPage.jsx    Frames page — basic, nested, late-loading, multiple and button-only iframes (F1–F5)
    ├── testresources/
    │   ├── testimage.jpg     Image used by the Media page
    │   └── testvideo.mp4     Video used by the Media page
    └── ui.jsx              Shared SectionHeader / Output components
```

---

## Automation Tester Notes

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

Upgrade Node to 18 or higher. Using [nvm](https://github.com/nvm-sh/nvm):

```bash
nvm install 18
nvm use 18
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

**Logged in but every page redirects back to `/login`**

The stored JWT is missing, expired (tokens last 24h), or invalid. Log in again, or inspect storage in devtools — the token is under the key `tp-auth-token` in either `localStorage` (when "Remember me" was checked) or `sessionStorage`.

**Inspecting the database directly**

```bash
mongosh test-playground --eval 'db.users.find({}, {email:1,name:1}).pretty()'
mongosh test-playground --eval 'db.pets.find().pretty()'
```

These work the same in PowerShell on Windows.
