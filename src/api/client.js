// Thin fetch wrapper used for every call to the API server. It always resolves
// to parsed JSON or throws an ApiError, so callers only handle one kind of failure.

/**
 * A failed API call.
 * `status` is the HTTP status, or 0 when the request never got a response
 * (offline, server down, or aborted by a reload). `payload` is the parsed error body.
 */
export class ApiError extends Error {
  constructor(message, status, payload) {
    super(message)
    this.status = status
    this.payload = payload
  }
}

/**
 * Calls the API and returns the parsed response body.
 * @param path Request path, e.g. "/api/pets" (proxied to the API server by Vite).
 * @param options.body A plain object (sent as JSON) or FormData (sent as multipart).
 * @param options.token JWT sent as a Bearer token, for protected routes.
 * @returns The parsed JSON, `{ raw }` if the body isn't JSON, or null if it is empty.
 * @throws ApiError for network failures and any non-2xx response.
 */
export async function apiFetch(path, { method = 'GET', body, token } = {}) {
  // FormData is sent as is, so the browser sets the multipart boundary itself.
  const isForm = body instanceof FormData
  const headers = isForm ? {} : { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`

  let res
  try {
    res = await fetch(path, {
      method,
      headers,
      body: body == null ? undefined : isForm ? body : JSON.stringify(body),
    })
  } catch (err) {
    throw new ApiError(err.message || 'Network error', 0, null)
  }

  let data = null
  const text = await res.text()
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = { raw: text }
    }
  }

  if (!res.ok) {
    throw new ApiError(data?.error || `Request failed (${res.status})`, res.status, data)
  }
  return data
}
