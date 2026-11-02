# Test Playground

A practice site for UI test automation: a React app (Vite, port 3000) and an Express +
MongoDB API (port 4000). `bash setup.sh` (Windows: double-click `setup.cmd`) installs everything and starts
the app; after that `npm run start:all` (Windows: `:win`). Setup logic and versions: `setup.sh`, `scripts/`.

## Project layout

| Where | What |
|---|---|
| `src/App.jsx` | Routes only: the auth pages, and the signed-in Shell (sidebar + `PAGES` table) |
| `src/layout/Sidebar.jsx` | Sidebar, plus `NAV`: the Playground section list used by the sidebar and the scroll-spy |
| `src/playground/` | The home page: `PlaygroundPage.jsx` and the numbered sections, grouped into `inputs`, `selection`, `buttons`, `events`, `windows`, `advanced`, `workflows` |
| `src/<feature>/` | One folder per themed page (`media`, `frames`, `data`, …), plus `auth` and `petstore` |
| `src/i18n.jsx` | Language context and `t()`; merges every `strings.js` file |
| `src/**/strings.js`, `src/playground/*.strings.js`, `src/common.strings.js` | The text, one file per feature |
| `src/ui.jsx` | `SectionHeader`, `Output`, `numberParam` shared by all pages |
| `server/` | API: `routes/` per feature, `models/`, `middleware/auth.js` |

### Adding things

- **A themed page:** create `src/<feature>/<Feature>Page.jsx` and `src/<feature>/strings.js`,
  add the page to `PAGES` in `App.jsx`, its link to `PAGE_LINKS` in `Sidebar.jsx`, and its
  strings module to `MODULES` in `i18n.jsx`. No `ProtectedRoute` needed: the whole Shell is guarded.
- **A Playground section:** add the component to the matching group file and render it in
  `PlaygroundPage.jsx`; add its `id` to `NAV` so the sidebar and the scroll-spy know it.
- **A Playground group file** should stay roughly under 350 lines; split it rather than grow it.
- **Text:** never hard-code UI text. Add the key to the feature's `strings.js`, in **both**
  `en` and `ar`. Keys share one namespace across all files; in development the console
  warns about a duplicate key or one missing from a language. Keys built at runtime
  (``t(`cd_${state}`)``) must still exist for every value the variable can take.

### Testing

The repo has no automated test suite. After a change, run `npm run build`, open the affected
pages in both languages (the Arabic toggle flips the layout to RTL) and check the browser
console. Most timers can be pinned with URL params (`?delay=0`, `?feedInterval=`, …; see
`numberParam` and each page's file header).

## Code comments

Comments explain what a file or function is for and why the code is the way it is.
They do not narrate what the code already says.

### 1. File header: every `.js` / `.jsx` file

1–3 lines of `//` at the very top, above the imports: what the file is responsible for,
plus anything a newcomer would trip on (in-memory only, served from another port,
`?delay=` controls timing, …).

```js
// CRUD routes for the signed-in user's pets (/api/pets). Every query is
// scoped to req.user.id, so a user can never read or change another user's pets.
import { Router } from 'express'
```

### 2. Functions: JSDoc

Every exported or top-level function, component, hook and class gets a JSDoc block.

- A description is always required.
- `@param` / `@returns` on utility functions and server helpers. On components and hooks,
  only for props or return values whose meaning isn't obvious.
- No `{type}` braces unless they genuinely help; nothing checks them, so they drift.

```js
/**
 * Copies only the fields a client may set, trimmed and type-checked, so a
 * request body can't set ownerId or other server-owned fields.
 * @param body Raw request body; anything unknown is dropped.
 * @returns The safe subset to pass to Mongoose.
 */
function sanitizeBody(body = {}) {
```

### 3. Where JSDoc doesn't fit: `//`

- Express route handlers (anonymous callbacks) get the route signature:
  `// POST /otp/verify { code }`.
- Section banners on the element pages stay as they are (`// ─── D6. Virtualised list ───`);
  the JSDoc goes on the component below the banner.
- Constants and module-level state get a trailing `//` where the meaning isn't obvious
  (`// id -> { userId, answer, expires }`).

### 4. Logic: `//`, only where a reader would ask "why?"

Magic numbers and byte offsets, browser behaviour that isn't obvious, security or
data-safety reasons, math that isn't self-evident, and anything that would break if
someone "simplified" it. Give the reason, not a replay of the steps.

### Exempt

Short handlers inside a component whose name says it all (`reset`, `toggle`, `close`,
`startEdit`) and one-line helpers like `isSorted` or `swap`.

### Not allowed

- Comments that restate the code (`// set loading to true`).
- History or changelog notes (`// changed in v2`, `// fixed bug`); that belongs in git.
- Commented-out code.
- `TODO`s without a reason.
