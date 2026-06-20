import { apiFetch } from '../api/client.js'

export function listPets({ status, token }) {
  const q = status && status !== 'all' ? `?status=${encodeURIComponent(status)}` : ''
  return apiFetch(`/api/pets${q}`, { token })
}

export function createPet(body, token) {
  return apiFetch('/api/pets', { method: 'POST', body, token })
}

export function updatePet(id, body, token) {
  return apiFetch(`/api/pets/${id}`, { method: 'PUT', body, token })
}

export function deletePet(id, token) {
  return apiFetch(`/api/pets/${id}`, { method: 'DELETE', token })
}
