import { Router } from 'express'
import multer from 'multer'
import { createHash, randomBytes, randomInt, randomUUID } from 'node:crypto'
import { readFileSync, readdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { requireAuth } from '../middleware/auth.js'
import { OCR_FIXTURES } from '../fixtures/ocr.js'

// Practice targets for verification flows: CAPTCHA, OTP, selfie upload and
// simulated OCR. Everything is kept in memory and is lost when the API
// restarts. None of this is real security; it exists so tests have something
// realistic to drive.
const router = Router()

router.use(requireAuth)

// Accepted by POST /captcha/verify in the X-Captcha-Test-Key header, the way
// real CAPTCHA providers hand out test keys so automated tests can skip them.
const CAPTCHA_TEST_KEY = process.env.CAPTCHA_TEST_KEY || 'playground-test-key'
// Answer of every challenge fetched with ?mode=test.
const CAPTCHA_TEST_ANSWER = 'TEST42'
const CAPTCHA_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no 0/O, 1/I
const CAPTCHA_DEFAULT_TTL = 120
const CAPTCHA_MAX_ENTRIES = 1000

const OTP_DEFAULT_TTL = 300
const OTP_DEFAULT_COOLDOWN = 30
const OTP_MAX_ATTEMPTS = 3
const INBOX_MAX = 20

const MAX_IMAGE_BYTES = 2 * 1024 * 1024
const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47])
const JPEG_MAGIC = Buffer.from([0xff, 0xd8, 0xff])
const OCR_DEFAULT_DELAY = 1500

const captchas = new Map() // id -> { userId, answer, expires }
const otps = new Map()     // userId -> { code, phone, expires, attempts, sentAt }
const inboxes = new Map()  // userId -> [{ id, to, text, code, sentAt }]

// Reads a whole-number query value, clamped to [min, max]; falls back when missing or invalid.
function intParam(value, fallback, min, max) {
  const n = Number.parseInt(value, 10)
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback
}

function pruneCaptchas(now) {
  for (const [id, c] of captchas) if (c.expires <= now) captchas.delete(id)
  // Still too many live ones: drop the oldest (Map keeps insertion order).
  while (captchas.size >= CAPTCHA_MAX_ENTRIES) captchas.delete(captchas.keys().next().value)
}

