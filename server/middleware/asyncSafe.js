// Makes a router's async handlers safe under Express 4, which ignores a rejected
// promise: without this, an error thrown after an `await` never reaches the error
// handler in index.js, and Node exits on the unhandled rejection.

/**
 * Wraps every handler registered through the router's verb methods so a rejected
 * promise is passed to `next(err)`. Error handlers (four arguments) are left alone,
 * since wrapping them would hide their arity from Express.
 * @param router An express.Router(), before any routes are added.
 * @returns The same router.
 */
export function asyncSafe(router) {
  for (const method of ['get', 'post', 'put', 'patch', 'delete']) {
    const register = router[method].bind(router)
    router[method] = (path, ...handlers) =>
      register(
        path,
        ...handlers.map(h =>
          typeof h === 'function' && h.length < 4
            ? (req, res, next) => Promise.resolve(h(req, res, next)).catch(next)
            : h,
        ),
      )
  }
  return router
}
