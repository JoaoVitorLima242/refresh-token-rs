import argon2 from 'argon2'

import { RequestWithBody } from '../@types/express'
import { UserModel } from '../models'
import User, { IUser } from '../models/User'
import { HttpError, errorHandler } from '../utils/error'

class AuthControllers {
  public signUp = errorHandler(async (req: RequestWithBody<IUser>, res) => {
    const { username, password } = req.body

    const existingUser = await UserModel.findByUsername(username)

    if (existingUser)
      throw new HttpError(401, 'This username is already registered')

    const userInstance = new UserModel({
      username,
      password: await argon2.hash(password)
    })

    await userInstance.save()

    return {
      user: userInstance
    }
  })

  public login = errorHandler(async (req: RequestWithBody<IUser>, res) => {
    const { username, password } = req.body

    const existingUser = await UserModel.findByUsername(username)

    if (!existingUser)
      throw new HttpError(401, 'Wrong username or password')

    await this.verifyPassword(existingUser.password, password)

    return {
      user: existingUser
    }

  })

  private async verifyPassword (hasedPassword: string, rawPassword: string) {
    const passwordMatched = await argon2.verify(hasedPassword, rawPassword)

    if (!passwordMatched) {
      throw new HttpError(401, 'Wrong username or password')
    }
  }
}

export default new AuthControllers()
