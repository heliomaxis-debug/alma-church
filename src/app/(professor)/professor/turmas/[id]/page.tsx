'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import {
  ArrowLeft, Users, BookOpen, CheckCircle, XCircle,
  Save, Award, UserCheck, ChevronDown, ChevronUp,
} from 'lucide-react'
import { api } from '@/lib/api'
import Link from 'next/link'

export default function TurmaDetalhePage() {
  const { id } = useParams<{ id: string }>()
  const [turma, setTurma] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [notaForm, setNotaForm] = useState<Record<string, Record<number, string>>>({})
  const [saving, setSaving] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  useEffect(() => {
    api.professor.turma(id)
      .then(d => { setTurma(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [id])

  async function salvarNota(matriculaId: string, numero: number) {
    const valor = parseFloat(notaForm[matriculaId]?.[numero] ?? '')
    if (isNaN(valor) || valor < 0 || valor > 10) return
    setSaving(`${matriculaId}-${numero}`)
    try {
      await api.professor.lancarNota({ matriculaId, numero, valor })
      setSuccessMsg(`Nota ${numero} salva!`)
      setTimeout(() => setSuccessMsg(null), 2500)
      // refresh turma
      const updated = await api.professor.turma(id)
      setTurma(updated)
    } catch {}
    setSaving(null)
  }

  async function registrarPresenca(matriculaId: string, status: 'CONFIRMADO' | 'AUSENTE') {
    try {
      await api.professor.registrarPresenca({ matriculaId, status })
      setSuccessMsg(status === 'CONFIRMADO' ? 'Presença registrada!' : 'Ausência registrada!')
      setTimeout(() => setSuccessMsg(null), 2500)
      const updated = await api.professor.turma(id)
      setTurma(updated)
    } catch {}
  }

  function situacaoStyle(s: string) {
    if (s === 'APROVADO') return { bg: 'rgba(22,163,74,0.1)', color: '#16a34a', label: 'Aprovado' }
    if (s === 'RECUPERACAO') return { bg: 'rgba(234,179,8,0.1)', color: '#ca8a04', label: 'Recuperação' }
    if (s === 'REPROVADO') return { bg: 'rgba(239,68,68,0.1)', color: '#ef4444', label: 'Reprovado' }
    return { bg: 'rgba(107,114,128,0.1)', color: '#6b7280', label: 'Sem nota' }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#C8A35F', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  if (!turma) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Disciplina não encontrada</p>
        <Link href="/professor/turmas" className="text-sm mt-2 inline-block" style={{ color: '#C8A35F' }}>Voltar</Link>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div>
        <Link href="/professor/turmas" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 mb-3 transition-colors">
          <ArrowLeft size={15} /> Voltar para Turmas
        </Link>
        <div className="bg-white rounded-2xl shadow-card p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(200,163,95,0.12)', color: '#C8A35F' }}>
              <BookOpen size={22} />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">{turma.name}</h2>
              <p className="text-sm text-gray-400 mt-0.5">{turma.code} · {turma.credits} créditos · {turma.schedule} · Sala {turma.room}</p>
              <div className="flex items-center gap-4 mt-3">
                <span className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Users size={13} /> {turma.alunos?.length ?? 0} alunos
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success toast */}
      {successMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-green-600 text-white px-5 py-3 rounded-2xl shadow-lg flex items-center gap-2 text-sm font-medium">
          <CheckCircle size={16} /> {successMsg}
        </div>
      )}

      {/* Alunos */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
          <Users size={16} style={{ color: '#C8A35F' }} />
          <h3 className="font-semibold text-gray-900">Lista de Alunos</h3>
        </div>

        {turma.alunos?.length === 0 ? (
          <div className="py-12 text-center">
            <Users size={36} className="mx-auto text-gray-200 mb-2" />
            <p className="text-sm text-gray-400">Nenhum aluno matriculado</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {turma.alunos?.map((aluno: any) => {
              const situ = situacaoStyle(aluno.situacao)
              const isOpen = expanded === aluno.matriculaId
              return (
                <div key={aluno.matriculaId}>
                  {/* Row */}
                  <button
                    onClick={() => setExpanded(isOpen ? null : aluno.matriculaId)}
                    className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-50/60 transition-colors text-left">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold"
                      style={{ background: 'rgba(200,163,95,0.1)', color: '#b08030' }}>
                      {aluno.name.split(' ').map((w: string) => w[0]).slice(0, 2).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{aluno.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">RA: {aluno.ra}</p>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold text-gray-900">{aluno.media !== null ? aluno.media.toFixed(1) : '—'}</p>
                        <p className="text-[11px] text-gray-400">média</p>
                      </div>
                      <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold text-gray-900">{aluno.presencas}</p>
                        <p className="text-[11px] text-gray-400">presenças</p>
                      </div>
                      <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full hidden sm:inline-flex"
                        style={{ background: situ.bg, color: situ.color }}>{situ.label}</span>
                      {isOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                    </div>
                  </button>

                  {/* Expanded panel */}
                  {isOpen && (
                    <div className="px-6 pb-5 bg-gray-50/60">
                      <div className="grid sm:grid-cols-2 gap-6 pt-4">
                        {/* Notas */}
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <Award size={14} style={{ color: '#C8A35F' }} />
                            <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Lançar Notas</p>
                          </div>
                          <div className="space-y-2">
                            {[1, 2, 3].map((n) => {
                              const existing = aluno.notas?.find((nt: any) => nt.numero === n)
                              const key = `${aluno.matriculaId}-${n}`
                              return (
                                <div key={n} className="flex items-center gap-2">
                                  <label className="text-xs text-gray-500 w-12 flex-shrink-0">Nota {n}</label>
                                  <input
                                    type="number"
                                    min="0"
                                    max="10"
                                    step="0.1"
                                    defaultValue={existing?.valor ?? ''}
                                    placeholder={existing?.valor !== undefined ? String(existing.valor) : '0–10'}
                                    onChange={e => setNotaForm(f => ({
                                      ...f,
                                      [aluno.matriculaId]: { ...(f[aluno.matriculaId] ?? {}), [n]: e.target.value }
                                    }))}
                                    className="flex-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none"
                                    onFocus={e => { e.currentTarget.style.borderColor = '#C8A35F'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(200,163,95,0.12)' }}
                                    onBlur={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.boxShadow = '' }}
                                  />
                                  <button
                                    onClick={() => salvarNota(aluno.matriculaId, n)}
                                    disabled={saving === key}
                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
                                    style={{ background: '#071B34', color: '#C8A35F' }}>
                                    {saving === key ? (
                                      <span className="w-3 h-3 border-2 border-t-transparent rounded-full animate-spin inline-block" style={{ borderColor: '#C8A35F', borderTopColor: 'transparent' }} />
                                    ) : (
                                      <Save size={12} />
                                    )}
                                  </button>
                                </div>
                              )
                            })}
                          </div>
                        </div>

                        {/* Presença */}
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <UserCheck size={14} style={{ color: '#C8A35F' }} />
                            <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Registrar Presença</p>
                          </div>
                          <div className="grid grid-cols-2 gap-2 mb-3">
                            <div className="bg-white rounded-xl p-3 text-center border border-gray-100">
                              <p className="text-xl font-bold text-green-600">{aluno.presencas}</p>
                              <p className="text-[11px] text-gray-400 mt-0.5">Presenças</p>
                            </div>
                            <div className="bg-white rounded-xl p-3 text-center border border-gray-100">
                              <p className="text-xl font-bold text-red-500">{aluno.faltas}</p>
                              <p className="text-[11px] text-gray-400 mt-0.5">Faltas</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => registrarPresenca(aluno.matriculaId, 'CONFIRMADO')}
                              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-90"
                              style={{ background: 'rgba(22,163,74,0.1)', color: '#16a34a' }}>
                              <CheckCircle size={13} /> Presente
                            </button>
                            <button
                              onClick={() => registrarPresenca(aluno.matriculaId, 'AUSENTE')}
                              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-90"
                              style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
                              <XCircle size={13} /> Ausente
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
