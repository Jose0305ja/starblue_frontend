import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../api'
import type { Viaje, Ruta } from '../../types'
import { NavbarPublico } from '../../components/layout/NavbarPublico'
import { Footer } from '../../components/layout/Footer'
import { BuscadorViajes } from '../../components/viajes/BuscadorViajes'
import { NivelBadge } from '../../components/ui/NivelBadge'
import { NIVELES, getNivelColor } from '../../utils/nivelMembresia'
import { formatTipoServicio } from '../../utils/formatters'

// ─── Fallback data (siempre visible aunque la API esté apagada) ───────────────

const RUTAS_FALLBACK: Ruta[] = [
  { id: 1, ciudad_origen: 'Ciudad de México', ciudad_destino: 'Los Ángeles',  duracion_horas: 36, distancia_km: 3560, tipo_servicio: 'directo',   activa: true },
  { id: 2, ciudad_origen: 'Ciudad de México', ciudad_destino: 'Dallas',       duracion_horas: 32, distancia_km: 2800, tipo_servicio: 'directo',   activa: true },
  { id: 3, ciudad_origen: 'Ciudad de México', ciudad_destino: 'Chicago',      duracion_horas: 48, distancia_km: 4100, tipo_servicio: '1_parada',  activa: true },
  { id: 4, ciudad_origen: 'Monterrey',        ciudad_destino: 'Houston',      duracion_horas: 14, distancia_km: 1100, tipo_servicio: 'directo',   activa: true },
  { id: 5, ciudad_origen: 'Monterrey',        ciudad_destino: 'San Antonio',  duracion_horas: 12, distancia_km: 900,  tipo_servicio: 'directo',   activa: true },
  { id: 6, ciudad_origen: 'Tijuana',          ciudad_destino: 'San Diego',    duracion_horas: 2,  distancia_km: 32,   tipo_servicio: 'directo',   activa: true },
  { id: 7, ciudad_origen: 'Guadalajara',      ciudad_destino: 'Los Ángeles',  duracion_horas: 40, distancia_km: 3800, tipo_servicio: '1_parada',  activa: true },
  { id: 8, ciudad_origen: 'Chihuahua',        ciudad_destino: 'El Paso',      duracion_horas: 3,  distancia_km: 300,  tipo_servicio: 'directo',   activa: true },
  { id: 9, ciudad_origen: 'Ciudad de México', ciudad_destino: 'Phoenix',      duracion_horas: 30, distancia_km: 2600, tipo_servicio: 'directo',   activa: true },
]

// ─── Configuración visual por índice (cíclica) ────────────────────────────────

const ROUTE_CFG = [
  { gradient: 'linear-gradient(135deg,rgba(61,86,212,.35),rgba(91,116,240,.18))',   icon: '🌆', badge: 'Más reservada',  badgeColor: '#5B74F0', badgeBg: 'rgba(91,116,240,.18)' },
  { gradient: 'linear-gradient(135deg,rgba(6,182,212,.28),rgba(61,86,212,.18))',    icon: '🏙️', badge: 'Popular',        badgeColor: '#06B6D4', badgeBg: 'rgba(6,182,212,.18)'  },
  { gradient: 'linear-gradient(135deg,rgba(167,139,250,.28),rgba(91,116,240,.18))', icon: '🌉', badge: 'Más económica',  badgeColor: '#A78BFA', badgeBg: 'rgba(167,139,250,.18)'},
  { gradient: 'linear-gradient(135deg,rgba(34,197,94,.22),rgba(61,86,212,.18))',    icon: '🏛️', badge: 'Nuevas salidas', badgeColor: '#22C55E', badgeBg: 'rgba(34,197,94,.15)'  },
  { gradient: 'linear-gradient(135deg,rgba(245,158,11,.22),rgba(61,86,212,.18))',   icon: '🌄', badge: 'Favorita',       badgeColor: '#F59E0B', badgeBg: 'rgba(245,158,11,.15)' },
  { gradient: 'linear-gradient(135deg,rgba(239,68,68,.18),rgba(91,116,240,.18))',   icon: '🏖️', badge: 'Directa',        badgeColor: '#F87171', badgeBg: 'rgba(239,68,68,.12)'  },
  { gradient: 'linear-gradient(135deg,rgba(16,185,129,.22),rgba(61,86,212,.18))',   icon: '🌇', badge: 'Exprés',         badgeColor: '#10B981', badgeBg: 'rgba(16,185,129,.15)' },
  { gradient: 'linear-gradient(135deg,rgba(99,102,241,.28),rgba(167,139,250,.2))',  icon: '🗽', badge: 'Nueva ruta',     badgeColor: '#818CF8', badgeBg: 'rgba(99,102,241,.18)' },
  { gradient: 'linear-gradient(135deg,rgba(236,72,153,.2),rgba(91,116,240,.18))',   icon: '🌵', badge: 'Oferta',         badgeColor: '#F472B6', badgeBg: 'rgba(236,72,153,.12)' },
]

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const DIAS  = ['Do','Lu','Ma','Mi','Ju','Vi','Sá']

