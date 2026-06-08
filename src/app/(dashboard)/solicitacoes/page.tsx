'use client'

import { useEffect, useState } from 'react'
import { ClipboardList, Plus, CheckCircle, Clock, AlertCircle, ChevronDown, ChevronUp, X } from 'lucide-react'
import { api } from '@/lib/api'

const requestTypes = [
  'Declaração de Matrícula', 'Declaração de Frequência', 'Histórico Escolar',
  'Revisão de Nota', 'Trancamento de Disciplina', 'Cancelamento de Matrícula',
  'Aproveitamento de Disciplina', 'Outro',
]

interface Solicitacao {
  id: string; protocol: string; type: string; subject?: string
  description: string; status: string; createdAt: string; updatedAt: string
}

function statusConfig(status: string) {
  const s = status.toLowerCase().replace('_', ' ')
  if (s === 'concluido') return { color: '#16a34a', bg: 'rgba(34,197,94,0.1)', icon: <CheckCircle size={14} />, label: 'Concluído' }
  if (s === 'em analise' || s === 'em_analise') return { color: '#2563eb', bg: 'rgba(59,130,246,0.1)', icon: <Clock size={14} />, label: 'Em análise' }
  return { color: '#d97706', bg: 'rgba(217,119,6,0.1)', icon: <AlertCircle size={14} />, label: 'Pendente' }
}

export default function SolicitacoesPage() {
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ type: '', subject: '', description: '' })

  useEffect(() => {
    api.aluno.solicitacoes()
      .then(data => setSolicitacoes(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const nova = await api.aluno.criarSolicitacao({ type: form.type, subject: form.subject || undefined, description: form.description })
      setSolicitacoes(prev => [nova, ...prev])
      setShowForm(false)
      setForm({ type: '', subject: '', description: '' })
    } catch {
      // error handled silently
    } finally {
      setSubmitting(false)
    }
  }

  const concluidas = solicitacoes.filter(s => s.status === 'CONCLUIDO').length
  const emAndamento = solicitacoes.filter(s => s.status !== 'CONCLUIDO').length

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total', value: solicitacoes.length, color: '#6b7280', bg: 'rgba(107,114,128,0.08)', icon: <ClipboardList size={18} /> },
          { label: 'Em Andamento', value: emAndamento, color: '#2563eb', bg: 'rgba(59,130,246,0.08)', icon: <Clock size={18} /> },
          { label: 'Concluídas', value: concluidas, color: '#16a34a', bg: 'rgba(34,197,94,0.08)', icon: <CheckCircle size={18} /> },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 shadow-card">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{s.label}</p>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{s.value}</p>
          </div>
        ))}
      </div>

      {/* New request button */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90 shadow-lg"
          style={{ background: '#071B34', color: '#C8A35F' }}
        >
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? 'Cancelar' : 'Nova Solicitação'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-card p-6 animate-slide-up">
          <h3 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
            <ClipboardList size={18} style={{ color: '#C8A35F' }} />
            Abrir Nova Solicitação
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Tipo de Solicitação *</label>
              <select
                value={form.type}
                onChange={e => setForm({ ...form, type: e.target.value })}
                required
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none appearance-none"
                onFocus={e => { e.currentTarget.style.borderColor = '#C8A35F'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(200,163,95,0.12)' }}
                onBlur={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.boxShadow = '' }}
              >
                <option value="">Selecione o tipo...</option>
                {requestTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            {(form.type === 'Revisão de Nota' || form.type === 'Trancamento de Disciplina') && (
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Disciplina</label>
                <input
                  type="text"
                  value={form.subject}
                  onChange={e => setForm({ ...form, subject: e.target.value })}
                  placeholder="Nome da disciplina"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none"
                  onFocus={e => { e.currentTarget.style.borderColor = '#C8A35F'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(200,163,95,0.12)' }}
                  onBlur={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.boxShadow = '' }}
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Descrição / Justificativa *</label>
              <textarea
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                required
                rows={4}
                placeholder="Descreva sua solicitação em detalhes..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none resize-none"
                onFocus={e => { e.currentTarget.style.borderColor = '#C8A35F'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(200,163,95,0.12)' }}
                onBlur={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.boxShadow = '' }}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl font-semibold text-sm disabled:opacity-60"
                style={{ background: '#C8A35F', color: '#071B34' }}
              >
                {submitting ? 'Enviando…' : 'Enviar Solicitação'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2.5 rounded-xl font-semibold text-sm text-gray-500 bg-gray-100"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50">
          <h3 className="font-semibold text-gray-900">Minhas Solicitações</h3>
        </div>
        <div className="divide-y divide-gray-50">
          {loading && (
            <div className="py-12 flex justify-center">
              <div className="w-6 h-6 border-4 border-gold-400 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          {!loading && solicitacoes.length === 0 && (
            <div className="py-16 text-center">
              <ClipboardList size={40} className="mx-auto text-gray-200 mb-3" />
              <p className="text-sm text-gray-400">Nenhuma solicitação encontrada</p>
            </div>
          )}
          {solicitacoes.map((req) => {
            const s = statusConfig(req.status)
            const isExpanded = expanded === req.id
            return (
              <div key={req.id}>
                <button
                  onClick={() => setExpanded(isExpanded ? null : req.id)}
                  className="w-full text-left px-6 py-4 hover:bg-gray-50/60 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: s.bg, color: s.color }}>
                      {s.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {req.type}{req.subject ? ` – ${req.subject}` : ''}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Protocolo: {req.protocol} · Aberto em {new Date(req.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: s.bg, color: s.color }}>
                        {s.icon}{s.label}
                      </span>
                      {isExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                    </div>
                  </div>
                </button>
                {isExpanded && (
                  <div className="px-6 pb-5 bg-gray-50/40 border-t border-gray-100">
                    <div className="pt-4 space-y-3">
                      <div>
                        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Descrição</p>
                        <p className="text-sm text-gray-700 bg-white rounded-xl p-3 border border-gray-100">{req.description}</p>
                      </div>
                      <div className="flex gap-4 text-xs text-gray-400">
                        <span>Criado em: <strong className="text-gray-600">{new Date(req.createdAt).toLocaleDateString('pt-BR')}</strong></span>
                        <span>Atualizado em: <strong className="text-gray-600">{new Date(req.updatedAt).toLocaleDateString('pt-BR')}</strong></span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-medium p-3 rounded-xl" style={{ background: s.bg, color: s.color }}>
                        {s.icon}
                        Status atual: <strong>{s.label}</strong>
                        {req.status === 'CONCLUIDO' && ' – Seu documento está disponível em Documentos Digitais.'}
                        {req.status === 'EM_ANALISE' && ' – Nossa equipe está analisando sua solicitação.'}
                        {req.status === 'PENDENTE' && ' – Aguardando análise da secretaria.'}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Info */}
      <div className="rounded-2xl p-4 flex items-start gap-3" style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)' }}>
        <AlertCircle size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-gray-600">
          As solicitações são analisadas em até <strong>5 dias úteis</strong>. Para urgências, entre em contato com a secretaria pelo telefone{' '}
          <strong>(11) 3456-7890</strong> ou pelo e-mail <strong>secretaria@btcp.edu.br</strong>
        </p>
      </div>
    </div>
  )
}
