'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'
import {
  ShieldCheck, ShieldX, GraduationCap, Users,
  BookOpen, Star, Calendar, Hash, Award, ArrowLeft,
} from 'lucide-react'

const tipoConfig: Record<string, { label: string; color: string; icon: any }> = {
  conclusao:    { label: 'Certificado de Conclusão',    color: '#C8A35F', icon: GraduationCap },
  participacao: { label: 'Certificado de Participação', color: '#3B82F6', icon: Users },
  extensao:     { label: 'Certificado de Extensão',     color: '#8B5CF6', icon: BookOpen },
  honra:        { label: 'Honra ao Mérito',             color: '#EF4444', icon: Star },
}

function fmtDate(d: string) {
  if (!d) return '—'
  const [y, m, day] = d.split('-')
  const meses = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro']
  return `${parseInt(day)} de ${meses[parseInt(m) - 1]} de ${y}`
}

export default function VerificarCertificadoPage() {
  const params = useParams()
  const codigo = (params?.codigo as string ?? '').toUpperCase()

  const [cert, setCert] = useState<any>(null)
  const [notFound, setNotFound] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!codigo) return
    api.public.verificarCertificado(codigo)
      .then(setCert)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [codigo])

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#f5f6fa' }}>
      {/* Navbar simples */}
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <img src="/logo-alma-church.png" alt="Alma Church"
            style={{ height: 40, width: 'auto', objectFit: 'contain', flexShrink: 0 }} />
          <div>
            <p className="font-bold text-sm" style={{ color: '#071B34' }}>Alma Church</p>
            <p className="text-[10px]" style={{ color: '#C8A35F' }}>Verificação de Certificado</p>
          </div>
        </div>
        <Link href="/" className="ml-auto flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft size={13} /> Voltar ao site
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">

          {loading && (
            <div className="text-center py-20">
              <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
                style={{ borderColor: '#C8A35F', borderTopColor: 'transparent' }} />
              <p className="text-sm text-gray-400">Verificando autenticidade...</p>
              <p className="text-xs text-gray-300 mt-1 font-mono">{codigo}</p>
            </div>
          )}

          {!loading && notFound && (
            <div className="bg-white rounded-2xl shadow-lg p-10 text-center border-2 border-red-100">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
                style={{ background: 'rgba(239,68,68,0.1)' }}>
                <ShieldX size={32} className="text-red-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Certificado não encontrado</h2>
              <p className="text-sm text-gray-500 mb-4">
                O código <span className="font-mono font-bold text-gray-700">{codigo}</span> não corresponde a nenhum certificado emitido pela Alma College.
              </p>
              <p className="text-xs text-gray-400 bg-gray-50 rounded-xl p-3">
                Se você acredita que este é um erro, entre em contato com a secretaria acadêmica da Alma College.
              </p>
            </div>
          )}

          {!loading && cert && (() => {
            const cfg = tipoConfig[cert.tipo] ?? tipoConfig.participacao
            const Icon = cfg.icon
            return (
              <div className="space-y-4">
                {/* Status badge */}
                <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-2xl px-5 py-3">
                  <ShieldCheck size={22} className="text-green-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-green-700">Certificado autêntico e válido</p>
                    <p className="text-xs text-green-600">Emitido oficialmente pela Alma College · BTCP Seminário Teológico</p>
                  </div>
                  <span className="ml-auto text-xs font-bold font-mono bg-green-100 text-green-700 px-3 py-1 rounded-lg">
                    {cert.codigoVerif}
                  </span>
                </div>

                {/* Certificate card */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden border-2" style={{ borderColor: '#C8A35F' }}>
                  {/* Top bar */}
                  <div className="h-2" style={{ background: 'linear-gradient(90deg, #C8A35F, #071B34, #C8A35F)' }} />

                  <div className="p-8">
                    {/* Header inst */}
                    <div className="flex items-center gap-3 mb-7 pb-5 border-b" style={{ borderColor: 'rgba(200,163,95,0.2)' }}>
                      <img src="/logo-alma-church.png" alt="Alma Church"
                        style={{ height: 48, width: 'auto', objectFit: 'contain', flexShrink: 0 }} />
                      <div>
                        <p className="font-bold text-base" style={{ color: '#071B34' }}>Alma Church</p>
                        <p className="text-xs" style={{ color: '#C8A35F' }}>Alma College · BTCP</p>
                      </div>
                    </div>

                    {/* Type + title */}
                    <div className="text-center mb-8">
                      <div className="flex items-center justify-center gap-2 mb-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                          style={{ background: `${cfg.color}15`, color: cfg.color }}>
                          <Icon size={17} />
                        </div>
                        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: cfg.color }}>
                          {cfg.label}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 mb-6">
                        <div className="h-px flex-1" style={{ background: 'linear-gradient(to right, transparent, rgba(200,163,95,0.3))' }} />
                        <Award size={16} style={{ color: '#C8A35F' }} />
                        <div className="h-px flex-1" style={{ background: 'linear-gradient(to left, transparent, rgba(200,163,95,0.3))' }} />
                      </div>

                      <p className="text-sm text-gray-500 mb-2">Certificamos que</p>
                      <h2 className="text-3xl font-bold mb-1" style={{ color: '#071B34', fontFamily: 'Georgia, serif' }}>
                        {cert.alunoName}
                      </h2>
                      <p className="text-xs text-gray-400 mb-5">RA: {cert.alunoRa} · {cert.alunoCurso}</p>

                      <h3 className="text-xl font-bold mb-3" style={{ color: '#071B34', fontFamily: 'Georgia, serif' }}>
                        {cert.titulo}
                      </h3>

                      {cert.descricao && (
                        <p className="text-sm text-gray-500 leading-relaxed max-w-md mx-auto mb-3">
                          {cert.descricao}
                        </p>
                      )}
                    </div>

                    {/* Details grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                      <div className="bg-gray-50 rounded-xl p-3 text-center">
                        <Calendar size={14} className="mx-auto mb-1 text-gray-400" />
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Emissão</p>
                        <p className="text-xs font-semibold text-gray-700">{fmtDate(cert.issueDate)}</p>
                      </div>
                      {cert.cargaHoraria && (
                        <div className="bg-gray-50 rounded-xl p-3 text-center">
                          <Award size={14} className="mx-auto mb-1 text-gray-400" />
                          <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Carga Horária</p>
                          <p className="text-xs font-semibold text-gray-700">{cert.cargaHoraria} horas</p>
                        </div>
                      )}
                      <div className="bg-gray-50 rounded-xl p-3 text-center">
                        <Hash size={14} className="mx-auto mb-1 text-gray-400" />
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Código</p>
                        <p className="text-xs font-bold font-mono text-gray-700">{cert.codigoVerif}</p>
                      </div>
                    </div>

                    {/* Signature */}
                    <div className="flex items-end justify-between pt-4 border-t" style={{ borderColor: 'rgba(200,163,95,0.2)' }}>
                      <div>
                        <div className="w-28 h-px mb-1" style={{ background: '#071B34' }} />
                        <p className="text-[11px] font-semibold" style={{ color: '#071B34' }}>Direção Acadêmica</p>
                        <p className="text-[10px] text-gray-400">Alma College · BTCP</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1.5 justify-end mb-0.5">
                          <ShieldCheck size={12} style={{ color: '#C8A35F' }} />
                          <p className="text-[11px] font-semibold" style={{ color: '#C8A35F' }}>Verificado</p>
                        </div>
                        <p className="text-[10px] text-gray-400">Verificado em {new Date().toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>
                  </div>

                  {/* Bottom bar */}
                  <div className="h-2" style={{ background: 'linear-gradient(90deg, #071B34, #C8A35F, #071B34)' }} />
                </div>

                {/* Footer info */}
                <p className="text-center text-xs text-gray-400 pb-4">
                  Esta verificação confirma a autenticidade do documento. Emissão digital pela Alma College — BTCP Seminário Teológico.
                </p>
              </div>
            )
          })()}
        </div>
      </main>
    </div>
  )
}