type Filtro = 'todos' | 'directo' | 'manana' | 'tarde' | 'disponible'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const addHours = (hora: string, horas: number): string => {
  const [h, m] = hora.split(':').map(Number)
  const total   = h * 60 + m + Math.round(horas * 60)
  return `${String(Math.floor(total / 60) % 24).padStart(2,'0')}:${String(total % 60).padStart(2,'0')}`
}

const seatColor = (avail: number, total: number) => {
  const p = avail / total
  return p > 0.5 ? '#22C55E' : p > 0.2 ? '#F59E0B' : '#EF4444'
}

const todayStr = new Date().toISOString().split('T')[0]

// ─── Component ────────────────────────────────────────────────────────────────

export default function Inicio() {
  const navigate = useNavigate()

  const [viajes, setViajes] = useState<Viaje[]>([])
  const [rutas,  setRutas]  = useState<Ruta[]>(RUTAS_FALLBACK)
  const [fechaHorarios,  setFechaHorarios]  = useState(todayStr)
  const [viajesHoy,      setViajesHoy]      = useState<Viaje[]>([])
  const [loadingHorarios,setLoadingHorarios] = useState(false)
  const [filtro, setFiltro] = useState<Filtro>('todos')
  const [viewMonth, setViewMonth] = useState(() => {
    const d = new Date()
    return { year: d.getFullYear(), month: d.getMonth() }
  })
  const [oferta, setOferta] = useState({
    titulo: 'Viaje redondo CDMX → Dallas',
    descripcion: 'Desde $3,300 MXN · Dos personas · Tiempo limitado',
    origen: 'Ciudad de México',
    destino: 'Dallas',
    activa: true,
  })

  useEffect(() => {
    api.get('/viajes').then(r => setViajes(r.data.data)).catch(() => {})
    api.get('/rutas').then(r => {
      if (r.data.data?.length) setRutas(r.data.data)
    }).catch(() => {})
    api.get('/config/oferta').then(r => {
      if (r.data.data) setOferta(r.data.data)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    setLoadingHorarios(true)
    api.get(`/viajes?fecha=${fechaHorarios}`)
      .then(r => setViajesHoy(r.data.data ?? []))
      .catch(() => setViajesHoy([]))
      .finally(() => setLoadingHorarios(false))
  }, [fechaHorarios])

  const datesWithTrips = useMemo(() => new Set(viajes.map(v => v.fecha_salida)), [viajes])

  const viajesFiltrados = useMemo(() => viajesHoy.filter(v => {
    if (filtro === 'directo')    return v.tipo_servicio === 'directo'
    if (filtro === 'manana')     return v.hora_salida < '12:00'
    if (filtro === 'tarde')      return v.hora_salida >= '12:00'
    if (filtro === 'disponible') return v.asientos_disponibles > 0
    return true
  }), [viajesHoy, filtro])

  // Días del mes para el calendario
  const calendarDays = useMemo(() => {
    const { year, month } = viewMonth
    const firstDay    = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    return [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]
  }, [viewMonth])

  const getDayStr = (day: number) => {
    const { year, month } = viewMonth
    return `${year}-${String(month + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
  }

  const canGoPrev = new Date(viewMonth.year, viewMonth.month, 1) >
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)

  return (
    <div className="min-h-screen">
      <NavbarPublico />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1600&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom,rgba(7,9,15,.3) 0%,rgba(7,9,15,.55) 45%,rgba(7,9,15,.97) 100%)' }} />

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center pt-24 pb-36">
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-8"
            style={{ backgroundColor: 'rgba(91,116,240,.15)', border: '1px solid rgba(91,116,240,.4)', color: '#5B74F0' }}>
            🚌 México · Estados Unidos
          </span>
          <h1 className="font-syne font-extrabold text-5xl md:text-7xl leading-none tracking-tight text-white mb-6">
            Viaja sin<br /><span className="text-gradient">fronteras.</span>
          </h1>
          <p className="text-white/65 text-lg md:text-xl max-w-xl mx-auto mb-12">
            Rutas directas entre México y EE.&nbsp;UU. Precios claros, asientos garantizados, sin sorpresas.
          </p>
          <div className="rounded-2xl p-6 text-left shadow-2xl"
            style={{ backgroundColor: 'rgba(13,18,32,.88)', border: '1px solid rgba(91,116,240,.25)', backdropFilter: 'blur(12px)' }}>
            <BuscadorViajes />
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-5 h-5" style={{ color: 'rgba(255,255,255,.35)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* ── STATS BAR ─────────────────────────────────────────────────────── */}
      <div className="border-y"
        style={{ borderColor: 'var(--sb-border)', backgroundColor: 'var(--sb-card-bg)', backdropFilter: 'blur(8px)' }}>
        <div className="max-w-7xl mx-auto px-4 py-5 grid grid-cols-3">
          {[
            { val: `${rutas.length}`, label: 'Rutas activas' },
            { val: '+20%', label: 'Descuento máximo VIP' },
            { val: '24/7', label: 'Reservas en línea' },
          ].map((s, i) => (
            <div key={s.label} className="text-center px-4"
              style={i > 0 ? { borderLeft: '1px solid var(--sb-border)' } : {}}>
              <p className="font-syne font-extrabold text-2xl md:text-3xl text-sb-blue-lt">{s.val}</p>
              <p className="text-xs text-sb-muted mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          DESTINOS  –  todas las rutas
      ══════════════════════════════════════════════════════════════════════ */}
      <section id="rutas" className="py-20 px-4 max-w-7xl mx-auto" style={{ scrollMarginTop: '5rem' }}>
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full text-sb-blue-lt"
            style={{ backgroundColor: 'var(--sb-active-bg)', border: '1px solid rgba(91,116,240,.2)' }}>
            Destinos
          </span>
          <h2 className="font-syne font-extrabold text-3xl md:text-4xl text-sb-text mt-4 mb-3">
            Todas nuestras rutas
          </h2>
          <p className="text-sb-muted text-lg">{rutas.length} rutas directas entre México y EE.&nbsp;UU.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {rutas.map((ruta, idx) => {
            const cfg = ROUTE_CFG[idx % ROUTE_CFG.length]
            return (
              <div
                key={ruta.id}
                className="rounded-2xl overflow-hidden cursor-pointer group transition-all duration-300 hover:-translate-y-1"
                style={{ border: '1px solid var(--sb-border)', backgroundColor: 'var(--sb-card-bg)', boxShadow: 'var(--sb-card-shadow)' }}
                onClick={() => navigate(`/buscar?origen=${encodeURIComponent(ruta.ciudad_origen)}&destino=${encodeURIComponent(ruta.ciudad_destino)}`)}
              >
                {/* Imagen con gradiente */}
                <div className="relative h-40 flex items-center justify-center" style={{ background: cfg.gradient }}>
                  <span className="text-5xl select-none group-hover:scale-110 transition-transform duration-300">{cfg.icon}</span>
                  <span className="absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full"
                    style={{ backgroundColor: cfg.badgeBg, color: cfg.badgeColor, border: `1px solid ${cfg.badgeColor}50` }}>
                    {cfg.badge}
                  </span>
                </div>

                {/* Cuerpo */}
                <div className="p-4">
                  <p className="font-syne font-bold text-sb-text text-sm">{ruta.ciudad_origen}</p>
                  <p className="font-syne font-bold text-sm text-sb-blue-lt">→ {ruta.ciudad_destino}</p>
                  <div className="flex items-center gap-3 mt-3">
                    <span className="text-xs text-sb-muted">⏱ {ruta.duracion_horas}h</span>
                    <span className="text-xs text-sb-muted">
                      {ruta.tipo_servicio === 'directo' ? '✈ Directo' : `🔄 ${formatTipoServicio(ruta.tipo_servicio)}`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3"
                    style={{ borderTop: '1px solid var(--sb-border)' }}>
                    <span className="text-xs text-sb-muted">{ruta.distancia_km ? `${ruta.distancia_km} km` : ''}</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: 'rgba(34,197,94,.12)', color: 'var(--sb-green)', border: '1px solid rgba(34,197,94,.25)' }}>
                      Disponible
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="text-center mt-10">
          <Link to="/buscar" className="btn-primary inline-flex items-center gap-2 text-sm">
            Buscar boletos →
          </Link>
        </div>
      </section>

      {/* ── PROMO ─────────────────────────────────────────────────────────── */}
      {oferta.activa && (
        <section className="px-4 max-w-7xl mx-auto mb-20">
          <div className="rounded-2xl relative p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden"
            style={{ background: 'linear-gradient(135deg,rgba(61,86,212,.3) 0%,rgba(167,139,250,.2) 100%)', border: '1px solid rgba(91,116,240,.3)' }}>
            <div className="absolute inset-0 pointer-events-none"
              style={{ backgroundImage: 'radial-gradient(circle at 85% 50%,rgba(91,116,240,.25) 0%,transparent 60%)' }} />
            <div className="relative">
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#A78BFA' }}>✨ Oferta de la semana</span>
              <p className="font-syne font-extrabold text-2xl md:text-3xl text-sb-text mt-2">{oferta.titulo}</p>
              <p className="mt-1.5 text-sb-muted">{oferta.descripcion}</p>
            </div>
            <Link
              to={`/buscar?origen=${encodeURIComponent(oferta.origen)}&destino=${encodeURIComponent(oferta.destino)}`}
              className="btn-primary px-8 py-3 flex-shrink-0 relative text-sm font-bold">
              Ver oferta →
            </Link>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          HORARIOS  –  calendario + lista de viajes
      ══════════════════════════════════════════════════════════════════════ */}
      <section id="horarios" className="py-20 px-4 max-w-7xl mx-auto" style={{ scrollMarginTop: '5rem' }}>
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full text-sb-blue-lt"
            style={{ backgroundColor: 'var(--sb-active-bg)', border: '1px solid rgba(91,116,240,.2)' }}>
            Horarios
          </span>
          <h2 className="font-syne font-extrabold text-3xl md:text-4xl text-sb-text mt-4 mb-3">Salidas disponibles</h2>
          <p className="text-sb-muted text-lg">Selecciona una fecha para ver los viajes del día</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">

          {/* ── CALENDARIO ── */}
          <div className="lg:w-72 flex-shrink-0">
            <div className="card p-5 lg:sticky lg:top-24">

              {/* Navegación mes */}
              <div className="flex items-center justify-between mb-5">
                <button
                  onClick={() => canGoPrev && setViewMonth(vm => {
                    const d = new Date(vm.year, vm.month - 1, 1)
                    return { year: d.getFullYear(), month: d.getMonth() }
                  })}
                  className="p-2 rounded-lg transition-colors"
                  style={canGoPrev ? {} : { opacity: .25, cursor: 'not-allowed' }}
                  disabled={!canGoPrev}
                >
                  <svg className="w-4 h-4 text-sb-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <span className="font-syne font-bold text-sb-text">
                  {MESES[viewMonth.month]} {viewMonth.year}
                </span>

                <button onClick={() => setViewMonth(vm => {
                  const d = new Date(vm.year, vm.month + 1, 1)
                  return { year: d.getFullYear(), month: d.getMonth() }
                })} className="p-2 rounded-lg hover:bg-[var(--sb-hover-bg)] transition-colors">
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

              {/* Cuadrícula días */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, i) => {
                  if (!day) return <div key={`b${i}`} />
                  const ds      = getDayStr(day)
                  const isToday    = ds === todayStr
                  const isSelected = ds === fechaHorarios
                  const hasTrips   = datesWithTrips.has(ds)
                  const isPast     = ds < todayStr

                  return (
                    <button
                      key={ds}
                      onClick={() => !isPast && setFechaHorarios(ds)}
                      disabled={isPast}
                      className="relative flex flex-col items-center justify-center rounded-lg w-full aspect-square text-xs font-semibold transition-all"
                      style={
                        isSelected ? { backgroundColor: 'var(--sb-blue)', color: 'white' }
                        : isToday  ? { backgroundColor: 'var(--sb-active-bg)', border: '1px solid rgba(91,116,240,.45)', color: 'var(--sb-text)' }
                        : isPast   ? { color: 'var(--sb-muted)', opacity: 0.4, cursor: 'not-allowed' }
                        : { color: 'var(--sb-text)' }
                      }
                    >
                      {day}
                      {hasTrips && !isSelected && !isPast && (
                        <span className="absolute bottom-0.5 w-1 h-1 rounded-full" style={{ backgroundColor: 'var(--sb-green)' }} />
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Leyenda */}
              <div className="flex items-center gap-4 mt-5 pt-4"
                style={{ borderTop: '1px solid var(--sb-border)' }}>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--sb-green)', display: 'inline-block' }} />
                  <span className="text-xs text-sb-muted">Con viajes</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-md" style={{ backgroundColor: 'var(--sb-blue)', display: 'inline-block' }} />
                  <span className="text-xs text-sb-muted">Seleccionado</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── LISTA DE VIAJES ── */}
          <div className="flex-1 min-w-0">

            {/* Chips de filtro */}
            <div className="flex flex-wrap gap-2 mb-5">
              {([
                { key: 'todos',      label: 'Todos'         },
                { key: 'directo',    label: 'Directo'       },
                { key: 'manana',     label: '🌅 Mañana'     },
                { key: 'tarde',      label: '🌇 Tarde'      },
                { key: 'disponible', label: '✅ Con lugares' },
              ] as { key: Filtro; label: string }[]).map(f => (
                <button
                  key={f.key}
                  onClick={() => setFiltro(f.key)}
                  className="px-4 py-1.5 rounded-full text-xs font-bold transition-all"
                  style={
                    filtro === f.key
                      ? { backgroundColor: 'var(--sb-blue)', border: '1px solid var(--sb-blue-lt)', color: 'white' }
                      : { backgroundColor: 'var(--sb-badge-bg)', border: '1px solid var(--sb-border2)', color: 'var(--sb-muted)' }
                  }
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Etiqueta de fecha */}
            <p className="text-sm text-sb-muted mb-4 font-semibold capitalize">
              {new Date(fechaHorarios.slice(0, 10) + 'T12:00:00').toLocaleDateString('es-MX', {
                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
              })}
              {' — '}
              <span className="text-sb-blue-lt">
                {viajesFiltrados.length} viaje{viajesFiltrados.length !== 1 ? 's' : ''}
              </span>
            </p>

            {/* Estados */}
            {loadingHorarios ? (
              <div className="space-y-3">
                {[1,2,3].map(i => (
                  <div key={i} className="card p-5 animate-pulse">
                    <div className="flex gap-4">
                      <div className="h-8 w-20 rounded" style={{ backgroundColor: 'var(--sb-border)' }} />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 rounded" style={{ backgroundColor: 'var(--sb-border)', width: '55%' }} />
                        <div className="h-3 rounded" style={{ backgroundColor: 'var(--sb-badge-bg)', width: '40%' }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : viajesFiltrados.length === 0 ? (
              <div className="card p-14 text-center">
                <p className="text-5xl mb-4">🚌</p>
                <p className="font-syne font-bold text-sb-text text-lg mb-2">Sin viajes para este día</p>
                <p className="text-sb-muted text-sm mb-6">
                  Prueba otra fecha o cambia el filtro.
                </p>
                <button
                  onClick={() => setFechaHorarios(todayStr)}
                  className="btn-secondary text-sm px-6 py-2.5"
                >
                  Ver viajes de hoy
                </button>
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
                    <div key={v.id} className="card p-5 flex flex-col sm:flex-row sm:items-center gap-4 transition-all duration-200 hover:border-sb-blue/20">

                      {/* Hora */}
                      <div className="flex-shrink-0 text-center sm:w-28">
                        <p className="font-syne font-extrabold text-2xl text-sb-text">{salida}</p>
                        <p className="text-xs text-sb-muted mt-0.5">→ {llegada}</p>
                        <span className="inline-block mt-2 text-xs px-2.5 py-0.5 rounded-full font-semibold"
                          style={{ backgroundColor: 'var(--sb-active-bg)', color: 'var(--sb-blue-lt)', border: '1px solid rgba(91,116,240,.25)' }}>
                          {v.duracion_horas ? `${v.duracion_horas}h` : '—'}
                        </span>
                      </div>

                      {/* Ruta + asientos */}
                      <div className="flex-1 min-w-0">
                        <p className="font-syne font-bold text-sb-text">
                          {v.ciudad_origen ?? '—'} <span className="text-sb-blue-lt">→</span> {v.ciudad_destino ?? '—'}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className="text-xs text-sb-muted">
                            {v.tipo_servicio ? formatTipoServicio(v.tipo_servicio) : 'Directo'}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full capitalize font-semibold"
                            style={{ backgroundColor: 'var(--sb-badge-bg)', color: 'var(--sb-muted)', border: '1px solid var(--sb-border)' }}>
                            {v.clase}
                          </span>
                        </div>
                        <div className="mt-3">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs text-sb-muted">{v.asientos_disponibles} de {v.asientos_total} asientos</span>
                            <span className="text-xs font-bold" style={{ color: sc }}>{asientoPct}% libre</span>
                          </div>
                          <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--sb-border)' }}>
                            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${asientoPct}%`, backgroundColor: sc }} />
                          </div>
                        </div>
                      </div>

                      {/* Precio + CTA */}
                      <div className="flex-shrink-0 flex sm:flex-col items-center sm:items-end gap-3 sm:gap-1">
                        <div className="text-right">
                          <p className="font-syne font-extrabold text-xl text-sb-text">${Number(v.precio_base).toLocaleString()}</p>
                          <p className="text-xs text-sb-muted">MXN / persona</p>
                        </div>
                        <button
                          onClick={() => navigate(`/viajes/${v.id}`)}
                          disabled={sinLugares}
                          className="mt-1 px-5 py-2 rounded-lg text-xs font-bold transition-all"
                          style={
                            sinLugares
                              ? { backgroundColor: 'var(--sb-badge-bg)', border: '1px solid var(--sb-border2)', color: 'var(--sb-muted)', cursor: 'not-allowed' }
                              : { backgroundColor: 'var(--sb-blue)', border: '1px solid var(--sb-blue-lt)', color: 'white' }
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
      </section>

      {/* ── MEMBRESÍAS ────────────────────────────────────────────────────── */}
      <section id="niveles" className="py-20 px-4 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full text-sb-blue-lt"
            style={{ backgroundColor: 'var(--sb-active-bg)', border: '1px solid rgba(91,116,240,.2)' }}>
            Membresías
          </span>
          <h2 className="font-syne font-extrabold text-3xl md:text-4xl text-sb-text mt-4 mb-3">Viaja más, paga menos</h2>
          <p className="text-sb-muted text-lg">Tu nivel sube automáticamente con cada viaje. Sin cuotas ni suscripciones.</p>
        </div>

        <div className="grid sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {NIVELES.map((nivel, idx) => {
            const isPopular = idx === 2
            return (
              <div key={nivel.nivel} className="relative card p-5 text-center"
                style={isPopular ? { borderColor: 'rgba(91,116,240,.5)', boxShadow: '0 0 28px rgba(91,116,240,.18)' } : {}}>
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="text-xs font-bold px-3 py-1 rounded-full text-white"
                      style={{ backgroundColor: 'var(--sb-blue)', border: '1px solid var(--sb-blue-lt)' }}>
                      Popular
                    </span>
                  </div>
                )}
                <p className="text-2xl mb-3">{nivel.label.split(' ')[0]}</p>
                <NivelBadge nivel={nivel.nivel} size="sm" />
                <p className="font-syne font-extrabold text-2xl mt-4" style={{ color: getNivelColor(nivel.nivel) }}>
                  {nivel.descuento > 0 ? `-${nivel.descuento}%` : 'Base'}
                </p>
                <p className="text-xs text-sb-muted mt-1 font-semibold">
                  {nivel.max === Infinity ? `${nivel.min}+ viajes` : `${nivel.min}–${nivel.max} viajes`}
                </p>
                {nivel.beneficios && (
                  <ul className="mt-4 space-y-1.5 text-left">
                    {nivel.beneficios.slice(0, 2).map(b => (
                      <li key={b} className="flex items-start gap-1.5 text-xs text-sb-muted">
                        <span className="flex-shrink-0 text-sb-green">✓</span> {b}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )
          })}
        </div>

        <div className="text-center mt-10">
          <Link to="/niveles" className="btn-secondary inline-flex items-center gap-2 text-sm">
            Ver todos los beneficios →
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
