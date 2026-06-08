'use client'

import { useEffect, useState } from 'react'
import { Users, Search, Mail, Hash, Plus, X, Loader2, CheckCircle, KeyRound, GraduationCap, BookOpen, Pencil } from 'lucide-react'
import { api } from '@/lib/api'

const statusStyle = (s: string) => {
  if (s === 'ATIVO') return { bg: 'rgba(22,163,74,0.1)', color: '#16a34a', label: 'Ativo' }
  if (s === 'INATIVO') return { bg: 'rgba(107,114,128,0.1)', color: '#6b7280', label: 'Inativo' }
  if (s === 'TRANCADO') return { bg: 'rgba(234,179,8,0.1)', color: '#ca8a04', label: 'Trancado' }
  return { bg: 'rgba(239,68,68,0.1)', color: '#ef4444', label: s }
}

const cursos = [
  'Bacharelado em Teologia',
  'Licenciatura em Teologia',
  'Pós-graduação em Teologia',
  'Mestrado em Teologia',
]

const emptyForm = { name: '', email: '', password: '', ra: '', curso: cursos[0], semestre: 1, phone: '', birthDate: '', cpf: '' }

export default function AdminAlunos() {
  const [alunos, setAlunos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  // Reset password modal
  const [resetTarget, setResetTarget] = useState<{ id: string; name: string } | null>(null)
  const [resetPw, setResetPw] = useState('')
  const [resetting, setResetting] = useState(false)
  // Matrículas modal
  const [matriculasTarget, setMatriculasTarget] = useState<{ id: string; name: string } | null>(null)
  const [matriculas, setMatriculas] = useState<any[]>([])
  const [loadingMatriculas, setLoadingMatriculas] = useState(false)
  // Editar aluno modal
  const [editTarget, setEditTarget] = useState<any | null>(null)
  const [editForm, setEditForm] = useState({ name: '', status: 'ATIVO', semestre: 1, curso: cursos[0], phone: '' })
  const [editSaving, setEditSaving] = useState(false)

  async function fetchAlunos() {
    api.admin.alunos().then(setAlunos).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { fetchAlunos() }, [])

  const filtered = alunos.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.ra.toLowerCase().includes(search.toLowerCase()) ||
    (a.user?.email ?? '').toLowerCase().includes(search.toLowerCase())
  )

  function validate() {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Nome é obrigatório'
    if (!form.email.trim()) e.email = 'E-mail é obrigatório'
    if (!form.password || form.password.length < 6) e.password = 'Senha: mínimo 6 caracteres'
    if (!form.curso) e.curso = 'Selecione o curso'
    return e
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setSaving(true)
    try {
      await api.admin.criarAluno({ ...form, semestre: Number(form.semestre) })
      setMsg({ text: 'Aluno cadastrado com sucesso!', ok: true })
      setShowModal(false)
      setForm(emptyForm)
      await fetchAlunos()
    } catch (err: any) {
      const body = (() => { try { return JSON.parse(err?.message ?? '{}') } catch { return {} } })()
      setMsg({ text: body.error ?? 'Erro ao cadastrar aluno.', ok: false })
    }
    setSaving(false)
    setTimeout(() => setMsg(null), 4000)
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    if (!resetTarget || resetPw.length < 6) return
    setResetting(true)
    try {
      await api.admin.resetarSenhaAluno(resetTarget.id, resetPw)
      setMsg({ text: `Senha de ${resetTarget.name} redefinida!`, ok: true })
      setResetTarget(null)
      setResetPw('')
    } catch {
      setMsg({ text: 'Erro ao redefinir senha.', ok: false })
    }
    setResetting(false)
    setTimeout(() => setMsg(null), 3500)
  }

  function openEdit(a: any) {
    setEditTarget(a)
    setEditForm({ name: a.name, status: a.status, semestre: a.semestre, curso: a.curso, phone: a.phone ?? '' })
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editTarget) return
    setEditSaving(true)
    try {
      await api.admin.editarAluno(editTarget.id, {
        name: editForm.name,
        status: editForm.status,
        semestre: Number(editForm.semestre),
        curso: editForm.curso,
        phone: editForm.phone || undefined,
      })
      setMsg({ text: `${editForm.name} atualizado!`, ok: true })
      setEditTarget(null)
      await fetchAlunos()
    } catch {
      setMsg({ text: 'Erro ao atualizar aluno.', ok: false })
    }
    setEditSaving(false)
    setTimeout(() => setMsg(null), 3500)
  }

  async function openMatriculas(aluno: { id: string; name: string }) {
    setMatriculasTarget(aluno)
    setMatriculas([])
    setLoadingMatriculas(true)
    try {
      const data = await api.admin.matriculasAluno(aluno.id)
      setMatriculas(data)
    } catch {
      setMatriculas([])
    }
    setLoadingMatriculas(false)
  }

  function field(label: string, key: keyof typeof form, opts?: { type?: string; placeholder?: string }) {
    return (
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>
        <input
          type={opts?.type ?? 'text'}
          value={form[key] as string}
          onChange={e => setForm({ ...form, [key]: e.target.value })}
          placeholder={opts?.placeholder}
          className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none transition-all"
          onFocus={ev => { ev.currentTarget.style.borderColor = '#C8A35F'; ev.currentTarget.style.boxShadow = '0 0 0 3px rgba(200,163,95,0.12)' }}
          onBlur={ev => { ev.currentTarget.style.borderColor = ''; ev.currentTarget.style.boxShadow = '' }}
        />
        {errors[key] && <p className="text-xs text-red-500 mt-1">{errors[key]}</p>}
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      {/* Toast */}
      {msg && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-lg text-sm font-medium text-white flex items-center gap-2 ${msg.ok ? 'bg-green-600' : 'bg-red-500'}`}>
          {msg.ok && <CheckCircle size={15} />} {msg.text}
        </div>
      )}

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Alunos</h2>
          <p className="text-sm text-gray-400 mt-0.5">{alunos.length} aluno{alunos.length !== 1 ? 's' : ''} cadastrado{alunos.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => { setShowModal(true); setErrors({}) }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm shadow-md transition-all hover:opacity-90"
          style={{ background: '#071B34', color: '#C8A35F' }}>
          <Plus size={16} /> Novo Aluno
        </button>
      </div>

      {/* Modal: Novo Aluno */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 my-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-900 text-lg">Cadastrar Novo Aluno</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                {field('Nome Completo *', 'name', { placeholder: 'João da Silva' })}
                {field('E-mail *', 'email', { type: 'email', placeholder: 'joao@email.com' })}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">RA (Registro Acadêmico)</label>
                  <div className="w-full px-3 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-400 flex items-center gap-2">
                    <span>Gerado automaticamente</span>
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ background: 'rgba(200,163,95,0.15)', color: '#b08030' }}>auto</span>
                  </div>
                </div>
                {field('Senha Inicial *', 'password', { type: 'password', placeholder: 'Mínimo 6 caracteres' })}
                {field('Telefone', 'phone', { placeholder: '(11) 99999-9999' })}
                {field('Data de Nascimento', 'birthDate', { placeholder: 'DD/MM/AAAA' })}
                {field('CPF', 'cpf', { placeholder: '000.000.000-00' })}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Manual</label>
                  <input type="number" min={1} max={10} value={form.semestre}
                    onChange={e => setForm({ ...form, semestre: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Curso *</label>
                <select value={form.curso} onChange={e => setForm({ ...form, curso: e.target.value })}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none">
                  {cursos.map(c => <option key={c}>{c}</option>)}
                </select>
                {errors.curso && <p className="text-xs text-red-500 mt-1">{errors.curso}</p>}
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all">
                  Cancelar
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-60"
                  style={{ background: '#C8A35F', color: '#071B34' }}>
                  {saving ? <Loader2 size={15} className="animate-spin" /> : null}
                  Cadastrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Editar Aluno */}
      {editTarget && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={() => setEditTarget(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 my-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Editar Aluno</h3>
                <p className="text-xs text-gray-400 mt-0.5">{editTarget.ra} · {editTarget.user?.email}</p>
              </div>
              <button onClick={() => setEditTarget(null)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={16} /></button>
            </div>
            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Nome Completo</label>
                <input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none"
                  onFocus={ev => { ev.currentTarget.style.borderColor = '#C8A35F'; ev.currentTarget.style.boxShadow = '0 0 0 3px rgba(200,163,95,0.12)' }}
                  onBlur={ev => { ev.currentTarget.style.borderColor = ''; ev.currentTarget.style.boxShadow = '' }} />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Status</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { v: 'ATIVO',    label: 'Ativo',    color: '#16a34a', bg: 'rgba(22,163,74,0.1)' },
                    { v: 'TRANCADO', label: 'Trancado', color: '#ca8a04', bg: 'rgba(234,179,8,0.1)' },
                    { v: 'INATIVO',  label: 'Inativo',  color: '#6b7280', bg: 'rgba(107,114,128,0.1)' },
                    { v: 'CONCLUIDO',label: 'Concluído',color: '#2563eb', bg: 'rgba(37,99,235,0.1)' },
                  ].map(opt => (
                    <button key={opt.v} type="button"
                      onClick={() => setEditForm({ ...editForm, status: opt.v })}
                      className="py-2 px-3 rounded-xl border text-xs font-semibold transition-all"
                      style={{
                        borderColor: editForm.status === opt.v ? opt.color : '#E5E7EB',
                        background: editForm.status === opt.v ? opt.bg : 'white',
                        color: editForm.status === opt.v ? opt.color : '#9CA3AF',
                      }}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Manual</label>
                  <input type="number" min={1} max={10} value={editForm.semestre}
                    onChange={e => setEditForm({ ...editForm, semestre: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none"
                    onFocus={ev => { ev.currentTarget.style.borderColor = '#C8A35F'; ev.currentTarget.style.boxShadow = '0 0 0 3px rgba(200,163,95,0.12)' }}
                    onBlur={ev => { ev.currentTarget.style.borderColor = ''; ev.currentTarget.style.boxShadow = '' }} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Telefone</label>
                  <input value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                    placeholder="(11) 99999-9999"
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none"
                    onFocus={ev => { ev.currentTarget.style.borderColor = '#C8A35F'; ev.currentTarget.style.boxShadow = '0 0 0 3px rgba(200,163,95,0.12)' }}
                    onBlur={ev => { ev.currentTarget.style.borderColor = ''; ev.currentTarget.style.boxShadow = '' }} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Curso</label>
                <select value={editForm.curso} onChange={e => setEditForm({ ...editForm, curso: e.target.value })}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none"
                  onFocus={ev => { ev.currentTarget.style.borderColor = '#C8A35F'; ev.currentTarget.style.boxShadow = '0 0 0 3px rgba(200,163,95,0.12)' }}
                  onBlur={ev => { ev.currentTarget.style.borderColor = ''; ev.currentTarget.style.boxShadow = '' }}>
                  {cursos.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setEditTarget(null)}
                  className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all">
                  Cancelar
                </button>
                <button type="submit" disabled={editSaving}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-60"
                  style={{ background: '#C8A35F', color: '#071B34' }}>
                  {editSaving ? <Loader2 size={15} className="animate-spin" /> : <Pencil size={14} />}
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Reset Senha */}
      {resetTarget && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setResetTarget(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-900">Redefinir Senha</h3>
              <button onClick={() => setResetTarget(null)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                <X size={16} />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Definir nova senha para <span className="font-semibold text-gray-800">{resetTarget.name}</span>
            </p>
            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Nova Senha *</label>
                <input type="password" value={resetPw} onChange={e => setResetPw(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none"
                  onFocus={e => { e.currentTarget.style.borderColor = '#C8A35F'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(200,163,95,0.12)' }}
                  onBlur={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.boxShadow = '' }} />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setResetTarget(null)}
                  className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all">
                  Cancelar
                </button>
                <button type="submit" disabled={resetting || resetPw.length < 6}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ background: '#071B34', color: '#C8A35F' }}>
                  {resetting ? <Loader2 size={14} className="animate-spin" /> : <KeyRound size={14} />}
                  Redefinir
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Matrículas do Aluno */}
      {matriculasTarget && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={() => setMatriculasTarget(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 my-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Matrículas</h3>
                <p className="text-xs text-gray-400 mt-0.5">{matriculasTarget.name}</p>
              </div>
              <button onClick={() => setMatriculasTarget(null)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                <X size={16} />
              </button>
            </div>

            {loadingMatriculas ? (
              <div className="flex items-center justify-center py-10">
                <div className="w-7 h-7 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#C8A35F', borderTopColor: 'transparent' }} />
              </div>
            ) : matriculas.length === 0 ? (
              <div className="py-10 text-center">
                <BookOpen size={32} className="mx-auto text-gray-200 mb-2" />
                <p className="text-sm text-gray-400">Nenhuma matrícula registrada</p>
              </div>
            ) : (
              <div className="space-y-2">
                {matriculas.map((m: any) => (
                  <div key={m.id} className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(200,163,95,0.1)', color: '#b08030' }}>
                      <BookOpen size={15} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{m.disciplina?.name ?? '—'}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{m.disciplina?.code} · {m.disciplina?.schedule ?? '—'}</p>
                      <p className="text-xs text-gray-400">{m.year} · Manual {m.semester} · Prof. {m.disciplina?.professor?.name ?? '—'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => setMatriculasTarget(null)}
              className="mt-5 w-full py-2.5 rounded-xl font-semibold text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-2xl shadow-card p-4">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nome, RA ou e-mail..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none transition-all"
            onFocus={e => { e.currentTarget.style.borderColor = '#C8A35F'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(200,163,95,0.12)' }}
            onBlur={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.boxShadow = '' }} />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50">
          <h3 className="font-semibold text-gray-900">{filtered.length} resultado{filtered.length !== 1 ? 's' : ''}</h3>
        </div>
        <div className="divide-y divide-gray-50">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-7 h-7 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#C8A35F', borderTopColor: 'transparent' }} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <Users size={36} className="mx-auto text-gray-200 mb-2" />
              <p className="text-sm text-gray-400">Nenhum aluno encontrado</p>
            </div>
          ) : (
            filtered.map((a) => {
              const s = statusStyle(a.status)
              const initials = a.name.split(' ').map((w: string) => w[0]).slice(0, 2).join('')
              return (
                <div key={a.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/60 transition-colors">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold"
                    style={{ background: 'rgba(200,163,95,0.1)', color: '#b08030' }}>
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{a.name}</p>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      <span className="flex items-center gap-1 text-xs text-gray-400"><Hash size={11} /> {a.ra}</span>
                      <span className="flex items-center gap-1 text-xs text-gray-400"><Mail size={11} /> {a.user?.email ?? '—'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="hidden sm:block text-right">
                      <p className="text-xs text-gray-400">{a.curso}</p>
                      <p className="text-xs text-gray-400 mt-0.5">Manual {a.semestre}</p>
                    </div>
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                      style={{ background: s.bg, color: s.color }}>{s.label}</span>
                    <button
                      onClick={() => openEdit(a)}
                      title="Editar aluno"
                      className="p-2 rounded-xl text-gray-300 hover:text-amber-600 hover:bg-amber-50 transition-all">
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => openMatriculas({ id: a.id, name: a.name })}
                      title="Ver matrículas"
                      className="p-2 rounded-xl text-gray-300 hover:text-indigo-600 hover:bg-indigo-50 transition-all">
                      <GraduationCap size={15} />
                    </button>
                    <button
                      onClick={() => { setResetTarget({ id: a.id, name: a.name }); setResetPw('') }}
                      title="Redefinir senha"
                      className="p-2 rounded-xl text-gray-300 hover:text-yellow-600 hover:bg-yellow-50 transition-all">
                      <KeyRound size={15} />
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
