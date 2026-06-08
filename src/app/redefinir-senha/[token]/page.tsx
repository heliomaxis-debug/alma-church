'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Lock, CheckCircle, ArrowLeft } from 'lucide-react'
import { api } from '@/lib/api'

export default function RedefinirSenhaPage() {
  const { token } = useParams<{ token: string }>()
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [showCf, setShowCf] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!password || !confirm) { setError('Preencha todos os campos.'); return }
    if (password.length < 6) { setError('A senha deve ter pelo menos 6 caracteres.'); return }
    if (password !== confirm) { setError('As senhas não coincidem.'); return }

    setLoading(true)
    try {
      await api.auth.resetPassword(token, password)
      setSuccess(true)
      setTimeout(() => router.push('/'), 3000)
    } catch (err: any) {
      const body = err?.message ? JSON.parse(err.message.startsWith('{') ? err.message : '{}') : {}
      setError(body.error ?? 'Token inválido ou expirado. Solicite um novo link.')
    }
    setLoading(false)
  }

  const strength = password.length === 0 ? 0
    : password.length < 6 ? 1
    : password.length < 10 ? 2
    : /[A-Z]/.test(password) && /[0-9]/.test(password) ? 4 : 3

  const strengthLabel = ['', 'Fraca', 'Razoável', 'Boa', 'Forte']
  const strengthColor = ['', '#ef4444', '#f59e0b', '#22c55e', '#16a34a']

  return (
    <div className="min-h-screen bg-[#f5f6fa] flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
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

          {success ? (
            <div className="flex flex-col items-center text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(22,163,74,0.1)' }}>
                <CheckCircle size={32} className="text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Senha redefinida!</h2>
                <p className="text-sm text-gray-500 mt-1.5">
                  Sua senha foi atualizada com sucesso. Redirecionando para o login...
                </p>
              </div>
              <Link href="/"
                className="flex items-center gap-1.5 text-sm font-medium transition-colors hover:opacity-80"
                style={{ color: '#C8A35F' }}>
                Ir para o login agora
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-7">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: 'rgba(200,163,95,0.1)', color: '#C8A35F' }}>
                  <Lock size={22} />
                </div>
                <h1 className="text-xl font-bold text-gray-900">Redefinir senha</h1>
                <p className="text-sm text-gray-400 mt-1.5">
                  Crie uma nova senha segura para a sua conta.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Nova senha */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Nova senha</label>
                  <div className="relative">
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full px-4 py-3 pr-11 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none transition-all"
                      onFocus={e => { e.currentTarget.style.borderColor = '#C8A35F'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(200,163,95,0.12)' }}
                      onBlur={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.boxShadow = '' }}
                    />
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600">
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {/* Strength meter */}
                  {password.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} className="flex-1 h-1.5 rounded-full transition-all"
                            style={{ background: i <= strength ? strengthColor[strength] : '#e5e7eb' }} />
                        ))}
                      </div>
                      <p className="text-xs font-medium" style={{ color: strengthColor[strength] }}>
                        Força: {strengthLabel[strength]}
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirmar */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirmar nova senha</label>
                  <div className="relative">
                    <input
                      type={showCf ? 'text' : 'password'}
                      value={confirm}
                      onChange={e => setConfirm(e.target.value)}
                      placeholder="Repita a nova senha"
                      className="w-full px-4 py-3 pr-11 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none transition-all"
                      onFocus={e => { e.currentTarget.style.borderColor = '#C8A35F'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(200,163,95,0.12)' }}
                      onBlur={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.boxShadow = '' }}
                    />
                    <button type="button" onClick={() => setShowCf(!showCf)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600">
                      {showCf ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {confirm.length > 0 && password !== confirm && (
                    <p className="text-xs text-red-500 mt-1">As senhas não coincidem.</p>
                  )}
                  {confirm.length > 0 && password === confirm && (
                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                      <CheckCircle size={12} /> Senhas coincidem
                    </p>
                  )}
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-70 shadow-md"
                  style={{ background: 'linear-gradient(135deg, #C8A35F, #b08030)', color: '#071B34' }}>
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#071B34', borderTopColor: 'transparent' }} />
                  ) : 'Redefinir senha'}
                </button>
              </form>

              <div className="mt-6 pt-5 border-t border-gray-100">
                <Link href="/" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors justify-center">
                  <ArrowLeft size={14} /> Voltar para o login
                </Link>
              </div>
            </>
          )}
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
