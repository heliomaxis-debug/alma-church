'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext'
import { useAuth } from '@/contexts/AuthContext'

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar()
  const pathname = usePathname()
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isLg, setIsLg] = useState(false)

  useEffect(() => {
    const check = () => setIsLg(window.innerWidth >= 1024)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    if (!loading && !user) router.replace('/login')
    if (!loading && user) {
      if (user.role === 'PROFESSOR') router.replace('/professor/dashboard')
      else if (user.role === 'ADMIN') router.replace('/admin/dashboard')
    }
  }, [user, loading, router])

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f6fa]">
        <div className="w-8 h-8 border-4 border-gold-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const sidebarWidth = isLg ? (collapsed ? 72 : 260) : 0

  return (
    <div className="min-h-screen bg-[#f5f6fa]">
      <Sidebar />
      <Topbar pathname={pathname} />

      <main
        className="pt-16 min-h-screen transition-all duration-300"
        style={{ marginLeft: sidebarWidth }}
      >
        <div className="p-4 lg:p-6 animate-fade-in min-h-[calc(100vh-64px)]">
          {children}
        </div>
      </main>
    </div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <DashboardContent>{children}</DashboardContent>
    </SidebarProvider>
  )
}
