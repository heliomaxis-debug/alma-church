const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3101'

let accessToken: string | null = null

export function setAccessToken(token: string | null) {
  accessToken = token
}

export function getAccessToken() {
  return accessToken
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string>),
  }
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`

  const res = await fetch(`${BASE_URL}${path}`, { ...init, headers })

  if (res.status === 401 && accessToken) {
    const refreshed = await tryRefresh()
    if (refreshed) {
      headers['Authorization'] = `Bearer ${accessToken}`
      const retry = await fetch(`${BASE_URL}${path}`, { ...init, headers })
      if (!retry.ok) throw new ApiError(retry.status, await retry.text())
      return retry.json()
    }
    throw new ApiError(401, 'Sessão expirada')
  }

  if (!res.ok) {
    const body = await res.text()
    throw new ApiError(res.status, body)
  }
  return res.json()
}

async function tryRefresh(): Promise<boolean> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null
  if (!token) return false
  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: token }),
    })
    if (!res.ok) return false
    const data = await res.json()
    accessToken = data.accessToken
    return true
  } catch {
    return false
  }
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
  }
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      request<{ accessToken: string; refreshToken: string; role: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    me: () => request<any>('/auth/me'),
    logout: (refreshToken: string) =>
      request('/auth/logout', { method: 'POST', body: JSON.stringify({ refreshToken }) }),
    forgotPassword: (email: string) =>
      request<{ ok: boolean; resetUrl?: string; message: string }>('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      }),
    resetPassword: (token: string, password: string) =>
      request<{ ok: boolean; message: string }>('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, password }),
      }),
    changePassword: (currentPassword: string, newPassword: string) =>
      request<{ ok: boolean; message: string }>('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      }),
  },
  aluno: {
    perfil: () => request<any>('/aluno/perfil'),
    updatePerfil: (data: { name?: string; phone?: string; address?: string; photo?: string }) =>
      request<any>('/aluno/perfil', { method: 'PATCH', body: JSON.stringify(data) }),
    notas: () => request<any[]>('/aluno/notas'),
    financeiro: () => request<any[]>('/aluno/financeiro'),
    calendario: () => request<any[]>('/aluno/calendario'),
    documentos: () => request<any[]>('/aluno/documentos'),
    criarDocumento: (data: { name: string; category: string; type: 'pdf' | 'img'; size?: string }) =>
      request<any>('/aluno/documentos', { method: 'POST', body: JSON.stringify(data) }),
    solicitacoes: () => request<any[]>('/aluno/solicitacoes'),
    criarSolicitacao: (data: { type: string; subject?: string; description: string }) =>
      request<any>('/aluno/solicitacoes', { method: 'POST', body: JSON.stringify(data) }),
    materiais: () => request<any[]>('/aluno/materiais'),
    checkins: () => request<any[]>('/aluno/checkins'),
    criarCheckin: (matriculaId: string, geo?: { lat: number; lng: number }) =>
      request<any>('/aluno/checkins', { method: 'POST', body: JSON.stringify({ matriculaId, ...geo }) }),
    carteirinha: () => request<any>('/aluno/carteirinha'),
    comunicados: () => request<any[]>('/aluno/comunicados'),
    certificados: () => request<any[]>('/aluno/certificados'),
  },
  professor: {
    dashboard: () => request<any>('/professor/dashboard'),
    perfil: () => request<any>('/professor/perfil'),
    updatePerfil: (data: { name?: string; title?: string }) =>
      request<any>('/professor/perfil', { method: 'PATCH', body: JSON.stringify(data) }),
    turmas: () => request<any[]>('/professor/turmas'),
    turma: (id: string) => request<any>(`/professor/turmas/${id}`),
    lancarNota: (data: { matriculaId: string; numero: number; valor: number }) =>
      request<any>('/professor/notas', { method: 'POST', body: JSON.stringify(data) }),
    registrarPresenca: (data: { matriculaId: string; status?: string }) =>
      request<any>('/professor/presenca', { method: 'POST', body: JSON.stringify(data) }),
    addMaterial: (data: { disciplinaId: string; title: string; type: string; size?: string; duration?: string }) =>
      request<any>('/professor/materiais', { method: 'POST', body: JSON.stringify(data) }),
    deleteMaterial: (id: string) =>
      request<any>(`/professor/materiais/${id}`, { method: 'DELETE' }),
    solicitacoes: () => request<any[]>('/professor/solicitacoes'),
    comunicados: () => request<any[]>('/professor/comunicados'),
    criarComunicado: (data: { title: string; content: string; priority: string; disciplinaId?: string }) =>
      request<any>('/professor/comunicados', { method: 'POST', body: JSON.stringify(data) }),
    deletarComunicado: (id: string) =>
      request<any>(`/professor/comunicados/${id}`, { method: 'DELETE' }),
  },
  admin: {
    stats: () => request<any>('/admin/stats'),
    alunos: () => request<any[]>('/admin/alunos'),
    criarAluno: (data: { name: string; email: string; password: string; ra?: string; curso: string; semestre: number; phone?: string; birthDate?: string; cpf?: string }) =>
      request<any>('/admin/alunos', { method: 'POST', body: JSON.stringify(data) }),
    editarAluno: (id: string, data: { name?: string; phone?: string; status?: string; semestre?: number; curso?: string }) =>
      request<any>(`/admin/alunos/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    resetarSenhaAluno: (id: string, password: string) =>
      request<any>(`/admin/alunos/${id}/reset-senha`, { method: 'POST', body: JSON.stringify({ password }) }),
    disciplinas: () => request<any[]>('/admin/disciplinas'),
    professores: () => request<any[]>('/admin/professores'),
    criarProfessor: (data: { name: string; email: string; password: string; title?: string }) =>
      request<any>('/admin/professores', { method: 'POST', body: JSON.stringify(data) }),
    pagamentos: () => request<any[]>('/admin/pagamentos'),
    marcarPago: (id: string, metodo?: string) =>
      request<any>(`/admin/pagamentos/${id}`, { method: 'PATCH', body: JSON.stringify({ pago: true, metodo }) }),
    solicitacoes: () => request<any[]>('/admin/solicitacoes'),
    updateSolicitacao: (id: string, status: string) =>
      request<any>(`/admin/solicitacoes/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    // Disciplinas CRUD
    criarDisciplina: (data: { name: string; code: string; credits: number; schedule: string; room: string; semester: number; professorId: string }) =>
      request<any>('/admin/disciplinas', { method: 'POST', body: JSON.stringify(data) }),
    editarDisciplina: (id: string, data: Partial<{ name: string; code: string; credits: number; schedule: string; room: string; semester: number; professorId: string }>) =>
      request<any>(`/admin/disciplinas/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    deletarDisciplina: (id: string) =>
      request<any>(`/admin/disciplinas/${id}`, { method: 'DELETE' }),
    // Matrículas
    matriculasAluno: (alunoId: string) => request<any[]>(`/admin/alunos/${alunoId}/matriculas`),
    matricularAluno: (data: { alunoId: string; disciplinaId: string; year: number; semester: number }) =>
      request<any>('/admin/matriculas', { method: 'POST', body: JSON.stringify(data) }),
    // Gerar mensalidades
    gerarMensalidades: (data: { alunoId?: string; todos?: boolean; ano: number; meses: number[]; valor: number }) =>
      request<any>('/admin/pagamentos/gerar', { method: 'POST', body: JSON.stringify(data) }),
    // Eventos
    eventos: () => request<any[]>('/admin/eventos'),
    criarEvento: (data: { title: string; date: string; time: string; type: string; disciplinaId?: string }) =>
      request<any>('/admin/eventos', { method: 'POST', body: JSON.stringify(data) }),
    deletarEvento: (id: string) =>
      request<any>(`/admin/eventos/${id}`, { method: 'DELETE' }),
    // Certificados
    certificados: () => request<any[]>('/admin/certificados'),
    emitirCertificado: (data: { alunoId: string; tipo: string; titulo: string; descricao?: string; cargaHoraria?: number; issueDate: string }) =>
      request<any>('/admin/certificados', { method: 'POST', body: JSON.stringify(data) }),
    deletarCertificado: (id: string) =>
      request<any>(`/admin/certificados/${id}`, { method: 'DELETE' }),
  },
  public: {
    verificarCertificado: (codigo: string) =>
      request<any>(`/public/certificados/${codigo}`),
  },
}
