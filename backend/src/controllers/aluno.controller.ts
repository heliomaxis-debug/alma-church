import { Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { AuthRequest } from '../middleware/auth'
import crypto from 'crypto'

const prisma = new PrismaClient()

async function getAluno(userId: string) {
  return prisma.aluno.findUnique({ where: { userId } })
}

export async function getPerfil(req: AuthRequest, res: Response) {
  const aluno = await prisma.aluno.findUnique({
    where: { userId: req.userId },
    include: { user: { select: { email: true } } },
  })
  if (!aluno) { res.status(404).json({ error: 'Aluno não encontrado' }); return }
  res.json(aluno)
}

const updatePerfilSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  photo: z.string().optional(),
})

export async function updatePerfil(req: AuthRequest, res: Response) {
  const aluno = await getAluno(req.userId!)
  if (!aluno) { res.status(404).json({ error: 'Aluno não encontrado' }); return }

  const parsed = updatePerfilSchema.safeParse(req.body)
  if (!parsed.success) { res.status(400).json({ error: 'Dados inválidos', details: parsed.error.flatten() }); return }

  const updated = await prisma.aluno.update({ where: { id: aluno.id }, data: parsed.data })
  res.json(updated)
}

export async function getNotas(req: AuthRequest, res: Response) {
  const aluno = await getAluno(req.userId!)
  if (!aluno) { res.status(404).json({ error: 'Aluno não encontrado' }); return }

  const matriculas = await prisma.matricula.findMany({
    where: { alunoId: aluno.id },
    include: {
      disciplina: { include: { professor: true } },
      notas: { orderBy: { numero: 'asc' } },
      checkins: true,
    },
    orderBy: [{ year: 'desc' }, { semester: 'desc' }],
  })

  const result = matriculas.map(m => {
    const totalAulas = m.checkins.length > 0 ? m.checkins.length : 0
    const presencas = m.checkins.filter(c => c.status === 'CONFIRMADO').length
    const faltas = totalAulas > 0 ? totalAulas - presencas : 0
    const media = m.notas.length
      ? m.notas.reduce((acc, n) => acc + n.valor, 0) / m.notas.length
      : null
    return {
      id: m.id,
      year: m.year,
      semester: m.semester,
      status: m.status,
      disciplina: { id: m.disciplina.id, name: m.disciplina.name, code: m.disciplina.code, credits: m.disciplina.credits, schedule: m.disciplina.schedule, room: m.disciplina.room, professor: m.disciplina.professor.name },
      notas: m.notas,
      faltas,
      totalAulas,
      media,
    }
  })

  res.json(result)
}

export async function getFinanceiro(req: AuthRequest, res: Response) {
  const aluno = await getAluno(req.userId!)
  if (!aluno) { res.status(404).json({ error: 'Aluno não encontrado' }); return }
  const pagamentos = await prisma.pagamento.findMany({
    where: { alunoId: aluno.id },
    orderBy: [{ ano: 'asc' }, { mes: 'asc' }],
  })
  res.json(pagamentos)
}

export async function getCalendario(req: AuthRequest, res: Response) {
  const aluno = await getAluno(req.userId!)
  if (!aluno) { res.status(404).json({ error: 'Aluno não encontrado' }); return }

  const matriculas = await prisma.matricula.findMany({
    where: { alunoId: aluno.id },
    select: { disciplinaId: true },
  })
  const disciplinaIds = matriculas.map(m => m.disciplinaId)

  const eventos = await prisma.evento.findMany({
    where: { OR: [{ disciplinaId: null }, { disciplinaId: { in: disciplinaIds } }] },
    orderBy: { date: 'asc' },
    include: { disciplina: { select: { name: true, code: true } } },
  })
  res.json(eventos)
}

export async function getDocumentos(req: AuthRequest, res: Response) {
  const aluno = await getAluno(req.userId!)
  if (!aluno) { res.status(404).json({ error: 'Aluno não encontrado' }); return }
  const docs = await prisma.documento.findMany({ where: { alunoId: aluno.id }, orderBy: { createdAt: 'desc' } })
  res.json(docs)
}

const documentoSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  type: z.enum(['pdf', 'img']),
  size: z.string().optional(),
})

export async function createDocumento(req: AuthRequest, res: Response) {
  const aluno = await getAluno(req.userId!)
  if (!aluno) { res.status(404).json({ error: 'Aluno não encontrado' }); return }

  const parsed = documentoSchema.safeParse(req.body)
  if (!parsed.success) { res.status(400).json({ error: 'Dados inválidos', details: parsed.error.flatten() }); return }

  const doc = await prisma.documento.create({
    data: { ...parsed.data, alunoId: aluno.id, status: 'PENDENTE' },
  })
  res.status(201).json(doc)
}

export async function getSolicitacoes(req: AuthRequest, res: Response) {
  const aluno = await getAluno(req.userId!)
  if (!aluno) { res.status(404).json({ error: 'Aluno não encontrado' }); return }
  const solic = await prisma.solicitacao.findMany({ where: { alunoId: aluno.id }, orderBy: { createdAt: 'desc' } })
  res.json(solic)
}

const solicitacaoSchema = z.object({
  type: z.string().min(1),
  subject: z.string().optional(),
  description: z.string().min(1),
})

export async function createSolicitacao(req: AuthRequest, res: Response) {
  const aluno = await getAluno(req.userId!)
  if (!aluno) { res.status(404).json({ error: 'Aluno não encontrado' }); return }

  const parsed = solicitacaoSchema.safeParse(req.body)
  if (!parsed.success) { res.status(400).json({ error: 'Dados inválidos', details: parsed.error.flatten() }); return }

  const count = await prisma.solicitacao.count({ where: { alunoId: aluno.id } })
  const protocol = `REQ-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`

  const solic = await prisma.solicitacao.create({
    data: { ...parsed.data, protocol, alunoId: aluno.id },
  })
  res.status(201).json(solic)
}

export async function getMateriais(req: AuthRequest, res: Response) {
  const aluno = await getAluno(req.userId!)
  if (!aluno) { res.status(404).json({ error: 'Aluno não encontrado' }); return }

  const matriculas = await prisma.matricula.findMany({
    where: { alunoId: aluno.id },
    select: { disciplinaId: true },
  })
  const disciplinaIds = matriculas.map(m => m.disciplinaId)

  const materiais = await prisma.material.findMany({
    where: { disciplinaId: { in: disciplinaIds } },
    include: { disciplina: { select: { name: true, code: true } } },
    orderBy: { createdAt: 'desc' },
  })
  res.json(materiais)
}

export async function getCheckins(req: AuthRequest, res: Response) {
  const aluno = await getAluno(req.userId!)
  if (!aluno) { res.status(404).json({ error: 'Aluno não encontrado' }); return }

  const checkins = await prisma.checkin.findMany({
    where: { alunoId: aluno.id },
    include: { matricula: { include: { disciplina: true } } },
    orderBy: { checkedAt: 'desc' },
  })
  res.json(checkins)
}

const checkinSchema = z.object({
  matriculaId: z.string(),
  lat: z.number().optional(),
  lng: z.number().optional(),
})

// ── Configuração da geolocalização da igreja (ajustável por env) ──
const CHURCH_LAT = parseFloat(process.env.CHURCH_LAT || '-20.2876')   // R. Dom Pedro II, 900 — Cariacica/ES
const CHURCH_LNG = parseFloat(process.env.CHURCH_LNG || '-40.4192')
const CHECKIN_RADIUS_M = parseFloat(process.env.CHECKIN_RADIUS_M || '300')  // raio permitido em metros
const GEO_REQUIRED = process.env.GEO_CHECKIN !== 'false'  // por padrão, exige geolocalização

