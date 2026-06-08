'use client'

import { useEffect, useState } from 'react'
import { GraduationCap, Mail, Search, BookOpen, Plus, X, Loader2, CheckCircle } from 'lucide-react'
import { api } from '@/lib/api'

const emptyForm = { name: '', email: '', password: '', title: '' }

export default function AdminProfessores() {
  const [professores, setProfessores] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  async function fetchProfs() {
    api.admin.professores().then(setProfessores).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { fetchProfs() }, [])

  const filtered = professores.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.title ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (p.user?.email ?? '').toLowerCase().includes(search.toLowerCase())
  )

  function validate() {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Nome é obrigatório'
    if (!form.email.trim()) e.email = 'E-mail é obrigatório'
    if (!form.password || form.password.length < 6) e.password = 'Senha: mínimo 6 caracteres'
    return e
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setSaving(true)
    try {
      await api.admin.criarProfessor(form)
      setMsg({ text: 'Professor cadastrado com sucesso!', ok: true })
      setShowModal(false)
      setForm(emptyForm)
      await fetchProfs()
    } catch (err: any) {
      const body = (() => { try { return JSON.parse(err?.message ?? '{}') } catch { return {} } })()
      setMsg({ text: body.error ?? 'Erro ao cadastrar professor.', ok: false })
    }
    setSaving(false)
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

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Professores</h2>
          <p className="text-sm text-gray-400 mt-0.5">{professores.length} docente{professores.length !== 1 ? 's' : ''} cadastrado{professores.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => { setShowModal(true); setErrors({}) }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm shadow-md transition-all hover:opacity-90"
          style={{ background: '#071B34', color: '#C8A35F' }}>
          <Plus size={16} /> Novo Professor
        </button>
      </div>

      {/* Modal: Novo Professor */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-900 text-lg">Cadastrar Professor</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {([
                { label: 'Nome Completo *', key: 'name', placeholder: 'Dr. João Silva' },
                { label: 'E-mail *', key: 'email', type: 'email', placeholder: 'joao@btcp.edu.br' },
                { label: 'Senha Inicial *', key: 'password', type: 'password', placeholder: 'Mínimo 6 caracteres' },
                { label: 'Titulação', key: 'title', placeholder: 'Ex: Doutor em Teologia' },
              ] as Array<{ label: string; key: keyof typeof form; type?: string; placeholder: string }>).map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>
                  <input
                    type={type ?? 'text'}
                    value={form[key]}
                    onChange={e => setForm({ ...form, [key]: e.target.value })}
                    placeholder={placeholder}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none transition-all"
                    onFocus={ev => { ev.currentTarget.style.borderColor = '#C8A35F'; ev.currentTarget.style.boxShadow = '0 0 0 3px rgba(200,163,95,0.12)' }}
                    onBlur={ev => { ev.currentTarget.style.borderColor = ''; ev.currentTarget.style.boxShadow = '' }}
                  />
                  {errors[key] && <p className="text-xs text-red-500 mt-1">{errors[key]}</p>}
                </div>
              ))}

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

      {/* Search */}
      <div className="bg-white rounded-2xl shadow-card p-4">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nome, titulação ou e-mail..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none transition-all"
            onFocus={e => { e.currentTarget.style.borderColor = '#C8A35F'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(200,163,95,0.12)' }}
            onBlur={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.boxShadow = '' }} />
        </div>
      </div>

      {/* List */}
      <div className="grid gap-4">
        {loading ? (
          <div className="bg-white rounded-2xl shadow-card flex items-center justify-center py-16">
            <div className="w-7 h-7 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#C8A35F', borderTopColor: 'transparent' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-card py-16 text-center">
            <GraduationCap size={36} className="mx-auto text-gray-200 mb-2" />
            <p className="text-sm text-gray-400">Nenhum professor encontrado</p>
          </div>
        ) : (
          filtered.map((p) => {
            const initials = p.name.split(' ').map((w: string) => w[0]).slice(0, 2).join('')
            return (
              <div key={p.id} className="bg-white rounded-2xl shadow-card p-5 flex items-center gap-4 hover:shadow-card-hover transition-all">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 text-base font-bold"
                  style={{ background: 'rgba(200,163,95,0.12)', color: '#b08030' }}>
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">{p.name}</p>
                  {p.title && <p className="text-sm text-gray-500 mt-0.5">{p.title}</p>}
                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <Mail size={11} /> {p.user?.email ?? '—'}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <BookOpen size={11} /> {p.disciplinas?.length ?? 0} disciplina{(p.disciplinas?.length ?? 0) !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full flex-shrink-0"
                  style={{ background: 'rgba(79,70,229,0.1)', color: '#4f46e5' }}>
                  Docente
                </span>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
