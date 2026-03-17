import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import api from '../api'

interface CurrencyContextType {
  moneda: 'MXN' | 'USD'
  setMoneda: (m: 'MXN' | 'USD') => void
  mxnPerUsd: number
  formatPrice: (amount: number | string, sourceCurrency?: 'MXN' | 'USD') => string
  convertPrice: (amount: number | string, sourceCurrency?: 'MXN' | 'USD') => number
}

const CurrencyContext = createContext<CurrencyContextType>({
  moneda: 'MXN',
  setMoneda: () => {},
  mxnPerUsd: 17.5,
  formatPrice: (a) => `$${Number(a).toLocaleString('es-MX')} MXN`,
  convertPrice: (a) => Number(a),
})

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [moneda, setMonedaState] = useState<'MXN' | 'USD'>(() => {
    return (localStorage.getItem('sb_moneda') as 'MXN' | 'USD') ?? 'MXN'
  })
  const [mxnPerUsd, setMxnPerUsd] = useState(17.5)

  useEffect(() => {
    api.get('/config/tipo-cambio')
      .then(r => setMxnPerUsd(r.data.data.mxn_per_usd))
      .catch(() => {})
  }, [])

  const setMoneda = (m: 'MXN' | 'USD') => {
    setMonedaState(m)
    localStorage.setItem('sb_moneda', m)
  }

  const convertPrice = (amount: number | string, sourceCurrency: 'MXN' | 'USD' = 'MXN'): number => {
    const n = Number(amount)
    if (sourceCurrency === moneda) return n
    if (sourceCurrency === 'MXN' && moneda === 'USD') return Math.round((n / mxnPerUsd) * 100) / 100
    return Math.round(n * mxnPerUsd * 100) / 100
  }

  const formatPrice = (amount: number | string, sourceCurrency: 'MXN' | 'USD' = 'MXN'): string => {
    const converted = convertPrice(amount, sourceCurrency)
    if (moneda === 'USD') {
      return `$${converted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`
    }
    return `$${converted.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} MXN`
  }

  return (
    <CurrencyContext.Provider value={{ moneda, setMoneda, mxnPerUsd, formatPrice, convertPrice }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export const useCurrency = () => useContext(CurrencyContext)
