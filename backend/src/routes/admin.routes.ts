import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/auth'
import {
  getAlunos, getDisciplinas, getProfessores,
  updateSolicitacao, getDashboardStats,
  getPagamentos, updatePagamento, getSolicitacoesAdmin,
  criarAluno, criarProfessor, resetarSenhaAdmin,
  criarDisciplina, editarDisciplina, deletarDisciplina,
  matricularAluno, getMatriculasAluno,
  gerarMensalidades,
  getEventos, criarEvento, deletarEvento,
  getCertificados, emitirCertificado, deletarCertificado,
  editarAluno,
} from '../controllers/admin.controller'

export const adminRouter = Router()
adminRouter.use(requireAuth, requireRole('ADMIN'))

// Stats
adminRouter.get('/stats', getDashboardStats)

// Alunos
adminRouter.get('/alunos', getAlunos)
adminRouter.post('/alunos', criarAluno)
adminRouter.patch('/alunos/:id', editarAluno)
adminRouter.post('/alunos/:id/reset-senha', resetarSenhaAdmin)
adminRouter.get('/alunos/:id/matriculas', getMatriculasAluno)

// Disciplinas
adminRouter.get('/disciplinas', getDisciplinas)
adminRouter.post('/disciplinas', criarDisciplina)
adminRouter.patch('/disciplinas/:id', editarDisciplina)
adminRouter.delete('/disciplinas/:id', deletarDisciplina)

// Matrículas
adminRouter.post('/matriculas', matricularAluno)

// Professores
adminRouter.get('/professores', getProfessores)
adminRouter.post('/professores', criarProfessor)

// Financeiro
adminRouter.get('/pagamentos', getPagamentos)
adminRouter.patch('/pagamentos/:id', updatePagamento)
adminRouter.post('/pagamentos/gerar', gerarMensalidades)

// Solicitações
adminRouter.get('/solicitacoes', getSolicitacoesAdmin)
adminRouter.patch('/solicitacoes/:id', updateSolicitacao)

// Calendário / Eventos
adminRouter.get('/eventos', getEventos)
adminRouter.post('/eventos', criarEvento)
adminRouter.delete('/eventos/:id', deletarEvento)

// Certificados
adminRouter.get('/certificados', getCertificados)
adminRouter.post('/certificados', emitirCertificado)
adminRouter.delete('/certificados/:id', deletarCertificado)
