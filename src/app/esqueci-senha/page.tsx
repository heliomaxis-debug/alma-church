'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, ArrowLeft, CheckCircle, Copy, ExternalLink } from 'lucide-react'
import { api } from '@/lib/api'

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ resetUrl?: string; message: string } | null>(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) { setError('Informe o e-mail cadastrado.'); return }
    setLoading(true)
    setError('')
    try {
      const data = await api.auth.forgotPassword(email)
      setResult(data)
    } catch {
      setError('Ocorreu um erro. Verifique o e-mail e tente novamente.')
    }
    setLoading(false)
  }

  function handleCopy() {
    if (result?.resetUrl) {
      navigator.clipboard.writeText(result.resetUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f6fa] flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-card p-8">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow"
              style={{ background: 'linear-gradient(135deg, #C8A35F, #b08030)' }}>
              <CrossIcon />
            </div>
            <div>
              <p className="font-bold text-sm" style={{ color: '#071B34' }}>BTCP</p>
              <p className="text-xs" style={{ color: '#C8A35F' }}>Portal Acadêmico</p>
            </div>
          </div>

          {!result ? (
            <>
              <div className="mb-7">
                <h1 className="text-xl font-bold text-gray-900">Esqueceu sua senha?</h1>
                <p className="text-sm text-gray-400 mt-1.5">
                  Informe o e-mail cadastrado. Um link de redefinição será gerado.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    E-mail institucional
                  </label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="joao.silva@btcp.edu.br"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none transition-all"
                      onFocus={e => { e.currentTarget.style.borderColor = '#C8A35F'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(200,163,95,0.12)' }}
                      onBlur={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.boxShadow = '' }}
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                  style={{ background: 'linear-gradient(135deg, #C8A35F, #b08030)', color: '#071B34' }}>
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-navy-900/30 border-t-navy-900 rounded-full animate-spin" />
                  ) : 'Gerar link de redefinição'}
                </button>
              </form>
            </>
          ) : (
            /* Success state */
            <div className="space-y-5">
              <div className="flex flex-col items-center text-center py-2">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: 'rgba(22,163,74,0.1)' }}>
                  <CheckCircle size={32} className="text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Link gerado!</h2>
                <p className="text-sm text-gray-500 mt-1.5">{result.message}</p>
              </div>

              {result.resetUrl && (
                <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 space-y-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Link de redefinição
                  </p>
                  <p className="text-xs text-gray-700 break-all font-mono leading-relaxed bg-white border border-gray-100 rounded-lg p-3">
                    {result.resetUrl}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCopy}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all"
                      style={copied
                        ? { background: 'rgba(22,163,74,0.1)', color: '#16a34a' }
                        : { background: '#071B34', color: '#C8A35F' }}>
                      <Copy size={13} />
                      {copied ? 'Copiado!' : 'Copiar link'}
                    </button>
                    <a href={result.resetUrl}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-90"
                      style={{ background: 'rgba(200,163,95,0.1)', color: '#b08030' }}>
                      <ExternalLink size={13} />
                      Abrir link
                    </a>
                  </div>
                </div>
              )}

              <p className="text-[11px] text-gray-400 text-center">
                O link expira em 1 hora. Após redefinir a senha, todas as sessões ativas serão encerradas.
              </p>
            </div>
          )}

          {/* Back link */}
          <div className="mt-7 pt-5 border-t border-gray-100">
            <Link href="/" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors justify-center">
              <ArrowLeft size={14} /> Voltar para o login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function CrossIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="7.5" y="1" width="3" height="16" rx="1.2" fill="#071B34" />
      <rect x="1" y="6.5" width="16" height="3" rx="1.2" fill="#071B34" />
    </svg>
  )
}
