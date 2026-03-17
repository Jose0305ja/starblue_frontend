import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { ThemeToggle } from '../ui/ThemeToggle'
import { CurrencyToggle } from '../ui/CurrencyToggle'

interface NavItem { label: string; icon: string; to: string; badge?: number }

export const NavbarEmpleado = () => {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const isAdmin = usuario?.rol === 'admin'
  const initials = usuario ? `${usuario.nombre[0]}${usuario.apellido[0]}`.toUpperCase() : ''

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const empleadoItems: NavItem[] = [
    { label: 'Mi Dashboard', icon: '◈', to: '/empleado/dashboard' },
    { label: 'Reservaciones', icon: '🎫', to: '/empleado/reservaciones' },
    { label: 'Viajes', icon: '🚌', to: '/empleado/viajes' },
  ]

  const adminItems: NavItem[] = [
    { label: 'Panel General', icon: '📊', to: '/admin/dashboard' },
    { label: 'Empleados',     icon: '👥', to: '/admin/empleados' },
    { label: 'Rutas',         icon: '🗺', to: '/admin/rutas' },
    { label: 'Reportes',      icon: '📈', to: '/admin/reportes' },
    { label: 'Oferta semana', icon: '✨', to: '/admin/oferta' },
  ]

  const NavItemComp = ({ item }: { item: NavItem }) => (
    <NavLink
      to={item.to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
          isActive
            ? 'bg-sb-blue/20 text-white border border-sb-blue/30'
            : 'text-sb-muted hover:text-sb-text hover:bg-white/5'
        }`
      }
    >
      <span className="text-base w-5 flex-shrink-0 text-center">{item.icon}</span>
      {!collapsed && <span className="truncate">{item.label}</span>}
    </NavLink>
  )

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 flex items-center justify-between border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
        <div className="font-syne font-extrabold text-lg">
          <span className="text-white">STAR</span>
          <span style={{ color: '#5B74F0' }}>BLUE★</span>
        </div>
        <button
          onClick={() => setCollapsed(v => !v)}
          className="hidden lg:flex text-sb-muted hover:text-sb-text p-1 rounded"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={collapsed ? 'M13 5l7 7-7 7M5 5l7 7-7 7' : 'M11 19l-7-7 7-7m8 14l-7-7 7-7'} />
          </svg>
        </button>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {!collapsed && (
          <p className="text-xs font-semibold text-sb-muted uppercase tracking-wider px-3 mb-2 mt-1">Principal</p>
        )}
        {empleadoItems.map(item => <NavItemComp key={item.to} item={item} />)}

        {isAdmin && (
          <>
            {!collapsed && (
              <p className="text-xs font-semibold text-sb-muted uppercase tracking-wider px-3 mb-2 mt-4">Administración</p>
            )}
            {adminItems.map(item => <NavItemComp key={item.to} item={item} />)}
          </>
        )}
      </div>

      {/* Toggles tema / moneda */}
      {!collapsed && (
        <div className="px-3 pb-2 flex items-center gap-2 border-t pt-3" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
          <ThemeToggle compact />
          <CurrencyToggle compact />
        </div>
      )}

      {/* Usuario */}
      <div className="p-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-syne flex-shrink-0"
            style={{ backgroundColor: '#3D56D4', color: 'white' }}
          >
            {initials}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-sb-text truncate">{usuario?.nombre} {usuario?.apellido}</p>
              <p className="text-xs text-sb-muted capitalize">{usuario?.rol}</p>
            </div>
          )}
          {!collapsed && (
            <button onClick={handleLogout} className="text-sb-muted hover:text-red-400 transition-colors" title="Cerrar sesión">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile top bar */}
      <div
        className="lg:hidden fixed top-0 left-0 right-0 z-40 h-14 flex items-center justify-between px-4 border-b"
        style={{ backgroundColor: '#0D1220', borderColor: 'rgba(255,255,255,0.07)' }}
      >
        <div className="font-syne font-extrabold text-base">
          <span className="text-white">STAR</span>
          <span style={{ color: '#5B74F0' }}>BLUE★</span>
        </div>
        <div className="flex items-center gap-2">
        <ThemeToggle compact />
        <CurrencyToggle compact />
      </div>
      <button onClick={() => setMobileOpen(v => !v)} className="text-sb-muted">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
          </svg>
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-30 bg-black/60" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`lg:hidden fixed left-0 top-0 bottom-0 z-40 w-64 transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ backgroundColor: '#0D1220', borderRight: '1px solid rgba(255,255,255,0.07)' }}
      >
        <SidebarContent />
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col fixed left-0 top-0 bottom-0 z-30 transition-all duration-300 ${collapsed ? 'w-16' : 'w-60'}`}
        style={{ backgroundColor: '#0D1220', borderRight: '1px solid rgba(255,255,255,0.07)' }}
      >
        <SidebarContent />
      </aside>
    </>
  )
}
