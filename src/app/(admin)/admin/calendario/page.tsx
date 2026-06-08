'use client'

import { useEffect, useState, useCallback } from 'react'
import { Calendar, Plus, X, Loader2, CheckCircle, Trash2, BookOpen } from 'lucide-react'
import { api } from '@/lib/api'

const tiposEvento = [
  { value: 'exam', label: 'Prova / Avaliação', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
  { value: 'event', label: 'Evento', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
  { value: 'deadline', label: 'Prazo / Entrega', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  { value: 'academic', label: 'Acadêmico', color: '#C8A35F', bg: 'rgba(200,163,95,0.1)' },
  { value: 'holiday', label: 'Feriado / Recesso', color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
]

const tipoStyle = (type: string) => tiposEvento.find(t => t.value === type) ?? tiposEvento[1]

const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

const emptyForm = {
  title: '',
  date: '',
  time: 'Todo o dia',
  type: 'event',
  disciplinaId: '',
}

export default function AdminCalendario() {
  const [eventos, setEventos] = useState<any[]>([])
  const [disciplinas, setDisciplinas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [filterType, setFilterType] = useState<string>('TODOS')

  const fetchAll = useCallback(async () => {
    const [ev, disc] = await Promise.all([
      api.admin.eventos().catch(() => []),
      api.admin.disciplinas().catch(() => []),
    ])
    setEventos(ev)
    setDisciplinas(disc)
    setLoading(false)
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim() || !form.date) {
      setMsg({ text: 'Título e data são obrigatórios.', ok: false })
      setTimeout(() => setMsg(null), 3000)
      return
    }
    setSaving(true)
    try {
      await api.admin.criarEvento({
        title: form.title,
        date: form.date,
        time: form.time || 'Todo o dia',
        type: form.type,
        disciplinaId: form.disciplinaId || undefined,
      })
      setMsg({ text: 'Evento criado com sucesso!', ok: true })
      setShowModal(false)
      setForm(emptyForm)
      await fetchAll()
    } catch (err: any) {
      const body = (() => { try { return JSON.parse(err?.message ?? '{}') } catch { return {} } })()
      setMsg({ text: body.error ?? 'Erro ao criar evento.', ok: false })
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
      await fetchAll()
    } catch {
      setMsg({ text: 'Erro ao remover evento.', ok: false })
    }
    setDeleting(false)
    setTimeout(() => setMsg(null), 3000)
  }

  // Group events by month
  const filtered = eventos.filter(ev => filterType === 'TODOS' || ev.type === filterType)

  const grouped: Record<string, any[]> = {}
  for (const ev of filtered) {
    const dateStr = ev.date?.substring(0, 7) // YYYY-MM
    if (!grouped[dateStr]) grouped[dateStr] = []
    grouped[dateStr].push(ev)
  }
  const sortedMonths = Object.keys(grouped).sort()

  function formatMonthLabel(ym: string) {
    const [y, m] = ym.split('-')
    return `${meses[Number(m) - 1]} ${y}`
  }

  function formatDate(dateStr: string) {
    if (!dateStr) return '—'
    const [y, m, d] = dateStr.split('-')
    return `${d}/${m}/${y}`
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      {/* Toast */}
      {msg && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-lg text-sm font-medium text-white flex items-center gap-2 ${msg.ok ? 'bg-green-600' : 'bg-red-500'}`}>
          {msg.ok && <CheckCircle size={15} />} {msg.text}
        </div>
      )}

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Calendário Acadêmico</h2>
          <p className="text-sm text-gray-400 mt-0.5">{eventos.length} evento{eventos.length !== 1 ? 's' : ''} cadastrado{eventos.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => { setShowModal(true); setForm(emptyForm) }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm shadow-md transition-all hover:opacity-90"
          style={{ background: '#071B34', color: '#C8A35F' }}>
          <Plus size={16} /> Novo Evento
        </button>
      </div>

      {/* Modal: Novo Evento */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-900 text-lg">Novo Evento</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={16} /></button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Título *</label>
                <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="Ex: Prova de AT I"
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none transition-all"
                  onFocus={ev => { ev.currentTarget.style.borderColor = '#C8A35F'; ev.currentTarget.style.boxShadow = '0 0 0 3px rgba(200,163,95,0.12)' }}
                  onBlur={ev => { ev.currentTarget.style.borderColor = ''; ev.currentTarget.style.boxShadow = '' }} />
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Data *</label>
                  <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none transition-all"
                    onFocus={ev => { ev.currentTarget.style.borderColor = '#C8A35F'; ev.currentTarget.style.boxShadow = '0 0 0 3px rgba(200,163,95,0.12)' }}
                    onBlur={ev => { ev.currentTarget.style.borderColor = ''; ev.currentTarget.style.boxShadow = '' }} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Horário</label>
                  <input type="text" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })}
                    placeholder="Todo o dia"
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none transition-all"
                    onFocus={ev => { ev.currentTarget.style.borderColor = '#C8A35F'; ev.currentTarget.style.boxShadow = '0 0 0 3px rgba(200,163,95,0.12)' }}
                    onBlur={ev => { ev.currentTarget.style.borderColor = ''; ev.currentTarget.style.boxShadow = '' }} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Tipo *</label>
                <div className="grid grid-cols-2 gap-2">
                  {tiposEvento.map(t => (
                    <button key={t.value} type="button" onClick={() => setForm({ ...form, type: t.value })}
                      className="py-2 px-3 rounded-xl text-xs font-semibold text-left transition-all flex items-center gap-2"
                      style={form.type === t.value
                        ? { background: t.bg, color: t.color, outline: `2px solid ${t.color}` }
                        : { background: '#f1f5f9', color: '#64748b' }}>
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: t.color }} />
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Disciplina (opcional)</label>
                <select value={form.disciplinaId} onChange={e => setForm({ ...form, disciplinaId: e.target.value })}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none"
                  onFocus={ev => { ev.currentTarget.style.borderColor = '#C8A35F'; ev.currentTarget.style.boxShadow = '0 0 0 3px rgba(200,163,95,0.12)' }}
                  onBlur={ev => { ev.currentTarget.style.borderColor = ''; ev.currentTarget.style.boxShadow = '' }}>
                  <option value="">— Sem disciplina —</option>
                  {disciplinas.map(d => <option key={d.id} value={d.id}>{d.name} ({d.code})</option>)}
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
                  {saving ? <Loader2 size={15} className="animate-spin" /> : null}
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
              Remover <span className="font-semibold text-gray-800">{deleteTarget.title}</span>?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-gray-100 text-gray-600 hover:bg-gray-200">
                Cancelar
              </button>
              <button onClick={handleDelete} disabled={deleting}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm bg-red-500 text-white hover:bg-red-600 disabled:opacity-60">
                {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                Remover
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter by type */}
      <div className="bg-white rounded-2xl shadow-card p-4 flex flex-wrap gap-2">
        <button onClick={() => setFilterType('TODOS')}
          className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
          style={filterType === 'TODOS' ? { background: '#071B34', color: '#C8A35F' } : { background: '#f1f5f9', color: '#64748b' }}>
          Todos
        </button>
        {tiposEvento.map(t => (
          <button key={t.value} onClick={() => setFilterType(t.value)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
            style={filterType === t.value ? { background: t.bg, color: t.color, outline: `1.5px solid ${t.color}` } : { background: '#f1f5f9', color: '#64748b' }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: filterType === t.value ? t.color : '#94a3b8' }} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Events list grouped by month */}
      {loading ? (
        <div className="bg-white rounded-2xl shadow-card flex items-center justify-center py-16">
          <div className="w-7 h-7 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#C8A35F', borderTopColor: 'transparent' }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-card py-16 text-center">
          <Calendar size={36} className="mx-auto text-gray-200 mb-2" />
          <p className="text-sm text-gray-400">Nenhum evento encontrado</p>
          <button onClick={() => setShowModal(true)}
            className="mt-4 text-xs font-semibold underline" style={{ color: '#C8A35F' }}>
            Criar primeiro evento
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedMonths.map(ym => (
            <div key={ym}>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">{formatMonthLabel(ym)}</p>
              <div className="bg-white rounded-2xl shadow-card overflow-hidden divide-y divide-gray-50">
                {grouped[ym].map(ev => {
                  const style = tipoStyle(ev.type)
                  return (
                    <div key={ev.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/60 transition-colors">
                      {/* Date bubble */}
                      <div className="w-12 h-12 rounded-2xl flex flex-col items-center justify-center flex-shrink-0"
                        style={{ background: style.bg }}>
                        <p className="text-[10px] font-semibold uppercase leading-none" style={{ color: style.color }}>
                          {meses[Number(ev.date?.substring(5, 7)) - 1]}
                        </p>
                        <p className="text-base font-bold leading-tight" style={{ color: style.color }}>
                          {ev.date?.substring(8, 10)}
                        </p>
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{ev.title}</p>
                        <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                          <span className="text-xs text-gray-400">{ev.time}</span>
                          {ev.disciplina && (
                            <span className="flex items-center gap-1 text-xs text-gray-400">
                              <BookOpen size={10} /> {ev.disciplina.name}
                            </span>
                          )}
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                            style={{ background: style.bg, color: style.color }}>
                            {style.label}
                          </span>
                        </div>
                      </div>

                      <button onClick={() => setDeleteTarget(ev)}
                        title="Remover evento"
                        className="p-2 rounded-xl text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all flex-shrink-0">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
