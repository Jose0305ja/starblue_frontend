import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../../api'
import type { Viaje, Pasajero } from '../../types'
import { useAuth } from '../../context/AuthContext'
import { NavbarPublico } from '../../components/layout/NavbarPublico'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { formatMXN, formatFecha, formatHora, formatClase } from '../../utils/formatters'
import { getDescuento } from '../../utils/nivelMembresia'

type TipoViaje = 'sencillo' | 'redondo'

export default function Reservar() {
  const { viajeId } = useParams()
  const navigate = useNavigate()
  const { usuario } = useAuth()

  const [paso, setPaso] = useState(1)
  const [viaje, setViaje] = useState<Viaje | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [numPasajeros, setNumPasajeros] = useState(1)
  const [tipoViaje, setTipoViaje] = useState<TipoViaje>('sencillo')
  const [pasajeros, setPasajeros] = useState<Pasajero[]>([{
    nombre: usuario?.nombre ?? '',
    apellido: usuario?.apellido ?? '',
    tipo_id: 'ine',
    num_identificacion: '',
    es_titular: true,
  }])

  useEffect(() => {
    api.get(`/viajes/${viajeId}`)
      .then(r => setViaje(r.data.data))
      .catch(() => navigate('/buscar'))
      .finally(() => setLoading(false))
  }, [viajeId])

  useEffect(() => {
    setPasajeros(prev => {
      const arr = [...prev]
      while (arr.length < numPasajeros) {
        arr.push({ nombre: '', apellido: '', tipo_id: 'ine', num_identificacion: '', es_titular: false })
      }
      return arr.slice(0, numPasajeros)
    })
  }, [numPasajeros])

  if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>
  if (!viaje) return null

  const descuento = usuario ? getDescuento(usuario.viajes_realizados) : 0
  const precio = Number(viaje.precio_base)
  const precioUnitario = precio * (1 - descuento / 100)
  const factor = tipoViaje === 'redondo' ? 2 : 1
  const total = precioUnitario * numPasajeros * factor
  const origen = viaje.ciudad_origen ?? '—'
  const destino = viaje.ciudad_destino ?? '—'

  const updatePasajero = (idx: number, field: keyof Pasajero, value: string | boolean) => {
    setPasajeros(prev => prev.map((p, i) => i === idx ? { ...p, [field]: value } : p))
  }

  const handleConfirmar = async () => {
    const incompletos = pasajeros.some(p => !p.nombre.trim() || !p.apellido.trim() || !p.num_identificacion.trim())
    if (incompletos) { toast.error('Completa los datos de todos los pasajeros'); return }

    setSubmitting(true)
    try {
      const res = await api.post('/reservaciones', {
        viaje_id: viaje.id,
        num_pasajeros: numPasajeros,
        tipo_viaje: tipoViaje,
        pasajeros,
      })
      const folio: string = res.data.data.folio
      navigate(`/confirmacion/${folio}`, { state: { reservacion: res.data.data, message: res.data.message } })
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } }).response?.data?.error ?? 'Error al crear la reservación'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen">
      <NavbarPublico />
      <div className="pt-24 pb-20 px-4 max-w-2xl mx-auto">
        {/* Steps */}
        <div className="flex items-center gap-3 mb-8">
          {[1, 2].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold font-syne"
                style={{
                  backgroundColor: paso >= s ? 'var(--sb-blue)' : 'transparent',
                  color: paso >= s ? 'white' : 'var(--sb-muted)',
                  border: `2px solid ${paso >= s ? 'var(--sb-blue)' : 'var(--sb-border2)'}`,
                }}
              >
                {s}
              </div>
              <span className={`text-sm font-semibold ${paso >= s ? 'text-sb-text' : 'text-sb-muted'}`}>
                {s === 1 ? 'Tu viaje' : 'Pasajeros'}
              </span>
              {s < 2 && <div className="w-8 h-px" style={{ backgroundColor: 'var(--sb-border2)' }} />}
            </div>
          ))}
        </div>

        {/* Paso 1 */}
        {paso === 1 && (
          <div className="space-y-4">
            <div className="card p-6">
              <div className="font-syne font-bold text-xl text-sb-text mb-4">{origen} → {destino}</div>
              <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                <div className="bg-sb-bg3 rounded-lg p-3">
                  <p className="text-xs text-sb-muted mb-1">Fecha</p>
                  <p className="text-sb-text font-semibold">{formatFecha(viaje.fecha_salida)}</p>
                </div>
                <div className="bg-sb-bg3 rounded-lg p-3">
                  <p className="text-xs text-sb-muted mb-1">Salida</p>
                  <p className="font-mono-sb font-semibold text-sb-text">{formatHora(viaje.hora_salida)}</p>
                </div>
                <div className="bg-sb-bg3 rounded-lg p-3">
                  <p className="text-xs text-sb-muted mb-1">Clase</p>
                  <p className="text-sb-text font-semibold">{formatClase(viaje.clase)}</p>
                </div>
                <div className="bg-sb-bg3 rounded-lg p-3">
                  <p className="text-xs text-sb-muted mb-1">Disponibles</p>
                  <p className="text-sb-text font-semibold">{viaje.asientos_disponibles} asientos</p>
                </div>
              </div>

              {/* Tipo viaje */}
              <div className="mb-4">
                <p className="text-sm text-sb-muted mb-2 font-semibold">Tipo de viaje</p>
                <div className="flex gap-2">
                  {(['sencillo', 'redondo'] as const).map(t => (
                    <button
                      key={t}
                      onClick={() => setTipoViaje(t)}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${tipoViaje === t ? 'bg-sb-blue text-white' : 'text-sb-muted'}`}
                      style={tipoViaje !== t ? { border: '1px solid var(--sb-border2)' } : {}}
                    >
                      {t === 'sencillo' ? '→ Sencillo' : '⇄ Redondo'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pasajeros */}
              <div>
                <p className="text-sm text-sb-muted mb-2 font-semibold">Número de pasajeros</p>
                <select
                  value={numPasajeros}
                  onChange={e => setNumPasajeros(Number(e.target.value))}
                  className="w-full px-3 py-2.5 text-sm rounded-lg"
                  style={{ border: '1px solid var(--sb-border2)' }}
                >
                  {Array.from({ length: Math.min(10, viaje.asientos_disponibles) }, (_, i) => i + 1).map(n => (
                    <option key={n} value={n}>{n} pasajero{n > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Precio */}
            <div className="card p-5">
              <div className="flex justify-between text-sm text-sb-muted mb-2">
                <span>Precio por pasajero</span>
                {descuento > 0 ? (
                  <span className="text-sb-green">{formatMXN(precioUnitario)} <span className="text-xs">(-{descuento}%)</span></span>
                ) : (
                  <span>{formatMXN(precio)}</span>
                )}
              </div>
              <div className="flex justify-between text-sm text-sb-muted mb-2">
                <span>{numPasajeros} pasajero{numPasajeros > 1 ? 's' : ''} × {tipoViaje === 'redondo' ? '2 tramos' : '1 tramo'}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t" style={{ borderColor: 'var(--sb-border)' }}>
                <span className="text-sb-text">Total</span>
                <span className="font-mono-sb text-sb-text">{formatMXN(total)}</span>
              </div>
            </div>

            <button onClick={() => setPaso(2)} className="btn-primary w-full py-3 text-base">
              Continuar → Datos de pasajeros
            </button>
          </div>
        )}

        {/* Paso 2 */}
        {paso === 2 && (
          <div className="space-y-4">
            <button onClick={() => setPaso(1)} className="text-sb-muted hover:text-sb-text text-sm flex items-center gap-1 mb-2">
              ← Volver
            </button>

            {pasajeros.map((p, idx) => (
              <div key={idx} className="card p-5">
                <h3 className="font-syne font-bold text-sb-text mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs text-white"
                    style={{ backgroundColor: 'var(--sb-blue)' }}>{idx + 1}</span>
                  Pasajero {idx + 1} {idx === 0 && <span className="text-xs text-sb-blue-lt">(Titular)</span>}
                </h3>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  {['nombre', 'apellido'].map(field => (
                    <div key={field}>
                      <label className="text-xs text-sb-muted block mb-1 capitalize">{field}</label>
                      <input
                        type="text"
                        value={p[field as 'nombre' | 'apellido']}
                        onChange={e => updatePasajero(idx, field as 'nombre', e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-lg"
                        style={{ border: '1px solid var(--sb-border2)' }}
                        placeholder={field === 'nombre' ? 'José' : 'García'}
                      />
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-sb-muted block mb-1">Tipo de ID</label>
                    <select
                      value={p.tipo_id}
                      onChange={e => updatePasajero(idx, 'tipo_id', e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg"
                      style={{ border: '1px solid var(--sb-border2)' }}
                    >
                      <option value="ine">INE</option>
                      <option value="pasaporte">Pasaporte</option>
                      <option value="licencia">Licencia</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-sb-muted block mb-1">Número de ID</label>
                    <input
                      type="text"
                      value={p.num_identificacion}
                      onChange={e => updatePasajero(idx, 'num_identificacion', e.target.value)}
                      placeholder="INE-001-2024"
                      className="w-full px-3 py-2 text-sm rounded-lg"
                      style={{ border: '1px solid var(--sb-border2)' }}
                    />
                  </div>
                </div>
              </div>
            ))}

            <div className="card p-4 flex justify-between items-center">
              <span className="text-sb-muted text-sm">Total a pagar</span>
              <span className="font-mono-sb font-bold text-xl text-sb-text">{formatMXN(total)}</span>
            </div>

            <button
              onClick={handleConfirmar}
              disabled={submitting}
              className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2"
            >
              {submitting ? <LoadingSpinner size="sm" /> : null}
              {submitting ? 'Confirmando...' : 'Confirmar reservación'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
