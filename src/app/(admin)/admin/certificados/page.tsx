'use client'

import { useEffect, useState } from 'react'
import {
  Award, Plus, Trash2, X, Loader2, CheckCircle,
  Search, GraduationCap, Calendar, Hash, BookOpen,
  Star, Users, Zap,
} from 'lucide-react'
import { api } from '@/lib/api'

const tipoConfig = {
  conclusao:    { label: 'Conclusão de Curso',  color: '#C8A35F', bg: 'rgba(200,163,95,0.1)',  icon: GraduationCap },
  participacao: { label: 'Participação',         color: '#3B82F6', bg: 'rgba(59,130,246,0.1)',  icon: Users },
  extensao:     { label: 'Extensão',             color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)',  icon: BookOpen },
  honra:        { label: 'Honra ao Mérito',      color: '#EF4444', bg: 'rgba(239,68,68,0.1)',   icon: Star },
}

const emptyForm = {
  alunoId: '', tipo: 'conclusao', titulo: '', descricao: '', cargaHoraria: '', issueDate: new Date().toISOString().slice(0, 10),
}

function fmtDate(d: string) {
  if (!d) return '—'
  const [y, m, day] = d.split('-')
  return `${day}/${m}/${y}`
}

export default function AdminCertificados() {
  const [certificados, setCertificados] = useState<any[]>([])
  const [alunos, setAlunos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [search, setSearch] = useState('')

  async function fetchCertificados() {
    try {
      const data = await api.admin.certificados()
      setCertificados(data)
    } catch { setCertificados([]) }
    finally { setLoading(false) }
  }

  useEffect(() => {
    fetchCertificados()
    api.admin.alunos().then(setAlunos).catch(() => {})
  }, [])

  function toast(text: string, ok: boolean) {
    setMsg({ text, ok })
    setTimeout(() => setMsg(null), 4000)
  }

  function validate() {
    const e: Record<string, string> = {}
    if (!form.alunoId) e.alunoId = 'Selecione um aluno'
    if (!form.titulo.trim()) e.titulo = 'Título é obrigatório'
    if (!form.issueDate) e.issueDate = 'Data de emissão é obrigatória'
    return e
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setSaving(true)
    try {
      await api.admin.emitirCertificado({
        alunoId: form.alunoId,
        tipo: form.tipo,
        titulo: form.titulo,
        descricao: form.descricao || undefined,
        cargaHoraria: form.cargaHoraria ? parseInt(form.cargaHoraria) : undefined,
        issueDate: form.issueDate,
      })
      toast('Certificado emitido com sucesso!', true)
      setShowModal(false)
      setForm(emptyForm)
      await fetchCertificados()
    } catch {
      toast('Erro ao emitir certificado.', false)
    }
    setSaving(false)
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await api.admin.deletarCertificado(deleteTarget.id)
      toast('Certificado removido.', true)
      setDeleteTarget(null)
      await fetchCertificados()
    } catch {
      toast('Erro ao remover.', false)
    }
    setDeleting(false)
  }

  const filtered = certificados.filter(c =>
    !search ||
    c.alunoName?.toLowerCase().includes(search.toLowerCase()) ||
    c.alunoRa?.toLowerCase().includes(search.toLowerCase()) ||
    c.titulo?.toLowerCase().includes(search.toLowerCase()) ||
    c.codigoVerif?.toLowerCase().includes(search.toLowerCase())
  )

  const byTipo = (tipo: string) => certificados.filter(c => c.tipo === tipo).length

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fade-in">

      {/* Toast */}
      {msg && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-lg text-sm font-medium text-white flex items-center gap-2 ${msg.ok ? 'bg-green-600' : 'bg-red-500'}`}>
          {msg.ok && <CheckCircle size={15} />} {msg.text}
        </div>
      )}

      {/* Header */}
      <div className="rounded-2xl p-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #071B34 0%, #0d2d50 100%)' }}>
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #C8A35F 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div className="relative z-10 flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-white/50 text-sm">Alma College · Administrativo</p>
            <h2 className="text-2xl font-bold text-white mt-0.5">Certificados</h2>
            <p className="text-white/40 text-sm mt-1">Emita e gerencie certificados dos alunos</p>
          </div>
          <button
            onClick={() => { setShowModal(true); setForm(emptyForm); setErrors({}) }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90 shadow-md"
            style={{ background: '#C8A35F', color: '#071B34' }}>
            <Plus size={16} /> Emitir Certificado
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(tipoConfig).map(([key, cfg]) => {
          const Icon = cfg.icon
          return (
            <div key={key} className="bg-white rounded-2xl shadow-card p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{cfg.label}</p>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: cfg.bg, color: cfg.color }}>
                  <Icon size={17} />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900">{byTipo(key)}</p>
            </div>
          )
        })}
      </div>

      {/* Search + list */}
      <div className="bg-white rounded-2xl shadow-card p-6">
        <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
          <h3 className="font-bold text-gray-900">Todos os Certificados <span className="text-gray-400 font-normal text-sm">({filtered.length})</span></h3>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar aluno, código..."
              className="pl-8 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 w-56 focus:outline-none"
              onFocus={e => { e.currentTarget.style.borderColor = '#C8A35F'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(200,163,95,0.12)' }}
              onBlur={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.boxShadow = '' }} />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-7 h-7 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#C8A35F', borderTopColor: 'transparent' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Award size={44} className="mx-auto mb-3 text-gray-200" />
            <p className="text-sm font-medium text-gray-400">
              {search ? 'Nenhum certificado encontrado' : 'Nenhum certificado emitido ainda'}
            </p>
            {!search && <p className="text-xs text-gray-300 mt-1">Clique em "Emitir Certificado" para começar</p>}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(c => {
              const cfg = tipoConfig[c.tipo as keyof typeof tipoConfig] ?? tipoConfig.participacao
              const Icon = cfg.icon
              return (
                <div key={c.id} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50/50 transition-all group">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: cfg.bg, color: cfg.color }}>
                    <Icon size={19} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="font-bold text-sm text-gray-900">{c.titulo}</span>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: cfg.bg, color: cfg.color }}>
                        {cfg.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
                      <span className="flex items-center gap-1"><GraduationCap size={11} /> {c.alunoName}</span>
                      <span className="flex items-center gap-1"><Hash size={11} /> {c.alunoRa}</span>
                      <span className="flex items-center gap-1"><Calendar size={11} /> {fmtDate(c.issueDate)}</span>
                      {c.cargaHoraria && <span className="flex items-center gap-1"><Zap size={11} /> {c.cargaHoraria}h</span>}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 hidden sm:block">
                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mb-0.5">Código</p>
                    <p className="text-xs font-bold font-mono" style={{ color: '#071B34' }}>{c.codigoVerif}</p>
                  </div>
                  <button onClick={() => setDeleteTarget(c)}
                    className="p-2 rounded-xl text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all flex-shrink-0 opacity-0 group-hover:opacity-100">
                    <Trash2 size={15} />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal: Emitir */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 my-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(200,163,95,0.12)', color: '#C8A35F' }}>
                  <Award size={16} />
                </div>
                <h3 className="font-bold text-gray-900 text-lg">Emitir Certificado</h3>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Aluno */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Aluno *</label>
                <select value={form.alunoId} onChange={e => setForm({ ...form, alunoId: e.target.value })}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none"
                  onFocus={ev => { ev.currentTarget.style.borderColor = '#C8A35F'; ev.currentTarget.style.boxShadow = '0 0 0 3px rgba(200,163,95,0.12)' }}
                  onBlur={ev => { ev.currentTarget.style.borderColor = ''; ev.currentTarget.style.boxShadow = '' }}>
                  <option value="">— Selecione o aluno —</option>
                  {alunos.map(a => (
                    <option key={a.id} value={a.id}>{a.name} (RA: {a.ra})</option>
                  ))}
                </select>
                {errors.alunoId && <p className="text-xs text-red-500 mt-1">{errors.alunoId}</p>}
              </div>

              {/* Tipo */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Tipo</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(tipoConfig).map(([key, cfg]) => {
                    const Icon = cfg.icon
                    const active = form.tipo === key
                    return (
                      <button key={key} type="button"
                        onClick={() => setForm({ ...form, tipo: key })}
                        className="flex items-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all"
                        style={{
                          borderColor: active ? cfg.color : '#E5E7EB',
                          background: active ? cfg.bg : 'white',
                          color: active ? cfg.color : '#9CA3AF',
                        }}>
                        <Icon size={13} /> {cfg.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Título */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Título do Certificado *</label>
                <input value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })}
                  placeholder="Ex: Bacharelado em Teologia — Turma 2026"
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none"
                  onFocus={ev => { ev.currentTarget.style.borderColor = '#C8A35F'; ev.currentTarget.style.boxShadow = '0 0 0 3px rgba(200,163,95,0.12)' }}
                  onBlur={ev => { ev.currentTarget.style.borderColor = ''; ev.currentTarget.style.boxShadow = '' }} />
                {errors.titulo && <p className="text-xs text-red-500 mt-1">{errors.titulo}</p>}
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Descrição <span className="text-gray-300 normal-case font-normal">(opcional)</span></label>
                <textarea value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })}
                  placeholder="Ex: Concluiu com aproveitamento de 95% todas as disciplinas do curso..."
                  rows={3}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none resize-none"
                  onFocus={ev => { ev.currentTarget.style.borderColor = '#C8A35F'; ev.currentTarget.style.boxShadow = '0 0 0 3px rgba(200,163,95,0.12)' }}
                  onBlur={ev => { ev.currentTarget.style.borderColor = ''; ev.currentTarget.style.boxShadow = '' }} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Carga horária */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Carga Horária <span className="text-gray-300 font-normal">(h)</span></label>
                  <input type="number" min="1" value={form.cargaHoraria} onChange={e => setForm({ ...form, cargaHoraria: e.target.value })}
                    placeholder="Ex: 2400"
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none"
                    onFocus={ev => { ev.currentTarget.style.borderColor = '#C8A35F'; ev.currentTarget.style.boxShadow = '0 0 0 3px rgba(200,163,95,0.12)' }}
                    onBlur={ev => { ev.currentTarget.style.borderColor = ''; ev.currentTarget.style.boxShadow = '' }} />
                </div>
                {/* Data */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Data de Emissão *</label>
                  <input type="date" value={form.issueDate} onChange={e => setForm({ ...form, issueDate: e.target.value })}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none"
                    onFocus={ev => { ev.currentTarget.style.borderColor = '#C8A35F'; ev.currentTarget.style.boxShadow = '0 0 0 3px rgba(200,163,95,0.12)' }}
                    onBlur={ev => { ev.currentTarget.style.borderColor = ''; ev.currentTarget.style.boxShadow = '' }} />
                  {errors.issueDate && <p className="text-xs text-red-500 mt-1">{errors.issueDate}</p>}
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all">
                  Cancelar
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-60"
                  style={{ background: '#C8A35F', color: '#071B34' }}>
                  {saving ? <Loader2 size={15} className="animate-spin" /> : <Award size={15} />}
                  Emitir
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
              <h3 className="font-bold text-gray-900">Revogar Certificado</h3>
              <button onClick={() => setDeleteTarget(null)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={16} /></button>
            </div>
            <p className="text-sm text-gray-600 mb-1">
              Revogar <span className="font-semibold text-gray-900">"{deleteTarget.titulo}"</span>
            </p>
            <p className="text-xs text-gray-400 mb-5">Aluno: {deleteTarget.alunoName} — Código: {deleteTarget.codigoVerif}</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-gray-100 text-gray-600">Cancelar</button>
              <button onClick={handleDelete} disabled={deleting}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm bg-red-500 text-white hover:bg-red-600 disabled:opacity-60">
                {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />} Revogar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
