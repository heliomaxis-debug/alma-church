'use client'

import { useEffect, useState } from 'react'
import { CreditCard, Copy, CheckCircle, Clock, AlertCircle, QrCode } from 'lucide-react'
import { api } from '@/lib/api'

const MESES = ['', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

interface Pagamento {
  id: string; mes: number; ano: number; valor: number
  vencimento: string; pago: boolean; paidAt: string | null; metodo: string | null
}

export default function FinanceiroPage() {
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [copiedBoleto, setCopiedBoleto] = useState(false)
  const [activeTab, setActiveTab] = useState<'historico' | 'pix' | 'boleto'>('historico')
  const LINHA_DIGITAVEL = '07790.00012 30500.226908 00000.350001 1 99310000035000'

  useEffect(() => {
    api.aluno.financeiro()
      .then(data => setPagamentos(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const pending = pagamentos.find(p => !p.pago)
  const paidCount = pagamentos.filter(p => p.pago).length
  const totalPaid = pagamentos.filter(p => p.pago).reduce((a, p) => a + p.valor, 0)
  const mensalidade = pagamentos[0]?.valor ?? 350

  function copyPix() {
    navigator.clipboard.writeText('btcp.seminario@pix.com.br')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function copyBoleto() {
    navigator.clipboard.writeText(LINHA_DIGITAVEL)
    setCopiedBoleto(true)
    setTimeout(() => setCopiedBoleto(false), 2000)
  }

  function formatPaidAt(paidAt: string | null) {
    if (!paidAt) return '—'
    try {
      return new Date(paidAt).toLocaleDateString('pt-BR')
    } catch {
      return paidAt
    }
  }

  function statusStyle(pago: boolean) {
    return pago
      ? { bg: 'rgba(34,197,94,0.1)', text: '#16a34a', icon: <CheckCircle size={13} />, label: 'Pago' }
      : { bg: 'rgba(200,163,95,0.12)', text: '#b08030', icon: <Clock size={13} />, label: 'Pendente' }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-gold-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-card">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Status Financeiro</p>
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${pending ? 'bg-amber-400' : 'bg-green-500'}`} />
            <p className={`text-xl font-bold ${pending ? 'text-amber-600' : 'text-green-600'}`}>
              {pending ? 'Pendente' : 'Em dia'}
            </p>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {pending ? `Vencimento: ${pending.vencimento}` : 'Todas as mensalidades pagas'}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-card">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Total Pago</p>
          <p className="text-xl font-bold text-gray-900">
            {totalPaid.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
          <p className="text-xs text-gray-400 mt-1">{paidCount} mensalidade{paidCount !== 1 ? 's' : ''} paga{paidCount !== 1 ? 's' : ''}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-card col-span-2 lg:col-span-1">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Mensalidade</p>
          <p className="text-xl font-bold text-gray-900">
            {mensalidade.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
          <p className="text-xs text-gray-400 mt-1">Vencimento todo dia 10</p>
        </div>
      </div>

      {/* Pending alert */}
      {pending && (
        <div
          className="rounded-2xl p-4 flex items-center gap-4"
          style={{ background: 'rgba(200,163,95,0.08)', border: '1px solid rgba(200,163,95,0.2)' }}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(200,163,95,0.2)', color: '#b08030' }}>
            <AlertCircle size={18} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-800">
              {MESES[pending.mes]} {pending.ano} – Mensalidade em aberto
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              Valor: {pending.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} · Vencimento: {pending.vencimento}
            </p>
          </div>
          <button
            onClick={() => setActiveTab('pix')}
            className="flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold"
            style={{ background: '#C8A35F', color: '#071B34' }}
          >
            Pagar agora
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="flex border-b border-gray-100">
          {(['historico', 'pix', 'boleto'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 py-4 text-sm font-medium transition-colors relative"
              style={{ color: activeTab === tab ? '#071B34' : '#9ca3af' }}
            >
              {tab === 'historico' ? 'Histórico' : tab === 'pix' ? 'Pagar via PIX' : 'Pagar via Boleto'}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-0.5 rounded-full" style={{ background: '#C8A35F' }} />
              )}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'historico' && (
            <div className="space-y-2">
              {pagamentos.length === 0 && (
                <p className="text-center text-gray-400 py-8">Nenhum registro financeiro encontrado.</p>
              )}
              {pagamentos.map((p) => {
                const st = statusStyle(p.pago)
                return (
                  <div key={p.id} className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50/60 transition-colors">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: st.bg, color: st.text }}>
                      <CreditCard size={16} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">{MESES[p.mes]} {p.ano}</p>
                      <p className="text-[11px] text-gray-400">
                        {p.pago ? `Pago em ${formatPaidAt(p.paidAt)} · via ${p.metodo ?? 'PIX'}` : `Vencimento: ${p.vencimento}`}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-gray-900">
                        {p.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </p>
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1" style={{ background: st.bg, color: st.text }}>
                        {st.icon}{st.label}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {activeTab === 'pix' && (
            <div className="max-w-sm mx-auto text-center space-y-6">
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1">QR Code PIX</p>
                <p className="text-xs text-gray-400">Escaneie pelo app do seu banco</p>
              </div>
              <QrCodeVisual />
              <div>
                <p className="text-[11px] text-gray-400 mb-2">Chave PIX</p>
                <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-3">
                  <p className="flex-1 text-sm font-mono text-gray-700">btcp.seminario@pix.com.br</p>
                  <button onClick={copyPix} className="text-gray-400 hover:text-gray-600 transition-colors">
                    {copied ? <CheckCircle size={16} className="text-green-500" /> : <Copy size={16} />}
                  </button>
                </div>
                {copied && <p className="text-[11px] text-green-600 mt-1">Copiado!</p>}
              </div>
              <div className="p-4 rounded-xl bg-gray-50 text-left space-y-2">
                <InfoRow label="Beneficiário" value="BTCP – Bible Training Centre for Pastors" />
                <InfoRow label="Valor" value={pending ? pending.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '—'} />
                <InfoRow label="Referência" value={pending ? `${MESES[pending.mes]}/${pending.ano}` : '—'} />
              </div>
            </div>
          )}

          {activeTab === 'boleto' && (
            <div className="max-w-sm mx-auto text-center space-y-6">
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1">Boleto Bancário</p>
                <p className="text-xs text-gray-400">Pague em qualquer banco ou casa lotérica</p>
              </div>
              <div
                className="w-20 h-20 rounded-2xl mx-auto flex items-center justify-center"
                style={{ background: 'rgba(7,27,52,0.06)' }}
              >
                <QrCode size={36} style={{ color: '#071B34' }} />
              </div>
              <div className="p-4 rounded-xl bg-gray-50 text-left space-y-2">
                <InfoRow label="Linha digitável" value={LINHA_DIGITAVEL} mono />
                <InfoRow label="Vencimento" value={pending?.vencimento ?? '—'} />
                <InfoRow label="Valor" value={pending ? pending.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '—'} />
              </div>
              <button
                onClick={copyBoleto}
                className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
                style={{ background: copiedBoleto ? 'rgba(22,163,74,0.1)' : 'rgba(7,27,52,0.08)', color: copiedBoleto ? '#16a34a' : '#071B34' }}
              >
                {copiedBoleto ? <><CheckCircle size={15} /> Copiado!</> : 'Copiar linha digitável'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between items-start gap-4">
      <p className="text-[11px] text-gray-400 flex-shrink-0">{label}</p>
      <p className={`text-[12px] font-medium text-gray-700 text-right ${mono ? 'font-mono text-[10px] break-all' : ''}`}>{value}</p>
    </div>
  )
}

function QrCodeVisual() {
  const SIZE = 160
  const CELL = 8
  const COLS = Math.floor(SIZE / CELL)

  const pattern = Array.from({ length: COLS }, (_, r) =>
    Array.from({ length: COLS }, (_, c) => {
      // Finder patterns
      if ((r < 7 && c < 7) || (r < 7 && c >= COLS - 7) || (r >= COLS - 7 && c < 7)) {
        const inOuter = r === 0 || r === 6 || c === 0 || c === 6
        const inInner = r >= 2 && r <= 4 && c >= 2 && c <= 4
        const rr = r >= COLS - 7 ? r - (COLS - 7) : r
        const cc = c >= COLS - 7 ? c - (COLS - 7) : c
        if (r < 7 && c < 7) return (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4)) ? 1 : 0
        if (r < 7 && c >= COLS - 7) return (rr === 0 || rr === 6 || cc === 0 || cc === 6 || (rr >= 2 && rr <= 4 && cc >= 2 && cc <= 4)) ? 1 : 0
        if (r >= COLS - 7 && c < 7) {
          const rrr = r - (COLS - 7)
          return (rrr === 0 || rrr === 6 || c === 0 || c === 6 || (rrr >= 2 && rrr <= 4 && c >= 2 && c <= 4)) ? 1 : 0
        }
      }
      return (r * 3 + c * 7 + r * c) % 5 === 0 ? 1 : 0
    })
  )

  return (
    <div className="mx-auto p-3 bg-white rounded-2xl border border-gray-100 inline-block shadow-card">
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        {pattern.map((row, r) =>
          row.map((cell, c) =>
            cell ? (
              <rect key={`${r}-${c}`} x={c * CELL} y={r * CELL} width={CELL - 1} height={CELL - 1} rx={1} fill="#071B34" />
            ) : null
          )
        )}
      </svg>
    </div>
  )
}
