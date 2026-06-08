'use client'

import { useEffect, useState } from 'react'
import { BookOpen, Search, Play, FileText, Headphones, ExternalLink, Library } from 'lucide-react'
import { api } from '@/lib/api'

type MatType = 'pdf' | 'video' | 'audio'

const typeIcon  = { pdf: FileText, video: Play, audio: Headphones }
const typeLabel = { pdf: 'PDF', video: 'Vídeo', audio: 'Áudio' }
const typeColor = { pdf: '#EFF6FF', video: '#F5F3FF', audio: '#F0FDF4' }
const typeText  = { pdf: '#3B82F6', video: '#8B5CF6', audio: '#10B981' }

const disciplinaColors = [
  '#3B82F6', '#8B5CF6', '#F59E0B', '#10B981',
  '#EF4444', '#06B6D4', '#EC4899', '#F97316',
]

function getDisciplinaColor(code: string) {
  let hash = 0
  for (const c of code) hash = c.charCodeAt(0) + ((hash << 5) - hash)
  return disciplinaColors[Math.abs(hash) % disciplinaColors.length]
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'hoje'
  if (days === 1) return 'ontem'
  if (days < 30) return `${days}d atrás`
  return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

export default function BibliotecaPage() {
  const [materiais, setMateriais] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'todos' | MatType>('todos')

  useEffect(() => {
    api.aluno.materiais()
      .then(setMateriais)
      .catch(() => setMateriais([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = materiais.filter(m => {
    const matchSearch =
      m.title?.toLowerCase().includes(search.toLowerCase()) ||
      m.disciplina?.name?.toLowerCase().includes(search.toLowerCase()) ||
      m.disciplina?.code?.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'todos' || m.type === filter
    return matchSearch && matchFilter
  })

  const counts = {
    pdf:   materiais.filter(m => m.type === 'pdf').length,
    video: materiais.filter(m => m.type === 'video').length,
    audio: materiais.filter(m => m.type === 'audio').length,
  }

  return (
    <div className="space-y-6 max-w-5xl animate-fade-in">

      {/* Header */}
      <div className="rounded-2xl p-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #071B34 0%, #0d2d50 100%)' }}>
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #C8A35F 1px, transparent 0)', backgroundSize: '28px 28px' }} />
        <div className="relative z-10 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-white/50 text-sm">Portal do Aluno</p>
            <h2 className="text-2xl font-bold text-white mt-0.5">Biblioteca</h2>
            <p className="text-white/40 text-sm mt-1">
              {loading ? 'Carregando materiais...' : `${materiais.length} recurso${materiais.length !== 1 ? 's' : ''} disponíve${materiais.length !== 1 ? 'is' : 'l'} nas suas disciplinas`}
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{ background: 'rgba(200,163,95,0.15)' }}>
            <Library size={15} style={{ color: '#C8A35F' }} />
            <span className="text-sm font-semibold" style={{ color: '#C8A35F' }}>Acervo Digital</span>
          </div>
        </div>
      </div>

      {/* Stats rápidos */}
      {!loading && materiais.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {([['pdf', 'PDFs & Apostilas'], ['video', 'Videoaulas'], ['audio', 'Podcasts']] as const).map(([type, label]) => {
            const Icon = typeIcon[type]
            return (
              <div key={type} className="bg-white rounded-2xl shadow-card p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: typeColor[type], color: typeText[type] }}>
                  <Icon size={18} />
                </div>
                <div>
                  <p className="text-xl font-black text-gray-900">{counts[type]}</p>
                  <p className="text-[11px] text-gray-400">{label}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por título ou disciplina..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none border bg-white transition-all text-gray-700"
            style={{ borderColor: '#E8EBF0' }}
            onFocus={e => { e.target.style.borderColor = '#C8A35F'; e.target.style.boxShadow = '0 0 0 3px rgba(200,163,95,0.12)' }}
            onBlur={e => { e.target.style.borderColor = '#E8EBF0'; e.target.style.boxShadow = '' }} />
        </div>
        <div className="flex items-center gap-2">
          {(['todos', 'pdf', 'video', 'audio'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all"
              style={{
                borderColor: filter === f ? '#C8A35F' : '#E8EBF0',
                background: filter === f ? 'rgba(200,163,95,0.08)' : 'white',
                color: filter === f ? '#C8A35F' : '#64748B',
              }}>
              {f === 'todos' ? 'Todos' : typeLabel[f as MatType]}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: '#C8A35F', borderTopColor: 'transparent' }} />
        </div>
      ) : materiais.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-card py-20 text-center">
          <Library size={48} className="mx-auto mb-4 text-gray-200" />
          <p className="text-base font-semibold text-gray-400">Nenhum material disponível</p>
          <p className="text-sm text-gray-300 mt-1 max-w-xs mx-auto">
            Quando seus professores adicionarem materiais às disciplinas, eles aparecerão aqui
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-card py-16 text-center">
          <BookOpen size={40} className="mx-auto mb-3 text-gray-200" />
          <p className="font-semibold text-gray-400">Nenhum material encontrado</p>
          <p className="text-sm text-gray-300 mt-1">Tente buscar por outro termo</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((m: any) => {
            const type = (m.type ?? 'pdf') as MatType
            const Icon = typeIcon[type] ?? FileText
            const color = getDisciplinaColor(m.disciplina?.code ?? 'XX')

            return (
              <div key={m.id}
                className="bg-white border rounded-2xl p-5 flex flex-col gap-4 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
                style={{ borderColor: '#E8EBF0' }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 8px 32px rgba(7,27,52,0.08)')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = '')}>

                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${color}15` }}>
                    <BookOpen size={18} style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full mb-1.5 inline-block"
                      style={{ background: typeColor[type], color: typeText[type] }}>
                      {typeLabel[type]}
                    </span>
                    <h4 className="text-sm font-bold leading-tight text-gray-900 line-clamp-2">{m.title}</h4>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: `${color}12`, color }}>
                      {m.disciplina?.code ?? '—'}
                    </span>
                    <span className="text-xs text-gray-400 truncate flex-1">{m.disciplina?.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    {m.size && <span>{m.size}</span>}
                    {m.duration && <span>{m.duration}</span>}
                    {m.createdAt && <span className="ml-auto">{timeAgo(m.createdAt)}</span>}
                  </div>
                </div>

                <button
                  className="mt-auto flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-semibold transition-all"
                  style={{ background: `${color}12`, color }}
                  onClick={() => m.url && window.open(m.url, '_blank')}>
                  <Icon size={13} />
                  {type === 'pdf' ? 'Abrir PDF' : type === 'video' ? 'Assistir' : 'Ouvir'}
                  <ExternalLink size={11} className="ml-auto" />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
