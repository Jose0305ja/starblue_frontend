export interface Usuario {
  id: number
  nombre: string
  apellido: string
  email: string
  telefono?: string
  rol: 'cliente' | 'empleado' | 'admin'
  viajes_realizados: number
  nivel_membresia: 'explorador' | 'viajero' | 'frecuente' | 'elite' | 'vip'
  activo: boolean
  created_at: string
}

export interface Ruta {
  id: number
  ciudad_origen: string
  ciudad_destino: string
  duracion_horas: number
  distancia_km?: number
  tipo_servicio: 'directo' | '1_parada' | '2_paradas'
  activa: boolean
}

export interface Viaje {
  id: number
  ruta_id: number
  ciudad_origen?: string
  ciudad_destino?: string
  duracion_horas?: number
  distancia_km?: number
  tipo_servicio?: string
  ruta?: Ruta
  fecha_salida: string
  hora_salida: string
  hora_llegada_est?: string
  precio_base: number
  asientos_total: number
  asientos_disponibles: number
  numero_unidad?: string
  clase: 'estandar' | 'ejecutivo' | 'vip'
  estado: 'programado' | 'en_ruta' | 'completado' | 'cancelado'
  creado_por?: number
}

export interface Pasajero {
  id?: number
  nombre: string
  apellido: string
  tipo_id: 'ine' | 'pasaporte' | 'licencia'
  num_identificacion: string
  es_titular: boolean
}

export interface Reservacion {
  id: number
  folio: string
  viaje_id: number
  viaje?: Viaje
  cliente_id: number
  cliente?: Usuario
  cliente_nombre?: string
  cliente_apellido?: string
  cliente_email?: string
  empleado_id?: number
  empleado?: Usuario
  empleado_nombre?: string
  empleado_apellido?: string
  num_pasajeros: number
  tipo_viaje: 'sencillo' | 'redondo'
  precio_unitario: number
  precio_total: number
  descuento_aplicado: number
  moneda: 'MXN' | 'USD'
  estado: 'pendiente' | 'confirmada' | 'completada' | 'cancelada'
  pasajeros?: Pasajero[]
  // datos del viaje embebidos
  fecha_salida?: string
  hora_salida?: string
  clase?: string
  ciudad_origen?: string
  ciudad_destino?: string
  duracion_horas?: number
  created_at: string
}

export interface NivelConfig {
  nivel: string
  min: number
  max: number
  descuento: number
  label: string
  beneficios?: string[]
}

export interface ProgresoNivelData {
  pct: number
  faltan: number
  siguiente: string | null
}

export interface ResumenAdmin {
  total_reservas: string
  total_cancelaciones: string
  ingresos_mes: string
  clientes_unicos: string
}

export interface RutaPopular {
  id: number
  ciudad_origen: string
  ciudad_destino: string
  total_reservas: string
  total_pasajeros: string
  ingresos_total: string
  porcentaje_ocupacion: string | null
}

export interface DestinoTop {
  destino: string
  total_reservas: string
  porcentaje: string
}

export interface EmpleadoRanking {
  id: number
  nombre: string
  apellido: string
  total_reservas: string
  ingresos_total: string
  ticket_promedio: string
  posicion: number
}

export interface IngresoMensual {
  mes: string
  total_reservas: string
  ingresos: string
}

export interface DashboardEmpleado {
  reservas_mes: { total: number; ingresos: string }
  clientes_unicos: number
  top_rutas: { ciudad_origen: string; ciudad_destino: string; total: number }[]
  ultimas_reservas: unknown[]
  posicion_ranking: string | null
}
