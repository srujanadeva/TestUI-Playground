// Mongoose model for a petstore pet. Each pet belongs to one user (ownerId);
// the fields follow the Swagger Petstore shape.
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
      type: [new mongoose.Schema({ id: Number, name: String }, { _id: false })],
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
      /**
       * Shapes the API response: `_id` becomes `id`, and internal fields such as ownerId are left out.
       * Tags are rebuilt as { id, name } because pets saved before tags had `_id: false` still store one.
       */
      transform(_doc, ret) {
        ret.id = ret._id.toString()
        delete ret._id
        delete ret.__v
        delete ret.ownerId
        if (Array.isArray(ret.tags)) ret.tags = ret.tags.map(({ id, name }) => ({ id, name }))
      },
    },
  },
)

export const Pet = mongoose.model('Pet', petSchema)
