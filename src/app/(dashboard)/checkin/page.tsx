'use client'

import { useEffect, useState, useCallback } from 'react'
import { CheckSquare, CheckCircle, Clock, XCircle, QrCode, Camera, RefreshCw, Loader2 } from 'lucide-react'
import { api } from '@/lib/api'

export default function CheckinPage() {
  const [checkins, setCheckins] = useState<any[]>([])
  const [matriculas, setMatriculas] = useState<any[]>([])
  const [scanning, setScanning] = useState(false)
  const [success, setSuccess] = useState(false)
  const [checkingIn, setCheckingIn] = useState<string | null>(null)
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null)

  const fetchAll = useCallback(async () => {
    const [c, n] = await Promise.all([
      api.aluno.checkins().catch(() => []),
      api.aluno.notas().catch(() => []),
    ])
    setCheckins(c)
    setMatriculas(n)
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const confirmed = checkins.filter(c => c.status === 'CONFIRMADO').length
  const absent = checkins.filter(c => c.status === 'AUSENTE').length

  async function handleCheckin(matriculaId: string) {
    setCheckingIn(matriculaId)
    try {
      await api.aluno.criarCheckin(matriculaId)
      setMsg({ text: 'Presença registrada com sucesso!', ok: true })
      await fetchAll()
    } catch (err: any) {
      const body = (() => { try { return JSON.parse(err?.message ?? '{}') } catch { return {} } })()
      setMsg({ text: body.error ?? 'Erro ao registrar presença.', ok: false })
    }
    setCheckingIn(null)
    setTimeout(() => setMsg(null), 4000)
  }

  // Scanner simula QR scan e faz check-in na primeira matrícula disponível
  function handleScan() {
    if (matriculas.length === 0) return
    setScanning(true)
    setTimeout(async () => {
      setScanning(false)
      const primeira = matriculas[0]
      if (primeira) {
        try {
          await api.aluno.criarCheckin(primeira.id)
          setSuccess(true)
          setMsg({ text: `Check-in em ${primeira.disciplina.name} confirmado!`, ok: true })
          await fetchAll()
        } catch {
          setMsg({ text: 'Erro ao registrar check-in via QR.', ok: false })
        }
        setTimeout(() => { setSuccess(false); setMsg(null) }, 4000)
      }
    }, 2000)
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      {/* Toast */}
      {msg && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-lg text-sm font-medium text-white flex items-center gap-2 ${msg.ok ? 'bg-green-600' : 'bg-red-500'}`}>
          {msg.ok && <CheckCircle size={15} />} {msg.text}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Check-ins Realizados', value: confirmed, icon: <CheckCircle size={18} />, color: '#16a34a', bg: 'rgba(22,163,74,0.08)' },
          { label: 'Total de Registros', value: checkins.length, icon: <Clock size={18} />, color: '#4f46e5', bg: 'rgba(79,70,229,0.08)' },
          { label: 'Ausências', value: absent, icon: <XCircle size={18} />, color: '#ef4444', bg: 'rgba(239,68,68,0.08)' },
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

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Scanner */}
        <div className="bg-white rounded-2xl shadow-card p-6 flex flex-col items-center gap-5">
          <div className="text-center">
            <h3 className="font-semibold text-gray-900">Fazer Check-in na Aula</h3>
            <p className="text-xs text-gray-400 mt-1">Escaneie o QR Code disponibilizado pelo professor</p>
          </div>

          <div
            className="relative w-52 h-52 rounded-2xl flex items-center justify-center transition-all duration-300"
            style={{
              background: success ? 'rgba(34,197,94,0.08)' : scanning ? 'rgba(200,163,95,0.05)' : 'rgba(7,27,52,0.03)',
              border: `2px ${scanning ? 'dashed' : 'solid'} ${success ? '#22c55e' : scanning ? '#C8A35F' : '#e5e7eb'}`,
            }}
          >
            {success ? (
              <div className="flex flex-col items-center gap-3">
                <CheckCircle size={48} className="text-green-500" />
                <div className="text-center">
                  <p className="text-sm font-bold text-green-600">Check-in Confirmado!</p>
                  <p className="text-xs text-gray-400 mt-0.5">Presença registrada com sucesso</p>
                </div>
              </div>
            ) : scanning ? (
              <div className="flex flex-col items-center gap-3">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 rounded-full border-4 border-transparent animate-spin" style={{ borderTopColor: '#C8A35F' }} />
                  <div className="absolute inset-2 flex items-center justify-center">
                    <QrCode size={28} style={{ color: '#C8A35F' }} />
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-600">Lendo QR Code...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="relative w-24 h-24">
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-gray-300 rounded-tl-lg" />
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-gray-300 rounded-tr-lg" />
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-gray-300 rounded-bl-lg" />
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-gray-300 rounded-br-lg" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <QrCode size={36} className="text-gray-300" />
                  </div>
                </div>
                <p className="text-xs text-gray-400 text-center">Posicione o QR Code aqui</p>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleScan}
              disabled={scanning || success || matriculas.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              style={{ background: '#071B34', color: '#C8A35F' }}
            >
              <Camera size={16} />
              {scanning ? 'Escaneando...' : 'Escanear QR Code'}
            </button>
            <button
              onClick={() => { setSuccess(false); setScanning(false) }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
            >
              <RefreshCw size={15} />
            </button>
          </div>

          <p className="text-[11px] text-gray-400 text-center max-w-xs">
            O professor exibirá um QR Code no início de cada aula. Você tem até 15 minutos para registrar sua presença.
          </p>
        </div>

        {/* Disciplines with check-in buttons */}
        <div className="bg-white rounded-2xl shadow-card p-6">
          <h3 className="font-semibold text-gray-900 mb-5">Disciplinas Matriculadas</h3>
          <div className="space-y-3">
            {matriculas.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-6">Sem disciplinas matriculadas.</p>
            )}
            {matriculas.map((m) => {
              const isLoading = checkingIn === m.id
              return (
                <div key={m.id} className="p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{m.disciplina?.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{m.disciplina?.professor}</p>
                      <p className="text-xs text-gray-400">{m.disciplina?.schedule} · {m.disciplina?.room || 'Sala —'}</p>
                    </div>
                    <button
                      onClick={() => handleCheckin(m.id)}
                      disabled={isLoading}
                      className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all hover:opacity-90 disabled:opacity-50"
                      style={{ background: 'rgba(200,163,95,0.1)', color: '#b08030' }}
                    >
                      {isLoading ? <Loader2 size={12} className="animate-spin" /> : <CheckSquare size={13} />}
                      Check-in
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* History */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50">
          <h3 className="font-semibold text-gray-900">Histórico de Presenças</h3>
        </div>
        <div className="divide-y divide-gray-50">
          {checkins.length === 0 ? (
            <div className="py-12 text-center">
              <CheckSquare size={36} className="mx-auto text-gray-200 mb-2" />
              <p className="text-sm text-gray-400">Nenhum check-in registrado ainda</p>
            </div>
          ) : (
            checkins.map((checkin) => {
              const ok = checkin.status === 'CONFIRMADO'
              return (
                <div key={checkin.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/60 transition-colors">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: ok ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', color: ok ? '#16a34a' : '#ef4444' }}
                  >
                    {ok ? <CheckCircle size={18} /> : <XCircle size={18} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{checkin.matricula?.disciplina?.name ?? '—'}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{checkin.matricula?.disciplina?.professor ?? ''}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-medium text-gray-700">{new Date(checkin.checkedAt).toLocaleDateString('pt-BR')}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{new Date(checkin.checkedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <span
                    className="text-[11px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ background: ok ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', color: ok ? '#16a34a' : '#ef4444' }}
                  >
                    {ok ? 'Confirmado' : 'Ausente'}
                  </span>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
