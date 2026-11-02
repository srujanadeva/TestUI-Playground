// CRUD routes for the signed-in user's pets (/api/pets). Every query is
// scoped to req.user.id, so a user can never read or change another user's pets.
import { Router } from 'express'
import mongoose from 'mongoose'
import { Pet } from '../models/Pet.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.use(requireAuth)

const VALID_STATUS = ['available', 'pending', 'sold']

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

// GET /?status=available|pending|sold → { pets }, newest first. An unknown status is ignored.
router.get('/', async (req, res) => {
  const query = { ownerId: req.user.id }
  if (req.query.status && VALID_STATUS.includes(req.query.status)) {
    query.status = req.query.status
  }
  const pets = await Pet.find(query).sort({ createdAt: -1 })
  res.json({ pets: pets.map(p => p.toJSON()) })
})

// POST / { name, category?, photoUrls?, tags?, status? } → 201 { pet }
router.post('/', async (req, res) => {
  const data = sanitizeBody(req.body)
  if (!data.name) return res.status(400).json({ error: 'Pet name is required' })
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

// PUT /:id { …fields to change } → { pet }. Only the fields sent are updated.
router.put('/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: 'Not found' })
  const data = sanitizeBody(req.body)
  const pet = await Pet.findOneAndUpdate(
    { _id: req.params.id, ownerId: req.user.id },
    data,
    { new: true, runValidators: true },
  )
  if (!pet) return res.status(404).json({ error: 'Not found' })
  res.json({ pet: pet.toJSON() })
})

// DELETE /:id → { ok: true }
router.delete('/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: 'Not found' })
  const pet = await Pet.findOneAndDelete({ _id: req.params.id, ownerId: req.user.id })
  if (!pet) return res.status(404).json({ error: 'Not found' })
  res.json({ ok: true })
})

export default router
