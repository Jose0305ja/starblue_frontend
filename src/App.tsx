import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './components/ui/ProtectedRoute'

// Páginas públicas
import Inicio from './pages/publicas/Inicio'
import Destinos from './pages/publicas/Destinos'
import Horarios from './pages/publicas/Horarios'
import Buscar from './pages/publicas/Buscar'
import DetalleViaje from './pages/publicas/DetalleViaje'
import Login from './pages/publicas/Login'
import Registro from './pages/publicas/Registro'
import Niveles from './pages/publicas/Niveles'

// Páginas cliente
import ClienteDashboard from './pages/cliente/Dashboard'
import MisReservas from './pages/cliente/MisReservas'
import DetalleReservaCliente from './pages/cliente/DetalleReserva'
import Reservar from './pages/cliente/Reservar'
import Confirmacion from './pages/cliente/Confirmacion'
import Perfil from './pages/cliente/Perfil'

// Páginas empleado
import EmpleadoDashboard from './pages/empleado/Dashboard'
import EmpleadoReservaciones from './pages/empleado/Reservaciones'
import EmpleadoDetalleReserva from './pages/empleado/DetalleReserva'
import EmpleadoViajes from './pages/empleado/Viajes'

// Páginas admin
import AdminDashboard from './pages/admin/Dashboard'
import AdminEmpleados from './pages/admin/Empleados'
import AdminRutas from './pages/admin/Rutas'
import AdminReportes from './pages/admin/Reportes'
import AdminOferta from './pages/admin/Oferta'

export default function App() {
  return (
    <Routes>
      {/* ── PÚBLICAS ── */}
      <Route path="/" element={<Inicio />} />
      <Route path="/destinos" element={<Destinos />} />
      <Route path="/horarios" element={<Horarios />} />
      <Route path="/buscar" element={<Buscar />} />
      <Route path="/viajes/:id" element={<DetalleViaje />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Registro />} />
      <Route path="/niveles" element={<Niveles />} />

      {/* ── CLIENTE (autenticado, cualquier rol) ── */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<ClienteDashboard />} />
        <Route path="/mis-reservas" element={<MisReservas />} />
        <Route path="/mis-reservas/:id" element={<DetalleReservaCliente />} />
        <Route path="/reservar/:viajeId" element={<Reservar />} />
        <Route path="/confirmacion/:folio" element={<Confirmacion />} />
        <Route path="/perfil" element={<Perfil />} />
      </Route>

      {/* ── EMPLEADO (empleado | admin) ── */}
      <Route element={<ProtectedRoute roles={['empleado', 'admin']} />}>
        <Route path="/empleado/dashboard" element={<EmpleadoDashboard />} />
        <Route path="/empleado/reservaciones" element={<EmpleadoReservaciones />} />
        <Route path="/empleado/reservaciones/:id" element={<EmpleadoDetalleReserva />} />
        <Route path="/empleado/viajes" element={<EmpleadoViajes />} />
      </Route>

      {/* ── ADMIN (solo admin) ── */}
      <Route element={<ProtectedRoute roles={['admin']} />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/empleados" element={<AdminEmpleados />} />
        <Route path="/admin/rutas" element={<AdminRutas />} />
        <Route path="/admin/reportes" element={<AdminReportes />} />
        <Route path="/admin/oferta" element={<AdminOferta />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
