import { Router } from 'express'
import mongoose from 'mongoose'
import { Pet } from '../models/Pet.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.use(requireAuth)

const VALID_STATUS = ['available', 'pending', 'sold']

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

router.get('/', async (req, res) => {
  const query = { ownerId: req.user.id }
  if (req.query.status && VALID_STATUS.includes(req.query.status)) {
    query.status = req.query.status
  }
  const pets = await Pet.find(query).sort({ createdAt: -1 })
  res.json({ pets: pets.map(p => p.toJSON()) })
})

router.post('/', async (req, res) => {
  const data = sanitizeBody(req.body)
  if (!data.name) return res.status(400).json({ error: 'Pet name is required' })
  const pet = await Pet.create({ ...data, ownerId: req.user.id })
  res.status(201).json({ pet: pet.toJSON() })
})

router.get('/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: 'Not found' })
  const pet = await Pet.findOne({ _id: req.params.id, ownerId: req.user.id })
  if (!pet) return res.status(404).json({ error: 'Not found' })
  res.json({ pet: pet.toJSON() })
})

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

router.delete('/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: 'Not found' })
  const pet = await Pet.findOneAndDelete({ _id: req.params.id, ownerId: req.user.id })
  if (!pet) return res.status(404).json({ error: 'Not found' })
  res.json({ ok: true })
})

export default router
