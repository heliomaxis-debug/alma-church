'use client'

import { useEffect, useRef, useState } from 'react'
import { User, Mail, Phone, MapPin, Calendar, BookOpen, Save, CheckCircle, Loader2, Camera } from 'lucide-react'
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

export default function PerfilPage() {
  const { user, refreshUser } = useAuth()
  const [editing, setEditing] = useState(false)
  const [perfil, setPerfil] = useState<any>(null)
  const [form, setForm] = useState({ name: '', phone: '', address: '' })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [pendingPhoto, setPendingPhoto] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    api.aluno.perfil().then(data => {
      setPerfil(data)
      setForm({ name: data.name ?? '', phone: data.phone ?? '', address: data.address ?? '' })
    }).catch(() => {})
  }, [])

  const initials = (perfil?.name ?? user?.aluno?.name ?? '').split(' ').map((w: string) => w[0]).slice(0, 2).join('')
  const emailInstitucional = `${(perfil?.name ?? '').toLowerCase().replace(/ /g, '.').replace(/[^a-z.]/g, '')}@btcp.edu.br`
  const displayPhoto = photoPreview ?? perfil?.photo ?? null

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const base64 = reader.result as string
      setPhotoPreview(base64)
      setPendingPhoto(base64)
    }
    reader.readAsDataURL(file)
    // reset so same file can be re-selected
    e.target.value = ''
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const updated = await api.aluno.updatePerfil({
        name: form.name || undefined,
        phone: form.phone || undefined,
        address: form.address || undefined,
        ...(pendingPhoto ? { photo: pendingPhoto } : {}),
      })
      setPerfil((prev: any) => ({ ...prev, ...updated }))
      setPendingPhoto(null)
      setPhotoPreview(null)
      setEditing(false)
      setMsg({ text: 'Perfil atualizado com sucesso!', ok: true })
      refreshUser() // atualiza foto no topbar/sidebar
    } catch {
      setMsg({ text: 'Erro ao salvar perfil.', ok: false })
    }
    setSaving(false)
    setTimeout(() => setMsg(null), 4000)
  }

  function handleCancel() {
    setEditing(false)
    setPhotoPreview(null)
    setPendingPhoto(null)
    setForm({ name: perfil?.name ?? '', phone: perfil?.phone ?? '', address: perfil?.address ?? '' })
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-fade-in">
      {/* Toast */}
      {msg && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-lg text-sm font-medium text-white flex items-center gap-2 ${msg.ok ? 'bg-green-600' : 'bg-red-500'}`}>
          {msg.ok && <CheckCircle size={15} />} {msg.text}
        </div>
      )}

      {/* Hidden file input — camera + gallery */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handlePhotoChange}
      />

      {/* Profile header */}
      <div
        className="rounded-2xl p-8 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #071B34 0%, #0d2d50 100%)' }}
      >
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, #C8A35F 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />
        <div className="relative z-10 flex items-center gap-6">
          <div className="relative">
            {displayPhoto ? (
              <img
                src={displayPhoto}
                alt={perfil?.name ?? 'Foto'}
                className="w-24 h-24 rounded-2xl object-cover shadow-xl border-4"
                style={{ borderColor: 'rgba(200,163,95,0.3)' }}
              />
            ) : (
              <div
                className="w-24 h-24 rounded-2xl flex items-center justify-center text-3xl font-bold shadow-xl border-4"
                style={{ background: 'linear-gradient(135deg, #C8A35F, #b08030)', color: '#071B34', borderColor: 'rgba(200,163,95,0.3)' }}
              >
                {initials}
              </div>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Alterar foto"
              className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl flex items-center justify-center shadow transition-opacity hover:opacity-80"
              style={{ background: '#071B34', color: '#C8A35F', border: '2px solid rgba(200,163,95,0.3)' }}
            >
              <Camera size={13} />
            </button>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">{perfil?.name ?? '—'}</h2>
            <p className="text-white/60 mt-1">{perfil?.curso ?? user?.aluno?.curso ?? '—'}</p>
            {pendingPhoto && (
              <p className="text-[11px] mt-1.5" style={{ color: '#C8A35F' }}>
                📷 Nova foto selecionada — salve para aplicar
              </p>
            )}
            <div className="flex items-center gap-3 mt-3">
              <span
                className="flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(34,197,94,0.2)', color: '#4ade80' }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                {perfil?.status ?? 'ATIVO'}
              </span>
              <span
                className="text-[11px] font-medium px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(200,163,95,0.15)', color: '#C8A35F' }}
              >
                RA: {perfil?.ra ?? user?.aluno?.ra ?? '—'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Academic info */}
      <div className="bg-white rounded-2xl shadow-card p-6">
        <h3 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
          <BookOpen size={17} style={{ color: '#C8A35F' }} />
          Informações Acadêmicas
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { label: 'Número de Matrícula', value: perfil?.ra ?? '—' },
            { label: 'Curso', value: perfil?.curso ?? '—' },
            { label: 'Manual', value: perfil ? `Manual ${perfil.semestre}` : '—' },
            { label: 'Situação', value: perfil?.status ?? '—' },
            { label: 'Data de Matrícula', value: perfil?.enrollmentDate ? new Date(perfil.enrollmentDate).toLocaleDateString('pt-BR') : '—' },
            { label: 'E-mail Institucional', value: emailInstitucional || '—' },
          ].map(({ label, value }) => (
            <div key={label} className="p-4 rounded-xl bg-gray-50 border border-gray-100">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
              <p className="text-sm font-semibold text-gray-800">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Personal info */}
      <div className="bg-white rounded-2xl shadow-card p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <User size={17} style={{ color: '#C8A35F' }} />
            Dados Pessoais
          </h3>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
              style={{ background: 'rgba(200,163,95,0.1)', color: '#b08030' }}
            >
              <Camera size={13} />
              Editar
            </button>
          )}
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Nome Completo" value={form.name} icon={<User size={14} />} editing={editing} onChange={v => setForm({ ...form, name: v })} />
            <Field label="E-mail Institucional" value={emailInstitucional} icon={<Mail size={14} />} editing={false} onChange={() => {}} />
            <Field label="Telefone" value={form.phone} icon={<Phone size={14} />} editing={editing} onChange={v => setForm({ ...form, phone: v })} />
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">CPF</label>
              <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 border border-gray-100 rounded-xl">
                <span className="text-gray-300 flex-shrink-0"><Calendar size={14} /></span>
                <span className="text-sm text-gray-400">{perfil?.cpf ?? '***.***.***-**'}</span>
              </div>
            </div>
          </div>
          <Field label="Endereço" value={form.address} icon={<MapPin size={14} />} editing={editing} onChange={v => setForm({ ...form, address: v })} full />

          {/* Photo helper when editing */}
          {editing && (
            <div
              className="flex items-center gap-3 p-4 rounded-xl"
              style={{ background: 'rgba(200,163,95,0.06)', border: '1px solid rgba(200,163,95,0.15)' }}
            >
              <Camera size={16} style={{ color: '#b08030', flexShrink: 0 }} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700">Foto de perfil</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {pendingPhoto ? 'Nova foto selecionada — será salva junto com os dados.' : 'Clique na câmera (ícone dourado) para tirar ou escolher uma foto.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex-shrink-0"
                style={{ background: '#071B34', color: '#C8A35F' }}
              >
                <Camera size={12} />
                {pendingPhoto ? 'Trocar' : 'Selecionar'}
              </button>
            </div>
          )}

          {editing && (
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
                className="px-5 py-2.5 rounded-xl font-semibold text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
              >
                Cancelar
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

function Field({ label, value, icon, editing, onChange, full }: {
  label: string; value: string; icon: React.ReactNode
  editing: boolean; onChange: (v: string) => void; full?: boolean
}) {
  return (
    <div className={full ? 'sm:col-span-2' : ''}>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>
      {editing ? (
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none transition-all"
          onFocus={e => { e.currentTarget.style.borderColor = '#C8A35F'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(200,163,95,0.12)' }}
          onBlur={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.boxShadow = '' }}
        />
      ) : (
        <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 border border-gray-100 rounded-xl">
          <span className="text-gray-300 flex-shrink-0">{icon}</span>
          <span className="text-sm text-gray-700">{value || '—'}</span>
        </div>
      )}
    </div>
  )
}
