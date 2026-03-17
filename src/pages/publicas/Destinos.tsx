import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api'
import type { Ruta } from '../../types'
import { NavbarPublico } from '../../components/layout/NavbarPublico'
import { Footer } from '../../components/layout/Footer'
import { formatTipoServicio } from '../../utils/formatters'

// ─── Fallback ─────────────────────────────────────────────────────────────────

const RUTAS_FALLBACK: Ruta[] = [
  { id: 1, ciudad_origen: 'Ciudad de México', ciudad_destino: 'Los Ángeles',  duracion_horas: 36, distancia_km: 3560, tipo_servicio: 'directo',  activa: true },
  { id: 2, ciudad_origen: 'Ciudad de México', ciudad_destino: 'Dallas',       duracion_horas: 32, distancia_km: 2800, tipo_servicio: 'directo',  activa: true },
  { id: 3, ciudad_origen: 'Ciudad de México', ciudad_destino: 'Chicago',      duracion_horas: 48, distancia_km: 4100, tipo_servicio: '1_parada', activa: true },
  { id: 4, ciudad_origen: 'Monterrey',        ciudad_destino: 'Houston',      duracion_horas: 14, distancia_km: 1100, tipo_servicio: 'directo',  activa: true },
  { id: 5, ciudad_origen: 'Monterrey',        ciudad_destino: 'San Antonio',  duracion_horas: 12, distancia_km: 900,  tipo_servicio: 'directo',  activa: true },
  { id: 6, ciudad_origen: 'Tijuana',          ciudad_destino: 'San Diego',    duracion_horas: 2,  distancia_km: 32,   tipo_servicio: 'directo',  activa: true },
  { id: 7, ciudad_origen: 'Guadalajara',      ciudad_destino: 'Los Ángeles',  duracion_horas: 40, distancia_km: 3800, tipo_servicio: '1_parada', activa: true },
  { id: 8, ciudad_origen: 'Chihuahua',        ciudad_destino: 'El Paso',      duracion_horas: 3,  distancia_km: 300,  tipo_servicio: 'directo',  activa: true },
  { id: 9, ciudad_origen: 'Ciudad de México', ciudad_destino: 'Phoenix',      duracion_horas: 30, distancia_km: 2600, tipo_servicio: 'directo',  activa: true },
]

const ROUTE_CFG = [
  { gradient: 'linear-gradient(135deg,rgba(61,86,212,.4),rgba(91,116,240,.2))',    icon: '🌆', badge: 'Más reservada',  badgeColor: '#5B74F0', badgeBg: 'rgba(91,116,240,.2)'  },
  { gradient: 'linear-gradient(135deg,rgba(6,182,212,.35),rgba(61,86,212,.2))',    icon: '🤠', badge: 'Popular',        badgeColor: '#06B6D4', badgeBg: 'rgba(6,182,212,.2)'   },
  { gradient: 'linear-gradient(135deg,rgba(167,139,250,.35),rgba(91,116,240,.2))', icon: '🌉', badge: 'Más económica',  badgeColor: '#A78BFA', badgeBg: 'rgba(167,139,250,.2)' },
  { gradient: 'linear-gradient(135deg,rgba(34,197,94,.3),rgba(61,86,212,.2))',     icon: '🚀', badge: 'Exprés',         badgeColor: '#22C55E', badgeBg: 'rgba(34,197,94,.18)'  },
  { gradient: 'linear-gradient(135deg,rgba(245,158,11,.3),rgba(61,86,212,.2))',    icon: '🌵', badge: 'Favorita',       badgeColor: '#F59E0B', badgeBg: 'rgba(245,158,11,.18)' },
  { gradient: 'linear-gradient(135deg,rgba(239,68,68,.25),rgba(91,116,240,.2))',   icon: '🏖️', badge: 'Directa',        badgeColor: '#F87171', badgeBg: 'rgba(239,68,68,.15)'  },
  { gradient: 'linear-gradient(135deg,rgba(16,185,129,.3),rgba(61,86,212,.2))',    icon: '🌇', badge: 'Recomendada',    badgeColor: '#10B981', badgeBg: 'rgba(16,185,129,.18)' },
  { gradient: 'linear-gradient(135deg,rgba(99,102,241,.35),rgba(167,139,250,.2))', icon: '🏛️', badge: 'Nueva ruta',     badgeColor: '#818CF8', badgeBg: 'rgba(99,102,241,.2)'  },
  { gradient: 'linear-gradient(135deg,rgba(236,72,153,.25),rgba(91,116,240,.2))',  icon: '🌅', badge: 'Oferta',         badgeColor: '#F472B6', badgeBg: 'rgba(236,72,153,.15)' },
]

