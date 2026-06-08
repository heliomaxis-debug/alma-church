'use client'

import { useEffect, useState, useCallback } from 'react'
import { BookOpen, Search, Clock, Hash, Plus, X, Loader2, CheckCircle, Pencil, Trash2, Users } from 'lucide-react'
import { api } from '@/lib/api'

const tiposSemestre = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

const emptyForm = { name: '', code: '', credits: 4, schedule: '', room: '', semester: 1, professorId: '' }

export default function AdminDisciplinas() {
  const [disciplinas, setDisciplinas] = useState<any[]>([])
  const [professores, setProfessores] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editTarget, setEditTarget] = useState<any | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Matrícula modal
  const [enrollTarget, setEnrollTarget] = useState<any | null>(null)
  const [alunos, setAlunos] = useState<any[]>([])
  const [enrollData, setEnrollData] = useState({ alunoId: '', year: new Date().getFullYear(), semester: 1 })
  const [enrolling, setEnrolling] = useState(false)

  const fetchAll = useCallback(async () => {
    const [d, p] = await Promise.all([
      api.admin.disciplinas().catch(() => []),
      api.admin.professores().catch(() => []),
    ])
    setDisciplinas(d)
    setProfessores(p)
    setLoading(false)
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const filtered = disciplinas.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.code.toLowerCase().includes(search.toLowerCase()) ||
    (d.professor?.name ?? '').toLowerCase().includes(search.toLowerCase())
  )

  function openNew() {
    setEditTarget(null)
    setForm(emptyForm)
    setErrors({})
    setShowModal(true)
  }

  function openEdit(d: any) {
    setEditTarget(d)
    setForm({ name: d.name, code: d.code, credits: d.credits, schedule: d.schedule, room: d.room, semester: d.semester, professorId: d.professorId })
    setErrors({})
    setShowModal(true)
  }

  function openEnroll(d: any) {
    setEnrollTarget(d)
    setEnrollData({ alunoId: '', year: new Date().getFullYear(), semester: 1 })
    api.admin.alunos().then(setAlunos).catch(() => {})
  }

  function validate() {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Nome é obrigatório'
    if (!form.code.trim()) e.code = 'Código é obrigatório'
    if (!form.professorId) e.professorId = 'Selecione um professor'
    if (form.credits < 1) e.credits = 'Créditos inválidos'
    return e
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setSaving(true)
    try {
      if (editTarget) {
        await api.admin.editarDisciplina(editTarget.id, form)
        setMsg({ text: 'Disciplina atualizada!', ok: true })
      } else {
        await api.admin.criarDisciplina(form)
        setMsg({ text: 'Disciplina cadastrada!', ok: true })
      }
      setShowModal(false)
      await fetchAll()
    } catch (err: any) {
      const body = (() => { try { return JSON.parse(err?.message ?? '{}') } catch { return {} } })()
      setMsg({ text: body.error ?? 'Erro ao salvar disciplina.', ok: false })
    }
    setSaving(false)
    setTimeout(() => setMsg(null), 4000)
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await api.admin.deletarDisciplina(deleteTarget.id)
      setMsg({ text: 'Disciplina removida!', ok: true })
      setDeleteTarget(null)
      await fetchAll()
    } catch (err: any) {
      const body = (() => { try { return JSON.parse(err?.message ?? '{}') } catch { return {} } })()
      setMsg({ text: body.error ?? 'Erro ao remover disciplina.', ok: false })
    }
    setDeleting(false)
    setTimeout(() => setMsg(null), 4000)
  }

  async function handleEnroll(e: React.FormEvent) {
    e.preventDefault()
    if (!enrollTarget || !enrollData.alunoId) return
    setEnrolling(true)
    try {
      await api.admin.matricularAluno({ ...enrollData, disciplinaId: enrollTarget.id })
      setMsg({ text: 'Aluno matriculado com sucesso!', ok: true })
      setEnrollTarget(null)
    } catch (err: any) {
      const body = (() => { try { return JSON.parse(err?.message ?? '{}') } catch { return {} } })()
      setMsg({ text: body.error ?? 'Erro ao matricular aluno.', ok: false })
    }
    setEnrolling(false)
    setTimeout(() => setMsg(null), 4000)
  }

  function field(label: string, key: keyof typeof form, opts?: { type?: string; placeholder?: string; min?: number; max?: number }) {
    return (
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>
        <input
          type={opts?.type ?? 'text'}
          min={opts?.min}
          max={opts?.max}
          value={form[key] as string | number}
          onChange={e => setForm({ ...form, [key]: opts?.type === 'number' ? Number(e.target.value) : e.target.value })}
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
          <h2 className="text-xl font-bold text-gray-900">Disciplinas</h2>
          <p className="text-sm text-gray-400 mt-0.5">{disciplinas.length} disciplina{disciplinas.length !== 1 ? 's' : ''} cadastrada{disciplinas.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm shadow-md transition-all hover:opacity-90"
          style={{ background: '#071B34', color: '#C8A35F' }}>
          <Plus size={16} /> Nova Disciplina
        </button>
      </div>

      {/* Modal: Nova / Editar Disciplina */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-900 text-lg">{editTarget ? 'Editar Disciplina' : 'Nova Disciplina'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={16} /></button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                {field('Nome *', 'name', { placeholder: 'Antigo Testamento I' })}
                {field('Código *', 'code', { placeholder: 'AT001' })}
                {field('Créditos', 'credits', { type: 'number', min: 1, max: 20 })}
                {field('Horário', 'schedule', { placeholder: 'Seg/Qua 19h–21h' })}
                {field('Sala', 'room', { placeholder: 'Sala 03' })}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Manual</label>
                <select value={form.semester} onChange={e => setForm({ ...form, semester: Number(e.target.value) })}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none"
                  onFocus={ev => { ev.currentTarget.style.borderColor = '#C8A35F'; ev.currentTarget.style.boxShadow = '0 0 0 3px rgba(200,163,95,0.12)' }}
                  onBlur={ev => { ev.currentTarget.style.borderColor = ''; ev.currentTarget.style.boxShadow = '' }}>
                  {tiposSemestre.map(s => <option key={s} value={s}>Manual {s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Professor *</label>
                <select value={form.professorId} onChange={e => setForm({ ...form, professorId: e.target.value })}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none"
                  onFocus={ev => { ev.currentTarget.style.borderColor = '#C8A35F'; ev.currentTarget.style.boxShadow = '0 0 0 3px rgba(200,163,95,0.12)' }}
                  onBlur={ev => { ev.currentTarget.style.borderColor = ''; ev.currentTarget.style.boxShadow = '' }}>
                  <option value="">— Selecione —</option>
                  {professores.map(p => <option key={p.id} value={p.id}>{p.name}{p.title ? ` (${p.title})` : ''}</option>)}
                </select>
                {errors.professorId && <p className="text-xs text-red-500 mt-1">{errors.professorId}</p>}
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
                  {editTarget ? 'Salvar' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Confirmar exclusão */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setDeleteTarget(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Remover Disciplina</h3>
              <button onClick={() => setDeleteTarget(null)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={16} /></button>
            </div>
            <p className="text-sm text-gray-600 mb-5">
              Tem certeza que deseja remover <span className="font-semibold text-gray-800">{deleteTarget.name}</span>?
              Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all">
                Cancelar
              </button>
              <button onClick={handleDelete} disabled={deleting}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm bg-red-500 text-white hover:bg-red-600 transition-all disabled:opacity-60">
                {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                Remover
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Matricular Aluno */}
      {enrollTarget && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setEnrollTarget(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Matricular Aluno</h3>
              <button onClick={() => setEnrollTarget(null)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={16} /></button>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Disciplina: <span className="font-semibold text-gray-800">{enrollTarget.name}</span>
            </p>
            <form onSubmit={handleEnroll} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Aluno *</label>
                <select value={enrollData.alunoId} onChange={e => setEnrollData({ ...enrollData, alunoId: e.target.value })}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none"
                  onFocus={ev => { ev.currentTarget.style.borderColor = '#C8A35F'; ev.currentTarget.style.boxShadow = '0 0 0 3px rgba(200,163,95,0.12)' }}
                  onBlur={ev => { ev.currentTarget.style.borderColor = ''; ev.currentTarget.style.boxShadow = '' }}>
                  <option value="">— Selecione o aluno —</option>
                  {alunos.map(a => <option key={a.id} value={a.id}>{a.name} (RA: {a.ra})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Ano</label>
                  <input type="number" value={enrollData.year} min={2020} max={2099}
                    onChange={e => setEnrollData({ ...enrollData, year: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Período</label>
                  <select value={enrollData.semester} onChange={e => setEnrollData({ ...enrollData, semester: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none">
                    <option value={1}>1º</option>
                    <option value={2}>2º</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setEnrollTarget(null)}
                  className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all">
                  Cancelar
                </button>
                <button type="submit" disabled={enrolling || !enrollData.alunoId}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-60"
                  style={{ background: '#C8A35F', color: '#071B34' }}>
                  {enrolling ? <Loader2 size={14} className="animate-spin" /> : null}
                  Matricular
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-2xl shadow-card p-4">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nome, código ou professor..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none transition-all"
            onFocus={e => { e.currentTarget.style.borderColor = '#C8A35F'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(200,163,95,0.12)' }}
            onBlur={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.boxShadow = '' }} />
        </div>
      </div>

      {/* List */}
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
              <BookOpen size={36} className="mx-auto text-gray-200 mb-2" />
              <p className="text-sm text-gray-400">Nenhuma disciplina encontrada</p>
            </div>
          ) : (
            filtered.map((d) => (
              <div key={d.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/60 transition-colors">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(200,163,95,0.1)', color: '#C8A35F' }}>
                  <BookOpen size={17} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{d.name}</p>
                  <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                    <span className="flex items-center gap-1 text-xs text-gray-400"><Hash size={11} /> {d.code}</span>
                    <span className="flex items-center gap-1 text-xs text-gray-400"><Clock size={11} /> {d.schedule || '—'}</span>
                  </div>
                </div>
                <div className="hidden sm:block text-right flex-shrink-0 mr-2">
                  <p className="text-sm font-semibold text-gray-700">{d.professor?.name ?? '—'}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{d.credits} créditos · Sala {d.room || '—'}</p>
                  <p className="text-xs text-gray-400">Manual {d.semester}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => openEnroll(d)}
                    title="Matricular aluno"
                    className="p-2 rounded-xl text-gray-300 hover:text-blue-600 hover:bg-blue-50 transition-all">
                    <Users size={15} />
                  </button>
                  <button onClick={() => openEdit(d)}
                    title="Editar"
                    className="p-2 rounded-xl text-gray-300 hover:text-yellow-600 hover:bg-yellow-50 transition-all">
                    <Pencil size={15} />
                  </button>
                  <button onClick={() => setDeleteTarget(d)}
                    title="Remover"
                    className="p-2 rounded-xl text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
