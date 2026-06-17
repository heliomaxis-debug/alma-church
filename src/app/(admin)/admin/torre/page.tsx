'use client'

import { useEffect, useState, useCallback } from 'react'
import { Flame, Trash2, Loader2, Moon, Sunrise, Sun, Sunset, Phone, Users } from 'lucide-react'
import { api } from '@/lib/api'

const HORARIOS = [
  { hora: '03:00', label: 'Madrugada', icon: Moon },
  { hora: '05:30', label: 'Manhã', icon: Sunrise },
  { hora: '15:00', label: 'Tarde', icon: Sun },
  { hora: '22:00', label: 'Noite', icon: Sunset },
]
const DIAS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

export default function AdminTorrePage() {
  const [inscricoes, setInscricoes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [removing, setRemoving] = useState<string | null>(null)
  const [msg, setMsg] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const data = await api.admin.torreOracao().catch(() => [])
    setInscricoes(data)
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  async function handleRemove(id: string, nome: string) {
    if (!confirm(`Remover a inscrição de ${nome}?`)) return
    setRemoving(id)
    try {
      await api.admin.deletarInscricaoOracao(id)
      setMsg(`Inscrição de ${nome} removida.`)
      await fetchData()
    } catch {
      setMsg('Erro ao remover.')
    }
    setRemoving(null)
    setTimeout(() => setMsg(null), 3000)
  }

  const whatsappLink = (tel: string) => `https://wa.me/55${tel.replace(/\D/g, '')}`
  const total = inscricoes.length

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      {msg && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-lg text-sm font-medium text-white bg-green-600">{msg}</div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Flame size={20} style={{ color: '#C8A35F' }} /> Torre de Oração
          </h2>
          <p className="text-sm text-gray-400 mt-0.5">{total} {total === 1 ? 'inscrito' : 'inscritos'} na escala de oração</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 size={26} className="animate-spin" style={{ color: '#C8A35F' }} /></div>
      ) : total === 0 ? (
        <div className="bg-white rounded-2xl shadow-card py-16 text-center">
          <Users size={36} className="mx-auto text-gray-200 mb-2" />
          <p className="text-sm text-gray-400">Nenhuma inscrição na Torre de Oração ainda.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {HORARIOS.map(({ hora, label, icon: Icon }) => {
            const doHorario = inscricoes.filter(i => i.horario === hora)
            return (
              <div key={hora} className="bg-white rounded-2xl shadow-card overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(200,163,95,0.1)' }}>
                    <Icon size={17} style={{ color: '#C8A35F' }} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{hora} · {label}</p>
                    <p className="text-xs text-gray-400">{doHorario.length} inscrito(s)</p>
                  </div>
                </div>
                {doHorario.length === 0 ? (
                  <p className="px-6 py-5 text-sm text-gray-300 italic">Nenhum inscrito neste horário.</p>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {DIAS.filter(dia => doHorario.some(i => i.dia === dia)).map(dia => (
                      <div key={dia} className="px-6 py-3">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">{dia}</p>
                        <div className="space-y-2">
                          {doHorario.filter(i => i.dia === dia).map(i => (
                            <div key={i.id} className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                                style={{ background: 'rgba(200,163,95,0.12)', color: '#b08030' }}>
                                {i.nome.split(' ').map((w: string) => w[0]).slice(0, 2).join('')}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate">{i.nome}</p>
                                <a href={whatsappLink(i.whatsapp)} target="_blank" rel="noopener noreferrer"
                                  className="text-xs text-gray-400 hover:text-green-600 flex items-center gap-1 transition-colors">
                                  <Phone size={11} /> {i.whatsapp}
                                </a>
                              </div>
                              <button onClick={() => handleRemove(i.id, i.nome)} disabled={removing === i.id}
                                className="flex-shrink-0 p-2 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all disabled:opacity-50">
                                {removing === i.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
