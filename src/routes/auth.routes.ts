import { Router } from 'express'

import AuthControllers from '../controllers/Auth'

const routes = Router()

routes.post('/signup', AuthControllers.signUp)

export default routes
