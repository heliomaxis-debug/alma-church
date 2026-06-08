import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const prisma = new PrismaClient()

export async function getAlunos(_req: Request, res: Response) {
  const alunos = await prisma.aluno.findMany({ include: { user: { select: { email: true } } }, orderBy: { name: 'asc' } })
  res.json(alunos)
}

export async function getDisciplinas(_req: Request, res: Response) {
  const disciplinas = await prisma.disciplina.findMany({ include: { professor: true }, orderBy: { name: 'asc' } })
  res.json(disciplinas)
}

export async function getProfessores(_req: Request, res: Response) {
  const profs = await prisma.professor.findMany({
    include: { user: { select: { email: true } }, disciplinas: { select: { id: true } } },
    orderBy: { name: 'asc' },
  })
  res.json(profs)
}

export async function updateSolicitacao(req: Request, res: Response) {
  const id = req.params.id as string
  const { status } = req.body as { status?: string }
  if (!status) { res.status(400).json({ error: 'Status é obrigatório' }); return }
  const solic = await prisma.solicitacao.update({ where: { id }, data: { status } })
  res.json(solic)
}

export async function getDashboardStats(_req: Request, res: Response) {
  const [totalAlunos, totalDisciplinas, totalProfessores, pagamentosPendentes] = await Promise.all([
    prisma.aluno.count(),
    prisma.disciplina.count(),
    prisma.professor.count(),
    prisma.pagamento.count({ where: { pago: false } }),
  ])
  res.json({ totalAlunos, totalDisciplinas, totalProfessores, pagamentosPendentes })
}

export async function getPagamentos(_req: Request, res: Response) {
  const pagamentos = await prisma.pagamento.findMany({
    include: { aluno: { select: { name: true, ra: true } } },
    orderBy: [{ ano: 'desc' }, { mes: 'desc' }],
  })
  res.json(pagamentos)
}

export async function updatePagamento(req: Request, res: Response) {
  const id = req.params.id as string
  const { pago, metodo } = req.body as { pago?: boolean; metodo?: string }
  const pag = await prisma.pagamento.update({
    where: { id },
    data: {
      pago: pago ?? true,
      paidAt: pago !== false ? new Date().toISOString() : null,
      metodo: metodo ?? undefined,
    },
  })
  res.json(pag)
}

export async function getSolicitacoesAdmin(_req: Request, res: Response) {
  const solic = await prisma.solicitacao.findMany({
    include: { aluno: { select: { name: true, ra: true } } },
    orderBy: { createdAt: 'desc' },
  })
  res.json(solic)
}

// ─── Cadastro ─────────────────────────────────────────────────────────────────

const novoAlunoSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  ra: z.string().optional(),          // gerado automaticamente se omitido
  curso: z.string().min(1),
  semestre: z.number().int().min(1).max(10).default(1),
  moduloInicial: z.number().int().min(1).max(10).default(1),
  phone: z.string().optional(),
  birthDate: z.string().optional(),
  cpf: z.string().optional(),
})

/** Gera o próximo RA no formato ANO + sequência de 3 dígitos (ex: 2026074). */
async function gerarProximoRA(): Promise<string> {
  const ano = new Date().getFullYear()
  const prefixo = String(ano)
  const doAno = await prisma.aluno.findMany({
    where: { ra: { startsWith: prefixo } },
    select: { ra: true },
  })
  let maxSeq = 0
  for (const { ra } of doAno) {
    const seq = parseInt(ra.slice(prefixo.length), 10)
    if (!isNaN(seq) && seq > maxSeq) maxSeq = seq
  }
  // garante unicidade mesmo se houver lacunas/colisões
  let seq = maxSeq + 1
  let novoRA = `${prefixo}${String(seq).padStart(3, '0')}`
  while (await prisma.aluno.findUnique({ where: { ra: novoRA } })) {
    seq++
    novoRA = `${prefixo}${String(seq).padStart(3, '0')}`
  }
  return novoRA
}

