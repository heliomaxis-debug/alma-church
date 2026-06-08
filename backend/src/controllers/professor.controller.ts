import { Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { AuthRequest } from '../middleware/auth'

const prisma = new PrismaClient()

async function getProf(userId: string) {
  return prisma.professor.findUnique({ where: { userId } })
}

export async function getDashboard(req: AuthRequest, res: Response) {
  const prof = await getProf(req.userId!)
  if (!prof) { res.status(404).json({ error: 'Professor não encontrado' }); return }

  const disciplinas = await prisma.disciplina.findMany({
    where: { professorId: prof.id },
    include: { matriculas: { include: { notas: true, aluno: true } } },
  })

  const totalAlunos = new Set(disciplinas.flatMap(d => d.matriculas.map(m => m.alunoId))).size
  const totalDisciplinas = disciplinas.length
  const totalMateriais = await prisma.material.count({ where: { disciplinaId: { in: disciplinas.map(d => d.id) } } })
  const solicitacoesPendentes = await prisma.solicitacao.count({
    where: { status: { in: ['PENDENTE', 'EM_ANALISE'] }, aluno: { matriculas: { some: { disciplinaId: { in: disciplinas.map(d => d.id) } } } } },
  })

  res.json({ prof, totalAlunos, totalDisciplinas, totalMateriais, solicitacoesPendentes, disciplinas: disciplinas.map(d => ({ id: d.id, name: d.name, code: d.code, schedule: d.schedule, room: d.room, totalAlunos: d.matriculas.length })) })
}

export async function getTurmas(req: AuthRequest, res: Response) {
  const prof = await getProf(req.userId!)
  if (!prof) { res.status(404).json({ error: 'Professor não encontrado' }); return }

  const disciplinas = await prisma.disciplina.findMany({
    where: { professorId: prof.id },
    include: {
      matriculas: {
        include: {
          aluno: true,
          notas: true,
          checkins: true,
        },
      },
      materiais: true,
    },
  })

  res.json(disciplinas.map(d => {
    const medias = d.matriculas.map(m => {
      const vals = m.notas.map(n => n.valor)
      return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null
    }).filter(Boolean) as number[]
    const mediaGeral = medias.length ? medias.reduce((a, b) => a + b, 0) / medias.length : null

    return {
      id: d.id, name: d.name, code: d.code, credits: d.credits,
      schedule: d.schedule, room: d.room, semester: d.semester,
      totalAlunos: d.matriculas.length,
      totalMateriais: d.materiais.length,
      mediaGeral,
    }
  }))
}

export async function getTurmaDetalhe(req: AuthRequest, res: Response) {
  const prof = await getProf(req.userId!)
  if (!prof) { res.status(404).json({ error: 'Professor não encontrado' }); return }

  const id = req.params.id as string
  const disc = await prisma.disciplina.findFirst({
    where: { id, professorId: prof.id },
    include: {
      matriculas: {
        include: {
          aluno: true,
          notas: { orderBy: { numero: 'asc' } },
          checkins: true,
        },
      },
      materiais: { orderBy: { createdAt: 'desc' } },
    },
  })

  if (!disc) { res.status(404).json({ error: 'Disciplina não encontrada' }); return }

  const alunos = disc.matriculas.map(m => {
    const vals = m.notas.map(n => n.valor)
    const media = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null
    const presencas = m.checkins.filter(c => c.status === 'CONFIRMADO').length
    const faltas = m.checkins.length > 0 ? m.checkins.length - presencas : 0
    return {
      matriculaId: m.id,
      alunoId: m.aluno.id,
      ra: m.aluno.ra,
      name: m.aluno.name,
      status: m.status,
      notas: m.notas,
      media,
      presencas,
      faltas,
      situacao: media === null ? 'SEM_NOTA' : media >= 7 ? 'APROVADO' : media >= 5 ? 'RECUPERACAO' : 'REPROVADO',
    }
  })

  res.json({ ...disc, alunos, matriculas: undefined })
}

const notaSchema = z.object({
  matriculaId: z.string(),
  numero: z.number().int().min(1).max(3),
  valor: z.number().min(0).max(10),
})

export async function lancarNota(req: AuthRequest, res: Response) {
  const prof = await getProf(req.userId!)
  if (!prof) { res.status(404).json({ error: 'Professor não encontrado' }); return }

  const parsed = notaSchema.safeParse(req.body)
  if (!parsed.success) { res.status(400).json({ error: 'Dados inválidos', details: parsed.error.flatten() }); return }

  const mat = await prisma.matricula.findFirst({
    where: { id: parsed.data.matriculaId, disciplina: { professorId: prof.id } },
  })
  if (!mat) { res.status(404).json({ error: 'Matrícula não encontrada' }); return }

  const nota = await prisma.nota.upsert({
    where: { matriculaId_numero: { matriculaId: mat.id, numero: parsed.data.numero } },
    update: { valor: parsed.data.valor },
    create: { matriculaId: mat.id, numero: parsed.data.numero, valor: parsed.data.valor },
  })
  res.json(nota)
}

export async function registrarPresenca(req: AuthRequest, res: Response) {
  const prof = await getProf(req.userId!)
  if (!prof) { res.status(404).json({ error: 'Professor não encontrado' }); return }

  const { matriculaId, status } = req.body as { matriculaId?: string; status?: string }
  if (!matriculaId) { res.status(400).json({ error: 'matriculaId é obrigatório' }); return }

  const mat = await prisma.matricula.findFirst({
    where: { id: matriculaId, disciplina: { professorId: prof.id } },
    include: { aluno: true },
  })
  if (!mat) { res.status(404).json({ error: 'Matrícula não encontrada' }); return }

  const checkin = await prisma.checkin.create({
    data: { alunoId: mat.aluno.id, matriculaId: mat.id, status: status === 'AUSENTE' ? 'AUSENTE' : 'CONFIRMADO' },
  })
  res.status(201).json(checkin)
}

const materialSchema = z.object({
  disciplinaId: z.string(),
  title: z.string().min(1),
  type: z.enum(['pdf', 'video', 'audio']),
  size: z.string().optional(),
  duration: z.string().optional(),
})

export async function addMaterial(req: AuthRequest, res: Response) {
  const prof = await getProf(req.userId!)
  if (!prof) { res.status(404).json({ error: 'Professor não encontrado' }); return }

  const parsed = materialSchema.safeParse(req.body)
  if (!parsed.success) { res.status(400).json({ error: 'Dados inválidos' }); return }

  const disc = await prisma.disciplina.findFirst({ where: { id: parsed.data.disciplinaId, professorId: prof.id } })
  if (!disc) { res.status(404).json({ error: 'Disciplina não encontrada' }); return }

  const mat = await prisma.material.create({ data: parsed.data })
  res.status(201).json(mat)
}

export async function deleteMaterial(req: AuthRequest, res: Response) {
  const prof = await getProf(req.userId!)
  if (!prof) { res.status(404).json({ error: 'Professor não encontrado' }); return }

  const id = req.params.id as string
  const mat = await prisma.material.findFirst({ where: { id, disciplina: { professorId: prof.id } } })
  if (!mat) { res.status(404).json({ error: 'Material não encontrado' }); return }

  await prisma.material.delete({ where: { id } })
  res.json({ ok: true })
}

export async function getSolicitacoes(req: AuthRequest, res: Response) {
  const prof = await getProf(req.userId!)
  if (!prof) { res.status(404).json({ error: 'Professor não encontrado' }); return }

  const discIds = (await prisma.disciplina.findMany({ where: { professorId: prof.id }, select: { id: true } })).map(d => d.id)

  const solic = await prisma.solicitacao.findMany({
    where: { type: 'Revisão de Nota', aluno: { matriculas: { some: { disciplinaId: { in: discIds } } } } },
    include: { aluno: true },
    orderBy: { createdAt: 'desc' },
  })
  res.json(solic)
}

export async function getPerfil(req: AuthRequest, res: Response) {
  const prof = await prisma.professor.findUnique({
    where: { userId: req.userId },
    include: { user: { select: { email: true } } },
  })
  if (!prof) { res.status(404).json({ error: 'Professor não encontrado' }); return }
  res.json(prof)
}

const updateProfessorSchema = z.object({
  name: z.string().min(2).optional(),
  title: z.string().optional(),
})

export async function updatePerfil(req: AuthRequest, res: Response) {
  const prof = await getProf(req.userId!)
  if (!prof) { res.status(404).json({ error: 'Professor não encontrado' }); return }
  const parsed = updateProfessorSchema.safeParse(req.body)
  if (!parsed.success) { res.status(400).json({ error: 'Dados inválidos', details: parsed.error.flatten() }); return }
  const updated = await prisma.professor.update({
    where: { id: prof.id },
    data: parsed.data,
    include: { user: { select: { email: true } } },
  })
  res.json(updated)
}

// ─── Comunicados ──────────────────────────────────────────────────────────────

export async function getComunicados(req: AuthRequest, res: Response) {
  const prof = await getProf(req.userId!)
  if (!prof) { res.status(404).json({ error: 'Professor não encontrado' }); return }

  const rows = await prisma.$queryRaw<any[]>`
    SELECT c.id, c.title, c.content, c.priority, c.createdAt, c.disciplinaId,
           d.name AS disciplinaName, d.code AS disciplinaCode
    FROM Comunicado c
    LEFT JOIN Disciplina d ON c.disciplinaId = d.id
    WHERE c.professorId = ${prof.id}
    ORDER BY c.createdAt DESC
  `
  res.json(rows)
}

const comunicadoSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  priority: z.enum(['info', 'aviso', 'urgente']).default('info'),
  disciplinaId: z.string().optional(),
})

