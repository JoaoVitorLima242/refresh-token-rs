import { Router } from 'express'

import AuthControllers from '../controllers/Auth'
import { verifyAccessToken } from '../utils/token'

const routes = Router()

routes.post('/signup', AuthControllers.signUp)
routes.post('/login', AuthControllers.login)
routes.post('/private-route', verifyAccessToken, AuthControllers.privateRoute)

export default routes
