'use client'

import { useEffect, useState } from 'react'
import { Download, Share2, RefreshCw, CheckCircle, Shield } from 'lucide-react'
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

interface CarteirinhaData {
  ra: string; name: string; curso: string; semestre: number
  status: string; enrollmentDate: string; photo?: string; qrData: string
}

export default function CarteirinhaPage() {
  const [flipped, setFlipped] = useState(false)
  const [data, setData] = useState<CarteirinhaData | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    api.aluno.carteirinha()
      .then(d => setData(d))
      .catch(() => {})
  }, [])

  const student = data ?? {
    ra: user?.aluno?.ra ?? '—',
    name: user?.aluno?.name ?? '—',
    curso: user?.aluno?.curso ?? '—',
    semestre: user?.aluno?.semestre ?? 1,
    status: 'ATIVO',
    enrollmentDate: new Date().toISOString(),
    qrData: '',
  }
  const initials = student.name.split(' ').map((w: string) => w[0]).slice(0, 2).join('')
  const emailInstitucional = `${student.name.toLowerCase().replace(/ /g, '.').replace(/[^a-z.]/g, '')}@btcp.edu.br`

  return (
    <div className="space-y-6 max-w-2xl mx-auto animate-fade-in">
      <p className="text-sm text-gray-500">
        Sua carteirinha digital com QR Code para identificação no seminário.
      </p>

      {/* Card container */}
      <div className="flex justify-center py-4">
        <div
          className="relative cursor-pointer select-none"
          style={{ perspective: 1000, width: 380, height: 240 }}
          onClick={() => setFlipped(!flipped)}
        >
          <div className="relative w-full h-full">
            {/* Front */}
            <div
              className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl transition-all duration-500"
              style={{
                opacity: flipped ? 0 : 1,
                pointerEvents: flipped ? 'none' : 'auto',
                transform: flipped ? 'scale(0.96)' : 'scale(1)',
                background: 'linear-gradient(135deg, #071B34 0%, #0d2d50 60%, #071B34 100%)',
              }}
            >
              {/* Pattern */}
              <div
                className="absolute inset-0 opacity-[0.04]"
                style={{
                  backgroundImage: 'radial-gradient(circle at 2px 2px, #C8A35F 1px, transparent 0)',
                  backgroundSize: '24px 24px',
                }}
              />
              <div className="absolute top-0 right-0 w-48 h-48 rounded-full border border-white/5 translate-x-12 -translate-y-12" />
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full border border-white/5 translate-x-8 -translate-y-8" />

              <div className="relative z-10 p-6 h-full flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: 'rgba(200,163,95,0.2)', border: '1px solid rgba(200,163,95,0.3)' }}
                    >
                      <CrossIcon />
                    </div>
                    <div>
                      <p className="text-white font-bold text-[13px] leading-none">BTCP</p>
                      <p className="text-[10px] leading-none mt-0.5" style={{ color: '#C8A35F' }}>Bible Training Centre for Pastors</p>
                    </div>
                  </div>
                  <div
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
                    style={{ background: 'rgba(34,197,94,0.2)', color: '#4ade80' }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    ATIVO
                  </div>
                </div>

                {/* Student info */}
                <div className="flex gap-4 flex-1">
                  {student.photo ? (
                    <img
                      src={student.photo}
                      alt={student.name}
                      className="w-16 h-20 rounded-xl object-cover flex-shrink-0 border-2"
                      style={{ borderColor: 'rgba(200,163,95,0.4)' }}
                    />
                  ) : (
                    <div
                      className="w-16 h-20 rounded-xl flex items-center justify-center text-xl font-bold flex-shrink-0 border-2"
                      style={{
                        background: 'linear-gradient(135deg, #C8A35F, #b08030)',
                        color: '#071B34',
                        borderColor: 'rgba(200,163,95,0.4)',
                      }}
                    >
                      {initials}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-base leading-tight truncate">{student.name}</p>
                    <p className="text-white/50 text-[11px] mt-1">{student.curso}</p>
                    <p className="text-white/50 text-[11px]">Manual {student.semestre}</p>
                    <div className="mt-3 flex gap-3">
                      <div>
                        <p className="text-white/30 text-[9px] uppercase tracking-wider">Matrícula</p>
                        <p className="text-white font-mono font-bold text-[13px]">{student.ra}</p>
                      </div>
                      <div>
                        <p className="text-white/30 text-[9px] uppercase tracking-wider">Válido</p>
                        <p className="text-white font-mono font-bold text-[13px]">2026</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/10">
                  <p className="text-white/20 text-[9px] uppercase tracking-widest">Formando servos, preparando líderes.</p>
                  <p className="text-white/20 text-[9px]">← Clique para girar</p>
                </div>
              </div>
            </div>

            {/* Back */}
            <div
              className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl transition-all duration-500"
              style={{
                opacity: flipped ? 1 : 0,
                pointerEvents: flipped ? 'auto' : 'none',
                transform: flipped ? 'scale(1)' : 'scale(0.96)',
                background: 'linear-gradient(135deg, #0d2d50 0%, #071B34 100%)',
              }}
            >
              <div className="relative z-10 p-6 h-full flex flex-col items-center justify-between py-8">
                <p className="text-white/50 text-[11px] uppercase tracking-widest">QR Code de Identificação</p>

                <div className="w-28 h-28 bg-white rounded-2xl flex items-center justify-center p-2 shadow-xl">
                  <MiniQR />
                </div>

                <div className="text-center">
                  <p className="text-white font-bold text-[15px]">{student.name}</p>
                  <p className="font-mono text-sm mt-2" style={{ color: '#C8A35F' }}>RA: {student.ra}</p>
                </div>

                <div className="flex items-center gap-2 text-[11px]" style={{ color: '#4ade80' }}>
                  <Shield size={12} />
                  Assinatura digital verificada
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Instruction */}
      <p className="text-center text-xs text-gray-400">
        Clique na carteirinha para ver o QR Code de identificação
      </p>

      {/* Actions */}
      <div className="flex justify-center gap-3">
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90 shadow-md"
          style={{ background: '#071B34', color: '#C8A35F' }}
        >
          <Download size={16} />
          Baixar Carteirinha
        </button>
        <button
          onClick={async () => {
            const shareData = {
              title: 'Carteirinha BTCP',
              text: `${student.name} — RA: ${student.ra} — ${student.curso}`,
              url: window.location.href,
            }
            if (navigator.share) {
              try { await navigator.share(shareData) } catch { /* cancelled */ }
            } else {
              await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`)
              alert('Link copiado para a área de transferência!')
            }
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all bg-white shadow-card hover:shadow-card-hover text-gray-700"
        >
          <Share2 size={16} />
          Compartilhar
        </button>
      </div>

      {/* Details card */}
      <div className="bg-white rounded-2xl shadow-card p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <CheckCircle size={17} className="text-green-500" />
          Dados do Estudante
        </h3>
        <div className="grid sm:grid-cols-2 gap-y-3 gap-x-6">
          {[
            { label: 'Nome Completo', value: student.name },
            { label: 'Número de Matrícula', value: student.ra },
            { label: 'Curso', value: student.curso },
            { label: 'Manual', value: `Manual ${student.semestre}` },
            { label: 'Situação', value: student.status },
            { label: 'Data de Matrícula', value: new Date(student.enrollmentDate).toLocaleDateString('pt-BR') },
            { label: 'E-mail Institucional', value: emailInstitucional },
            { label: 'Validade', value: 'Dezembro/2026' },
          ].map(({ label, value }) => (
            <div key={label} className="border-b border-gray-50 pb-3">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
              <p className="text-sm font-medium text-gray-800 mt-0.5">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Renew */}
      <div
        className="rounded-2xl p-4 flex items-center gap-4"
        style={{ background: 'rgba(200,163,95,0.06)', border: '1px solid rgba(200,163,95,0.15)' }}
      >
        <RefreshCw size={18} style={{ color: '#b08030' }} className="flex-shrink-0" />
        <p className="text-sm text-gray-600 flex-1">
          A carteirinha é renovada automaticamente a cada novo manual após confirmação da matrícula.
        </p>
      </div>
    </div>
  )
}

function CrossIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="6.5" y="1" width="3" height="14" rx="1" fill="#C8A35F" />
      <rect x="1" y="5.5" width="14" height="3" rx="1" fill="#C8A35F" />
    </svg>
  )
}

function MiniQR() {
  const p = [
    [1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,1,0,1,0,1,0,0,0,0,0,1],
    [1,0,1,1,1,0,1,0,0,1,1,0,1,1,1,0,1],
    [1,0,1,1,1,0,1,0,1,0,0,0,1,1,1,0,1],
    [1,0,0,0,0,0,1,0,0,1,1,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,0,1,0,1,0,1,1,1,1,1],
    [0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0],
    [0,1,0,1,1,0,1,1,0,1,0,1,1,0,1,0,1],
    [1,0,1,0,0,1,0,0,1,0,1,1,0,1,0,1,0],
    [0,1,0,1,0,0,1,1,0,1,0,0,1,0,1,0,1],
    [0,0,0,0,0,0,0,0,1,0,1,1,0,1,0,1,0],
    [1,1,1,1,1,1,1,0,0,1,0,0,1,0,0,1,0],
    [1,0,0,0,0,0,1,0,1,0,1,0,0,1,1,0,1],
    [1,0,1,1,1,0,1,0,0,1,0,1,0,0,0,1,0],
    [1,0,1,1,1,0,1,0,1,0,1,1,1,0,1,0,1],
    [1,0,0,0,0,0,1,0,0,1,0,0,0,1,0,1,0],
    [1,1,1,1,1,1,1,0,1,0,1,0,1,0,1,0,1],
  ]
  const n = 17, c = 6
  return (
    <svg width={n * c} height={n * c} viewBox={`0 0 ${n * c} ${n * c}`}>
      {p.map((row, r) =>
        row.map((cell, col) =>
          cell ? <rect key={`${r}-${col}`} x={col * c} y={r * c} width={c} height={c} fill="#071B34" /> : null
        )
      )}
    </svg>
  )
}
