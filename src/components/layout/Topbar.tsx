'use client'

import { Bell, Search, Menu, Sun, Moon } from 'lucide-react'
import { useSidebar } from '@/contexts/SidebarContext'
import { useAuth } from '@/contexts/AuthContext'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Visão geral da sua jornada acadêmica' },
  '/notas': { title: 'Notas e Faltas', subtitle: 'Acompanhe seu desempenho acadêmico' },
  '/financeiro': { title: 'Financeiro', subtitle: 'Gerencie seus pagamentos e mensalidades' },
  '/calendario': { title: 'Calendário Acadêmico', subtitle: 'Eventos, provas e datas importantes' },
  '/documentos': { title: 'Documentos Digitais', subtitle: 'Seus documentos organizados em um só lugar' },
  '/solicitacoes': { title: 'Solicitações', subtitle: 'Requerimentos e pedidos acadêmicos' },
  '/carteirinha': { title: 'Carteirinha Digital', subtitle: 'Sua identificação estudantil digital' },
  '/materiais': { title: 'Materiais do Portal', subtitle: 'Apostilas, vídeos e conteúdos das disciplinas' },
  '/checkin': { title: 'Check-in na Aula', subtitle: 'Registre sua presença com QR Code' },
  '/comunicados': { title: 'Comunicados', subtitle: 'Avisos e informações dos seus professores' },
  '/certificados': { title: 'Meus Certificados', subtitle: 'Certificados de conclusão e participação' },
  '/biblioteca': { title: 'Biblioteca', subtitle: 'Acervo digital e recursos teológicos' },
  '/eventos': { title: 'Eventos', subtitle: 'Agenda e calendário acadêmico' },
  '/comunidade': { title: 'Comunidade', subtitle: 'Feed e interação da turma' },
  '/perfil': { title: 'Meu Perfil', subtitle: 'Gerencie suas informações pessoais' },
  '/configuracoes': { title: 'Configurações', subtitle: 'Preferências e segurança da conta' },
}

interface TopbarProps {
  pathname: string
}

export function Topbar({ pathname }: TopbarProps) {
  const { collapsed, setMobileOpen } = useSidebar()
  const { user } = useAuth()
  const [darkMode, setDarkMode] = useState(false)
  const [showNotifs, setShowNotifs] = useState(false)
  const [isLg, setIsLg] = useState(false)

  useEffect(() => {
    const check = () => setIsLg(window.innerWidth >= 1024)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Inicializa dark mode do localStorage
  useEffect(() => {
    const saved = localStorage.getItem('btcp_darkmode')
    if (saved === 'true' || document.documentElement.classList.contains('dark')) {
      setDarkMode(true)
    }
  }, [])

  // Aplica/remove classe dark no <html>
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('btcp_darkmode', 'true')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('btcp_darkmode', 'false')
    }
  }, [darkMode])

  const page = pageTitles[pathname] ?? { title: 'BTCP Portal', subtitle: 'Bible Training Centre for Pastors' }


  return (
    <header
      className="fixed top-0 right-0 h-16 bg-white border-b border-gray-100 flex items-center px-4 sm:px-6 z-30 transition-all duration-300 shadow-topbar"
      style={{ left: isLg ? (collapsed ? 72 : 260) : 0 }}
    >
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden mr-3 p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
      >
        <Menu size={20} />
      </button>

      {/* Page title */}
      <div className="flex-1 min-w-0">
        <h1 className="text-[15px] font-semibold text-gray-900 truncate">{page.title}</h1>
        <p className="text-[11px] text-gray-400 truncate hidden sm:block">{page.subtitle}</p>
      </div>

      {/* Search */}
      <div className="hidden md:flex items-center mx-4">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar..."
            className="pl-8 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[13px] text-gray-700 w-48 focus:outline-none transition-all duration-300 placeholder:text-gray-300"
            onFocus={(e) => { e.currentTarget.style.boxShadow = '0 0 0 3px rgba(200,163,95,0.15)'; e.currentTarget.style.borderColor = '#C8A35F' }}
            onBlur={(e) => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.borderColor = '' }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Dark mode */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-500 hidden sm:flex"
        >
          {darkMode ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-500 relative"
          >
            <Bell size={17} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full border-2 border-white animate-pulse-gold" style={{ backgroundColor: '#C8A35F' }} />
          </button>

          {showNotifs && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-card-hover border border-gray-100 overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-900">Notificações</p>
                <span className="text-[11px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">3 novas</span>
              </div>
              {[
                { title: 'Boleto de Junho disponível', time: 'há 2h', dot: '#C8A35F' },
                { title: 'Novo material em AT I', time: 'há 5h', dot: '#22c55e' },
                { title: 'Semana de Teologia – 16/06', time: 'ontem', dot: '#3b82f6' },
              ].map((n, i) => (
                <div key={i} className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors flex items-start gap-3 border-b border-gray-50 last:border-none">
                  <span className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: n.dot }} />
                  <div>
                    <p className="text-[13px] text-gray-800 font-medium">{n.title}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{n.time}</p>
                  </div>
                </div>
              ))}
              <div className="px-4 py-2.5 text-center">
                <button className="text-[12px] font-medium" style={{ color: '#C8A35F' }}>Ver todas as notificações</button>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Click outside to close dropdowns */}
      {showNotifs && (
        <div className="fixed inset-0 z-40" onClick={() => setShowNotifs(false)} />
      )}
    </header>
  )
}
