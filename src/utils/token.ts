import jwt from 'jsonwebtoken'
import { config } from '../config/vars'
import { NextFunction, Request, Response } from 'express'
import { HttpError } from './error'

export type AccessTokenObj = {
  userId: string
}

export const createAccessToken = (userId: string) => {
  return jwt.sign(
    {
      userId
    },
    config.JWT_ACCESS_SECRET,
    {
      expiresIn: '5m'
    }
  )
}

export const verifyAccessToken = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers['authorization']

  if (!authHeader) {
    throw new HttpError(401, 'Unauthorized')
  }
  const token = authHeader.split(' ')[1]

  try {
    const decodedToken = jwt.verify(
      token,
      config.JWT_ACCESS_SECRET,
    ) as AccessTokenObj
    req.userId = decodedToken.userId

    next()
  } catch (e) {
    throw new HttpError(401, 'Unauthorized')
  }
}
