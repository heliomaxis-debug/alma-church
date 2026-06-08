'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { notFound } from 'next/navigation'
import {
  ArrowLeft, ArrowRight, CheckCircle2, Clock, Users, BookOpen,
  GraduationCap, Star, Globe2, Play, Calendar, Award,
  Instagram, Facebook, Youtube, Mail,
} from 'lucide-react'

/* ─── DADOS DE CADA ESCOLA ─── */
const escolasData: Record<string, {
  id: string
  name: string
  subtitle: string
  tagline: string
  desc: string
  fullDesc: string
  color: string
  bg: string
  photo: string | null
  icon?: React.ReactNode
  stats: { label: string; value: string }[]
  publico: string
  formato: string
  duracao: string
  modulos: { titulo: string; desc: string }[]
  diferenciais: string[]
  cta: string
}> = {
  btcp: {
    id: 'btcp',
    name: 'BTCP',
    subtitle: 'Seminário Teológico',
    tagline: 'Formação teológica completa para chamados e líderes.',
    desc: 'O BTCP é o Seminário Teológico da Alma College, formando homens e mulheres chamados ao ministério com excelência acadêmica e profundidade bíblica.',
    fullDesc: 'O BTCP (Biblical Training and Christian Purpose) é uma das mais completas formações teológicas do Brasil. Com um currículo robusto que abrange desde os fundamentos da fé cristã até hermenêutica avançada, o seminário prepara seus alunos para servir com competência e integridade no ministério. O programa é reconhecido por sua abordagem prática, integrando o estudo teórico com aplicações reais no contexto ministerial.',
    color: '#C8A35F',
    bg: 'linear-gradient(160deg, #071B34 0%, #0d2d50 100%)',
    photo: null,
    stats: [
      { label: 'Alunos Formados', value: '+1.200' },
      { label: 'Módulos', value: '48' },
      { label: 'Professores', value: '18' },
      { label: 'Anos de história', value: '12' },
    ],
    publico: 'Chamados ao ministério, pastores, líderes de igrejas e comunidades, teólogos e todos que desejam aprofundar seu conhecimento bíblico.',
    formato: 'Presencial aos sábados + Plataforma EAD com aulas gravadas e ao vivo',
    duracao: '10 manuais, com certificado ao fim de cada etapa',
    modulos: [
      { titulo: 'Teologia Bíblica', desc: 'Fundamentos do Antigo e Novo Testamento, hermenêutica e exegese.' },
      { titulo: 'Teologia Sistemática', desc: 'Doutrina de Deus, soteriologia, eclesiologia, escatologia e pneumatologia.' },
      { titulo: 'Homilética e Pregação', desc: 'Técnicas de elaboração e entrega de sermões com excelência.' },
      { titulo: 'Grego e Hebraico', desc: 'Introdução às línguas originais para estudo aprofundado das Escrituras.' },
      { titulo: 'Liderança e Ministério', desc: 'Gestão ministerial, aconselhamento pastoral e plantação de igrejas.' },
      { titulo: 'História da Igreja', desc: 'Da Igreja primitiva à Reforma Protestante e o movimento evangélico no Brasil.' },
    ],
    diferenciais: [
      'Certificação reconhecida por instituições parceiras nacionais e internacionais',
      'Corpo docente com mestres e doutores em teologia',
      'Biblioteca digital com +5.000 títulos teológicos',
      'Imersões presenciais e retiros espirituais anuais',
      'Mentoria individual com professores e líderes experientes',
      'Portal do aluno completo com notas, materiais e certificados digitais',
    ],
    cta: 'Quero me matricular no BTCP',
  },
  casados: {
    id: 'casados',
    name: 'Casados Para Sempre',
    subtitle: '',
    tagline: 'Fortalecendo casamentos e famílias para uma vida plena.',
    desc: 'Um programa transformador que ajuda casais a construírem relacionamentos sólidos, baseados em princípios bíblicos e ferramentas práticas para uma vida conjugal plena.',
    fullDesc: 'O Casados Para Sempre nasce da convicção de que o casamento é uma instituição divina e merece investimento. Por meio de encontros dinâmicos, ensinamentos práticos e conteúdos aplicáveis ao cotidiano, casais de todas as fases do relacionamento encontram ferramentas para se reconectar, crescer juntos e construir uma família com propósito. Já transformou mais de 3.000 casamentos em todo o Brasil.',
    color: '#F43F5E',
    bg: 'linear-gradient(160deg, #1a0a0a 0%, #3d1515 100%)',
    photo: 'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?w=1200&q=80',
    stats: [
      { label: 'Casais Impactados', value: '+3.000' },
      { label: 'Módulos', value: '12' },
      { label: 'Países', value: '5' },
      { label: 'Satisfação', value: '97%' },
    ],
    publico: 'Casais em qualquer fase do relacionamento: noivos, recém-casados, casais com filhos e casamentos em crise que buscam restauração.',
    formato: 'Encontros presenciais mensais (sextas à noite e sábados) + Conteúdo online com exercícios para dupla',
    duracao: '12 módulos ao longo de 1 ano, com retiro anual de imersão',
    modulos: [
      { titulo: 'Fundamentos do Casamento', desc: 'O propósito de Deus para o casamento e a visão de vida conjugal saudável.' },
      { titulo: 'Comunicação Eficaz', desc: 'Ferramentas práticas para escuta ativa, diálogo e resolução de conflitos.' },
      { titulo: 'Inteligência Emocional no Lar', desc: 'Como lidar com emoções, temperamentos e diferenças de forma saudável.' },
      { titulo: 'Finanças do Casal', desc: 'Planejamento financeiro conjunto, sonhos e metas compartilhados.' },
      { titulo: 'Vida Íntima e Cumplicidade', desc: 'A importância da conexão emocional, espiritual e física no casamento.' },
      { titulo: 'Família e Legado', desc: 'Criação de filhos com propósito e como deixar um legado geracional.' },
    ],
    diferenciais: [
      'Metodologia exclusiva desenvolvida por especialistas em família e psicólogos cristãos',
      'Dinâmicas práticas para casais, não apenas teoria',
      'Comunidade exclusiva de casais para networking e suporte',
      'Retiro anual de imersão para aprofundamento',
      'Acompanhamento pós-programa com grupo de apoio',
      'Material didático completo para cada módulo',
    ],
    cta: 'Quero fortalecer meu casamento',
  },
  seeds: {
    id: 'seeds',
    name: 'Seeds Across Nation',
    subtitle: '',
    tagline: 'Escola de inglês para crianças com propósito e excelência.',
    desc: 'O Seeds Across Nation é uma escola de inglês diferenciada que combina metodologia inovadora de ensino de idiomas com valores cristãos, preparando crianças para um mundo global.',
    fullDesc: 'No Seeds Across Nation, acreditamos que aprender inglês vai além das palavras — é plantar sementes de caráter, fé e excelência. Nossa metodologia exclusiva, desenvolvida para crianças de 3 a 14 anos, combina imersão linguística, atividades lúdicas e conteúdo baseado em valores bíblicos. Com professores nativos e certificados, nossos alunos desenvolvem fluência com alegria e propósito.',
    color: '#10B981',
    bg: 'linear-gradient(160deg, #0a1a0a 0%, #153d15 100%)',
    photo: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=1200&q=80',
    stats: [
      { label: 'Crianças Atendidas', value: '+2.500' },
      { label: 'Faixas Etárias', value: '4' },
      { label: 'Professores Nativos', value: '15' },
      { label: 'Aprovação dos Pais', value: '99%' },
    ],
    publico: 'Crianças de 3 a 14 anos, divididas por faixas etárias: Seeds (3-5), Sprouts (6-8), Branches (9-11) e Fruits (12-14).',
    formato: 'Aulas presenciais 2x por semana (45-60 min) + App exclusivo com atividades gamificadas para praticar em casa',
    duracao: 'Programa contínuo anual com avaliações semestrais e certificação de nível',
    modulos: [
      { titulo: 'Seeds (3-5 anos)', desc: 'Imersão por músicas, histórias e brincadeiras. Vocabulário e sons do inglês de forma natural.' },
      { titulo: 'Sprouts (6-8 anos)', desc: 'Primeiras frases, leitura inicial e conversação simples com temas bíblicos.' },
      { titulo: 'Branches (9-11 anos)', desc: 'Gramática estruturada, leitura de histórias e produção de textos simples.' },
      { titulo: 'Fruits (12-14 anos)', desc: 'Conversação avançada, redação, preparação para exames internacionais.' },
      { titulo: 'Valores e Caráter', desc: 'Cada aula traz um valor cristão integrado ao aprendizado do idioma.' },
      { titulo: 'Certificação', desc: 'Avaliação semestral e certificado de conclusão de nível reconhecido.' },
    ],
    diferenciais: [
      'Metodologia exclusiva Seeds, desenvolvida para o contexto cristão brasileiro',
      'Professores nativos e formados em pedagogia bilíngue',
      'App gamificado para prática diária em casa',
      'Turmas reduzidas com máximo de 12 alunos',
      'Relatórios mensais de progresso para os pais',
      'Festival anual de apresentações em inglês',
    ],
    cta: 'Matricular meu filho no Seeds',
  },
  'alma-kids': {
    id: 'alma-kids',
    name: 'Alma Kids',
    subtitle: '',
    tagline: 'Formação cristã que inspira e transforma o futuro.',
    desc: 'O Alma Kids é um programa completo de formação cristã para crianças e jovens, integrando fé, cultura, esportes e artes para desenvolver uma geração com propósito e caráter.',
    fullDesc: 'O Alma Kids surge do entendimento de que a formação de caráter começa na infância. Mais do que um ministério infantil, é uma escola de vida que integra o ensino bíblico com atividades culturais, esportivas e artísticas. Crianças e jovens de 0 a 17 anos encontram um ambiente seguro, acolhedor e estimulante para crescer na fé e descobrir seus dons e talentos.',
    color: '#F59E0B',
    bg: 'linear-gradient(160deg, #1a1200 0%, #3d2e00 100%)',
    photo: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1200&q=80',
    stats: [
      { label: 'Crianças e Jovens', value: '+4.000' },
      { label: 'Programas', value: '6' },
      { label: 'Voluntários Treinados', value: '+300' },
      { label: 'Cidades', value: '8' },
    ],
    publico: 'Bebês, crianças e jovens de 0 a 17 anos, divididos por faixas etárias em ambientes especialmente preparados para cada fase do desenvolvimento.',
    formato: 'Encontros semanais presenciais + Atividades extracurriculares (esportes, artes, música) e eventos especiais ao longo do ano',
    duracao: 'Programa anual contínuo com progressão por faixa etária',
    modulos: [
      { titulo: 'Berçário e Maternal (0-3 anos)', desc: 'Ambiente acolhedor e estimulante para os primeiros anos com cuidado e amor cristão.' },
      { titulo: 'Jardim da Fé (4-6 anos)', desc: 'Histórias bíblicas, músicas e brincadeiras que ensinam sobre Deus de forma lúdica.' },
      { titulo: 'Kids (7-10 anos)', desc: 'Estudo bíblico estruturado, dinâmicas, missões e desenvolvimento do caráter cristão.' },
      { titulo: 'Pré-Teens (11-13 anos)', desc: 'Formação para a adolescência com diálogo sobre identidade, fé e propósito.' },
      { titulo: 'Teens (14-17 anos)', desc: 'Aprofundamento bíblico, liderança jovem, projetos sociais e missões locais.' },
      { titulo: 'Arte, Esporte e Cultura', desc: 'Atividades extracurriculares integradas à formação cristã e ao desenvolvimento de talentos.' },
    ],
    diferenciais: [
      'Currículo bíblico progressivo e adequado para cada faixa etária',
      'Voluntários e educadores treinados e certificados pelo Alma Kids',
      'Espaços físicos especialmente projetados para cada fase',
      'Integração entre fé, artes, esportes e cultura',
      'Eventos especiais: Páscoa Kids, Natal Kids, acampamentos',
      'Parceria com os pais: materiais de apoio para formação em casa',
    ],
    cta: 'Inscrever meu filho no Alma Kids',
  },
  base: {
    id: 'base',
    name: 'BASE',
    subtitle: 'Ministério de Organização',
    tagline: 'Capacitando voluntários e líderes para servir com excelência.',
    desc: 'O BASE é o programa de formação de voluntários e líderes ministeriais da Alma College, desenvolvendo competências de gestão, organização e liderança eclesiástica.',
    fullDesc: 'O BASE (Building A Serving Excellence) nasce da necessidade de capacitar os bastidores do ministério. Voluntários e líderes que sustentam igrejas e organizações cristãs encontram aqui uma formação completa em gestão de equipes, organização de eventos, comunicação ministerial e liderança servidora. Um programa essencial para quem acredita que excelência é uma forma de adoração.',
    color: '#8B5CF6',
    bg: 'linear-gradient(160deg, #0a0a1a 0%, #1a1a3d 100%)',
    photo: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&q=80',
    stats: [
      { label: 'Voluntários Formados', value: '+5.000' },
      { label: 'Igrejas Parceiras', value: '+200' },
      { label: 'Módulos', value: '10' },
      { label: 'Países', value: '7' },
    ],
    publico: 'Voluntários de qualquer área ministerial, coordenadores de departamentos, líderes de equipes, pastores auxiliares e todos que desejam servir com mais excelência.',
    formato: 'Intensivos mensais presenciais (finais de semana) + Plataforma online com trilhas de aprendizado por área de atuação',
    duracao: '10 módulos ao longo de 10 meses + Certificação por módulo concluído',
    modulos: [
      { titulo: 'Fundamentos do Servir', desc: 'A teologia do serviço, motivação correta e postura do voluntário excelente.' },
      { titulo: 'Liderança Servidora', desc: 'Princípios de liderança cristã, gestão de equipes e desenvolvimento de pessoas.' },
      { titulo: 'Gestão de Equipes', desc: 'Recrutamento, treinamento, delegação e acompanhamento de voluntários.' },
      { titulo: 'Organização de Eventos', desc: 'Planejamento, logística, comunicação e execução de eventos ministeriais.' },
      { titulo: 'Comunicação e Marketing Cristão', desc: 'Redes sociais, identidade visual e comunicação eficaz para igrejas.' },
      { titulo: 'Finanças Ministeriais', desc: 'Gestão de recursos, prestação de contas e planejamento financeiro eclesiástico.' },
      { titulo: 'Gestão de Conflitos', desc: 'Mediação, restauração e cultura de paz nas equipes ministeriais.' },
      { titulo: 'Tecnologia para o Ministério', desc: 'Ferramentas digitais, sistemas de gestão e automação para igrejas.' },
      { titulo: 'Visão Missional', desc: 'Engajamento com missões locais e internacionais, projetos sociais.' },
      { titulo: 'Legado e Sucessão', desc: 'Como multiplicar líderes e garantir a continuidade do ministério.' },
    ],
    diferenciais: [
      'Formação prática orientada para resultados imediatos no ministério',
      'Rede de +200 igrejas parceiras para networking e oportunidades',
      'Trilhas de aprendizado por área: música, audiovisual, secretaria, recepção',
      'Certificado reconhecido por igrejas e organizações parceiras',
      'Mentoria em grupo com líderes experientes de diferentes contextos',
      'Material didático aplicável diretamente ao contexto local de cada aluno',
    ],
    cta: 'Quero me tornar um líder no BASE',
  },
  online: {
    id: 'online',
    name: 'Cursos Online',
    subtitle: '',
    tagline: 'Aprenda onde estiver com cursos gravados e ao vivo.',
    desc: 'A plataforma de cursos online da Alma College reúne mais de 120 cursos em teologia, liderança, família, música e muito mais, acessíveis a qualquer hora, em qualquer lugar.',
    fullDesc: 'A plataforma de Cursos Online da Alma College democratiza o acesso ao ensino cristão de qualidade. Com mais de 120 cursos disponíveis, gravados por mestres e especialistas renomados, qualquer pessoa pode aprender no seu próprio ritmo. Além dos cursos gravados, realizamos transmissões ao vivo semanais com professores convidados, sessões de perguntas e respostas e comunidade ativa de alunos.',
    color: '#3B82F6',
    bg: 'linear-gradient(160deg, #071B34 0%, #0d1f40 100%)',
    photo: null,
    stats: [
      { label: 'Cursos Disponíveis', value: '+120' },
      { label: 'Alunos Online', value: '+6.000' },
      { label: 'Professores', value: '+60' },
      { label: 'Países Alcançados', value: '15' },
    ],
    publico: 'Qualquer pessoa que deseja aprender, sem restrição de idade ou localização. Desde quem busca o primeiro contato com a fé cristã até pastores e líderes experientes.',
    formato: '100% digital: cursos gravados (assista quando quiser) + aulas ao vivo semanais + comunidade online exclusiva',
    duracao: 'Cursos de 4h a 40h, com acesso por 1 ano após a compra e certificado ao concluir',
    modulos: [
      { titulo: 'Teologia e Bíblia', desc: 'Cursos de hermenêutica, teologia sistemática, livros da Bíblia e muito mais.' },
      { titulo: 'Liderança e Gestão', desc: 'Liderança cristã, gestão ministerial, coaching e desenvolvimento pessoal.' },
      { titulo: 'Família e Relacionamentos', desc: 'Casamento, criação de filhos, finanças familiares e restauração.' },
      { titulo: 'Música e Artes', desc: 'Teoria musical, louvor e adoração, regência, produção musical cristã.' },
      { titulo: 'Missões e Evangelismo', desc: 'Missões transculturais, evangelismo contextual, plantação de igrejas.' },
      { titulo: 'Ao Vivo e Eventos Especiais', desc: 'Lives semanais com professores convidados, conferências e Q&A exclusivos.' },
    ],
    diferenciais: [
      'Mais de 120 cursos disponíveis com novos lançamentos mensais',
      'Acesso vitalício (durante a assinatura) em qualquer dispositivo',
      'Certificado digital ao concluir cada curso',
      'Comunidade exclusiva de alunos para networking e crescimento',
      'Aulas ao vivo semanais com especialistas convidados',
      'Planos individuais, familiares e para igrejas e organizações',
    ],
    cta: 'Começar a aprender agora',
  },
}

