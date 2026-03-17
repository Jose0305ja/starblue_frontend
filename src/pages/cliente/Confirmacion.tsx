import { useParams, useLocation, Link } from 'react-router-dom'
import { formatMXN } from '../../utils/formatters'
import { NavbarPublico } from '../../components/layout/NavbarPublico'

export default function Confirmacion() {
  const { folio } = useParams()
  const location = useLocation()
  const state = location.state as { reservacion?: { precio_total: number; num_pasajeros: number; descuento_aplicado: number; subio_nivel?: boolean; nivel_nuevo?: string }; message?: string } | null

  const reservacion = state?.reservacion
  const message = state?.message ?? ''
  const subioNivel = reservacion?.subio_nivel
  const nivelNuevo = reservacion?.nivel_nuevo

  return (
    <div className="min-h-screen">
      <NavbarPublico />
      <div className="pt-24 pb-20 px-4 max-w-lg mx-auto">
        {/* Éxito */}
        <div className="card p-8 text-center mb-6">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mx-auto mb-6"
            style={{ backgroundColor: 'rgba(34,197,94,0.15)', border: '2px solid rgba(34,197,94,0.4)' }}
          >
            ✓
          </div>
          <h1 className="font-syne font-extrabold text-2xl text-sb-text mb-2">
            ¡Reservación confirmada!
          </h1>
          <p className="text-sb-muted text-sm mb-6">
            Tu folio de reservación es:
          </p>
          <p className="font-mono-sb font-bold text-4xl text-sb-blue-lt mb-6">{folio}</p>

          {reservacion && (
            <div className="space-y-2 text-sm text-left border-t pt-4" style={{ borderColor: 'var(--sb-border)' }}>
              <div className="flex justify-between">
                <span className="text-sb-muted">Pasajeros</span>
                <span className="text-sb-text">{reservacion.num_pasajeros}</span>
              </div>
              {reservacion.descuento_aplicado > 0 && (
                <div className="flex justify-between">
                  <span className="text-sb-muted">Descuento aplicado</span>
                  <span className="text-sb-green">{reservacion.descuento_aplicado}%</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-base">
                <span className="text-sb-text">Total pagado</span>
                <span className="font-mono-sb text-sb-text">{formatMXN(reservacion.precio_total)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Banner subida de nivel */}
        {subioNivel && nivelNuevo && (
          <div className="card p-5 mb-6 text-center"
            style={{ borderColor: 'rgba(167,139,250,0.4)', backgroundColor: 'rgba(167,139,250,0.08)' }}>
            <p className="text-3xl mb-2">🎉</p>
            <p className="font-syne font-bold text-lg text-sb-text">
              ¡Subiste al nivel <span style={{ color: '#A78BFA' }}>{nivelNuevo}!</span>
            </p>
            <p className="text-sb-muted text-sm mt-1">{message}</p>
          </div>
        )}

        <div className="flex gap-3">
          <Link to="/mis-reservas" className="btn-secondary flex-1 py-3 text-center text-sm">
            Ver mis reservaciones
          </Link>
          <Link to="/buscar" className="btn-primary flex-1 py-3 text-center text-sm">
            Buscar otro viaje
          </Link>
        </div>
      </div>
    </div>
  )
}
