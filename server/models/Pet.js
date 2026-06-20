import mongoose from 'mongoose'

const petSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    category: {
      id: { type: Number },
      name: { type: String, trim: true },
    },
    photoUrls: { type: [String], default: [] },
    tags: {
      type: [{ id: Number, name: String }],
      default: [],
    },
    status: {
      type: String,
      enum: ['available', 'pending', 'sold'],
      default: 'available',
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        ret.id = ret._id.toString()
        delete ret._id
        delete ret.__v
        delete ret.ownerId
      },
    },
  },
)

export const Pet = mongoose.model('Pet', petSchema)
