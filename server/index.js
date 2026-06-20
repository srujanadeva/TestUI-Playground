import dotenv from 'dotenv'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
dotenv.config({ path: resolve(dirname(fileURLToPath(import.meta.url)), '.env') })

import express from 'express'
import cors from 'cors'
import { connectDB } from './db.js'
import authRoutes from './routes/auth.js'
import petsRoutes from './routes/pets.js'

const app = express()

app.use(cors())
app.use(express.json({ limit: '1mb' }))

app.get('/api/health', (_req, res) => res.json({ ok: true }))
app.use('/api/auth', authRoutes)
app.use('/api/pets', petsRoutes)

app.use((err, _req, res, _next) => {
  console.error('[server] error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

const PORT = process.env.PORT || 4000

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
