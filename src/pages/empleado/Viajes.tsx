import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import api from '../../api'
import type { Viaje, Ruta } from '../../types'
import { NavbarEmpleado } from '../../components/layout/NavbarEmpleado'
import { EstadoBadge } from '../../components/ui/EstadoBadge'
import { Modal } from '../../components/ui/Modal'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { formatMXN, formatFechaCorta, formatHora, formatClase } from '../../utils/formatters'

export default function EmpleadoViajes() {
  const [viajes, setViajes] = useState<Viaje[]>([])
  const [rutas, setRutas] = useState<Ruta[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    ruta_id: '', fecha_salida: '', hora_salida: '', hora_llegada_est: '',
    precio_base: '', clase: 'estandar', numero_unidad: '', asientos_total: '42',
  })

  const fetchViajes = useCallback(async () => {
    setLoading(true)
    api.get('/viajes').then(r => setViajes(r.data.data)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetchViajes() }, [fetchViajes])
  useEffect(() => { api.get('/rutas').then(r => setRutas(r.data.data)).catch(() => {}) }, [])

  const handleCrear = async () => {
    if (!form.ruta_id || !form.fecha_salida || !form.hora_salida || !form.precio_base) {
      toast.error('Completa los campos requeridos'); return
    }
    setSubmitting(true)
    try {
      await api.post('/viajes', {
        ruta_id: parseInt(form.ruta_id),
        fecha_salida: form.fecha_salida,
        hora_salida: form.hora_salida,
        hora_llegada_est: form.hora_llegada_est || undefined,
        precio_base: parseFloat(form.precio_base),
        clase: form.clase,
        numero_unidad: form.numero_unidad || undefined,
        asientos_total: parseInt(form.asientos_total),
      })
      toast.success('Viaje creado exitosamente')
      setModalOpen(false)
      fetchViajes()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } }).response?.data?.error ?? 'Error al crear viaje'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass = "w-full px-3 py-2 text-sm rounded-lg"
  const inputStyle = { border: '1px solid var(--sb-border2)' }

  return (
    <div className="min-h-screen lg:pl-60">
      <NavbarEmpleado />
      <main className="p-6 pt-20 lg:pt-6 max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-syne font-bold text-2xl text-sb-text">Viajes</h1>
          <button onClick={() => setModalOpen(true)} className="btn-primary px-4 py-2.5 text-sm">
            + Crear viaje
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--sb-border)' }}>
                  {['Ruta', 'Fecha', 'Hora', 'Clase', 'Asientos', 'Precio', 'Estado', 'Unidad'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-sb-muted uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {viajes.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-12 text-sb-muted">Sin viajes</td></tr>
                ) : viajes.map(v => (
                  <tr key={v.id} className="hover:bg-[var(--sb-hover-bg)] transition-colors" style={{ borderBottom: '1px solid var(--sb-border)' }}>
                    <td className="px-4 py-3 text-sb-text font-semibold">
                      {v.ciudad_origen ?? '—'} → {v.ciudad_destino ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-sb-muted">{formatFechaCorta(v.fecha_salida)}</td>
                    <td className="px-4 py-3 font-mono-sb text-sb-text">{formatHora(v.hora_salida)}</td>
                    <td className="px-4 py-3 text-sb-muted">{formatClase(v.clase)}</td>
                    <td className="px-4 py-3">
                      <span style={{ color: v.asientos_disponibles < 5 ? '#EF4444' : v.asientos_disponibles < 10 ? '#F59E0B' : '#22C55E' }}>
                        {v.asientos_disponibles}/{v.asientos_total}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono-sb text-sb-text">{formatMXN(v.precio_base)}</td>
                    <td className="px-4 py-3"><EstadoBadge estado={v.estado} size="sm" /></td>
                    <td className="px-4 py-3 font-mono-sb text-xs text-sb-muted">{v.numero_unidad ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Crear nuevo viaje">
        <div className="space-y-4">
          <div>
            <label className="text-xs text-sb-muted block mb-1">Ruta *</label>
            <select value={form.ruta_id} onChange={e => setForm(f => ({ ...f, ruta_id: e.target.value }))} className={inputClass} style={inputStyle}>
              <option value="">Seleccionar ruta</option>
              {rutas.map(r => <option key={r.id} value={r.id}>{r.ciudad_origen} → {r.ciudad_destino}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-sb-muted block mb-1">Fecha salida *</label>
              <input type="date" value={form.fecha_salida} onChange={e => setForm(f => ({ ...f, fecha_salida: e.target.value }))} min={new Date().toISOString().split('T')[0]} className={inputClass} style={inputStyle} />
            </div>
            <div>
              <label className="text-xs text-sb-muted block mb-1">Hora salida *</label>
              <input type="time" value={form.hora_salida} onChange={e => setForm(f => ({ ...f, hora_salida: e.target.value }))} className={inputClass} style={inputStyle} />
            </div>
            <div>
              <label className="text-xs text-sb-muted block mb-1">Hora llegada est.</label>
              <input type="time" value={form.hora_llegada_est} onChange={e => setForm(f => ({ ...f, hora_llegada_est: e.target.value }))} className={inputClass} style={inputStyle} />
            </div>
            <div>
              <label className="text-xs text-sb-muted block mb-1">Clase</label>
              <select value={form.clase} onChange={e => setForm(f => ({ ...f, clase: e.target.value }))} className={inputClass} style={inputStyle}>
                <option value="estandar">Estándar</option>
                <option value="ejecutivo">Ejecutivo</option>
                <option value="vip">VIP</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-sb-muted block mb-1">Precio base (MXN) *</label>
              <input type="number" value={form.precio_base} onChange={e => setForm(f => ({ ...f, precio_base: e.target.value }))} placeholder="1500.00" className={inputClass} style={inputStyle} />
            </div>
            <div>
              <label className="text-xs text-sb-muted block mb-1">Asientos totales</label>
              <input type="number" value={form.asientos_total} onChange={e => setForm(f => ({ ...f, asientos_total: e.target.value }))} className={inputClass} style={inputStyle} />
            </div>
          </div>
          <div>
            <label className="text-xs text-sb-muted block mb-1">Número de unidad</label>
            <input type="text" value={form.numero_unidad} onChange={e => setForm(f => ({ ...f, numero_unidad: e.target.value }))} placeholder="SB-011" className={inputClass} style={inputStyle} />
          </div>
          <button onClick={handleCrear} disabled={submitting} className="btn-primary w-full py-2.5 flex items-center justify-center gap-2">
            {submitting ? <LoadingSpinner size="sm" /> : null}
            {submitting ? 'Creando...' : 'Crear viaje'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