export async function criarAluno(req: Request, res: Response) {
  const parsed = novoAlunoSchema.safeParse(req.body)
  if (!parsed.success) { res.status(400).json({ error: 'Dados inválidos', details: parsed.error.flatten() }); return }

  const { name, email, password, curso, semestre, moduloInicial, phone, birthDate, cpf } = parsed.data

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) { res.status(409).json({ error: 'E-mail já cadastrado' }); return }

  // RA: usa o informado (se houver) ou gera automaticamente
  let ra = parsed.data.ra?.trim()
  if (ra) {
    const raExisting = await prisma.aluno.findUnique({ where: { ra } })
    if (raExisting) { res.status(409).json({ error: 'RA já cadastrado' }); return }
  } else {
    ra = await gerarProximoRA()
  }

  const hashed = await bcrypt.hash(password, 12)

  const user = await prisma.user.create({
    data: {
      email, password: hashed, role: 'ALUNO',
      aluno: { create: { name, ra, curso, semestre, moduloInicial, phone, birthDate, cpf } },
    },
    include: { aluno: true },
  })

  res.status(201).json({ id: user.id, email: user.email, aluno: user.aluno })
}

const novoProfSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  title: z.string().optional(),
})

export async function criarProfessor(req: Request, res: Response) {
  const parsed = novoProfSchema.safeParse(req.body)
  if (!parsed.success) { res.status(400).json({ error: 'Dados inválidos', details: parsed.error.flatten() }); return }

  const { name, email, password, title } = parsed.data

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) { res.status(409).json({ error: 'E-mail já cadastrado' }); return }

  const hashed = await bcrypt.hash(password, 12)

  const user = await prisma.user.create({
    data: {
      email, password: hashed, role: 'PROFESSOR',
      professor: { create: { name, title } },
    },
    include: { professor: true },
  })

  res.status(201).json({ id: user.id, email: user.email, professor: user.professor })
}

export async function resetarSenhaAdmin(req: Request, res: Response) {
  const id = req.params.id as string
  const { password } = req.body as { password?: string }
  if (!password || password.length < 6) { res.status(400).json({ error: 'Senha deve ter pelo menos 6 caracteres' }); return }

  const aluno = await prisma.aluno.findUnique({ where: { id }, select: { userId: true } })
  if (!aluno) { res.status(404).json({ error: 'Aluno não encontrado' }); return }

  const hashed = await bcrypt.hash(password, 12)
  await prisma.user.update({ where: { id: aluno.userId }, data: { password: hashed } })
  await prisma.refreshToken.deleteMany({ where: { userId: aluno.userId } })
  res.json({ ok: true })
}

// ─── Disciplinas CRUD ─────────────────────────────────────────────────────────

const novaDisciplinaSchema = z.object({
  name: z.string().min(2),
  code: z.string().min(1),
  credits: z.number().int().min(1).max(20).default(4),
  schedule: z.string().default(''),
  room: z.string().default(''),
  semester: z.number().int().min(1).max(12).default(1),
  professorId: z.string().min(1),
})

export async function criarDisciplina(req: Request, res: Response) {
  const parsed = novaDisciplinaSchema.safeParse(req.body)
  if (!parsed.success) { res.status(400).json({ error: 'Dados inválidos', details: parsed.error.flatten() }); return }

  const existing = await prisma.disciplina.findUnique({ where: { code: parsed.data.code } })
  if (existing) { res.status(409).json({ error: 'Código de disciplina já cadastrado' }); return }

  const prof = await prisma.professor.findUnique({ where: { id: parsed.data.professorId } })
  if (!prof) { res.status(404).json({ error: 'Professor não encontrado' }); return }

  const disc = await prisma.disciplina.create({ data: parsed.data, include: { professor: true } })
  res.status(201).json(disc)
}

export async function editarDisciplina(req: Request, res: Response) {
  const id = req.params.id as string
  const parsed = novaDisciplinaSchema.partial().safeParse(req.body)
  if (!parsed.success) { res.status(400).json({ error: 'Dados inválidos' }); return }

  if (parsed.data.code) {
    const existing = await prisma.disciplina.findFirst({ where: { code: parsed.data.code, NOT: { id } } })
    if (existing) { res.status(409).json({ error: 'Código já usado por outra disciplina' }); return }
  }

  const disc = await prisma.disciplina.update({ where: { id }, data: parsed.data, include: { professor: true } })
  res.json(disc)
}

export async function deletarDisciplina(req: Request, res: Response) {
  const id = req.params.id as string
  await prisma.disciplina.delete({ where: { id } })
  res.json({ ok: true })
}

