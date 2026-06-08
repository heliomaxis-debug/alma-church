import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

  // ── Users ────────────────────────────────────────────────────────────────────
  const senhaHash = await bcrypt.hash('btcp2026', 10)

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@btcp.edu.br' },
    update: {},
    create: { email: 'admin@btcp.edu.br', password: senhaHash, role: 'ADMIN' },
  })

  const alunoUser = await prisma.user.upsert({
    where: { email: 'joao.silva@btcp.edu.br' },
    update: {},
    create: { email: 'joao.silva@btcp.edu.br', password: senhaHash, role: 'ALUNO' },
  })

  const prof1User = await prisma.user.upsert({
    where: { email: 'carlos.mendes@btcp.edu.br' },
    update: {},
    create: { email: 'carlos.mendes@btcp.edu.br', password: senhaHash, role: 'PROFESSOR' },
  })
  const prof2User = await prisma.user.upsert({
    where: { email: 'paulo.ferreira@btcp.edu.br' },
    update: {},
    create: { email: 'paulo.ferreira@btcp.edu.br', password: senhaHash, role: 'PROFESSOR' },
  })
  const prof3User = await prisma.user.upsert({
    where: { email: 'marcos.rodrigues@btcp.edu.br' },
    update: {},
    create: { email: 'marcos.rodrigues@btcp.edu.br', password: senhaHash, role: 'PROFESSOR' },
  })
  const prof4User = await prisma.user.upsert({
    where: { email: 'andre.lima@btcp.edu.br' },
    update: {},
    create: { email: 'andre.lima@btcp.edu.br', password: senhaHash, role: 'PROFESSOR' },
  })
  const prof5User = await prisma.user.upsert({
    where: { email: 'roberto.alves@btcp.edu.br' },
    update: {},
    create: { email: 'roberto.alves@btcp.edu.br', password: senhaHash, role: 'PROFESSOR' },
  })
  const prof6User = await prisma.user.upsert({
    where: { email: 'tiago.santos@btcp.edu.br' },
    update: {},
    create: { email: 'tiago.santos@btcp.edu.br', password: senhaHash, role: 'PROFESSOR' },
  })

  // ── Aluno ────────────────────────────────────────────────────────────────────
  const aluno = await prisma.aluno.upsert({
    where: { ra: '2024001' },
    update: {},
    create: {
      ra: '2024001',
      name: 'João Silva',
      phone: '(11) 99234-5678',
      address: 'Rua das Flores, 123 – São Paulo, SP',
      birthDate: '15/04/1995',
      cpf: '***.***.***-**',
      status: 'ATIVO',
      semestre: 7,
      moduloInicial: 5,
      curso: 'Bacharelado em Teologia',
      enrollmentDate: new Date('2024-02-01'),
      userId: alunoUser.id,
    },
  })

  // ── Professores ──────────────────────────────────────────────────────────────
  const prof1 = await prisma.professor.upsert({ where: { userId: prof1User.id }, update: {}, create: { name: 'Rev. Carlos Mendes', title: 'Reverendo', userId: prof1User.id } })
  const prof2 = await prisma.professor.upsert({ where: { userId: prof2User.id }, update: {}, create: { name: 'Dr. Paulo Ferreira', title: 'Doutor', userId: prof2User.id } })
  const prof3 = await prisma.professor.upsert({ where: { userId: prof3User.id }, update: {}, create: { name: 'Rev. Marcos Rodrigues', title: 'Reverendo', userId: prof3User.id } })
  const prof4 = await prisma.professor.upsert({ where: { userId: prof4User.id }, update: {}, create: { name: 'Dr. André Lima', title: 'Doutor', userId: prof4User.id } })
  const prof5 = await prisma.professor.upsert({ where: { userId: prof5User.id }, update: {}, create: { name: 'Prof. Roberto Alves', title: 'Professor', userId: prof5User.id } })
  const prof6 = await prisma.professor.upsert({ where: { userId: prof6User.id }, update: {}, create: { name: 'Rev. Tiago Santos', title: 'Reverendo', userId: prof6User.id } })

  // ── Disciplinas ──────────────────────────────────────────────────────────────
  const disc1 = await prisma.disciplina.upsert({ where: { code: 'AT-101' }, update: {}, create: { name: 'Antigo Testamento I', code: 'AT-101', credits: 4, schedule: 'Seg/Qua – 08:00', room: 'Sala 101', semester: 3, professorId: prof1.id } })
  const disc2 = await prisma.disciplina.upsert({ where: { code: 'NT-101' }, update: {}, create: { name: 'Novo Testamento I', code: 'NT-101', credits: 4, schedule: 'Ter/Qui – 10:00', room: 'Auditório', semester: 3, professorId: prof2.id } })
  const disc3 = await prisma.disciplina.upsert({ where: { code: 'TS-201' }, update: {}, create: { name: 'Teologia Sistemática I', code: 'TS-201', credits: 4, schedule: 'Seg/Qua – 14:00', room: 'Sala 201', semester: 3, professorId: prof3.id } })
  const disc4 = await prisma.disciplina.upsert({ where: { code: 'HM-201' }, update: {}, create: { name: 'Hermenêutica', code: 'HM-201', credits: 3, schedule: 'Ter/Qui – 08:00', room: 'Sala 103', semester: 3, professorId: prof4.id } })
  const disc5 = await prisma.disciplina.upsert({ where: { code: 'HI-101' }, update: {}, create: { name: 'História da Igreja', code: 'HI-101', credits: 3, schedule: 'Sex – 08:00', room: 'Sala 104', semester: 3, professorId: prof5.id } })
  const disc6 = await prisma.disciplina.upsert({ where: { code: 'HO-301' }, update: {}, create: { name: 'Homilética', code: 'HO-301', credits: 3, schedule: 'Qua – 14:00', room: 'Auditório', semester: 3, professorId: prof6.id } })

  // ── Matrículas + Notas ───────────────────────────────────────────────────────
  const matriculasData = [
    { disc: disc1, notas: [{ numero: 1, valor: 8.5 }, { numero: 2, valor: 9.0 }], faltas: 2 },
    { disc: disc2, notas: [{ numero: 1, valor: 7.8 }, { numero: 2, valor: 8.5 }], faltas: 1 },
    { disc: disc3, notas: [{ numero: 1, valor: 9.2 }, { numero: 2, valor: 9.5 }], faltas: 0 },
    { disc: disc4, notas: [{ numero: 1, valor: 8.0 }, { numero: 2, valor: 7.5 }], faltas: 3 },
    { disc: disc5, notas: [{ numero: 1, valor: 8.8 }, { numero: 2, valor: 9.0 }], faltas: 1 },
    { disc: disc6, notas: [{ numero: 1, valor: 9.0 }, { numero: 2, valor: 8.5 }], faltas: 0 },
  ]

  for (const m of matriculasData) {
    const mat = await prisma.matricula.upsert({
      where: { alunoId_disciplinaId_year_semester: { alunoId: aluno.id, disciplinaId: m.disc.id, year: 2026, semester: 1 } },
      update: {},
      create: { alunoId: aluno.id, disciplinaId: m.disc.id, year: 2026, semester: 1, status: 'EM_ANDAMENTO' },
    })
    for (const n of m.notas) {
      await prisma.nota.upsert({
        where: { matriculaId_numero: { matriculaId: mat.id, numero: n.numero } },
        update: {},
        create: { matriculaId: mat.id, numero: n.numero, valor: n.valor },
      })
    }
  }

  // ── Pagamentos ───────────────────────────────────────────────────────────────
  const pagamentos = [
    { mes: 1, ano: 2026, vencimento: '10/01/2026', pago: true, paidAt: '08/01/2026', metodo: 'PIX' },
    { mes: 2, ano: 2026, vencimento: '10/02/2026', pago: true, paidAt: '09/02/2026', metodo: 'BOLETO' },
    { mes: 3, ano: 2026, vencimento: '10/03/2026', pago: true, paidAt: '10/03/2026', metodo: 'PIX' },
    { mes: 4, ano: 2026, vencimento: '10/04/2026', pago: true, paidAt: '07/04/2026', metodo: 'PIX' },
    { mes: 5, ano: 2026, vencimento: '10/05/2026', pago: true, paidAt: '10/05/2026', metodo: 'BOLETO' },
    { mes: 6, ano: 2026, vencimento: '10/06/2026', pago: false, paidAt: null, metodo: null },
  ]
  for (const p of pagamentos) {
    await prisma.pagamento.create({ data: { ...p, valor: 350.0, alunoId: aluno.id } }).catch(() => {})
  }

  // ── Documentos ───────────────────────────────────────────────────────────────
  const docs = [
    { name: 'Contrato de Matrícula', category: 'Contrato', type: 'pdf', size: '245 KB', status: 'APROVADO' },
    { name: 'Histórico Escolar 2025', category: 'Acadêmico', type: 'pdf', size: '180 KB', status: 'APROVADO' },
    { name: 'Declaração de Matrícula', category: 'Acadêmico', type: 'pdf', size: '95 KB', status: 'APROVADO' },
    { name: 'RG (Documento Pessoal)', category: 'Pessoal', type: 'img', size: '520 KB', status: 'APROVADO' },
    { name: 'CPF', category: 'Pessoal', type: 'pdf', size: '312 KB', status: 'APROVADO' },
    { name: 'Certificado – Módulo 1', category: 'Certificado', type: 'pdf', size: '620 KB', status: 'APROVADO' },
  ]
  for (const d of docs) {
    await prisma.documento.create({ data: { ...d, alunoId: aluno.id } }).catch(() => {})
  }

  // ── Solicitações ─────────────────────────────────────────────────────────────
  await prisma.solicitacao.upsert({
    where: { protocol: 'REQ-2026-001' },
    update: {},
    create: { protocol: 'REQ-2026-001', type: 'Declaração de Matrícula', description: 'Solicitação para fins de comprovação junto ao empregador.', status: 'CONCLUIDO', alunoId: aluno.id },
  })
  await prisma.solicitacao.upsert({
    where: { protocol: 'REQ-2026-042' },
    update: {},
    create: { protocol: 'REQ-2026-042', type: 'Revisão de Nota', subject: 'Hermenêutica', description: 'Solicito revisão da nota da Prova 2.', status: 'EM_ANALISE', alunoId: aluno.id },
  })
  await prisma.solicitacao.upsert({
    where: { protocol: 'REQ-2026-058' },
    update: {},
    create: { protocol: 'REQ-2026-058', type: 'Trancamento de Disciplina', subject: 'Grego Bíblico I', description: 'Trancamento por motivos de saúde.', status: 'PENDENTE', alunoId: aluno.id },
  })

  // ── Materiais ────────────────────────────────────────────────────────────────
  const mats = [
    { disciplinaId: disc1.id, title: 'Apostila – Introdução ao Pentateuco', type: 'pdf', size: '2.3 MB' },
    { disciplinaId: disc1.id, title: 'Aula 1 – Introdução ao AT', type: 'video', duration: '45 min' },
    { disciplinaId: disc3.id, title: 'Fundamentos da Fé Cristã', type: 'pdf', size: '1.8 MB' },
    { disciplinaId: disc4.id, title: 'Princípios de Interpretação Bíblica', type: 'pdf', size: '3.1 MB' },
    { disciplinaId: disc2.id, title: 'Contexto Histórico do NT', type: 'video', duration: '38 min' },
    { disciplinaId: disc6.id, title: 'Como Preparar um Sermão Expositivo', type: 'pdf', size: '890 KB' },
    { disciplinaId: disc5.id, title: 'Igreja Primitiva – Séculos I–III', type: 'pdf', size: '4.2 MB' },
    { disciplinaId: disc3.id, title: 'Podcast – Doutrina da Revelação', type: 'audio', duration: '32 min' },
  ]
  for (const m of mats) {
    await prisma.material.create({ data: m }).catch(() => {})
  }

  // ── Eventos ──────────────────────────────────────────────────────────────────
  const eventos = [
    { title: 'Prova – Antigo Testamento I', date: '2026-06-05', time: '08:00', type: 'exam', disciplinaId: disc1.id },
    { title: 'Culto Estudantil', date: '2026-05-28', time: '19:00', type: 'event' },
    { title: 'Entrega – Trabalho de Hermenêutica', date: '2026-06-10', time: '23:59', type: 'deadline', disciplinaId: disc4.id },
    { title: 'Prova – Teologia Sistemática I', date: '2026-06-12', time: '14:00', type: 'exam', disciplinaId: disc3.id },
    { title: 'Semana de Teologia', date: '2026-06-16', time: '09:00', type: 'event' },
    { title: 'Feriado – Corpus Christi', date: '2026-06-19', time: 'Todo o dia', type: 'holiday' },
    { title: 'Confraternização dos Alunos', date: '2026-06-26', time: '18:00', type: 'event' },
    { title: 'Prova – História da Igreja', date: '2026-06-08', time: '08:00', type: 'exam', disciplinaId: disc5.id },
    { title: 'Prazo de Solicitação de Documentos', date: '2026-06-30', time: '17:00', type: 'deadline' },
    { title: 'Início do Recesso de Julho', date: '2026-07-01', time: 'Todo o dia', type: 'academic' },
  ]
  for (const e of eventos) {
    await prisma.evento.create({ data: e }).catch(() => {})
  }

  console.log('✅ Seed concluído!')
  console.log('')
  console.log('📋 Credenciais de acesso:')
  console.log('   Aluno:     joao.silva@btcp.edu.br  / btcp2026')
  console.log('   Admin:     admin@btcp.edu.br        / btcp2026')
  console.log('   Professor: carlos.mendes@btcp.edu.br / btcp2026')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
