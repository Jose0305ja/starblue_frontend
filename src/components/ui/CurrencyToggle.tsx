import { useCurrency } from '../../context/CurrencyContext'

interface CurrencyToggleProps {
  compact?: boolean
}

export const CurrencyToggle = ({ compact = false }: CurrencyToggleProps) => {
  const { moneda, setMoneda, mxnPerUsd } = useCurrency()

  if (compact) {
    return (
      <div className="flex items-center gap-0.5 rounded-lg p-0.5"
        style={{ backgroundColor: 'var(--sb-badge-bg)', border: '1px solid var(--sb-border)' }}>
        <button
          onClick={() => setMoneda('MXN')}
          className="px-2 py-0.5 rounded-md text-xs font-bold transition-all"
          style={moneda === 'MXN'
            ? { backgroundColor: 'var(--sb-blue)', color: 'white' }
            : { color: 'var(--sb-muted)' }
          }
        >
          MXN
        </button>
        <button
          onClick={() => setMoneda('USD')}
          className="px-2 py-0.5 rounded-md text-xs font-bold transition-all"
          style={moneda === 'USD'
            ? { backgroundColor: 'var(--sb-blue)', color: 'white' }
            : { color: 'var(--sb-muted)' }
          }
        >
          USD
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1 rounded-lg p-0.5"
      style={{ backgroundColor: 'var(--sb-badge-bg)', border: '1px solid var(--sb-border)' }}>
      <button
        onClick={() => setMoneda('MXN')}
        className="px-2.5 py-1 rounded-md text-xs font-bold transition-all"
        style={moneda === 'MXN'
          ? { backgroundColor: 'var(--sb-blue)', color: 'white' }
          : { color: 'var(--sb-muted)' }
        }
      >
        MXN
      </button>
      <button
        onClick={() => setMoneda('USD')}
        className="px-2.5 py-1 rounded-md text-xs font-bold transition-all"
        style={moneda === 'USD'
          ? { backgroundColor: 'var(--sb-blue)', color: 'white' }
          : { color: 'var(--sb-muted)' }
        }
      >
        USD
      </button>
      <span className="text-xs pl-1 pr-1.5" style={{ color: 'var(--sb-muted)', borderLeft: '1px solid var(--sb-border)' }}>
        {mxnPerUsd.toFixed(1)}
      </span>
    </div>
  )
}
