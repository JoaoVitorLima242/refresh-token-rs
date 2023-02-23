import { rejects } from 'assert';
import { Document, Model, Schema, model } from 'mongoose'
import { HttpError } from '../utils/error';

export interface IUser extends Document{
  username: string
  password: string
  refreshToken?: string
}

interface UserModel extends Model<IUser> {
  findByUsername(username: string): Promise<IUser> | null;
}


const userSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    refreshToken: {
      type: Schema.Types.ObjectId,
      ref: 'RefreshToken'
    }
  },
  {
    timestamps: true,
  },
)

userSchema.statics.findByUsername = function (username) {
  return this.findOne({username: username })
}






export default model<IUser, UserModel>('User', userSchema)
