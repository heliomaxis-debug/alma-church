'use client'

import { useEffect, useState, useCallback } from 'react'
import { CheckSquare, CheckCircle, Clock, XCircle, MapPin, Navigation, Loader2, AlertTriangle } from 'lucide-react'
import { api } from '@/lib/api'

/** Pega a localização atual do dispositivo. Resolve {lat,lng} ou rejeita com mensagem amigável. */
function getGeo(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('Seu dispositivo não suporta geolocalização.')); return
    }
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      err => {
        if (err.code === err.PERMISSION_DENIED) reject(new Error('Permita o acesso à localização para registrar presença.'))
        else if (err.code === err.POSITION_UNAVAILABLE) reject(new Error('Não foi possível obter sua localização. Tente novamente.'))
        else if (err.code === err.TIMEOUT) reject(new Error('Tempo esgotado ao obter localização. Tente novamente.'))
        else reject(new Error('Erro ao obter localização.'))
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    )
  })
}

export default function CheckinPage() {
  const [checkins, setCheckins] = useState<any[]>([])
  const [matriculas, setMatriculas] = useState<any[]>([])
  const [checkingIn, setCheckingIn] = useState<string | null>(null)
  const [locating, setLocating] = useState(false)
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

  function flash(text: string, ok: boolean) {
    setMsg({ text, ok })
    if (ok) setTimeout(() => setMsg(null), 6000)  // sucesso some sozinho; erro fica até nova tentativa
  }

  async function handleCheckin(matriculaId: string) {
    setMsg(null)
    setCheckingIn(matriculaId)
    setLocating(true)
    try {
      const geo = await getGeo()
      setLocating(false)
      await api.aluno.criarCheckin(matriculaId, geo)
      flash('✅ Presença registrada com sucesso! Você está no local.', true)
      await fetchAll()
    } catch (err: any) {
      setLocating(false)
      // erro de geolocalização (Error nativo) ou erro da API (JSON)
      const apiErr = (() => { try { return JSON.parse(err?.message ?? '{}') } catch { return null } })()
      flash(apiErr?.error ?? err?.message ?? 'Erro ao registrar presença.', false)
    }
    setCheckingIn(null)
  }

  // Registro rápido: usa o manual mais recente (maior semestre)
  const manualAtual = matriculas.length
    ? [...matriculas].sort((a, b) => (b.semester ?? b.disciplina?.semester ?? 0) - (a.semester ?? a.disciplina?.semester ?? 0))[0]
    : null

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Presenças', value: confirmed, icon: <CheckCircle size={18} />, color: '#16a34a', bg: 'rgba(22,163,74,0.08)' },
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

      {/* Card principal: Presença por localização */}
      <div className="rounded-2xl shadow-card p-8 text-center" style={{ background: 'linear-gradient(135deg, #071B34, #0d2d50)' }}>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
          style={{ background: 'rgba(200,163,95,0.15)', border: '1px solid rgba(200,163,95,0.3)' }}>
          <MapPin size={30} style={{ color: '#C8A35F' }} />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Registrar Presença</h3>
        <p className="text-sm mb-1 max-w-md mx-auto" style={{ color: 'rgba(255,255,255,0.6)' }}>
          A presença é confirmada pela sua <strong style={{ color: '#C8A35F' }}>localização</strong>.
          Você precisa estar fisicamente na igreja.
        </p>
        {manualAtual && (
          <p className="text-xs mb-6" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Registrando em: <strong>{manualAtual.disciplina?.name}</strong>
          </p>
        )}

        <button
          onClick={() => manualAtual && handleCheckin(manualAtual.id)}
          disabled={!manualAtual || checkingIn !== null}
          className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl font-bold text-sm transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: 'linear-gradient(135deg, #C8A35F, #b08030)', color: '#071B34' }}>
          {checkingIn ? (
            <>
              <Loader2 size={17} className="animate-spin" />
              {locating ? 'Obtendo localização...' : 'Registrando...'}
            </>
          ) : (
            <>
              <Navigation size={17} /> Registrar minha presença
            </>
          )}
        </button>

        {/* Alerta de resultado — destacado dentro do card */}
        {msg ? (
          <div className="mt-6 mx-auto max-w-md rounded-2xl px-5 py-4 flex items-center gap-3 text-left animate-fade-in"
            style={msg.ok
              ? { background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.4)' }
              : { background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)' }}>
            {msg.ok
              ? <CheckCircle size={24} className="flex-shrink-0" style={{ color: '#4ade80' }} />
              : <AlertTriangle size={24} className="flex-shrink-0" style={{ color: '#f87171' }} />}
            <p className="text-sm font-medium" style={{ color: msg.ok ? '#bbf7d0' : '#fecaca' }}>{msg.text}</p>
          </div>
        ) : (
          <p className="text-[11px] mt-5 max-w-xs mx-auto" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Ao tocar no botão, seu navegador pedirá permissão de localização. Toque em "Permitir".
          </p>
        )}
      </div>

      {/* Lista de manuais (presença individual) */}
      {matriculas.length > 1 && (
        <div className="bg-white rounded-2xl shadow-card p-6">
          <h3 className="font-semibold text-gray-900 mb-1">Registrar em outro manual</h3>
          <p className="text-xs text-gray-400 mb-5">Selecione o manual específico para registrar presença.</p>
          <div className="space-y-3">
            {matriculas.map((m) => {
              const isLoading = checkingIn === m.id
              return (
                <div key={m.id} className="p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{m.disciplina?.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{m.disciplina?.professor ?? ''}</p>
                    </div>
                    <button
                      onClick={() => handleCheckin(m.id)}
                      disabled={checkingIn !== null}
                      className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all hover:opacity-90 disabled:opacity-50"
                      style={{ background: 'rgba(200,163,95,0.1)', color: '#b08030' }}>
                      {isLoading ? <Loader2 size={12} className="animate-spin" /> : <MapPin size={13} />}
                      Presença
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Histórico */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50">
          <h3 className="font-semibold text-gray-900">Histórico de Presenças</h3>
        </div>
        <div className="divide-y divide-gray-50">
          {checkins.length === 0 ? (
            <div className="py-12 text-center">
              <CheckSquare size={36} className="mx-auto text-gray-200 mb-2" />
              <p className="text-sm text-gray-400">Nenhuma presença registrada ainda</p>
            </div>
          ) : (
            checkins.map((checkin) => {
              const ok = checkin.status === 'CONFIRMADO'
              return (
                <div key={checkin.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/60 transition-colors">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: ok ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', color: ok ? '#16a34a' : '#ef4444' }}>
                    {ok ? <CheckCircle size={18} /> : <XCircle size={18} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{checkin.matricula?.disciplina?.name ?? '—'}</p>
                    {checkin.distancia != null && (
                      <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                        <MapPin size={10} /> {Math.round(checkin.distancia)}m do local
                      </p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-medium text-gray-700">{new Date(checkin.checkedAt).toLocaleDateString('pt-BR')}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{new Date(checkin.checkedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ background: ok ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', color: ok ? '#16a34a' : '#ef4444' }}>
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
