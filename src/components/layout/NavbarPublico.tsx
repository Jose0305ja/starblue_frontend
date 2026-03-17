import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { ThemeToggle } from '../ui/ThemeToggle'
import { getNivelColor, getProgreso, NIVELES } from '../../utils/nivelMembresia'

export const NavbarPublico = () => {
  const { isAuthenticated, usuario, logout } = useAuth()
  const [dropOpen, setDropOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const dropRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const initials = usuario ? `${usuario.nombre[0]}${usuario.apellido[0]}`.toUpperCase() : ''

  const getDashboardLink = () => {
    if (!usuario) return '/login'
    if (usuario.rol === 'admin') return '/admin/dashboard'
    if (usuario.rol === 'empleado') return '/empleado/dashboard'
    return '/dashboard'
  }

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-40 border-b"
      style={{ backgroundColor: 'var(--sb-nav-bg)', backdropFilter: 'blur(12px)', borderColor: 'var(--sb-border)' }}
    >
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-1 font-syne font-extrabold text-xl">
          <span className="text-sb-text">STAR</span>
          <span style={{ color: 'var(--sb-blue-lt)' }}>BLUE★</span>
        </Link>

        {/* Nav links desktop */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/destinos" className="text-sb-muted hover:text-sb-text text-sm font-semibold transition-colors">Destinos</Link>
          <Link to="/horarios" className="text-sb-muted hover:text-sb-text text-sm font-semibold transition-colors">Horarios</Link>
          <Link to="/niveles"  className="text-sb-muted hover:text-sb-text text-sm font-semibold transition-colors">Membresías</Link>
        </div>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          <Link
            to="/buscar"
            className="btn-primary text-sm py-2 px-4"
          >
            Reservar
          </Link>

          {isAuthenticated && usuario ? (
            <div className="relative" ref={dropRef}>
              <button
                onClick={() => setDropOpen(v => !v)}
                className="flex items-center gap-2 rounded-full py-1 px-3 transition-colors"
                style={{ backgroundColor: 'var(--sb-badge-bg)', border: '1px solid var(--sb-border2)' }}
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-syne"
                  style={{ backgroundColor: '#3D56D4', color: 'white' }}
                >
                  {initials}
                </div>
                <span className="text-sb-text text-sm font-semibold">{usuario.nombre}</span>
                <svg className="w-3 h-3 text-sb-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {dropOpen && (() => {
                const nivelActual  = usuario.nivel_membresia ?? 'explorador'
                const viajes       = usuario.viajes_realizados ?? 0
                const color        = getNivelColor(nivelActual)
                const progreso     = getProgreso(viajes)
                const nivelLabel   = NIVELES.find(n => n.nivel === nivelActual)?.label ?? nivelActual

                return (
                  <div
                    className="absolute right-0 top-full mt-2 w-72 rounded-2xl shadow-2xl overflow-hidden"
                    style={{ backgroundColor: 'var(--sb-card-bg)', border: '1px solid var(--sb-border2)', boxShadow: 'var(--sb-card-shadow)' }}
                  >
                    {/* ── Cabecera: usuario + nivel ── */}
                    <div className="px-4 pt-4 pb-3" style={{ borderBottom: '1px solid var(--sb-border)' }}>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center font-syne font-bold flex-shrink-0"
                          style={{ backgroundColor: color + '25', border: `2px solid ${color}60`, color }}>
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <p className="font-syne font-bold text-sb-text text-sm truncate">
                            {usuario.nombre} {usuario.apellido}
                          </p>
                          <p className="text-xs text-sb-muted capitalize">{usuario.rol}</p>
                        </div>
                        <span className="ml-auto flex-shrink-0 text-xs font-bold px-2.5 py-1 rounded-full"
                          style={{ backgroundColor: color + '20', color, border: `1px solid ${color}40` }}>
                          {nivelLabel}
                        </span>
                      </div>

                      {/* Viajes realizados */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-sb-muted">{viajes} viaje{viajes !== 1 ? 's' : ''} realizados</span>
                        {progreso.siguiente ? (
                          <span className="text-xs font-semibold" style={{ color }}>
                            {progreso.faltan} para {progreso.siguiente.split(' ')[1] ?? progreso.siguiente}
                          </span>
                        ) : (
                          <span className="text-xs font-bold" style={{ color: '#EAB308' }}>Nivel máximo ⭐</span>
                        )}
                      </div>

                      {/* Barra de progreso */}
                      <div className="h-2 rounded-full overflow-hidden"
                        style={{ backgroundColor: 'var(--sb-border2)' }}>
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${progreso.pct}%`,
                            background: `linear-gradient(90deg, ${color}99, ${color})`,
                            boxShadow: `0 0 8px ${color}60`,
                          }}
                        />
                      </div>

                      {progreso.siguiente && (
                        <p className="text-xs text-sb-muted mt-1.5">
                          Te faltan <span className="font-bold" style={{ color }}>{progreso.faltan} viaje{progreso.faltan !== 1 ? 's' : ''}</span> para alcanzar {progreso.siguiente}
                        </p>
                      )}
                    </div>

                    {/* ── Links ── */}
                    <div className="py-1">
                      <Link to={getDashboardLink()} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-sb-muted hover:text-sb-text hover:bg-[var(--sb-hover-bg)] transition-colors" onClick={() => setDropOpen(false)}>
                        <span>🏠</span> Mi Dashboard
                      </Link>
                      <Link to="/mis-reservas" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-sb-muted hover:text-sb-text hover:bg-[var(--sb-hover-bg)] transition-colors" onClick={() => setDropOpen(false)}>
                        <span>🎫</span> Mis reservaciones
                      </Link>
                      <Link to="/perfil" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-sb-muted hover:text-sb-text hover:bg-[var(--sb-hover-bg)] transition-colors" onClick={() => setDropOpen(false)}>
                        <span>👤</span> Mi perfil
                      </Link>
                    </div>

                    <div style={{ borderTop: '1px solid var(--sb-border)' }} />
                    <div className="py-1">
                      <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:bg-[var(--sb-hover-bg)] transition-colors text-left">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Cerrar sesión
                      </button>
                    </div>
                  </div>
                )
              })()}
            </div>
          ) : (
            <Link to="/login" className="text-sb-muted hover:text-sb-text text-sm font-semibold transition-colors">
              Mi cuenta
            </Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-sb-muted hover:text-sb-text"
          onClick={() => setMobileOpen(v => !v)}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t px-4 py-3 space-y-2" style={{ backgroundColor: 'var(--sb-bg2)', borderColor: 'var(--sb-border)' }}>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm font-semibold" style={{ color: 'var(--sb-muted)' }}>Tema</span>
            <ThemeToggle compact />
          </div>
          <Link to="/destinos" className="block py-2 text-sb-muted text-sm font-semibold" onClick={() => setMobileOpen(false)}>Destinos</Link>
          <Link to="/horarios" className="block py-2 text-sb-muted text-sm font-semibold" onClick={() => setMobileOpen(false)}>Horarios</Link>
          <Link to="/niveles" className="block py-2 text-sb-muted text-sm font-semibold" onClick={() => setMobileOpen(false)}>Membresías</Link>
          <Link to="/buscar" className="block py-2 text-sb-blue-lt text-sm font-semibold" onClick={() => setMobileOpen(false)}>Reservar</Link>
          {isAuthenticated ? (
            <>
              <Link to={getDashboardLink()} className="block py-2 text-sb-muted text-sm" onClick={() => setMobileOpen(false)}>Mi Dashboard</Link>
              <button onClick={() => { handleLogout(); setMobileOpen(false) }} className="block py-2 text-red-400 text-sm font-semibold">Cerrar sesión</button>
            </>
          ) : (
            <Link to="/login" className="block py-2 text-sb-muted text-sm font-semibold" onClick={() => setMobileOpen(false)}>Iniciar sesión</Link>
          )}
        </div>
      )}
    </nav>
  )
}
