'use client'

import { useEffect, useState } from 'react'
import { FolderOpen, Plus, Trash2, FileText, Video, Music, X, Loader2 } from 'lucide-react'
import { api } from '@/lib/api'

const typeIcon: Record<string, React.ReactNode> = {
  pdf: <FileText size={16} />,
  video: <Video size={16} />,
  audio: <Music size={16} />,
}

const typeColor: Record<string, { bg: string; color: string }> = {
  pdf: { bg: 'rgba(239,68,68,0.1)', color: '#ef4444' },
  video: { bg: 'rgba(79,70,229,0.1)', color: '#4f46e5' },
  audio: { bg: 'rgba(22,163,74,0.1)', color: '#16a34a' },
}

export default function ProfessorMateriais() {
  const [turmas, setTurmas] = useState<any[]>([])
  const [disciplinaId, setDisciplinaId] = useState('')
  const [materiais, setMateriais] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [form, setForm] = useState({ title: '', type: 'pdf', size: '', duration: '' })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null)

  useEffect(() => {
    api.professor.turmas().then(ts => {
      setTurmas(ts)
      if (ts.length > 0) setDisciplinaId(ts[0].id)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (!disciplinaId) return
    api.professor.turma(disciplinaId).then(t => {
      setMateriais(t.materiais ?? [])
    }).catch(() => {})
  }, [disciplinaId])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title || !disciplinaId) return
    setSaving(true)
    try {
      await api.professor.addMaterial({ disciplinaId, ...form })
      setMsg({ text: 'Material adicionado!', ok: true })
      setShowForm(false)
      setForm({ title: '', type: 'pdf', size: '', duration: '' })
      const updated = await api.professor.turma(disciplinaId)
      setMateriais(updated.materiais ?? [])
    } catch {
      setMsg({ text: 'Erro ao adicionar material.', ok: false })
    }
    setSaving(false)
    setTimeout(() => setMsg(null), 3000)
  }

  async function handleDelete(id: string) {
    setDeleting(id)
    try {
      await api.professor.deleteMaterial(id)
      setMateriais(m => m.filter(x => x.id !== id))
      setMsg({ text: 'Material removido.', ok: true })
    } catch {
      setMsg({ text: 'Erro ao remover.', ok: false })
    }
    setDeleting(null)
    setTimeout(() => setMsg(null), 3000)
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Materiais Didáticos</h2>
          <p className="text-sm text-gray-400 mt-0.5">Gerencie apostilas, vídeos e áudios</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm shadow-md transition-all hover:opacity-90"
          style={{ background: '#071B34', color: '#C8A35F' }}>
          <Plus size={16} /> Adicionar Material
        </button>
      </div>

      {/* Toast */}
      {msg && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-lg text-sm font-medium text-white flex items-center gap-2 ${msg.ok ? 'bg-green-600' : 'bg-red-500'}`}>
          {msg.text}
        </div>
      )}

      {/* Add form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-gray-900">Novo Material</h3>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Disciplina</label>
                <select value={disciplinaId} onChange={e => setDisciplinaId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none">
                  {turmas.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Título *</label>
                <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="Ex: Apostila Unidade 1" required
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none"
                  onFocus={e => { e.currentTarget.style.borderColor = '#C8A35F'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(200,163,95,0.12)' }}
                  onBlur={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.boxShadow = '' }} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Tipo</label>
                <div className="flex gap-2">
                  {(['pdf', 'video', 'audio'] as const).map(t => (
                    <button key={t} type="button" onClick={() => setForm({ ...form, type: t })}
                      className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all capitalize"
                      style={form.type === t
                        ? { background: '#071B34', color: '#C8A35F' }
                        : { background: '#f1f5f9', color: '#64748b' }}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Tamanho</label>
                  <input type="text" value={form.size} onChange={e => setForm({ ...form, size: e.target.value })}
                    placeholder="Ex: 2.4 MB"
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Duração</label>
                  <input type="text" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })}
                    placeholder="Ex: 45 min"
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none" />
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all">
                  Cancelar
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-60"
                  style={{ background: '#C8A35F', color: '#071B34' }}>
                  {saving ? <Loader2 size={15} className="animate-spin" /> : null}
                  Adicionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Disciplina selector */}
      <div className="bg-white rounded-2xl shadow-card p-4">
        <div className="flex gap-3 flex-wrap">
          {turmas.map(t => (
            <button key={t.id} onClick={() => setDisciplinaId(t.id)}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={disciplinaId === t.id
                ? { background: '#071B34', color: '#C8A35F' }
                : { background: '#f1f5f9', color: '#64748b' }}>
              {t.name}
            </button>
          ))}
        </div>
      </div>

      {/* Materials list */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50">
          <h3 className="font-semibold text-gray-900">
            {turmas.find(t => t.id === disciplinaId)?.name ?? 'Disciplina'} — {materiais.length} material{materiais.length !== 1 ? 'is' : ''}
          </h3>
        </div>
        <div className="divide-y divide-gray-50">
          {materiais.length === 0 ? (
            <div className="py-12 text-center">
              <FolderOpen size={36} className="mx-auto text-gray-200 mb-2" />
              <p className="text-sm text-gray-400">Nenhum material cadastrado para esta disciplina</p>
            </div>
          ) : (
            materiais.map((m: any) => {
              const tc = typeColor[m.type] ?? typeColor.pdf
              return (
                <div key={m.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/60 transition-colors">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: tc.bg, color: tc.color }}>
                    {typeIcon[m.type] ?? typeIcon.pdf}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{m.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {m.type.toUpperCase()}{m.size ? ` · ${m.size}` : ''}{m.duration ? ` · ${m.duration}` : ''}
                      {' · '}{new Date(m.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <button onClick={() => handleDelete(m.id)} disabled={deleting === m.id}
                    className="p-2 rounded-xl hover:bg-red-50 text-gray-300 hover:text-red-400 transition-all flex-shrink-0 disabled:opacity-50">
                    {deleting === m.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                  </button>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
