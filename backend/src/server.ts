import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { authRouter } from './routes/auth.routes'
import { alunoRouter } from './routes/aluno.routes'
import { adminRouter } from './routes/admin.routes'
import { professorRouter } from './routes/professor.routes'
import { publicRouter } from './routes/public.routes'
import { errorHandler } from './middleware/errorHandler'

const app = express()
const PORT = process.env.PORT || 3101

app.use(helmet())
app.use(cors({
  origin: (origin, callback) => {
    // Allow: localhost dev, ngrok tunnels, Next.js server-side proxy (no origin)
    const allowed = [
      'http://localhost:3100',
      'http://localhost:3000',
      process.env.FRONTEND_URL,
    ].filter(Boolean)
    if (!origin || allowed.includes(origin) || /\.ngrok(-free)?\.dev$/.test(origin) || /\.ngrok\.io$/.test(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ limit: '10mb', extended: true }))
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200, standardHeaders: true, legacyHeaders: false }))

app.get('/health', (_req, res) => res.json({ ok: true }))

app.use('/auth', authRouter)
app.use('/aluno', alunoRouter)
app.use('/professor', professorRouter)
app.use('/admin', adminRouter)
app.use('/public', publicRouter)

app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`🚀 BTCP API running on http://localhost:${PORT}`)
})

export default app
