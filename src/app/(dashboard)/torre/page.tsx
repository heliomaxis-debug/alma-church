'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Moon, Sunrise, Sun, Sunset, Send, Loader2, Flame, CheckCircle, BookOpen,
} from 'lucide-react'
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

const GOLD = '#C8A35F'
const DIAS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
const HORARIOS = [
  { hora: '03:00', label: 'Madrugada', icon: Moon },
  { hora: '05:30', label: 'Manhã', icon: Sunrise },
  { hora: '15:00', label: 'Tarde', icon: Sun },
  { hora: '22:00', label: 'Noite', icon: Sunset },
]

export default function TorrePortalPage() {
  const { user } = useAuth()
  const nomeUsuario = user?.aluno?.name ?? user?.professor?.name ?? ''
  const telUsuario = (user?.aluno as any)?.phone ?? ''

  const [inscricoes, setInscricoes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ nome: '', whatsapp: '', dia: '', horario: '' })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null)

  const fetchData = useCallback(async () => {
    const data = await api.public.torreOracao().catch(() => [])
    setInscricoes(data)
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])
  useEffect(() => {
    setForm(f => ({ ...f, nome: f.nome || nomeUsuario, whatsapp: f.whatsapp || telUsuario }))
  }, [nomeUsuario, telUsuario])

  const nomesEm = (dia: string, hora: string) =>
    inscricoes.filter(i => i.dia === dia && i.horario === hora).map(i => i.nome)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nome.trim() || !form.whatsapp.trim() || !form.dia || !form.horario) {
      setMsg({ text: 'Preencha nome, WhatsApp e escolha dia e horário.', ok: false }); return
    }
    setSaving(true)
    try {
      await api.public.inscreverOracao(form)
      setMsg({ text: `Inscrição confirmada! Você orará ${form.dia} às ${form.horario}.`, ok: true })
      setForm(f => ({ ...f, dia: '', horario: '' }))
      await fetchData()
    } catch (err: any) {
      const body = (() => { try { return JSON.parse(err?.message ?? '{}') } catch { return {} } })()
      setMsg({ text: body.error ?? 'Erro ao registrar.', ok: false })
    }
    setSaving(false)
    setTimeout(() => setMsg(null), 6000)
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="rounded-3xl p-6 sm:p-8 text-center relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #070C16, #071B34)' }}>
        <div className="absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #C8A35F 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div className="relative z-10">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(200,163,95,0.12)', border: '1px solid rgba(200,163,95,0.3)' }}>
            <Flame size={24} style={{ color: GOLD }} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mb-1">Torre de Oração</h1>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>7 dias · 4 horários · oração contínua</p>
          <p className="text-xs italic mt-3" style={{ color: GOLD }}>
            <BookOpen size={12} className="inline mr-1" />&ldquo;Porei-me na minha torre de vigia...&rdquo; — Habacuque 2:1
          </p>
        </div>
      </div>

      {/* Inscrição rápida */}
      <div className="bg-white rounded-2xl shadow-card p-6">
        <h3 className="font-bold text-gray-900 mb-4">Assumir um horário de oração</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Nome</label>
              <input type="text" value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">WhatsApp</label>
              <input type="tel" value={form.whatsapp} onChange={e => setForm({ ...form, whatsapp: e.target.value })}
                placeholder="(27) 99999-9999"
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Dia</label>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
              {DIAS.map(dia => (
                <button key={dia} type="button" onClick={() => setForm({ ...form, dia })}
                  className="py-2 rounded-xl text-xs font-semibold transition-all"
                  style={form.dia === dia ? { background: '#071B34', color: GOLD } : { background: '#f1f5f9', color: '#64748b' }}>
                  {dia.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Horário</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {HORARIOS.map(({ hora, icon: Icon }) => (
                <button key={hora} type="button" onClick={() => setForm({ ...form, horario: hora })}
                  className="py-2.5 rounded-xl text-xs font-semibold transition-all flex flex-col items-center gap-1"
                  style={form.horario === hora ? { background: '#071B34', color: GOLD } : { background: '#f1f5f9', color: '#64748b' }}>
                  <Icon size={15} /> {hora}
                </button>
              ))}
            </div>
          </div>
          {msg && (
            <div className="rounded-xl px-4 py-3 flex items-center gap-2 text-sm font-medium"
              style={msg.ok ? { background: 'rgba(22,163,74,0.1)', color: '#16a34a' } : { background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
              {msg.ok && <CheckCircle size={15} />} {msg.text}
            </div>
          )}
          <button type="submit" disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-60"
            style={{ background: '#071B34', color: GOLD }}>
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />} Confirmar compromisso
          </button>
        </form>
      </div>

      {/* Grade */}
      <div className="bg-white rounded-2xl shadow-card p-6">
        <h3 className="font-bold text-gray-900 mb-5">Quem está orando</h3>
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 size={26} className="animate-spin" style={{ color: GOLD }} /></div>
        ) : (
          <div className="space-y-5">
            {HORARIOS.map(({ hora, label, icon: Icon }) => (
              <div key={hora}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={15} style={{ color: GOLD }} />
                  <span className="font-bold text-sm text-gray-900">{hora}</span>
                  <span className="text-[11px] text-gray-400">· {label}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                  {DIAS.map(dia => {
                    const nomes = nomesEm(dia, hora)
                    return (
                      <div key={dia} className="rounded-xl p-2.5 min-h-[72px] border border-gray-100 bg-gray-50/50">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">{dia.slice(0, 3)}</p>
                        {nomes.length === 0 ? (
                          <p className="text-[10px] italic text-gray-300">Vago</p>
                        ) : nomes.map((n, i) => (
                          <p key={i} className="text-[11px] text-gray-700 truncate flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: GOLD }} />{n.split(' ')[0]}
                          </p>
                        ))}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
