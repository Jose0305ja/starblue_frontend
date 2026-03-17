import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../../api'
import type { Reservacion } from '../../types'
import { NavbarPublico } from '../../components/layout/NavbarPublico'
import { Footer } from '../../components/layout/Footer'
import { EstadoBadge } from '../../components/ui/EstadoBadge'
import { Modal } from '../../components/ui/Modal'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { formatMXN, formatFecha, formatHora, formatClase } from '../../utils/formatters'

export default function DetalleReservaCliente() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [reserva, setReserva] = useState<Reservacion | null>(null)
  const [loading, setLoading] = useState(true)
  const [cancelModal, setCancelModal] = useState(false)
  const [canceling, setCanceling] = useState(false)

  useEffect(() => {
    api.get(`/reservaciones/${id}`)
      .then(r => setReserva(r.data.data))
      .catch(() => navigate('/mis-reservas'))
      .finally(() => setLoading(false))
  }, [id])

  const handleCancelar = async () => {
    if (!reserva) return
    setCanceling(true)
    try {
      await api.delete(`/reservaciones/${reserva.id}`)
      toast.success('Reservación cancelada')
      setReserva(r => r ? { ...r, estado: 'cancelada' } : r)
      setCancelModal(false)
    } catch {
      toast.error('No se pudo cancelar')
    } finally {
      setCanceling(false)
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>
  if (!reserva) return null

  const origen = reserva.ciudad_origen ?? reserva.viaje?.ciudad_origen ?? '—'
  const destino = reserva.ciudad_destino ?? reserva.viaje?.ciudad_destino ?? '—'
  const fecha = reserva.fecha_salida ?? reserva.viaje?.fecha_salida ?? ''
  const hora = reserva.hora_salida ?? reserva.viaje?.hora_salida ?? ''
  const clase = reserva.clase ?? reserva.viaje?.clase ?? ''

  return (
    <div className="min-h-screen">
      <NavbarPublico />
      <div className="pt-24 pb-20 px-4 max-w-2xl mx-auto">
        <button onClick={() => navigate('/mis-reservas')} className="text-sb-muted hover:text-sb-text text-sm mb-6 flex items-center gap-1">
          ← Mis reservaciones
        </button>

        {/* Folio */}
        <div className="card p-6 mb-4">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs text-sb-muted mb-1">Folio de reservación</p>
              <p className="font-mono-sb font-bold text-3xl text-sb-blue-lt">{reserva.folio}</p>
            </div>
            <EstadoBadge estado={reserva.estado} />
          </div>

          <div className="font-syne font-bold text-xl text-sb-text mb-3">
            {origen} → {destino}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Fecha', value: fecha ? formatFecha(fecha) : '—' },
              { label: 'Hora', value: hora ? formatHora(hora) : '—' },
              { label: 'Clase', value: clase ? formatClase(clase) : '—' },
              { label: 'Tipo', value: reserva.tipo_viaje === 'redondo' ? 'Redondo' : 'Sencillo' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-sb-bg3 rounded-lg p-3">
                <p className="text-xs text-sb-muted mb-1">{label}</p>
                <p className="text-sb-text text-sm font-semibold">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Pasajeros */}
        {reserva.pasajeros && reserva.pasajeros.length > 0 && (
          <div className="card p-6 mb-4">
            <h2 className="font-syne font-bold text-sb-text mb-4">
              Pasajeros ({reserva.pasajeros.length})
            </h2>
            <div className="space-y-3">
              {reserva.pasajeros.map((p, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b last:border-0"
                  style={{ borderColor: 'var(--sb-border)' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ backgroundColor: p.es_titular ? 'var(--sb-blue)' : 'var(--sb-input-bg)', color: p.es_titular ? 'white' : 'var(--sb-text)' }}>
                      {p.nombre[0]}
                    </div>
                    <div>
                      <p className="text-sb-text text-sm font-semibold">{p.nombre} {p.apellido}</p>
                      <p className="text-xs text-sb-muted uppercase">{p.tipo_id}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono-sb text-xs text-sb-muted">{p.num_identificacion}</p>
                    {p.es_titular && (
                      <span className="text-xs text-sb-blue-lt">Titular</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Precio */}
        <div className="card p-6 mb-4">
          <h2 className="font-syne font-bold text-sb-text mb-4">Resumen de pago</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-sb-muted">
              <span>Precio por pasajero</span>
              <span className="font-mono-sb">{formatMXN(reserva.precio_unitario)}</span>
            </div>
            <div className="flex justify-between text-sb-muted">
              <span>Pasajeros</span>
              <span>{reserva.num_pasajeros}</span>
            </div>
            {reserva.tipo_viaje === 'redondo' && (
              <div className="flex justify-between text-sb-muted">
                <span>Tipo</span>
                <span>Redondo (×2)</span>
              </div>
            )}
            {reserva.descuento_aplicado > 0 && (
              <div className="flex justify-between text-sb-green">
                <span>Descuento nivel membresía</span>
                <span>-{reserva.descuento_aplicado}%</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t font-bold text-lg" style={{ borderColor: 'var(--sb-border)' }}>
              <span className="text-sb-text">Total</span>
              <span className="font-mono-sb text-sb-text">{formatMXN(reserva.precio_total)}</span>
            </div>
          </div>
        </div>

        {/* Acciones */}
        {reserva.estado === 'confirmada' && (
          <button
            onClick={() => setCancelModal(true)}
            className="btn-secondary w-full py-3 text-red-400 hover:text-red-300"
            style={{ borderColor: 'rgba(239,68,68,0.3)' }}
          >
            Cancelar reservación
          </button>
        )}
      </div>
      <Footer />

      <Modal open={cancelModal} onClose={() => setCancelModal(false)} title="Cancelar reservación">
        <p className="text-sb-muted mb-6">
          ¿Estás seguro de que deseas cancelar la reservación <strong className="text-sb-text font-mono-sb">{reserva.folio}</strong>?
          Esta acción no se puede deshacer.
        </p>
        <div className="flex gap-3">
          <button onClick={() => setCancelModal(false)} className="btn-secondary flex-1 py-2.5">No, mantener</button>
          <button
            onClick={handleCancelar}
            disabled={canceling}
            className="flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2"
            style={{ backgroundColor: 'rgba(239,68,68,0.15)', color: 'var(--sb-red)', border: '1px solid rgba(239,68,68,0.3)' }}
          >
            {canceling ? <LoadingSpinner size="sm" /> : null}
            Sí, cancelar
          </button>
        </div>
      </Modal>
    </div>
  )
}
