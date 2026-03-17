import { useNavigate } from 'react-router-dom'
import { EstadoBadge } from '../ui/EstadoBadge'
import { formatMXN, formatFechaCorta, formatHora } from '../../utils/formatters'
import type { Reservacion } from '../../types'

interface ReservaCardProps {
  reserva: Reservacion
  basePath?: string
}

export const ReservaCard = ({ reserva, basePath = '/mis-reservas' }: ReservaCardProps) => {
  const navigate = useNavigate()

  const origen = reserva.ciudad_origen ?? reserva.viaje?.ciudad_origen ?? '—'
  const destino = reserva.ciudad_destino ?? reserva.viaje?.ciudad_destino ?? '—'
  const fecha = reserva.fecha_salida ?? reserva.viaje?.fecha_salida ?? ''
  const hora = reserva.hora_salida ?? reserva.viaje?.hora_salida ?? ''

  return (
    <div
      className="card card-hover p-4 cursor-pointer"
      onClick={() => navigate(`${basePath}/${reserva.id}`)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Folio */}
          <span className="font-mono-sb text-sm text-sb-blue-lt font-semibold">{reserva.folio}</span>

          {/* Ruta */}
          <div className="flex items-center gap-2 mt-1 font-syne font-bold text-sb-text">
            <span className="truncate">{origen}</span>
            <span className="text-sb-muted flex-shrink-0">→</span>
            <span className="truncate">{destino}</span>
          </div>

          {/* Fecha y hora */}
          {fecha && (
            <p className="text-sb-muted text-xs mt-1">
              {formatFechaCorta(fecha)}{hora ? ` · ${formatHora(hora)}` : ''}
            </p>
          )}

          {/* Pasajeros */}
          <p className="text-sb-muted text-xs mt-0.5">
            {reserva.num_pasajeros} pasajero{reserva.num_pasajeros > 1 ? 's' : ''} · {reserva.tipo_viaje}
          </p>
        </div>

        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <EstadoBadge estado={reserva.estado} />
          <p className="font-mono-sb font-bold text-sb-text text-base">{formatMXN(reserva.precio_total)}</p>
        </div>
      </div>
    </div>
  )
}