// ─── Matrículas ───────────────────────────────────────────────────────────────

const matriculaSchema = z.object({
  alunoId: z.string().min(1),
  disciplinaId: z.string().min(1),
  year: z.number().int(),
  semester: z.number().int().min(1).max(2),
})

export async function matricularAluno(req: Request, res: Response) {
  const parsed = matriculaSchema.safeParse(req.body)
  if (!parsed.success) { res.status(400).json({ error: 'Dados inválidos' }); return }

  const { alunoId, disciplinaId, year, semester } = parsed.data

  const existing = await prisma.matricula.findUnique({ where: { alunoId_disciplinaId_year_semester: { alunoId, disciplinaId, year, semester } } })
  if (existing) { res.status(409).json({ error: 'Aluno já matriculado nesta disciplina/semestre' }); return }

  const matricula = await prisma.matricula.create({
    data: { alunoId, disciplinaId, year, semester },
    include: { aluno: { select: { name: true, ra: true } }, disciplina: { select: { name: true, code: true } } },
  })
  res.status(201).json(matricula)
}

export async function getMatriculasAluno(req: Request, res: Response) {
  const id = req.params.id as string
  const matriculas = await prisma.matricula.findMany({
    where: { alunoId: id },
    include: { disciplina: { include: { professor: { select: { name: true } } } } },
    orderBy: [{ year: 'desc' }, { semester: 'desc' }],
  })
  res.json(matriculas)
}

// ─── Gerar Mensalidades ───────────────────────────────────────────────────────

const gerarMensalidadesSchema = z.object({
  alunoId: z.string().optional(),       // id do aluno OU omitido quando todos=true
  todos: z.boolean().optional(),        // true = gera para todos os alunos ativos
  ano: z.number().int().min(2020).max(2099),
  meses: z.array(z.number().int().min(1).max(12)).min(1),
  valor: z.number().positive().default(350),
})

export async function gerarMensalidades(req: Request, res: Response) {
  const parsed = gerarMensalidadesSchema.safeParse(req.body)
  if (!parsed.success) { res.status(400).json({ error: 'Dados inválidos', details: parsed.error.flatten() }); return }

  const { alunoId, todos, ano, meses, valor } = parsed.data

  // Define a lista de alunos-alvo
  let alvos: { id: string }[]
  if (todos) {
    alvos = await prisma.aluno.findMany({ where: { status: 'ATIVO' }, select: { id: true } })
    if (alvos.length === 0) { res.status(404).json({ error: 'Nenhum aluno ativo encontrado' }); return }
  } else {
    if (!alunoId) { res.status(400).json({ error: 'Selecione um aluno ou marque "todos"' }); return }
    const aluno = await prisma.aluno.findUnique({ where: { id: alunoId } })
    if (!aluno) { res.status(404).json({ error: 'Aluno não encontrado' }); return }
    alvos = [{ id: alunoId }]
  }

  let created = 0
  let skipped = 0

  for (const alvo of alvos) {
    for (const mes of meses) {
      const existing = await prisma.pagamento.findFirst({ where: { alunoId: alvo.id, ano, mes } })
      if (existing) { skipped++; continue }
      const vencimento = `${ano}-${String(mes).padStart(2, '0')}-10`
      await prisma.pagamento.create({ data: { alunoId: alvo.id, mes, ano, valor, vencimento } })
      created++
    }
  }

  res.status(201).json({ created, skipped, alunos: alvos.length })
}

// ─── Eventos / Calendário ────────────────────────────────────────────────────

const eventoSchema = z.object({
  title: z.string().min(2),
  date: z.string().min(8),
  time: z.string().default('Todo o dia'),
  type: z.enum(['exam', 'event', 'deadline', 'academic', 'holiday']),
  disciplinaId: z.string().optional(),
})

export async function getEventos(_req: Request, res: Response) {
  const eventos = await prisma.evento.findMany({
    include: { disciplina: { select: { name: true, code: true } } },
    orderBy: { date: 'asc' },
  })
  res.json(eventos)
}

export async function criarEvento(req: Request, res: Response) {
  const parsed = eventoSchema.safeParse(req.body)
  if (!parsed.success) { res.status(400).json({ error: 'Dados inválidos', details: parsed.error.flatten() }); return }

  const evento = await prisma.evento.create({
    data: parsed.data,
    include: { disciplina: { select: { name: true, code: true } } },
  })
  res.status(201).json(evento)
}

