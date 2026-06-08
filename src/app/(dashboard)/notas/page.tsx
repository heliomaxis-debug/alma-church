'use client'

import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, BookOpen, AlertTriangle, Award, ChevronDown, ChevronUp, Printer } from 'lucide-react'
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

interface MatriculaData {
  id: string
  disciplina: { name: string; code: string; schedule: string; room: string; professor: string }
  notas: { numero: number; valor: number }[]
  faltas: number
  totalAulas: number
  media: number | null
  status: string
}

function handlePrintHistorico(matriculas: MatriculaData[], studentName: string, ra: string, curso: string) {
  const hoje = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
  const avgGeral = matriculas.length
    ? (matriculas.reduce((a, m) => a + (m.media ?? 0), 0) / matriculas.length).toFixed(1)
    : '—'

  const statusLabel = (avg: number | null) => {
    if (avg === null) return 'Em andamento'
    if (avg >= 7) return 'Aprovado'
    if (avg >= 5) return 'Recuperação'
    return 'Reprovado'
  }

  const rows = matriculas.map(m => `
    <tr>
      <td>${m.disciplina.code}</td>
      <td>${m.disciplina.name}</td>
      ${m.notas.map(n => `<td class="center">${n.valor.toFixed(1)}</td>`).join('')}
      ${m.notas.length < 3 ? Array(3 - m.notas.length).fill('<td class="center">—</td>').join('') : ''}
      <td class="center bold" style="color:${(m.media ?? 0) >= 7 ? '#16a34a' : (m.media ?? 0) >= 5 ? '#d97706' : '#dc2626'}">${m.media !== null ? m.media.toFixed(1) : '—'}</td>
      <td class="center">${m.faltas}</td>
      <td class="center">${Math.round(((m.totalAulas - m.faltas) / (m.totalAulas || 20)) * 100)}%</td>
      <td class="center status">${statusLabel(m.media)}</td>
    </tr>
  `).join('')

  const win = window.open('', '_blank', 'width=900,height=700')
  if (!win) return
  win.document.write(`
    <!DOCTYPE html><html><head>
    <meta charset="UTF-8"/>
    <title>Histórico Acadêmico — ${studentName}</title>
    <style>
      *{box-sizing:border-box;margin:0;padding:0}
      body{font-family:'Segoe UI',Arial,sans-serif;background:#fff;padding:32px;color:#1e293b;font-size:13px}
      .header{display:flex;align-items:center;gap:16px;border-bottom:3px solid #C8A35F;padding-bottom:20px;margin-bottom:24px}
      .logo{width:48px;height:48px;border-radius:10px;background:linear-gradient(135deg,#C8A35F,#b08030);display:flex;align-items:center;justify-content:center}
      .inst h1{font-size:18px;font-weight:700;color:#071B34}
      .inst p{font-size:12px;color:#C8A35F}
      .doc-title{font-size:16px;font-weight:700;text-align:center;text-transform:uppercase;letter-spacing:0.1em;color:#071B34;margin-bottom:4px}
      .doc-subtitle{text-align:center;font-size:12px;color:#64748b;margin-bottom:20px}
      .student-box{background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px 16px;margin-bottom:20px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px}
      .student-box .field label{font-size:10px;font-weight:600;text-transform:uppercase;color:#94a3b8;letter-spacing:0.05em}
      .student-box .field p{font-size:13px;font-weight:600;color:#1e293b;margin-top:2px}
      table{width:100%;border-collapse:collapse;margin-bottom:20px}
      th{background:#071B34;color:white;font-size:10px;font-weight:600;text-transform:uppercase;padding:8px 10px;text-align:left;letter-spacing:0.04em}
      td{padding:8px 10px;border-bottom:1px solid #f1f5f9;font-size:12px;color:#334155}
      tr:nth-child(even) td{background:#f8fafc}
      .center{text-align:center}
      .bold{font-weight:700}
      .status{font-weight:600}
      .summary{display:flex;gap:16px;margin-bottom:24px}
      .summary-card{flex:1;border:1px solid #e2e8f0;border-radius:8px;padding:12px;text-align:center}
      .summary-card .val{font-size:22px;font-weight:700;color:#071B34}
      .summary-card .lbl{font-size:10px;text-transform:uppercase;letter-spacing:0.05em;color:#94a3b8;margin-top:2px}
      .footer{border-top:2px solid #e2e8f0;padding-top:16px;display:flex;justify-content:space-between;align-items:flex-end}
      .sig-line{width:180px;height:1px;background:#334155;margin-bottom:4px}
      .sig-label{font-size:10px;color:#64748b}
      .auth-note{font-size:10px;color:#94a3b8;text-align:right}
      @media print{body{padding:12px} @page{size:A4;margin:1.5cm}}
    </style>
    </head><body>
    <div class="header">
      <div class="logo">
        <svg width="22" height="22" viewBox="0 0 18 18" fill="none"><rect x="7.5" y="1" width="3" height="16" rx="1.2" fill="#071B34"/><rect x="1" y="6.5" width="16" height="3" rx="1.2" fill="#071B34"/></svg>
      </div>
      <div class="inst"><h1>Alma College</h1><p>BTCP · Seminário Teológico</p></div>
    </div>
    <p class="doc-title">Histórico Acadêmico</p>
    <p class="doc-subtitle">Documento emitido em ${hoje}</p>
    <div class="student-box">
      <div class="field"><label>Nome completo</label><p>${studentName}</p></div>
      <div class="field"><label>Registro Acadêmico</label><p>${ra}</p></div>
      <div class="field"><label>Curso</label><p>${curso}</p></div>
    </div>
    <div class="summary">
      <div class="summary-card"><div class="val">${avgGeral}</div><div class="lbl">Média Geral</div></div>
      <div class="summary-card"><div class="val">${matriculas.length}</div><div class="lbl">Disciplinas</div></div>
      <div class="summary-card"><div class="val">${matriculas.filter(m=>(m.media??0)>=7).length}</div><div class="lbl">Aprovadas</div></div>
      <div class="summary-card"><div class="val">${matriculas.reduce((a,m)=>a+m.faltas,0)}</div><div class="lbl">Faltas Totais</div></div>
    </div>
    <table>
      <thead><tr>
        <th>Código</th><th>Disciplina</th>
        <th class="center">P1</th><th class="center">P2</th><th class="center">P3</th>
        <th class="center">Média</th><th class="center">Faltas</th><th class="center">Freq.</th><th class="center">Situação</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="footer">
      <div><div class="sig-line"></div><p class="sig-label">Secretaria Acadêmica — Alma College</p></div>
      <div class="auth-note"><p>Documento gerado pelo sistema em ${hoje}</p><p style="margin-top:2px">Alma College · BTCP Seminário Teológico</p></div>
    </div>
    <script>window.onload=function(){window.print()}</script>
    </body></html>
  `)
  win.document.close()
}

