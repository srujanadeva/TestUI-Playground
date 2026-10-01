import dotenv from 'dotenv'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
dotenv.config({ path: resolve(dirname(fileURLToPath(import.meta.url)), '.env') })

import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'
import { connectDB } from './db.js'
import { User } from './models/User.js'
import { Pet } from './models/Pet.js'

const SEED_PASSWORD = 'hunter2pass'

const USERS = [
  {
    name: 'Alice Demo',
    email: 'alice@example.com',
    pets: [
      { name: 'Whiskers', status: 'pending', category: { id: 1, name: 'cat' } },
      { name: 'Goldie', status: 'sold', category: { id: 2, name: 'fish' } },
    ],
  },
  {
    name: 'Bob Demo',
    email: 'bob@example.com',
    pets: [],
  },
]

async function seedUser({ name, email, pets }) {
  let user = await User.findOne({ email })
  if (user) {
    console.log(`  · ${email} already exists — leaving as-is`)
  } else {
    const passwordHash = await bcrypt.hash(SEED_PASSWORD, 10)
    user = await User.create({ name, email, passwordHash })
    console.log(`  ✔ created ${email} (password: ${SEED_PASSWORD})`)
  }

  for (const pet of pets) {
    const exists = await Pet.findOne({ ownerId: user._id, name: pet.name })
    if (exists) {
      console.log(`    · pet "${pet.name}" already exists for ${email} — skipping`)
      continue
    }
    await Pet.create({ ...pet, ownerId: user._id })
    console.log(`    ✔ created pet "${pet.name}" (${pet.status}) for ${email}`)
  }
}

async function run() {
  await connectDB()
  console.log('==> Seeding sample users...')
  for (const u of USERS) {
    await seedUser(u)
  }
  console.log('==> Seed complete.')
  await mongoose.disconnect()
  process.exit(0)
}

run().catch(err => {
  console.error('[seed] failed:', err.message)
  process.exit(1)
})