// Draws the code as an SVG image with rotated letters and noise lines. Served
// as an <img>, so the letters are not in the page's DOM.
function captchaSvg(code) {
  const w = 180
  const h = 60
  const colors = ['#1e293b', '#4338ca', '#9d174d', '#065f46', '#92400e']
  const rand = (a, b) => a + Math.random() * (b - a)
  let body = ''
  for (let i = 0; i < 6; i++) {
    body += `<path d="M${rand(0, 40)} ${rand(5, h - 5)} C${rand(40, 90)} ${rand(0, h)} ${rand(90, 140)} ${rand(0, h)} ${rand(140, w)} ${rand(5, h - 5)}" stroke="${colors[i % colors.length]}" stroke-opacity=".45" stroke-width="${rand(1, 2.2).toFixed(1)}" fill="none"/>`
  }
  for (let i = 0; i < 40; i++) {
    body += `<circle cx="${rand(0, w).toFixed(1)}" cy="${rand(0, h).toFixed(1)}" r="${rand(0.6, 1.6).toFixed(1)}" fill="#64748b" fill-opacity=".5"/>`
  }
  ;[...code].forEach((ch, i) => {
    const x = 22 + i * 28 + rand(-3, 3)
    const y = 40 + rand(-5, 5)
    body += `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-family="Georgia, serif" font-size="${rand(28, 34).toFixed(0)}" font-weight="700" fill="${colors[randomInt(colors.length)]}" transform="rotate(${rand(-25, 25).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})">${ch}</text>`
  })
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect width="100%" height="100%" fill="#f1f5f9"/>${body}</svg>`
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
}

// GET /captcha?mode=test&ttl=<seconds>
router.get('/captcha', (req, res) => {
  const now = Date.now()
  pruneCaptchas(now)
  const ttl = intParam(req.query.ttl, CAPTCHA_DEFAULT_TTL, 5, 600)
  const testMode = req.query.mode === 'test'
  const answer = testMode
    ? CAPTCHA_TEST_ANSWER
    : Array.from({ length: 5 }, () => CAPTCHA_ALPHABET[randomInt(CAPTCHA_ALPHABET.length)]).join('')
  const id = randomUUID()
  captchas.set(id, { userId: req.user.id, answer, expires: now + ttl * 1000 })
  res.json({ id, image: captchaSvg(answer), expiresIn: ttl, testMode })
})

// POST /captcha/verify { id, answer }. Each challenge can be answered once.
router.post('/captcha/verify', (req, res) => {
  if (req.get('X-Captcha-Test-Key') === CAPTCHA_TEST_KEY) {
    return res.json({ ok: true, bypassed: true })
  }
  const { id, answer } = req.body || {}
  const challenge = captchas.get(String(id))
  if (!challenge || challenge.userId !== req.user.id) {
    return res.status(400).json({ error: 'Unknown CAPTCHA. Load a new one.' })
  }
  captchas.delete(String(id))
  if (challenge.expires <= Date.now()) {
    return res.status(410).json({ error: 'The CAPTCHA has expired. Load a new one.' })
  }
  if (String(answer || '').trim().toUpperCase() !== challenge.answer) {
    return res.status(400).json({ error: 'The characters did not match. Try the new CAPTCHA.' })
  }
  res.json({ ok: true, bypassed: false })
})

function maskPhone(phone) {
  return phone.slice(0, -4).replace(/\d/g, '•') + phone.slice(-4)
}

// POST /otp/send?ttl=<seconds>&cooldown=<seconds> { phone }
router.post('/otp/send', (req, res) => {
  const phone = String(req.body?.phone || '').replace(/[\s-]/g, '')
  if (!/^\+?\d{8,15}$/.test(phone)) {
    return res.status(400).json({ error: 'Enter a phone number with 8 to 15 digits.' })
  }
  const userId = req.user.id
  const now = Date.now()
  const prev = otps.get(userId)
  if (prev && now < prev.resendAt) {
    const retryAfter = Math.ceil((prev.resendAt - now) / 1000)
    res.set('Retry-After', String(retryAfter))
    return res.status(429).json({ error: `Wait ${retryAfter} s before asking for a new code.`, retryAfter })
  }

  const ttl = intParam(req.query.ttl, OTP_DEFAULT_TTL, 5, 3600)
  const cooldown = intParam(req.query.cooldown, OTP_DEFAULT_COOLDOWN, 0, 600)
  const code = String(randomInt(1_000_000)).padStart(6, '0')
  otps.set(userId, { code, phone, expires: now + ttl * 1000, resendAt: now + cooldown * 1000, attempts: 0 })

  const minutes = Math.max(1, Math.round(ttl / 60))
  const inbox = inboxes.get(userId) || []
  inbox.unshift({
    id: randomBytes(6).toString('hex'),
    to: phone,
    text: `Your Test Playground code is ${code}. It expires in ${minutes} min. Never share it.`,
    code,
    sentAt: new Date(now).toISOString(),
  })
  inboxes.set(userId, inbox.slice(0, INBOX_MAX))

  res.json({ sentTo: maskPhone(phone), expiresIn: ttl, resendIn: cooldown })
})

// POST /otp/verify { code }
router.post('/otp/verify', (req, res) => {
  const userId = req.user.id
  const otp = otps.get(userId)
  if (!otp) return res.status(400).json({ error: 'Ask for a code first.' })
  if (otp.expires <= Date.now()) {
    return res.status(410).json({ error: 'The code has expired. Ask for a new one.' })
  }
  if (otp.attempts >= OTP_MAX_ATTEMPTS) {
    return res.status(429).json({ error: 'Too many wrong codes. Ask for a new one.', attemptsLeft: 0 })
  }
  if (String(req.body?.code || '') !== otp.code) {
    otp.attempts += 1
    const attemptsLeft = OTP_MAX_ATTEMPTS - otp.attempts
    if (attemptsLeft === 0) {
      return res.status(429).json({ error: 'Too many wrong codes. Ask for a new one.', attemptsLeft })
    }
    return res.status(400).json({ error: `Wrong code. ${attemptsLeft} attempt(s) left.`, attemptsLeft })
  }
  otps.delete(userId)
  res.json({ verified: true, phone: maskPhone(otp.phone) })
})

// Test-only stand-in for an SMS gateway: the messages "sent" to this user.
router.get('/dev-inbox', (req, res) => {
  res.json({ messages: inboxes.get(req.user.id) || [] })
})

router.delete('/dev-inbox', (req, res) => {
  inboxes.delete(req.user.id)
  res.status(204).end()
})

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_BYTES, files: 1, fields: 0, parts: 1 },
}).single('file')

const MULTER_MESSAGES = {
  LIMIT_FILE_SIZE: [413, 'The image is larger than 2 MB.'],
  LIMIT_FILE_COUNT: [400, 'Upload one image at a time.'],
  LIMIT_PART_COUNT: [400, 'Upload one image at a time.'],
  LIMIT_FIELD_COUNT: [400, 'Only an image can be uploaded.'],
  LIMIT_UNEXPECTED_FILE: [400, 'The image must be sent in the "file" field.'],
}

// Runs multer and checks the upload is a PNG or JPEG by its first bytes.
// Calls next() with req.file set, or answers with an error.
function receiveImage(req, res, next) {
  upload(req, res, err => {
    if (err) {
      const [status, error] = err instanceof multer.MulterError
        ? MULTER_MESSAGES[err.code] || [400, 'The upload could not be processed.']
        : [400, 'The upload could not be processed.']
      return res.status(status).json({ error })
    }
    if (!req.file) return res.status(400).json({ error: 'Choose an image to upload.' })
    const buf = req.file.buffer
    if (buf.subarray(0, 4).equals(PNG_MAGIC)) req.imageType = 'image/png'
    else if (buf.subarray(0, 3).equals(JPEG_MAGIC)) req.imageType = 'image/jpeg'
    else return res.status(400).json({ error: 'Only PNG or JPEG images are accepted.' })
    next()
  })
}

// POST /selfie (multipart, "file"). Nothing is stored; the reply describes what arrived.
router.post('/selfie', receiveImage, (req, res) => {
  res.json({ received: true, type: req.imageType, bytes: req.file.size })
})

// The sample ID images are matched by content hash, so renaming a file still
// works but editing it does not.
const OCR_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '../../src/testresources/ocr')
const ocrByHash = new Map()
try {
  for (const name of readdirSync(OCR_DIR)) {
    if (!OCR_FIXTURES[name]) continue
    const hash = createHash('sha256').update(readFileSync(resolve(OCR_DIR, name))).digest('hex')
    ocrByHash.set(hash, { sample: name, ...OCR_FIXTURES[name] })
  }
} catch (err) {
  console.warn('[verification] OCR sample images not loaded:', err.message)
}

// POST /ocr?delay=<ms> (multipart, "file"). Simulated: known sample images
// return their fixture fields; any other image is "unreadable".
router.post('/ocr', receiveImage, (req, res) => {
  const delay = intParam(req.query.delay, OCR_DEFAULT_DELAY, 0, 10000)
  const hash = createHash('sha256').update(req.file.buffer).digest('hex')
  const match = ocrByHash.get(hash)
  setTimeout(() => {
    if (!match) {
      return res.status(422).json({ error: 'No document could be read from this image. Use one of the sample ID cards.' })
    }
    res.json({ sample: match.sample, documentType: match.documentType, fields: match.fields })
  }, delay)
})

export default router
