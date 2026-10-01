# Test Automation Playground

A React frontend built specifically for practising web automation. It covers 22 interaction types — from basic inputs to Shadow DOM and iFrames — each built with deliberate, stable locator attributes so you can focus on writing tests rather than fighting selectors.

The app also includes a login-gated **Test Pet Store** page backed by a real Express + MongoDB API, so you can practise authentication flows (signup, login, remember-me, forgot-password) and full CRUD against a persisted backend — not just client-side state.

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
- [Locator Quick Reference](#locator-quick-reference)
- [Project Structure](#project-structure)
- [Automation Tester Notes](#automation-tester-notes)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

| Tool | Minimum Version | How to Install |
|------|----------------|----------------|
| [Node.js](https://nodejs.org/) | 18.x or higher | Download from nodejs.org or use `brew install node` |
| npm | 9.x or higher | Bundled with Node.js |
| [MongoDB Community](https://www.mongodb.com/try/download/community) | 7.x or higher | `brew tap mongodb/brew && brew install mongodb-community mongosh` |
| A modern browser | Latest Chrome / Edge / Firefox / Safari | For manual browsing and automation targets |

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

No external UI libraries, no CSS frameworks. The 22 playground sections are self-contained with no backend dependency; the Test Pet Store page is login-gated and persists to a local MongoDB via the bundled Express API.

---

## Installation

```bash
# 1. Navigate to the project directory
cd test-playground

# 2. One-time setup — installs Node/MongoDB if missing, runs npm install,
#    generates dev TLS certs (certs/*.pem) and server/.env if they don't exist yet
npm run setup
```

`npm run setup` is safe to re-run — it detects what's already in place and only does the missing parts. If you're setting up manually instead, run `npm install` yourself and see [Prerequisites](#prerequisites) for MongoDB.

---

## Running the App

### Start everything (MongoDB + API + frontend)

The app now includes a login-gated backend (Express + MongoDB), so the easiest way to run everything is the bundled start script — it starts MongoDB (via `brew services`, if not already running) and then the Vite frontend + Express API together:

```bash
npm run start:all
```

The app will be available at **https://localhost:3000** and the API at **http://localhost:4000**.

To stop everything (frontend, API, and MongoDB):

```bash
npm run stop:all
```

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

**1. The 22-section playground (`/`, login required)**

- A **fixed sidebar** on the left with collapsible grouped navigation. Click a group header to expand or collapse it. The **Advanced → Data & Tables** sub-group demonstrates nested menu navigation to the Pagination Table. The active section is highlighted as you scroll.
- A **scrollable content area** on the right with 22 independent sections, each covering one interaction type.
- Each section is self-contained and designed around a single testing concern:
  - One interaction type per section — no mixed responsibilities
  - Deliberate, stable locator attributes (`id`, `data-testid`, `data-row-id`, etc.) on every interactive element
  - Visible state feedback after every interaction — output messages, event logs, counters — so assertions have clear targets
  - No external API calls from within these 22 sections — they work entirely offline once installed

**2. Auth + Test Pet Store (`/login`, `/signup`, `/forgot-password`, `/account`, `/petstore`)**

- The whole app is login-gated: opening any URL while logged out redirects to `/login`.
- **Login** (`/login`) — email + password, show/hide password toggle, "Remember me" (persists the session in `localStorage`; unchecked uses `sessionStorage`), and a "Forgot password?" link.
- **Signup** (`/signup`) — name, email, password, confirm password, terms checkbox, with inline field-level validation.
- **Forgot password** (`/forgot-password`) — a UI-only stub: the backend endpoint always responds `{ ok: true }` and no email is actually sent.
- **Account** (`/account`) — shows the logged-in user's name, email, and member-since date, with a logout button and a shortcut into the Test Pet Store.
- **Test Pet Store** (`/petstore`) — reached from the gradient "🐾 Test Pet Store" entry at the top of the sidebar. Full pet CRUD (add / edit / delete), status filtering (available / pending / sold), live stat tiles, and toast notifications on every mutation. Pets are persisted in MongoDB and scoped per-user — each account only ever sees its own pets.

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
| 18 | iFrame | Interact with elements inside an embedded frame | `id` (frame context) |
| 19 | Shadow DOM | Type into and read from an encapsulated shadow root | `data-testid`, shadow root |
| 20 | Pagination Table | Search, paginate, assert row data | `id`, `data-row-id`, `data-page` |
| 21 | Show / Hide & Tabs | Expand/collapse panels, switch tabs, assert content | `className`, `role` |
| 22 | Popup Alerts | Trigger warning, error, and exception modals, assert visibility and dismiss | `id`, `role` |

---

## Auth & Test Pet Store Reference

### Pages & routes

| Route | Access | Purpose |
|-------|--------|---------|
| `/login` | Public | Email + password, remember-me, forgot-password link |
| `/signup` | Public | Name, email, password, confirm, terms |
| `/forgot-password` | Public | Stub — always confirms, no email sent |
| `/` | Protected | The 22-section playground |
| `/account` | Protected | Logged-in user's profile + logout |
| `/petstore` | Protected | Test Pet Store — pet CRUD |

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
#practice-iframe        The iframe element (section 18)
#iframe-input           Input inside the iframe (section 18)
#iframe-btn             Button inside the iframe (section 18)
#iframe-result          Result text inside the iframe (section 18)
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

### Inside the iFrame (`#practice-iframe`)

Access these only after switching to the frame context:

```
#iframe-input     Text field inside the iframe
#iframe-btn       Button inside the iframe
#iframe-result    Result text inside the iframe
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
├── scripts/
│   ├── setup.sh             One-time bootstrap (Node, Mongo, certs, .env) — npm run setup
│   ├── start.sh             Starts MongoDB (if needed) + frontend + API — npm run start:all
│   └── stop.sh              Stops frontend + API + MongoDB — npm run stop:all
├── server/                 Express + MongoDB API (port 4000)
│   ├── index.js             App bootstrap, middleware, route mounting
│   ├── db.js                Mongoose connection
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
    ├── App.jsx             22 section components, sidebar nav, route shell
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
    └── petstore/
        ├── PetstorePage.jsx  Hero, stats, filters, grid, FAB, toasts
        ├── PetCard.jsx
        ├── PetFormModal.jsx
        ├── petAvatars.js     Emoji avatar mapping
        └── api.js            listPets / createPet / updatePet / deletePet
```

---

## Automation Tester Notes

### iFrame (Section 18)

Switch to the frame context before interacting with elements inside it.

```js
// Playwright
const frame = page.frameLocator('#practice-iframe')
await frame.locator('#iframe-input').fill('hello')
await frame.locator('#iframe-btn').click()
await expect(frame.locator('#iframe-result')).toHaveText('Value: "hello"')
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
# Find and kill the process using port 3000
lsof -ti:3000 | xargs kill -9
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
npm run start:all
```

or start it manually:

```bash
brew services start mongodb-community
```

**Port 4000 already in use**

```bash
lsof -ti:4000 | xargs kill -9
```

**Logged in but every page redirects back to `/login`**

The stored JWT is missing, expired (tokens last 24h), or invalid. Log in again, or inspect storage in devtools — the token is under the key `tp-auth-token` in either `localStorage` (when "Remember me" was checked) or `sessionStorage`.

**Inspecting the database directly**

```bash
mongosh test-playground --eval 'db.users.find({}, {email:1,name:1}).pretty()'
mongosh test-playground --eval 'db.pets.find().pretty()'
```