/* ─── LOGO ─── */
function AlmaLogo({ size = 36 }: { size?: number }) {
  return (
    <img src="/logo-alma-church.png" alt="Alma Church"
      style={{ height: size, width: 'auto', filter: 'invert(1)', objectFit: 'contain', flexShrink: 0 }} />
  )
}

/* ─── PÁGINA ─── */
export default function EscolaPage() {
  const params = useParams()
  const id = params?.id as string
  const escola = escolasData[id]

  if (!escola) {
    notFound()
    return null
  }

  return (
    <div className="min-h-screen" style={{ background: '#050F1E' }}>

      {/* ── NAVBAR ── */}
      <nav className="fixed top-0 left-0 right-0 z-50"
        style={{ background: 'rgba(5,15,30,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(200,163,95,0.12)' }}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
          <Link href="/" className="flex items-center">
            <AlmaLogo size={42} />
          </Link>
          <Link href="/#escolas"
            className="flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-white"
            style={{ color: 'rgba(255,255,255,0.55)' }}>
            <ArrowLeft size={14} /> Todas as escolas
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative pt-16 min-h-[55vh] flex items-end">
        {/* Background */}
        {escola.photo ? (
          <>
            <img src={escola.photo} alt={escola.name}
              className="absolute inset-0 w-full h-full object-cover" style={{ filter: 'brightness(0.25)' }} />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #050F1E 0%, rgba(5,15,30,0.7) 50%, rgba(5,15,30,0.2) 100%)' }} />
          </>
        ) : (
          <div className="absolute inset-0" style={{ background: escola.bg }} />
        )}

        {/* Gold dot grid subtle */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #C8A35F 1px, transparent 0)', backgroundSize: '40px 40px' }} />

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 pb-16 pt-20 w-full">
          {/* Tag */}
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-5 text-xs font-semibold tracking-widest uppercase"
            style={{ background: `${escola.color}15`, border: `1px solid ${escola.color}40`, color: escola.color }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: escola.color }} />
            {escola.subtitle || 'Alma College'}
          </div>

          <h1 className="text-5xl lg:text-7xl font-black text-white leading-none mb-4 uppercase tracking-tight">
            {escola.name.split('\n').map((line, i) => <span key={i}>{line}<br /></span>)}
          </h1>
          {escola.subtitle && (
            <p className="text-xl font-bold uppercase tracking-widest mb-4" style={{ color: escola.color }}>
              {escola.subtitle}
            </p>
          )}
          <p className="text-lg leading-relaxed max-w-2xl mb-8" style={{ color: 'rgba(255,255,255,0.65)' }}>
            {escola.tagline}
          </p>
          <Link href="/login"
            className="inline-flex items-center gap-2 px-7 py-4 rounded-xl font-bold text-sm transition-all hover:scale-105"
            style={{ background: `linear-gradient(135deg, ${escola.color}, #b08030)`, color: '#071B34', boxShadow: `0 8px 30px ${escola.color}40` }}>
            {escola.cta} <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{ background: '#071B34', borderTop: '1px solid rgba(200,163,95,0.1)', borderBottom: '1px solid rgba(200,163,95,0.1)' }}>
        <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {escola.stats.map(s => (
            <div key={s.label}>
              <p className="text-3xl font-black text-white mb-1">{s.value}</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── SOBRE ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Texto */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: escola.color }}>Sobre o programa</p>
              <h2 className="text-3xl font-black mb-5" style={{ color: '#071B34' }}>
                O que é o {escola.name.replace('\n', ' ')}?
              </h2>
              <p className="text-base leading-relaxed mb-6" style={{ color: '#475569' }}>
                {escola.fullDesc}
              </p>

              {/* Info cards */}
              <div className="space-y-3">
                <div className="flex items-start gap-3 rounded-xl p-4" style={{ background: '#F8F9FC', border: '1px solid #E8EBF0' }}>
                  <Users size={18} style={{ color: escola.color }} className="flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: '#94A3B8' }}>Público-alvo</p>
                    <p className="text-sm" style={{ color: '#334155' }}>{escola.publico}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-xl p-4" style={{ background: '#F8F9FC', border: '1px solid #E8EBF0' }}>
                  <Play size={18} style={{ color: escola.color }} className="flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: '#94A3B8' }}>Formato</p>
                    <p className="text-sm" style={{ color: '#334155' }}>{escola.formato}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-xl p-4" style={{ background: '#F8F9FC', border: '1px solid #E8EBF0' }}>
                  <Clock size={18} style={{ color: escola.color }} className="flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: '#94A3B8' }}>Duração</p>
                    <p className="text-sm" style={{ color: '#334155' }}>{escola.duracao}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Diferenciais */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: escola.color }}>Diferenciais</p>
              <h2 className="text-3xl font-black mb-5" style={{ color: '#071B34' }}>
                Por que escolher o {escola.name.replace('\n', ' ')}?
              </h2>
              <div className="space-y-3">
                {escola.diferenciais.map((d, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 size={18} className="flex-shrink-0 mt-0.5" style={{ color: escola.color }} />
                    <p className="text-sm leading-relaxed" style={{ color: '#475569' }}>{d}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MÓDULOS ── */}
      <section className="py-20" style={{ background: '#F8F9FC' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: escola.color }}>Conteúdo programático</p>
            <h2 className="text-3xl font-black" style={{ color: '#071B34' }}>
              O que você vai aprender
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {escola.modulos.map((m, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border transition-all hover:-translate-y-1 hover:shadow-lg"
                style={{ borderColor: '#E8EBF0' }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black"
                    style={{ background: `${escola.color}15`, color: escola.color }}>
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <h4 className="font-bold text-sm" style={{ color: '#071B34' }}>{m.titulo}</h4>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: '#64748B' }}>{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="py-20" style={{ background: '#071B34', borderTop: '1px solid rgba(200,163,95,0.12)' }}>
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: `${escola.color}15`, border: `1.5px solid ${escola.color}40` }}>
            <GraduationCap size={28} style={{ color: escola.color }} />
          </div>
          <h2 className="text-3xl font-black text-white mb-3">
            Pronto para começar sua jornada?
          </h2>
          <p className="text-base mb-8" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Junte-se a milhares de pessoas que já transformaram sua vida através do {escola.name.replace('\n', ' ')}.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-sm transition-all hover:scale-105"
              style={{ background: `linear-gradient(135deg, ${escola.color}, #b08030)`, color: '#071B34', boxShadow: `0 8px 30px ${escola.color}40` }}>
              {escola.cta} <ArrowRight size={16} />
            </Link>
            <Link href="/#escolas"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-sm border text-white transition-all hover:bg-white/10"
              style={{ borderColor: 'rgba(255,255,255,0.15)' }}>
              <ArrowLeft size={16} /> Ver outras escolas
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER SIMPLES ── */}
      <footer style={{ background: '#050F1E', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <AlmaLogo size={44} />
          </div>
          <div className="flex items-center gap-3">
            {[Instagram, Facebook, Youtube, Mail].map((Icon, i) => (
              <a key={i} href="#"
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-white/10"
                style={{ color: 'rgba(255,255,255,0.3)' }}>
                <Icon size={15} />
              </a>
            ))}
          </div>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
            © 2026 Alma College. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
