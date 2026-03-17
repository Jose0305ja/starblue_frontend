import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api from '../../api'
import type { Viaje, Ruta } from '../../types'
import { NavbarPublico } from '../../components/layout/NavbarPublico'
import { Footer } from '../../components/layout/Footer'
import { formatTipoServicio } from '../../utils/formatters'

// ─── Constants ────────────────────────────────────────────────────────────────

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const DIAS  = ['Do','Lu','Ma','Mi','Ju','Vi','Sá']
type Filtro = 'todos' | 'directo' | 'manana' | 'tarde' | 'disponible'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const todayStr = new Date().toISOString().split('T')[0]

const addHours = (hora: string, horas: number): string => {
  const [h, m] = hora.split(':').map(Number)
  const total   = h * 60 + m + Math.round(horas * 60)
  return `${String(Math.floor(total / 60) % 24).padStart(2,'0')}:${String(total % 60).padStart(2,'0')}`
}

const seatColor = (avail: number, total: number) => {
  const p = avail / total
  return p > 0.5 ? '#22C55E' : p > 0.2 ? '#F59E0B' : '#EF4444'
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Horarios() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // Si vienen parámetros de URL (ej. /horarios?fecha=2026-03-20)
  const initFecha = searchParams.get('fecha') ?? todayStr

  const [allViajes,       setAllViajes]       = useState<Viaje[]>([])
  const [rutas,           setRutas]           = useState<Ruta[]>([])
  const [fecha,           setFecha]           = useState(initFecha)
  const [viajesDelDia,    setViajesDelDia]    = useState<Viaje[]>([])
  const [loadingTrips,    setLoadingTrips]    = useState(false)
  const [filtro,          setFiltro]          = useState<Filtro>('todos')
  const [filtroRuta,      setFiltroRuta]      = useState('')
  const [viewMonth,       setViewMonth]       = useState(() => {
    const d = new Date(initFecha)
    return { year: d.getFullYear(), month: d.getMonth() }
  })

  // Cargar todos los viajes futuros (para marcar días en el calendario)
  useEffect(() => {
    api.get('/viajes').then(r => setAllViajes(r.data.data ?? [])).catch(() => {})
    api.get('/rutas').then(r => setRutas(r.data.data ?? [])).catch(() => {})
  }, [])

  // Cargar viajes del día seleccionado
  useEffect(() => {
    setLoadingTrips(true)
    api.get(`/viajes?fecha=${fecha}`)
      .then(r => setViajesDelDia(r.data.data ?? []))
      .catch(() => setViajesDelDia([]))
      .finally(() => setLoadingTrips(false))
  }, [fecha])

  const datesWithTrips = useMemo(
    () => new Set(allViajes.map(v => v.fecha_salida)),
    [allViajes]
  )

  const rutasDelDia = useMemo(
    () => [...new Set(viajesDelDia.map(v => `${v.ciudad_origen} → ${v.ciudad_destino}`))],
    [viajesDelDia]
  )

  const viajesFiltrados = useMemo(() => viajesDelDia.filter(v => {
    const matchFiltro =
      filtro === 'todos'      ||
      (filtro === 'directo'    && v.tipo_servicio === 'directo') ||
      (filtro === 'manana'     && v.hora_salida < '12:00')        ||
      (filtro === 'tarde'      && v.hora_salida >= '12:00')       ||
      (filtro === 'disponible' && v.asientos_disponibles > 0)
    const matchRuta =
      !filtroRuta ||
      `${v.ciudad_origen} → ${v.ciudad_destino}` === filtroRuta
    return matchFiltro && matchRuta
  }), [viajesDelDia, filtro, filtroRuta])

  // Calendario
  const calendarDays = useMemo(() => {
    const { year, month } = viewMonth
    const first = new Date(year, month, 1).getDay()
    const total = new Date(year, month + 1, 0).getDate()
    return [...Array(first).fill(null), ...Array.from({ length: total }, (_, i) => i + 1)]
  }, [viewMonth])

  const getDayStr = (day: number) => {
    const { year, month } = viewMonth
    return `${year}-${String(month + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
  }

  const canGoPrev = new Date(viewMonth.year, viewMonth.month, 1) >
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)

  const fechaLabel = new Date(fecha.slice(0, 10) + 'T12:00:00').toLocaleDateString('es-MX', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <div className="min-h-screen">
      <NavbarPublico />

      {/* ── HERO ── */}
      <section className="pt-28 pb-10 px-4 relative overflow-hidden"
        style={{ backgroundColor: 'var(--sb-bg)' }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #5B74F0 0%, transparent 70%)' }} />
        </div>
        <div className="max-w-3xl mx-auto relative text-center">
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-5"
            style={{ backgroundColor: 'rgba(91,116,240,.15)', border: '1px solid rgba(91,116,240,.4)', color: '#5B74F0' }}>
            🕐 Horarios
          </span>
          <h1 className="font-syne font-extrabold text-4xl md:text-5xl text-sb-text leading-tight mb-3">
            Consulta <span className="text-gradient">horarios</span>
          </h1>
          <p className="text-sb-muted">
            Selecciona una fecha en el calendario para ver las salidas disponibles.
          </p>
        </div>
      </section>

      {/* ── CONTENIDO PRINCIPAL ── */}
      <main className="max-w-7xl mx-auto px-4 py-10 pb-20">
        <div className="flex flex-col lg:flex-row gap-7">

          {/* ════════════════════════════════════
              COLUMNA IZQUIERDA — Calendario
          ════════════════════════════════════ */}
          <div className="lg:w-80 flex-shrink-0 space-y-5">

            {/* Calendario */}
            <div className="card p-5 lg:sticky lg:top-24">
              <p className="font-syne font-bold text-sm text-sb-text mb-4">Selecciona una fecha</p>

              {/* Mes nav */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => canGoPrev && setViewMonth(vm => {
                    const d = new Date(vm.year, vm.month - 1, 1)
                    return { year: d.getFullYear(), month: d.getMonth() }
                  })}
                  disabled={!canGoPrev}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-[var(--sb-hover-bg)]"
                  style={!canGoPrev ? { opacity: .3, cursor: 'not-allowed' } : {}}
                >
                  <svg className="w-4 h-4 text-sb-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <span className="font-syne font-bold text-sb-text text-sm">
                  {MESES[viewMonth.month]} {viewMonth.year}
                </span>
                <button
                  onClick={() => setViewMonth(vm => {
                    const d = new Date(vm.year, vm.month + 1, 1)
                    return { year: d.getFullYear(), month: d.getMonth() }
                  })}
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[var(--sb-hover-bg)] transition-colors"
                >
                  <svg className="w-4 h-4 text-sb-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Cabecera días */}
              <div className="grid grid-cols-7 mb-1">
                {DIAS.map(d => (
                  <div key={d} className="text-center text-xs text-sb-muted font-semibold py-1">{d}</div>
                ))}
              </div>

              {/* Días */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, i) => {
                  if (!day) return <div key={`b${i}`} />
                  const ds         = getDayStr(day)
                  const isToday    = ds === todayStr
                  const isSelected = ds === fecha
                  const hasTrips   = datesWithTrips.has(ds)
                  const isPast     = ds < todayStr

                  return (
                    <button
                      key={ds}
                      onClick={() => !isPast && setFecha(ds)}
                      disabled={isPast}
                      title={hasTrips && !isPast ? 'Hay viajes este día' : undefined}
                      className="relative flex flex-col items-center justify-center rounded-lg w-full aspect-square text-xs font-semibold transition-all"
                      style={
                        isSelected ? { backgroundColor: 'var(--sb-blue)', color: 'white', boxShadow: '0 0 12px rgba(61,86,212,.5)' }
                        : isToday  ? { backgroundColor: 'var(--sb-active-bg)', border: '1px solid var(--sb-blue-lt)', color: 'var(--sb-text)' }
                        : isPast   ? { color: 'var(--sb-border2)', cursor: 'not-allowed' }
                        : hasTrips ? { color: 'var(--sb-text)', cursor: 'pointer' }
                        : { color: 'var(--sb-muted)', cursor: 'pointer' }
                      }
                    >
                      {day}
                      {hasTrips && !isSelected && !isPast && (
                        <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                          style={{ backgroundColor: 'var(--sb-green)' }} />
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Leyenda */}
              <div className="grid grid-cols-2 gap-2 mt-5 pt-4"
                style={{ borderTop: '1px solid var(--sb-border)' }}>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: 'var(--sb-green)' }} />
                  <span className="text-xs text-sb-muted">Con viajes</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-md flex-shrink-0" style={{ backgroundColor: 'var(--sb-blue)' }} />
                  <span className="text-xs text-sb-muted">Seleccionado</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-md flex-shrink-0"
                    style={{ backgroundColor: 'var(--sb-active-bg)', border: '1px solid var(--sb-blue-lt)' }} />
                  <span className="text-xs text-sb-muted">Hoy</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-md flex-shrink-0"
                    style={{ backgroundColor: 'var(--sb-badge-bg)' }} />
                  <span className="text-xs text-sb-muted opacity-50">Sin viajes</span>
                </div>
              </div>
            </div>

            {/* Mini-stats del día */}
            {!loadingTrips && viajesDelDia.length > 0 && (
              <div className="card p-4 space-y-3">
                <p className="text-xs font-bold text-sb-muted uppercase tracking-wider">Resumen del día</p>
                {[
                  { label: 'Salidas',     val: viajesDelDia.length },
                  { label: 'Directos',    val: viajesDelDia.filter(v => v.tipo_servicio === 'directo').length },
                  { label: 'Disponibles', val: viajesDelDia.filter(v => v.asientos_disponibles > 0).length },
                ].map(s => (
                  <div key={s.label} className="flex items-center justify-between">
                    <span className="text-xs text-sb-muted">{s.label}</span>
                    <span className="font-syne font-bold text-sm text-sb-text">{s.val}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ════════════════════════════════════
              COLUMNA DERECHA — Viajes
          ════════════════════════════════════ */}
          <div className="flex-1 min-w-0">

            {/* Encabezado del día */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div>
                <p className="font-syne font-extrabold text-xl text-sb-text capitalize">{fechaLabel}</p>
                <p className="text-sb-muted text-sm mt-0.5">
                  {loadingTrips
                    ? 'Cargando viajes…'
                    : `${viajesDelDia.length} salida${viajesDelDia.length !== 1 ? 's' : ''} · ${viajesFiltrados.length} mostrando`
                  }
                </p>
              </div>
              {fecha !== todayStr && (
                <button onClick={() => { setFecha(todayStr); setViewMonth({ year: new Date().getFullYear(), month: new Date().getMonth() }) }}
                  className="btn-secondary text-xs px-4 py-2 flex-shrink-0">
                  ← Volver a hoy
                </button>
              )}
            </div>

            {/* Filtros */}
            <div className="flex flex-wrap gap-2 mb-4">
              {([
                { key: 'todos',      label: 'Todos'         },
                { key: 'directo',    label: '✈ Directo'     },
                { key: 'manana',     label: '🌅 Mañana'     },
                { key: 'tarde',      label: '🌇 Tarde'      },
                { key: 'disponible', label: '✅ Con lugares' },
              ] as { key: Filtro; label: string }[]).map(f => (
                <button key={f.key} onClick={() => setFiltro(f.key)}
                  className="px-3.5 py-1.5 rounded-full text-xs font-bold transition-all"
                  style={filtro === f.key
                    ? { backgroundColor: 'var(--sb-blue)', border: '1px solid var(--sb-blue-lt)', color: 'white' }
                    : { backgroundColor: 'var(--sb-badge-bg)', border: '1px solid var(--sb-border)', color: 'var(--sb-muted)' }
                  }>
                  {f.label}
                </button>
              ))}
            </div>

            {/* Filtro por ruta */}
            {rutasDelDia.length > 1 && (
              <div className="flex flex-wrap gap-2 mb-5">
                <span className="text-xs text-sb-muted self-center mr-1">Ruta:</span>
                <button onClick={() => setFiltroRuta('')}
                  className="px-3 py-1 rounded-full text-xs font-semibold transition-all"
                  style={!filtroRuta
                    ? { backgroundColor: 'rgba(91,116,240,.2)', color: '#5B74F0', border: '1px solid rgba(91,116,240,.3)' }
                    : { backgroundColor: 'var(--sb-badge-bg)', border: '1px solid var(--sb-border)', color: 'var(--sb-muted)' }
                  }>
                  Todas
                </button>
                {rutasDelDia.map(r => (
                  <button key={r} onClick={() => setFiltroRuta(r)}
                    className="px-3 py-1 rounded-full text-xs font-semibold transition-all whitespace-nowrap"
                    style={filtroRuta === r
                      ? { backgroundColor: 'var(--sb-active-bg)', color: 'var(--sb-blue-lt)', border: '1px solid var(--sb-blue-lt)' }
                      : { backgroundColor: 'var(--sb-badge-bg)', border: '1px solid var(--sb-border)', color: 'var(--sb-muted)' }
                    }>
                    {r}
                  </button>
                ))}
              </div>
            )}

            {/* Estados */}
            {loadingTrips ? (
              <div className="space-y-3">
                {[1,2,3,4].map(i => (
                  <div key={i} className="card p-5 animate-pulse">
                    <div className="flex gap-5">
                      <div className="space-y-2">
                        <div className="h-7 w-16 rounded-lg" style={{ backgroundColor: 'var(--sb-border2)' }} />
                        <div className="h-3 w-12 rounded" style={{ backgroundColor: 'var(--sb-border)' }} />
                      </div>
                      <div className="flex-1 space-y-2 pt-1">
                        <div className="h-4 rounded" style={{ backgroundColor: 'var(--sb-border2)', width: '60%' }} />
                        <div className="h-3 rounded" style={{ backgroundColor: 'var(--sb-border)', width: '40%' }} />
                        <div className="h-2 rounded mt-3" style={{ backgroundColor: 'var(--sb-border)', width: '100%' }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            ) : viajesFiltrados.length === 0 ? (
              <div className="card py-20 text-center">
                <p className="text-5xl mb-4">🚌</p>
                <p className="font-syne font-bold text-xl text-sb-text mb-2">Sin viajes disponibles</p>
                <p className="text-sb-muted text-sm mb-6">
                  {viajesDelDia.length > 0
                    ? 'Prueba cambiando el filtro seleccionado.'
                    : 'No hay salidas programadas para este día. Prueba otra fecha.'}
                </p>
                <div className="flex items-center justify-center gap-3 flex-wrap">
                  {filtro !== 'todos' && (
                    <button onClick={() => { setFiltro('todos'); setFiltroRuta('') }}
                      className="btn-secondary text-xs px-5 py-2.5">
                      Quitar filtros
                    </button>
                  )}
                  <button onClick={() => { setFecha(todayStr); setViewMonth({ year: new Date().getFullYear(), month: new Date().getMonth() }) }}
                    className="btn-secondary text-xs px-5 py-2.5">
                    Ver viajes de hoy
                  </button>
                </div>
              </div>

            ) : (
              <div className="space-y-3">
                {viajesFiltrados.map(v => {
                  const salida     = v.hora_salida.slice(0, 5)
                  const llegada    = v.hora_llegada_est
                    ? v.hora_llegada_est.slice(0, 5)
                    : v.duracion_horas ? addHours(v.hora_salida, v.duracion_horas) : '—'
                  const asientoPct = Math.round((v.asientos_disponibles / v.asientos_total) * 100)
                  const sc         = seatColor(v.asientos_disponibles, v.asientos_total)
                  const sinLugares = v.asientos_disponibles === 0

                  return (
                    <div key={v.id}
                      className="card p-5 flex flex-col sm:flex-row sm:items-center gap-5 transition-all duration-200 hover:border-sb-blue/20"
                    >
                      {/* ── Hora ── */}
                      <div className="flex-shrink-0 text-center sm:w-32 sm:border-r"
                        style={{ borderColor: 'var(--sb-border)' }}>
                        <p className="font-syne font-extrabold text-3xl text-sb-text">{salida}</p>
                        <p className="text-xs text-sb-muted mt-1">→ {llegada}</p>
                        <span className="inline-block mt-2 text-xs px-2.5 py-0.5 rounded-full font-semibold"
                          style={{ backgroundColor: 'var(--sb-active-bg)', color: 'var(--sb-blue-lt)', border: '1px solid var(--sb-blue-lt)' }}>
                          {v.duracion_horas ? `${v.duracion_horas}h` : '—'}
                        </span>
                      </div>

                      {/* ── Info ruta ── */}
                      <div className="flex-1 min-w-0">
                        <p className="font-syne font-bold text-sb-text text-base">
                          {v.ciudad_origen ?? '—'}{' '}
                          <span style={{ color: 'var(--sb-blue-lt)' }}>→</span>{' '}
                          {v.ciudad_destino ?? '—'}
                        </p>

                        <div className="flex flex-wrap items-center gap-2 mt-1.5">
                          <span className="text-xs text-sb-muted">
                            {v.tipo_servicio ? formatTipoServicio(v.tipo_servicio) : 'Directo'}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-sb-muted/40" />
                          <span className="text-xs capitalize font-semibold px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: 'var(--sb-badge-bg)', color: 'var(--sb-muted)', border: '1px solid var(--sb-border)' }}>
                            {v.clase}
                          </span>
                          {v.numero_unidad && (
                            <>
                              <span className="w-1 h-1 rounded-full bg-sb-muted/40" />
                              <span className="text-xs text-sb-muted font-mono-sb">#{v.numero_unidad}</span>
                            </>
                          )}
                        </div>

                        {/* Barra de asientos */}
                        <div className="mt-3">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs text-sb-muted">
                              {v.asientos_disponibles} / {v.asientos_total} asientos disponibles
                            </span>
                            <span className="text-xs font-bold" style={{ color: sc }}>{asientoPct}% libre</span>
                          </div>
                          <div className="h-2 rounded-full overflow-hidden"
                            style={{ backgroundColor: 'var(--sb-border2)' }}>
                            <div className="h-full rounded-full transition-all duration-700"
                              style={{ width: `${asientoPct}%`, backgroundColor: sc }} />
                          </div>
                        </div>
                      </div>

                      {/* ── Precio + CTA ── */}
                      <div className="flex-shrink-0 flex sm:flex-col items-center sm:items-end gap-4 sm:gap-1.5">
                        <div className="text-right">
                          <p className="font-syne font-extrabold text-2xl text-sb-text">
                            ${Number(v.precio_base).toLocaleString()}
                          </p>
                          <p className="text-xs text-sb-muted">MXN / persona</p>
                        </div>
                        <button
                          onClick={() => navigate(`/viajes/${v.id}`)}
                          disabled={sinLugares}
                          className="px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200"
                          style={
                            sinLugares
                              ? { backgroundColor: 'var(--sb-badge-bg)', border: '1px solid var(--sb-border)', color: 'var(--sb-muted)', cursor: 'not-allowed', opacity: 0.5 }
                              : { backgroundColor: 'var(--sb-blue)', border: '1px solid var(--sb-blue-lt)', color: 'white', boxShadow: '0 4px 16px rgba(61,86,212,.3)' }
                          }
                        >
                          {sinLugares ? 'Sin lugares' : 'Seleccionar →'}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
