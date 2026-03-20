import { useState, useEffect } from 'react'
import api from '../../api'
import type { ResumenAdmin, RutaPopular, IngresoMensual, EmpleadoRanking, DestinoTop } from '../../types'
import { NavbarEmpleado } from '../../components/layout/NavbarEmpleado'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { useCurrency } from '../../context/CurrencyContext'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend,
} from 'recharts'

export default function AdminDashboard() {
  const { formatPrice } = useCurrency()
  const [resumen, setResumen] = useState<ResumenAdmin | null>(null)
  const [rutas, setRutas] = useState<RutaPopular[]>([])
  const [ingresos, setIngresos] = useState<IngresoMensual[]>([])
  const [ranking, setRanking] = useState<EmpleadoRanking[]>([])
  const [destinos, setDestinos] = useState<DestinoTop[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/reportes/resumen'),
      api.get('/reportes/rutas-populares'),
      api.get('/reportes/ingresos-mensuales'),
      api.get('/reportes/ranking-empleados'),
      api.get('/reportes/destinos'),
    ]).then(([r, rp, im, re, d]) => {
      setResumen(r.data.data)
      setRutas(rp.data.data)
      setIngresos(im.data.data)
      setRanking(re.data.data.slice(0, 5))
      setDestinos(d.data.data.slice(0, 5))
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const kpis = resumen ? [
    { label: 'Reservas este mes', value: resumen.total_reservas, color: 'var(--sb-blue-lt)', icon: '🎫' },
    { label: 'Ingresos del mes', value: formatPrice(Number(resumen.ingresos_mes)), color: 'var(--sb-green)', icon: '💰' },
    { label: 'Clientes atendidos', value: resumen.clientes_unicos, color: '#F59E0B', icon: '👤' },
    { label: 'Cancelaciones', value: resumen.total_cancelaciones, color: 'var(--sb-red)', icon: '✕' },
  ] : []

  const ingresosChart = ingresos.map(i => ({
    mes: i.mes.slice(5),
    ingresos: Number(i.ingresos),
    reservas: Number(i.total_reservas),
  }))

  const rutasChart = rutas.slice(0, 5).map(r => ({
    name: `${r.ciudad_origen.slice(0, 4)}→${r.ciudad_destino.slice(0, 4)}`,
    reservas: Number(r.total_reservas),
  }))

  return (
    <div className="min-h-screen lg:pl-60">
      <NavbarEmpleado />
      <main className="p-6 pt-20 lg:pt-6 max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-syne font-bold text-2xl text-sb-text">Panel General</h1>
          <span className="text-sb-muted text-sm">Este mes</span>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
        ) : (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {kpis.map(k => (
                <div key={k.label} className="card p-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold text-sb-muted">{k.label}</p>
                    <span className="text-xl">{k.icon}</span>
                  </div>
                  <p className="font-mono-sb font-bold text-2xl" style={{ color: k.color }}>{k.value}</p>
                </div>
              ))}
            </div>

            {/* Gráficas */}
            <div className="grid lg:grid-cols-2 gap-6 mb-6">
              {/* Ingresos mensuales */}
              <div className="card p-5">
                <h2 className="font-syne font-semibold text-sb-text mb-4">Ingresos — últimos 12 meses</h2>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={ingresosChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--sb-border)" />
                    <XAxis dataKey="mes" tick={{ fill: 'var(--sb-muted)', fontSize: 11 }} />
                    <YAxis tick={{ fill: 'var(--sb-muted)', fontSize: 10 }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'var(--sb-card-bg)', border: '1px solid var(--sb-border2)', borderRadius: 8, color: 'var(--sb-text)' }}
                      formatter={(v: number) => [formatPrice(v), 'Ingresos']}
                    />
                    <Line type="monotone" dataKey="ingresos" stroke="#5B74F0" strokeWidth={2} dot={{ fill: '#5B74F0', r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Rutas populares */}
              <div className="card p-5">
                <h2 className="font-syne font-semibold text-sb-text mb-4">Rutas más populares</h2>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={rutasChart} layout="vertical" barSize={18}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--sb-border)" />
                    <XAxis type="number" tick={{ fill: 'var(--sb-muted)', fontSize: 11 }} />
                    <YAxis dataKey="name" type="category" tick={{ fill: 'var(--sb-muted)', fontSize: 11 }} width={80} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'var(--sb-card-bg)', border: '1px solid var(--sb-border2)', borderRadius: 8, color: 'var(--sb-text)' }}
                    />
                    <Bar dataKey="reservas" fill="#3D56D4" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Destinos + Ranking empleados */}
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="card p-5">
                <h2 className="font-syne font-semibold text-sb-text mb-4">Top destinos</h2>
                <div className="space-y-3">
                  {destinos.map((d, idx) => (
                    <div key={d.ciudad_destino} className="flex items-center gap-3">
                      <span className="text-sb-muted text-sm w-4 font-mono-sb">{idx + 1}</span>
                      <span className="text-sb-text text-sm flex-1">{d.ciudad_destino}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 rounded-full overflow-hidden bg-sb-bg3">
                          <div className="h-full rounded-full bg-sb-blue-lt" style={{ width: `${d.pct_total}%` }} />
                        </div>
                        <span className="text-sb-muted text-xs font-mono-sb w-8 text-right">{d.pct_total}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card p-5">
                <h2 className="font-syne font-semibold text-sb-text mb-4">Ranking empleados</h2>
                <div className="space-y-3">
                  {ranking.map((e, idx) => (
                    <div key={e.id} className="flex items-center gap-3">
                      <span className={`text-lg ${idx === 0 ? '' : idx === 1 ? '' : ''}`}>
                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}.`}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-sb-text">{e.nombre} {e.apellido}</p>
                        <p className="text-xs text-sb-muted">{e.total_reservas} reservas</p>
                      </div>
                      <span className="font-mono-sb text-sm text-sb-green">{formatPrice(Number(e.ingresos_total))}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
