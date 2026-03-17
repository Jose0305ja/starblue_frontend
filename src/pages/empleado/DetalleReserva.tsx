import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../../api'
import type { Reservacion } from '../../types'
import { NavbarEmpleado } from '../../components/layout/NavbarEmpleado'
import { EstadoBadge } from '../../components/ui/EstadoBadge'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { formatFecha, formatHora, formatPrecioReserva } from '../../utils/formatters'

const ESTADOS = ['pendiente', 'confirmada', 'completada', 'cancelada']

export default function EmpleadoDetalleReserva() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [reserva, setReserva] = useState<Reservacion | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get(`/reservaciones/${id}`)
      .then(r => setReserva(r.data.data))
      .catch(() => navigate('/empleado/reservaciones'))
      .finally(() => setLoading(false))
  }, [id])

  const handleEstado = async (estado: string) => {
    if (!reserva) return
    setSaving(true)
    try {
      await api.put(`/reservaciones/${reserva.id}/estado`, { estado })
      setReserva(r => r ? { ...r, estado: estado as Reservacion['estado'] } : r)
      toast.success(`Estado actualizado a: ${estado}`)
    } catch {
      toast.error('Error al actualizar estado')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen lg:pl-60 flex items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  )
  if (!reserva) return null

  const origen = reserva.ciudad_origen ?? '—'
  const destino = reserva.ciudad_destino ?? '—'
  const fecha = reserva.fecha_salida ?? ''
  const hora = reserva.hora_salida ?? ''

  return (
    <div className="min-h-screen lg:pl-60">
      <NavbarEmpleado />
      <main className="p-6 pt-20 lg:pt-6 max-w-2xl">
        <button onClick={() => navigate('/empleado/reservaciones')} className="text-sb-muted hover:text-sb-text text-sm mb-6 flex items-center gap-1">
          ← Reservaciones
        </button>

        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs text-sb-muted mb-1">Folio</p>
            <p className="font-mono-sb font-bold text-2xl text-sb-blue-lt">{reserva.folio}</p>
          </div>
          <EstadoBadge estado={reserva.estado} />
        </div>

        <div className="card p-5 mb-4">
          <p className="font-syne font-bold text-xl text-sb-text mb-3">{origen} → {destino}</p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><p className="text-xs text-sb-muted">Fecha</p><p className="text-sb-text mt-0.5">{fecha ? formatFecha(fecha) : '—'}</p></div>
            <div><p className="text-xs text-sb-muted">Hora</p><p className="font-mono-sb text-sb-text mt-0.5">{hora ? formatHora(hora) : '—'}</p></div>
            <div><p className="text-xs text-sb-muted">Cliente</p><p className="text-sb-text mt-0.5">{reserva.cliente_nombre} {reserva.cliente_apellido}</p></div>
            <div><p className="text-xs text-sb-muted">Pasajeros</p><p className="text-sb-text mt-0.5">{reserva.num_pasajeros}</p></div>
          </div>
        </div>

        {/* Pasajeros */}
        {reserva.pasajeros && reserva.pasajeros.length > 0 && (
          <div className="card p-5 mb-4">
            <h2 className="font-syne font-semibold text-sb-text mb-3">Pasajeros</h2>
            <div className="space-y-2">
              {reserva.pasajeros.map((p, i) => (
                <div key={i} className="flex justify-between text-sm py-2 border-b last:border-0" style={{ borderColor: 'var(--sb-border)' }}>
                  <div>
                    <span className="text-sb-text">{p.nombre} {p.apellido}</span>
                    {p.es_titular && <span className="ml-2 text-xs text-sb-blue-lt">Titular</span>}
                  </div>
                  <span className="font-mono-sb text-xs text-sb-muted">{p.tipo_id.toUpperCase()} · {p.num_identificacion}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cambiar estado */}
        <div className="card p-5">
          <h2 className="font-syne font-semibold text-sb-text mb-3">Cambiar estado</h2>
          <div className="flex flex-wrap gap-2">
            {ESTADOS.map(e => (
              <button
                key={e}
                onClick={() => handleEstado(e)}
                disabled={saving || reserva.estado === e}
                className="px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-all disabled:opacity-40"
                style={reserva.estado === e
                  ? { backgroundColor: 'var(--sb-active-bg)', color: 'var(--sb-blue-lt)', border: '1px solid rgba(91,116,240,0.4)' }
                  : { backgroundColor: 'var(--sb-badge-bg)', color: 'var(--sb-muted)', border: '1px solid var(--sb-border2)' }
                }
              >
                {saving ? <LoadingSpinner size="sm" /> : e}
              </button>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t flex justify-between items-center" style={{ borderColor: 'var(--sb-border)' }}>
            <span className="text-sb-muted text-sm">Total</span>
            <span className="font-mono-sb font-bold text-xl text-sb-text">{formatPrecioReserva(reserva.precio_total, reserva.moneda)}</span>
          </div>
        </div>
      </main>
    </div>
  )
}
