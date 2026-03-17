import { useState, useEffect } from 'react'
import { NavbarEmpleado } from '../../components/layout/NavbarEmpleado'
import { toast } from 'react-hot-toast'
import { Link } from 'react-router-dom'
import api from '../../api'

interface OfertaForm {
  titulo: string
  descripcion: string
  origen: string
  destino: string
  activa: boolean
}

const RUTAS_SUGERIDAS = [
  { origen: 'Ciudad de México', destino: 'Los Ángeles'  },
  { origen: 'Ciudad de México', destino: 'Dallas'       },
  { origen: 'Ciudad de México', destino: 'Chicago'      },
  { origen: 'Ciudad de México', destino: 'Phoenix'      },
  { origen: 'Monterrey',        destino: 'Houston'      },
  { origen: 'Monterrey',        destino: 'San Antonio'  },
  { origen: 'Tijuana',          destino: 'San Diego'    },
  { origen: 'Guadalajara',      destino: 'Los Ángeles'  },
  { origen: 'Chihuahua',        destino: 'El Paso'      },
]

export default function AdminOferta() {
  const [form, setForm] = useState<OfertaForm>({
    titulo: '',
    descripcion: '',
    origen: '',
    destino: '',
    activa: true,
  })
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)
  const [preview,  setPreview]  = useState(false)

  useEffect(() => {
    api.get('/config/oferta')
      .then(r => { if (r.data.data) setForm(r.data.data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const set = (k: keyof OfertaForm, v: string | boolean) =>
    setForm(f => ({ ...f, [k]: v }))

  const handleRutaSugerida = (origen: string, destino: string) => {
    set('origen', origen)
    set('destino', destino)
    if (!form.titulo) set('titulo', `Viaje ${origen} → ${destino}`)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.put('/config/oferta', form)
      toast.success('¡Oferta actualizada correctamente!')
    } catch {
      toast.error('Error al guardar la oferta')
    } finally {
      setSaving(false)
    }
  }

  const inputClass = 'w-full px-4 py-3 rounded-xl text-sm text-sb-text transition-all focus:outline-none'
  const inputStyle = {
    backgroundColor: 'var(--sb-badge-bg)',
    border: '1px solid var(--sb-border2)',
  }

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <NavbarEmpleado />
        <main className="flex-1 lg:ml-60 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#3D56D4', borderTopColor: 'transparent' }} />
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      <NavbarEmpleado />

      <main className="flex-1 lg:ml-60 pt-14 lg:pt-0">
        <div className="max-w-3xl mx-auto px-4 py-10">

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-xs text-sb-muted mb-3">
              <Link to="/admin/dashboard" className="hover:text-sb-text transition-colors">Panel</Link>
              <span>/</span>
              <span className="text-sb-blue-lt">Oferta de la semana</span>
            </div>
            <h1 className="font-syne font-extrabold text-3xl text-sb-text">Oferta de la semana</h1>
            <p className="text-sb-muted mt-1">Configura el banner que aparece en la página principal.</p>
          </div>

          <div className="grid lg:grid-cols-5 gap-6">

            {/* ── Formulario ── */}
            <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-5">

              {/* Estado activo */}
              <div className="card p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm text-sb-text">Mostrar oferta</p>
                  <p className="text-xs text-sb-muted mt-0.5">
                    {form.activa ? 'El banner es visible en el inicio' : 'El banner está oculto'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => set('activa', !form.activa)}
                  className="relative flex-shrink-0 w-12 h-6 rounded-full transition-all duration-300"
                  style={{ backgroundColor: form.activa ? 'var(--sb-blue)' : 'var(--sb-border2)' }}
                >
                  <span
                    className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300"
                    style={{ left: form.activa ? '1.75rem' : '0.25rem', boxShadow: '0 1px 4px rgba(0,0,0,.3)' }}
                  />
                </button>
              </div>

              {/* Título */}
              <div>
                <label className="block text-xs font-bold text-sb-muted uppercase tracking-wider mb-2">
                  Título del banner
                </label>
                <input
                  type="text"
                  value={form.titulo}
                  onChange={e => set('titulo', e.target.value)}
                  placeholder="Viaje redondo CDMX → Dallas"
                  className={inputClass}
                  style={inputStyle}
                  required
                  maxLength={80}
                />
                <p className="text-xs text-sb-muted mt-1 text-right">{form.titulo.length}/80</p>
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-xs font-bold text-sb-muted uppercase tracking-wider mb-2">
                  Descripción / precio
                </label>
                <input
                  type="text"
                  value={form.descripcion}
                  onChange={e => set('descripcion', e.target.value)}
                  placeholder="Desde $3,300 MXN · Dos personas · Tiempo limitado"
                  className={inputClass}
                  style={inputStyle}
                  required
                  maxLength={120}
                />
                <p className="text-xs text-sb-muted mt-1 text-right">{form.descripcion.length}/120</p>
              </div>

              {/* Ruta */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-sb-muted uppercase tracking-wider mb-2">
                    Ciudad origen
                  </label>
                  <input
                    type="text"
                    value={form.origen}
                    onChange={e => set('origen', e.target.value)}
                    placeholder="Ciudad de México"
                    className={inputClass}
                    style={inputStyle}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-sb-muted uppercase tracking-wider mb-2">
                    Ciudad destino
                  </label>
                  <input
                    type="text"
                    value={form.destino}
                    onChange={e => set('destino', e.target.value)}
                    placeholder="Dallas"
                    className={inputClass}
                    style={inputStyle}
                    required
                  />
                </div>
              </div>

              {/* Rutas sugeridas */}
              <div>
                <p className="text-xs font-bold text-sb-muted uppercase tracking-wider mb-2">Rutas sugeridas</p>
                <div className="flex flex-wrap gap-2">
                  {RUTAS_SUGERIDAS.map(r => {
                    const activo = form.origen === r.origen && form.destino === r.destino
                    return (
                      <button
                        key={`${r.origen}-${r.destino}`}
                        type="button"
                        onClick={() => handleRutaSugerida(r.origen, r.destino)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                        style={activo
                          ? { backgroundColor: 'var(--sb-blue)', color: 'white', border: '1px solid var(--sb-blue-lt)' }
                          : { backgroundColor: 'var(--sb-badge-bg)', color: 'var(--sb-muted)', border: '1px solid var(--sb-border2)' }
                        }
                      >
                        {r.origen.split(' ').pop()} → {r.destino}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Acciones */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary px-8 py-3 text-sm font-bold flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      Guardando…
                    </>
                  ) : '💾 Guardar cambios'}
                </button>
                <button
                  type="button"
                  onClick={() => setPreview(v => !v)}
                  className="btn-secondary px-5 py-3 text-sm"
                >
                  {preview ? 'Ocultar vista previa' : '👁 Vista previa'}
                </button>
              </div>
            </form>

            {/* ── Vista previa ── */}
            <div className="lg:col-span-2">
              <p className="text-xs font-bold text-sb-muted uppercase tracking-wider mb-3">Vista previa</p>
              <div
                className={`rounded-2xl overflow-hidden transition-all duration-300 ${preview || true ? 'opacity-100' : 'opacity-40'}`}
              >
                <div
                  className="relative p-5 flex flex-col gap-4"
                  style={{
                    background: 'linear-gradient(135deg,rgba(61,86,212,.4) 0%,rgba(167,139,250,.25) 100%)',
                    border: '1px solid rgba(91,116,240,.4)',
                  }}
                >
                  <div className="absolute inset-0 pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(circle at 85% 50%,rgba(91,116,240,.3) 0%,transparent 60%)' }} />
                  <div className="relative">
                    <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#A78BFA' }}>
                      ✨ Oferta de la semana
                    </span>
                    <p className="font-syne font-bold text-base text-sb-text mt-1.5 leading-snug">
                      {form.titulo || 'Título del banner'}
                    </p>
                    <p className="text-xs mt-1 text-sb-muted">
                      {form.descripcion || 'Descripción de la oferta'}
                    </p>
                  </div>
                  <div className="relative flex items-center justify-between">
                    <span className="text-xs text-sb-muted">
                      {form.origen || '—'} → {form.destino || '—'}
                    </span>
                    <span className="text-xs font-bold px-3 py-1.5 rounded-lg text-white"
                      style={{ backgroundColor: 'var(--sb-blue)' }}>
                      Ver oferta →
                    </span>
                  </div>
                  {!form.activa && (
                    <div className="absolute inset-0 rounded-2xl flex items-center justify-center"
                      style={{ backgroundColor: 'rgba(0,0,0,.55)', backdropFilter: 'blur(2px)' }}>
                      <span className="text-sm font-bold text-white/60">Banner oculto</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="card p-4 mt-4 space-y-2">
                <p className="text-xs font-bold text-sb-muted uppercase tracking-wider">Info</p>
                <div className="flex justify-between text-xs">
                  <span className="text-sb-muted">Estado</span>
                  <span className="font-semibold" style={{ color: form.activa ? 'var(--sb-green)' : 'var(--sb-red)' }}>
                    {form.activa ? '● Visible' : '● Oculto'}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-sb-muted">Ruta del botón</span>
                  <span className="font-mono-sb text-sb-text" style={{ fontSize: 10 }}>
                    /buscar?origen=…&destino=…
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
