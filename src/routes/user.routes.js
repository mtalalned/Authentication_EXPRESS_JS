import express from 'express'
import { authenticateUser, LoginUser, logoutUser, regenerateAccessToken, RegisterUser } from '../controllers/user.controllers.js'

const router = express.Router()

router.post('/register' , RegisterUser)
router.post ('/login' , LoginUser)
router.post ('/logout' , logoutUser)
router.post ('/generateAccessToken' , regenerateAccessToken)

router.get ('/userData' , authenticateUser)

export default router
