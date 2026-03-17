import { useState, useEffect, useMemo } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import api from '../../api'
import type { Viaje } from '../../types'
import { NavbarPublico } from '../../components/layout/NavbarPublico'
import { Footer } from '../../components/layout/Footer'
import { BuscadorViajes } from '../../components/viajes/BuscadorViajes'
import { ViajeCard } from '../../components/viajes/ViajeCard'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { EmptyState } from '../../components/ui/EmptyState'
import { useCurrency } from '../../context/CurrencyContext'

// Toma solo YYYY-MM-DD sin importar si viene con hora o zona horaria
const toDateStr = (raw: string) => raw.slice(0, 10)

const formatFechaGrupo = (raw: string) =>
  new Date(toDateStr(raw) + 'T12:00:00').toLocaleDateString('es-MX', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

const seatColor = (avail: number, total: number) => {
  const p = avail / total
  return p > 0.5 ? '#22C55E' : p > 0.2 ? '#F59E0B' : '#EF4444'
}

export default function Buscar() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const { formatPrice } = useCurrency()
  const [viajes, setViajes] = useState<Viaje[]>([])
  const [loading, setLoading] = useState(false)
  const [filtroClase, setFiltroClase] = useState('')
  const [orden, setOrden] = useState<'precio' | 'hora'>('hora')

  const origen  = searchParams.get('origen')  ?? ''
  const destino = searchParams.get('destino') ?? ''
  const fecha   = searchParams.get('fecha')   ?? ''

  const fetchViajes = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (origen)      params.set('origen',  origen)
      if (destino)     params.set('destino', destino)
      if (fecha)       params.set('fecha',   fecha)
      if (filtroClase) params.set('clase',   filtroClase)
      const res = await api.get(`/viajes?${params}`)
      setViajes(res.data.data ?? [])
    } catch {
      setViajes([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchViajes() }, [origen, destino, fecha, filtroClase])

  const handleSearch = (values: { origen: string; destino: string; fecha: string; pasajeros: number; tipo: string }) => {
    setSearchParams({ origen: values.origen, destino: values.destino, fecha: values.fecha, pasajeros: String(values.pasajeros), tipo: values.tipo })
  }

  const viajesOrdenados = useMemo(() =>
    [...viajes].sort((a, b) =>
      orden === 'precio'
        ? Number(a.precio_base) - Number(b.precio_base)
        : a.hora_salida.localeCompare(b.hora_salida)
    ), [viajes, orden])

  // Agrupados por fecha (solo cuando no hay fecha fija en la URL)
  const viajesPorFecha = useMemo(() => {
    if (fecha) return null
    const groups: Record<string, Viaje[]> = {}
    viajesOrdenados.forEach(v => {
      const key = toDateStr(v.fecha_salida)
      if (!groups[key]) groups[key] = []
      groups[key].push(v)
    })
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b))
  }, [viajesOrdenados, fecha])

  const tieneRuta = origen && destino

  return (
    <div className="min-h-screen">
      <NavbarPublico />
      <div className="pt-20 max-w-7xl mx-auto px-4">

        {/* Buscador */}
        <div className="py-6 border-b" style={{ borderColor: 'var(--sb-border)' }}>
          <BuscadorViajes
            initialValues={{ origen, destino, fecha }}
            onSearch={handleSearch}
            variant="compact"
          />
        </div>

        <div className="flex gap-6 py-8">
          {/* Sidebar */}
          <aside className="hidden lg:block w-52 flex-shrink-0 space-y-6">
            <div>
              <p className="text-sm font-bold text-sb-text mb-3">Clase</p>
              {[{ v: '', l: 'Todas' }, { v: 'estandar', l: 'Estándar' }, { v: 'ejecutivo', l: 'Ejecutivo' }, { v: 'vip', l: 'VIP' }].map(({ v, l }) => (
                <button key={v} onClick={() => setFiltroClase(v)}
                  className={`block w-full text-left px-3 py-2 rounded-lg text-sm mb-1 transition-colors ${filtroClase === v ? 'bg-sb-blue/20 text-sb-text' : 'text-sb-muted hover:text-sb-text hover:bg-[var(--sb-hover-bg)]'}`}>
                  {l}
                </button>
              ))}
            </div>
            <div>
              <p className="text-sm font-bold text-sb-text mb-3">Ordenar por</p>
              {[{ v: 'hora', l: 'Hora salida' }, { v: 'precio', l: 'Precio' }].map(({ v, l }) => (
                <button key={v} onClick={() => setOrden(v as 'hora' | 'precio')}
                  className={`block w-full text-left px-3 py-2 rounded-lg text-sm mb-1 transition-colors ${orden === v ? 'bg-sb-blue/20 text-sb-text' : 'text-sb-muted hover:text-sb-text hover:bg-[var(--sb-hover-bg)]'}`}>
                  {l}
                </button>
              ))}
            </div>
          </aside>

          {/* Resultados */}
          <main className="flex-1 min-w-0">

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-syne font-bold text-sb-text">
                  {loading ? 'Buscando...' : (
                    tieneRuta
                      ? `${origen} → ${destino}`
                      : `${viajesOrdenados.length} viaje${viajesOrdenados.length !== 1 ? 's' : ''} disponibles`
                  )}
                </h2>
                {!loading && tieneRuta && (
                  <p className="text-sb-muted text-sm mt-0.5">
                    {viajesOrdenados.length} salida{viajesOrdenados.length !== 1 ? 's' : ''} encontrada{viajesOrdenados.length !== 1 ? 's' : ''}
                    {fecha && ` · ${formatFechaGrupo(toDateStr(fecha))}`}
                  </p>
                )}
              </div>
              {fecha && (
                <button
                  onClick={() => setSearchParams(p => { p.delete('fecha'); return p })}
                  className="text-xs text-sb-muted hover:text-sb-text transition-colors flex items-center gap-1"
                >
                  ✕ Quitar fecha
                </button>
              )}
            </div>

            {loading ? (
              <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>

            ) : viajesOrdenados.length === 0 ? (
              <EmptyState
                icon="🚌"
                title="No encontramos viajes"
                description="Prueba cambiando la fecha o el destino."
              />

            ) : viajesPorFecha ? (
              /* ── Vista agrupada por fecha (sin fecha fija) ── */
              <div className="space-y-10">
                {viajesPorFecha.map(([fechaGrupo, trips]) => (
                  <div key={fechaGrupo}>
                    {/* Cabecera de fecha */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex items-center gap-2 px-4 py-2 rounded-xl"
                        style={{ backgroundColor: 'var(--sb-active-bg)', border: '1px solid var(--sb-blue-lt)' }}>
                        <svg className="w-4 h-4 text-sb-blue-lt" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="font-syne font-bold text-sm capitalize text-sb-blue-lt">
                          {formatFechaGrupo(fechaGrupo)}
                        </span>
                      </div>
                      <span className="text-xs text-sb-muted font-semibold">
                        {trips.length} salida{trips.length !== 1 ? 's' : ''}
                      </span>
                    </div>

                    {/* Tarjetas del día */}
                    <div className="space-y-3">
                      {trips.map(v => {
                        const sc = seatColor(v.asientos_disponibles, v.asientos_total)
                        const sinLugares = v.asientos_disponibles === 0
                        const asientoPct = Math.round((v.asientos_disponibles / v.asientos_total) * 100)

                        return (
                          <div key={v.id}
                            className="card p-4 flex flex-col sm:flex-row sm:items-center gap-4 transition-all hover:border-sb-blue/20">

                            {/* Hora */}
                            <div className="flex-shrink-0 text-center sm:w-24 sm:border-r pr-4"
                              style={{ borderColor: 'var(--sb-border)' }}>
                              <p className="font-syne font-extrabold text-2xl text-sb-text">
                                {v.hora_salida.slice(0, 5)}
                              </p>
                              <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-semibold"
                                style={{ backgroundColor: 'var(--sb-active-bg)', color: 'var(--sb-blue-lt)', border: '1px solid rgba(91,116,240,.25)' }}>
                                {v.duracion_horas ? `${v.duracion_horas}h` : '—'}
                              </span>
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <p className="font-syne font-bold text-sb-text">
                                {v.ciudad_origen ?? origen} <span className="text-sb-blue-lt">→</span> {v.ciudad_destino ?? destino}
                              </p>
                              <div className="flex flex-wrap items-center gap-2 mt-1">
                                <span className="text-xs text-sb-muted capitalize">{v.clase}</span>
                                <span className="w-1 h-1 rounded-full bg-sb-muted/40" />
                                <span className="text-xs text-sb-muted">
                                  {v.tipo_servicio === 'directo' ? '✈ Directo' : '🔄 Con parada'}
                                </span>
                              </div>
                              <div className="mt-2.5">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs text-sb-muted">{v.asientos_disponibles}/{v.asientos_total} asientos</span>
                                  <span className="text-xs font-bold" style={{ color: sc }}>{asientoPct}% libre</span>
                                </div>
                                <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--sb-border)' }}>
                                  <div className="h-full rounded-full" style={{ width: `${asientoPct}%`, backgroundColor: sc }} />
                                </div>
                              </div>
                            </div>

                            {/* Precio + CTA */}
                            <div className="flex-shrink-0 flex sm:flex-col items-center sm:items-end gap-3 sm:gap-1">
                              <div className="text-right">
                                <p className="font-syne font-extrabold text-xl text-sb-text">
                                  {formatPrice(v.precio_base)}
                                </p>
                                <p className="text-xs text-sb-muted">por persona</p>
                              </div>
                              <button
                                onClick={() => navigate(`/viajes/${v.id}`)}
                                disabled={sinLugares}
                                className="px-5 py-2 rounded-lg text-xs font-bold transition-all"
                                style={sinLugares
                                  ? { backgroundColor: 'var(--sb-badge-bg)', border: '1px solid var(--sb-border)', color: 'var(--sb-muted)', cursor: 'not-allowed' }
                                  : { backgroundColor: 'var(--sb-blue)', border: '1px solid var(--sb-blue-lt)', color: 'white', boxShadow: '0 4px 12px rgba(61,86,212,.3)' }
                                }
                              >
                                {sinLugares ? 'Sin lugares' : 'Seleccionar →'}
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>

            ) : (
              /* ── Vista normal con fecha específica ── */
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {viajesOrdenados.map(v => <ViajeCard key={v.id} viaje={v} />)}
              </div>
            )}
          </main>
        </div>
      </div>
      <Footer />
    </div>
  )
}
