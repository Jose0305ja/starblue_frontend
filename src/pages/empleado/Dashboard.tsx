import { useState, useEffect } from 'react'
import api from '../../api'
import type { DashboardEmpleado } from '../../types'
import { NavbarEmpleado } from '../../components/layout/NavbarEmpleado'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { formatMXN } from '../../utils/formatters'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts'

export default function EmpleadoDashboard() {
  const [data, setData] = useState<DashboardEmpleado | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/empleados/mi-dashboard')
      .then(r => setData(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const kpis = data ? [
    { label: 'Reservas este mes', value: data.total_reservas, color: 'var(--sb-blue-lt)', icon: '🎫' },
    { label: 'Clientes atendidos', value: data.clientes_unicos, color: 'var(--sb-green)', icon: '👤' },
    { label: 'Ingresos generados', value: formatMXN(Number(data.ingresos_generados)), color: '#F59E0B', icon: '💰' },
    { label: 'Ranking en equipo', value: `#${data.ranking_posicion ?? '—'} de ${data.total_empleados}`, color: '#A78BFA', icon: '🏆' },
  ] : []

  const metaReservas = 30
  const totalReservas = Number(data?.total_reservas ?? 0)
  const pctMeta = Math.min((totalReservas / metaReservas) * 100, 100)

  const rutasChart = data?.rutas_frecuentes.map(r => ({
    name: `${r.ciudad_origen.slice(0, 4)}→${r.ciudad_destino.slice(0, 4)}`,
    reservas: Number(r.veces),
  })) ?? []

  return (
    <div className="min-h-screen lg:pl-60">
      <NavbarEmpleado />
      <main className="p-6 pt-20 lg:pt-6 max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-syne font-bold text-2xl text-sb-text">Mi Dashboard</h1>
          <span className="text-sb-muted text-sm">Este mes</span>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
        ) : (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {kpis.map(k => (
                <div key={k.label} className="card p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sb-muted text-xs font-semibold">{k.label}</p>
                    <span className="text-xl">{k.icon}</span>
                  </div>
                  <p className="font-mono-sb font-bold text-2xl" style={{ color: k.color }}>{k.value}</p>
                </div>
              ))}
            </div>

            {/* Meta mensual */}
            <div className="card p-5 mb-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-syne font-semibold text-sb-text">Meta mensual</h2>
                <span className="text-sm font-mono-sb text-sb-muted">{totalReservas}/{metaReservas}</span>
              </div>
              <div className="h-3 rounded-full overflow-hidden bg-sb-bg3">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${pctMeta}%`, background: 'linear-gradient(90deg, #3D56D4, #A78BFA)' }}
                />
              </div>
              <p className="text-xs text-sb-muted mt-2">
                {metaReservas - totalReservas > 0
                  ? `Faltan ${metaReservas - totalReservas} reservas para la meta`
                  : '¡Meta alcanzada! 🎉'}
              </p>
            </div>

            {/* Rutas + gráfica */}
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="card p-5">
                <h2 className="font-syne font-semibold text-sb-text mb-4">Rutas más vendidas</h2>
                {rutasChart.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={rutasChart} barSize={30}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--sb-border)" />
                      <XAxis dataKey="name" tick={{ fill: 'var(--sb-muted)', fontSize: 11 }} />
                      <YAxis tick={{ fill: 'var(--sb-muted)', fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: 'var(--sb-card-bg)', border: '1px solid var(--sb-border2)', borderRadius: 8, color: 'var(--sb-text)' }}
                      />
                      <Bar dataKey="reservas" fill="#3D56D4" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <p className="text-sb-muted text-sm">Sin datos este mes</p>}
              </div>

              <div className="card p-5">
                <h2 className="font-syne font-semibold text-sb-text mb-4">Estadísticas del mes</h2>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-sb-muted">Ticket promedio</span>
                    <span className="font-mono-sb text-sb-text">{formatMXN(Number(data?.ticket_promedio ?? 0))}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-sb-muted">Posición en ranking</span>
                    <span className="font-mono-sb text-sb-purple">#{data?.ranking_posicion ?? '—'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-sb-muted">Meta completada</span>
                    <span className="font-mono-sb" style={{ color: pctMeta >= 100 ? '#22C55E' : '#F59E0B' }}>
                      {pctMeta.toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
