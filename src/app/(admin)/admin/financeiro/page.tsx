'use client'

import { useEffect, useState, useCallback } from 'react'
import { CreditCard, CheckCircle, Clock, Search, Plus, X, Loader2 } from 'lucide-react'
import { api } from '@/lib/api'

const nomeMes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

export default function AdminFinanceiro() {
  const [pagamentos, setPagamentos] = useState<any[]>([])
  const [alunos, setAlunos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'TODOS' | 'PAGO' | 'PENDENTE'>('TODOS')
  const [marking, setMarking] = useState<string | null>(null)
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null)

  // Gerar mensalidades
  const [showGerar, setShowGerar] = useState(false)
  const [gerarForm, setGerarForm] = useState({
    alunoId: '',
    todos: false,
    ano: new Date().getFullYear(),
    valor: 350,
    meses: [] as number[],
  })
  const [gerando, setGerando] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const [p, a] = await Promise.all([
      api.admin.pagamentos().catch(() => []),
      api.admin.alunos().catch(() => []),
    ])
    setPagamentos(p)
    setAlunos(a)
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  async function marcarPago(id: string) {
    setMarking(id)
    try {
      await api.admin.marcarPago(id, 'PIX')
      setMsg({ text: 'Pagamento marcado como pago!', ok: true })
      await fetchData()
    } catch {
      setMsg({ text: 'Erro ao atualizar pagamento.', ok: false })
    }
    setMarking(null)
    setTimeout(() => setMsg(null), 3000)
  }

  function toggleMes(m: number) {
    setGerarForm(f => ({
      ...f,
      meses: f.meses.includes(m) ? f.meses.filter(x => x !== m) : [...f.meses, m],
    }))
  }

  async function handleGerar(e: React.FormEvent) {
    e.preventDefault()
    if ((!gerarForm.todos && !gerarForm.alunoId) || gerarForm.meses.length === 0) {
      setMsg({ text: 'Selecione o aluno (ou "todos") e pelo menos um mês.', ok: false })
      setTimeout(() => setMsg(null), 3000)
      return
    }
    setGerando(true)
    try {
      const res = await api.admin.gerarMensalidades({
        ...(gerarForm.todos ? { todos: true } : { alunoId: gerarForm.alunoId }),
        ano: gerarForm.ano,
        meses: gerarForm.meses.sort((a, b) => a - b),
        valor: gerarForm.valor,
      })
      const escopo = gerarForm.todos ? ` para ${res.alunos} aluno${res.alunos !== 1 ? 's' : ''}` : ''
      setMsg({ text: `${res.created} mensalidade${res.created !== 1 ? 's' : ''} gerada${res.created !== 1 ? 's' : ''}${escopo}!${res.skipped ? ` (${res.skipped} já existia${res.skipped !== 1 ? 'm' : ''})` : ''}`, ok: true })
      setShowGerar(false)
      setGerarForm({ alunoId: '', todos: false, ano: new Date().getFullYear(), valor: 350, meses: [] })
      await fetchData()
    } catch (err: any) {
      const body = (() => { try { return JSON.parse(err?.message ?? '{}') } catch { return {} } })()
      setMsg({ text: body.error ?? 'Erro ao gerar mensalidades.', ok: false })
    }
    setGerando(false)
    setTimeout(() => setMsg(null), 5000)
  }

  const totalPago = pagamentos.filter(p => p.pago).reduce((s, p) => s + (p.valor ?? 0), 0)
  const totalPendente = pagamentos.filter(p => !p.pago).reduce((s, p) => s + (p.valor ?? 0), 0)

  const filtered = pagamentos.filter(p => {
    const matchSearch = !search || (p.aluno?.name ?? '').toLowerCase().includes(search.toLowerCase()) || (p.aluno?.ra ?? '').includes(search)
    const matchFilter = filter === 'TODOS' || (filter === 'PAGO' ? p.pago : !p.pago)
    return matchSearch && matchFilter
  })

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      {/* Toast */}
      {msg && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-lg text-sm font-medium text-white flex items-center gap-2 ${msg.ok ? 'bg-green-600' : 'bg-red-500'}`}>
          {msg.ok && <CheckCircle size={15} />} {msg.text}
        </div>
      )}

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Financeiro</h2>
          <p className="text-sm text-gray-400 mt-0.5">Gerenciar pagamentos e mensalidades</p>
        </div>
        <button
          onClick={() => { setShowGerar(true); setGerarForm({ alunoId: '', todos: false, ano: new Date().getFullYear(), valor: 350, meses: [] }) }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm shadow-md transition-all hover:opacity-90"
          style={{ background: '#071B34', color: '#C8A35F' }}>
          <Plus size={16} /> Gerar Mensalidades
        </button>
      </div>

      {/* Modal: Gerar Mensalidades */}
      {showGerar && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowGerar(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-900 text-lg">Gerar Mensalidades</h3>
              <button onClick={() => setShowGerar(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={16} /></button>
            </div>

            <form onSubmit={handleGerar} className="space-y-4">
              {/* Toggle: todos os alunos */}
              <label className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all"
                style={gerarForm.todos
                  ? { background: 'rgba(200,163,95,0.12)', border: '1px solid rgba(200,163,95,0.4)' }
                  : { background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <input type="checkbox" checked={gerarForm.todos}
                  onChange={e => setGerarForm({ ...gerarForm, todos: e.target.checked, alunoId: '' })}
                  className="w-4 h-4 accent-[#C8A35F]" />
                <div>
                  <p className="text-sm font-semibold text-gray-800">Aplicar a todos os alunos ativos</p>
                  <p className="text-[11px] text-gray-500">Gera as mensalidades para todos de uma vez ({alunos.length} alunos)</p>
                </div>
              </label>

              {/* Aluno (desabilitado quando "todos") */}
              <div style={{ opacity: gerarForm.todos ? 0.4 : 1, pointerEvents: gerarForm.todos ? 'none' : 'auto' }}>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Aluno {gerarForm.todos ? '' : '*'}</label>
                <select value={gerarForm.alunoId} disabled={gerarForm.todos} onChange={e => setGerarForm({ ...gerarForm, alunoId: e.target.value })}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none"
                  onFocus={ev => { ev.currentTarget.style.borderColor = '#C8A35F'; ev.currentTarget.style.boxShadow = '0 0 0 3px rgba(200,163,95,0.12)' }}
                  onBlur={ev => { ev.currentTarget.style.borderColor = ''; ev.currentTarget.style.boxShadow = '' }}>
                  <option value="">— Selecione o aluno —</option>
                  {alunos.map(a => <option key={a.id} value={a.id}>{a.name} (RA: {a.ra})</option>)}
                </select>
              </div>

              {/* Ano + Valor */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Ano</label>
                  <input type="number" value={gerarForm.ano} min={2020} max={2099}
                    onChange={e => setGerarForm({ ...gerarForm, ano: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Valor (R$)</label>
                  <input type="number" value={gerarForm.valor} min={1} step={0.01}
                    onChange={e => setGerarForm({ ...gerarForm, valor: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none" />
                </div>
              </div>

              {/* Meses */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Meses *</label>
                <div className="grid grid-cols-4 gap-2">
                  {nomeMes.map((nome, i) => {
                    const mes = i + 1
                    const selected = gerarForm.meses.includes(mes)
                    return (
                      <button
                        key={mes}
                        type="button"
                        onClick={() => toggleMes(mes)}
                        className="py-2 rounded-xl text-xs font-semibold transition-all"
                        style={selected
                          ? { background: '#C8A35F', color: '#071B34' }
                          : { background: '#f1f5f9', color: '#64748b' }}>
                        {nome}
                      </button>
                    )
                  })}
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <button type="button" onClick={() => setGerarForm({ ...gerarForm, meses: [1,2,3,4,5,6,7,8,9,10,11,12] })}
                    className="text-xs text-blue-500 hover:underline">Selecionar todos</button>
                  <button type="button" onClick={() => setGerarForm({ ...gerarForm, meses: [] })}
                    className="text-xs text-gray-400 hover:underline">Limpar</button>
                  {gerarForm.meses.length > 0 && (
                    <span className="text-xs text-gray-500 ml-auto">{gerarForm.meses.length} mês(es) selecionado(s)</span>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowGerar(false)}
                  className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all">
                  Cancelar
                </button>
                <button type="submit" disabled={gerando}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-60"
                  style={{ background: '#C8A35F', color: '#071B34' }}>
                  {gerando ? <Loader2 size={15} className="animate-spin" /> : null}
                  Gerar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-card">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Total Recebido</p>
          <p className="text-2xl font-bold text-green-600">R$ {totalPago.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-card">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Total Pendente</p>
          <p className="text-2xl font-bold text-red-500">R$ {totalPendente.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-card col-span-2 sm:col-span-1">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Total Geral</p>
          <p className="text-2xl font-bold text-gray-900">R$ {(totalPago + totalPendente).toFixed(2)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-card p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar aluno ou RA..."
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none transition-all"
            onFocus={e => { e.currentTarget.style.borderColor = '#C8A35F'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(200,163,95,0.12)' }}
            onBlur={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.boxShadow = '' }} />
        </div>
        <div className="flex gap-2">
          {(['TODOS', 'PAGO', 'PENDENTE'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
              style={filter === f ? { background: '#071B34', color: '#C8A35F' } : { background: '#f1f5f9', color: '#64748b' }}>
              {f === 'TODOS' ? 'Todos' : f === 'PAGO' ? 'Pagos' : 'Pendentes'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50">
          <h3 className="font-semibold text-gray-900">{filtered.length} registro{filtered.length !== 1 ? 's' : ''}</h3>
        </div>
        <div className="divide-y divide-gray-50">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-7 h-7 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#C8A35F', borderTopColor: 'transparent' }} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-14 text-center">
              <CreditCard size={36} className="mx-auto text-gray-200 mb-2" />
              <p className="text-sm text-gray-400">Nenhum pagamento encontrado</p>
            </div>
          ) : (
            filtered.map((p) => (
              <div key={p.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/60 transition-colors">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={p.pago
                    ? { background: 'rgba(22,163,74,0.1)', color: '#16a34a' }
                    : { background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
                  {p.pago ? <CheckCircle size={17} /> : <Clock size={17} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{p.aluno?.name ?? '—'}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    RA: {p.aluno?.ra ?? '—'} · {nomeMes[(p.mes ?? 1) - 1]}/{p.ano} · Venc: {p.vencimento}
                    {p.paidAt ? ` · Pago em ${new Date(p.paidAt).toLocaleDateString('pt-BR')}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <p className="text-sm font-bold" style={{ color: p.pago ? '#16a34a' : '#ef4444' }}>
                    R$ {(p.valor ?? 0).toFixed(2)}
                  </p>
                  {!p.pago && (
                    <button
                      onClick={() => marcarPago(p.id)}
                      disabled={marking === p.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all hover:opacity-90 disabled:opacity-50"
                      style={{ background: 'rgba(22,163,74,0.1)', color: '#16a34a' }}>
                      {marking === p.id
                        ? <span className="w-3 h-3 border-2 border-t-transparent rounded-full animate-spin inline-block" style={{ borderColor: '#16a34a', borderTopColor: 'transparent' }} />
                        : <CheckCircle size={12} />}
                      Marcar Pago
                    </button>
                  )}
                  {p.pago && (
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                      style={{ background: 'rgba(22,163,74,0.1)', color: '#16a34a' }}>
                      {p.metodo ?? 'Pago'}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
