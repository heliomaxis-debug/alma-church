'use client'

import { useEffect, useState } from 'react'
import {
  Users, BookOpen, GraduationCap, CreditCard, TrendingUp,
  TrendingDown, CheckCircle, XCircle, Clock, BarChart3,
  PieChart, Award, AlertCircle,
} from 'lucide-react'
import { api } from '@/lib/api'

const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

function BarChart({ data, color }: { data: { label: string; value: number; max?: number }[]; color: string }) {
  const max = Math.max(...data.map(d => d.value), 1)
  return (
    <div className="flex items-end gap-2 h-28">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <span className="text-[10px] font-bold" style={{ color }}>{d.value}</span>
          <div className="w-full rounded-t-md transition-all duration-500"
            style={{ height: `${Math.max((d.value / max) * 80, d.value > 0 ? 4 : 0)}px`, background: color, opacity: 0.85 }} />
          <span className="text-[10px] text-gray-400 font-medium">{d.label}</span>
        </div>
      ))}
    </div>
  )
}

function StatCard({ label, value, icon: Icon, color, bg, trend }: any) {
  return (
    <div className="bg-white rounded-2xl shadow-card p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: bg, color }}>
          <Icon size={17} />
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      {trend && (
        <p className={`text-xs mt-1 font-medium flex items-center gap-1 ${trend > 0 ? 'text-green-500' : 'text-red-400'}`}>
          {trend > 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
          {trend > 0 ? '+' : ''}{trend}% vs mês anterior
        </p>
      )}
    </div>
  )
}

export default function AdminRelatorios() {
  const [stats, setStats] = useState<any>(null)
  const [alunos, setAlunos] = useState<any[]>([])
  const [pagamentos, setPagamentos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.admin.stats().catch(() => null),
      api.admin.alunos().catch(() => []),
      api.admin.pagamentos().catch(() => []),
    ]).then(([s, a, p]) => {
      setStats(s)
      setAlunos(a)
      setPagamentos(p)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#C8A35F', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  // ─── Derived data ─────────────────────────────────────────────────────────
  const totalAlunos = stats?.totalAlunos ?? alunos.length
  const ativos = alunos.filter(a => a.status === 'ATIVO').length
  const inativos = alunos.filter(a => a.status === 'INATIVO').length
  const trancados = alunos.filter(a => a.status === 'TRANCADO').length

  const pagamentosTotal = pagamentos.length
  const pagos = pagamentos.filter(p => p.pago).length
  const pendentes = pagamentos.filter(p => !p.pago).length
  const receitaTotal = pagamentos.filter(p => p.pago).reduce((acc, p) => acc + (p.valor ?? 0), 0)
  const receitaPendente = pagamentos.filter(p => !p.pago).reduce((acc, p) => acc + (p.valor ?? 0), 0)
  const taxaAdimplencia = pagamentosTotal > 0 ? Math.round((pagos / pagamentosTotal) * 100) : 0

  // Pagamentos por mês (últimos 6 meses)
  const hoje = new Date()
  const pagsMes = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() - 5 + i, 1)
    const mes = d.getMonth()
    const ano = d.getFullYear()
    const count = pagamentos.filter(p => p.pago && p.mes - 1 === mes && p.ano === ano).length
    const valor = pagamentos.filter(p => p.pago && p.mes - 1 === mes && p.ano === ano)
      .reduce((acc, p) => acc + (p.valor ?? 0), 0)
    return { label: MESES[mes], count, valor }
  })

  // Semestres dos alunos
  const semestres: Record<number, number> = {}
  alunos.forEach(a => {
    const s = a.semestre ?? 1
    semestres[s] = (semestres[s] ?? 0) + 1
  })
  const semestreData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(s => ({
    label: `M${s}`, value: semestres[s] ?? 0,
  }))

  // Métodos de pagamento
  const metodos: Record<string, number> = {}
  pagamentos.filter(p => p.pago && p.metodo).forEach(p => {
    metodos[p.metodo] = (metodos[p.metodo] ?? 0) + 1
  })

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fade-in">

      {/* Header */}
      <div className="rounded-2xl p-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #071B34 0%, #0d2d50 100%)' }}>
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #C8A35F 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div className="relative z-10 flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-white/50 text-sm">Relatórios e Analytics</p>
            <h2 className="text-2xl font-bold text-white mt-0.5">Visão Geral da Instituição</h2>
            <p className="text-white/40 text-sm mt-1">Dados em tempo real do sistema</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{ background: 'rgba(200,163,95,0.15)' }}>
            <BarChart3 size={16} style={{ color: '#C8A35F' }} />
            <span className="text-sm font-semibold" style={{ color: '#C8A35F' }}>Live data</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total de Alunos" value={totalAlunos} icon={Users} color="#4f46e5" bg="rgba(79,70,229,0.08)" />
        <StatCard label="Disciplinas Ativas" value={stats?.totalDisciplinas ?? '—'} icon={BookOpen} color="#C8A35F" bg="rgba(200,163,95,0.08)" />
        <StatCard label="Professores" value={stats?.totalProfessores ?? '—'} icon={GraduationCap} color="#16a34a" bg="rgba(22,163,74,0.08)" />
        <StatCard label="Receita Recebida" value={`R$ ${receitaTotal.toFixed(0)}`} icon={CreditCard} color="#0ea5e9" bg="rgba(14,165,233,0.08)" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">

        {/* Financeiro */}
        <div className="bg-white rounded-2xl shadow-card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-gray-900">Recebimentos Mensais</h3>
              <p className="text-xs text-gray-400 mt-0.5">Últimos 6 meses</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-gray-900">R$ {receitaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              <p className="text-xs text-gray-400">total recebido</p>
            </div>
          </div>
          <BarChart data={pagsMes.map(m => ({ label: m.label, value: m.count }))} color="#C8A35F" />
          <div className="grid grid-cols-3 gap-3 mt-6 pt-5 border-t border-gray-50">
            <div className="text-center">
              <p className="text-xl font-black text-green-600">{pagos}</p>
              <p className="text-xs text-gray-400 mt-0.5">Pagos</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-black text-red-500">{pendentes}</p>
              <p className="text-xs text-gray-400 mt-0.5">Pendentes</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-black" style={{ color: '#C8A35F' }}>{taxaAdimplencia}%</p>
              <p className="text-xs text-gray-400 mt-0.5">Adimplência</p>
            </div>
          </div>
        </div>

        {/* Status dos Alunos */}
        <div className="bg-white rounded-2xl shadow-card p-6">
          <h3 className="font-bold text-gray-900 mb-5">Status dos Alunos</h3>
          <div className="space-y-4">
            {[
              { label: 'Ativos', value: ativos, total: totalAlunos, color: '#16a34a', icon: CheckCircle },
              { label: 'Trancados', value: trancados, total: totalAlunos, color: '#F59E0B', icon: Clock },
              { label: 'Inativos', value: inativos, total: totalAlunos, color: '#EF4444', icon: XCircle },
            ].map(s => {
              const Icon = s.icon
              const pct = totalAlunos > 0 ? Math.round((s.value / totalAlunos) * 100) : 0
              return (
                <div key={s.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Icon size={14} style={{ color: s.color }} /> {s.label}
                    </div>
                    <span className="text-sm font-bold text-gray-900">{s.value} <span className="text-xs font-normal text-gray-400">({pct}%)</span></span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: s.color }} />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Métodos de pagamento */}
          {Object.keys(metodos).length > 0 && (
            <div className="mt-6 pt-5 border-t border-gray-50">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Métodos de Pagamento</p>
              <div className="space-y-2">
                {Object.entries(metodos).map(([met, qty]) => (
                  <div key={met} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 font-medium">{met}</span>
                    <span className="font-bold text-gray-900">{qty as number}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Distribuição por Semestre */}
      <div className="bg-white rounded-2xl shadow-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-gray-900">Distribuição por Manual</h3>
            <p className="text-xs text-gray-400 mt-0.5">{totalAlunos} alunos distribuídos</p>
          </div>
          <Award size={18} style={{ color: '#C8A35F' }} />
        </div>
        <BarChart data={semestreData} color="#4f46e5" />
      </div>

      {/* Receita pendente */}
      {receitaPendente > 0 && (
        <div className="bg-white rounded-2xl shadow-card p-5 border-l-4" style={{ borderColor: '#EF4444' }}>
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(239,68,68,0.1)' }}>
              <AlertCircle size={20} style={{ color: '#EF4444' }} />
            </div>
            <div className="flex-1">
              <p className="font-bold text-gray-900">Receita em Aberto</p>
              <p className="text-sm text-gray-500">{pendentes} pagamentos pendentes de {alunos.filter(a => pagamentos.filter(p => !p.pago).some(p => p.alunoId === a.id)).length} alunos</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-2xl font-black text-red-500">R$ {receitaPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              <p className="text-xs text-gray-400">a receber</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
