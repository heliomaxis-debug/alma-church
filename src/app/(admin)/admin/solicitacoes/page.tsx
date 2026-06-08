'use client'

import { useEffect, useState } from 'react'
import { ClipboardList, Clock, CheckCircle, XCircle, AlertCircle, ChevronDown } from 'lucide-react'
import { api } from '@/lib/api'

const statusCfg = (s: string) => {
  if (s === 'PENDENTE') return { icon: <Clock size={13} />, color: '#ca8a04', bg: 'rgba(234,179,8,0.1)', label: 'Pendente' }
  if (s === 'EM_ANALISE') return { icon: <AlertCircle size={13} />, color: '#4f46e5', bg: 'rgba(79,70,229,0.1)', label: 'Em análise' }
  if (s === 'CONCLUIDO') return { icon: <CheckCircle size={13} />, color: '#16a34a', bg: 'rgba(22,163,74,0.1)', label: 'Concluído' }
  return { icon: <XCircle size={13} />, color: '#ef4444', bg: 'rgba(239,68,68,0.1)', label: 'Rejeitado' }
}

const allStatuses = ['PENDENTE', 'EM_ANALISE', 'CONCLUIDO', 'REJEITADO']

export default function AdminSolicitacoes() {
  const [solicitacoes, setSolicitacoes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('TODOS')
  const [updating, setUpdating] = useState<string | null>(null)
  const [msg, setMsg] = useState<string | null>(null)

  useEffect(() => {
    api.admin.solicitacoes()
      .then(setSolicitacoes)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function updateStatus(id: string, status: string) {
    setUpdating(id)
    try {
      await api.admin.updateSolicitacao(id, status)
      setSolicitacoes(prev => prev.map(s => s.id === id ? { ...s, status } : s))
      setMsg('Status atualizado!')
      setTimeout(() => setMsg(null), 2500)
    } catch {
      setMsg('Erro ao atualizar.')
      setTimeout(() => setMsg(null), 2500)
    }
    setUpdating(null)
  }

  const filtered = filter === 'TODOS' ? solicitacoes : solicitacoes.filter(s => s.status === filter)

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Solicitações</h2>
        <p className="text-sm text-gray-400 mt-0.5">Gerenciar requerimentos e solicitações dos alunos</p>
      </div>

      {/* Toast */}
      {msg && (
        <div className="fixed bottom-6 right-6 z-50 bg-green-600 text-white px-5 py-3 rounded-2xl shadow-lg text-sm font-medium flex items-center gap-2">
          <CheckCircle size={15} /> {msg}
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: solicitacoes.length, color: '#4f46e5' },
          { label: 'Pendentes', value: solicitacoes.filter(s => s.status === 'PENDENTE').length, color: '#ca8a04' },
          { label: 'Em análise', value: solicitacoes.filter(s => s.status === 'EM_ANALISE').length, color: '#4f46e5' },
          { label: 'Concluídas', value: solicitacoes.filter(s => s.status === 'CONCLUIDO').length, color: '#16a34a' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 shadow-card">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{s.label}</p>
            <p className="text-2xl font-bold mt-1" style={{ color: s.value > 0 ? s.color : '#1f2937' }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="bg-white rounded-2xl shadow-card p-4">
        <div className="flex gap-2 flex-wrap">
          {['TODOS', ...allStatuses].map(f => {
            const cfg = f === 'TODOS' ? null : statusCfg(f)
            return (
              <button key={f} onClick={() => setFilter(f)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                style={filter === f ? { background: '#071B34', color: '#C8A35F' } : { background: '#f1f5f9', color: '#64748b' }}>
                {f === 'TODOS' ? 'Todos' : cfg?.label}
              </button>
            )
          })}
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
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
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
                      <span className="font-medium text-gray-700">{s.aluno?.name ?? '—'}</span> · RA: {s.aluno?.ra ?? '—'}
                    </p>
                    {s.subject && <p className="text-xs text-gray-500 mt-0.5">Assunto: {s.subject}</p>}
                    <p className="text-xs text-gray-600 mt-1.5 leading-relaxed line-clamp-2">{s.description}</p>
                    <p className="text-[11px] text-gray-400 mt-1">
                      Protocolo: {s.protocol} · {new Date(s.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>

                  {/* Status control */}
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <select
                        value={s.status}
                        onChange={e => updateStatus(s.id, e.target.value)}
                        disabled={updating === s.id}
                        className="appearance-none pr-7 pl-3 py-1.5 rounded-xl text-xs font-semibold border-0 focus:outline-none cursor-pointer disabled:opacity-50"
                        style={{ background: cfg.bg, color: cfg.color }}>
                        {allStatuses.map(st => {
                          const c = statusCfg(st)
                          return <option key={st} value={st}>{c.label}</option>
                        })}
                      </select>
                      <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: cfg.color }} />
                    </div>
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
