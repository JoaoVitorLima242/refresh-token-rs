import argon2 from 'argon2'
import dayjs from 'dayjs'

import { RequestWithBody } from '../@types/express'
import { UserModel, RefreshTokenModel} from '../models'
import { IUser } from '../models/User'
import { HttpError, errorHandler } from '../utils/error'
import { createAccessToken } from '../utils/token'
import { withTransactions } from '../utils/transactions'
import { Request } from 'express'

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

  public login = errorHandler( withTransactions(async (req: RequestWithBody<IUser>, _res, session) => {
    const { username, password } = req.body

    const existingUser = await UserModel.findByUsername(username)

    if (!existingUser)
      throw new HttpError(401, 'Wrong username or password')

    await this.verifyPassword(existingUser.password, password)
    const accessToken = createAccessToken(existingUser._id)

    await RefreshTokenModel.findOneAndDelete(
      {
        user: existingUser._id
      },
      { session }
    )

    const expiresIn = dayjs().add(15, 'days').unix()

    const refreshTokenInstance = new RefreshTokenModel({
      user: existingUser._id,
      expiresIn,
    })

    await refreshTokenInstance.save({ session })

    return {
      user: existingUser,
      accessToken,
      refreshToken: refreshTokenInstance
    }

  }))

  public privateRoute = errorHandler(async (req: Request, _res) => {
    return [
      {id: 1, name: 'node'},
      {id: 2, name: 'JS'},
      {id: 3, name: 'TS'},
      {id: 4, userId: req.userId},
    ]
  })

  public generateAccessToken = errorHandler(async (req: RequestWithBody<{refreshToken: string}>, res) => {
    const { refreshToken } = req.body

    const refreshTokenInstance = await RefreshTokenModel.findById(refreshToken)

    if(!refreshTokenInstance) throw new HttpError(401, 'Refresh token invalid')

    const accessToken = createAccessToken(refreshTokenInstance.user)

    const refreshTokenExpired = dayjs().isAfter(dayjs.unix(refreshTokenInstance.expiresIn))

    if (refreshTokenExpired) {
      await RefreshTokenModel.findByIdAndDelete(refreshTokenInstance._id)
      const expiresIn = dayjs().add(15, 'days').unix()
      const newRefreshTokenInstance = new RefreshTokenModel({
        expiresIn,
        user: refreshTokenInstance.user
      })

      return {
        refreshToken: newRefreshTokenInstance,
        accessToken
      }
    }


    return {
      accessToken
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
