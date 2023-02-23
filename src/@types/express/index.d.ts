import { Request } from 'express'

export interface RequestWithBody<T> extends Request {
  body: T
}

declare global {
  namespace Express {
    export interface Request {
      userId: string
      headersSent: boolean
    }
  }
}
