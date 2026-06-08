'use client'

import { useEffect, useState } from 'react'
import { User, Mail, BookOpen, Edit3, Save, Loader2, CheckCircle, X } from 'lucide-react'
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

export default function ProfessorPerfil() {
  const { user } = useAuth()
  const [perfil, setPerfil] = useState<any>(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: '', title: '' })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null)

  useEffect(() => {
    api.professor.perfil().then(data => {
      setPerfil(data)
      setForm({ name: data.name ?? '', title: data.title ?? '' })
    }).catch(() => {})
  }, [])

  const initials = (perfil?.name ?? user?.professor?.name ?? '').split(' ').map((w: string) => w[0]).slice(0, 2).join('')

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const updated = await api.professor.updatePerfil({
        name: form.name || undefined,
        title: form.title || undefined,
      })
      setPerfil((prev: any) => ({ ...prev, ...updated }))
      setEditing(false)
      setMsg({ text: 'Perfil atualizado com sucesso!', ok: true })
    } catch {
      setMsg({ text: 'Erro ao salvar perfil.', ok: false })
    }
    setSaving(false)
    setTimeout(() => setMsg(null), 4000)
  }

  function handleCancel() {
    setEditing(false)
    setForm({ name: perfil?.name ?? '', title: perfil?.title ?? '' })
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto animate-fade-in">
      {/* Toast */}
      {msg && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-lg text-sm font-medium text-white flex items-center gap-2 ${msg.ok ? 'bg-green-600' : 'bg-red-500'}`}>
          {msg.ok && <CheckCircle size={15} />} {msg.text}
        </div>
      )}

      {/* Header card */}
      <div className="rounded-2xl p-8 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #071B34 0%, #0d2d50 100%)' }}>
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #C8A35F 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div className="relative z-10 flex items-center gap-6">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold shadow-xl border-4"
            style={{ background: 'linear-gradient(135deg, #C8A35F, #b08030)', color: '#071B34', borderColor: 'rgba(200,163,95,0.3)' }}>
            {initials || 'PR'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{perfil?.name ?? user?.professor?.name ?? '—'}</h2>
            <p className="text-white/60 mt-0.5 text-sm">{perfil?.title ?? user?.professor?.title ?? 'Docente'}</p>
            <span className="mt-2 inline-flex text-[11px] font-bold px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(200,163,95,0.15)', color: '#C8A35F' }}>
              Professor
            </span>
          </div>
        </div>
      </div>

      {/* Info / Edit form */}
      <div className="bg-white rounded-2xl shadow-card p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <User size={17} style={{ color: '#C8A35F' }} />
            Dados do Docente
          </h3>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
              style={{ background: 'rgba(200,163,95,0.1)', color: '#b08030' }}
            >
              <Edit3 size={13} />
              Editar
            </button>
          )}
        </div>

        {editing ? (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <EditField
                label="Nome Completo"
                value={form.name}
                onChange={v => setForm({ ...form, name: v })}
              />
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">E-mail</label>
                <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 border border-gray-100 rounded-xl">
                  <Mail size={14} className="text-gray-300 flex-shrink-0" />
                  <span className="text-sm text-gray-400">{perfil?.user?.email ?? '—'}</span>
                </div>
              </div>
              <EditField
                label="Titulação"
                value={form.title}
                onChange={v => setForm({ ...form, title: v })}
                placeholder="Ex: Mestre em Teologia"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-60"
                style={{ background: '#C8A35F', color: '#071B34' }}
              >
                {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                {saving ? 'Salvando…' : 'Salvar Alterações'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
              >
                <X size={15} />
                Cancelar
              </button>
            </div>
          </form>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { label: 'Nome Completo', value: perfil?.name ?? '—', icon: <User size={14} /> },
              { label: 'E-mail', value: perfil?.user?.email ?? '—', icon: <Mail size={14} /> },
              { label: 'Titulação', value: perfil?.title ?? '—', icon: <BookOpen size={14} /> },
            ].map(({ label, value, icon }) => (
              <div key={label} className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
                <div className="flex items-center gap-2">
                  <span className="text-gray-300">{icon}</span>
                  <p className="text-sm font-semibold text-gray-800">{value}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function EditField({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none transition-all"
        onFocus={e => { e.currentTarget.style.borderColor = '#C8A35F'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(200,163,95,0.12)' }}
        onBlur={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.boxShadow = '' }}
      />
    </div>
  )
}
