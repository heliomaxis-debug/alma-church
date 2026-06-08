'use client'

import { useEffect, useState } from 'react'
import {
  Megaphone, Info, AlertTriangle, Zap,
  BookOpen, Users, Bell,
} from 'lucide-react'
import { api } from '@/lib/api'

const priorityConfig = {
  info:    { label: 'Informativo', color: '#3B82F6', bg: 'rgba(59,130,246,0.08)', icon: Info },
  aviso:   { label: 'Aviso',       color: '#F59E0B', bg: 'rgba(245,158,11,0.08)', icon: AlertTriangle },
  urgente: { label: 'Urgente',     color: '#EF4444', bg: 'rgba(239,68,68,0.08)', icon: Zap },
}

type FilterKey = 'todos' | 'info' | 'aviso' | 'urgente'

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'agora mesmo'
  if (mins < 60) return `${mins}min atrás`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h atrás`
  const days = Math.floor(hrs / 24)
  if (days === 1) return 'ontem'
  if (days < 30) return `${days}d atrás`
  return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

export default function ComunicadosPage() {
  const [comunicados, setComunicados] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterKey>('todos')

  useEffect(() => {
    api.aluno.comunicados()
      .then(setComunicados)
      .catch(() => setComunicados([]))
      .finally(() => setLoading(false))
  }, [])

  const urgentes = comunicados.filter(c => c.priority === 'urgente').length
  const avisos   = comunicados.filter(c => c.priority === 'aviso').length
  const infos    = comunicados.filter(c => c.priority === 'info').length

  const filtered = filter === 'todos' ? comunicados : comunicados.filter(c => c.priority === filter)

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-fade-in">

      {/* Header */}
      <div className="rounded-2xl p-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #071B34 0%, #0d2d50 100%)' }}>
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #C8A35F 1px, transparent 0)', backgroundSize: '28px 28px' }} />
        <div className="relative z-10 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-white/50 text-sm">Portal do Aluno</p>
            <h2 className="text-2xl font-bold text-white mt-0.5">Comunicados</h2>
            <p className="text-white/40 text-sm mt-1">Avisos e informações dos seus professores</p>
          </div>
          {urgentes > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl animate-pulse"
              style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.3)' }}>
              <Zap size={15} style={{ color: '#EF4444' }} />
              <span className="text-sm font-bold" style={{ color: '#EF4444' }}>
                {urgentes} urgente{urgentes > 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Urgentes',     value: urgentes, color: '#EF4444', bg: 'rgba(239,68,68,0.08)',   icon: Zap },
          { label: 'Avisos',       value: avisos,   color: '#F59E0B', bg: 'rgba(245,158,11,0.08)', icon: AlertTriangle },
          { label: 'Informativos', value: infos,    color: '#3B82F6', bg: 'rgba(59,130,246,0.08)',  icon: Info },
        ].map(s => {
          const Icon = s.icon
          return (
            <div key={s.label} className="bg-white rounded-2xl shadow-card p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{s.label}</p>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: s.bg, color: s.color }}>
                  <Icon size={15} />
                </div>
              </div>
              <p className="text-2xl font-black text-gray-900">{s.value}</p>
            </div>
          )
        })}
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-2 flex-wrap">
        {(['todos', 'urgente', 'aviso', 'info'] as FilterKey[]).map(f => {
          const active = filter === f
          const cfg = f !== 'todos' ? priorityConfig[f] : null
          return (
            <button key={f} onClick={() => setFilter(f)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all"
              style={{
                background: active ? (cfg?.bg ?? 'rgba(7,27,52,0.08)') : '#F3F4F6',
                color: active ? (cfg?.color ?? '#071B34') : '#6B7280',
                border: `1.5px solid ${active ? (cfg?.color ?? '#071B34') : 'transparent'}`,
              }}>
              {f === 'todos' ? 'Todos' : priorityConfig[f].label}
            </button>
          )
        })}
        <span className="ml-auto text-xs text-gray-400">{filtered.length} comunicado{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: '#C8A35F', borderTopColor: 'transparent' }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-card py-20 text-center">
          <Bell size={44} className="mx-auto mb-3 text-gray-200" />
          <p className="text-sm font-semibold text-gray-400">
            {filter === 'todos' ? 'Nenhum comunicado recebido' : `Nenhum comunicado do tipo "${priorityConfig[filter as Exclude<FilterKey,'todos'>]?.label}"`}
          </p>
          <p className="text-xs text-gray-300 mt-1">Os avisos dos seus professores aparecerão aqui</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((c: any) => {
            const cfg = priorityConfig[c.priority as keyof typeof priorityConfig] ?? priorityConfig.info
            const Icon = cfg.icon
            const isUrgente = c.priority === 'urgente'
            return (
              <div key={c.id}
                className="bg-white rounded-2xl shadow-card p-5 transition-all hover:shadow-md"
                style={isUrgente ? { borderLeft: '3px solid #EF4444' } : {}}>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: cfg.bg, color: cfg.color }}>
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    {/* badges */}
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: cfg.bg, color: cfg.color }}>
                        {cfg.label}
                      </span>
                      {c.disciplinaCode ? (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"
                          style={{ background: 'rgba(79,70,229,0.08)', color: '#4f46e5' }}>
                          <BookOpen size={10} /> {c.disciplinaCode}
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"
                          style={{ background: 'rgba(59,130,246,0.08)', color: '#3B82F6' }}>
                          <Users size={10} /> Todos os alunos
                        </span>
                      )}
                    </div>

                    {/* título */}
                    <h4 className="font-bold text-gray-900 text-sm mb-1">{c.title}</h4>
                    <p className="text-sm text-gray-600 leading-relaxed mb-3">{c.content}</p>

                    {/* rodapé */}
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-[9px]"
                          style={{ background: 'linear-gradient(135deg, #C8A35F, #b08030)', color: '#071B34' }}>
                          {(c.professorName ?? 'P').split(' ').map((w: string) => w[0]).slice(0, 2).join('')}
                        </div>
                        <span className="font-medium">{c.professorName ?? 'Professor'}</span>
                      </div>
                      {c.disciplinaName && (
                        <>
                          <span>·</span>
                          <span>{c.disciplinaName}</span>
                        </>
                      )}
                      <span className="ml-auto">{timeAgo(c.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
