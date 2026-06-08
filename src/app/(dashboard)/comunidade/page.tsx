'use client'
import { useState } from 'react'
import { MessageCircle, ThumbsUp, Share2, BookMarked, Send, Users } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

const posts = [
  {
    id: 1,
    authorName: 'Rev. Carlos Mendes',
    role: 'Professor · AT-101',
    initials: 'CM',
    color: '#3B82F6',
    time: '2h atrás',
    content: 'Pessoal, compartilho aqui um artigo excelente sobre hermenêutica histórico-gramatical que complementa nossa aula de ontem. O autor faz uma análise profunda sobre os princípios de interpretação dos Profetas Menores. Vale muito a leitura! 📖',
    likes: 24, comments: 8, tag: 'AT-101', tagColor: '#3B82F6', likedByMe: false,
  },
  {
    id: 2,
    authorName: 'João Silva',
    role: 'Aluno · BTCP Manual 7',
    initials: 'JS',
    color: '#C8A35F',
    time: '5h atrás',
    content: 'Acabei de terminar meu trabalho de Hermenêutica! Foi desafiador mas muito enriquecedor estudar a estrutura quiástica do livro de Amós. Se alguém quiser trocar referências, estou por aqui. #BTCP #Hermeneutica',
    likes: 12, comments: 5, tag: 'HM-201', tagColor: '#F59E0B', likedByMe: true,
  },
  {
    id: 3,
    authorName: 'Dr. Paulo Ferreira',
    role: 'Professor · NT-101',
    initials: 'PF',
    color: '#8B5CF6',
    time: '1 dia atrás',
    content: '🎓 Lembrando que teremos aula especial sobre o Contexto do Império Romano na quinta-feira! Será uma aula fundamental para entender as cartas paulinas. Traga suas anotações do capítulo 4.',
    likes: 31, comments: 15, tag: 'NT-101', tagColor: '#8B5CF6', likedByMe: false,
  },
  {
    id: 4,
    authorName: 'Rev. Tiago Santos',
    role: 'Professor · HO-301',
    initials: 'TS',
    color: '#06B6D4',
    time: '2 dias atrás',
    content: '✨ Exercício de homilética: escolha um texto do NT e esboce um sermão expositivo em 3 movimentos. Poste aqui seu esboço para feedback da turma. Essa prática é essencial para nossa próxima aula!',
    likes: 18, comments: 22, tag: 'HO-301', tagColor: '#06B6D4', likedByMe: false,
  },
]

export default function ComunidadePage() {
  const { user } = useAuth()
  const [liked, setLiked] = useState<Record<number, boolean>>({ 2: true })
  const [newPost, setNewPost] = useState('')

  const name = user?.aluno?.name ?? user?.professor?.name ?? 'Você'
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black" style={{ color: '#071B34' }}>Comunidade</h1>
          <p className="text-sm mt-1" style={{ color: '#94A3B8' }}>Feed da turma BTCP 2026</p>
        </div>
        <div className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full"
          style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981' }}>
          <Users size={13} /> 47 membros
        </div>
      </div>

      {/* New post */}
      <div className="bg-white rounded-2xl border p-4" style={{ borderColor: '#E8EBF0' }}>
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #C8A35F, #b08030)', color: '#071B34' }}>
            {initials}
          </div>
          <div className="flex-1">
            <textarea value={newPost} onChange={e => setNewPost(e.target.value)}
              placeholder={`O que você quer compartilhar, ${name.split(' ')[0]}?`}
              rows={3} className="w-full text-sm resize-none outline-none rounded-xl p-3 transition-all"
              style={{ background: '#F8F9FC', border: '1.5px solid #E8EBF0', color: '#0D1117' }}
              onFocus={e => (e.target.style.borderColor = '#C8A35F')}
              onBlur={e => (e.target.style.borderColor = '#E8EBF0')} />
            <div className="flex items-center justify-between mt-2">
              <button className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors" style={{ color: '#94A3B8' }}>
                <BookMarked size={15} />
              </button>
              <button disabled={!newPost.trim()}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, #C8A35F, #b08030)', color: '#071B34' }}>
                <Send size={12} /> Publicar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Posts */}
      <div className="space-y-4">
        {posts.map(post => (
          <div key={post.id} className="bg-white rounded-2xl border p-5" style={{ borderColor: '#E8EBF0' }}>
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0"
                style={{ background: `${post.color}20`, color: post.color }}>
                {post.initials}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-sm" style={{ color: '#071B34' }}>{post.authorName}</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: `${post.tagColor}15`, color: post.tagColor }}>
                    {post.tag}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs" style={{ color: '#94A3B8' }}>{post.role}</span>
                  <span style={{ color: '#E8EBF0' }}>·</span>
                  <span className="text-xs" style={{ color: '#94A3B8' }}>{post.time}</span>
                </div>
              </div>
            </div>

            <p className="text-sm leading-relaxed mb-4" style={{ color: '#374151' }}>{post.content}</p>

            <div className="flex items-center gap-4 pt-3" style={{ borderTop: '1px solid #F8F9FC' }}>
              <button onClick={() => setLiked(l => ({ ...l, [post.id]: !l[post.id] }))}
                className="flex items-center gap-1.5 text-xs font-medium transition-colors"
                style={{ color: liked[post.id] ? '#C8A35F' : '#94A3B8' }}>
                <ThumbsUp size={14} fill={liked[post.id] ? '#C8A35F' : 'none'} />
                {post.likes + (liked[post.id] && !post.likedByMe ? 1 : !liked[post.id] && post.likedByMe ? -1 : 0)}
              </button>
              <button className="flex items-center gap-1.5 text-xs font-medium" style={{ color: '#94A3B8' }}>
                <MessageCircle size={14} /> {post.comments} comentários
              </button>
              <button className="flex items-center gap-1.5 text-xs font-medium ml-auto" style={{ color: '#94A3B8' }}>
                <Share2 size={13} /> Compartilhar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
