/**
 * Seed de PRODUÇÃO — importa os dados reais do BTCP (exportados em seed-data.json)
 * para o banco PostgreSQL. Idempotente: pode rodar mais de uma vez (skipDuplicates).
 *
 * Uso: npm run db:seed   (após DATABASE_URL apontar para o Postgres do Railway)
 */
import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'fs'
import { join } from 'path'

const prisma = new PrismaClient()

type Row = Record<string, any>
const toDate = (v: any) => (v == null ? new Date() : new Date(typeof v === 'number' ? v : Date.parse(v)))

async function main() {
  const raw = readFileSync(join(__dirname, 'seed-data.json'), 'utf-8')
  const data = JSON.parse(raw) as {
    users: Row[]; professores: Row[]; disciplinas: Row[]; alunos: Row[]; matriculas: Row[]
  }

  console.log('🌱 Importando dados reais do BTCP para o PostgreSQL...')

  // 1. Users (datas em ms → Date)
  await prisma.user.createMany({
    skipDuplicates: true,
    data: data.users.map(u => ({
      id: u.id, email: u.email, password: u.password, role: u.role,
      createdAt: toDate(u.createdAt), updatedAt: toDate(u.updatedAt),
    })),
  })
  console.log(`  ✓ ${data.users.length} usuários`)

  // 2. Professores
  await prisma.professor.createMany({
    skipDuplicates: true,
    data: data.professores.map(p => ({ id: p.id, name: p.name, title: p.title ?? null, userId: p.userId })),
  })
  console.log(`  ✓ ${data.professores.length} professores`)

  // 3. Disciplinas (manuais)
  await prisma.disciplina.createMany({
    skipDuplicates: true,
    data: data.disciplinas.map(d => ({
      id: d.id, name: d.name, code: d.code, credits: d.credits,
      schedule: d.schedule ?? '', room: d.room ?? '', semester: d.semester, professorId: d.professorId,
    })),
  })
  console.log(`  ✓ ${data.disciplinas.length} manuais`)

  // 4. Alunos
  await prisma.aluno.createMany({
    skipDuplicates: true,
    data: data.alunos.map(a => ({
      id: a.id, ra: a.ra, name: a.name, phone: a.phone ?? null, address: a.address ?? null,
      birthDate: a.birthDate ?? null, cpf: a.cpf ?? null, status: a.status,
      enrollmentDate: toDate(a.enrollmentDate), semestre: a.semestre, moduloInicial: a.moduloInicial,
      curso: a.curso, photo: a.photo ?? null, userId: a.userId,
    })),
  })
  console.log(`  ✓ ${data.alunos.length} alunos`)

  // 5. Matrículas (manuais cursados)
  await prisma.matricula.createMany({
    skipDuplicates: true,
    data: data.matriculas.map(m => ({
      id: m.id, year: m.year, semester: m.semester, status: m.status,
      alunoId: m.alunoId, disciplinaId: m.disciplinaId,
    })),
  })
  console.log(`  ✓ ${data.matriculas.length} matrículas`)

  console.log('✅ Importação concluída!')
}

main()
  .catch(e => { console.error('❌ Erro no seed:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
