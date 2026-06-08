'use client'

import { useState, useEffect } from 'react'
import { Bell, Lock, Shield, Monitor, Globe, Mail, MessageSquare, Eye, EyeOff, Save, CheckCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { api } from '@/lib/api'

const STORAGE_KEY = 'btcp_config'

const defaultNotifs = { email: true, push: true, financial: true, grades: true, events: false, news: false }
const defaultPrefs = { language: 'pt-BR', theme: 'light', fontSize: 'medium', twoFactor: false }

export default function ConfiguracoesPage() {
  const [saved, setSaved] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [notifs, setNotifs] = useState(defaultNotifs)
  const [prefs, setPrefs] = useState(defaultPrefs)
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' })
  const [pwLoading, setPwLoading] = useState(false)
  const [pwMsg, setPwMsg] = useState<{ text: string; ok: boolean } | null>(null)

  function applyTheme(theme: string) {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      root.classList.toggle('dark', prefersDark)
    } else {
      root.classList.remove('dark')
    }
  }

  // Restore from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const data = JSON.parse(raw)
        if (data.notifs) setNotifs(n => ({ ...n, ...data.notifs }))
        if (data.prefs) {
          setPrefs(p => ({ ...p, ...data.prefs }))
          applyTheme(data.prefs.theme ?? 'light')
        }
      }
    } catch {}
  }, [])

  function handleSave() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ notifs, prefs }))
      applyTheme(prefs.theme)
    } catch {}
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    setPwMsg(null)
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      setPwMsg({ text: 'Preencha todos os campos de senha.', ok: false }); return
    }
    if (passwords.new.length < 6) {
      setPwMsg({ text: 'A nova senha deve ter pelo menos 6 caracteres.', ok: false }); return
    }
    if (passwords.new !== passwords.confirm) {
      setPwMsg({ text: 'As senhas não coincidem.', ok: false }); return
    }
    setPwLoading(true)
    try {
      await api.auth.changePassword(passwords.current, passwords.new)
      setPwMsg({ text: 'Senha alterada com sucesso!', ok: true })
      setPasswords({ current: '', new: '', confirm: '' })
    } catch (err: any) {
      const body = (() => { try { return JSON.parse(err?.message ?? '{}') } catch { return {} } })()
      setPwMsg({ text: body.error ?? 'Erro ao alterar senha.', ok: false })
    }
    setPwLoading(false)
    setTimeout(() => setPwMsg(null), 5000)
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-fade-in">
      {/* Notifications */}
      <Section icon={<Bell size={18} />} title="Notificações" subtitle="Gerencie como você recebe alertas do sistema">
        <div className="space-y-1">
          {[
            { key: 'email', label: 'E-mail', sub: 'Receber notificações por e-mail', icon: <Mail size={15} /> },
            { key: 'push', label: 'Notificações Push', sub: 'Alertas no navegador em tempo real', icon: <Bell size={15} /> },
            { key: 'financial', label: 'Avisos Financeiros', sub: 'Vencimentos, boletos e comprovantes', icon: <Monitor size={15} /> },
            { key: 'grades', label: 'Lançamento de Notas', sub: 'Quando o professor lançar notas', icon: <CheckCircle size={15} /> },
            { key: 'events', label: 'Eventos e Atividades', sub: 'Cultos, seminários e eventos especiais', icon: <Globe size={15} /> },
            { key: 'news', label: 'Novidades do Portal', sub: 'Atualizações e novos recursos', icon: <MessageSquare size={15} /> },
          ].map(item => (
            <ToggleRow
              key={item.key}
              label={item.label}
              sub={item.sub}
              icon={item.icon}
              checked={notifs[item.key as keyof typeof notifs]}
              onChange={v => setNotifs({ ...notifs, [item.key]: v })}
            />
          ))}
        </div>
      </Section>

      {/* Preferences */}
      <Section icon={<Monitor size={18} />} title="Preferências" subtitle="Personalize sua experiência no portal">
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <SelectField
              label="Idioma"
              value={prefs.language}
              options={[{ value: 'pt-BR', label: 'Português (Brasil)' }, { value: 'en', label: 'English' }]}
              onChange={v => setPrefs({ ...prefs, language: v })}
            />
            <SelectField
              label="Tema"
              value={prefs.theme}
              options={[{ value: 'light', label: 'Claro' }, { value: 'dark', label: 'Escuro' }, { value: 'system', label: 'Sistema' }]}
              onChange={v => setPrefs({ ...prefs, theme: v })}
            />
            <SelectField
              label="Tamanho da Fonte"
              value={prefs.fontSize}
              options={[{ value: 'small', label: 'Pequeno' }, { value: 'medium', label: 'Médio' }, { value: 'large', label: 'Grande' }]}
              onChange={v => setPrefs({ ...prefs, fontSize: v })}
            />
          </div>
        </div>
      </Section>

      {/* Security */}
      <Section icon={<Shield size={18} />} title="Segurança" subtitle="Mantenha sua conta protegida">
        <div className="space-y-4">
          {/* 2FA */}
          <ToggleRow
            label="Autenticação de Dois Fatores (2FA)"
            sub="Adicione uma camada extra de segurança à sua conta"
            icon={<Shield size={15} />}
            checked={prefs.twoFactor}
            onChange={v => setPrefs({ ...prefs, twoFactor: v })}
          />

          {/* Change password */}
          <div className="pt-4 border-t border-gray-50">
            <p className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <Lock size={15} className="text-gray-400" />
              Alterar Senha
            </p>
            <form onSubmit={handleChangePassword} className="space-y-3">
              <PasswordField
                label="Senha Atual"
                value={passwords.current}
                show={showPass}
                onToggle={() => setShowPass(!showPass)}
                onChange={v => setPasswords({ ...passwords, current: v })}
              />
              <div className="grid sm:grid-cols-2 gap-3">
                <PasswordField
                  label="Nova Senha"
                  value={passwords.new}
                  show={showPass}
                  onToggle={() => setShowPass(!showPass)}
                  onChange={v => setPasswords({ ...passwords, new: v })}
                />
                <PasswordField
                  label="Confirmar Nova Senha"
                  value={passwords.confirm}
                  show={showPass}
                  onToggle={() => setShowPass(!showPass)}
                  onChange={v => setPasswords({ ...passwords, confirm: v })}
                />
              </div>
              {passwords.new && passwords.confirm && passwords.new !== passwords.confirm && (
                <p className="text-xs text-red-500">As senhas não coincidem.</p>
              )}
              {pwMsg && (
                <div className={`p-3 rounded-xl text-sm border ${pwMsg.ok ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-600'}`}>
                  {pwMsg.text}
                </div>
              )}
              <button
                type="submit"
                disabled={pwLoading}
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-60 mt-1"
                style={{ background: '#071B34', color: '#C8A35F' }}>
                {pwLoading ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />}
                Alterar Senha
              </button>
            </form>
          </div>
        </div>
      </Section>

      {/* Save */}
      <div className="flex items-center justify-between bg-white rounded-2xl shadow-card px-6 py-4">
        <p className="text-xs text-gray-400">
          {saved ? 'Configurações salvas com sucesso!' : 'Salve as alterações para que elas entrem em vigor.'}
        </p>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90 shadow-md"
          style={{ background: saved ? '#16a34a' : '#071B34', color: saved ? 'white' : '#C8A35F' }}
        >
          {saved ? <CheckCircle size={16} /> : <Save size={16} />}
          {saved ? 'Salvo!' : 'Salvar Configurações'}
        </button>
      </div>

      {/* Danger zone */}
      <div
        className="rounded-2xl p-5"
        style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.15)' }}
      >
        <p className="text-sm font-semibold text-red-600 mb-1">Zona de Perigo</p>
        <p className="text-xs text-gray-500 mb-4">Estas ações são irreversíveis. Prossiga com cuidado.</p>
        <div className="flex flex-wrap gap-2">
          <button className="px-4 py-2 rounded-xl text-xs font-semibold text-red-600 border border-red-200 hover:bg-red-50 transition-all">
            Solicitar Exclusão de Dados
          </button>
          <button className="px-4 py-2 rounded-xl text-xs font-semibold text-red-600 border border-red-200 hover:bg-red-50 transition-all">
            Revogar Todas as Sessões
          </button>
        </div>
      </div>
    </div>
  )
}

