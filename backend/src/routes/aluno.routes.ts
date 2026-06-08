import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/auth'
import {
  getPerfil, updatePerfil,
  getNotas, getFinanceiro, getCalendario,
  getDocumentos, createDocumento,
  getSolicitacoes, createSolicitacao,
  getMateriais, getCheckins, createCheckin, getCarteirinha,
  getComunicadosAluno, getCertificadosAluno,
} from '../controllers/aluno.controller'

export const alunoRouter = Router()
alunoRouter.use(requireAuth, requireRole('ALUNO', 'ADMIN'))

alunoRouter.get('/perfil', getPerfil)
alunoRouter.patch('/perfil', updatePerfil)
alunoRouter.get('/notas', getNotas)
alunoRouter.get('/financeiro', getFinanceiro)
alunoRouter.get('/calendario', getCalendario)
alunoRouter.get('/documentos', getDocumentos)
alunoRouter.post('/documentos', createDocumento)
alunoRouter.get('/solicitacoes', getSolicitacoes)
alunoRouter.post('/solicitacoes', createSolicitacao)
alunoRouter.get('/materiais', getMateriais)
alunoRouter.get('/checkins', getCheckins)
alunoRouter.post('/checkins', createCheckin)
alunoRouter.get('/carteirinha', getCarteirinha)
alunoRouter.get('/comunicados', getComunicadosAluno)
alunoRouter.get('/certificados', getCertificadosAluno)
