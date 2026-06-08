import { Router } from 'express'
import { login, logout, refresh, me, forgotPassword, resetPassword, changePassword } from '../controllers/auth.controller'
import { requireAuth } from '../middleware/auth'

export const authRouter = Router()

authRouter.post('/login', login)
authRouter.post('/refresh', refresh)
authRouter.post('/logout', logout)
authRouter.get('/me', requireAuth, me)
authRouter.post('/forgot-password', forgotPassword)
authRouter.post('/reset-password', resetPassword)
authRouter.post('/change-password', requireAuth, changePassword)
