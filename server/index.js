// Entry point of the API server (port 4000): loads server/.env, mounts every route
// group and starts listening once MongoDB is connected. The Vite dev server proxies /api here.
import dotenv from 'dotenv'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
// Runs before the other imports are used, and resolves .env from this file's folder
// so the server works whichever directory it is started from.
dotenv.config({ path: resolve(dirname(fileURLToPath(import.meta.url)), '.env') })

import express from 'express'
import cors from 'cors'
import { connectDB } from './db.js'
import authRoutes from './routes/auth.js'
import petsRoutes from './routes/pets.js'
import spreadsheetsRoutes from './routes/spreadsheets.js'
import verificationRoutes from './routes/verification.js'
import framesRoutes from './routes/frames.js'

const app = express()

app.use(cors())
app.use(express.json({ limit: '1mb' }))

app.get('/api/health', (_req, res) => res.json({ ok: true }))
app.use('/api/auth', authRoutes)
app.use('/api/pets', petsRoutes)
app.use('/api/spreadsheets', spreadsheetsRoutes)
app.use('/api/verification', verificationRoutes)
// Not under /api: the Frames page loads this straight from port 4000 as a cross-origin iframe.
app.use('/frames', framesRoutes)

// Last-resort handler for errors thrown by routes. Express only treats a
// middleware as an error handler when it takes four arguments, so `_next` must stay.
app.use((err, _req, res, _next) => {
  console.error('[server] error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

const PORT = process.env.PORT || 4000

/** Connects to MongoDB, then starts the HTTP server; exits with code 1 if either fails. */
async function start() {
  try {
    await connectDB()
    app.listen(PORT, () => console.log(`[server] API listening on http://localhost:${PORT}`))
  } catch (err) {
    console.error('[server] failed to start:', err.message)
    process.exit(1)
  }
}

start()
