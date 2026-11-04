// CRUD routes for the signed-in user's pets (/api/pets). Every query is
// scoped to req.user.id, so a user can never read or change another user's pets.
import { Router } from 'express'
import mongoose from 'mongoose'
import { Pet } from '../models/Pet.js'
import { requireAuth } from '../middleware/auth.js'
import { asyncSafe } from '../middleware/asyncSafe.js'

const router = asyncSafe(Router())

router.use(requireAuth)

const VALID_STATUS = ['available', 'pending', 'sold']

// Kept in step with the maxLength attributes in src/petstore/PetFormModal.jsx.
const LIMITS = { name: 50, category: 30, tag: 20, tags: 10, photoUrl: 500, photoUrls: 5 }

/**
 * Copies only the fields a client may set, trimmed and type-checked, so a
 * request body can't set ownerId or other server-owned fields.
 * Tags without a numeric id are numbered by position; blank tags and photo URLs are dropped.
 * @param body Raw request body; anything unknown is dropped.
 * @returns The safe subset to pass to Mongoose.
 */
function sanitizeBody(body = {}) {
  const out = {}
  if (typeof body.name === 'string') out.name = body.name.trim()
  if (body.category && typeof body.category === 'object') {
    out.category = {
      id: Number.isFinite(body.category.id) ? body.category.id : undefined,
      name: typeof body.category.name === 'string' ? body.category.name.trim() : undefined,
    }
  }
  if (Array.isArray(body.photoUrls)) {
    out.photoUrls = body.photoUrls.filter(u => typeof u === 'string' && u.trim()).map(u => u.trim())
  }
  if (Array.isArray(body.tags)) {
    out.tags = body.tags
      .filter(t => t && typeof t === 'object')
      .map((t, i) => ({
        id: Number.isFinite(t.id) ? t.id : i + 1,
        name: typeof t.name === 'string' ? t.name.trim() : '',
      }))
      .filter(t => t.name)
  }
  if (typeof body.status === 'string' && VALID_STATUS.includes(body.status)) {
    out.status = body.status
  }
  return out
}

