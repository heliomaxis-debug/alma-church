'use client'

import { useEffect, useState } from 'react'
import { BookOpen, Users, FolderOpen, TrendingUp, ChevronRight } from 'lucide-react'
import { api } from '@/lib/api'
import Link from 'next/link'

export default function ProfessorTurmas() {
  const [turmas, setTurmas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.professor.turmas()
      .then(setTurmas)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function situacaoColor(media: number | null) {
    if (media === null) return { bg: 'rgba(107,114,128,0.1)', color: '#6b7280', label: 'Sem notas' }
    if (media >= 7) return { bg: 'rgba(22,163,74,0.1)', color: '#16a34a', label: 'Aprovados' }
    if (media >= 5) return { bg: 'rgba(234,179,8,0.1)', color: '#ca8a04', label: 'Recuperação' }
    return { bg: 'rgba(239,68,68,0.1)', color: '#ef4444', label: 'Risco' }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Minhas Turmas</h2>
          <p className="text-sm text-gray-400 mt-0.5">{turmas.length} disciplina{turmas.length !== 1 ? 's' : ''} ativa{turmas.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#C8A35F', borderTopColor: 'transparent' }} />
        </div>
      ) : turmas.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-card py-16 text-center">
          <BookOpen size={40} className="mx-auto text-gray-200 mb-3" />
          <p className="text-gray-500 font-medium">Nenhuma disciplina encontrada</p>
          <p className="text-sm text-gray-400 mt-1">Você ainda não está vinculado a disciplinas</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {turmas.map((t) => {
            const s = situacaoColor(t.mediaGeral)
            return (
              <Link key={t.id} href={`/professor/turmas/${t.id}`}
                className="bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-200 hover:-translate-y-0.5 p-6 flex items-center gap-6">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(200,163,95,0.1)', color: '#C8A35F' }}>
                  <BookOpen size={22} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3 flex-wrap">
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900">{t.name}</p>
                      <p className="text-sm text-gray-400 mt-0.5">{t.code} · {t.credits} créditos · {t.schedule}</p>
                    </div>
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full flex-shrink-0 mt-0.5"
                      style={{ background: s.bg, color: s.color }}>
                      Média: {t.mediaGeral !== null ? t.mediaGeral.toFixed(1) : '—'}
                    </span>
                  </div>

                  <div className="flex items-center gap-5 mt-3">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Users size={13} />
                      <span>{t.totalAlunos} alunos</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <FolderOpen size={13} />
                      <span>{t.totalMateriais} materiais</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <TrendingUp size={13} />
                      <span>Manual {t.semester} {t.credits > 0 ? `· Sala ${t.room}` : ''}</span>
                    </div>
                  </div>
                </div>

                <ChevronRight size={18} className="text-gray-300 flex-shrink-0" />
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