const priceFromKm = (km = 0) => {
  if (km < 100)  return 'Desde $350'
  if (km < 1000) return 'Desde $900'
  if (km < 2000) return 'Desde $1,800'
  return 'Desde $2,500'
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Destinos() {
  const navigate = useNavigate()
  const [rutas, setRutas] = useState<Ruta[]>(RUTAS_FALLBACK)
  const [query, setQuery] = useState('')
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'directo' | 'parada'>('todos')

  useEffect(() => {
    api.get('/rutas')
      .then(r => { if (r.data.data?.length) setRutas(r.data.data) })
      .catch(() => {})
  }, [])

  const ciudadesOrigen = useMemo(() => [...new Set(rutas.map(r => r.ciudad_origen))].sort(), [rutas])

  const rutasFiltradas = useMemo(() => {
    const q = query.toLowerCase()
    return rutas.filter(r => {
      const matchQuery = !q ||
        r.ciudad_origen.toLowerCase().includes(q) ||
        r.ciudad_destino.toLowerCase().includes(q)
      const matchTipo =
        filtroTipo === 'todos' ||
        (filtroTipo === 'directo' && r.tipo_servicio === 'directo') ||
        (filtroTipo === 'parada' && r.tipo_servicio !== 'directo')
      return matchQuery && matchTipo
    })
  }, [rutas, query, filtroTipo])

  return (
    <div className="min-h-screen">
      <NavbarPublico />

      {/* ── HERO ── */}
      <section
        className="pt-32 pb-16 px-4 relative overflow-hidden"
        style={{ backgroundColor: 'var(--sb-bg)' }}
      >
        {/* Fondo decorativo */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, #3D56D4 0%, transparent 70%)' }} />
          <div className="absolute -bottom-20 -right-20 w-[400px] h-[400px] rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #A78BFA 0%, transparent 70%)' }} />
        </div>

        <div className="max-w-5xl mx-auto relative text-center">
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6"
            style={{ backgroundColor: 'rgba(91,116,240,.15)', border: '1px solid rgba(91,116,240,.4)', color: '#5B74F0' }}>
            🗺️ Destinos
          </span>
          <h1 className="font-syne font-extrabold text-4xl md:text-6xl text-sb-text leading-tight mb-4">
            Todos nuestros <span className="text-gradient">destinos</span>
          </h1>
          <p className="text-sb-muted text-lg max-w-xl mx-auto mb-10">
            {rutas.length} rutas conectando México con Estados Unidos. Elige tu próximo destino.
          </p>

          {/* Barra de búsqueda */}
          <div className="max-w-xl mx-auto relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-sb-muted pointer-events-none"
              fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0" />
            </svg>
            <input
              type="text"
              placeholder="Busca ciudad de origen o destino…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm"
              style={{
                backgroundColor: 'var(--sb-input-bg)',
                border: '1px solid var(--sb-border2)',
                color: 'var(--sb-text)',
              }}
            />
            {query && (
              <button onClick={() => setQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-sb-muted hover:text-sb-text">
                ✕
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── FILTROS + STATS ── */}
      <div className="sticky top-16 z-20 border-b"
        style={{ backgroundColor: 'var(--sb-nav-bg)', borderColor: 'var(--sb-border)', backdropFilter: 'blur(12px)' }}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {/* Chips */}
          <div className="flex items-center gap-2 flex-wrap">
            {([
              { key: 'todos',   label: 'Todos los servicios' },
              { key: 'directo', label: '✈ Directo'           },
              { key: 'parada',  label: '🔄 Con parada'        },
            ] as { key: 'todos'|'directo'|'parada'; label: string }[]).map(f => (
              <button key={f.key} onClick={() => setFiltroTipo(f.key)}
                className="px-4 py-1.5 rounded-full text-xs font-bold transition-all"
                style={filtroTipo === f.key
                  ? { backgroundColor: 'var(--sb-blue)', border: '1px solid var(--sb-blue-lt)', color: 'white' }
                  : { backgroundColor: 'var(--sb-badge-bg)', border: '1px solid var(--sb-border)', color: 'var(--sb-muted)' }
                }>
                {f.label}
              </button>
            ))}
          </div>
          <span className="text-xs text-sb-muted font-semibold flex-shrink-0">
            {rutasFiltradas.length} ruta{rutasFiltradas.length !== 1 ? 's' : ''} encontrada{rutasFiltradas.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Ciudades de origen como chips de acceso rápido */}
        <div className="max-w-7xl mx-auto px-4 pb-3 flex items-center gap-2 overflow-x-auto scrollbar-hide">
          <span className="text-xs text-sb-muted flex-shrink-0 mr-1">Origen:</span>
          <button onClick={() => setQuery('')}
            className="px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0 transition-all"
            style={!query
              ? { backgroundColor: 'var(--sb-blue)', color: 'white' }
              : { backgroundColor: 'var(--sb-badge-bg)', border: '1px solid var(--sb-border)', color: 'var(--sb-muted)' }
            }>
            Todas
          </button>
          {ciudadesOrigen.map(c => (
            <button key={c} onClick={() => setQuery(c)}
              className="px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0 transition-all whitespace-nowrap"
              style={query === c
                ? { backgroundColor: 'var(--sb-blue)', color: 'white' }
                : { backgroundColor: 'var(--sb-badge-bg)', border: '1px solid var(--sb-border)', color: 'var(--sb-muted)' }
              }>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* ── GRID DE RUTAS ── */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        {rutasFiltradas.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-5xl mb-4">🔍</p>
            <p className="font-syne font-bold text-sb-text text-xl mb-2">Sin resultados</p>
            <p className="text-sb-muted mb-6">No encontramos rutas para "{query}"</p>
            <button onClick={() => { setQuery(''); setFiltroTipo('todos') }}
              className="btn-secondary text-sm px-6 py-2.5">
              Limpiar búsqueda
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rutasFiltradas.map((ruta, idx) => {
              const cfg = ROUTE_CFG[idx % ROUTE_CFG.length]
              const precio = priceFromKm(ruta.distancia_km)
              return (
                <article
                  key={ruta.id}
                  className="rounded-2xl overflow-hidden group cursor-pointer transition-all duration-300 hover:-translate-y-1.5"
                  style={{
                    border: '1px solid var(--sb-border)',
                    backgroundColor: 'var(--sb-card-bg)',
                    boxShadow: 'var(--sb-card-shadow)',
                  }}
                  onClick={() => navigate(`/buscar?origen=${encodeURIComponent(ruta.ciudad_origen)}&destino=${encodeURIComponent(ruta.ciudad_destino)}`)}
                >
                  {/* Área visual */}
                  <div className="relative h-48 flex items-center justify-center overflow-hidden"
                    style={{ background: cfg.gradient }}>
                    <span className="text-6xl select-none group-hover:scale-110 transition-transform duration-500">
                      {cfg.icon}
                    </span>
                    {/* Badge */}
                    <span className="absolute top-3 left-3 text-xs font-bold px-3 py-1 rounded-full"
                      style={{ backgroundColor: cfg.badgeBg, color: cfg.badgeColor, border: `1px solid ${cfg.badgeColor}55` }}>
                      {cfg.badge}
                    </span>
                    {/* Tipo servicio */}
                    <span className="absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full"
                      style={{ backgroundColor: 'rgba(0,0,0,.4)', color: 'rgba(255,255,255,.85)', backdropFilter: 'blur(8px)' }}>
                      {ruta.tipo_servicio === 'directo' ? '✈ Directo' : formatTipoServicio(ruta.tipo_servicio)}
                    </span>
                    {/* Overlay en hover */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4"
                      style={{ background: 'linear-gradient(to top,rgba(13,18,32,.7),transparent)' }}>
                      <span className="text-white text-xs font-bold tracking-wider uppercase">Ver viajes →</span>
                    </div>
                  </div>

                  {/* Contenido */}
                  <div className="p-5">
                    {/* Ruta principal */}
                    <div className="flex items-start justify-between gap-2 mb-4">
                      <div>
                        <p className="font-syne font-extrabold text-sb-text text-base leading-tight">
                          {ruta.ciudad_origen}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span style={{ color: 'var(--sb-blue-lt)' }}>→</span>
                          <p className="font-syne font-bold text-base" style={{ color: 'var(--sb-blue-lt)' }}>
                            {ruta.ciudad_destino}
                          </p>
                        </div>
                      </div>
                      <span className="font-syne font-extrabold text-sm text-right flex-shrink-0 mt-0.5"
                        style={{ color: 'var(--sb-green)' }}>
                        {precio}<br />
                        <span className="text-xs font-normal text-sb-muted">MXN</span>
                      </span>
                    </div>

                    {/* Tags de info */}
                    <div className="flex flex-wrap gap-2 mb-5">
                      <span className="flex items-center gap-1.5 text-xs text-sb-muted px-3 py-1.5 rounded-lg"
                        style={{ backgroundColor: 'var(--sb-badge-bg)', border: '1px solid var(--sb-border)' }}>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0" />
                        </svg>
                        {ruta.duracion_horas}h de viaje
                      </span>
                      {ruta.distancia_km && (
                        <span className="flex items-center gap-1.5 text-xs text-sb-muted px-3 py-1.5 rounded-lg"
                          style={{ backgroundColor: 'var(--sb-badge-bg)', border: '1px solid var(--sb-border)' }}>
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                          {ruta.distancia_km.toLocaleString()} km
                        </span>
                      )}
                    </div>

                    {/* CTA */}
                    <button
                      className="w-full py-2.5 rounded-xl text-sm font-bold transition-all duration-200 group-hover:brightness-110"
                      style={{ backgroundColor: 'var(--sb-active-bg)', border: '1px solid var(--sb-blue-lt)', color: 'var(--sb-blue-lt)' }}
                    >
                      Buscar viajes →
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
