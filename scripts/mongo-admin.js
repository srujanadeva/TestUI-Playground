// Talks to the MongoDB on 127.0.0.1:27017 for setup, start and stop, whoever started it
// (Homebrew, a Windows service, Docker, setup): `version` prints the server version,
// `shutdown` asks it to stop cleanly. Exit 1 when nothing answers as MongoDB.
import mongoose from 'mongoose'

const command = process.argv[2]
const conn = mongoose.createConnection('mongodb://127.0.0.1:27017/admin', { serverSelectionTimeoutMS: 3000 })

try {
  await conn.asPromise()
  if (command === 'version') {
    console.log((await conn.db.admin().buildInfo()).version)
  } else if (command === 'shutdown') {
    // The server closes the connection while answering, so that error means it worked.
    await conn.db.admin().command({ shutdown: 1 }).catch(() => {})
  } else {
    console.log('usage: node scripts/mongo-admin.js version|shutdown')
    process.exitCode = 2
  }
} catch (err) {
  console.log(err.message)
  process.exitCode = 1
} finally {
  await conn.close().catch(() => {})
}
