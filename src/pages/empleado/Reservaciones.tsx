import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../../api'
import type { Reservacion, Viaje, Ruta } from '../../types'
import { NavbarEmpleado } from '../../components/layout/NavbarEmpleado'
import { EstadoBadge } from '../../components/ui/EstadoBadge'
import { Modal } from '../../components/ui/Modal'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { formatFechaCorta, formatHora, formatPrecioReserva } from '../../utils/formatters'

type TabEstado = 'todas' | 'pendiente' | 'confirmada' | 'completada' | 'cancelada'

export default function EmpleadoReservaciones() {
  const navigate = useNavigate()
  const [reservas, setReservas] = useState<Reservacion[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<TabEstado>('todas')
  const [buscar, setBuscar] = useState('')
  const [modalOpen, setModalOpen] = useState(false)

  // Nueva reserva state
  const [rutas, setRutas] = useState<Ruta[]>([])
  const [viajes, setViajes] = useState<Viaje[]>([])
  const [nrForm, setNrForm] = useState({ email_cliente: '', viaje_id: '', num_pasajeros: 1, tipo_viaje: 'sencillo', origen: '', destino: '', fecha: '' })
  const [nrPasajeros, setNrPasajeros] = useState([{ nombre: '', apellido: '', tipo_id: 'ine', num_identificacion: '', es_titular: true }])
  const [clienteInfo, setClienteInfo] = useState<{ id: number; nombre: string } | null>(null)
  const [buscandoCliente, setBuscandoCliente] = useState(false)
  const [submittingNR, setSubmittingNR] = useState(false)

  const fetchReservas = useCallback(async () => {
    setLoading(true)
    try {
      const params = tab !== 'todas' ? `?estado=${tab}` : ''
      const res = await api.get(`/reservaciones${params}`)
      setReservas(res.data.data)
    } catch {
      setReservas([])
    } finally {
      setLoading(false)
    }
  }, [tab])

  useEffect(() => { fetchReservas() }, [fetchReservas])
  useEffect(() => { api.get('/rutas').then(r => setRutas(r.data.data)).catch(() => {}) }, [])

  useEffect(() => {
    if (!nrForm.origen || !nrForm.destino || !nrForm.fecha) return
    api.get(`/viajes?origen=${nrForm.origen}&destino=${nrForm.destino}&fecha=${nrForm.fecha}`)
      .then(r => setViajes(r.data.data))
      .catch(() => setViajes([]))
  }, [nrForm.origen, nrForm.destino, nrForm.fecha])

  const buscarCliente = async () => {
    if (!nrForm.email_cliente) return
    setBuscandoCliente(true)
    try {
      const res = await api.get(`/usuarios/perfil`)
      // Para este demo buscamos el usuario autenticado; en producción habría un endpoint de búsqueda
      setClienteInfo({ id: res.data.data.id, nombre: `${res.data.data.nombre} ${res.data.data.apellido}` })
      toast.success('Cliente encontrado')
    } catch {
      toast.error('Cliente no encontrado')
    } finally {
      setBuscandoCliente(false)
    }
  }

  const handleNuevaReserva = async () => {
    if (!clienteInfo || !nrForm.viaje_id) { toast.error('Completa todos los campos'); return }
    setSubmittingNR(true)
    try {
      const res = await api.post('/reservaciones', {
        viaje_id: parseInt(nrForm.viaje_id),
        num_pasajeros: nrForm.num_pasajeros,
        tipo_viaje: nrForm.tipo_viaje,
        pasajeros: nrPasajeros,
      })
      toast.success(`Reservación ${res.data.data.folio} creada exitosamente`)
      setModalOpen(false)
      fetchReservas()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } }).response?.data?.error ?? 'Error al crear reservación'
      toast.error(msg)
    } finally {
      setSubmittingNR(false)
    }
  }

  const filtradas = reservas.filter(r => {
    if (!buscar) return true
    const s = buscar.toLowerCase()
    return r.folio?.toLowerCase().includes(s) ||
      r.cliente_nombre?.toLowerCase().includes(s) ||
      r.cliente_apellido?.toLowerCase().includes(s)
  })

  const ciudadesOrigen = [...new Set(rutas.map(r => r.ciudad_origen))]
  const ciudadesDestino = [...new Set(rutas.map(r => r.ciudad_destino))]
  const inputClass = "w-full px-3 py-2 text-sm rounded-lg"
  const inputStyle = { border: '1px solid var(--sb-border2)' }

  return (
    <div className="min-h-screen lg:pl-60">
      <NavbarEmpleado />
      <main className="p-6 pt-20 lg:pt-6 max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-syne font-bold text-2xl text-sb-text">Reservaciones</h1>
          <button onClick={() => setModalOpen(true)} className="btn-primary px-4 py-2.5 text-sm">
            + Nueva reserva
          </button>
        </div>

        {/* Tabs + búsqueda */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex gap-2 overflow-x-auto">
            {(['todas', 'pendiente', 'confirmada', 'completada', 'cancelada'] as TabEstado[]).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-all ${tab === t ? 'bg-sb-blue text-white' : 'text-sb-muted'}`}
                style={tab !== t ? { border: '1px solid var(--sb-border2)' } : {}}
              >
                {t === 'todas' ? 'Todas' : t}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Buscar por folio o cliente..."
            value={buscar}
            onChange={e => setBuscar(e.target.value)}
            className="px-3 py-1.5 text-sm rounded-lg sm:ml-auto"
            style={inputStyle}
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--sb-border)' }}>
                  {['Folio', 'Cliente', 'Ruta', 'Fecha', 'Pax', 'Estado', 'Total', ''].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-sb-muted uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtradas.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-12 text-sb-muted">Sin reservaciones</td></tr>
                ) : filtradas.map(r => (
                  <tr
                    key={r.id}
                    className="hover:bg-[var(--sb-hover-bg)] transition-colors cursor-pointer"
                    style={{ borderBottom: '1px solid var(--sb-border)' }}
                    onClick={() => navigate(`/empleado/reservaciones/${r.id}`)}
                  >
                    <td className="px-4 py-3 font-mono-sb text-sb-blue-lt font-semibold">{r.folio}</td>
                    <td className="px-4 py-3 text-sb-text">{r.cliente_nombre} {r.cliente_apellido}</td>
                    <td className="px-4 py-3 text-sb-muted">
                      {r.ciudad_origen ?? '—'} → {r.ciudad_destino ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-sb-muted">
                      {r.fecha_salida ? formatFechaCorta(r.fecha_salida) : '—'}
                      {r.hora_salida ? ` ${formatHora(r.hora_salida)}` : ''}
                    </td>
                    <td className="px-4 py-3 text-sb-text">{r.num_pasajeros}</td>
                    <td className="px-4 py-3"><EstadoBadge estado={r.estado} size="sm" /></td>
                    <td className="px-4 py-3 font-mono-sb text-sb-text">{formatPrecioReserva(r.precio_total, r.moneda)}</td>
                    <td className="px-4 py-3">
                      <button className="text-sb-blue-lt text-xs hover:underline">Ver →</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Modal Nueva Reserva */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nueva reservación" maxWidth="max-w-xl">
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          {/* Buscar cliente */}
          <div>
            <label className="text-xs text-sb-muted block mb-1">Email del cliente</label>
            <div className="flex gap-2">
              <input type="email" value={nrForm.email_cliente}
                onChange={e => setNrForm(f => ({ ...f, email_cliente: e.target.value }))}
                placeholder="cliente@email.com" className={inputClass} style={inputStyle} />
              <button onClick={buscarCliente} disabled={buscandoCliente} className="btn-primary px-4 flex-shrink-0 text-sm">
                {buscandoCliente ? <LoadingSpinner size="sm" /> : 'Buscar'}
              </button>
            </div>
            {clienteInfo && <p className="text-xs text-sb-green mt-1">✓ {clienteInfo.nombre}</p>}
          </div>

          {/* Selección viaje */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-sb-muted block mb-1">Origen</label>
              <select value={nrForm.origen} onChange={e => setNrForm(f => ({ ...f, origen: e.target.value }))} className={inputClass} style={inputStyle}>
                <option value="">Seleccionar</option>
                {ciudadesOrigen.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-sb-muted block mb-1">Destino</label>
              <select value={nrForm.destino} onChange={e => setNrForm(f => ({ ...f, destino: e.target.value }))} className={inputClass} style={inputStyle}>
                <option value="">Seleccionar</option>
                {ciudadesDestino.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-sb-muted block mb-1">Fecha</label>
            <input type="date" value={nrForm.fecha} onChange={e => setNrForm(f => ({ ...f, fecha: e.target.value }))}
              min={new Date().toISOString().split('T')[0]} className={inputClass} style={inputStyle} />
          </div>

          {viajes.length > 0 && (
            <div>
              <label className="text-xs text-sb-muted block mb-1">Viaje disponible</label>
              <select value={nrForm.viaje_id} onChange={e => setNrForm(f => ({ ...f, viaje_id: e.target.value }))} className={inputClass} style={inputStyle}>
                <option value="">Seleccionar viaje</option>
                {viajes.map(v => (
                  <option key={v.id} value={v.id}>
                    {formatHora(v.hora_salida)} · {v.clase} · ${v.precio_base} · {v.asientos_disponibles} lugares
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-sb-muted block mb-1">Pasajeros</label>
              <select value={nrForm.num_pasajeros} onChange={e => {
                const n = Number(e.target.value)
                setNrForm(f => ({ ...f, num_pasajeros: n }))
                setNrPasajeros(prev => {
                  const arr = [...prev]
                  while (arr.length < n) arr.push({ nombre: '', apellido: '', tipo_id: 'ine', num_identificacion: '', es_titular: false })
                  return arr.slice(0, n)
                })
              }} className={inputClass} style={inputStyle}>
                {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-sb-muted block mb-1">Tipo</label>
              <select value={nrForm.tipo_viaje} onChange={e => setNrForm(f => ({ ...f, tipo_viaje: e.target.value }))} className={inputClass} style={inputStyle}>
                <option value="sencillo">Sencillo</option>
                <option value="redondo">Redondo</option>
              </select>
            </div>
          </div>

          {/* Pasajeros */}
          {nrPasajeros.map((p, idx) => (
            <div key={idx} className="p-3 rounded-lg space-y-2" style={{ backgroundColor: 'var(--sb-input-bg)' }}>
              <p className="text-xs font-semibold text-sb-muted">Pasajero {idx + 1}</p>
              <div className="grid grid-cols-2 gap-2">
                <input placeholder="Nombre" value={p.nombre} onChange={e => setNrPasajeros(prev => prev.map((x, i) => i === idx ? { ...x, nombre: e.target.value } : x))} className={inputClass} style={inputStyle} />
                <input placeholder="Apellido" value={p.apellido} onChange={e => setNrPasajeros(prev => prev.map((x, i) => i === idx ? { ...x, apellido: e.target.value } : x))} className={inputClass} style={inputStyle} />
                <input placeholder="Núm. ID" value={p.num_identificacion} onChange={e => setNrPasajeros(prev => prev.map((x, i) => i === idx ? { ...x, num_identificacion: e.target.value } : x))} className={inputClass} style={inputStyle} />
                <select value={p.tipo_id} onChange={e => setNrPasajeros(prev => prev.map((x, i) => i === idx ? { ...x, tipo_id: e.target.value as 'ine' | 'pasaporte' | 'licencia' } : x))} className={inputClass} style={inputStyle}>
                  <option value="ine">INE</option>
                  <option value="pasaporte">Pasaporte</option>
                  <option value="licencia">Licencia</option>
                </select>
              </div>
            </div>
          ))}

          <button onClick={handleNuevaReserva} disabled={submittingNR} className="btn-primary w-full py-2.5 flex items-center justify-center gap-2">
            {submittingNR ? <LoadingSpinner size="sm" /> : null}
            {submittingNR ? 'Creando...' : 'Confirmar reservación'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