export async function criarComunicado(req: AuthRequest, res: Response) {
  const prof = await getProf(req.userId!)
  if (!prof) { res.status(404).json({ error: 'Professor não encontrado' }); return }

  const parsed = comunicadoSchema.safeParse(req.body)
  if (!parsed.success) { res.status(400).json({ error: 'Dados inválidos' }); return }

  const { title, content, priority, disciplinaId } = parsed.data
  const id = crypto.randomUUID()
  const now = new Date().toISOString()

  if (disciplinaId) {
    await prisma.$executeRaw`
      INSERT INTO Comunicado (id, title, content, priority, createdAt, professorId, disciplinaId)
      VALUES (${id}, ${title}, ${content}, ${priority}, ${now}, ${prof.id}, ${disciplinaId})
    `
  } else {
    await prisma.$executeRaw`
      INSERT INTO Comunicado (id, title, content, priority, createdAt, professorId, disciplinaId)
      VALUES (${id}, ${title}, ${content}, ${priority}, ${now}, ${prof.id}, NULL)
    `
  }

  res.status(201).json({ id, title, content, priority, createdAt: now, professorId: prof.id, disciplinaId: disciplinaId ?? null })
}

export async function deletarComunicado(req: AuthRequest, res: Response) {
  const prof = await getProf(req.userId!)
  if (!prof) { res.status(404).json({ error: 'Professor não encontrado' }); return }

  const id = req.params.id as string
  const rows = await prisma.$queryRaw<any[]>`SELECT id FROM Comunicado WHERE id = ${id} AND professorId = ${prof.id}`
  if (!rows.length) { res.status(404).json({ error: 'Comunicado não encontrado' }); return }

  await prisma.$executeRaw`DELETE FROM Comunicado WHERE id = ${id}`
  res.json({ ok: true })
}
