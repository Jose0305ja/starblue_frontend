import type { NivelConfig } from '../types'

export const NIVELES: NivelConfig[] = [
  {
    nivel: 'bronce',
    min: 0,
    max: 9,
    descuento: 10,
    label: '🥉 Bronce',
    beneficios: [
      'Aura Shop Dgo – 10% en accesorios',
      'Postres Miel – 10% en pedidos + topping gratis',
      'Café Nómada Dgo – 10% en bebidas + bebida especial',
      'La Parrillita Express – 15% en pedidos para llevar',
      'Detalles Mágicos Dgo – Regalo sorpresa en compra',
    ],
  },
  {
    nivel: 'plata',
    min: 10,
    max: 24,
    descuento: 15,
    label: '🥈 Plata',
    beneficios: [
      'Café Canela Dgo – Pan dulce gratis en consumo',
      'Sugar Bloom Dgo – Cupcake gratis en compra',
      'Luna Artesanal – 15% en productos hechos a mano',
      'Dulce Tentación Repostería – 15% en pasteles',
      'Beauty Spot Dgo – Descuento en faciales básicos',
    ],
  },
  {
    nivel: 'oro',
    min: 25,
    max: Infinity,
    descuento: 20,
    label: '🥇 Oro',
    beneficios: [
      'Casa Roma Café – 2x1 en bebidas',
      'Bendito Antojo Dgo – 2x1 en tacos',
      'La Esquina Street Food – Combo exclusivo para miembros',
      'Studio Glow Nails – 10% en uñas + diseño gratis',
      'Lash Room Dgo – 15% en retoques',
    ],
  },
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
    bronce: '#CD7F32',
    plata: '#94A3B8',
    oro: '#EAB308',
    // compatibilidad con valores previos
    explorador: '#CD7F32',
    viajero: '#94A3B8',
    frecuente: '#EAB308',
    elite: '#EAB308',
    vip: '#EAB308',
  }
  return map[nivel] ?? '#8891A8'
}
