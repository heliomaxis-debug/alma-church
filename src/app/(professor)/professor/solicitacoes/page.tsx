'use client'

import { useEffect, useState } from 'react'
import { ClipboardList, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { api } from '@/lib/api'

const statusCfg = (s: string) => {
  if (s === 'PENDENTE') return { icon: <Clock size={13} />, color: '#ca8a04', bg: 'rgba(234,179,8,0.1)', label: 'Pendente' }
  if (s === 'EM_ANALISE') return { icon: <AlertCircle size={13} />, color: '#4f46e5', bg: 'rgba(79,70,229,0.1)', label: 'Em análise' }
  if (s === 'CONCLUIDO') return { icon: <CheckCircle size={13} />, color: '#16a34a', bg: 'rgba(22,163,74,0.1)', label: 'Concluído' }
  return { icon: <XCircle size={13} />, color: '#ef4444', bg: 'rgba(239,68,68,0.1)', label: 'Rejeitado' }
}

export default function ProfessorSolicitacoes() {
  const [solicitacoes, setSolicitacoes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('TODOS')

  useEffect(() => {
    api.professor.solicitacoes()
      .then(setSolicitacoes)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'TODOS' ? solicitacoes : solicitacoes.filter(s => s.status === filter)

  const counts = {
    PENDENTE: solicitacoes.filter(s => s.status === 'PENDENTE').length,
    EM_ANALISE: solicitacoes.filter(s => s.status === 'EM_ANALISE').length,
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Solicitações dos Alunos</h2>
        <p className="text-sm text-gray-400 mt-0.5">Revisões de nota e requerimentos de suas turmas</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: solicitacoes.length, color: '#4f46e5', bg: 'rgba(79,70,229,0.08)' },
          { label: 'Pendentes', value: counts.PENDENTE, color: '#ca8a04', bg: 'rgba(234,179,8,0.08)' },
          { label: 'Em Análise', value: counts.EM_ANALISE, color: '#4f46e5', bg: 'rgba(79,70,229,0.08)' },
          { label: 'Concluídas', value: solicitacoes.filter(s => s.status === 'CONCLUIDO').length, color: '#16a34a', bg: 'rgba(22,163,74,0.08)' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 shadow-card">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{s.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1" style={{ color: s.value > 0 ? s.color : undefined }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="bg-white rounded-2xl shadow-card p-4">
        <div className="flex gap-2 flex-wrap">
          {['TODOS', 'PENDENTE', 'EM_ANALISE', 'CONCLUIDO', 'REJEITADO'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
              style={filter === f ? { background: '#071B34', color: '#C8A35F' } : { background: '#f1f5f9', color: '#64748b' }}>
              {f === 'TODOS' ? 'Todos' : statusCfg(f).label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="divide-y divide-gray-50">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-7 h-7 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#C8A35F', borderTopColor: 'transparent' }} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <ClipboardList size={36} className="mx-auto text-gray-200 mb-2" />
              <p className="text-sm text-gray-400">Nenhuma solicitação encontrada</p>
            </div>
          ) : (
            filtered.map((s) => {
              const cfg = statusCfg(s.status)
              return (
                <div key={s.id} className="flex items-start gap-4 px-6 py-5 hover:bg-gray-50/60 transition-colors">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: cfg.bg, color: cfg.color }}>
                    <ClipboardList size={17} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-gray-900">{s.type}</p>
                      <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: cfg.bg, color: cfg.color }}>
                        {cfg.icon} {cfg.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Aluno: <span className="font-medium text-gray-700">{s.aluno?.name ?? '—'}</span> · RA: {s.aluno?.ra ?? '—'}
                    </p>
                    {s.subject && <p className="text-xs text-gray-500 mt-0.5">Assunto: {s.subject}</p>}
                    <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">{s.description}</p>
                    <p className="text-[11px] text-gray-400 mt-1">
                      Protocolo: {s.protocol} · {new Date(s.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
