import { getNivel, getProgreso, getNivelColor, NIVELES } from '../../utils/nivelMembresia'

interface ProgresoNivelProps {
  viajesRealizados: number
  compact?: boolean
}

export const ProgresoNivel = ({ viajesRealizados, compact = false }: ProgresoNivelProps) => {
  const actual = getNivel(viajesRealizados)
  const { pct, faltan, siguiente } = getProgreso(viajesRealizados)
  const colorActual = getNivelColor(actual.nivel)
  const idxActual = NIVELES.indexOf(actual)
  const siguiente_config = NIVELES[idxActual + 1]
  const colorSiguiente = siguiente_config ? getNivelColor(siguiente_config.nivel) : colorActual

  if (actual.nivel === 'vip') {
    return (
      <div className={compact ? '' : 'space-y-2'}>
        <div className="flex items-center justify-between text-sm mb-1">
          <span style={{ color: colorActual }} className="font-semibold">⭐ VIP</span>
          <span className="text-sb-muted">Nivel máximo</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden bg-sb-bg3">
          <div className="h-full rounded-full w-full" style={{ background: colorActual }} />
        </div>
        <p className="text-sb-muted text-xs">¡Nivel máximo alcanzado! Disfrutas 20% de descuento.</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {!compact && (
        <div className="flex items-center justify-between text-sm">
          <span style={{ color: colorActual }} className="font-semibold">{actual.label}</span>
          <span className="text-sb-muted">{siguiente ?? ''}</span>
        </div>
      )}
      <div className="h-2.5 rounded-full overflow-hidden bg-sb-bg3 relative">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${colorActual}, ${colorSiguiente})`,
          }}
        />
      </div>
      {!compact && (
        <div className="flex items-center justify-between text-xs text-sb-muted">
          <span>{viajesRealizados} viajes realizados</span>
          {faltan > 0 && siguiente && (
            <span>Te faltan <strong className="text-sb-text">{faltan}</strong> para {siguiente}</span>
          )}
        </div>
      )}
    </div>
  )
}
