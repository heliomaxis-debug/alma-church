'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import {
  Award, GraduationCap, Star, BookOpen, Users,
  Printer, Download, ShieldCheck,
} from 'lucide-react'

const tipoConfig = {
  conclusao:    { label: 'Certificado de Conclusão',     color: '#C8A35F', bg: 'rgba(200,163,95,0.1)',  icon: GraduationCap },
  participacao: { label: 'Certificado de Participação',  color: '#3B82F6', bg: 'rgba(59,130,246,0.1)',  icon: Users },
  extensao:     { label: 'Certificado de Extensão',      color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)',  icon: BookOpen },
  honra:        { label: 'Honra ao Mérito',              color: '#EF4444', bg: 'rgba(239,68,68,0.1)',   icon: Star },
}

function fmtDate(d: string) {
  if (!d) return ''
  const [y, m, day] = d.split('-')
  const meses = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro']
  return `${parseInt(day)} de ${meses[parseInt(m) - 1]} de ${y}`
}

function fmtDateShort(d: string) {
  if (!d) return '—'
  const [y, m, day] = d.split('-')
  return `${day}/${m}/${y}`
}

function CertificadoPrint({ cert, studentName, studentRa, studentCurso }: {
  cert: any; studentName: string; studentRa: string; studentCurso: string
}) {
  const cfg = tipoConfig[cert.tipo as keyof typeof tipoConfig] ?? tipoConfig.participacao

  return (
    <div
      id={`cert-print-${cert.id}`}
      className="bg-white border-2 rounded-2xl overflow-hidden"
      style={{ borderColor: '#C8A35F', fontFamily: 'Georgia, serif' }}
    >
      {/* Top accent bar */}
      <div className="h-2" style={{ background: 'linear-gradient(90deg, #C8A35F, #071B34, #C8A35F)' }} />

      <div className="p-8 sm:p-10">
        {/* Institution header */}
        <div className="flex items-center gap-4 mb-8 pb-6" style={{ borderBottom: '1px solid rgba(200,163,95,0.25)' }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md"
            style={{ background: 'linear-gradient(135deg, #C8A35F, #b08030)' }}>
            <svg width="22" height="22" viewBox="0 0 18 18" fill="none">
              <rect x="7.5" y="1" width="3" height="16" rx="1.2" fill="#071B34" />
              <rect x="1" y="6.5" width="16" height="3" rx="1.2" fill="#071B34" />
            </svg>
          </div>
          <div>
            <p className="font-bold text-lg" style={{ color: '#071B34', fontFamily: 'Georgia, serif' }}>Alma College</p>
            <p className="text-sm" style={{ color: '#C8A35F' }}>BTCP · Seminário Teológico</p>
          </div>
          <div className="ml-auto text-right hidden sm:block">
            <p className="text-xs" style={{ color: '#94A3B8' }}>Código de verificação</p>
            <p className="text-sm font-bold font-mono" style={{ color: '#071B34' }}>{cert.codigoVerif}</p>
          </div>
        </div>

        {/* Certificate label */}
        <div className="text-center mb-6">
          <p className="text-xs uppercase tracking-[0.3em] font-semibold mb-2" style={{ color: cfg.color }}>
            {cfg.label}
          </p>
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="h-px flex-1" style={{ background: 'linear-gradient(to right, transparent, rgba(200,163,95,0.4))' }} />
            <Award size={18} style={{ color: '#C8A35F' }} />
            <div className="h-px flex-1" style={{ background: 'linear-gradient(to left, transparent, rgba(200,163,95,0.4))' }} />
          </div>
        </div>

        {/* Main text */}
        <div className="text-center mb-6">
          <p className="text-sm mb-4" style={{ color: '#64748B' }}>Certificamos que</p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-1" style={{ color: '#071B34', fontFamily: 'Georgia, serif' }}>
            {studentName}
          </h2>
          <p className="text-xs mb-6" style={{ color: '#94A3B8' }}>RA: {studentRa} · {studentCurso}</p>

          <h3 className="text-xl sm:text-2xl font-bold mb-3" style={{ color: '#071B34', fontFamily: 'Georgia, serif' }}>
            {cert.titulo}
          </h3>

          {cert.descricao && (
            <p className="text-sm leading-relaxed max-w-lg mx-auto mb-4" style={{ color: '#475569' }}>
              {cert.descricao}
            </p>
          )}

          {cert.cargaHoraria && (
            <p className="text-sm font-semibold" style={{ color: '#64748B' }}>
              Carga horária: <span style={{ color: '#071B34' }}>{cert.cargaHoraria} horas</span>
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6" style={{ borderTop: '1px solid rgba(200,163,95,0.25)' }}>
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div>
              <div className="w-32 h-px mb-1" style={{ background: '#071B34' }} />
              <p className="text-xs font-semibold" style={{ color: '#071B34' }}>Direção Acadêmica</p>
              <p className="text-xs" style={{ color: '#94A3B8' }}>Alma College · BTCP</p>
            </div>
            <div className="text-center">
              <p className="text-[11px] mb-1" style={{ color: '#94A3B8' }}>Emitido em</p>
              <p className="text-sm font-semibold" style={{ color: '#071B34' }}>{fmtDate(cert.issueDate)}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1.5 justify-end mb-0.5">
                <ShieldCheck size={13} style={{ color: '#C8A35F' }} />
                <p className="text-[11px] font-semibold" style={{ color: '#C8A35F' }}>Documento autêntico</p>
              </div>
              <p className="text-[10px] font-mono" style={{ color: '#94A3B8' }}>{cert.codigoVerif}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom accent bar */}
      <div className="h-2" style={{ background: 'linear-gradient(90deg, #071B34, #C8A35F, #071B34)' }} />
    </div>
  )
}

export default function CertificadosPage() {
  const { user } = useAuth()
  const [certificados, setCertificados] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  const studentName = user?.aluno?.name ?? 'Aluno'
  const studentRa   = user?.aluno?.ra ?? '—'
  const studentCurso = user?.aluno?.curso ?? 'BTCP'

  useEffect(() => {
    api.aluno.certificados()
      .then(setCertificados)
      .catch(() => setCertificados([]))
      .finally(() => setLoading(false))
  }, [])

  function handlePrint(cert: any) {
    const el = document.getElementById(`cert-print-${cert.id}`)
    if (!el) return

    const printWin = window.open('', '_blank', 'width=900,height=700')
    if (!printWin) return

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <title>Certificado — ${cert.titulo}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,700;1,400&display=swap');
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { background: white; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 32px; }
            .cert { max-width: 820px; width: 100%; border: 2px solid #C8A35F; border-radius: 16px; overflow: hidden; font-family: Georgia, 'EB Garamond', serif; background: white; }
            .bar-top { height: 8px; background: linear-gradient(90deg, #C8A35F, #071B34, #C8A35F); }
            .bar-bottom { height: 8px; background: linear-gradient(90deg, #071B34, #C8A35F, #071B34); }
            .body { padding: 56px 64px; }
            .header { display: flex; align-items: center; gap: 20px; border-bottom: 1px solid rgba(200,163,95,0.3); padding-bottom: 28px; margin-bottom: 36px; }
            .logo-box { width: 56px; height: 56px; border-radius: 14px; background: linear-gradient(135deg, #C8A35F, #b08030); display: flex; align-items: center; justify-content: center; }
            .inst-name { font-size: 20px; font-weight: 700; color: #071B34; }
            .inst-sub { font-size: 13px; color: #C8A35F; }
            .code-box { margin-left: auto; text-align: right; }
            .code-label { font-size: 11px; color: #94A3B8; font-family: sans-serif; }
            .code-val { font-size: 13px; font-weight: 700; font-family: monospace; color: #071B34; }
            .type-label { text-align: center; font-size: 11px; letter-spacing: 0.3em; text-transform: uppercase; font-family: sans-serif; font-weight: 600; color: ${tipoConfig[(cert.tipo as keyof typeof tipoConfig)]?.color ?? '#C8A35F'}; margin-bottom: 12px; }
            .divider { display: flex; align-items: center; gap: 12px; margin-bottom: 28px; }
            .divider-line { flex: 1; height: 1px; background: linear-gradient(to right, transparent, rgba(200,163,95,0.4)); }
            .divider-line-r { flex: 1; height: 1px; background: linear-gradient(to left, transparent, rgba(200,163,95,0.4)); }
            .cert-center { text-align: center; }
            .pre-text { font-size: 14px; color: #64748B; margin-bottom: 16px; font-family: sans-serif; }
            .student-name { font-size: 36px; font-weight: 700; color: #071B34; margin-bottom: 4px; }
            .student-info { font-size: 12px; color: #94A3B8; margin-bottom: 28px; font-family: sans-serif; }
            .cert-title { font-size: 22px; font-weight: 700; color: #071B34; margin-bottom: 16px; }
            .cert-desc { font-size: 14px; line-height: 1.7; color: #475569; max-width: 500px; margin: 0 auto 16px; font-family: sans-serif; }
            .cert-hours { font-size: 14px; color: #64748B; font-family: sans-serif; }
            .cert-hours span { color: #071B34; font-weight: 600; }
            .footer { display: flex; align-items: flex-end; justify-content: space-between; border-top: 1px solid rgba(200,163,95,0.25); margin-top: 40px; padding-top: 24px; }
            .sig-line { width: 120px; height: 1px; background: #071B34; margin-bottom: 6px; }
            .sig-name { font-size: 12px; font-weight: 600; color: #071B34; font-family: sans-serif; }
            .sig-role { font-size: 11px; color: #94A3B8; font-family: sans-serif; }
            .footer-date-label { font-size: 11px; color: #94A3B8; font-family: sans-serif; text-align: center; margin-bottom: 4px; }
            .footer-date { font-size: 14px; font-weight: 600; color: #071B34; text-align: center; }
            .auth-badge { display: flex; align-items: center; gap: 6px; color: #C8A35F; font-size: 12px; font-weight: 600; font-family: sans-serif; margin-bottom: 4px; }
            .auth-code { font-size: 11px; font-family: monospace; color: #94A3B8; }
            @media print { body { padding: 0; } .cert { border-radius: 0; } @page { size: A4 landscape; margin: 1cm; } }
          </style>
        </head>
        <body>
          <div class="cert">
            <div class="bar-top"></div>
            <div class="body">
              <div class="header">
                <div class="logo-box">
                  <svg width="22" height="22" viewBox="0 0 18 18" fill="none">
                    <rect x="7.5" y="1" width="3" height="16" rx="1.2" fill="#071B34"/>
                    <rect x="1" y="6.5" width="16" height="3" rx="1.2" fill="#071B34"/>
                  </svg>
                </div>
                <div>
                  <p class="inst-name">Alma College</p>
                  <p class="inst-sub">BTCP · Seminário Teológico</p>
                </div>
                <div class="code-box">
                  <p class="code-label">Código de verificação</p>
                  <p class="code-val">${cert.codigoVerif}</p>
                </div>
              </div>

              <div class="type-label">${tipoConfig[(cert.tipo as keyof typeof tipoConfig)]?.label ?? 'Certificado'}</div>
              <div class="divider">
                <div class="divider-line"></div>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C8A35F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>
                <div class="divider-line-r"></div>
              </div>

              <div class="cert-center">
                <p class="pre-text">Certificamos que</p>
                <p class="student-name">${studentName}</p>
                <p class="student-info">RA: ${studentRa} · ${studentCurso}</p>
                <p class="cert-title">${cert.titulo}</p>
                ${cert.descricao ? `<p class="cert-desc">${cert.descricao}</p>` : ''}
                ${cert.cargaHoraria ? `<p class="cert-hours">Carga horária: <span>${cert.cargaHoraria} horas</span></p>` : ''}
              </div>

              <div class="footer">
                <div>
                  <div class="sig-line"></div>
                  <p class="sig-name">Direção Acadêmica</p>
                  <p class="sig-role">Alma College · BTCP</p>
                </div>
                <div>
                  <p class="footer-date-label">Emitido em</p>
                  <p class="footer-date">${fmtDate(cert.issueDate)}</p>
                </div>
                <div style="text-align:right">
                  <p class="auth-badge">✓ Documento autêntico</p>
                  <p class="auth-code">${cert.codigoVerif}</p>
                </div>
              </div>
            </div>
            <div class="bar-bottom"></div>
          </div>
          <script>window.onload = function(){ window.print(); }</script>
        </body>
      </html>
    `)
    printWin.document.close()
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">

      {/* Header */}
      <div className="rounded-2xl p-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #071B34 0%, #0d2d50 100%)' }}>
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #C8A35F 1px, transparent 0)', backgroundSize: '28px 28px' }} />
        <div className="relative z-10">
          <p className="text-white/50 text-sm">Minha Conta</p>
          <h2 className="text-2xl font-bold text-white mt-0.5">Meus Certificados</h2>
          <p className="text-white/40 text-sm mt-1">
            {certificados.length === 0
              ? 'Seus certificados de conclusão e participação'
              : `${certificados.length} certificado${certificados.length > 1 ? 's' : ''} emitido${certificados.length > 1 ? 's' : ''}`}
          </p>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: '#C8A35F', borderTopColor: 'transparent' }} />
        </div>
      ) : certificados.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-card py-24 text-center">
          <Award size={52} className="mx-auto mb-4 text-gray-200" />
          <p className="text-base font-semibold text-gray-400">Nenhum certificado ainda</p>
          <p className="text-sm text-gray-300 mt-1 max-w-xs mx-auto">
            Quando você concluir cursos ou participar de eventos, seus certificados aparecerão aqui
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {certificados.map(cert => {
            const cfg = tipoConfig[cert.tipo as keyof typeof tipoConfig] ?? tipoConfig.participacao
            const Icon = cfg.icon
            const isExpanded = expanded === cert.id

            return (
              <div key={cert.id} className="bg-white rounded-2xl shadow-card overflow-hidden">
                {/* Card header */}
                <div className="p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: cfg.bg, color: cfg.color }}>
                    <Icon size={22} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <h3 className="font-bold text-gray-900 text-sm">{cert.titulo}</h3>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: cfg.bg, color: cfg.color }}>
                        {cfg.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
                      <span>Emitido em {fmtDateShort(cert.issueDate)}</span>
                      {cert.cargaHoraria && <span>· {cert.cargaHoraria}h</span>}
                      <span className="flex items-center gap-1">
                        <ShieldCheck size={11} style={{ color: '#C8A35F' }} />
                        <span className="font-mono">{cert.codigoVerif}</span>
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handlePrint(cert)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-90"
                      style={{ background: '#071B34', color: '#C8A35F' }}>
                      <Printer size={13} /> Imprimir
                    </button>
                    <button
                      onClick={() => setExpanded(isExpanded ? null : cert.id)}
                      className="px-3 py-2 rounded-xl text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all">
                      {isExpanded ? 'Ocultar' : 'Visualizar'}
                    </button>
                  </div>
                </div>

                {/* Expanded certificate preview */}
                {isExpanded && (
                  <div className="px-5 pb-5">
                    <CertificadoPrint
                      cert={cert}
                      studentName={studentName}
                      studentRa={studentRa}
                      studentCurso={studentCurso}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Info footer */}
      {certificados.length > 0 && (
        <div className="bg-white rounded-2xl shadow-card p-4 flex items-start gap-3">
          <ShieldCheck size={18} className="flex-shrink-0 mt-0.5" style={{ color: '#C8A35F' }} />
          <div>
            <p className="text-xs font-semibold text-gray-700">Autenticidade garantida</p>
            <p className="text-xs text-gray-400 mt-0.5">
              Todos os certificados possuem código único de verificação. Em caso de dúvidas, entre em contato com a secretaria da Alma College.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
