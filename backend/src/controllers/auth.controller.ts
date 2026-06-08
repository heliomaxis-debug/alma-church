import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { z } from 'zod'
import { AuthRequest } from '../middleware/auth'

const prisma = new PrismaClient()

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

function signAccess(userId: string, role: string) {
  return jwt.sign({ sub: userId, role }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  } as jwt.SignOptions)
}

export async function login(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Dados inválidos', details: parsed.error.flatten() })
    return
  }
  const { email, password } = parsed.data

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || !(await bcrypt.compare(password, user.password))) {
    res.status(401).json({ error: 'Email ou senha incorretos' })
    return
  }

  const accessToken = signAccess(user.id, user.role)
  const refreshToken = crypto.randomBytes(40).toString('hex')
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  await prisma.refreshToken.create({ data: { token: refreshToken, userId: user.id, expiresAt } })

  res.json({ accessToken, refreshToken, role: user.role })
}

export async function refresh(req: Request, res: Response) {
  const { refreshToken } = req.body as { refreshToken?: string }
  if (!refreshToken) {
    res.status(400).json({ error: 'Refresh token não fornecido' })
    return
  }

  const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken }, include: { user: true } })
  if (!stored || stored.expiresAt < new Date()) {
    res.status(401).json({ error: 'Refresh token inválido ou expirado' })
    return
  }

  const accessToken = signAccess(stored.userId, stored.user.role)
  res.json({ accessToken })
}

export async function logout(req: Request, res: Response) {
  const { refreshToken } = req.body as { refreshToken?: string }
  if (refreshToken) {
    await prisma.refreshToken.deleteMany({ where: { token: refreshToken } }).catch(() => {})
  }
  res.json({ ok: true })
}

export async function me(req: AuthRequest, res: Response) {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: { id: true, email: true, role: true, aluno: { select: { id: true, ra: true, name: true, semestre: true, moduloInicial: true, curso: true, photo: true } }, professor: { select: { id: true, name: true, title: true } } },
  })
  if (!user) { res.status(404).json({ error: 'Usuário não encontrado' }); return }
  res.json(user)
}

// ─── Forgot / Reset password ──────────────────────────────────────────────────

export async function forgotPassword(req: Request, res: Response) {
  const { email } = req.body as { email?: string }
  if (!email) { res.status(400).json({ error: 'E-mail é obrigatório' }); return }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    // Don't reveal whether the email exists
    res.json({ ok: true, message: 'Se o e-mail existir, um link foi gerado.' })
    return
  }

  // Invalidate previous tokens
  await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } })

  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hora

  await prisma.passwordResetToken.create({ data: { token, userId: user.id, expiresAt } })

  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3100'}/redefinir-senha/${token}`

  // Em produção, enviar e-mail. Aqui retornamos o link para uso local.
  res.json({ ok: true, resetUrl, message: 'Link de redefinição gerado.' })
}

export async function resetPassword(req: Request, res: Response) {
  const { token, password } = req.body as { token?: string; password?: string }
  if (!token || !password) { res.status(400).json({ error: 'Token e senha são obrigatórios' }); return }
  if (password.length < 6) { res.status(400).json({ error: 'Senha deve ter pelo menos 6 caracteres' }); return }

  const stored = await prisma.passwordResetToken.findUnique({ where: { token }, include: { user: true } })
  if (!stored || stored.expiresAt < new Date()) {
    res.status(400).json({ error: 'Token inválido ou expirado' })
    return
  }

  const hashed = await bcrypt.hash(password, 12)
  await prisma.user.update({ where: { id: stored.userId }, data: { password: hashed } })
  await prisma.passwordResetToken.delete({ where: { token } })
  // Invalidate all refresh tokens so old sessions are cleared
  await prisma.refreshToken.deleteMany({ where: { userId: stored.userId } })

  res.json({ ok: true, message: 'Senha redefinida com sucesso.' })
}

// ─── Change password (authenticated) ─────────────────────────────────────────

export async function changePassword(req: AuthRequest, res: Response) {
  const { currentPassword, newPassword } = req.body as { currentPassword?: string; newPassword?: string }
  if (!currentPassword || !newPassword) { res.status(400).json({ error: 'Preencha todos os campos' }); return }
  if (newPassword.length < 6) { res.status(400).json({ error: 'Nova senha deve ter pelo menos 6 caracteres' }); return }

  const user = await prisma.user.findUnique({ where: { id: req.userId } })
  if (!user) { res.status(404).json({ error: 'Usuário não encontrado' }); return }
  if (!(await bcrypt.compare(currentPassword, user.password))) {
    res.status(400).json({ error: 'Senha atual incorreta' })
    return
  }

  const hashed = await bcrypt.hash(newPassword, 12)
  await prisma.user.update({ where: { id: user.id }, data: { password: hashed } })
  res.json({ ok: true, message: 'Senha alterada com sucesso.' })
}
