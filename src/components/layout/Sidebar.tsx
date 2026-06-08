'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home, BookOpen, CreditCard, Calendar, FileText,
  ClipboardList, IdCard, FolderOpen, CheckSquare,
  User, Settings, LogOut, ChevronLeft, ChevronRight, X,
  Library, CalendarDays, MessageCircle, Megaphone, Award,
} from 'lucide-react'
import { useSidebar } from '@/contexts/SidebarContext'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'

const mainNavItems = [
  { href: '/dashboard', label: 'Início', icon: Home, group: 'main' },
  { href: '/notas', label: 'Notas e Faltas', icon: BookOpen, group: 'main' },
  { href: '/financeiro', label: 'Financeiro', icon: CreditCard, group: 'main' },
  { href: '/calendario', label: 'Calendário', icon: Calendar, group: 'main' },
  { href: '/materiais', label: 'Materiais', icon: FolderOpen, group: 'main' },
  { href: '/biblioteca', label: 'Biblioteca', icon: Library, group: 'main' },
  { href: '/documentos', label: 'Documentos', icon: FileText, group: 'main' },
  { href: '/solicitacoes', label: 'Solicitações', icon: ClipboardList, group: 'main' },
  { href: '/carteirinha', label: 'Carteirinha Digital', icon: IdCard, group: 'main' },
  { href: '/eventos', label: 'Eventos', icon: CalendarDays, group: 'main' },
  { href: '/comunicados', label: 'Comunicados', icon: Megaphone, group: 'main' },
  { href: '/certificados', label: 'Certificados', icon: Award, group: 'main' },
  { href: '/checkin', label: 'Check-in', icon: CheckSquare, group: 'main' },
  { href: '/comunidade', label: 'Comunidade', icon: MessageCircle, group: 'main' },
]

