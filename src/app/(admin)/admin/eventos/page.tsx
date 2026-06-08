'use client'

import { useEffect, useState } from 'react'
import {
  CalendarDays, Plus, Trash2, X, Loader2, CheckCircle,
  AlertCircle, Clock, BookOpen, Star, Tag,
} from 'lucide-react'
import { api } from '@/lib/api'

const typeConfig: Record<string, { label: string; color: string; icon: any }> = {
  exam:     { label: 'Prova',      color: '#EF4444', icon: AlertCircle },
  deadline: { label: 'Entrega',    color: '#F59E0B', icon: Clock },
  event:    { label: 'Evento',     color: '#3B82F6', icon: Star },
  academic: { label: 'Acadêmico',  color: '#8B5CF6', icon: BookOpen },
  holiday:  { label: 'Feriado',    color: '#10B981', icon: Tag },
}

const emptyForm = {
  title: '',
  date: '',
  time: '',
  type: 'event',
  disciplinaId: '',
}

export default function AdminEventos() {
  const [events, setEvents]       = useState<any[]>([])
  const [disciplinas, setDisciplinas] = useState<any[]>([])
  const [loading, setLoading]     = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm]           = useState(emptyForm)
  const [saving, setSaving]       = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null)
  const [deleting, setDeleting]   = useState(false)
  const [msg, setMsg]             = useState<{ text: string; ok: boolean } | null>(null)
  const [errors, setErrors]       = useState<Record<string, string>>({})

  async function fetchEvents() {
    try {
      const data = await api.admin.eventos()
      setEvents(data)
    } catch {
      setEvents([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
    api.admin.disciplinas().then(setDisciplinas).catch(() => {})
  }, [])

  const sorted = [...events].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  function validate() {
    const e: Record<string, string> = {}
    if (!form.title.trim()) e.title = 'Título é obrigatório'
    if (!form.date) e.date = 'Data é obrigatória'
    if (!form.time.trim()) e.time = 'Horário é obrigatório'
    return e
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setSaving(true)
    try {
      await api.admin.criarEvento({
        title: form.title,
        date: form.date,
        time: form.time,
        type: form.type,
        ...(form.disciplinaId ? { disciplinaId: form.disciplinaId } : {}),
      })
      setMsg({ text: 'Evento criado com sucesso!', ok: true })
      setShowModal(false)
      setForm(emptyForm)
      await fetchEvents()
    } catch {
      setMsg({ text: 'Erro ao criar evento.', ok: false })
    }
    setSaving(false)
    setTimeout(() => setMsg(null), 4000)
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await api.admin.deletarEvento(deleteTarget.id)
      setMsg({ text: 'Evento removido!', ok: true })
      setDeleteTarget(null)
      await fetchEvents()
    } catch {
      setMsg({ text: 'Erro ao remover evento.', ok: false })
    }
    setDeleting(false)
    setTimeout(() => setMsg(null), 4000)
  }

  function inp(label: string, key: keyof typeof form, opts?: { type?: string; placeholder?: string }) {
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

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Eventos</h2>
          <p className="text-sm text-gray-400 mt-0.5">{events.length} evento{events.length !== 1 ? 's' : ''} cadastrado{events.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => { setShowModal(true); setForm(emptyForm); setErrors({}) }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm shadow-md transition-all hover:opacity-90"
          style={{ background: '#071B34', color: '#C8A35F' }}>
          <Plus size={16} /> Novo Evento
        </button>
      </div>

      {/* Modal: Novo Evento */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 my-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-900 text-lg">Novo Evento</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {inp('Título *', 'title', { placeholder: 'Ex: Prova de Hermenêutica' })}

              <div className="grid sm:grid-cols-2 gap-4">
                {inp('Data *', 'date', { type: 'date' })}
                {inp('Horário *', 'time', { placeholder: 'Ex: 08:00 ou Todo o dia' })}
              </div>

              {/* Tipo */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Tipo *</label>
                <div className="grid grid-cols-5 gap-2">
                  {Object.entries(typeConfig).map(([key, cfg]) => {
                    const Icon = cfg.icon
                    const active = form.type === key
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setForm({ ...form, type: key })}
                        className="flex flex-col items-center gap-1.5 py-2.5 px-1 rounded-xl border text-center transition-all text-[11px] font-semibold"
                        style={{
                          borderColor: active ? cfg.color : '#E5E7EB',
                          background: active ? `${cfg.color}12` : 'white',
                          color: active ? cfg.color : '#9CA3AF',
                        }}>
                        <Icon size={15} />
                        {cfg.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Disciplina (opcional) */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Disciplina (opcional)</label>
                <select
                  value={form.disciplinaId}
                  onChange={e => setForm({ ...form, disciplinaId: e.target.value })}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none transition-all"
                  onFocus={ev => { ev.currentTarget.style.borderColor = '#C8A35F'; ev.currentTarget.style.boxShadow = '0 0 0 3px rgba(200,163,95,0.12)' }}
                  onBlur={ev => { ev.currentTarget.style.borderColor = ''; ev.currentTarget.style.boxShadow = '' }}>
                  <option value="">— Nenhuma (evento geral) —</option>
                  {disciplinas.map(d => (
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
                  {saving ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
                  Criar Evento
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
              <h3 className="font-bold text-gray-900">Remover Evento</h3>
              <button onClick={() => setDeleteTarget(null)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={16} /></button>
            </div>
            <p className="text-sm text-gray-600 mb-5">
              Tem certeza que deseja remover <span className="font-semibold text-gray-900">"{deleteTarget.title}"</span>?
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

      {/* Legend */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(typeConfig).map(([key, cfg]) => {
          const Icon = cfg.icon
          return (
            <div key={key} className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border"
              style={{ background: `${cfg.color}10`, borderColor: `${cfg.color}30`, color: cfg.color }}>
              <Icon size={11} /> {cfg.label}
            </div>
          )
        })}
      </div>

      {/* Events list */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50">
          <h3 className="font-semibold text-gray-900">{sorted.length} evento{sorted.length !== 1 ? 's' : ''}</h3>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-7 h-7 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#C8A35F', borderTopColor: 'transparent' }} />
          </div>
        ) : sorted.length === 0 ? (
          <div className="py-16 text-center">
            <CalendarDays size={40} className="mx-auto mb-3 text-gray-200" />
            <p className="text-sm text-gray-400 font-medium">Nenhum evento cadastrado</p>
            <p className="text-xs text-gray-300 mt-1">Clique em "Novo Evento" para começar</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {sorted.map(ev => {
              const cfg = typeConfig[ev.type] ?? typeConfig.event
              const Icon = cfg.icon
              const d = new Date(ev.date)
              const day = d.getDate().toString().padStart(2, '0')
              const weekday = d.toLocaleString('pt-BR', { weekday: 'short' }).replace('.', '')
              const month = d.toLocaleString('pt-BR', { month: 'short' }).replace('.', '')
              const isPast = d < new Date(new Date().setHours(0, 0, 0, 0))

              return (
                <div key={ev.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/60 transition-colors">
                  {/* Date badge */}
                  <div className="flex flex-col items-center w-12 flex-shrink-0 text-center" style={{ opacity: isPast ? 0.45 : 1 }}>
                    <span className="text-xl font-black leading-none" style={{ color: '#071B34' }}>{day}</span>
                    <span className="text-[10px] font-semibold uppercase" style={{ color: '#94A3B8' }}>{weekday}</span>
                    <span className="text-[10px] font-semibold uppercase" style={{ color: '#94A3B8' }}>{month}</span>
                  </div>

                  <div className="w-px h-10 flex-shrink-0 bg-gray-100" />

                  {/* Type icon */}
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${cfg.color}12` }}>
                    <Icon size={16} style={{ color: cfg.color }} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate" style={{ color: isPast ? '#94A3B8' : '#071B34' }}>
                      {ev.title}
                    </p>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      <span className="flex items-center gap-1 text-xs" style={{ color: '#94A3B8' }}>
                        <Clock size={10} /> {ev.time}
                      </span>
                      {ev.disciplina && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                          style={{ background: '#F1F5F9', color: '#64748B' }}>
                          {ev.disciplina.name}
                        </span>
                      )}
                      {isPast && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                          style={{ background: '#F1F5F9', color: '#94A3B8' }}>
                          Passado
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Type badge */}
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 hidden sm:inline-flex"
                    style={{ background: `${cfg.color}12`, color: cfg.color }}>
                    {cfg.label}
                  </span>

                  {/* Delete */}
                  <button
                    onClick={() => setDeleteTarget(ev)}
                    className="p-2 rounded-xl text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all flex-shrink-0"
                    title="Remover evento">
                    <Trash2 size={15} />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
