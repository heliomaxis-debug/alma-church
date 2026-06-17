'use client'

import { useEffect, useState, useCallback } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard, Users, CreditCard, ClipboardList, BookOpen,
  LogOut, ChevronLeft, ChevronRight, X, Menu, Bell, Search, ChevronDown, GraduationCap, Calendar, CalendarDays, BarChart3, Award, Flame,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/alunos', label: 'Alunos', icon: Users },
  { href: '/admin/financeiro', label: 'Financeiro', icon: CreditCard },
  { href: '/admin/solicitacoes', label: 'Solicitações', icon: ClipboardList },
  { href: '/admin/disciplinas', label: 'Disciplinas', icon: BookOpen },
  { href: '/admin/professores', label: 'Professores', icon: GraduationCap },
  { href: '/admin/calendario', label: 'Calendário', icon: Calendar },
  { href: '/admin/eventos', label: 'Eventos', icon: CalendarDays },
  { href: '/admin/relatorios', label: 'Relatórios', icon: BarChart3 },
  { href: '/admin/certificados', label: 'Certificados', icon: Award },
  { href: '/admin/torre', label: 'Torre de Oração', icon: Flame },
]

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/admin/dashboard': { title: 'Painel Admin', subtitle: 'Visão geral da instituição' },
  '/admin/alunos': { title: 'Alunos', subtitle: 'Gerenciar corpo discente' },
  '/admin/financeiro': { title: 'Financeiro', subtitle: 'Pagamentos e mensalidades' },
  '/admin/solicitacoes': { title: 'Solicitações', subtitle: 'Gerenciar requerimentos' },
  '/admin/disciplinas': { title: 'Disciplinas', subtitle: 'Grade curricular' },
  '/admin/professores': { title: 'Professores', subtitle: 'Corpo docente' },
  '/admin/calendario': { title: 'Calendário Acadêmico', subtitle: 'Eventos, provas e datas importantes' },
  '/admin/eventos': { title: 'Eventos', subtitle: 'Gerenciar agenda e calendário acadêmico' },
  '/admin/relatorios': { title: 'Relatórios', subtitle: 'Analytics e indicadores da instituição' },
  '/admin/certificados': { title: 'Certificados', subtitle: 'Emissão e gestão de certificados' },
  '/admin/torre': { title: 'Torre de Oração', subtitle: 'Inscritos na escala de oração' },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isLg, setIsLg] = useState(false)

  useEffect(() => {
    const check = () => setIsLg(window.innerWidth >= 1024)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    if (!loading && !user) router.replace('/login')
    if (!loading && user && user.role !== 'ADMIN') {
      router.replace(user.role === 'PROFESSOR' ? '/professor/dashboard' : '/dashboard')
    }
  }, [user, loading, router])

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f6fa]">
        <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#C8A35F', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  const page = pageTitles[pathname] ?? { title: 'Admin', subtitle: 'BTCP' }

  const sidebarContent = (
    <div className="flex flex-col h-full" style={{ background: '#071B34' }}>
      {/* Logo */}
      <div className="flex items-center px-4 py-4 border-b border-white/8 min-h-[64px]">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md"
            style={{ background: 'linear-gradient(135deg, #C8A35F, #b08030)' }}>
            <CrossIcon />
          </div>
          {!collapsed && (
            <div className="min-w-0 overflow-hidden">
              <p className="text-white font-bold text-sm leading-tight">Alma College</p>
              <p className="text-[10px] leading-tight" style={{ color: '#C8A35F' }}>Painel Administrativo</p>
            </div>
          )}
        </div>
        <button onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex ml-auto w-6 h-6 items-center justify-center rounded-md text-white/30 hover:text-white hover:bg-white/10 transition-all flex-shrink-0">
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
        <button onClick={() => setMobileOpen(false)}
          className="flex lg:hidden ml-auto w-7 h-7 items-center justify-center rounded-md text-white/40 hover:text-white hover:bg-white/10 transition-all">
          <X size={16} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {!collapsed && (
          <p className="text-white/20 text-[10px] font-semibold uppercase tracking-widest px-3 mb-2">Menu</p>
        )}
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
              title={collapsed ? item.label : undefined}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group relative',
                collapsed ? 'justify-center' : '',
                isActive ? 'text-[#C8A35F]' : 'text-white/50 hover:text-white/90 hover:bg-white/5'
              )}
              style={isActive ? { backgroundColor: 'rgba(200,163,95,0.12)' } : {}}>
              {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-[#C8A35F] rounded-r-full" />}
              <Icon size={17} className="flex-shrink-0" />
              {!collapsed && <span className="text-[13px] font-medium truncate leading-none">{item.label}</span>}
              {collapsed && (
                <span className="absolute left-full ml-3 px-2.5 py-1.5 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl z-50 border border-white/10">
                  {item.label}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4 border-t border-white/8 pt-3 space-y-0.5">
        <button onClick={logout}
          className={cn('w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400/60 hover:text-red-400 hover:bg-red-400/10 transition-all group relative', collapsed ? 'justify-center' : '')}>
          <LogOut size={17} className="flex-shrink-0" />
          {!collapsed && <span className="text-[13px] font-medium">Sair</span>}
          {collapsed && (
            <span className="absolute left-full ml-3 px-2.5 py-1.5 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl z-50 border border-white/10">Sair</span>
          )}
        </button>

        {!collapsed && (
          <div className="mt-2 pt-3 border-t border-white/8 flex items-center gap-3 px-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold shadow"
              style={{ background: 'linear-gradient(135deg, #C8A35F, #b08030)', color: '#071B34' }}>
              {(user.aluno?.name ?? user.professor?.name ?? user.email ?? 'AD').split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white text-xs font-semibold truncate">{user.aluno?.name ?? user.professor?.name ?? 'Administrador'}</p>
              <p className="text-white/30 text-[11px] truncate">Administrador</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#f5f6fa]">
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-screen z-50 transition-all duration-300 shadow-sidebar"
        style={{ width: collapsed ? 72 : 260 }}>
        {sidebarContent}
      </aside>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={cn('lg:hidden fixed left-0 top-0 h-screen z-50 w-72 transition-transform duration-300', mobileOpen ? 'translate-x-0' : '-translate-x-full')}>
        {sidebarContent}
      </aside>

      <header className="fixed top-0 right-0 h-16 bg-white border-b border-gray-100 flex items-center px-4 sm:px-6 z-30 transition-all duration-300"
        style={{ left: isLg ? (collapsed ? 72 : 260) : 0 }}>
        <button onClick={() => setMobileOpen(true)} className="lg:hidden mr-3 p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500">
          <Menu size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-[15px] font-semibold text-gray-900 truncate">{page.title}</h1>
          <p className="text-[11px] text-gray-400 truncate hidden sm:block">{page.subtitle}</p>
        </div>
        <div className="hidden md:flex items-center mx-4">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Buscar..." className="pl-8 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[13px] text-gray-700 w-48 focus:outline-none transition-all placeholder:text-gray-300"
              onFocus={e => { e.currentTarget.style.boxShadow = '0 0 0 3px rgba(200,163,95,0.15)'; e.currentTarget.style.borderColor = '#C8A35F' }}
              onBlur={e => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.borderColor = '' }} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-500 relative">
            <Bell size={17} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full border-2 border-white" style={{ backgroundColor: '#C8A35F' }} />
          </button>
          <div className="flex items-center gap-2.5 ml-1 pl-3 border-l border-gray-100 hover:bg-gray-50 rounded-xl px-2 py-1.5 transition-colors cursor-pointer">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 shadow"
              style={{ background: 'linear-gradient(135deg, #C8A35F, #b08030)', color: '#071B34' }}>
              {(user.aluno?.name ?? user.professor?.name ?? user.email ?? 'AD').split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-[13px] font-semibold text-gray-900 leading-none">{(user.aluno?.name ?? user.professor?.name ?? 'Admin').split(' ')[0]}</p>
              <p className="text-[11px] text-gray-400 leading-none mt-0.5">Administrador</p>
            </div>
            <ChevronDown size={14} className="text-gray-400 hidden sm:block" />
          </div>
        </div>
      </header>

      <main className="pt-16 min-h-screen transition-all duration-300"
        style={{ marginLeft: isLg ? (collapsed ? 72 : 260) : 0 }}>
        <div className="p-4 lg:p-6 animate-fade-in">{children}</div>
      </main>
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