const bottomNavItems = [
  { href: '/perfil', label: 'Perfil', icon: User },
  { href: '/configuracoes', label: 'Configurações', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { collapsed, setCollapsed, mobileOpen, setMobileOpen } = useSidebar()
  const { user, logout } = useAuth()

  const name = user?.aluno?.name ?? user?.professor?.name ?? 'Usuário'
  const firstName = name.split(' ')[0]
  const initials = name.split(' ').map((w: string) => w[0]).slice(0, 2).join('')
  const curso = user?.aluno?.curso ?? user?.professor?.title ?? 'BTCP'
  const sub = user?.aluno ? `RA: ${user.aluno.ra}` : 'Docente'
  const photo = user?.aluno?.photo ?? null

  const sidebarContent = (
    <div className="flex flex-col h-full" style={{ background: '#071B34' }}>

      {/* ── Logo ── */}
      <div className="flex items-center px-4 py-4 border-b border-white/8 min-h-[64px]">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md"
            style={{ background: 'linear-gradient(135deg, #C8A35F, #b08030)' }}
          >
            <CrossIcon />
          </div>
          {!collapsed && (
            <div className="min-w-0 overflow-hidden">
              <p className="text-white font-bold text-sm leading-tight">Alma College</p>
              <p className="text-[10px] leading-tight" style={{ color: '#C8A35F' }}>BTCP · Seminário Teológico</p>
            </div>
          )}
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex ml-auto w-6 h-6 items-center justify-center rounded-md text-white/30 hover:text-white hover:bg-white/10 transition-all flex-shrink-0"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        <button
          onClick={() => setMobileOpen(false)}
          className="flex lg:hidden ml-auto w-7 h-7 items-center justify-center rounded-md text-white/40 hover:text-white hover:bg-white/10 transition-all"
        >
          <X size={16} />
        </button>
      </div>

      {/* ── Card do usuário (abaixo do logo) ── */}
      {!collapsed ? (
        <Link
          href="/perfil"
          onClick={() => setMobileOpen(false)}
          className="mx-3 mt-3 mb-1 rounded-xl px-3 py-3 flex items-center gap-3 transition-all hover:bg-white/5"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          {photo ? (
            <img
              src={photo}
              alt={name}
              className="w-11 h-11 rounded-xl object-cover flex-shrink-0 shadow-lg border-2"
              style={{ borderColor: 'rgba(200,163,95,0.4)' }}
            />
          ) : (
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold shadow-lg border-2"
              style={{ background: 'linear-gradient(135deg, #C8A35F, #b08030)', color: '#071B34', borderColor: 'rgba(200,163,95,0.35)' }}
            >
              {initials}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-white text-[13px] font-bold truncate leading-tight">{firstName}</p>
            <p className="text-white/40 text-[11px] truncate mt-0.5 leading-tight">{curso}</p>
            <p className="text-[10px] truncate mt-0.5" style={{ color: 'rgba(200,163,95,0.7)' }}>{sub}</p>
          </div>
        </Link>
      ) : (
        <div className="flex justify-center mt-3 mb-1">
          {photo ? (
            <img
              src={photo}
              alt={name}
              className="w-9 h-9 rounded-xl object-cover shadow border-2"
              style={{ borderColor: 'rgba(200,163,95,0.35)' }}
            />
          ) : (
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shadow"
              style={{ background: 'linear-gradient(135deg, #C8A35F, #b08030)', color: '#071B34' }}
            >
              {initials}
            </div>
          )}
        </div>
      )}

      {/* ── Menu Principal ── */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto sidebar-scroll">
        {!collapsed && (
          <p className="text-white/20 text-[10px] font-semibold uppercase tracking-widest px-3 mb-2">
            Menu Principal
          </p>
        )}
        {mainNavItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              title={collapsed ? item.label : undefined}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group relative',
                collapsed ? 'justify-center' : '',
                isActive ? 'text-[#C8A35F]' : 'text-white/50 hover:text-white/90 hover:bg-white/5'
              )}
              style={isActive ? { backgroundColor: 'rgba(200,163,95,0.12)' } : {}}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-[#C8A35F] rounded-r-full" />
              )}
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

      {/* ── Conta + Sair ── */}
      <div className="px-3 pb-4 border-t border-white/8 pt-3 space-y-0.5">
        {!collapsed && (
          <p className="text-white/20 text-[10px] font-semibold uppercase tracking-widest px-3 mb-2">Conta</p>
        )}
        {bottomNavItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              title={collapsed ? item.label : undefined}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group relative',
                collapsed ? 'justify-center' : '',
                isActive ? 'text-[#C8A35F]' : 'text-white/50 hover:text-white/90 hover:bg-white/5'
              )}
              style={isActive ? { backgroundColor: 'rgba(200,163,95,0.12)' } : {}}
            >
              {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-[#C8A35F] rounded-r-full" />}
              <Icon size={17} className="flex-shrink-0" />
              {!collapsed && <span className="text-[13px] font-medium truncate">{item.label}</span>}
              {collapsed && (
                <span className="absolute left-full ml-3 px-2.5 py-1.5 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl z-50 border border-white/10">
                  {item.label}
                </span>
              )}
            </Link>
          )
        })}

        <button
          onClick={logout}
          title={collapsed ? 'Sair' : undefined}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400/60 hover:text-red-400 hover:bg-red-400/10 transition-all duration-150 group relative',
            collapsed ? 'justify-center' : ''
          )}
        >
          <LogOut size={17} className="flex-shrink-0" />
          {!collapsed && <span className="text-[13px] font-medium">Sair</span>}
          {collapsed && (
            <span className="absolute left-full ml-3 px-2.5 py-1.5 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl z-50 border border-white/10">
              Sair
            </span>
          )}
        </button>
      </div>
    </div>
  )

  return (
    <>
      <aside
        className="hidden lg:flex flex-col fixed left-0 top-0 h-screen z-50 transition-all duration-300 shadow-sidebar"
        style={{ width: collapsed ? 72 : 260 }}
      >
        {sidebarContent}
      </aside>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
      )}

      <aside
        className={cn(
          'lg:hidden fixed left-0 top-0 h-screen z-50 w-72 transition-transform duration-300 shadow-sidebar',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {sidebarContent}
      </aside>
    </>
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
