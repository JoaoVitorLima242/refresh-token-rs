import argon2 from 'argon2'

import { RequestWithBody } from '../@types/express'
import { UserModel } from '../models'
import User, { IUser } from '../models/User'
import { HttpError, errorHandler } from '../utils/error'
import { createAccessToken } from '../utils/token'
import { Request, Response } from 'express'

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
    const accessToken = createAccessToken(existingUser._id)

    return {
      user: existingUser,
      accessToken
    }

  })

  public privateRoute = errorHandler(async (req: Request, res: Response) => {
    return [
      {id: 1, name: 'node'},
      {id: 2, name: 'JS'},
      {id: 3, name: 'TS'},
      {id: 4, name: 'mongo'}
    ]
  })

  private async verifyPassword (hasedPassword: string, rawPassword: string) {
    const passwordMatched = await argon2.verify(hasedPassword, rawPassword)

    if (!passwordMatched) {
      throw new HttpError(401, 'Wrong username or password')
    }
  }
}

export default new AuthControllers()
