import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/auth'
import {
  getDashboard,
  getTurmas,
  getTurmaDetalhe,
  lancarNota,
  registrarPresenca,
  addMaterial,
  deleteMaterial,
  getSolicitacoes,
  getPerfil,
  updatePerfil,
  getComunicados,
  criarComunicado,
  deletarComunicado,
} from '../controllers/professor.controller'

export const professorRouter = Router()
professorRouter.use(requireAuth, requireRole('PROFESSOR', 'ADMIN'))

professorRouter.get('/dashboard', getDashboard)
professorRouter.get('/perfil', getPerfil)
professorRouter.patch('/perfil', updatePerfil)
professorRouter.get('/turmas', getTurmas)
professorRouter.get('/turmas/:id', getTurmaDetalhe)
professorRouter.post('/notas', lancarNota)
professorRouter.post('/presenca', registrarPresenca)
professorRouter.post('/materiais', addMaterial)
professorRouter.delete('/materiais/:id', deleteMaterial)
professorRouter.get('/solicitacoes', getSolicitacoes)
professorRouter.get('/comunicados', getComunicados)
professorRouter.post('/comunicados', criarComunicado)
professorRouter.delete('/comunicados/:id', deletarComunicado)
