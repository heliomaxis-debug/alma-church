'use client'

import { useEffect, useState } from 'react'
import { FileText, Video, Mic, Search, Download, Play, BookOpen, FolderOpen, CheckCircle } from 'lucide-react'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'

const typeConfig = {
  pdf: { icon: <FileText size={18} />, label: 'PDF', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
  video: { icon: <Video size={18} />, label: 'Vídeo', color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
  audio: { icon: <Mic size={18} />, label: 'Áudio', color: '#16a34a', bg: 'rgba(22,163,74,0.1)' },
}

export default function MateriaisPage() {
  const [materiais, setMateriais] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [selectedCourse, setSelectedCourse] = useState('Todas')
  const [selectedType, setSelectedType] = useState('Todos')
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null)

  useEffect(() => {
    api.aluno.materiais().then(data => setMateriais(data)).catch(() => {})
  }, [])

  function showMsg(text: string, ok = false) {
    setMsg({ text, ok })
    setTimeout(() => setMsg(null), 3500)
  }

  function handleBaixar(mat: any) {
    if (mat.url) {
      window.open(mat.url, '_blank', 'noopener')
    } else {
      showMsg('Arquivo não disponível para download.')
    }
  }

  function handleReproduzir(mat: any) {
    if (mat.url) {
      window.open(mat.url, '_blank', 'noopener')
    } else {
      showMsg('Arquivo de mídia não disponível.')
    }
  }

  const courses = ['Todas', ...Array.from(new Set(materiais.map(m => m.disciplina?.name).filter(Boolean)))]

  const filtered = materiais.filter(m => {
    const disciplinaName = m.disciplina?.name ?? ''
    const matchCourse = selectedCourse === 'Todas' || disciplinaName === selectedCourse
    const matchType = selectedType === 'Todos' || m.type === selectedType
    const matchSearch = m.title.toLowerCase().includes(search.toLowerCase()) || disciplinaName.toLowerCase().includes(search.toLowerCase())
    return matchCourse && matchType && matchSearch
  })

  const grouped = filtered.reduce<Record<string, any[]>>((acc, m) => {
    const key = m.disciplina?.name ?? 'Geral'
    if (!acc[key]) acc[key] = []
    acc[key].push(m)
    return acc
  }, {})

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      {/* Toast */}
      {msg && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-lg text-sm font-medium text-white flex items-center gap-2 ${msg.ok ? 'bg-green-600' : 'bg-gray-700'}`}>
          {msg.ok && <CheckCircle size={15} />} {msg.text}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Apostilas', value: materiais.filter(m => m.type === 'pdf').length, icon: typeConfig.pdf.icon, color: typeConfig.pdf.color, bg: typeConfig.pdf.bg },
          { label: 'Vídeos', value: materiais.filter(m => m.type === 'video').length, icon: typeConfig.video.icon, color: typeConfig.video.color, bg: typeConfig.video.bg },
          { label: 'Áudios', value: materiais.filter(m => m.type === 'audio').length, icon: typeConfig.audio.icon, color: typeConfig.audio.color, bg: typeConfig.audio.bg },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 shadow-card">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{s.label}</p>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: s.bg, color: s.color }}>
                {s.icon}
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-card p-5 space-y-3">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar materiais ou disciplinas..."
            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none transition-all"
            onFocus={e => { e.currentTarget.style.borderColor = '#C8A35F'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(200,163,95,0.12)' }}
            onBlur={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.boxShadow = '' }}
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {(['Todos', 'pdf', 'video', 'audio'] as const).map(t => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={cn('px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5', selectedType === t ? '' : 'text-gray-500 bg-gray-100 hover:bg-gray-200')}
              style={selectedType === t ? { background: '#071B34', color: '#C8A35F' } : {}}
            >
              {t === 'Todos' ? 'Todos tipos' : <>{typeConfig[t].icon}{typeConfig[t].label}</>}
            </button>
          ))}
        </div>

        <div className="flex gap-2 flex-wrap">
          {courses.map(c => (
            <button
              key={c}
              onClick={() => setSelectedCourse(c)}
              className={cn('px-3 py-1.5 rounded-xl text-xs font-medium transition-all', selectedCourse === c ? '' : 'text-gray-500 bg-gray-50 border border-gray-200 hover:bg-gray-100')}
              style={selectedCourse === c ? { background: 'rgba(200,163,95,0.12)', color: '#b08030', border: '1px solid rgba(200,163,95,0.25)' } : {}}
            >
              {c === 'Todas' ? 'Todas disciplinas' : c}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {Object.keys(grouped).length === 0 ? (
        <div className="bg-white rounded-2xl shadow-card py-16 text-center">
          <FolderOpen size={40} className="mx-auto text-gray-200 mb-3" />
          <p className="text-sm text-gray-400">{materiais.length === 0 ? 'Carregando materiais…' : 'Nenhum material encontrado'}</p>
        </div>
      ) : (
        Object.entries(grouped).map(([course, mats]) => (
          <div key={course} className="bg-white rounded-2xl shadow-card overflow-hidden">
            <div className="px-6 py-4 flex items-center gap-3 border-b border-gray-50" style={{ background: 'rgba(7,27,52,0.02)' }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(200,163,95,0.12)', color: '#b08030' }}>
                <BookOpen size={16} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">{course}</p>
                <p className="text-[11px] text-gray-400">{mats.length} material(is)</p>
              </div>
            </div>
            <div className="divide-y divide-gray-50">
              {mats.map(mat => {
                const tc = typeConfig[mat.type as keyof typeof typeConfig] ?? typeConfig.pdf
                return (
                  <div key={mat.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/60 transition-colors group">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: tc.bg, color: tc.color }}>
                      {tc.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{mat.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {mat.size ?? mat.duration ?? '—'} · {new Date(mat.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: tc.bg, color: tc.color }}>
                      {tc.label}
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      {(mat.type === 'video' || mat.type === 'audio') && (
                        <button
                          onClick={() => handleReproduzir(mat)}
                          className="p-2 rounded-xl hover:bg-gray-100 text-gray-500" title="Reproduzir">
                          <Play size={15} />
                        </button>
                      )}
                      <button
                        onClick={() => handleBaixar(mat)}
                        className="p-2 rounded-xl hover:bg-gray-100 text-gray-500" title="Baixar">
                        <Download size={15} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
