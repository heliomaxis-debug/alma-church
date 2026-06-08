'use client'

import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, BookOpen, FlaskConical, Flag, Calendar, AlertTriangle } from 'lucide-react'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'

const eventTypeConfig = {
  exam: { label: 'Prova', color: '#ef4444', bg: 'rgba(239,68,68,0.1)', icon: <BookOpen size={12} /> },
  event: { label: 'Evento', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', icon: <Calendar size={12} /> },
  deadline: { label: 'Prazo', color: '#d97706', bg: 'rgba(217,119,6,0.1)', icon: <AlertTriangle size={12} /> },
  academic: { label: 'Acadêmico', color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', icon: <Flag size={12} /> },
  holiday: { label: 'Feriado', color: '#16a34a', bg: 'rgba(22,163,74,0.1)', icon: <FlaskConical size={12} /> },
}

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

export default function CalendarioPage() {
  const today = new Date()
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [eventos, setEventos] = useState<any[]>([])

  useEffect(() => {
    api.aluno.calendario().then(data => setEventos(data)).catch(() => {})
  }, [])

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  function prevMonth() {
    setCurrentDate(new Date(year, month - 1, 1))
  }
  function nextMonth() {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  function getEventsForDay(day: number) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return eventos.filter(e => e.date === dateStr)
  }

  function isToday(day: number) {
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
  }

  const upcomingEvents = eventos
    .filter(e => new Date(e.date) >= today)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 6)

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Legend */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(eventTypeConfig).map(([key, cfg]) => (
          <span
            key={key}
            className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
            style={{ background: cfg.bg, color: cfg.color }}
          >
            {cfg.icon}
            {cfg.label}
          </span>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-card p-6">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">{MONTHS[month]}</h3>
              <p className="text-sm text-gray-400">{year}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={prevMonth}
                className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-600"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1))}
                className="px-3 h-9 rounded-xl hover:bg-gray-100 transition-colors text-xs font-medium text-gray-600"
              >
                Hoje
              </button>
              <button
                onClick={nextMonth}
                className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-600"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {DAYS.map(d => (
              <div key={d} className="text-center text-[11px] font-semibold text-gray-400 uppercase tracking-wider py-2">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar cells */}
          <div className="grid grid-cols-7 gap-0.5">
            {cells.map((day, i) => {
              if (!day) return <div key={i} className="aspect-square" />
              const events = getEventsForDay(day)
              const todayDay = isToday(day)
              return (
                <div
                  key={i}
                  className={cn(
                    'aspect-square flex flex-col items-center rounded-xl p-1 cursor-default transition-all group',
                    todayDay ? '' : 'hover:bg-gray-50'
                  )}
                  style={todayDay ? { background: 'rgba(200,163,95,0.1)' } : {}}
                >
                  <span
                    className="text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full leading-none"
                    style={todayDay ? { background: '#C8A35F', color: '#071B34' } : { color: '#374151' }}
                  >
                    {day}
                  </span>
                  {events.length > 0 && (
                    <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center">
                      {events.slice(0, 2).map((ev, j) => {
                        const cfg = eventTypeConfig[ev.type as keyof typeof eventTypeConfig]
                        return (
                          <span
                            key={j}
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: cfg.color }}
                            title={ev.title}
                          />
                        )
                      })}
                      {events.length > 2 && (
                        <span className="text-[9px] text-gray-400">+{events.length - 2}</span>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Upcoming events */}
        <div className="bg-white rounded-2xl shadow-card p-6">
          <h3 className="font-semibold text-gray-900 mb-5">Próximos Eventos</h3>
          <div className="space-y-3">
            {upcomingEvents.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">Nenhum evento próximo</p>
            ) : (
              upcomingEvents.map((ev) => {
                const cfg = eventTypeConfig[ev.type as keyof typeof eventTypeConfig]
                const date = new Date(ev.date + 'T00:00:00')
                const dayNum = date.getDate()
                const dayName = DAYS[date.getDay()]
                const monthName = MONTHS[date.getMonth()].slice(0, 3)

                return (
                  <div key={ev.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-default">
                    <div
                      className="flex-shrink-0 w-12 text-center py-1.5 rounded-xl"
                      style={{ background: cfg.bg }}
                    >
                      <p className="text-[10px] font-semibold uppercase" style={{ color: cfg.color }}>{dayName}</p>
                      <p className="text-lg font-bold leading-none mt-0.5" style={{ color: cfg.color }}>{dayNum}</p>
                      <p className="text-[9px] mt-0.5" style={{ color: cfg.color }}>{monthName}</p>
                    </div>
                    <div className="flex-1 min-w-0 pt-1">
                      <p className="text-[13px] font-semibold text-gray-900 truncate">{ev.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className="flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                          style={{ background: cfg.bg, color: cfg.color }}
                        >
                          {cfg.icon}
                          {cfg.label}
                        </span>
                        <span className="text-[11px] text-gray-400">{ev.time}</span>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* All events list */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50">
          <h3 className="font-semibold text-gray-900">Todos os Eventos</h3>
        </div>
        <div className="divide-y divide-gray-50">
          {[...eventos]
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map((ev) => {
              const cfg = eventTypeConfig[ev.type as keyof typeof eventTypeConfig]
              const date = new Date(ev.date + 'T00:00:00')
              const past = date < today
              return (
                <div
                  key={ev.id}
                  className={cn('flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50/60 transition-colors', past && 'opacity-50')}
                >
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: cfg.bg, color: cfg.color }}
                  >
                    {cfg.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{ev.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{ev.time}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span
                      className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: cfg.bg, color: cfg.color }}
                    >
                      {cfg.label}
                    </span>
                    <span className="text-xs text-gray-400">
                      {date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              )
            })}
        </div>
      </div>
    </div>
  )
}
