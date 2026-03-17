import { getNivel, getNivelColor } from '../../utils/nivelMembresia'

interface NivelBadgeProps {
  nivel: string
  viajes?: number
  size?: 'sm' | 'md' | 'lg'
}

export const NivelBadge = ({ nivel, viajes, size = 'md' }: NivelBadgeProps) => {
  const config = getNivel(viajes ?? 0)
  const displayNivel = viajes !== undefined ? config : { label: getNivelLabel(nivel), nivel }
  const color = getNivelColor(nivel)

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  }[size]

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold font-syne ${sizeClasses}`}
      style={{
        backgroundColor: `${color}20`,
        color,
        border: `1px solid ${color}40`,
      }}
    >
      {viajes !== undefined ? config.label : getNivelLabel(nivel)}
    </span>
  )
}

function getNivelLabel(nivel: string): string {
  const map: Record<string, string> = {
    explorador: '✈ Explorador',
    viajero:    '🥈 Viajero',
    frecuente:  '🥇 Frecuente',
    elite:      '💎 Elite',
    vip:        '⭐ VIP',
  }
  return map[nivel] ?? nivel
}
