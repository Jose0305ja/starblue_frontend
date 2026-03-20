import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import api from '../../api'
import type { Usuario } from '../../types'
import type { EmpleadoRanking } from '../../types'
import { NavbarEmpleado } from '../../components/layout/NavbarEmpleado'
import { Modal } from '../../components/ui/Modal'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { useCurrency } from '../../context/CurrencyContext'

export default function AdminEmpleados() {
  const { formatPrice } = useCurrency()
  const [empleados, setEmpleados] = useState<Usuario[]>([])
  const [ranking, setRanking] = useState<EmpleadoRanking[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ nombre: '', apellido: '', email: '', password: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const fetchData = useCallback(() => {
    Promise.all([
      api.get('/empleados'),
      api.get('/reportes/ranking-empleados'),
    ]).then(([e, r]) => {
      setEmpleados(e.data.data)
      setRanking(r.data.data)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const getRankingData = (id: number) => ranking.find(r => r.id === id)

  const handleCrear = async () => {
    const e: Record<string, string> = {}
    if (!form.nombre) e.nombre = 'Requerido'
    if (!form.apellido) e.apellido = 'Requerido'
    if (!form.email.includes('@')) e.email = 'Email inválido'
    if (form.password.length < 6) e.password = 'Mínimo 6 caracteres'
    if (Object.keys(e).length > 0) { setErrors(e); return }
    setErrors({})
    setSubmitting(true)
    try {
      await api.post('/empleados', form)
      toast.success('Empleado creado exitosamente')
      setModalOpen(false)
      setForm({ nombre: '', apellido: '', email: '', password: '' })
      fetchData()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } }).response?.data?.error ?? 'Error al crear empleado'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const top3 = ranking.slice(0, 3)
  const inputClass = "w-full px-3 py-2.5 text-sm rounded-lg"
  const inputStyle = { border: '1px solid var(--sb-border2)' }

  return (
    <div className="min-h-screen lg:pl-60">
      <NavbarEmpleado />
      <main className="p-6 pt-20 lg:pt-6 max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-syne font-bold text-2xl text-sb-text">Equipo de empleados</h1>
          <button onClick={() => setModalOpen(true)} className="btn-primary px-4 py-2.5 text-sm">+ Nuevo empleado</button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
        ) : (
          <>
            {/* Podio top 3 */}
            {top3.length > 0 && (
              <div className="flex items-end justify-center gap-4 mb-8">
                {[top3[1], top3[0], top3[2]].filter(Boolean).map((e, idx) => {
                  const height = idx === 1 ? 'h-32' : 'h-24'
                  const medal = idx === 1 ? '🥇' : idx === 0 ? '🥈' : '🥉'
                  const color = idx === 1 ? '#EAB308' : idx === 0 ? '#94A3B8' : '#C97C2B'
                  return (
                    <div key={e.id} className="flex flex-col items-center gap-2">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                        style={{ backgroundColor: `${color}20`, color, border: `2px solid ${color}40` }}>
                        {e.nombre[0]}{e.apellido[0]}
                      </div>
                      <p className="text-xs font-semibold text-sb-text">{e.nombre}</p>
                      <p className="text-xs text-sb-muted">{e.total_reservas} reservas</p>
                      <div className={`${height} w-20 rounded-t-lg flex items-end justify-center pb-2 text-xl`}
                        style={{ backgroundColor: `${color}15`, border: `1px solid ${color}30` }}>
                        {medal}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Tabla */}
            <div className="card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--sb-border)' }}>
                    {['Empleado', 'Email', 'Reservas mes', 'Ingresos', 'Ticket prom.'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-sb-muted uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {empleados.map(emp => {
                    const rd = getRankingData(emp.id)
                    return (
                      <tr key={emp.id} className="hover:bg-[var(--sb-hover-bg)] transition-colors" style={{ borderBottom: '1px solid var(--sb-border)' }}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                              style={{ backgroundColor: '#3D56D4', color: 'white' }}>
                              {emp.nombre[0]}{emp.apellido[0]}
                            </div>
                            <div>
                              <p className="text-sb-text font-semibold">{emp.nombre} {emp.apellido}</p>
                              <p className="text-xs text-sb-muted capitalize">{emp.rol}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sb-muted">{emp.email}</td>
                        <td className="px-4 py-3 font-mono-sb text-sb-text">{rd?.total_reservas ?? '0'}</td>
                        <td className="px-4 py-3 font-mono-sb text-sb-green">{formatPrice(Number(rd?.ingresos_total ?? 0))}</td>
                        <td className="px-4 py-3 font-mono-sb text-sb-muted">{formatPrice(Number(rd?.ticket_promedio ?? 0))}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nuevo empleado">
        <div className="space-y-4">
          {[
            { key: 'nombre', label: 'Nombre', type: 'text', placeholder: 'Ana' },
            { key: 'apellido', label: 'Apellido', type: 'text', placeholder: 'García' },
            { key: 'email', label: 'Email corporativo', type: 'email', placeholder: 'ana@starblue.mx' },
            { key: 'password', label: 'Contraseña temporal', type: 'password', placeholder: '••••••••' },
          ].map(({ key, label, type, placeholder }) => (
            <div key={key}>
              <label className="text-xs text-sb-muted block mb-1">{label}</label>
              <input type={type} value={form[key as keyof typeof form]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                placeholder={placeholder} className={inputClass} style={{ ...inputStyle, borderColor: errors[key] ? 'var(--sb-red)' : 'var(--sb-border2)' }} />
              {errors[key] && <p className="text-red-400 text-xs mt-1">{errors[key]}</p>}
            </div>
          ))}
          <button onClick={handleCrear} disabled={submitting} className="btn-primary w-full py-2.5 flex items-center justify-center gap-2">
            {submitting ? <LoadingSpinner size="sm" /> : null}
            {submitting ? 'Creando...' : 'Crear empleado'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
