'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import {
  ArrowRight, Play, Menu, X,
  MapPin, Clock, Mail, ArrowUpRight,
  Instagram, Youtube, Mic, Headphones, Calendar,
} from 'lucide-react'

/* ─── CONSTANTES ─── */
const SPOTIFY_URL = 'https://open.spotify.com/show/2GkPn5ZSZIwkUctqJ9UKqq'
const INSTAGRAM_URL = 'https://www.instagram.com/almachurchbrasil/'
const YOUTUBE_URL = 'https://www.youtube.com/@AlmaChurchOficial'

const GOLD = '#C8A35F'
const NAVY = '#0F2742'
const INK = '#1A2B3C'
const MUTE = '#6B7A8D'

/* ─── SPOTIFY ICON ─── */
function SpotifyIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.561.3z" />
    </svg>
  )
}

/* ─── LOGO ─── */
function AlmaLogo({ size = 56, light = false }: { size?: number; light?: boolean }) {
  return (
    <img
      src="/logo-alma-church.png"
      alt="Alma Church"
      style={{
        height: size,
        width: 'auto',
        filter: light ? 'invert(1) brightness(1.4)' : 'none',
        objectFit: 'contain',
        flexShrink: 0,
      }}
    />
  )
}

/* ─── DATA ─── */
const valores = [
  {
    title: 'Acolhedora',
    desc: 'Ninguém chega como estranho. Cada pessoa é recebida com amor genuíno, independente de onde venha.',
    img: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&q=80',
  },
  {
    title: 'Cuidadora',
    desc: 'A igreja existe para cuidar das pessoas nas alegrias, nos desafios e em cada etapa da jornada.',
    img: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=800&q=80',
  },
  {
    title: 'Frutífera',
    desc: 'Uma vida com Deus frutifica. Aqui você descobre seu propósito, desenvolve seus dons e impacta o mundo.',
    img: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=800&q=80',
  },
]

