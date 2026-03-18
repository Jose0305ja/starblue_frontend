import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const getRedirect = (rol: string) => {
    if (rol === 'admin') return '/admin/dashboard'
    if (rol === 'empleado') return '/empleado/dashboard'
    return '/dashboard'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) { toast.error('Completa todos los campos'); return }
    setLoading(true)
    try {
      const loggedUser = await login(email, password)
      toast.success('Bienvenido de vuelta')
      navigate(getRedirect(loggedUser.rol))
    } catch {
      toast.error('Credenciales incorrectas')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="font-syne font-extrabold text-3xl mb-2">
            <span className="text-sb-text">STAR</span>
            <span className="text-sb-blue-lt">BLUE★</span>
          </div>
          <p className="text-sb-muted text-sm">Inicia sesión para continuar</p>
        </div>

        <div className="card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-sb-muted mb-1.5">Correo electrónico</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full px-3 py-2.5 text-sm rounded-lg"
                style={{ border: '1px solid var(--sb-border2)' }}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-sb-muted mb-1.5">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2.5 text-sm rounded-lg"
                style={{ border: '1px solid var(--sb-border2)' }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5 flex items-center justify-center gap-2"
            >
              {loading ? <LoadingSpinner size="sm" /> : null}
              {loading ? 'Ingresando...' : 'Iniciar sesión'}
            </button>
          </form>

          <p className="text-center text-sm text-sb-muted mt-4">
            ¿No tienes cuenta?{' '}
            <Link to="/registro" className="text-sb-blue-lt hover:underline font-semibold">
              Regístrate
            </Link>
          </p>
        </div>

      </div>
    </div>
  )
}
