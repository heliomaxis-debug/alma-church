import { Router, Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()
export const publicRouter = Router()

// ─── Verificação pública de certificado ──────────────────────────────────────
publicRouter.get('/certificados/:codigo', async (req: Request, res: Response) => {
  const { codigo } = req.params
  const cert = await prisma.certificado.findUnique({
    where: { codigoVerif: codigo },
    include: { aluno: { select: { name: true, ra: true, curso: true } } },
  })
  if (!cert) {
    res.status(404).json({ error: 'Certificado não encontrado', codigo })
    return
  }
  res.json({
    id: cert.id, tipo: cert.tipo, titulo: cert.titulo, descricao: cert.descricao,
    cargaHoraria: cert.cargaHoraria, issueDate: cert.issueDate, codigoVerif: cert.codigoVerif,
    createdAt: cert.createdAt,
    alunoName: cert.aluno.name, alunoRa: cert.aluno.ra, alunoCurso: cert.aluno.curso,
  })
})

// ─── Torre de Oração ─────────────────────────────────────────────────────────
const DIAS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
const HORARIOS = ['03:00', '05:30', '15:00', '22:00']

// Lista todas as inscrições (a grade é montada no frontend)
publicRouter.get('/torre-oracao', async (_req: Request, res: Response) => {
  const inscricoes = await prisma.oracaoInscricao.findMany({
    orderBy: { createdAt: 'asc' },
    select: { id: true, nome: true, dia: true, horario: true, createdAt: true },
  })
  res.json(inscricoes)
})

const inscricaoSchema = z.object({
  nome: z.string().min(2, 'Informe seu nome'),
  whatsapp: z.string().min(8, 'Informe um WhatsApp válido'),
  dia: z.enum(DIAS as [string, ...string[]]),
  horario: z.enum(HORARIOS as [string, ...string[]]),
})

// Cria uma inscrição num horário
publicRouter.post('/torre-oracao', async (req: Request, res: Response) => {
  const parsed = inscricaoSchema.safeParse(req.body)
  if (!parsed.success) { res.status(400).json({ error: parsed.error.errors[0]?.message ?? 'Dados inválidos' }); return }

  const inscricao = await prisma.oracaoInscricao.create({ data: parsed.data })
  res.status(201).json({ id: inscricao.id, nome: inscricao.nome, dia: inscricao.dia, horario: inscricao.horario })
})

// Remove uma inscrição (para corrigir) — por id
publicRouter.delete('/torre-oracao/:id', async (req: Request, res: Response) => {
  try {
    await prisma.oracaoInscricao.delete({ where: { id: req.params.id } })
    res.json({ ok: true })
  } catch {
    res.status(404).json({ error: 'Inscrição não encontrada' })
  }
})
