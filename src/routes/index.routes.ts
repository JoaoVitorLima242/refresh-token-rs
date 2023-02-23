import { Router } from 'express'

const IndexRoutes = Router()

IndexRoutes.get('/', (_, res) => {
  res.status(200).json({ message: 'Api is running!' })
})

export {
  IndexRoutes
}
