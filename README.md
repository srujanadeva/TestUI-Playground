# Test Automation Playground

A React frontend built specifically for practising web automation. It covers 22 interaction types — from basic inputs to Shadow DOM and iFrames — each built with deliberate, stable locator attributes so you can focus on writing tests rather than fighting selectors.

Compatible with **Playwright**, **Selenium**, **Cypress**, and any other browser automation framework.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Running the App](#running-the-app)
- [What the App Does](#what-the-app-does)
- [Section Reference](#section-reference)
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
| UI framework | React 18 |
| Build tool | Vite 5 |
| Styling | Plain CSS (custom properties, CSS Grid, Flexbox) |
| Language | JavaScript (ES Modules) |
| Package manager | npm |

No external UI libraries, no CSS frameworks. All components are self-contained to keep the DOM clean and predictable for automation.

---

## Installation

```bash
# 1. Navigate to the project directory
cd test-playground

# 2. Install dependencies
npm install
```

---

## Running the App

### Development server

This is the recommended mode for automation practice — hot-reloads on any source changes.

```bash
npm run dev
```

The app will be available at **http://localhost:3000**

### Production build

```bash
npm run build      # Compiles and bundles output to /dist
npm run preview    # Serves the built output on a local static server
```

---

## What the App Does

The playground is a single-page app with:

- A **fixed sidebar** on the left with collapsible grouped navigation. Click a group header to expand or collapse it. The **Advanced → Data & Tables** sub-group demonstrates nested menu navigation to the Pagination Table. The active section is highlighted as you scroll.
- A **scrollable content area** on the right with 22 independent sections, each covering one interaction type.

Each section is self-contained and designed around a single testing concern:

- One interaction type per section — no mixed responsibilities
- Deliberate, stable locator attributes (`id`, `data-testid`, `data-row-id`, etc.) on every interactive element
- Visible state feedback after every interaction — output messages, event logs, counters — so assertions have clear targets
- No external API calls or backend dependencies — the app works entirely offline once installed

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
├── vite.config.js          Vite config — dev server runs on port 3000
├── package.json            Dependencies and npm scripts
└── src/
    ├── main.jsx            React root — mounts <App /> into #root
    ├── App.jsx             All 22 section components + sidebar navigation
    └── App.css             All styles — layout, components, utilities
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