const ministerios = [
  { id: 'alma-college', name: 'Alma College', desc: 'Formação teológica e educacional, do BTCP aos cursos online.', href: '/alma-college', img: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80', destaque: true },
  { id: 'alma-kids', name: 'Alma Kids', desc: 'Formação cristã para crianças e jovens de 0 a 17 anos.', href: '/escolas/alma-kids', img: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&q=80' },
  { id: 'alma-worship', name: 'Alma Worship', desc: 'Ministério de louvor e adoração que forma músicos com propósito.', href: '#', img: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80' },
  { id: 'casados', name: 'Casados Para Sempre', desc: 'Fortalecendo casamentos e famílias para uma vida plena.', href: '/escolas/casados', img: 'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?w=800&q=80' },
  { id: 'base', name: 'BASE', desc: 'Capacitando voluntários e líderes para servir com excelência.', href: '/escolas/base', img: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&q=80' },
  { id: 'missoes', name: 'Missões', desc: 'Levando o evangelho a todas as nações com impacto real.', href: '#', img: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80' },
]

const cultos = [
  { campus: 'Sede Central', cidade: 'Cariacica — ES', horarios: ['Quarta 19h30', 'Sábado 19h', 'Domingo 9h, 11h e 18h'], endereco: 'R. Dom Pedro II, 900, Cruzeiro do Sul' },
  { campus: 'Alma On', cidade: 'Online · Ao vivo', horarios: ['Domingo 9h, 11h e 18h'], endereco: 'youtube.com/@AlmaChurchOficial' },
  { campus: 'Grupos de Conexão', cidade: 'Cariacica e região', horarios: ['Células semanais', 'Segunda a Sábado'], endereco: 'Fale conosco para encontrar um grupo' },
  { campus: 'Eventos', cidade: 'Agenda mensal', horarios: ['Confira nas redes', '@almachurchbrasil'], endereco: 'Agenda completa no Instagram' },
]

const testimonials = [
  { name: 'Ana Paula Ferreira', role: 'Membro desde 2018', photo: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=120&q=80', text: 'A Alma Church transformou minha família. Encontramos propósito, comunidade e uma fé que realmente vive no dia a dia.' },
  { name: 'Marcos e Juliana', role: 'Casados Para Sempre', photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=120&q=80', text: 'Desde que chegamos na Alma Church, nossa família é diferente. O amor desta comunidade é real e transforma vidas.' },
  { name: 'Pr. Rodrigo Lima', role: 'Formado pelo BTCP', photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&q=80', text: 'A Alma College me preparou para plantar uma igreja no interior do Pará. O que aprendi aqui vive em centenas de vidas.' },
]

const eventos = [
  { dia: '07', mes: 'JUN', titulo: 'Culto de Celebração', tipo: 'Culto Especial' },
  { dia: '14', mes: 'JUN', titulo: 'BTCP: Início das Aulas', tipo: 'Alma College' },
  { dia: '21', mes: 'JUN', titulo: 'Retiro de Casais', tipo: 'Casados Para Sempre' },
  { dia: '28', mes: 'JUN', titulo: 'Noite de Louvor', tipo: 'Alma Worship' },
]

/* ─── NAVBAR ─── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const links = [
    { label: 'Início', href: '#inicio' },
    { label: 'Sobre', href: '#sobre' },
    { label: 'Ministérios', href: '#ministerios' },
    { label: 'Acompanhe', href: '#midia' },
    { label: 'Agenda', href: '#agenda' },
    { label: 'Cultos', href: '#cultos' },
    { label: 'Contato', href: '#contato' },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: '#ffffff',
        borderBottom: scrolled ? '1px solid #ECEFF3' : '1px solid transparent',
        boxShadow: scrolled ? '0 2px 20px rgba(15,39,66,0.04)' : 'none',
      }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-24 flex items-center justify-between gap-2">
        <Link href="/" className="flex items-center flex-shrink-0">
          <AlmaLogo size={132} />
        </Link>

        <div className="hidden xl:flex items-center gap-8 flex-1 justify-center">
          {links.map(l => (
            <a key={l.label} href={l.href}
              className="text-sm font-medium transition-colors hover:opacity-100"
              style={{ color: MUTE }}>
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-3 flex-shrink-0">
          <Link href="/alma-college"
            className="text-sm font-semibold px-4 py-2.5 rounded-full border transition-all hover:bg-gray-50"
            style={{ color: INK, borderColor: '#E2E6EC' }}>
            Alma College
          </Link>
          <Link href="/login"
            className="text-sm font-semibold px-5 py-2.5 rounded-full transition-all hover:opacity-90"
            style={{ background: NAVY, color: '#fff' }}>
            Portal do Aluno
          </Link>
        </div>

        <button className="xl:hidden p-1 flex-shrink-0" style={{ color: INK }} onClick={() => setOpen(!open)}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className="xl:hidden px-6 py-5 border-t space-y-1" style={{ background: '#fff', borderColor: '#ECEFF3' }}>
          {links.map(l => (
            <a key={l.label} href={l.href} onClick={() => setOpen(false)}
              className="block py-2.5 text-sm font-medium" style={{ color: INK }}>
              {l.label}
            </a>
          ))}
          <div className="pt-3 flex flex-col gap-2">
            <Link href="/alma-college" className="text-center py-3 text-sm font-semibold rounded-full border" style={{ color: INK, borderColor: '#E2E6EC' }}>
              Alma College
            </Link>
            <Link href="/login" className="text-center py-3 text-sm font-semibold rounded-full" style={{ background: NAVY, color: '#fff' }}>
              Portal do Aluno
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}

/* ─── HERO ─── */
function Hero() {
  const [slide, setSlide] = useState(0)
  const slides = [
    {
      tag: 'Bem-vindo à Alma Church',
      title: 'Acolhedora,\nCuidadora\n& Frutífera.',
      sub: 'Uma comunidade viva em Cariacica — ES, onde cada pessoa é acolhida, cuidada e frutifica no propósito de Deus.',
      cta1: { label: 'Nossos Cultos', href: '#cultos' },
      cta2: { label: 'Assista ao vivo', href: YOUTUBE_URL },
      photo: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1600&q=80',
    },
    {
      tag: 'Educação cristã',
      title: 'Formação que\ntransforma\nvidas e nações.',
      sub: 'Do BTCP Seminário Teológico aos cursos online. A Alma College é o braço educacional da igreja.',
      cta1: { label: 'Conhecer a Alma College', href: '/alma-college' },
      cta2: { label: 'Ver cursos', href: '/alma-college#escolas' },
      photo: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1600&q=80',
    },
    {
      tag: 'Adoração',
      title: 'Uma adoração\nque toca o\ncoração.',
      sub: 'Cultos cheios da presença de Deus, com louvor que transforma a atmosfera e renova a fé.',
      cta1: { label: 'Nossos Cultos', href: '#cultos' },
      cta2: { label: 'Assista ao vivo', href: YOUTUBE_URL },
      photo: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=1600&q=80',
    },
    {
      tag: 'Faça parte',
      title: 'Você foi feito\npara fazer\nparte.',
      sub: 'Encontre uma comunidade que caminha com você. Conecte-se, sirva e cresça em família.',
      cta1: { label: 'Quero fazer parte', href: '#contato' },
      cta2: { label: 'Nossos ministérios', href: '#ministerios' },
      photo: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1600&q=80',
    },
  ]
  const s = slides[slide]

  useEffect(() => {
    const t = setInterval(() => setSlide(i => (i + 1) % slides.length), 6500)
    return () => clearInterval(t)
  }, [])

  return (
    <section id="inicio" className="relative min-h-[92vh] flex items-center pt-24">
      {slides.map((sl, i) => (
        <img key={i} src={sl.photo} alt=""
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
          style={{ opacity: i === slide ? 1 : 0 }} />
      ))}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(15,39,66,0.85) 0%, rgba(15,39,66,0.55) 45%, rgba(15,39,66,0.15) 100%)' }} />

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-6 w-full">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] mb-6" style={{ color: GOLD }}>
            {s.tag}
          </p>
          <h1 key={slide} className="text-4xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.05] mb-6 whitespace-pre-line">
            {s.title}
          </h1>
          <p className="text-base sm:text-lg leading-relaxed mb-9 max-w-lg" style={{ color: 'rgba(255,255,255,0.8)' }}>
            {s.sub}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href={s.cta1.href}
              className="inline-flex items-center gap-2 px-7 py-4 rounded-full font-semibold text-sm transition-all hover:opacity-90"
              style={{ background: GOLD, color: '#fff' }}>
              {s.cta1.label} <ArrowRight size={16} />
            </Link>
            <a href={s.cta2.href} target={s.cta2.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-7 py-4 rounded-full font-semibold text-sm text-white border transition-all hover:bg-white/10"
              style={{ borderColor: 'rgba(255,255,255,0.4)' }}>
              <Play size={14} fill="white" /> {s.cta2.label}
            </a>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-14">
          {slides.map((_, i) => (
            <button key={i} onClick={() => setSlide(i)}
              className="transition-all duration-300 rounded-full"
              style={{ background: i === slide ? GOLD : 'rgba(255,255,255,0.4)', width: i === slide ? 28 : 8, height: 8 }} />
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── SOBRE (versículo + valores) ─── */
function Sobre() {
  return (
    <section id="sobre" className="py-24 sm:py-32 bg-white">
      <div className="max-w-3xl mx-auto px-5 sm:px-6 text-center mb-20">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] mb-5" style={{ color: GOLD }}>Sejam bem-vindos</p>
        <p className="text-2xl sm:text-3xl font-light leading-relaxed" style={{ color: INK }}>
          Mais do que uma igreja, somos uma família:
          <span style={{ fontWeight: 600 }}> acolhedora</span> no amor,
          <span style={{ fontWeight: 600 }}> cuidadora</span> na jornada e
          <span style={{ fontWeight: 600 }}> frutífera</span> no propósito.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-5 sm:px-6">
        <div className="grid md:grid-cols-3 gap-8">
          {valores.map(v => (
            <div key={v.title} className="group">
              <div className="rounded-3xl overflow-hidden mb-6 aspect-[4/3]">
                <img src={v.img} alt={v.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: INK }}>{v.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: MUTE }}>{v.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── MINISTÉRIOS ─── */
function Ministerios() {
  return (
    <section id="ministerios" className="py-24 sm:py-32" style={{ background: '#F7F8FA' }}>
      <div className="max-w-7xl mx-auto px-5 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-16">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] mb-3" style={{ color: GOLD }}>Faça parte</p>
            <h2 className="text-3xl sm:text-4xl font-black" style={{ color: INK }}>Nossos Ministérios</h2>
          </div>
          <p className="text-sm max-w-xs md:text-right" style={{ color: MUTE }}>
            Cada ministério é um chamado para servir, crescer e impactar.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {ministerios.map(m => (
            <Link key={m.id} href={m.href}
              className="group block rounded-3xl overflow-hidden bg-white transition-all duration-300 hover:-translate-y-1"
              style={{ boxShadow: '0 1px 3px rgba(15,39,66,0.06)' }}>
              <div className="relative aspect-[16/10] overflow-hidden">
                <img src={m.img} alt={m.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                {m.destaque && (
                  <span className="absolute top-4 left-4 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full"
                    style={{ background: GOLD, color: '#fff' }}>
                    Destaque
                  </span>
                )}
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold" style={{ color: INK }}>{m.name}</h3>
                  <ArrowUpRight size={18} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" style={{ color: GOLD }} />
                </div>
                <p className="text-sm leading-relaxed" style={{ color: MUTE }}>{m.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── ACOMPANHE (YouTube + Spotify) ─── */
function Midia() {
  const videos = [
    { titulo: 'Uma fé que frutifica', data: 'Domingo · 18h', tag: 'Mais recente', img: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=600&q=80' },
    { titulo: 'O cuidado que transforma', data: 'Domingo · 11h', tag: 'Manhã', img: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=600&q=80' },
    { titulo: 'Acolhidos pela graça', data: 'Quarta · 19h30', tag: 'Quarta', img: 'https://images.unsplash.com/photo-1510590337019-5ef8d3d32116?w=600&q=80' },
  ]
  const episodios = [
    { num: 'EP. 42', titulo: 'Vivendo uma fé que frutifica', dur: '38 min' },
    { num: 'EP. 41', titulo: 'Como acolher quem chega ferido', dur: '45 min' },
    { num: 'EP. 40', titulo: 'O cuidado que transforma vidas', dur: '32 min' },
  ]
  return (
    <section id="midia" className="py-24 sm:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-5 sm:px-6">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] mb-3" style={{ color: GOLD }}>Onde você estiver</p>
          <h2 className="text-3xl sm:text-4xl font-black" style={{ color: INK }}>Acompanhe a Alma Church</h2>
          <p className="text-sm mt-3 max-w-md mx-auto" style={{ color: MUTE }}>
            Assista aos cultos no YouTube e ouça o Alma Cast no Spotify. Conteúdo para a semana toda.
          </p>
        </div>

        {/* YouTube */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <Youtube size={22} style={{ color: '#FF0000' }} />
            <h3 className="text-lg font-bold" style={{ color: INK }}>Últimos cultos</h3>
          </div>
          <a href={YOUTUBE_URL} target="_blank" rel="noopener noreferrer"
            className="text-sm font-semibold flex items-center gap-1 transition-opacity hover:opacity-70" style={{ color: MUTE }}>
            Ver canal <ArrowRight size={14} />
          </a>
        </div>
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {videos.map(v => (
            <a key={v.titulo} href={YOUTUBE_URL} target="_blank" rel="noopener noreferrer"
              className="group block rounded-3xl overflow-hidden bg-white transition-all hover:-translate-y-1"
              style={{ boxShadow: '0 1px 3px rgba(15,39,66,0.06)' }}>
              <div className="relative aspect-video overflow-hidden">
                <img src={v.img} alt={v.titulo} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(15,39,66,0.15)' }}>
                  <div className="w-14 h-14 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
                    style={{ background: '#FF0000' }}>
                    <Play size={20} fill="#fff" style={{ color: '#fff', marginLeft: 3 }} />
                  </div>
                </div>
                <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.95)', color: INK }}>{v.tag}</span>
              </div>
              <div className="p-5">
                <h4 className="text-sm font-bold mb-1.5" style={{ color: INK }}>{v.titulo}</h4>
                <div className="flex items-center gap-1.5">
                  <Calendar size={12} style={{ color: MUTE }} />
                  <span className="text-xs" style={{ color: MUTE }}>{v.data}</span>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* Spotify */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <Mic size={20} style={{ color: '#1DB954' }} />
            <h3 className="text-lg font-bold" style={{ color: INK }}>Podcast Alma Cast</h3>
          </div>
          <a href={SPOTIFY_URL} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-opacity hover:opacity-90"
            style={{ background: '#1DB954', color: '#fff' }}>
            <SpotifyIcon size={15} /> Ouvir no Spotify
          </a>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {episodios.map(ep => (
            <a key={ep.num} href={SPOTIFY_URL} target="_blank" rel="noopener noreferrer"
              className="group flex items-center gap-4 rounded-2xl p-4 bg-white transition-all hover:-translate-y-0.5"
              style={{ boxShadow: '0 1px 3px rgba(15,39,66,0.06)' }}>
              <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105"
                style={{ background: '#1DB954' }}>
                <Play size={16} fill="#fff" style={{ color: '#fff', marginLeft: 2 }} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold mb-0.5" style={{ color: MUTE }}>{ep.num}</p>
                <h4 className="text-sm font-bold truncate" style={{ color: INK }}>{ep.titulo}</h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Headphones size={11} style={{ color: MUTE }} />
                  <span className="text-xs" style={{ color: MUTE }}>{ep.dur}</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── ALMA COLLEGE ─── */
function AlmaCollegeCTA() {
  return (
    <section className="py-24 sm:py-32" style={{ background: '#F7F8FA' }}>
      <div className="max-w-7xl mx-auto px-5 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="rounded-3xl overflow-hidden aspect-[4/3] order-2 lg:order-1">
            <img src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1000&q=80" alt="Alma College" className="w-full h-full object-cover" />
          </div>
          <div className="order-1 lg:order-2">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] mb-4" style={{ color: GOLD }}>Alma College</p>
            <h2 className="text-3xl sm:text-4xl font-black leading-tight mb-5" style={{ color: INK }}>
              Leve sua fé para um novo nível de excelência.
            </h2>
            <p className="text-base leading-relaxed mb-8" style={{ color: MUTE }}>
              Do Seminário Teológico BTCP aos cursos online, a Alma College forma líderes que impactam
              famílias, igrejas e nações.
            </p>
            <div className="grid grid-cols-2 gap-6 mb-9 max-w-sm">
              {[['+8.500', 'Alunos formados'], ['+120', 'Cursos'], ['6', 'Escolas'], ['15', 'Países']].map(([v, l]) => (
                <div key={l}>
                  <p className="text-3xl font-black" style={{ color: NAVY }}>{v}</p>
                  <p className="text-xs mt-1" style={{ color: MUTE }}>{l}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/alma-college"
                className="inline-flex items-center gap-2 px-7 py-4 rounded-full font-semibold text-sm transition-all hover:opacity-90"
                style={{ background: NAVY, color: '#fff' }}>
                Conhecer a Alma College <ArrowRight size={16} />
              </Link>
              <Link href="/login"
                className="inline-flex items-center gap-2 px-7 py-4 rounded-full font-semibold text-sm border transition-all hover:bg-white"
                style={{ color: INK, borderColor: '#E2E6EC' }}>
                Acessar o Portal
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── AGENDA ─── */
function Agenda() {
  return (
    <section id="agenda" className="py-24 sm:py-32 bg-white">
      <div className="max-w-5xl mx-auto px-5 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-14">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] mb-3" style={{ color: GOLD }}>Fique por dentro</p>
            <h2 className="text-3xl sm:text-4xl font-black" style={{ color: INK }}>Próximos Eventos</h2>
          </div>
          <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer"
            className="text-sm font-semibold flex items-center gap-1 transition-opacity hover:opacity-70" style={{ color: GOLD }}>
            Agenda completa <ArrowRight size={14} />
          </a>
        </div>

        <div className="divide-y" style={{ borderColor: '#ECEFF3' }}>
          {eventos.map(e => (
            <div key={e.titulo} className="flex items-center gap-6 py-6 group cursor-pointer">
              <div className="text-center flex-shrink-0 w-14">
                <p className="text-3xl font-black leading-none" style={{ color: NAVY }}>{e.dia}</p>
                <p className="text-[11px] font-bold mt-1" style={{ color: GOLD }}>{e.mes}</p>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: GOLD }}>{e.tipo}</p>
                <h4 className="text-lg font-bold" style={{ color: INK }}>{e.titulo}</h4>
              </div>
              <ArrowUpRight size={20} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" style={{ color: MUTE }} />
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
    <section className="py-24 sm:py-32" style={{ background: '#F7F8FA' }}>
      <div className="max-w-7xl mx-auto px-5 sm:px-6">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] mb-3" style={{ color: GOLD }}>Histórias reais</p>
          <h2 className="text-3xl sm:text-4xl font-black" style={{ color: INK }}>O que nossa família diz</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map(t => (
            <div key={t.name} className="rounded-3xl p-8 bg-white" style={{ boxShadow: '0 1px 3px rgba(15,39,66,0.06)' }}>
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

/* ─── CONTRIBUIR ─── */
function Contribuir() {
  return (
    <section id="contribuir" className="py-24 sm:py-32 bg-white">
      <div className="max-w-4xl mx-auto px-5 sm:px-6">
        <div className="rounded-3xl px-8 py-16 sm:px-16 text-center" style={{ background: NAVY }}>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] mb-4" style={{ color: GOLD }}>Generosidade</p>
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-5">Contribua com a Obra de Deus</h2>
          <p className="text-base leading-relaxed mb-2 max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.7)' }}>
            &ldquo;Cada um contribua segundo propôs no seu coração; porque Deus ama ao que dá com alegria.&rdquo;
          </p>
          <p className="text-xs font-semibold mb-9" style={{ color: GOLD }}>2 Coríntios 9.7</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a href="#" className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-sm transition-all hover:opacity-90"
              style={{ background: GOLD, color: '#fff' }}>
              Contribuir Agora <ArrowRight size={16} />
            </a>
            <a href="#" className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-sm text-white border transition-all hover:bg-white/10"
              style={{ borderColor: 'rgba(255,255,255,0.3)' }}>
              Transparência Financeira
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── CULTOS ─── */
function Cultos() {
  return (
    <section id="cultos" className="py-24 sm:py-32" style={{ background: '#F7F8FA' }}>
      <div className="max-w-7xl mx-auto px-5 sm:px-6">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] mb-3" style={{ color: GOLD }}>Venha nos visitar</p>
          <h2 className="text-3xl sm:text-4xl font-black" style={{ color: INK }}>Horários de Culto</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cultos.map(c => (
            <div key={c.campus} className="rounded-3xl p-7 bg-white" style={{ boxShadow: '0 1px 3px rgba(15,39,66,0.06)' }}>
              <h3 className="text-base font-bold mb-1" style={{ color: INK }}>{c.campus}</h3>
              <p className="text-xs mb-5" style={{ color: GOLD }}>{c.cidade}</p>
              <div className="space-y-2 mb-6">
                {c.horarios.map(h => (
                  <div key={h} className="flex items-center gap-2">
                    <Clock size={13} style={{ color: MUTE }} />
                    <span className="text-sm" style={{ color: INK }}>{h}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-start gap-2 pt-5 border-t" style={{ borderColor: '#F1F4F8' }}>
                <MapPin size={13} className="flex-shrink-0 mt-0.5" style={{ color: MUTE }} />
                <p className="text-xs leading-relaxed" style={{ color: MUTE }}>{c.endereco}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── CONTATO ─── */
function Contato() {
  return (
    <section id="contato" className="py-24 sm:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-5 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] mb-4" style={{ color: GOLD }}>Fale conosco</p>
            <h2 className="text-3xl sm:text-4xl font-black mb-6" style={{ color: INK }}>Estamos aqui para você.</h2>
            <p className="text-base leading-relaxed mb-10 max-w-md" style={{ color: MUTE }}>
              Estamos em Cariacica — ES e também online. Quer visitar um culto, conhecer nossos ministérios
              ou simplesmente conversar? Nossa equipe está aqui para você.
            </p>
            <div className="space-y-6">
              {[
                { icon: MapPin, label: 'Endereço', value: 'R. Dom Pedro II, 900, Cruzeiro do Sul, Cariacica — ES, 29144-080' },
                { icon: Instagram, label: 'Instagram', value: '@almachurchbrasil', href: INSTAGRAM_URL },
                { icon: Youtube, label: 'YouTube', value: '@AlmaChurchOficial', href: YOUTUBE_URL },
                { icon: Clock, label: 'Cultos', value: 'Qua 19h30 · Sáb 19h · Dom 9h, 11h e 18h' },
              ].map(c => {
                const Icon = c.icon
                const inner = (
                  <>
                    <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#F7F8FA' }}>
                      <Icon size={17} style={{ color: GOLD }} />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: MUTE }}>{c.label}</p>
                      <p className="text-sm font-medium" style={{ color: INK }}>{c.value}</p>
                    </div>
                  </>
                )
                return c.href ? (
                  <a key={c.label} href={c.href} target="_blank" rel="noopener noreferrer" className="flex items-start gap-4 transition-opacity hover:opacity-70">{inner}</a>
                ) : (
                  <div key={c.label} className="flex items-start gap-4">{inner}</div>
                )
              })}
            </div>
          </div>

          <div className="rounded-3xl p-8 sm:p-10" style={{ background: '#F7F8FA' }}>
            <h3 className="text-xl font-bold mb-6" style={{ color: INK }}>Envie uma mensagem</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input type="text" placeholder="Seu nome"
                  className="w-full rounded-xl px-4 py-3.5 text-sm border outline-none transition-colors focus:border-[#C8A35F] bg-white"
                  style={{ borderColor: '#E2E6EC', color: INK }} />
                <input type="tel" placeholder="(27) 00000-0000"
                  className="w-full rounded-xl px-4 py-3.5 text-sm border outline-none transition-colors focus:border-[#C8A35F] bg-white"
                  style={{ borderColor: '#E2E6EC', color: INK }} />
              </div>
              <input type="email" placeholder="seu@email.com"
                className="w-full rounded-xl px-4 py-3.5 text-sm border outline-none transition-colors focus:border-[#C8A35F] bg-white"
                style={{ borderColor: '#E2E6EC', color: INK }} />
              <select className="w-full rounded-xl px-4 py-3.5 text-sm border outline-none bg-white" style={{ borderColor: '#E2E6EC', color: INK }}>
                <option>Quero visitar um culto</option>
                <option>Informações sobre a Alma College</option>
                <option>Quero ser voluntário</option>
                <option>Pedido de oração</option>
                <option>Outros</option>
              </select>
              <textarea rows={4} placeholder="Como podemos ajudar você?"
                className="w-full rounded-xl px-4 py-3.5 text-sm border outline-none transition-colors focus:border-[#C8A35F] resize-none bg-white"
                style={{ borderColor: '#E2E6EC', color: INK }} />
              <button className="w-full py-4 rounded-full font-semibold text-sm transition-all hover:opacity-90" style={{ background: NAVY, color: '#fff' }}>
                Enviar Mensagem
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── FOOTER ─── */
function Footer() {
  const cols = [
    { title: 'A Igreja', links: ['Sobre a Alma Church', 'Nossa História', 'No que acreditamos', 'Liderança'] },
    { title: 'Ministérios', links: ['Alma College', 'Alma Cast', 'Alma Kids', 'Alma Worship', 'BASE', 'Missões'] },
    { title: 'Acompanhe', links: ['Últimos cultos', 'Podcast Alma Cast', 'Agenda', 'Cultos online'] },
  ]
  return (
    <footer style={{ background: NAVY }}>
      <div className="max-w-7xl mx-auto px-5 sm:px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-12">
          <div className="col-span-2">
            <AlmaLogo size={64} light />
            <p className="text-sm leading-relaxed mt-4 mb-5 max-w-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Acolhedora, Cuidadora & Frutífera. Cariacica — ES.
            </p>
            <div className="flex items-center gap-3">
              {[
                { Icon: Instagram, href: INSTAGRAM_URL },
                { Icon: Youtube, href: YOUTUBE_URL },
                { Icon: SpotifyIcon, href: SPOTIFY_URL },
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
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>© 2026 Alma Church. Todos os direitos reservados.</p>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>Feito com ♥ para o Reino de Deus</p>
        </div>
      </div>
    </footer>
  )
}

/* ─── PAGE ─── */
export default function IgrejaPage() {
  return (
    <div className="bg-white">
      <Navbar />
      <Hero />
      <Sobre />
      <Ministerios />
      <Midia />
      <AlmaCollegeCTA />
      <Agenda />
      <Testimonials />
      <Contribuir />
      <Cultos />
      <Contato />
      <Footer />
    </div>
  )
}
