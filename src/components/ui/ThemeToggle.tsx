import { useTheme } from '../../context/ThemeContext'

interface ThemeToggleProps {
  compact?: boolean
}

export const ThemeToggle = ({ compact = false }: ThemeToggleProps) => {
  const { theme, toggle } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      onClick={toggle}
      title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      className="relative flex items-center rounded-full transition-all duration-300 focus:outline-none"
      style={{
        width: compact ? 36 : 44,
        height: compact ? 20 : 24,
        backgroundColor: isDark ? 'rgba(91,116,240,0.25)' : 'rgba(61,86,212,0.15)',
        border: `1px solid ${isDark ? 'rgba(91,116,240,0.4)' : 'rgba(61,86,212,0.3)'}`,
        padding: 2,
      }}
    >
      {/* Track icons */}
      <span
        className="absolute text-xs pointer-events-none"
        style={{ left: compact ? 5 : 6, opacity: isDark ? 0.9 : 0.3, fontSize: compact ? 9 : 10 }}
      >
        🌙
      </span>
      <span
        className="absolute text-xs pointer-events-none"
        style={{ right: compact ? 5 : 6, opacity: isDark ? 0.3 : 0.9, fontSize: compact ? 9 : 10 }}
      >
        ☀️
      </span>

      {/* Thumb */}
      <span
        className="rounded-full flex-shrink-0 transition-all duration-300"
        style={{
          width: compact ? 14 : 18,
          height: compact ? 14 : 18,
          backgroundColor: isDark ? '#5B74F0' : '#3D56D4',
          transform: isDark ? 'translateX(0)' : `translateX(${compact ? 16 : 20}px)`,
          boxShadow: isDark ? '0 0 6px rgba(91,116,240,0.6)' : '0 0 6px rgba(61,86,212,0.4)',
        }}
      />
    </button>
  )
}
