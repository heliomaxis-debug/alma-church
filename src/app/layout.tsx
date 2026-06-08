import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'

export const metadata: Metadata = {
  title: 'Alma College – Formando pessoas. Desenvolvendo propósitos.',
  description: 'A plataforma educacional cristã mais moderna do Brasil. BTCP, Casados Para Sempre, Seeds Across Nation, Alma Kids, BASE e Cursos Online.',
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="antialiased bg-[#f5f6fa]">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
