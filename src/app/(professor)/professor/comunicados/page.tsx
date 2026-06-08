'use client'

import { useEffect, useState } from 'react'
import {
  Megaphone, Plus, Trash2, X, Loader2, CheckCircle,
  AlertTriangle, Info, Zap, Users, BookOpen,
} from 'lucide-react'
import { api } from '@/lib/api'

const priorityConfig = {
  info:    { label: 'Informativo', color: '#3B82F6', bg: 'rgba(59,130,246,0.1)', icon: Info },
  aviso:   { label: 'Aviso',       color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', icon: AlertTriangle },
  urgente: { label: 'Urgente',     color: '#EF4444', bg: 'rgba(239,68,68,0.1)', icon: Zap },
}

const emptyForm = { title: '', content: '', priority: 'info', disciplinaId: '' }

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}min atrás`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h atrás`
  const days = Math.floor(hrs / 24)
  return `${days}d atrás`
}

export default function ProfessorComunicados() {
  const [comunicados, setComunicados] = useState<any[]>([])
  const [disciplinas, setDisciplinas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  async function fetchComunicados() {
    try {
      const data = await api.professor.comunicados()
      setComunicados(data)
    } catch { setComunicados([]) }
    finally { setLoading(false) }
  }

  useEffect(() => {
    fetchComunicados()
    api.professor.turmas().then(setDisciplinas).catch(() => {})
  }, [])

  function validate() {
    const e: Record<string, string> = {}
    if (!form.title.trim()) e.title = 'Título é obrigatório'
    if (!form.content.trim()) e.content = 'Conteúdo é obrigatório'
    return e
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setSaving(true)
    try {
      await api.professor.criarComunicado({
        title: form.title,
        content: form.content,
        priority: form.priority,
        ...(form.disciplinaId ? { disciplinaId: form.disciplinaId } : {}),
      })
      setMsg({ text: 'Comunicado enviado!', ok: true })
      setShowModal(false)
      setForm(emptyForm)
      await fetchComunicados()
    } catch {
      setMsg({ text: 'Erro ao enviar comunicado.', ok: false })
    }
    setSaving(false)
    setTimeout(() => setMsg(null), 4000)
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await api.professor.deletarComunicado(deleteTarget.id)
      setMsg({ text: 'Comunicado removido!', ok: true })
      setDeleteTarget(null)
      await fetchComunicados()
    } catch {
      setMsg({ text: 'Erro ao remover.', ok: false })
    }
    setDeleting(false)
    setTimeout(() => setMsg(null), 4000)
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">

      {/* Toast */}
      {msg && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-lg text-sm font-medium text-white flex items-center gap-2 ${msg.ok ? 'bg-green-600' : 'bg-red-500'}`}>
          {msg.ok && <CheckCircle size={15} />} {msg.text}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Comunicados</h2>
          <p className="text-sm text-gray-400 mt-0.5">Envie avisos e informações para seus alunos</p>
        </div>
        <button
          onClick={() => { setShowModal(true); setForm(emptyForm); setErrors({}) }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm shadow-md transition-all hover:opacity-90"
          style={{ background: '#071B34', color: '#C8A35F' }}>
          <Plus size={16} /> Novo Comunicado
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total enviados', value: comunicados.length, icon: Megaphone, color: '#C8A35F' },
          { label: 'Para todas turmas', value: comunicados.filter(c => !c.disciplinaId).length, icon: Users, color: '#3B82F6' },
          { label: 'Por disciplina', value: comunicados.filter(c => c.disciplinaId).length, icon: BookOpen, color: '#8B5CF6' },
        ].map(s => {
          const Icon = s.icon
          return (
            <div key={s.label} className="bg-white rounded-2xl shadow-card p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{s.label}</p>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${s.color}14`, color: s.color }}>
                  <Icon size={15} />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900">{s.value}</p>
            </div>
          )
        })}
      </div>

      {/* Modal: Novo Comunicado */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 my-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-900 text-lg">Novo Comunicado</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Título */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Título *</label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="Ex: Aula cancelada – Quarta-feira"
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none transition-all"
                  onFocus={ev => { ev.currentTarget.style.borderColor = '#C8A35F'; ev.currentTarget.style.boxShadow = '0 0 0 3px rgba(200,163,95,0.12)' }}
                  onBlur={ev => { ev.currentTarget.style.borderColor = ''; ev.currentTarget.style.boxShadow = '' }} />
                {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
              </div>

              {/* Conteúdo */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Mensagem *</label>
                <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })}
                  placeholder="Escreva o comunicado completo aqui..."
                  rows={4}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none transition-all resize-none"
                  onFocus={ev => { ev.currentTarget.style.borderColor = '#C8A35F'; ev.currentTarget.style.boxShadow = '0 0 0 3px rgba(200,163,95,0.12)' }}
                  onBlur={ev => { ev.currentTarget.style.borderColor = ''; ev.currentTarget.style.boxShadow = '' }} />
                {errors.content && <p className="text-xs text-red-500 mt-1">{errors.content}</p>}
              </div>

              {/* Prioridade */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Prioridade</label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(priorityConfig).map(([key, cfg]) => {
                    const Icon = cfg.icon
                    const active = form.priority === key
                    return (
                      <button key={key} type="button"
                        onClick={() => setForm({ ...form, priority: key })}
                        className="flex items-center gap-2 py-2.5 px-3 rounded-xl border text-sm font-semibold transition-all"
                        style={{
                          borderColor: active ? cfg.color : '#E5E7EB',
                          background: active ? cfg.bg : 'white',
                          color: active ? cfg.color : '#9CA3AF',
                        }}>
                        <Icon size={14} /> {cfg.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Disciplina */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Disciplina (opcional)</label>
                <select value={form.disciplinaId} onChange={e => setForm({ ...form, disciplinaId: e.target.value })}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none transition-all"
                  onFocus={ev => { ev.currentTarget.style.borderColor = '#C8A35F'; ev.currentTarget.style.boxShadow = '0 0 0 3px rgba(200,163,95,0.12)' }}
                  onBlur={ev => { ev.currentTarget.style.borderColor = ''; ev.currentTarget.style.boxShadow = '' }}>
                  <option value="">— Todas as turmas —</option>
                  {disciplinas.map((d: any) => (
                    <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all">
                  Cancelar
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-60"
                  style={{ background: '#C8A35F', color: '#071B34' }}>
                  {saving ? <Loader2 size={15} className="animate-spin" /> : <Megaphone size={15} />}
                  Enviar
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
              <h3 className="font-bold text-gray-900">Remover Comunicado</h3>
              <button onClick={() => setDeleteTarget(null)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={16} /></button>
            </div>
            <p className="text-sm text-gray-600 mb-5">
              Remover <span className="font-semibold text-gray-900">"{deleteTarget.title}"</span>?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-gray-100 text-gray-600">Cancelar</button>
              <button onClick={handleDelete} disabled={deleting}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm bg-red-500 text-white hover:bg-red-600 disabled:opacity-60">
                {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />} Remover
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-7 h-7 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#C8A35F', borderTopColor: 'transparent' }} />
          </div>
        ) : comunicados.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-card py-16 text-center">
            <Megaphone size={40} className="mx-auto mb-3 text-gray-200" />
            <p className="text-sm font-medium text-gray-400">Nenhum comunicado enviado</p>
            <p className="text-xs text-gray-300 mt-1">Clique em "Novo Comunicado" para começar</p>
          </div>
        ) : (
          comunicados.map(c => {
            const cfg = priorityConfig[c.priority as keyof typeof priorityConfig] ?? priorityConfig.info
            const Icon = cfg.icon
            return (
              <div key={c.id} className="bg-white rounded-2xl shadow-card p-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: cfg.bg, color: cfg.color }}>
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h4 className="font-bold text-sm text-gray-900">{c.title}</h4>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: cfg.bg, color: cfg.color }}>
                        {cfg.label}
                      </span>
                      {c.disciplinaName ? (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                          {c.disciplinaCode}
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-500">
                          Todas as turmas
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed mb-2">{c.content}</p>
                    <p className="text-xs text-gray-400">{timeAgo(c.createdAt)}</p>
                  </div>
                  <button onClick={() => setDeleteTarget(c)}
                    className="p-2 rounded-xl text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all flex-shrink-0">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
