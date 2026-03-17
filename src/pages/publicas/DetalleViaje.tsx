import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../api'
import type { Viaje } from '../../types'
import { useAuth } from '../../context/AuthContext'
import { NavbarPublico } from '../../components/layout/NavbarPublico'
import { Footer } from '../../components/layout/Footer'
import { EstadoBadge } from '../../components/ui/EstadoBadge'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { formatFecha, formatHora, formatClase, formatTipoServicio } from '../../utils/formatters'
import { getDescuento } from '../../utils/nivelMembresia'
import { useCurrency } from '../../context/CurrencyContext'

export default function DetalleViaje() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { usuario, isAuthenticated } = useAuth()
  const [viaje, setViaje] = useState<Viaje | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/viajes/${id}`)
      .then(r => setViaje(r.data.data))
      .catch(() => setViaje(null))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>
  if (!viaje) return <div className="min-h-screen flex items-center justify-center"><p className="text-sb-muted">Viaje no encontrado</p></div>

  const { formatPrice } = useCurrency()
  const descuento = usuario ? getDescuento(usuario.viajes_realizados) : 0
  const precio = Number(viaje.precio_base)
  const precioFinal = precio * (1 - descuento / 100)
  const origen = viaje.ciudad_origen ?? '—'
  const destino = viaje.ciudad_destino ?? '—'

  const handleReservar = () => {
    if (!isAuthenticated) navigate('/login')
    else navigate(`/reservar/${viaje.id}`)
  }

  return (
    <div className="min-h-screen">
      <NavbarPublico />
      <div className="pt-24 pb-20 px-4 max-w-3xl mx-auto">
        <button onClick={() => navigate(-1)} className="text-sb-muted hover:text-sb-text text-sm mb-6 flex items-center gap-1 transition-colors">
          ← Volver
        </button>

        <div className="card p-6 md:p-8">
          {/* Header ruta */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 font-syne font-extrabold text-2xl md:text-3xl text-sb-text">
                <span>{origen}</span>
                <span className="text-sb-blue-lt">→</span>
                <span>{destino}</span>
              </div>
              <p className="text-sb-muted mt-1">{formatFecha(viaje.fecha_salida)}</p>
            </div>
            <EstadoBadge estado={viaje.estado} />
          </div>

          {/* Horario */}
          <div className="flex items-center gap-8 py-5 border-y mb-6" style={{ borderColor: 'var(--sb-border)' }}>
            <div>
              <p className="text-sb-muted text-xs mb-1">Salida</p>
              <p className="font-mono-sb text-3xl font-semibold text-sb-text">{formatHora(viaje.hora_salida)}</p>
            </div>
            <div className="flex-1 text-center">
              <p className="text-sb-muted text-xs">{viaje.duracion_horas ? `${viaje.duracion_horas}h` : '—'}</p>
              <div className="flex items-center gap-1 mt-1">
                <div className="h-px flex-1" style={{ backgroundColor: 'var(--sb-border2)' }} />
                <span className="text-sb-blue-lt">✈</span>
                <div className="h-px flex-1" style={{ backgroundColor: 'var(--sb-border2)' }} />
              </div>
            </div>
            <div className="text-right">
              <p className="text-sb-muted text-xs mb-1">Llegada est.</p>
              <p className="font-mono-sb text-3xl font-semibold text-sb-text">
                {viaje.hora_llegada_est ? formatHora(viaje.hora_llegada_est) : '—'}
              </p>
            </div>
          </div>

          {/* Detalles */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Clase', value: formatClase(viaje.clase) },
              { label: 'Tipo de servicio', value: formatTipoServicio(viaje.tipo_servicio ?? 'directo') },
              { label: 'Asientos disponibles', value: String(viaje.asientos_disponibles) },
              { label: 'Unidad', value: viaje.numero_unidad ?? 'N/A' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-sb-bg3 rounded-lg p-3">
                <p className="text-xs text-sb-muted mb-1">{label}</p>
                <p className="font-semibold text-sb-text text-sm">{value}</p>
              </div>
            ))}
          </div>

          {/* Precio */}
          <div className="flex items-end justify-between pt-5 border-t" style={{ borderColor: 'var(--sb-border)' }}>
            <div>
              {descuento > 0 && isAuthenticated ? (
                <div>
                  <p className="text-sb-muted text-sm line-through">{formatPrice(precio)}</p>
                  <p className="font-mono-sb font-bold text-3xl text-sb-green">{formatPrice(precioFinal)}</p>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(34,197,94,0.15)', color: 'var(--sb-green)' }}>
                    {descuento}% de descuento aplicado
                  </span>
                </div>
              ) : (
                <div>
                  <p className="font-mono-sb font-bold text-3xl text-sb-text">{formatPrice(precio)}</p>
                  {!isAuthenticated && (
                    <p className="text-xs text-sb-muted mt-1">
                      <span className="text-sb-blue-lt cursor-pointer" onClick={() => navigate('/login')}>Inicia sesión</span> para ver tu descuento
                    </p>
                  )}
                </div>
              )}
              <p className="text-xs text-sb-muted mt-1">por pasajero · ida</p>
            </div>

            <button
              onClick={handleReservar}
              disabled={viaje.asientos_disponibles === 0 || viaje.estado === 'cancelado'}
              className="btn-primary px-8 py-3 text-base"
            >
              {viaje.asientos_disponibles === 0 ? 'Sin lugares' : 'Reservar ahora →'}
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
