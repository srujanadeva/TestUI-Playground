// Mongoose model for an app user. Emails are stored lower-cased and are unique.
import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: false },
    toJSON: {
      /** Shapes the API response: `_id` becomes `id`, and the password hash is never sent. */
      transform(_doc, ret) {
        ret.id = ret._id.toString()
        delete ret._id
        delete ret.__v
        delete ret.passwordHash
      },
    },
  },
)

export const User = mongoose.model('User', userSchema)
