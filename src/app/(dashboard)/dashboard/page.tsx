'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  BookOpen, CreditCard, Calendar, FileText, ClipboardList,
  IdCard, FolderOpen, CheckSquare, TrendingUp, AlertCircle,
  ChevronRight, Clock, MapPin, Star, Bell,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import { mockBibleVerses } from '@/lib/mock-data'

const eventTypeColors: Record<string, { dot: string; bg: string }> = {
  exam:     { dot: '#ef4444', bg: 'rgba(239,68,68,0.08)' },
  event:    { dot: '#3b82f6', bg: 'rgba(59,130,246,0.08)' },
  deadline: { dot: '#d97706', bg: 'rgba(217,119,6,0.08)' },
  academic: { dot: '#C8A35F', bg: 'rgba(200,163,95,0.08)' },
  holiday:  { dot: '#22c55e', bg: 'rgba(34,197,94,0.08)' },
}
const eventLabel: Record<string, string> = {
  exam: 'Prova', event: 'Evento', deadline: 'Prazo', academic: 'Acadêmico', holiday: 'Feriado',
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [notas, setNotas] = useState<any[]>([])
  const [pagamentos, setPagamentos] = useState<any[]>([])
  const [eventos, setEventos] = useState<any[]>([])
  const [loadedData, setLoadedData] = useState(false)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'
  const verse = mockBibleVerses[new Date().getDay() % mockBibleVerses.length]
  const firstName = user?.aluno?.name?.split(' ')[0] ?? user?.professor?.name?.split(' ')[0] ?? 'Bem-vindo'

  useEffect(() => {
    if (user?.role === 'ALUNO') {
      Promise.all([api.aluno.notas(), api.aluno.financeiro(), api.aluno.calendario()])
        .then(([n, p, ev]) => { setNotas(n); setPagamentos(p); setEventos(ev) })
        .catch(() => {})
        .finally(() => setLoadedData(true))
    } else {
      setLoadedData(true)
    }
  }, [user])

  const avgGrade = notas.length
    ? (notas.reduce((acc, m) => acc + (m.media ?? 0), 0) / notas.length).toFixed(1)
    : '—'
  const totalAbsences = notas.reduce((acc, m) => acc + (m.faltas ?? 0), 0)
  const pendentePagamento = pagamentos.find(p => !p.pago)

  // Próximas aulas = disciplinas matriculadas (com schedule real)
  const upcomingClasses = notas.slice(0, 4)

  // Avisos = próximos 4 eventos do calendário
  const today = new Date()
  const upcomingEvents = eventos
    .filter(ev => new Date(ev.date + 'T00:00:00') >= today)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 4)

  const quickAccess = [
    { href: '/notas', label: 'Notas e Faltas', icon: BookOpen, color: '#4f46e5', bg: 'rgba(79,70,229,0.08)' },
    { href: '/financeiro', label: 'Financeiro', icon: CreditCard, color: '#16a34a', bg: 'rgba(22,163,74,0.08)' },
    { href: '/calendario', label: 'Calendário', icon: Calendar, color: '#d97706', bg: 'rgba(217,119,6,0.08)' },
    { href: '/documentos', label: 'Documentos', icon: FileText, color: '#0891b2', bg: 'rgba(8,145,178,0.08)' },
    { href: '/solicitacoes', label: 'Solicitações', icon: ClipboardList, color: '#9333ea', bg: 'rgba(147,51,234,0.08)' },
    { href: '/carteirinha', label: 'Carteirinha', icon: IdCard, color: '#C8A35F', bg: 'rgba(200,163,95,0.08)' },
    { href: '/materiais', label: 'Materiais', icon: FolderOpen, color: '#e11d48', bg: 'rgba(225,29,72,0.08)' },
    { href: '/checkin', label: 'Check-in', icon: CheckSquare, color: '#0f766e', bg: 'rgba(15,118,110,0.08)' },
  ]

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header greeting */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{greeting}, {firstName}! 👋</h2>
          <p className="text-gray-400 text-sm mt-0.5">
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
          style={{ background: 'rgba(34,197,94,0.1)', color: '#16a34a' }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          Matrícula Ativa
        </div>
      </div>

      {/* Bible verse */}
      <div className="rounded-2xl p-6 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #071B34 0%, #0d2d50 100%)' }}>
        <div className="absolute top-0 right-0 w-48 h-48 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle, #C8A35F 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full border border-white/5" />
        <div className="relative z-10 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-1"
            style={{ background: 'rgba(200,163,95,0.15)', border: '1px solid rgba(200,163,95,0.3)' }}>
            <Star size={18} style={{ color: '#C8A35F' }} />
          </div>
          <div>
            <p className="text-white/30 text-[10px] font-semibold uppercase tracking-widest mb-2">Versículo do Dia</p>
            <p className="text-white/90 text-base font-serif italic leading-relaxed">"{verse.text}"</p>
            <p className="mt-3 text-sm font-semibold" style={{ color: '#C8A35F' }}>{verse.reference}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Manual Atual', value: user?.aluno?.semestre ?? '—', sub: user?.aluno?.curso ?? 'Bacharelado em Teologia', icon: <BookOpen size={18} />, color: '#4f46e5', bg: 'rgba(79,70,229,0.08)' },
          { label: 'Disciplinas', value: loadedData ? `${notas.length}` : '…', sub: 'matriculado(a)', icon: <ClipboardList size={18} />, color: '#C8A35F', bg: 'rgba(200,163,95,0.08)' },
          { label: 'Aproveitamento', value: loadedData ? avgGrade : '…', sub: 'média geral', icon: <TrendingUp size={18} />, color: '#16a34a', bg: 'rgba(22,163,74,0.08)' },
          { label: 'Faltas Totais', value: loadedData ? `${totalAbsences}` : '…', sub: 'no manual', icon: <AlertCircle size={18} />, color: totalAbsences > 10 ? '#ef4444' : '#d97706', bg: totalAbsences > 10 ? 'rgba(239,68,68,0.08)' : 'rgba(217,119,6,0.08)' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-all duration-200 hover:-translate-y-0.5">
            <div className="flex items-start justify-between mb-3">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{stat.label}</p>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: stat.bg, color: stat.color }}>{stat.icon}</div>
            </div>
            <p className="text-2xl font-bold text-gray-900 truncate">{stat.value}</p>
            <p className="text-[11px] text-gray-400 mt-0.5 truncate">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Progressão do Curso — só para alunos */}
      {user?.role === 'ALUNO' && (() => {
        const total = 10
        const inicio = user?.aluno?.moduloInicial ?? 1
        const atual = user?.aluno?.semestre ?? inicio
        // Sequência cíclica: parte do moduloInicial e percorre os 10 módulos
        const sequencia = Array.from({ length: total }, (_, i) => ((inicio - 1 + i) % total) + 1)
        const idxAtual = sequencia.indexOf(atual)
        const concluidos = idxAtual // quantos já completou
        const pct = Math.round((concluidos / total) * 100)
        const faltam = total - concluidos - 1 // -1 porque o atual não conta como concluído

        return (
          <div className="bg-white rounded-2xl shadow-card p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <TrendingUp size={16} style={{ color: '#C8A35F' }} />
                  Progressão do Curso
                </h3>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Curso cíclico · Iniciou no Manual {inicio} · Conclui no Manual {sequencia[total - 1]}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold" style={{ color: '#C8A35F' }}>{pct}%</p>
                <p className="text-[11px] text-gray-400">{concluidos} de {total} concluídos</p>
              </div>
            </div>

            {/* Barra de progresso */}
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-6">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #C8A35F, #b08030)' }}
              />
            </div>

            {/* Módulos na ordem cíclica */}
            <div className="flex items-center justify-between gap-1">
              {sequencia.map((mod, idx) => {
                const done = idx < idxAtual
                const active = idx === idxAtual
                const isLast = idx === total - 1
                return (
                  <div key={idx} className="flex flex-col items-center gap-1.5 flex-1">
                    <div className="relative w-full flex items-center justify-center">
                      {/* Linha esquerda */}
                      {idx > 0 && (
                        <div className="absolute h-0.5" style={{ left: 0, right: '50%', background: done || active ? '#C8A35F' : '#e5e7eb' }} />
                      )}
                      {/* Linha direita */}
                      {!isLast && (
                        <div className="absolute h-0.5" style={{ left: '50%', right: 0, background: done ? '#C8A35F' : '#e5e7eb' }} />
                      )}
                      {/* Círculo */}
                      <div
                        className={`relative z-10 flex items-center justify-center rounded-full font-bold text-[11px] transition-all ${active ? 'w-9 h-9 shadow-lg' : 'w-7 h-7'}`}
                        style={
                          done
                            ? { background: '#C8A35F', color: '#071B34' }
                            : active
                            ? { background: '#071B34', color: '#C8A35F', border: '2px solid #C8A35F', boxShadow: '0 0 0 4px rgba(200,163,95,0.2)' }
                            : { background: '#f3f4f6', color: '#9ca3af', border: '2px solid #e5e7eb' }
                        }
                      >
                        {done
                          ? <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#071B34" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          : mod
                        }
                      </div>
                    </div>
                    <span className="text-[9px] font-semibold" style={{ color: active ? '#C8A35F' : done ? '#b08030' : '#d1d5db' }}>
                      {active ? 'Atual' : done ? '✓' : `M${mod}`}
                    </span>
                  </div>
                )
              })}
            </div>

            <p className="text-[11px] text-gray-400 text-center mt-4">
              {faltam > 0
                ? `Você está no Manual ${atual}. Faltam ${faltam} manual${faltam > 1 ? 'is' : ''} para concluir o ciclo.`
                : `Você está no último manual do ciclo. Parabéns pela jornada!`}
            </p>
          </div>
        )
      })()}

      {/* Quick access */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider">Acesso Rápido</h3>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
          {quickAccess.map(item => {
            const Icon = item.icon
            return (
              <Link key={item.href} href={item.href}
                className="bg-white rounded-2xl p-3 flex flex-col items-center gap-2 shadow-card hover:shadow-card-hover transition-all duration-200 hover:-translate-y-1 group">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 duration-200" style={{ background: item.bg, color: item.color }}>
                  <Icon size={18} />
                </div>
                <span className="text-[10px] font-medium text-gray-600 text-center leading-tight">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Disciplinas matriculadas */}
        <div className="bg-white rounded-2xl shadow-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Clock size={16} className="text-gray-400" />
              Disciplinas Matriculadas
            </h3>
            <Link href="/notas" className="text-xs font-medium flex items-center gap-1 hover:underline" style={{ color: '#C8A35F' }}>
              Ver notas <ChevronRight size={12} />
            </Link>
          </div>
          {upcomingClasses.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">
              {loadedData ? 'Sem disciplinas matriculadas.' : 'Carregando…'}
            </p>
          ) : (
            <div className="space-y-3">
              {upcomingClasses.map((m) => (
                <div key={m.id} className="flex items-center gap-4 p-3 rounded-xl border border-gray-50 hover:border-gray-100 hover:bg-gray-50/50 transition-all">
                  <div className="flex-shrink-0 text-center px-2.5 py-1.5 rounded-lg min-w-[60px]"
                    style={{ background: 'rgba(200,163,95,0.08)', color: '#b08030' }}>
                    <p className="text-[10px] font-bold uppercase tracking-wide">Aula</p>
                    <p className="text-[11px] font-medium mt-0.5">{m.disciplina?.schedule?.split(' ')[0] ?? '—'}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-gray-900 truncate">{m.disciplina?.name}</p>
                    <p className="text-[11px] text-gray-400 truncate">{m.disciplina?.professor}</p>
                  </div>
                  {m.disciplina?.room && (
                    <div className="flex items-center gap-1 text-gray-400 flex-shrink-0">
                      <MapPin size={11} />
                      <span className="text-[11px]">{m.disciplina.room}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Próximos eventos */}
        <div className="bg-white rounded-2xl shadow-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Bell size={16} className="text-gray-400" />
              Próximos Eventos
            </h3>
            <Link href="/calendario" className="text-xs font-medium flex items-center gap-1 hover:underline" style={{ color: '#C8A35F' }}>
              Ver calendário <ChevronRight size={12} />
            </Link>
          </div>
          {upcomingEvents.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">
              {loadedData ? 'Nenhum evento próximo.' : 'Carregando…'}
            </p>
          ) : (
            <div className="space-y-3">
              {upcomingEvents.map(ev => {
                const style = eventTypeColors[ev.type] ?? { dot: '#9ca3af', bg: 'rgba(0,0,0,0.04)' }
                const label = eventLabel[ev.type] ?? ev.type
                const dateStr = new Date(ev.date + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
                return (
                  <div key={ev.id} className="flex items-start gap-3 p-3 rounded-xl transition-all hover:bg-gray-50/80 cursor-pointer"
                    style={{ borderLeft: `3px solid ${style.dot}` }}>
                    <span className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: style.dot }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-gray-800 truncate">{ev.title}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{dateStr} · {ev.time} · <span style={{ color: style.dot }}>{label}</span></p>
                    </div>
                    <ChevronRight size={14} className="text-gray-300 flex-shrink-0 mt-0.5" />
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Financial alert */}
      {pendentePagamento && (
        <div className="rounded-2xl p-4 flex items-center gap-4" style={{ background: 'rgba(200,163,95,0.08)', border: '1px solid rgba(200,163,95,0.2)' }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(200,163,95,0.2)', color: '#b08030' }}>
            <CreditCard size={18} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-800">Mensalidade com vencimento em {pendentePagamento.vencimento}</p>
            <p className="text-xs text-gray-500 mt-0.5">Valor: R$ {pendentePagamento.valor?.toFixed(2).replace('.', ',')} – Pague via PIX ou Boleto</p>
          </div>
          <Link href="/financeiro" className="flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-colors" style={{ background: '#C8A35F', color: '#071B34' }}>
            Pagar
          </Link>
        </div>
      )}
    </div>
  )
}
