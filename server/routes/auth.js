import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { User } from '../models/User.js'
import { requireAuth, signToken } from '../middleware/auth.js'

const router = Router()

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body || {}
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' })
  }
  if (!EMAIL_RE.test(email)) return res.status(400).json({ error: 'Invalid email' })
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' })
  }
  const existing = await User.findOne({ email: email.toLowerCase() })
  if (existing) return res.status(409).json({ error: 'Email already registered' })

  const passwordHash = await bcrypt.hash(password, 10)
  const user = await User.create({ name, email: email.toLowerCase(), passwordHash })
  const userJson = user.toJSON()
  const token = signToken(userJson)
  res.status(201).json({ user: userJson, token })
})

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {}
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' })
  }
  const user = await User.findOne({ email: String(email).toLowerCase() })
  if (!user) return res.status(401).json({ error: 'Invalid email or password' })
  const ok = await bcrypt.compare(password, user.passwordHash)
  if (!ok) return res.status(401).json({ error: 'Invalid email or password' })
  const userJson = user.toJSON()
  const token = signToken(userJson)
  res.json({ user: userJson, token })
})

router.post('/forgot-password', async (_req, res) => {
  res.json({ ok: true })
})

router.get('/me', requireAuth, async (req, res) => {
  const user = await User.findById(req.user.id)
  if (!user) return res.status(401).json({ error: 'User not found' })
  res.json({ user: user.toJSON() })
})

router.post('/logout', requireAuth, async (_req, res) => {
  res.json({ ok: true })
})

export default router
