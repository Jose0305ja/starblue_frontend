export const formatMXN = (n: number | string): string =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(Number(n))

// Normaliza a YYYY-MM-DD antes de parsear para evitar "Invalid Date"
// cuando la API devuelve timestamps completos ("2026-03-18T00:00:00.000Z")
const toLocal = (fecha: string) => new Date(fecha.slice(0, 10) + 'T12:00:00')

export const formatFecha = (fecha: string): string =>
  toLocal(fecha).toLocaleDateString('es-MX', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

export const formatFechaCorta = (fecha: string): string =>
  toLocal(fecha).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

export const formatHora = (hora: string): string =>
  hora ? hora.slice(0, 5) : ''

export const formatFolio = (folio: string): string => folio

export const capitalize = (s: string): string =>
  s.charAt(0).toUpperCase() + s.slice(1)

export const formatClase = (clase: string): string => {
  const map: Record<string, string> = {
    estandar: 'Estándar',
    ejecutivo: 'Ejecutivo',
    vip: 'VIP',
  }
  return map[clase] ?? clase
}

export const formatTipoServicio = (tipo: string): string => {
  const map: Record<string, string> = {
    directo: 'Directo',
    '1_parada': '1 parada',
    '2_paradas': '2 paradas',
  }
  return map[tipo] ?? tipo
}
