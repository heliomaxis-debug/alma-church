'use client'

import { useEffect, useState } from 'react'
import { Users, BookOpen, FolderOpen, ClipboardList, TrendingUp, Award, ChevronRight } from 'lucide-react'
import { api } from '@/lib/api'
import Link from 'next/link'

export default function ProfessorDashboard() {
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    api.professor.dashboard().then(setData).catch(() => {})
  }, [])

  const stats = [
    { label: 'Total de Alunos', value: data?.totalAlunos ?? '—', icon: <Users size={18} />, color: '#4f46e5', bg: 'rgba(79,70,229,0.08)' },
    { label: 'Disciplinas', value: data?.totalDisciplinas ?? '—', icon: <BookOpen size={18} />, color: '#C8A35F', bg: 'rgba(200,163,95,0.08)' },
    { label: 'Materiais', value: data?.totalMateriais ?? '—', icon: <FolderOpen size={18} />, color: '#16a34a', bg: 'rgba(22,163,74,0.08)' },
    { label: 'Solicitações Pendentes', value: data?.solicitacoesPendentes ?? '—', icon: <ClipboardList size={18} />, color: '#ef4444', bg: 'rgba(239,68,68,0.08)' },
  ]

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      {/* Welcome */}
      <div className="rounded-2xl p-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #071B34 0%, #0d2d50 100%)' }}>
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #C8A35F 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div className="relative z-10">
          <p className="text-white/50 text-sm">Bem-vindo de volta,</p>
          <h2 className="text-2xl font-bold text-white mt-0.5">{data?.prof?.name ?? 'Professor'}</h2>
          <p className="text-white/40 text-sm mt-1">{data?.prof?.title ?? 'Docente BTCP'}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 shadow-card">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{s.label}</p>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Disciplinas */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Disciplinas Ativas</h3>
          <Link href="/professor/turmas" className="text-xs font-medium flex items-center gap-1 hover:opacity-80 transition-opacity" style={{ color: '#C8A35F' }}>
            Ver todas <ChevronRight size={14} />
          </Link>
        </div>
        <div className="divide-y divide-gray-50">
          {!data?.disciplinas?.length ? (
            <div className="py-12 text-center">
              <BookOpen size={36} className="mx-auto text-gray-200 mb-2" />
              <p className="text-sm text-gray-400">Nenhuma disciplina encontrada</p>
            </div>
          ) : (
            data.disciplinas.map((d: any) => (
              <Link key={d.id} href={`/professor/turmas/${d.id}`}
                className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/70 transition-colors">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(200,163,95,0.1)', color: '#C8A35F' }}>
                  <BookOpen size={17} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{d.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{d.code} · {d.schedule} · {d.room}</p>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0 text-right">
                  <div>
                    <p className="text-sm font-bold text-gray-900">{d.totalAlunos}</p>
                    <p className="text-[11px] text-gray-400">alunos</p>
                  </div>
                  <ChevronRight size={16} className="text-gray-300" />
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: 'Lançar Notas', desc: 'Registre avaliações dos alunos', href: '/professor/turmas', icon: <Award size={20} />, color: '#4f46e5' },
          { label: 'Adicionar Material', desc: 'Envie apostilas e vídeos', href: '/professor/materiais', icon: <FolderOpen size={20} />, color: '#16a34a' },
          { label: 'Ver Solicitações', desc: 'Revisões de nota pendentes', href: '/professor/solicitacoes', icon: <ClipboardList size={20} />, color: '#ef4444' },
        ].map((a) => (
          <Link key={a.href} href={a.href}
            className="bg-white rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-all duration-200 hover:-translate-y-0.5 flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${a.color}14`, color: a.color }}>
              {a.icon}
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">{a.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{a.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