/** Distância em metros entre dois pontos (fórmula de Haversine). */
function distanciaMetros(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000
  const rad = (d: number) => (d * Math.PI) / 180
  const dLat = rad(lat2 - lat1)
  const dLng = rad(lng2 - lng1)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(a))
}

export async function createCheckin(req: AuthRequest, res: Response) {
  const aluno = await getAluno(req.userId!)
  if (!aluno) { res.status(404).json({ error: 'Aluno não encontrado' }); return }

  const parsed = checkinSchema.safeParse(req.body)
  if (!parsed.success) { res.status(400).json({ error: 'Dados inválidos' }); return }

  const mat = await prisma.matricula.findFirst({ where: { id: parsed.data.matriculaId, alunoId: aluno.id } })
  if (!mat) { res.status(404).json({ error: 'Matrícula não encontrada' }); return }

  // ── Validação de geolocalização ──
  const { lat, lng } = parsed.data
  let distancia: number | null = null

  if (GEO_REQUIRED) {
    if (lat == null || lng == null) {
      res.status(400).json({ error: 'Ative a localização do dispositivo para registrar presença.' }); return
    }
    distancia = distanciaMetros(lat, lng, CHURCH_LAT, CHURCH_LNG)
    if (distancia > CHECKIN_RADIUS_M) {
      res.status(403).json({
        error: `Você precisa estar na igreja para registrar presença. Você está a ${Math.round(distancia)}m do local (máximo permitido: ${CHECKIN_RADIUS_M}m).`,
      }); return
    }
  } else if (lat != null && lng != null) {
    distancia = distanciaMetros(lat, lng, CHURCH_LAT, CHURCH_LNG)
  }

  const checkin = await prisma.checkin.create({
    data: { alunoId: aluno.id, matriculaId: mat.id, status: 'CONFIRMADO', lat, lng, distancia },
  })
  res.status(201).json(checkin)
}

export async function getCarteirinha(req: AuthRequest, res: Response) {
  const aluno = await prisma.aluno.findUnique({
    where: { userId: req.userId },
    include: { user: { select: { email: true } } },
  })
  if (!aluno) { res.status(404).json({ error: 'Aluno não encontrado' }); return }

  res.json({
    ra: aluno.ra,
    name: aluno.name,
    curso: aluno.curso,
    semestre: aluno.semestre,
    status: aluno.status,
    enrollmentDate: aluno.enrollmentDate,
    photo: aluno.photo,
    qrData: `btcp://aluno/${aluno.ra}/${crypto.createHash('sha256').update(aluno.ra + aluno.id).digest('hex').slice(0, 16)}`,
  })
}


export async function getComunicadosAluno(req: AuthRequest, res: Response) {
  const aluno = await getAluno(req.userId!)
  if (!aluno) { res.status(404).json({ error: 'Aluno não encontrado' }); return }

  const rows = await prisma.$queryRaw<any[]>`
    SELECT c.id, c.title, c.content, c.priority, c.createdAt,
           c.disciplinaId, d.name AS disciplinaName, d.code AS disciplinaCode,
           p.name AS professorName, p.title AS professorTitle
    FROM Comunicado c
    JOIN Professor p ON c.professorId = p.id
    LEFT JOIN Disciplina d ON c.disciplinaId = d.id
    WHERE c.disciplinaId IS NULL
       OR c.disciplinaId IN (
         SELECT disciplinaId FROM Matricula WHERE alunoId = ${aluno.id}
       )
    ORDER BY c.createdAt DESC
    LIMIT 50
  `
  res.json(rows)
}

export async function getCertificadosAluno(req: AuthRequest, res: Response) {
  const aluno = await getAluno(req.userId!)
  if (!aluno) { res.status(404).json({ error: 'Aluno não encontrado' }); return }

  const rows = await prisma.$queryRaw<any[]>`
    SELECT id, tipo, titulo, descricao, cargaHoraria, issueDate, codigoVerif, createdAt
    FROM Certificado
    WHERE alunoId = ${aluno.id}
    ORDER BY createdAt DESC
  `
  res.json(rows)
}
