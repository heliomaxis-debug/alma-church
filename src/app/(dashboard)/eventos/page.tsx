'use client'
import { useState, useEffect } from 'react'
import { Calendar, Clock, MapPin, AlertCircle, BookOpen, Star, Tag } from 'lucide-react'
import { api } from '@/lib/api'

const typeConfig: Record<string, { label: string; color: string; icon: any }> = {
  exam: { label: 'Prova', color: '#EF4444', icon: AlertCircle },
  deadline: { label: 'Entrega', color: '#F59E0B', icon: Clock },
  event: { label: 'Evento', color: '#3B82F6', icon: Star },
  academic: { label: 'Acadêmico', color: '#8B5CF6', icon: BookOpen },
  holiday: { label: 'Feriado', color: '#10B981', icon: Tag },
}

function groupByMonth(events: any[]) {
  const groups: Record<string, any[]> = {}
  events.forEach(e => {
    const d = new Date(e.date)
    const key = d.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })
    if (!groups[key]) groups[key] = []
    groups[key].push(e)
  })
  return groups
}

export default function EventosPage() {
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.admin.eventos()
      .then(setEvents)
      .catch(() => {
        // Mock data when API not available
        setEvents([
          { id: '1', title: 'Prova – Antigo Testamento I', date: '2026-06-05', time: '08:00', type: 'exam', disciplina: { name: 'AT-101' } },
          { id: '2', title: 'Culto Estudantil', date: '2026-05-28', time: '19:00', type: 'event' },
          { id: '3', title: 'Entrega – Trabalho de Hermenêutica', date: '2026-06-10', time: '23:59', type: 'deadline', disciplina: { name: 'HM-201' } },
          { id: '4', title: 'Prova – Teologia Sistemática I', date: '2026-06-12', time: '14:00', type: 'exam', disciplina: { name: 'TS-201' } },
          { id: '5', title: 'Semana de Teologia', date: '2026-06-16', time: '09:00', type: 'academic' },
          { id: '6', title: 'Feriado – Corpus Christi', date: '2026-06-19', time: 'Todo o dia', type: 'holiday' },
          { id: '7', title: 'Confraternização dos Alunos', date: '2026-06-26', time: '18:00', type: 'event' },
          { id: '8', title: 'Prova – História da Igreja', date: '2026-06-08', time: '08:00', type: 'exam', disciplina: { name: 'HI-101' } },
          { id: '9', title: 'Prazo de Solicitação de Documentos', date: '2026-06-30', time: '17:00', type: 'deadline' },
          { id: '10', title: 'Início do Recesso de Julho', date: '2026-07-01', time: 'Todo o dia', type: 'academic' },
        ])
      })
      .finally(() => setLoading(false))
  }, [])

  const upcoming = events
    .filter(e => new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const grouped = groupByMonth(upcoming)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#C8A35F', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-black" style={{ color: '#071B34' }}>Eventos & Calendário</h1>
        <p className="text-sm mt-1" style={{ color: '#94A3B8' }}>{upcoming.length} próximos eventos</p>
      </div>

      {/* Type legend */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(typeConfig).map(([key, cfg]) => {
          const Icon = cfg.icon
          return (
            <div key={key} className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border"
              style={{ background: `${cfg.color}10`, borderColor: `${cfg.color}30`, color: cfg.color }}>
              <Icon size={11} /> {cfg.label}
            </div>
          )
        })}
      </div>

      {/* Events by month */}
      {Object.entries(grouped).map(([month, evts]) => (
        <div key={month}>
          <h3 className="text-xs font-bold uppercase tracking-widest mb-3 px-1 capitalize" style={{ color: '#94A3B8' }}>
            {month}
          </h3>
          <div className="space-y-3">
            {evts.map(ev => {
              const cfg = typeConfig[ev.type] ?? typeConfig.event
              const Icon = cfg.icon
              const d = new Date(ev.date)
              const day = d.getDate().toString().padStart(2, '0')
              const weekday = d.toLocaleString('pt-BR', { weekday: 'short' }).replace('.', '')

              return (
                <div key={ev.id} className="bg-white border rounded-2xl p-4 flex items-center gap-4 transition-all duration-200 hover:-translate-y-0.5"
                  style={{ borderColor: '#E8EBF0' }}
                  onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 8px 30px rgba(7,27,52,0.08)')}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = '')}>
                  {/* Date badge */}
                  <div className="flex flex-col items-center w-12 flex-shrink-0">
                    <span className="text-2xl font-black leading-none" style={{ color: '#071B34' }}>{day}</span>
                    <span className="text-[10px] font-semibold uppercase" style={{ color: '#94A3B8' }}>{weekday}</span>
                  </div>

                  <div className="w-px h-10 flex-shrink-0" style={{ background: '#F1F5F9' }} />

                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${cfg.color}12` }}>
                    <Icon size={16} style={{ color: cfg.color }} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm truncate" style={{ color: '#071B34' }}>{ev.title}</h4>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="flex items-center gap-1 text-xs" style={{ color: '#94A3B8' }}>
                        <Clock size={10} /> {ev.time}
                      </span>
                      {ev.disciplina && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                          style={{ background: '#F1F5F9', color: '#64748B' }}>
                          {ev.disciplina.name}
                        </span>
                      )}
                    </div>
                  </div>

                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0"
                    style={{ background: `${cfg.color}12`, color: cfg.color }}>
                    {cfg.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {upcoming.length === 0 && (
        <div className="text-center py-16">
          <Calendar size={40} className="mx-auto mb-3" style={{ color: '#E8EBF0' }} />
          <p className="font-semibold" style={{ color: '#94A3B8' }}>Nenhum evento próximo</p>
        </div>
      )}
    </div>
  )
}