function Section({ icon, title, subtitle, children }: {
  icon: React.ReactNode; title: string; subtitle: string; children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-2xl shadow-card overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-50 flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: 'rgba(200,163,95,0.1)', color: '#b08030' }}>
          {icon}
        </div>
        <div>
          <p className="font-semibold text-gray-900">{title}</p>
          <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}

function ToggleRow({ label, sub, icon, checked, onChange }: {
  label: string; sub: string; icon: React.ReactNode; checked: boolean; onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-none">
      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-gray-400" style={{ background: 'rgba(0,0,0,0.04)' }}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-xs text-gray-400">{sub}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className="relative w-10 h-5.5 rounded-full transition-all duration-200 flex-shrink-0"
        style={{
          width: 40,
          height: 22,
          background: checked ? '#C8A35F' : '#e5e7eb',
        }}
      >
        <span
          className="absolute top-0.5 left-0.5 w-4.5 h-4.5 bg-white rounded-full shadow transition-transform duration-200"
          style={{
            width: 18,
            height: 18,
            transform: checked ? 'translateX(18px)' : 'translateX(0)',
          }}
        />
      </button>
    </div>
  )
}

function SelectField({ label, value, options, onChange }: {
  label: string; value: string; options: { value: string; label: string }[]; onChange: (v: string) => void
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none appearance-none transition-all"
        onFocus={e => { e.currentTarget.style.borderColor = '#C8A35F'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(200,163,95,0.12)' }}
        onBlur={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.boxShadow = '' }}
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}

function PasswordField({ label, value, show, onToggle, onChange }: {
  label: string; value: string; show: boolean; onToggle: () => void; onChange: (v: string) => void
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full pl-3 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none transition-all"
          onFocus={e => { e.currentTarget.style.borderColor = '#C8A35F'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(200,163,95,0.12)' }}
          onBlur={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.boxShadow = '' }}
        />
        <button type="button" onClick={onToggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
    </div>
  )
}
