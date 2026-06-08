'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!email || !password) { setError('Preencha todos os campos.'); return }
    setLoading(true)
    try {
      const role = await login(email, password)
      if (role === 'PROFESSOR') router.push('/professor/dashboard')
      else if (role === 'ADMIN') router.push('/admin/dashboard')
      else router.push('/dashboard')
    } catch {
      setError('Email ou senha incorretos. Verifique suas credenciais.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #071B34 0%, #0d2d50 50%, #071B34 100%)' }}>
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full border border-white/5" />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full border border-white/5 translate-x-20 translate-y-20" />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #C8A35F 1px, transparent 0)', backgroundSize: '40px 40px' }} />

        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
              style={{ background: 'linear-gradient(135deg, #C8A35F, #b08030)' }}>
              <span className="text-xs font-black" style={{ color: '#071B34' }}>AC</span>
            </div>
            <div>
              <p className="text-white font-bold text-base leading-tight">Alma College</p>
              <p className="text-xs" style={{ color: 'rgba(200,163,95,0.7)' }}>Plataforma Educacional</p>
            </div>
          </Link>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="w-16 h-px" style={{ background: 'rgba(200,163,95,0.6)' }} />
          <h1 className="text-4xl font-bold text-white leading-tight">
            Formando pessoas,<br />
            <span style={{ color: '#C8A35F' }}>desenvolvendo propósitos.</span>
          </h1>
          <p className="text-base leading-relaxed max-w-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Acesse o portal acadêmico para gerenciar suas disciplinas, documentos, financeiro e muito mais.
          </p>
          <div className="p-5 rounded-2xl border" style={{ borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)' }}>
            <p className="text-sm font-serif italic leading-relaxed" style={{ color: 'rgba(255,255,255,0.8)' }}>
              "Toda a Escritura é inspirada por Deus e útil para o ensino, para a repreensão, para a correção e para a instrução na justiça."
            </p>
            <p className="text-xs mt-3 font-medium" style={{ color: '#C8A35F' }}>2 Timóteo 3:16</p>
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
            © 2026 Alma College · BTCP Seminário Teológico
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #C8A35F, #b08030)' }}>
              <span className="text-xs font-black" style={{ color: '#071B34' }}>AC</span>
            </div>
            <div>
              <p className="font-bold text-lg" style={{ color: '#071B34' }}>Alma College</p>
              <p className="text-xs" style={{ color: '#C8A35F' }}>BTCP · Seminário Teológico</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-1" style={{ color: '#071B34' }}>Bem-vindo de volta</h2>
            <p className="text-sm text-gray-400">Entre com suas credenciais para acessar o portal</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">E-mail institucional</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="joao.silva@btcp.edu.br"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm focus:outline-none transition-all placeholder:text-gray-300"
                onFocus={e => { e.target.style.boxShadow = '0 0 0 3px rgba(200,163,95,0.15)'; e.target.style.borderColor = '#C8A35F' }}
                onBlur={e => { e.target.style.boxShadow = ''; e.target.style.borderColor = '' }} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Senha</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm focus:outline-none transition-all placeholder:text-gray-300"
                  onFocus={e => { e.target.style.boxShadow = '0 0 0 3px rgba(200,163,95,0.15)'; e.target.style.borderColor = '#C8A35F' }}
                  onBlur={e => { e.target.style.boxShadow = ''; e.target.style.borderColor = '' }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 transition-colors">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 accent-gold-500" />
                <span className="text-sm text-gray-600">Lembrar-me</span>
              </label>
              <Link href="/esqueci-senha" className="text-sm font-medium transition-colors hover:opacity-80" style={{ color: '#C8A35F' }}>
                Esqueceu a senha?
              </Link>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">{error}</div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, #C8A35F, #b08030)', color: '#071B34' }}>
              {loading ? (
                <span className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'rgba(7,27,52,0.3)', borderTopColor: '#071B34' }} />
              ) : 'Acessar o Portal'}
            </button>
          </form>

          <div className="mt-6 pt-6 text-center border-t border-gray-100">
            <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
              ← Voltar para o site da Alma College
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