export async function deletarEvento(req: Request, res: Response) {
  const id = req.params.id as string
  await prisma.evento.delete({ where: { id } })
  res.json({ ok: true })
}

// ─── Certificados ─────────────────────────────────────────────────────────────

const certificadoSchema = z.object({
  alunoId:      z.string().min(1),
  tipo:         z.enum(['conclusao', 'participacao', 'extensao', 'honra']),
  titulo:       z.string().min(3),
  descricao:    z.string().optional(),
  cargaHoraria: z.number().int().positive().optional(),
  issueDate:    z.string().min(8),
})

function gerarCodigoVerif(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = 'ALMC-'
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)]
  code += '-'
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return code
}

export async function getCertificados(_req: Request, res: Response) {
  const rows = await prisma.$queryRaw<any[]>`
    SELECT c.id, c.tipo, c.titulo, c.descricao, c.cargaHoraria,
           c.issueDate, c.codigoVerif, c.createdAt,
           a.id AS alunoId, a.name AS alunoName, a.ra AS alunoRa, a.curso AS alunoCurso
    FROM Certificado c
    JOIN Aluno a ON c.alunoId = a.id
    ORDER BY c.createdAt DESC
  `
  res.json(rows)
}

export async function emitirCertificado(req: Request, res: Response) {
  const parsed = certificadoSchema.safeParse(req.body)
  if (!parsed.success) { res.status(400).json({ error: 'Dados inválidos', details: parsed.error.flatten() }); return }

  const { alunoId, tipo, titulo, descricao, cargaHoraria, issueDate } = parsed.data

  const aluno = await prisma.$queryRaw<any[]>`SELECT id FROM Aluno WHERE id = ${alunoId} LIMIT 1`
  if (!aluno.length) { res.status(404).json({ error: 'Aluno não encontrado' }); return }

  const id = crypto.randomUUID()
  const codigoVerif = gerarCodigoVerif()
  const now = new Date().toISOString()

  await prisma.$executeRaw`
    INSERT INTO Certificado (id, tipo, titulo, descricao, cargaHoraria, issueDate, codigoVerif, createdAt, alunoId)
    VALUES (${id}, ${tipo}, ${titulo}, ${descricao ?? null}, ${cargaHoraria ?? null}, ${issueDate}, ${codigoVerif}, ${now}, ${alunoId})
  `

  const created = await prisma.$queryRaw<any[]>`
    SELECT c.*, a.name AS alunoName, a.ra AS alunoRa
    FROM Certificado c JOIN Aluno a ON c.alunoId = a.id
    WHERE c.id = ${id}
  `
  res.status(201).json(created[0])
}

export async function deletarCertificado(req: Request, res: Response) {
  const id = req.params.id as string
  const existing = await prisma.$queryRaw<any[]>`SELECT id FROM Certificado WHERE id = ${id} LIMIT 1`
  if (!existing.length) { res.status(404).json({ error: 'Certificado não encontrado' }); return }
  await prisma.$executeRaw`DELETE FROM Certificado WHERE id = ${id}`
  res.json({ ok: true })
}

// ─── Editar Aluno ─────────────────────────────────────────────────────────────

const editarAlunoSchema = z.object({
  name:     z.string().min(2).optional(),
  phone:    z.string().optional().nullable(),
  status:   z.enum(['ATIVO', 'INATIVO', 'TRANCADO', 'CONCLUIDO']).optional(),
  semestre: z.number().int().min(1).max(10).optional(),
  curso:    z.string().min(2).optional(),
})

export async function editarAluno(req: Request, res: Response) {
  const id = req.params.id as string
  const parsed = editarAlunoSchema.safeParse(req.body)
  if (!parsed.success) { res.status(400).json({ error: 'Dados inválidos', details: parsed.error.flatten() }); return }

  const aluno = await prisma.aluno.findUnique({ where: { id } })
  if (!aluno) { res.status(404).json({ error: 'Aluno não encontrado' }); return }

  const updated = await prisma.aluno.update({
    where: { id },
    data: parsed.data,
    include: { user: { select: { email: true } } },
  })
  res.json(updated)
}
