import { RequestWithBody } from '../@types/express'
import { UserModel } from '../models'
import User, { IUser } from '../models/User'
import { HttpError, errorHandler } from '../utils/error'

class AuthControllers {
  public signUp = errorHandler(async (req: RequestWithBody<IUser>, res) => {
    const { username, password } = req.body

    const existingUser = await UserModel.findOne({ username })

    if (existingUser)
      throw new HttpError(401, 'This username is already registered')
  })
}

export default new AuthControllers()
