'use client'

import { useEffect, useState } from 'react'
import { Users, BookOpen, GraduationCap, CreditCard, TrendingUp, ChevronRight, AlertCircle } from 'lucide-react'
import { api } from '@/lib/api'
import Link from 'next/link'

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [solicitacoes, setSolicitacoes] = useState<any[]>([])
  const [pagamentos, setPagamentos] = useState<any[]>([])

  useEffect(() => {
    api.admin.stats().then(setStats).catch(() => {})
    api.admin.solicitacoes().then(s => setSolicitacoes(s.slice(0, 5))).catch(() => {})
    api.admin.pagamentos().then(p => setPagamentos(p.filter((x: any) => !x.pago).slice(0, 5))).catch(() => {})
  }, [])

  const statCards = [
    { label: 'Total de Alunos', value: stats?.totalAlunos ?? '—', icon: <Users size={18} />, href: '/admin/alunos', color: '#4f46e5', bg: 'rgba(79,70,229,0.08)' },
    { label: 'Disciplinas', value: stats?.totalDisciplinas ?? '—', icon: <BookOpen size={18} />, href: '/admin/disciplinas', color: '#C8A35F', bg: 'rgba(200,163,95,0.08)' },
    { label: 'Professores', value: stats?.totalProfessores ?? '—', icon: <GraduationCap size={18} />, href: '/admin/professores', color: '#16a34a', bg: 'rgba(22,163,74,0.08)' },
    { label: 'Pagamentos Pendentes', value: stats?.pagamentosPendentes ?? '—', icon: <CreditCard size={18} />, href: '/admin/financeiro', color: '#ef4444', bg: 'rgba(239,68,68,0.08)' },
  ]

  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fade-in">
      {/* Welcome banner */}
      <div className="rounded-2xl p-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #071B34 0%, #0d2d50 100%)' }}>
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #C8A35F 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-white/50 text-sm">Painel Administrativo</p>
            <h2 className="text-2xl font-bold text-white mt-0.5">Alma College</h2>
            <p className="text-white/40 text-sm mt-1">BTCP · Seminário Teológico</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{ background: 'rgba(200,163,95,0.15)' }}>
            <TrendingUp size={16} style={{ color: '#C8A35F' }} />
            <span className="text-sm font-semibold" style={{ color: '#C8A35F' }}>Sistema Ativo</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s, i) => (
          <Link key={i} href={s.href}
            className="bg-white rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-all duration-200 hover:-translate-y-0.5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{s.label}</p>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{s.value}</p>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pending payments */}
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Pagamentos em Aberto</h3>
            <Link href="/admin/financeiro" className="text-xs font-medium flex items-center gap-1 hover:opacity-80" style={{ color: '#C8A35F' }}>
              Ver todos <ChevronRight size={13} />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {pagamentos.length === 0 ? (
              <div className="py-8 text-center">
                <CreditCard size={28} className="mx-auto text-gray-200 mb-2" />
                <p className="text-sm text-gray-400">Sem pagamentos pendentes</p>
              </div>
            ) : (
              pagamentos.map((p: any) => (
                <div key={p.id} className="flex items-center gap-3 px-6 py-3.5 hover:bg-gray-50/60">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
                    <CreditCard size={15} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{p.aluno?.name ?? '—'}</p>
                    <p className="text-xs text-gray-400">{meses[(p.mes ?? 1) - 1]}/{p.ano} · Venc. {p.vencimento}</p>
                  </div>
                  <p className="text-sm font-bold text-red-500 flex-shrink-0">
                    R$ {(p.valor ?? 0).toFixed(2)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent requests */}
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Solicitações Recentes</h3>
            <Link href="/admin/solicitacoes" className="text-xs font-medium flex items-center gap-1 hover:opacity-80" style={{ color: '#C8A35F' }}>
              Ver todas <ChevronRight size={13} />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {solicitacoes.length === 0 ? (
              <div className="py-8 text-center">
                <AlertCircle size={28} className="mx-auto text-gray-200 mb-2" />
                <p className="text-sm text-gray-400">Nenhuma solicitação</p>
              </div>
            ) : (
              solicitacoes.map((s: any) => {
                const pending = s.status === 'PENDENTE'
                return (
                  <div key={s.id} className="flex items-center gap-3 px-6 py-3.5 hover:bg-gray-50/60">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{s.type}</p>
                      <p className="text-xs text-gray-400 truncate">{s.aluno?.name ?? '—'} · {new Date(s.createdAt).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full flex-shrink-0"
                      style={pending
                        ? { background: 'rgba(234,179,8,0.1)', color: '#ca8a04' }
                        : { background: 'rgba(22,163,74,0.1)', color: '#16a34a' }}>
                      {pending ? 'Pendente' : 'Analisado'}
                    </span>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
