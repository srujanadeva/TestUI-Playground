# Test Playground

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
