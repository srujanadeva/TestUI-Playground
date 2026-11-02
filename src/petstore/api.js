// Calls to the pets API (/api/pets). Each one needs the signed-in user's token
// and throws an ApiError on failure (see api/client.js).
import { apiFetch } from '../api/client.js'

/**
 * Lists the user's pets, newest first.
 * @param status "available" | "pending" | "sold" to filter on the server; omit or "all" for every pet.
 * @returns `{ pets }`.
 */
export function listPets({ status, token }) {
  const q = status && status !== 'all' ? `?status=${encodeURIComponent(status)}` : ''
  return apiFetch(`/api/pets${q}`, { token })
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