/** True for an absolute http(s) URL. */
function isHttpUrl(s) {
  try {
    const { protocol } = new URL(s)
    return protocol === 'http:' || protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * Checks a sanitized body against the field rules. Only fields present are
 * checked, so a partial PUT passes; name is required only when `isCreate`.
 * Runs before Mongoose so a bad body gets a 400 with a message a person can
 * read, instead of Mongoose's ValidationError text.
 * @param data Output of sanitizeBody.
 * @returns An error message for the first rule broken, or null.
 */
function validate(data, isCreate) {
  if (isCreate || 'name' in data) {
    if (!data.name) return 'Pet name is required'
    if (data.name.length > LIMITS.name) return `Pet name must be at most ${LIMITS.name} characters`
  }
  if (data.category?.name && data.category.name.length > LIMITS.category) {
    return `Category must be at most ${LIMITS.category} characters`
  }
  if (data.tags) {
    if (data.tags.length > LIMITS.tags) return `At most ${LIMITS.tags} tags`
    if (data.tags.some(t => t.name.length > LIMITS.tag)) return `Each tag must be at most ${LIMITS.tag} characters`
  }
  if (data.photoUrls) {
    if (data.photoUrls.length > LIMITS.photoUrls) return `At most ${LIMITS.photoUrls} photo URLs`
    if (data.photoUrls.some(u => u.length > LIMITS.photoUrl || !isHttpUrl(u))) {
      return `Each photo URL must be an http(s) URL of at most ${LIMITS.photoUrl} characters`
    }
  }
  return null
}

/**
 * Reads a positive whole number from the query string, clamped to [1, max].
 * @returns The number, or `fallback` when the value is missing or not a number.
 */
function intParam(value, fallback, max) {
  const n = Number.parseInt(value, 10)
  return Number.isFinite(n) ? Math.min(Math.max(n, 1), max) : fallback
}

/** Escapes a string for literal use inside a RegExp, so a search for "a.b" or "(" is plain text. */
function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// GET /?status=&q=&page=1&limit=12 → { pets, page, pages, limit, total, counts }, newest first.
// `q` matches name, category or a tag, case-insensitively. `total` and `pages` count the
// matching pets; `counts` ({ all, available, pending, sold }) always covers every pet
// the user has, for the stat tiles. A page past the end returns the last page.
router.get('/', async (req, res) => {
  const ownerId = new mongoose.Types.ObjectId(req.user.id)
  const query = { ownerId }
  if (req.query.status && VALID_STATUS.includes(req.query.status)) {
    query.status = req.query.status
  }
  const q = typeof req.query.q === 'string' ? req.query.q.trim().slice(0, LIMITS.name) : ''
  if (q) {
    const re = new RegExp(escapeRegExp(q), 'i')
    query.$or = [{ name: re }, { 'category.name': re }, { 'tags.name': re }]
  }
  const limit = intParam(req.query.limit, 12, 100)

  const [total, byStatus] = await Promise.all([
    Pet.countDocuments(query),
    Pet.aggregate([{ $match: { ownerId } }, { $group: { _id: '$status', n: { $sum: 1 } } }]),
  ])
  const pages = Math.max(1, Math.ceil(total / limit))
  const page = Math.min(intParam(req.query.page, 1, Number.MAX_SAFE_INTEGER), pages)
  // _id breaks ties between pets created in the same millisecond (the seed does
  // that), so no pet can appear on two pages or none.
  const pets = await Pet.find(query)
    .sort({ createdAt: -1, _id: -1 })
    .skip((page - 1) * limit)
    .limit(limit)

  const counts = { all: 0, available: 0, pending: 0, sold: 0 }
  for (const { _id, n } of byStatus) {
    if (_id in counts) counts[_id] = n
    counts.all += n
  }
  res.json({ pets: pets.map(p => p.toJSON()), page, pages, limit, total, counts })
})

// POST / { name, category?, photoUrls?, tags?, status? } → 201 { pet }, or 400 { error } (see validate)
router.post('/', async (req, res) => {
  const data = sanitizeBody(req.body)
  const error = validate(data, true)
  if (error) return res.status(400).json({ error })
  const pet = await Pet.create({ ...data, ownerId: req.user.id })
  res.status(201).json({ pet: pet.toJSON() })
})

// GET /:id → { pet }
router.get('/:id', async (req, res) => {
  // A malformed id would make Mongoose throw a CastError; treat it as not found instead.
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: 'Not found' })
  const pet = await Pet.findOne({ _id: req.params.id, ownerId: req.user.id })
  if (!pet) return res.status(404).json({ error: 'Not found' })
  res.json({ pet: pet.toJSON() })
})

// PUT /:id { …fields to change, updatedAt? } → { pet }, or 400 { error }. Only the fields
// sent are updated. `updatedAt` is the value the client last read: if the pet has changed
// since, nothing is saved and the answer is 409 { error, pet } with the current pet.
// Without it, the last save wins.
router.put('/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: 'Not found' })
  const data = sanitizeBody(req.body)
  const error = validate(data, false)
  if (error) return res.status(400).json({ error })

  const filter = { _id: req.params.id, ownerId: req.user.id }
  const expected = req.body?.updatedAt
  if (expected !== undefined) {
    const at = new Date(expected)
    if (typeof expected !== 'string' || Number.isNaN(at.getTime())) {
      return res.status(400).json({ error: 'updatedAt must be an ISO date string' })
    }
    // Part of the filter rather than a separate read first, so two saves racing
    // each other can't both match.
    filter.updatedAt = at
  }
  const pet = await Pet.findOneAndUpdate(filter, data, { new: true, runValidators: true })
  if (pet) return res.json({ pet: pet.toJSON() })

  const current = expected !== undefined && (await Pet.findOne({ _id: req.params.id, ownerId: req.user.id }))
  if (current) {
    return res.status(409).json({ error: 'This pet was changed somewhere else', pet: current.toJSON() })
  }
  res.status(404).json({ error: 'Not found' })
})

// DELETE /:id → { ok: true }
router.delete('/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: 'Not found' })
  const pet = await Pet.findOneAndDelete({ _id: req.params.id, ownerId: req.user.id })
  if (!pet) return res.status(404).json({ error: 'Not found' })
  res.json({ ok: true })
})

export default router
