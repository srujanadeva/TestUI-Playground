export class ApiError extends Error {
  constructor(message, status, payload) {
    super(message)
    this.status = status
    this.payload = payload
  }
}

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
