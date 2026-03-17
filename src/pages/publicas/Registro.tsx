import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../../api'
import { useAuth } from '../../context/AuthContext'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'

export default function Registro() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    nombre: '', apellido: '', email: '', password: '', confirmar: '', telefono: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.nombre.trim()) e.nombre = 'El nombre es requerido'
    if (!form.apellido.trim()) e.apellido = 'El apellido es requerido'
    if (!form.email.includes('@')) e.email = 'Email inválido'
    if (form.password.length < 6) e.password = 'Mínimo 6 caracteres'
    if (form.password !== form.confirmar) e.confirmar = 'Las contraseñas no coinciden'
    return e
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})
    setLoading(true)
    try {
      await api.post('/auth/register', {
        nombre: form.nombre,
        apellido: form.apellido,
        email: form.email,
        password: form.password,
        ...(form.telefono ? { telefono: form.telefono } : {}),
      })
      await login(form.email, form.password)
      toast.success('¡Cuenta creada exitosamente!')
      navigate('/dashboard')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } }).response?.data?.error ?? 'Error al registrar'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const field = (key: keyof typeof form, label: string, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-sm font-semibold text-sb-muted mb-1.5">{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 text-sm rounded-lg"
        style={{ border: `1px solid ${errors[key] ? 'var(--sb-red)' : 'var(--sb-border2)'}` }}
      />
      {errors[key] && <p className="text-red-400 text-xs mt-1">{errors[key]}</p>}
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20 pb-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="font-syne font-extrabold text-3xl mb-2">
            <span className="text-sb-text">STAR</span>
            <span className="text-sb-blue-lt">BLUE★</span>
          </div>
          <p className="text-sb-muted text-sm">Crea tu cuenta gratis</p>
        </div>

        <div className="card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {field('nombre', 'Nombre', 'text', 'José')}
              {field('apellido', 'Apellido', 'text', 'García')}
            </div>
            {field('email', 'Correo electrónico', 'email', 'tu@email.com')}
            {field('telefono', 'Teléfono (opcional)', 'tel', '+52 55 1234 5678')}
            {field('password', 'Contraseña', 'password', '••••••••')}
            {field('confirmar', 'Confirmar contraseña', 'password', '••••••••')}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5 flex items-center justify-center gap-2"
            >
              {loading ? <LoadingSpinner size="sm" /> : null}
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>

          <p className="text-center text-sm text-sb-muted mt-4">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-sb-blue-lt hover:underline font-semibold">
              Iniciar sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
