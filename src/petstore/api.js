// Calls to the pets API (/api/pets). Each one needs the signed-in user's token
// and throws an ApiError on failure (see api/client.js).
import { apiFetch } from '../api/client.js'

/**
 * Lists one page of the user's pets, newest first.
 * @param status "available" | "pending" | "sold" to filter on the server; omit or "all" for every pet.
 * @param q Search text matched against name, category and tags.
 * @returns `{ pets, page, pages, limit, total, counts }`; see GET /api/pets in server/routes/pets.js.
 */
export function listPets({ status, q, page, limit, token }) {
  const params = new URLSearchParams()
  if (status && status !== 'all') params.set('status', status)
  if (q) params.set('q', q)
  if (page) params.set('page', String(page))
  if (limit) params.set('limit', String(limit))
  const qs = params.toString()
  return apiFetch(`/api/pets${qs ? `?${qs}` : ''}`, { token })
}

/**
 * Creates a pet.
 * @param body `{ name, status?, category?, photoUrls?, tags? }`; name is required.
 * @returns `{ pet }` as saved, including its new id.
 */
export function createPet(body, token) {
  return apiFetch('/api/pets', { method: 'POST', body, token })
}

/**
 * Updates the fields given in `body` on one pet.
 * @param body May include the `updatedAt` last read, so the save fails with a 409
 *   ApiError if the pet has changed since.
 * @returns `{ pet }` after the update.
 */
export function updatePet(id, body, token) {
  return apiFetch(`/api/pets/${id}`, { method: 'PUT', body, token })
}

/**
 * Deletes one pet.
 * @returns `{ ok: true }`.
 */
export function deletePet(id, token) {
  return apiFetch(`/api/pets/${id}`, { method: 'DELETE', token })
}
