import { Router, Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
export const publicRouter = Router()

// Verificação pública de certificado — sem autenticação
publicRouter.get('/certificados/:codigo', async (req: Request, res: Response) => {
  const { codigo } = req.params
  const rows = await prisma.$queryRaw<any[]>`
    SELECT c.id, c.tipo, c.titulo, c.descricao, c.cargaHoraria,
           c.issueDate, c.codigoVerif, c.createdAt,
           a.name AS alunoName, a.ra AS alunoRa, a.curso AS alunoCurso
    FROM Certificado c
    JOIN Aluno a ON c.alunoId = a.id
    WHERE c.codigoVerif = ${codigo}
    LIMIT 1
  `
  if (!rows.length) {
    res.status(404).json({ error: 'Certificado não encontrado', codigo })
    return
  }
  res.json(rows[0])
})
