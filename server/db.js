// MongoDB connection shared by the API server and the seed script.
import mongoose from 'mongoose'

/**
 * Connects Mongoose to MONGO_URI, or to a local `test-playground` database when it isn't set.
 * Rejects if MongoDB can't be reached, so callers decide whether to exit.
 */
export async function connectDB() {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/test-playground'
  await mongoose.connect(uri)
  console.log(`[db] Mongo connected: ${uri}`)
}
