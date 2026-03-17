import { useState, useEffect } from 'react'
import api from '../../api'
import type { RutaPopular, DestinoTop } from '../../types'
import { NavbarEmpleado } from '../../components/layout/NavbarEmpleado'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { useCurrency } from '../../context/CurrencyContext'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const COLORS = ['#5B74F0', '#22C55E', '#F59E0B', '#A78BFA', '#EF4444', '#06B6D4', '#EAB308', '#EC4899']

export default function AdminRutas() {
  const { formatPrice } = useCurrency()
  const [rutas, setRutas] = useState<RutaPopular[]>([])
  const [destinos, setDestinos] = useState<DestinoTop[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/reportes/rutas-populares'),
      api.get('/reportes/destinos'),
    ]).then(([r, d]) => {
      setRutas(r.data.data)
      setDestinos(d.data.data)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const pieData = destinos.map(d => ({ name: d.destino, value: Number(d.total_reservas) }))

  const kpis = [
    { label: 'Rutas activas', value: String(rutas.length), color: 'var(--sb-blue-lt)' },
    { label: 'Ruta más popular', value: rutas[0] ? `${rutas[0].ciudad_origen} → ${rutas[0].ciudad_destino}` : '—', color: 'var(--sb-green)' },
    { label: 'Total pasajeros', value: String(rutas.reduce((s, r) => s + Number(r.total_pasajeros), 0)), color: '#F59E0B' },
    { label: 'Total ingresos', value: formatPrice(rutas.reduce((s, r) => s + Number(r.ingresos_total), 0)), color: '#A78BFA' },
  ]

  return (
    <div className="min-h-screen lg:pl-60">
      <NavbarEmpleado />
      <main className="p-6 pt-20 lg:pt-6 max-w-6xl">
        <h1 className="font-syne font-bold text-2xl text-sb-text mb-6">Rutas y Destinos</h1>

        {loading ? (
          <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
        ) : (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {kpis.map(k => (
                <div key={k.label} className="card p-4">
                  <p className="text-xs text-sb-muted mb-2 font-semibold">{k.label}</p>
                  <p className="font-mono-sb font-bold text-lg truncate" style={{ color: k.color }}>{k.value}</p>
                </div>
              ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-6 mb-6">
              {/* Top destinos donut */}
              <div className="card p-5">
                <h2 className="font-syne font-semibold text-sb-text mb-4">Top destinos</h2>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={50}>
                      {pieData.map((_, idx) => (
                        <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: 'var(--sb-card-bg)', border: '1px solid var(--sb-border2)', borderRadius: 8, color: 'var(--sb-text)' }}
                    />
                    <Legend wrapperStyle={{ color: 'var(--sb-muted)', fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Lista destinos */}
              <div className="card p-5">
                <h2 className="font-syne font-semibold text-sb-text mb-4">Porcentaje por destino</h2>
                <div className="space-y-3">
                  {destinos.map((d, idx) => (
                    <div key={d.destino} className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                      <span className="text-sb-text text-sm flex-1 truncate">{d.destino}</span>
                      <div className="w-24 h-1.5 rounded-full overflow-hidden bg-sb-bg3">
                        <div className="h-full rounded-full" style={{ width: `${d.porcentaje}%`, backgroundColor: COLORS[idx % COLORS.length] }} />
                      </div>
                      <span className="text-sb-muted text-xs font-mono-sb w-8 text-right">{d.porcentaje}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Tabla rutas */}
            <div className="card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--sb-border)' }}>
                    {['Ruta', 'Reservas', 'Pasajeros', 'Ingresos', '% Ocupación'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-sb-muted uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rutas.map(r => (
                    <tr key={r.id} className="hover:bg-[var(--sb-hover-bg)]" style={{ borderBottom: '1px solid var(--sb-border)' }}>
                      <td className="px-4 py-3 font-semibold text-sb-text">{r.ciudad_origen} → {r.ciudad_destino}</td>
                      <td className="px-4 py-3 font-mono-sb text-sb-text">{r.total_reservas}</td>
                      <td className="px-4 py-3 font-mono-sb text-sb-muted">{r.total_pasajeros}</td>
                      <td className="px-4 py-3 font-mono-sb text-sb-green">{formatPrice(Number(r.ingresos_total))}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 rounded-full overflow-hidden bg-sb-bg3">
                            <div className="h-full rounded-full bg-sb-blue-lt" style={{ width: `${r.porcentaje_ocupacion ?? 0}%` }} />
                          </div>
                          <span className="font-mono-sb text-xs text-sb-muted">{r.porcentaje_ocupacion ?? 0}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
