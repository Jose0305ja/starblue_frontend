import { useState, useEffect } from 'react'
import api from '../../api'
import type { IngresoMensual, EmpleadoRanking } from '../../types'
import { NavbarEmpleado } from '../../components/layout/NavbarEmpleado'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { useCurrency } from '../../context/CurrencyContext'

export default function AdminReportes() {
  const { formatPrice } = useCurrency()
  const [ingresos, setIngresos] = useState<IngresoMensual[]>([])
  const [ranking, setRanking] = useState<EmpleadoRanking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/reportes/ingresos-mensuales'),
      api.get('/reportes/ranking-empleados'),
    ]).then(([i, r]) => {
      setIngresos(i.data.data)
      setRanking(r.data.data)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const exportCSV = (data: object[], filename: string) => {
    if (data.length === 0) return
    const headers = Object.keys(data[0])
    const rows = data.map(row => headers.map(h => (row as Record<string, unknown>)[h]).join(','))
    const csv = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `${filename}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  const reportCards = [
    {
      icon: '📅',
      title: 'Reporte mensual',
      description: 'Ingresos, reservas y clientes por mes',
      action: () => exportCSV(ingresos, 'starblue_ingresos_mensuales'),
    },
    {
      icon: '👥',
      title: 'Desempeño equipo',
      description: 'Reservas e ingresos por empleado',
      action: () => exportCSV(ranking, 'starblue_ranking_empleados'),
    },
    {
      icon: '🗺',
      title: 'Análisis de rutas',
      description: 'Popularidad y ocupación por ruta',
      action: () => window.print(),
    },
  ]

  return (
    <div className="min-h-screen lg:pl-60">
      <NavbarEmpleado />
      <main className="p-6 pt-20 lg:pt-6 max-w-5xl">
        <h1 className="font-syne font-bold text-2xl text-sb-text mb-6">Reportes</h1>

        {/* Report cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {reportCards.map(c => (
            <div key={c.title} className="card p-5">
              <span className="text-3xl mb-3 block">{c.icon}</span>
              <h2 className="font-syne font-bold text-sb-text mb-1">{c.title}</h2>
              <p className="text-sb-muted text-sm mb-4">{c.description}</p>
              <button onClick={c.action} className="btn-secondary w-full py-2 text-sm">
                Exportar CSV
              </button>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
        ) : (
          <>
            {/* Tabla ingresos */}
            <div className="card overflow-hidden mb-6">
              <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--sb-border)' }}>
                <h2 className="font-syne font-semibold text-sb-text">Ingresos mensuales</h2>
                <button onClick={() => exportCSV(ingresos, 'starblue_ingresos')} className="btn-secondary text-xs px-3 py-1.5">
                  Exportar
                </button>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--sb-border)' }}>
                    {['Mes', 'Reservas', 'Ingresos'].map(h => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-sb-muted uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ingresos.length === 0 ? (
                    <tr><td colSpan={3} className="text-center py-8 text-sb-muted">Sin datos</td></tr>
                  ) : ingresos.map(i => (
                    <tr key={i.mes} className="hover:bg-[var(--sb-hover-bg)]" style={{ borderBottom: '1px solid var(--sb-border)' }}>
                      <td className="px-5 py-3 font-mono-sb text-sb-text">{i.mes}</td>
                      <td className="px-5 py-3 font-mono-sb text-sb-muted">{i.total_reservas}</td>
                      <td className="px-5 py-3 font-mono-sb font-bold text-sb-green">{formatPrice(Number(i.ingresos))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Tabla ranking */}
            <div className="card overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--sb-border)' }}>
                <h2 className="font-syne font-semibold text-sb-text">Ranking de empleados</h2>
                <button onClick={() => exportCSV(ranking, 'starblue_ranking')} className="btn-secondary text-xs px-3 py-1.5">
                  Exportar
                </button>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--sb-border)' }}>
                    {['#', 'Empleado', 'Reservas', 'Ingresos', 'Ticket prom.'].map(h => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-sb-muted uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ranking.map((e, idx) => (
                    <tr key={e.id} className="hover:bg-[var(--sb-hover-bg)]" style={{ borderBottom: '1px solid var(--sb-border)' }}>
                      <td className="px-5 py-3 text-sb-muted font-mono-sb">{idx + 1}</td>
                      <td className="px-5 py-3 font-semibold text-sb-text">{e.nombre} {e.apellido}</td>
                      <td className="px-5 py-3 font-mono-sb text-sb-text">{e.total_reservas}</td>
                      <td className="px-5 py-3 font-mono-sb text-sb-green">{formatPrice(Number(e.ingresos_generados))}</td>
                      <td className="px-5 py-3 font-mono-sb text-sb-muted">{formatPrice(Number(e.ticket_promedio))}</td>
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
