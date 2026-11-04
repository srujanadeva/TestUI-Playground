// Account routes (/api/auth): signup, login, the current user, and stub
// forgot-password / logout endpoints. Sessions are stateless JWTs (see middleware/auth.js).
import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { User } from '../models/User.js'
import { requireAuth, signToken } from '../middleware/auth.js'
import { asyncSafe } from '../middleware/asyncSafe.js'

const router = asyncSafe(Router())

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// POST /signup { name, email, password } → 201 { user, token }
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body || {}
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' })
  }
  // bcrypt throws on anything but a string, e.g. a JSON number.
  if (typeof password !== 'string') return res.status(400).json({ error: 'Password must be a string' })
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

// POST /login { email, password } → { user, token }
router.post('/login', async (req, res) => {
  const { email, password } = req.body || {}
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' })
  }
  if (typeof password !== 'string') return res.status(400).json({ error: 'Password must be a string' })
  // Unknown email and wrong password give the same message, so the response
  // doesn't reveal which emails are registered.
  const user = await User.findOne({ email: String(email).toLowerCase() })
  if (!user) return res.status(401).json({ error: 'Invalid email or password' })
  const ok = await bcrypt.compare(password, user.passwordHash)
  if (!ok) return res.status(401).json({ error: 'Invalid email or password' })
  const userJson = user.toJSON()
  const token = signToken(userJson)
  res.json({ user: userJson, token })
})

// POST /forgot-password { email }. Stub: sends nothing and always answers ok,
// so it can't be used to find out which emails are registered.
router.post('/forgot-password', async (_req, res) => {
  res.json({ ok: true })
})

// GET /me → { user }. 401 if the token is valid but the user has since been deleted.
router.get('/me', requireAuth, async (req, res) => {
  const user = await User.findById(req.user.id)
  if (!user) return res.status(401).json({ error: 'User not found' })
  res.json({ user: user.toJSON() })
})

// POST /logout. JWTs can't be revoked here, so this only confirms the token;
// the client logs out by deleting it.
router.post('/logout', requireAuth, async (_req, res) => {
  res.json({ ok: true })
})

export default router
