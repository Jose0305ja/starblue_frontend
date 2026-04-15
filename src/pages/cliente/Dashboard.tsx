import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api'
import type { Reservacion } from '../../types'
import { useAuth } from '../../context/AuthContext'
import { NavbarPublico } from '../../components/layout/NavbarPublico'
import { Footer } from '../../components/layout/Footer'
import { NivelBadge } from '../../components/ui/NivelBadge'
import { ProgresoNivel } from '../../components/ui/ProgresoNivel'
import { ReservaCard } from '../../components/reservaciones/ReservaCard'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'

export default function ClienteDashboard() {
  const { usuario } = useAuth()
  const [reservas, setReservas] = useState<Reservacion[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/reservaciones/mis-reservas')
      .then(r => setReservas(r.data.data.slice(0, 3)))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (!usuario) return null
  const isOro = ['oro', 'vip'].includes(usuario.nivel_membresia)

  return (
    <div className="min-h-screen">
      <NavbarPublico />
      <div className="pt-24 pb-20 px-4 max-w-4xl mx-auto">
        {/* Bienvenida */}
        <div className="card p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold font-syne flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #3D56D4, #A78BFA)', color: 'white' }}
              >
                {usuario.nombre[0]}{usuario.apellido[0]}
              </div>
              <div>
                <p className="text-sb-muted text-sm">Bienvenido de vuelta</p>
                <h1 className="font-syne font-bold text-2xl text-sb-text">
                  {usuario.nombre} {usuario.apellido}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <NivelBadge nivel={usuario.nivel_membresia} size="sm" />
                  <span className="text-xs text-sb-muted">{usuario.viajes_realizados} viajes realizados</span>
                </div>
              </div>
            </div>
            <Link to="/buscar" className="btn-primary px-6 py-2.5 flex-shrink-0">
              🔍 Buscar viajes
            </Link>
          </div>

          {isOro ? (
            <div className="mt-4 p-3 rounded-lg flex items-center gap-2"
              style={{ backgroundColor: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.3)' }}>
              <span>⭐</span>
              <p className="text-sm font-semibold" style={{ color: '#EAB308' }}>
                ¡Eres nivel Oro! Disfrutas 20% de descuento en cada viaje.
              </p>
            </div>
          ) : (
            <div className="mt-4">
              <ProgresoNivel viajesRealizados={usuario.viajes_realizados} />
            </div>
          )}
        </div>

        {/* Últimas reservaciones */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-syne font-bold text-lg text-sb-text">Últimas reservaciones</h2>
            <Link to="/mis-reservas" className="text-sb-blue-lt text-sm hover:underline">Ver todas →</Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-10"><LoadingSpinner /></div>
          ) : reservas.length === 0 ? (
            <div className="card p-8 text-center">
              <p className="text-4xl mb-3">🎫</p>
              <p className="text-sb-muted mb-4">Aún no tienes reservaciones</p>
              <Link to="/buscar" className="btn-primary px-6 py-2">Buscar mi primer viaje</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {reservas.map(r => <ReservaCard key={r.id} reserva={r} />)}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}