export default function NotasPage() {
  const { user } = useAuth()
  const [matriculas, setMatriculas] = useState<MatriculaData[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<string | null>(null)

  useEffect(() => {
    api.aluno.notas()
      .then(data => setMatriculas(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const avgGrade = matriculas.length
    ? (matriculas.reduce((acc, m) => acc + (m.media ?? 0), 0) / matriculas.length).toFixed(1)
    : '—'
  const totalAbsences = matriculas.reduce((acc, m) => acc + m.faltas, 0)
  const approvedCount = matriculas.filter(m => (m.media ?? 0) >= 7).length

  const chartData = matriculas.map(m => ({
    name: m.disciplina.name.split(' ')[0],
    fullName: m.disciplina.name,
    média: m.media !== null ? parseFloat(m.media.toFixed(1)) : 0,
  }))

  function getStatusColor(avg: number | null) {
    if (avg === null) return { bg: 'rgba(107,114,128,0.1)', text: '#6b7280', label: 'Sem dados' }
    if (avg >= 9) return { bg: 'rgba(34,197,94,0.1)', text: '#16a34a', label: 'Excelente' }
    if (avg >= 7) return { bg: 'rgba(59,130,246,0.1)', text: '#2563eb', label: 'Aprovado' }
    if (avg >= 5) return { bg: 'rgba(245,158,11,0.1)', text: '#d97706', label: 'Recuperação' }
    return { bg: 'rgba(239,68,68,0.1)', text: '#dc2626', label: 'Reprovado' }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-gold-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const studentName = user?.aluno?.name ?? 'Aluno'
  const studentRa   = user?.aluno?.ra ?? '—'
  const studentCurso = user?.aluno?.curso ?? 'BTCP'

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">

      {/* Topo com botão de impressão */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Notas e Faltas</h1>
          <p className="text-sm text-gray-400 mt-0.5">Seu desempenho acadêmico em {matriculas.length} disciplina{matriculas.length !== 1 ? 's' : ''}</p>
        </div>
        {matriculas.length > 0 && (
          <button
            onClick={() => handlePrintHistorico(matriculas, studentName, studentRa, studentCurso)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90 shadow-sm"
            style={{ background: '#071B34', color: '#C8A35F' }}>
            <Printer size={15} /> Histórico Acadêmico
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Média Geral', value: avgGrade, icon: <TrendingUp size={18} />, color: '#4f46e5', bg: 'rgba(79,70,229,0.08)' },
          { label: 'Disciplinas', value: `${matriculas.length}`, icon: <BookOpen size={18} />, color: '#C8A35F', bg: 'rgba(200,163,95,0.08)' },
          { label: 'Aprovadas', value: `${approvedCount}/${matriculas.length}`, icon: <Award size={18} />, color: '#16a34a', bg: 'rgba(22,163,74,0.08)' },
          { label: 'Faltas Totais', value: `${totalAbsences}`, icon: <AlertTriangle size={18} />, color: totalAbsences > 10 ? '#ef4444' : '#d97706', bg: totalAbsences > 10 ? 'rgba(239,68,68,0.08)' : 'rgba(217,119,6,0.08)' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 shadow-card">
            <div className="flex items-start justify-between mb-3">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{s.label}</p>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white rounded-2xl shadow-card p-6">
        <h3 className="font-semibold text-gray-900 mb-6">Desempenho por Disciplina</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <Tooltip
              formatter={(value: number) => [value.toFixed(1), 'Média']}
              contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.1)', fontSize: 12 }}
              cursor={{ fill: 'rgba(200,163,95,0.06)' }}
            />
            <Bar dataKey="média" fill="#C8A35F" radius={[6, 6, 0, 0]} maxBarSize={48} />
          </BarChart>
        </ResponsiveContainer>
        {/* Passing line */}
        <div className="mt-3 flex items-center gap-2">
          <div className="h-px flex-1 border-t-2 border-dashed border-blue-300/60" />
          <span className="text-[10px] text-blue-400 font-semibold">Média mínima: 7,0</span>
          <div className="h-px flex-1 border-t-2 border-dashed border-blue-300/60" />
        </div>
      </div>

      {/* Disciplines list */}
      <div className="space-y-3">
        {matriculas.map((m) => {
          const status = getStatusColor(m.media)
          const isOpen = selected === m.id
          const absPercent = Math.round(((m.faltas) / (m.totalAulas || 20)) * 100)

          return (
            <div key={m.id} className="bg-white rounded-2xl shadow-card overflow-hidden">
              <button
                onClick={() => setSelected(isOpen ? null : m.id)}
                className="w-full flex items-center gap-4 p-5 hover:bg-gray-50/50 transition-colors text-left"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <p className="font-semibold text-gray-900 truncate">{m.disciplina.name}</p>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{ background: status.bg, color: status.text }}
                    >
                      {status.label}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400">{m.disciplina.professor} · {m.disciplina.schedule}</p>
                </div>

                <div className="flex items-center gap-6 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Média</p>
                    <p className="text-xl font-bold" style={{ color: status.text }}>
                      {m.media !== null ? m.media.toFixed(1) : '–'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Faltas</p>
                    <p className="text-xl font-bold text-gray-700">{m.faltas}</p>
                  </div>
                  {isOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                </div>
              </button>

              {isOpen && (
                <div className="px-5 pb-5 border-t border-gray-50 pt-4 space-y-4">
                  {/* Grades */}
                  <div>
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Notas</p>
                    <div className="flex gap-3 flex-wrap">
                      {m.notas.map(n => (
                        <div key={n.numero} className="flex-1 min-w-[80px] bg-gray-50 rounded-xl p-3 text-center">
                          <p className="text-[10px] text-gray-400 mb-1">Prova {n.numero}</p>
                          <p className="text-lg font-bold" style={{ color: n.valor >= 7 ? '#16a34a' : '#dc2626' }}>
                            {n.valor.toFixed(1)}
                          </p>
                        </div>
                      ))}
                      {m.notas.length === 0 && (
                        <p className="text-sm text-gray-400 italic">Nenhuma nota lançada ainda.</p>
                      )}
                    </div>
                  </div>

                  {/* Attendance */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Frequência</p>
                      <p className="text-xs font-semibold" style={{ color: absPercent > 25 ? '#dc2626' : '#16a34a' }}>
                        {100 - absPercent}% de presença
                      </p>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${100 - absPercent}%`,
                          background: absPercent > 25 ? '#ef4444' : absPercent > 15 ? '#f59e0b' : '#22c55e',
                        }}
                      />
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">
                      {m.faltas} falta{m.faltas !== 1 ? 's' : ''} de {m.totalAulas} aulas
                      {absPercent > 25 && <span className="text-red-500 ml-1">· Limite atingido!</span>}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-500">
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="font-semibold text-gray-400 mb-0.5">Sala</p>
                      <p className="text-gray-700">{m.disciplina.room}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="font-semibold text-gray-400 mb-0.5">Horário</p>
                      <p className="text-gray-700">{m.disciplina.schedule}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
