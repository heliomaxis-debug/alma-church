'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { FileText, Image, Download, Upload, Search, CheckCircle, Clock, FolderOpen, X, Loader2 } from 'lucide-react'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'

const categories = ['Todos', 'Acadêmico', 'Contrato', 'Pessoal', 'Certificado']

const typeIcon: Record<string, React.ReactNode> = {
  pdf: <FileText size={18} />,
  img: <Image size={18} />,
}
const typeColor: Record<string, { color: string; bg: string }> = {
  pdf: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
  img: { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
}

function statusCfg(status: string) {
  if (status === 'APROVADO') return { color: '#16a34a', bg: 'rgba(34,197,94,0.1)', icon: <CheckCircle size={12} />, label: 'Aprovado' }
  if (status === 'PENDENTE') return { color: '#d97706', bg: 'rgba(217,119,6,0.1)', icon: <Clock size={12} />, label: 'Pendente' }
  return { color: '#2563eb', bg: 'rgba(59,130,246,0.1)', icon: <FileText size={12} />, label: status }
}

export default function DocumentosPage() {
  const [docs, setDocs] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('Todos')
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [uploadCategory, setUploadCategory] = useState('Acadêmico')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchDocs = useCallback(async () => {
    api.aluno.documentos().then(setDocs).catch(() => {})
  }, [])

  useEffect(() => { fetchDocs() }, [fetchDocs])

  function handleFileSelect(file: File) {
    setPendingFile(file)
    setShowModal(true)
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFileSelect(file)
    e.target.value = ''
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFileSelect(file)
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    if (!pendingFile) return
    setUploading(true)

    const isPdf = pendingFile.type === 'application/pdf' || pendingFile.name.toLowerCase().endsWith('.pdf')
    const type: 'pdf' | 'img' = isPdf ? 'pdf' : 'img'
    const size = pendingFile.size < 1024 * 1024
      ? `${Math.round(pendingFile.size / 1024)} KB`
      : `${(pendingFile.size / (1024 * 1024)).toFixed(1)} MB`

    try {
      await api.aluno.criarDocumento({
        name: pendingFile.name,
        category: uploadCategory,
        type,
        size,
      })
      setMsg({ text: 'Documento enviado! Aguardando aprovação.', ok: true })
      setShowModal(false)
      setPendingFile(null)
      await fetchDocs()
    } catch {
      setMsg({ text: 'Erro ao enviar documento.', ok: false })
    }
    setUploading(false)
    setTimeout(() => setMsg(null), 4000)
  }

  const filtered = docs.filter(d => {
    const matchCat = category === 'Todos' || d.category === category
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      {/* Toast */}
      {msg && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-lg text-sm font-medium text-white flex items-center gap-2 ${msg.ok ? 'bg-green-600' : 'bg-red-500'}`}>
          {msg.ok && <CheckCircle size={15} />} {msg.text}
        </div>
      )}

      {/* Modal: confirmar upload */}
      {showModal && pendingFile && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-900">Enviar Documento</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={16} /></button>
            </div>
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: pendingFile.name.toLowerCase().endsWith('.pdf') ? 'rgba(239,68,68,0.1)' : 'rgba(59,130,246,0.1)', color: pendingFile.name.toLowerCase().endsWith('.pdf') ? '#ef4444' : '#3b82f6' }}>
                  {pendingFile.name.toLowerCase().endsWith('.pdf') ? <FileText size={18} /> : <Image size={18} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{pendingFile.name}</p>
                  <p className="text-xs text-gray-400">{pendingFile.size < 1024 * 1024 ? `${Math.round(pendingFile.size / 1024)} KB` : `${(pendingFile.size / (1024 * 1024)).toFixed(1)} MB`}</p>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Categoria</label>
                <select value={uploadCategory} onChange={e => setUploadCategory(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none"
                  onFocus={ev => { ev.currentTarget.style.borderColor = '#C8A35F'; ev.currentTarget.style.boxShadow = '0 0 0 3px rgba(200,163,95,0.12)' }}
                  onBlur={ev => { ev.currentTarget.style.borderColor = ''; ev.currentTarget.style.boxShadow = '' }}>
                  {['Acadêmico', 'Contrato', 'Pessoal', 'Certificado'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-gray-100 text-gray-600 hover:bg-gray-200">Cancelar</button>
                <button type="submit" disabled={uploading}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-60"
                  style={{ background: '#C8A35F', color: '#071B34' }}>
                  {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                  Enviar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total de Documentos', value: docs.length, icon: <FileText size={18} />, color: '#4f46e5', bg: 'rgba(79,70,229,0.08)' },
          { label: 'Aprovados', value: docs.filter(d => d.status === 'APROVADO').length, icon: <CheckCircle size={18} />, color: '#16a34a', bg: 'rgba(22,163,74,0.08)' },
          { label: 'Pendentes', value: docs.filter(d => d.status === 'PENDENTE').length, icon: <FolderOpen size={18} />, color: '#C8A35F', bg: 'rgba(200,163,95,0.08)' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 shadow-card">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{s.label}</p>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={onInputChange} />

      {/* Upload area */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn('rounded-2xl border-2 border-dashed p-8 flex flex-col items-center gap-3 cursor-pointer transition-all duration-200', dragging ? 'scale-[1.01]' : '')}
        style={{ borderColor: dragging ? '#C8A35F' : '#e5e7eb', background: dragging ? 'rgba(200,163,95,0.04)' : 'white' }}
      >
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(200,163,95,0.1)', color: '#C8A35F' }}>
          <Upload size={22} />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-gray-700">Arraste arquivos aqui ou clique para enviar</p>
          <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG até 10 MB</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-card p-5">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar documentos..."
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none transition-all"
              onFocus={e => { e.currentTarget.style.borderColor = '#C8A35F'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(200,163,95,0.12)' }}
              onBlur={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.boxShadow = '' }} />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)}
                className={cn('px-3 py-2 rounded-xl text-xs font-semibold transition-all', category === cat ? '' : 'text-gray-500 bg-gray-100 hover:bg-gray-200')}
                style={category === cat ? { background: '#071B34', color: '#C8A35F' } : {}}>
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Documents list */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50">
          <h3 className="font-semibold text-gray-900">{filtered.length} {filtered.length === 1 ? 'documento' : 'documentos'}</h3>
        </div>
        <div className="divide-y divide-gray-50">
          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              <FolderOpen size={40} className="mx-auto text-gray-200 mb-3" />
              <p className="text-sm text-gray-400">Nenhum documento encontrado</p>
            </div>
          ) : (
            filtered.map(doc => {
              const tIcon = typeIcon[doc.type] ?? <FileText size={18} />
              const tColor = typeColor[doc.type] ?? { color: '#6b7280', bg: 'rgba(107,114,128,0.1)' }
              const sConfig = statusCfg(doc.status)
              return (
                <div key={doc.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/60 transition-colors group">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: tColor.bg, color: tColor.color }}>
                    {tIcon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{doc.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{doc.category} · {new Date(doc.createdAt).toLocaleDateString('pt-BR')} · {doc.size || '—'}</p>
                  </div>
                  <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: sConfig.bg, color: sConfig.color }}>
                    {sConfig.icon}{sConfig.label}
                  </span>
                  <button className="ml-2 p-2 rounded-xl opacity-0 group-hover:opacity-100 hover:bg-gray-100 transition-all text-gray-400 hover:text-gray-700" title="Baixar">
                    <Download size={16} />
                  </button>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
