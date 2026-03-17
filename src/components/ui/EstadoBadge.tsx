interface EstadoBadgeProps {
  estado: string
  size?: 'sm' | 'md'
}

const ESTADO_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  confirmada:  { label: 'Confirmada',  color: '#22C55E', bg: 'rgba(34,197,94,0.15)' },
  pendiente:   { label: 'Pendiente',   color: '#F59E0B', bg: 'rgba(245,158,11,0.15)' },
  completada:  { label: 'Completada',  color: '#5B74F0', bg: 'rgba(91,116,240,0.15)' },
  cancelada:   { label: 'Cancelada',   color: '#EF4444', bg: 'rgba(239,68,68,0.15)' },
  en_ruta:     { label: 'En ruta',     color: '#06B6D4', bg: 'rgba(6,182,212,0.15)' },
  programado:  { label: 'Programado',  color: '#5B74F0', bg: 'rgba(91,116,240,0.15)' },
  cancelado:   { label: 'Cancelado',   color: '#EF4444', bg: 'rgba(239,68,68,0.15)' },
}

export const EstadoBadge = ({ estado, size = 'md' }: EstadoBadgeProps) => {
  const cfg = ESTADO_CONFIG[estado] ?? { label: estado, color: '#8891A8', bg: 'rgba(136,145,168,0.15)' }
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1'

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold font-syne ${sizeClass}`}
      style={{ color: cfg.color, backgroundColor: cfg.bg, border: `1px solid ${cfg.color}40` }}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 flex-shrink-0" style={{ backgroundColor: cfg.color }} />
      {cfg.label}
    </span>
  )
}
