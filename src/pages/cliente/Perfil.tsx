import { useState } from 'react'
import toast from 'react-hot-toast'
import api from '../../api'
import { useAuth } from '../../context/AuthContext'
import { NavbarPublico } from '../../components/layout/NavbarPublico'
import { Footer } from '../../components/layout/Footer'
import { NivelBadge } from '../../components/ui/NivelBadge'
import { ProgresoNivel } from '../../components/ui/ProgresoNivel'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'

export default function Perfil() {
  const { usuario } = useAuth()
  const [saving, setSaving] = useState(false)
  const [savingPwd, setSavingPwd] = useState(false)

  const [perfil, setPerfil] = useState({
    nombre: usuario?.nombre ?? '',
    apellido: usuario?.apellido ?? '',
    telefono: usuario?.telefono ?? '',
  })
  const [pwd, setPwd] = useState({ actual: '', nuevo: '', confirmar: '' })

  const handleSavePerfil = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.put('/usuarios/perfil', perfil)
      toast.success('Perfil actualizado')
    } catch {
      toast.error('Error al actualizar perfil')
    } finally {
      setSaving(false)
    }
  }

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (pwd.nuevo !== pwd.confirmar) { toast.error('Las contraseñas no coinciden'); return }
    if (pwd.nuevo.length < 6) { toast.error('Mínimo 6 caracteres'); return }
    setSavingPwd(true)
    try {
      await api.put('/usuarios/password', { password_actual: pwd.actual, password_nuevo: pwd.nuevo })
      toast.success('Contraseña actualizada')
      setPwd({ actual: '', nuevo: '', confirmar: '' })
    } catch {
      toast.error('Contraseña actual incorrecta')
    } finally {
      setSavingPwd(false)
    }
  }

  if (!usuario) return null

  return (
    <div className="min-h-screen">
      <NavbarPublico />
      <div className="pt-24 pb-20 px-4 max-w-2xl mx-auto">
        <h1 className="font-syne font-bold text-2xl text-sb-text mb-6">Mi perfil</h1>

        {/* Membresía */}
        <div className="card p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold"
              style={{ background: 'linear-gradient(135deg, #3D56D4, #A78BFA)', color: 'white' }}>
              {usuario.nombre[0]}{usuario.apellido[0]}
            </div>
            <div>
              <p className="font-syne font-bold text-sb-text">{usuario.nombre} {usuario.apellido}</p>
              <p className="text-xs text-sb-muted">{usuario.email}</p>
            </div>
            <div className="ml-auto"><NivelBadge nivel={usuario.nivel_membresia} /></div>
          </div>
          <ProgresoNivel viajesRealizados={usuario.viajes_realizados} />
        </div>

        {/* Datos personales */}
        <div className="card p-6 mb-6">
          <h2 className="font-syne font-bold text-lg text-sb-text mb-4">Datos personales</h2>
          <form onSubmit={handleSavePerfil} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {(['nombre', 'apellido'] as const).map(f => (
                <div key={f}>
                  <label className="text-xs text-sb-muted block mb-1 capitalize">{f}</label>
                  <input
                    type="text"
                    value={perfil[f]}
                    onChange={e => setPerfil(p => ({ ...p, [f]: e.target.value }))}
                    className="w-full px-3 py-2.5 text-sm rounded-lg"
                    style={{ border: '1px solid var(--sb-border2)' }}
                  />
                </div>
              ))}
            </div>
            <div>
              <label className="text-xs text-sb-muted block mb-1">Teléfono</label>
              <input
                type="tel"
                value={perfil.telefono}
                onChange={e => setPerfil(p => ({ ...p, telefono: e.target.value }))}
                className="w-full px-3 py-2.5 text-sm rounded-lg"
                style={{ border: '1px solid var(--sb-border2)' }}
              />
            </div>
            <div>
              <label className="text-xs text-sb-muted block mb-1">Correo electrónico</label>
              <input type="email" value={usuario.email} disabled
                className="w-full px-3 py-2.5 text-sm rounded-lg opacity-50 cursor-not-allowed"
                style={{ border: '1px solid var(--sb-border)' }}
              />
            </div>
            <button type="submit" disabled={saving} className="btn-primary px-6 py-2.5 flex items-center gap-2">
              {saving ? <LoadingSpinner size="sm" /> : null}
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </form>
        </div>

        {/* Contraseña */}
        <div className="card p-6">
          <h2 className="font-syne font-bold text-lg text-sb-text mb-4">Cambiar contraseña</h2>
          <form onSubmit={handleSavePassword} className="space-y-4">
            {[
              { key: 'actual', label: 'Contraseña actual' },
              { key: 'nuevo', label: 'Nueva contraseña' },
              { key: 'confirmar', label: 'Confirmar nueva contraseña' },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="text-xs text-sb-muted block mb-1">{label}</label>
                <input
                  type="password"
                  value={pwd[key as keyof typeof pwd]}
                  onChange={e => setPwd(p => ({ ...p, [key]: e.target.value }))}
                  placeholder="••••••••"
                  className="w-full px-3 py-2.5 text-sm rounded-lg"
                  style={{ border: '1px solid var(--sb-border2)' }}
                />
              </div>
            ))}
            <button type="submit" disabled={savingPwd} className="btn-primary px-6 py-2.5 flex items-center gap-2">
              {savingPwd ? <LoadingSpinner size="sm" /> : null}
              {savingPwd ? 'Guardando...' : 'Actualizar contraseña'}
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  )
}
