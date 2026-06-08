'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import {
  ArrowRight, ArrowUpRight, Play, Menu, X,
  Instagram, Youtube, Mail,
} from 'lucide-react'

const GOLD = '#C8A35F'
const NAVY = '#0F2742'
const INK = '#1A2B3C'
const MUTE = '#6B7A8D'

/* ─── DATA ─── */
const schools = [
  { id: 'btcp', name: 'BTCP', subtitle: 'Seminário Teológico', desc: 'Formação teológica completa para chamados e líderes.', photo: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80' },
  { id: 'casados', name: 'Casados Para Sempre', subtitle: 'Famílias', desc: 'Fortalecendo casamentos e famílias para uma vida plena.', photo: 'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?w=800&q=80' },
  { id: 'seeds', name: 'Seeds Across Nation', subtitle: 'Inglês', desc: 'Escola de inglês para crianças com propósito e excelência.', photo: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&q=80' },
  { id: 'alma-kids', name: 'Alma Kids', subtitle: 'Crianças', desc: 'Formação cristã que inspira e transforma o futuro.', photo: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&q=80' },
  { id: 'base', name: 'BASE', subtitle: 'Liderança', desc: 'Capacitando voluntários e líderes para servir com excelência.', photo: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&q=80' },
  { id: 'online', name: 'Cursos Online', subtitle: 'EAD', desc: 'Aprenda onde estiver com cursos gravados e ao vivo.', photo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80' },
]

const courses = [
  { title: 'Liderança Cristã', desc: 'Princípios e práticas para líderes', aulas: 8, level: 'Intermediário', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80' },
  { title: 'Teologia Sistemática', desc: 'Entenda as doutrinas fundamentais da fé', aulas: 12, level: 'Avançado', photo: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&q=80' },
  { title: 'Vida com Propósito', desc: 'Descubra seu chamado e o propósito de Deus', aulas: 6, level: 'Iniciante', photo: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80' },
  { title: 'Casamento Blindado', desc: 'Construa um relacionamento forte e saudável', aulas: 10, level: 'Intermediário', photo: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=600&q=80' },
  { title: 'Discipulado e Mentoria', desc: 'Formando discípulos que fazem discípulos', aulas: 8, level: 'Intermediário', photo: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80' },
  { title: 'Inglês para Crianças', desc: 'Aprendizado divertido e cristão', aulas: 12, level: 'Iniciante', photo: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600&q=80' },
]

const bigStats = [
  ['+8.500', 'Alunos ativos'],
  ['+120', 'Cursos disponíveis'],
  ['+2.000', 'Certificados emitidos'],
  ['+250', 'Professores'],
  ['15', 'Países alcançados'],
  ['98%', 'Satisfação dos alunos'],
]

const testimonials = [
  { name: 'Gabriela Lima', role: 'Aluna do BTCP', photo: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=120&q=80', text: 'A Alma College transformou minha visão ministerial e me preparou para o chamado que Deus tem na minha vida.' },
  { name: 'Ricardo e Fernanda', role: 'Casados Para Sempre', photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=120&q=80', text: 'Nosso casamento mudou completamente depois dos ensinamentos que aprendemos aqui.' },
  { name: 'Juliana Martins', role: 'Seeds Across Nation', photo: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=120&q=80', text: 'Minha filha aprendeu inglês de forma incrível e com valores cristãos que fazem toda a diferença.' },
]

/* ─── LOGO ─── */
function AlmaLogo({ size = 56, light = false }: { size?: number; light?: boolean }) {
  return (
    <img src="/logo-alma-church.png" alt="Alma Church"
      style={{ height: size, width: 'auto', filter: light ? 'invert(1) brightness(1.4)' : 'none', objectFit: 'contain', flexShrink: 0 }} />
  )
}

/* ─── NAVBAR ─── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const links = ['Escolas', 'Cursos Online', 'Depoimentos']
  const anchors: Record<string, string> = { 'Escolas': '#escolas', 'Cursos Online': '#cursos', 'Depoimentos': '#depoimentos' }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: '#fff',
        borderBottom: scrolled ? '1px solid #ECEFF3' : '1px solid transparent',
        boxShadow: scrolled ? '0 2px 20px rgba(15,39,66,0.04)' : 'none',
      }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-24 flex items-center justify-between gap-2">
        <Link href="/" className="flex items-center flex-shrink-0">
          <AlmaLogo size={132} />
        </Link>

        <div className="hidden lg:flex items-center gap-8 flex-1 justify-center">
          {links.map(item => (
            <a key={item} href={anchors[item]} className="text-sm font-medium transition-colors" style={{ color: MUTE }}>
              {item}
            </a>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-3 flex-shrink-0">
          <Link href="/" className="text-sm font-semibold px-4 py-2.5 rounded-full border transition-all hover:bg-gray-50"
            style={{ color: INK, borderColor: '#E2E6EC' }}>
            ← Alma Church
          </Link>
          <Link href="/login" className="text-sm font-semibold px-5 py-2.5 rounded-full transition-all hover:opacity-90"
            style={{ background: NAVY, color: '#fff' }}>
            Matricule-se
          </Link>
        </div>

        <button className="lg:hidden p-1" style={{ color: INK }} onClick={() => setOpen(!open)}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden px-6 py-5 border-t space-y-1" style={{ background: '#fff', borderColor: '#ECEFF3' }}>
          {links.map(item => (
            <a key={item} href={anchors[item]} onClick={() => setOpen(false)} className="block py-2.5 text-sm font-medium" style={{ color: INK }}>
              {item}
            </a>
          ))}
          <div className="pt-3 flex flex-col gap-2">
            <Link href="/" className="text-center py-3 text-sm font-semibold rounded-full border" style={{ color: INK, borderColor: '#E2E6EC' }}>← Alma Church</Link>
            <Link href="/login" className="text-center py-3 text-sm font-semibold rounded-full" style={{ background: NAVY, color: '#fff' }}>Matricule-se</Link>
          </div>
        </div>
      )}
    </nav>
  )
}

/* ─── HERO ─── */
function Hero() {
  return (
    <section className="relative min-h-[92vh] flex items-center pt-24">
      <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1600&q=80" alt=""
        className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(15,39,66,0.88) 0%, rgba(15,39,66,0.6) 45%, rgba(15,39,66,0.2) 100%)' }} />

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-6 w-full">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] mb-6" style={{ color: GOLD }}>Alma College</p>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.05] mb-6">
            Formando pessoas.<br />Desenvolvendo<br />propósitos.
          </h1>
          <p className="text-base sm:text-lg leading-relaxed mb-9 max-w-lg" style={{ color: 'rgba(255,255,255,0.8)' }}>
            Uma plataforma completa de ensino cristão para todas as idades e estágios da vida.
          </p>
          <div className="flex flex-wrap gap-3">
            <a href="#escolas"
              className="inline-flex items-center gap-2 px-7 py-4 rounded-full font-semibold text-sm transition-all hover:opacity-90"
              style={{ background: GOLD, color: '#fff' }}>
              Conheça as Escolas <ArrowRight size={16} />
            </a>
            <Link href="/login"
              className="inline-flex items-center gap-2 px-7 py-4 rounded-full font-semibold text-sm text-white border transition-all hover:bg-white/10"
              style={{ borderColor: 'rgba(255,255,255,0.4)' }}>
              <Play size={14} fill="white" /> Portal do Aluno
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── ESCOLAS ─── */
function Schools() {
  return (
    <section id="escolas" className="py-24 sm:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-5 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-16">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] mb-3" style={{ color: GOLD }}>Conheça</p>
            <h2 className="text-3xl sm:text-4xl font-black" style={{ color: INK }}>Nossas Escolas</h2>
          </div>
          <p className="text-sm max-w-xs md:text-right" style={{ color: MUTE }}>
            Encontre a formação ideal para você ou sua família.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {schools.map(s => (
            <Link key={s.id} href={`/escolas/${s.id}`}
              className="group block rounded-3xl overflow-hidden bg-white transition-all duration-300 hover:-translate-y-1"
              style={{ boxShadow: '0 1px 3px rgba(15,39,66,0.06)' }}>
              <div className="relative aspect-[16/10] overflow-hidden">
                <img src={s.photo} alt={s.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <span className="absolute top-4 left-4 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.95)', color: INK }}>{s.subtitle}</span>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold" style={{ color: INK }}>{s.name}</h3>
                  <ArrowUpRight size={18} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" style={{ color: GOLD }} />
                </div>
                <p className="text-sm leading-relaxed" style={{ color: MUTE }}>{s.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── CURSOS ─── */
function Courses() {
  return (
    <section id="cursos" className="py-24 sm:py-32" style={{ background: '#F7F8FA' }}>
      <div className="max-w-7xl mx-auto px-5 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-16">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] mb-3" style={{ color: GOLD }}>Aprenda no seu tempo</p>
            <h2 className="text-3xl sm:text-4xl font-black" style={{ color: INK }}>Cursos Online em Destaque</h2>
          </div>
          <Link href="/login" className="text-sm font-semibold flex items-center gap-1 transition-opacity hover:opacity-70" style={{ color: GOLD }}>
            Ver todos os cursos <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(c => (
            <div key={c.title} className="group rounded-3xl overflow-hidden bg-white transition-all hover:-translate-y-1"
              style={{ boxShadow: '0 1px 3px rgba(15,39,66,0.06)' }}>
              <div className="relative aspect-[16/10] overflow-hidden">
                <img src={c.photo} alt={c.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <span className="absolute bottom-3 left-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.95)', color: INK }}>{c.level}</span>
              </div>
              <div className="p-6">
                <h4 className="text-base font-bold mb-1.5" style={{ color: INK }}>{c.title}</h4>
                <p className="text-sm leading-relaxed mb-4" style={{ color: MUTE }}>{c.desc}</p>
                <p className="text-xs font-medium" style={{ color: GOLD }}>{c.aulas} aulas</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── STATS ─── */
function BigStats() {
  return (
    <section className="py-24 sm:py-28" style={{ background: NAVY }}>
      <div className="max-w-7xl mx-auto px-5 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-10 text-center">
          {bigStats.map(([v, l]) => (
            <div key={l}>
              <p className="text-4xl font-black text-white mb-2">{v}</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>{l}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── DEPOIMENTOS ─── */
function Testimonials() {
  return (
    <section id="depoimentos" className="py-24 sm:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-5 sm:px-6">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] mb-3" style={{ color: GOLD }}>Histórias reais</p>
          <h2 className="text-3xl sm:text-4xl font-black" style={{ color: INK }}>O que nossos alunos dizem</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map(t => (
            <div key={t.name} className="rounded-3xl p-8" style={{ background: '#F7F8FA' }}>
              <p className="text-base leading-relaxed mb-6" style={{ color: INK }}>&ldquo;{t.text}&rdquo;</p>
              <div className="flex items-center gap-3">
                <img src={t.photo} alt={t.name} className="w-11 h-11 rounded-full object-cover" />
                <div>
                  <p className="font-bold text-sm" style={{ color: INK }}>{t.name}</p>
                  <p className="text-xs" style={{ color: GOLD }}>{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── CTA ─── */
function CTABanner() {
  return (
    <section className="py-24 sm:py-32" style={{ background: '#F7F8FA' }}>
      <div className="max-w-4xl mx-auto px-5 sm:px-6">
        <div className="rounded-3xl px-8 py-16 sm:px-16 text-center" style={{ background: NAVY }}>
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">Invista no que realmente importa.</h2>
          <p className="text-base mb-9 max-w-lg mx-auto" style={{ color: 'rgba(255,255,255,0.7)' }}>
            Sua jornada de transformação começa agora.
          </p>
          <Link href="/login"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-sm transition-all hover:opacity-90"
            style={{ background: GOLD, color: '#fff' }}>
            Matricule-se Agora <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  )
}

/* ─── FOOTER ─── */
function Footer() {
  const cols = [
    { title: 'Institucional', links: ['Sobre a Alma College', 'Nossa História', 'Missão e Visão', 'Trabalhe Conosco'] },
    { title: 'Escolas', links: ['BTCP', 'Casados Para Sempre', 'Seeds', 'Alma Kids', 'BASE', 'Cursos Online'] },
    { title: 'Ajuda', links: ['Perguntas Frequentes', 'Suporte', 'Política de Privacidade', 'Termos de Uso'] },
  ]
  return (
    <footer style={{ background: NAVY }}>
      <div className="max-w-7xl mx-auto px-5 sm:px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-12">
          <div className="col-span-2">
            <AlmaLogo size={64} light />
            <p className="text-sm leading-relaxed mt-4 mb-5 max-w-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Formando pessoas. Desenvolvendo propósitos. O braço educacional da Alma Church.
            </p>
            <div className="flex items-center gap-3">
              {[
                { Icon: Instagram, href: 'https://www.instagram.com/almachurchbrasil/' },
                { Icon: Youtube, href: 'https://www.youtube.com/@AlmaChurchOficial' },
                { Icon: Mail, href: 'mailto:contato@almachurch.com.br' },
              ].map(({ Icon, href }) => (
                <a key={href} href={href} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:bg-white/10"
                  style={{ color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.12)' }}>
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>
          {cols.map(col => (
            <div key={col.title}>
              <h5 className="text-white font-bold text-xs uppercase tracking-wider mb-4">{col.title}</h5>
              <div className="space-y-2.5">
                {col.links.map(link => (
                  <a key={link} href="#" className="block text-sm transition-colors hover:text-white" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    {link}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-3" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>© 2026 Alma College · Alma Church. Todos os direitos reservados.</p>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>Feito com ♥ para o Reino de Deus</p>
        </div>
      </div>
    </footer>
  )
}

/* ─── PAGE ─── */
export default function LandingPage() {
  return (
    <div className="bg-white">
      <Navbar />
      <Hero />
      <Schools />
      <Courses />
      <BigStats />
      <Testimonials />
      <CTABanner />
      <Footer />
    </div>
  )
}
