import type { NivelConfig } from '../types'

export const NIVELES: NivelConfig[] = [
  { nivel: 'explorador', min: 0,  max: 4,        descuento: 0,  label: '✈ Explorador', beneficios: ['Acceso a todas las rutas', 'Reservas en línea 24/7'] },
  { nivel: 'viajero',    min: 5,  max: 14,       descuento: 5,  label: '🥈 Viajero',    beneficios: ['5% de descuento', 'Soporte preferencial', 'Rutas prioritarias'] },
  { nivel: 'frecuente',  min: 15, max: 29,       descuento: 10, label: '🥇 Frecuente',  beneficios: ['10% de descuento', 'Asiento preferencial', 'Embarque anticipado'] },
  { nivel: 'elite',      min: 30, max: 49,       descuento: 15, label: '💎 Elite',       beneficios: ['15% de descuento', 'Cambios sin costo', 'Sala VIP', 'Equipaje extra'] },
  { nivel: 'vip',        min: 50, max: Infinity, descuento: 20, label: '⭐ VIP',          beneficios: ['20% de descuento', 'Atención personalizada', 'Boletos de cortesía', 'Acceso ejecutivo'] },
]

export const getNivel = (viajes: number): NivelConfig =>
  NIVELES.find(n => viajes >= n.min && viajes <= n.max) ?? NIVELES[0]

export const getDescuento = (viajes: number): number =>
  getNivel(viajes).descuento

export const getProgreso = (viajes: number) => {
  const actual = getNivel(viajes)
  const idx = NIVELES.indexOf(actual)
  const siguiente = NIVELES[idx + 1]
  if (!siguiente) return { pct: 100, faltan: 0, siguiente: null }
  const pct = ((viajes - actual.min) / (siguiente.min - actual.min)) * 100
  return { pct: Math.min(pct, 99), faltan: siguiente.min - viajes, siguiente: siguiente.label }
}

export const getNivelColor = (nivel: string): string => {
  const map: Record<string, string> = {
    explorador: '#8891A8',
    viajero:    '#94A3B8',
    frecuente:  '#F59E0B',
    elite:      '#5B74F0',
    vip:        '#EAB308',
  }
  return map[nivel] ?? '#8891A8'
}
