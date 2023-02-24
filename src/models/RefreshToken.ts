import { Document, Schema, model } from 'mongoose'

interface IRefreshToken extends Document{
  user: string
  expiresIn: number
}

const refreshTokenSchema = new Schema<IRefreshToken>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    expiresIn: { type: Number }
  },
  { timestamps: true },
)

export default model<IRefreshToken>('RefreshToken', refreshTokenSchema)
