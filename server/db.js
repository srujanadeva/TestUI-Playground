import mongoose from 'mongoose'

export async function connectDB() {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/test-playground'
  await mongoose.connect(uri)
  console.log(`[db] Mongo connected: ${uri}`)
}
