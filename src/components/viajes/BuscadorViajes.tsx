import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api'
import type { Ruta } from '../../types'

interface BuscadorState {
  origen: string
  destino: string
  fecha: string
  pasajeros: number
  tipo: 'sencillo' | 'redondo'
}

interface BuscadorViajesProps {
  initialValues?: Partial<BuscadorState>
  onSearch?: (values: BuscadorState) => void
  variant?: 'hero' | 'compact'
}

export const BuscadorViajes = ({ initialValues, onSearch, variant = 'hero' }: BuscadorViajesProps) => {
  const navigate = useNavigate()
  const [rutas, setRutas] = useState<Ruta[]>([])
  const [form, setForm] = useState<BuscadorState>({
    origen: initialValues?.origen ?? '',
    destino: initialValues?.destino ?? '',
    fecha: initialValues?.fecha ?? new Date().toISOString().split('T')[0],
    pasajeros: initialValues?.pasajeros ?? 1,
    tipo: initialValues?.tipo ?? 'sencillo',
  })

  useEffect(() => {
    api.get('/rutas').then(r => setRutas(r.data.data)).catch(() => {})
  }, [])

  const ciudadesOrigen = [...new Set(rutas.map(r => r.ciudad_origen))].sort()
  const ciudadesDestino = [...new Set(rutas.map(r => r.ciudad_destino))].sort()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (onSearch) { onSearch(form); return }
    const params = new URLSearchParams({
      origen: form.origen,
      destino: form.destino,
      fecha: form.fecha,
      pasajeros: String(form.pasajeros),
      tipo: form.tipo,
    })
    navigate(`/buscar?${params}`)
  }

  const inputClass = 'w-full bg-sb-bg3 border text-sb-text rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-0 appearance-none'
  const inputStyle = { borderColor: 'var(--sb-border2)' }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      {/* Tipo viaje */}
      <div className="flex gap-2 mb-4">
        {(['sencillo', 'redondo'] as const).map(t => (
          <button
            key={t}
            type="button"
            onClick={() => setForm(f => ({ ...f, tipo: t }))}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
              form.tipo === t
                ? 'bg-sb-blue text-white'
                : 'text-sb-muted hover:text-sb-text'
            }`}
            style={form.tipo !== t ? { border: '1px solid var(--sb-border2)' } : {}}
          >
            {t === 'sencillo' ? '→ Sencillo' : '⇄ Redondo'}
          </button>
        ))}
      </div>

      <div className={`grid gap-3 ${variant === 'hero' ? 'md:grid-cols-5' : 'md:grid-cols-4'}`}>
        <select
          value={form.origen}
          onChange={e => setForm(f => ({ ...f, origen: e.target.value }))}
          className={inputClass}
          style={inputStyle}
        >
          <option value="">Origen</option>
          {ciudadesOrigen.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <select
          value={form.destino}
          onChange={e => setForm(f => ({ ...f, destino: e.target.value }))}
          className={inputClass}
          style={inputStyle}
        >
          <option value="">Destino</option>
          {ciudadesDestino.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <input
          type="date"
          value={form.fecha}
          min={new Date().toISOString().split('T')[0]}
          onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))}
          className={inputClass}
          style={inputStyle}
        />

        <select
          value={form.pasajeros}
          onChange={e => setForm(f => ({ ...f, pasajeros: Number(e.target.value) }))}
          className={inputClass}
          style={inputStyle}
        >
          {[1, 2, 3, 4, 5, 6].map(n => (
            <option key={n} value={n}>{n} pasajero{n > 1 ? 's' : ''}</option>
          ))}
        </select>

        <button type="submit" className="btn-primary py-2.5 text-sm font-bold">
          🔍 Buscar
        </button>
      </div>
    </form>
  )
}
