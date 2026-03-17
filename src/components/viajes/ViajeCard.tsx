import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { formatMXN, formatFechaCorta, formatHora, formatClase } from '../../utils/formatters'
import { getDescuento } from '../../utils/nivelMembresia'
import type { Viaje } from '../../types'

interface ViajeCardProps {
  viaje: Viaje
}

export const ViajeCard = ({ viaje }: ViajeCardProps) => {
  const navigate = useNavigate()
  const { usuario } = useAuth()

  const descuento = usuario ? getDescuento(usuario.viajes_realizados) : 0
  const precio = Number(viaje.precio_base)
  const precioConDescuento = precio * (1 - descuento / 100)

  const asientosColor =
    viaje.asientos_disponibles < 5 ? '#EF4444' :
    viaje.asientos_disponibles < 10 ? '#F59E0B' : '#22C55E'

  const claseColors: Record<string, string> = {
    estandar: '#8891A8',
    ejecutivo: '#5B74F0',
    vip: '#EAB308',
  }
  const claseColor = claseColors[viaje.clase] ?? '#8891A8'

  const origen = viaje.ciudad_origen ?? viaje.ruta?.ciudad_origen ?? '—'
  const destino = viaje.ciudad_destino ?? viaje.ruta?.ciudad_destino ?? '—'
  const duracion = viaje.duracion_horas ?? viaje.ruta?.duracion_horas

  return (
    <div
      className="card card-hover p-5 cursor-pointer"
      onClick={() => navigate(`/viajes/${viaje.id}`)}
    >
      {/* Ruta y fecha */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 font-syne font-bold text-lg text-sb-text">
            <span>{origen}</span>
            <svg className="w-5 h-5 text-sb-blue-lt flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
            <span>{destino}</span>
          </div>
          <p className="text-sb-muted text-sm mt-0.5">{formatFechaCorta(viaje.fecha_salida)}</p>
        </div>
        <span
          className="text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0"
          style={{ backgroundColor: `${claseColor}20`, color: claseColor, border: `1px solid ${claseColor}40` }}
        >
          {formatClase(viaje.clase)}
        </span>
      </div>

      {/* Horario */}
      <div className="flex items-center gap-4 mb-4">
        <div>
          <p className="font-mono-sb text-2xl font-semibold text-sb-text">{formatHora(viaje.hora_salida)}</p>
          <p className="text-xs text-sb-muted">Salida</p>
        </div>
        <div className="flex-1 flex flex-col items-center">
          <div className="w-full flex items-center gap-1">
            <div className="h-px flex-1 bg-sb-border2" />
            <span className="text-xs text-sb-muted px-1">{duracion ? `${duracion}h` : '—'}</span>
            <div className="h-px flex-1 bg-sb-border2" />
          </div>
        </div>
        <div className="text-right">
          <p className="font-mono-sb text-2xl font-semibold text-sb-text">
            {viaje.hora_llegada_est ? formatHora(viaje.hora_llegada_est) : '—'}
          </p>
          <p className="text-xs text-sb-muted">Llegada est.</p>
        </div>
      </div>

      {/* Info + precio */}
      <div className="flex items-end justify-between pt-3 border-t" style={{ borderColor: 'var(--sb-border)' }}>
        <div className="flex items-center gap-3">
          <span className="text-xs text-sb-muted flex items-center gap-1">
            <span style={{ color: asientosColor }}>●</span>
            {viaje.asientos_disponibles} lugares
          </span>
          {viaje.numero_unidad && (
            <span className="text-xs text-sb-muted font-mono-sb">#{viaje.numero_unidad}</span>
          )}
        </div>

        <div className="text-right">
          {descuento > 0 && usuario ? (
            <>
              <p className="text-sb-muted text-xs line-through">{formatMXN(precio)}</p>
              <p className="text-sb-green font-bold text-lg font-mono-sb">{formatMXN(precioConDescuento)}</p>
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: 'rgba(34,197,94,0.15)', color: '#22C55E' }}
              >
                {descuento}% OFF
              </span>
            </>
          ) : (
            <p className="text-sb-text font-bold text-lg font-mono-sb">{formatMXN(precio)}</p>
          )}
        </div>
      </div>

      <button
        className="btn-primary w-full mt-3 text-sm"
        onClick={e => { e.stopPropagation(); navigate(`/viajes/${viaje.id}`) }}
      >
        Seleccionar
      </button>
    </div>
  )
}
