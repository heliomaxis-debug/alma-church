'use client'

import Link from 'next/link'
import { useEffect, useState, useCallback } from 'react'
import {
  ArrowLeft, Moon, Sunrise, Sun, Sunset, Send, Loader2,
  Users, Heart, Flame, CheckCircle, BookOpen,
} from 'lucide-react'
import { api } from '@/lib/api'

const GOLD = '#C8A35F'

const DIAS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
const HORARIOS = [
  { hora: '03:00', label: 'Madrugada', icon: Moon },
  { hora: '05:30', label: 'Manhã', icon: Sunrise },
  { hora: '15:00', label: 'Tarde', icon: Sun },
  { hora: '22:00', label: 'Noite', icon: Sunset },
]

function AlmaLogo({ size = 48 }: { size?: number }) {
  return (
    <img src="/logo-alma-church.png" alt="Alma Church"
      style={{ height: size, width: 'auto', filter: 'invert(1) brightness(1.4)', objectFit: 'contain' }} />
  )
}

export default function TorreOracaoPage() {
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

  // nomes inscritos num (dia, horario)
  const nomesEm = (dia: string, hora: string) =>
    inscricoes.filter(i => i.dia === dia && i.horario === hora).map(i => i.nome)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nome.trim() || !form.whatsapp.trim() || !form.dia || !form.horario) {
      setMsg({ text: 'Preencha seu nome, WhatsApp e escolha um dia e horário.', ok: false })
      return
    }
    setSaving(true)
    try {
      await api.public.inscreverOracao(form)
      setMsg({ text: `Inscrição confirmada! Você orará ${form.dia} às ${form.horario}. Que Deus te abençoe!`, ok: true })
      setForm({ nome: '', whatsapp: '', dia: '', horario: '' })
      await fetchData()
    } catch (err: any) {
      const body = (() => { try { return JSON.parse(err?.message ?? '{}') } catch { return {} } })()
      setMsg({ text: body.error ?? 'Erro ao registrar inscrição.', ok: false })
    }
    setSaving(false)
    setTimeout(() => setMsg(null), 7000)
  }

  const total = inscricoes.length

  return (
    <div className="min-h-screen" style={{ background: '#070C16', color: '#fff' }}>
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-5 sm:px-6 h-16 flex items-center justify-between"
        style={{ background: 'rgba(7,12,22,0.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(200,163,95,0.15)' }}>
        <Link href="/" className="flex items-center"><AlmaLogo size={40} /></Link>
        <Link href="/" className="flex items-center gap-1.5 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
          <ArrowLeft size={14} /> Voltar ao site
        </Link>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-5 text-center overflow-hidden">
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #C8A35F 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(200,163,95,0.12), transparent 70%)' }} />

        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ background: 'rgba(200,163,95,0.12)', border: '1px solid rgba(200,163,95,0.3)' }}>
            <Flame size={28} style={{ color: GOLD }} />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] mb-4" style={{ color: GOLD }}>Alma Church</p>
          <h1 className="text-5xl sm:text-7xl font-black mb-2 leading-none">Torre de</h1>
          <h1 className="text-5xl sm:text-7xl font-black mb-5 leading-none"
            style={{ background: 'linear-gradient(135deg, #C8A35F, #E8C47A, #C8A35F)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Oração
          </h1>
          <p className="text-sm sm:text-base tracking-[0.2em] uppercase mb-8" style={{ color: 'rgba(255,255,255,0.6)' }}>
            7 Dias · 4 Horários · Oração Contínua
          </p>

          <div className="inline-block rounded-2xl px-6 py-4 mb-8 max-w-md"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(200,163,95,0.2)' }}>
            <BookOpen size={16} className="mx-auto mb-2" style={{ color: GOLD }} />
            <p className="text-sm italic" style={{ color: 'rgba(255,255,255,0.8)' }}>
              &ldquo;Porei-me na minha torre de vigia...&rdquo;
            </p>
            <p className="text-xs mt-1 font-semibold" style={{ color: GOLD }}>— Habacuque 2:1</p>
          </div>

          <div>
            <a href="#inscrever"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-sm transition-all hover:scale-105"
              style={{ background: `linear-gradient(135deg, ${GOLD}, #b08030)`, color: '#071B34' }}>
              <Flame size={16} /> Escolher meu horário de oração
            </a>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="px-5 sm:px-6 pb-16">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-4">
          {[['7', 'Dias por semana'], ['4', 'Horários diários'], [String(total), 'Intercessores']].map(([v, l]) => (
            <div key={l} className="rounded-2xl p-5 text-center"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(200,163,95,0.15)' }}>
              <p className="text-3xl sm:text-4xl font-black" style={{ color: GOLD }}>{v}</p>
              <p className="text-[11px] sm:text-xs mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>{l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Grade de horários */}
      <section className="px-5 sm:px-6 pb-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] mb-2" style={{ color: GOLD }}>A escala</p>
            <h2 className="text-3xl sm:text-4xl font-black">Quem está orando</h2>
            <p className="text-sm mt-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Veja os irmãos que assumiram cada horário ao longo da semana.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 size={28} className="animate-spin" style={{ color: GOLD }} />
            </div>
          ) : (
            <div className="space-y-6">
              {HORARIOS.map(({ hora, label, icon: Icon }) => (
                <div key={hora} className="rounded-3xl p-5 sm:p-6"
                  style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(200,163,95,0.15)' }}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(200,163,95,0.12)' }}>
                      <Icon size={18} style={{ color: GOLD }} />
                    </div>
                    <div>
                      <p className="font-black text-lg">{hora}</p>
                      <p className="text-[11px]" style={{ color: GOLD }}>{label}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                    {DIAS.map(dia => {
                      const nomes = nomesEm(dia, hora)
                      return (
                        <div key={dia} className="rounded-xl p-3 min-h-[90px]"
                          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                          <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: 'rgba(255,255,255,0.45)' }}>
                            {dia.slice(0, 3)}
                          </p>
                          {nomes.length === 0 ? (
                            <p className="text-[10px] italic" style={{ color: 'rgba(255,255,255,0.25)' }}>Vago</p>
                          ) : (
                            <div className="space-y-1">
                              {nomes.map((n, i) => (
                                <p key={i} className="text-[11px] truncate flex items-center gap-1" style={{ color: 'rgba(255,255,255,0.85)' }}>
                                  <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: GOLD }} />
                                  {n.split(' ')[0]}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Formulário de inscrição */}
      <section id="inscrever" className="px-5 sm:px-6 pb-20">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] mb-2" style={{ color: GOLD }}>Faça parte</p>
            <h2 className="text-3xl sm:text-4xl font-black">Escolha seu horário</h2>
            <p className="text-sm mt-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Assuma seu lugar na corrente de oração da Alma Church.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="rounded-3xl p-6 sm:p-8 space-y-5"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(200,163,95,0.2)' }}>
            {/* Nome + WhatsApp */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Seu nome</label>
              <input type="text" value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })}
                placeholder="Nome completo"
                className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>WhatsApp</label>
              <input type="tel" value={form.whatsapp} onChange={e => setForm({ ...form, whatsapp: e.target.value })}
                placeholder="(27) 99999-9999"
                className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
            </div>

            {/* Dia */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>Dia</label>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                {DIAS.map(dia => (
                  <button key={dia} type="button" onClick={() => setForm({ ...form, dia })}
                    className="py-2 rounded-xl text-xs font-semibold transition-all"
                    style={form.dia === dia
                      ? { background: GOLD, color: '#071B34' }
                      : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)' }}>
                    {dia.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            {/* Horário */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>Horário</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {HORARIOS.map(({ hora, label, icon: Icon }) => (
                  <button key={hora} type="button" onClick={() => setForm({ ...form, horario: hora })}
                    className="py-2.5 rounded-xl text-xs font-semibold transition-all flex flex-col items-center gap-1"
                    style={form.horario === hora
                      ? { background: GOLD, color: '#071B34' }
                      : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)' }}>
                    <Icon size={15} />
                    {hora}
                  </button>
                ))}
              </div>
            </div>

            {/* Mensagem */}
            {msg && (
              <div className="rounded-xl px-4 py-3 flex items-center gap-2.5 text-sm font-medium"
                style={msg.ok
                  ? { background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.4)', color: '#bbf7d0' }
                  : { background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#fecaca' }}>
                {msg.ok && <CheckCircle size={16} className="flex-shrink-0" />}
                {msg.text}
              </div>
            )}

            <button type="submit" disabled={saving}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-full font-bold text-sm transition-all hover:opacity-90 disabled:opacity-60"
              style={{ background: `linear-gradient(135deg, ${GOLD}, #b08030)`, color: '#071B34' }}>
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              Confirmar meu compromisso de oração
            </button>
          </form>
        </div>
      </section>

      {/* Ore por */}
      <section className="px-5 sm:px-6 pb-24">
        <div className="max-w-2xl mx-auto text-center">
          <Heart size={22} className="mx-auto mb-3" style={{ color: GOLD }} />
          <h2 className="text-2xl sm:text-3xl font-black mb-6">Durante seu horário, ore por:</h2>
          <div className="grid grid-cols-2 gap-3 text-left">
            {['Sua vida', 'Sua família', 'Nossa igreja', 'Nossa cidade', 'Salvação de vidas', 'O que Deus colocar no coração'].map(item => (
              <div key={item} className="flex items-center gap-2.5 rounded-xl px-4 py-3"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: GOLD }} />
                <span className="text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>{item}</span>
              </div>
            ))}
          </div>
          <p className="text-xs italic mt-8 max-w-md mx-auto" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Não é necessário seguir um roteiro rígido. O mais importante é separar esse tempo com fé,
            reverência e coração disponível diante de Deus.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-5 sm:px-6 py-8 text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <AlmaLogo size={44} />
        <p className="text-xs mt-3" style={{ color: 'rgba(255,255,255,0.3)' }}>
          © 2026 Alma Church · Torre de Oração
        </p>
      </footer>
    </div>
  )
}
