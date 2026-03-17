import { useState, useEffect } from 'react'
import api from '../../api'
import type { Reservacion } from '../../types'
import { NavbarPublico } from '../../components/layout/NavbarPublico'
import { Footer } from '../../components/layout/Footer'
import { ReservaCard } from '../../components/reservaciones/ReservaCard'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { EmptyState } from '../../components/ui/EmptyState'

const TABS = ['todas', 'confirmada', 'completada', 'cancelada'] as const
type Tab = typeof TABS[number]

export default function MisReservas() {
  const [reservas, setReservas] = useState<Reservacion[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('todas')

  useEffect(() => {
    api.get('/reservaciones/mis-reservas')
      .then(r => setReservas(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtradas = tab === 'todas' ? reservas : reservas.filter(r => r.estado === tab)

  return (
    <div className="min-h-screen">
      <NavbarPublico />
      <div className="pt-24 pb-20 px-4 max-w-3xl mx-auto">
        <h1 className="font-syne font-bold text-2xl text-sb-text mb-6">Mis reservaciones</h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all capitalize ${
                tab === t ? 'bg-sb-blue text-white' : 'text-sb-muted hover:text-sb-text'
              }`}
              style={tab !== t ? { border: '1px solid var(--sb-border2)' } : {}}
            >
              {t === 'todas' ? 'Todas' : t.charAt(0).toUpperCase() + t.slice(1) + 's'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
        ) : filtradas.length === 0 ? (
          <EmptyState icon="🎫" title="Sin reservaciones" description="No tienes reservaciones en esta categoría." />
        ) : (
          <div className="space-y-3">
            {filtradas.map(r => <ReservaCard key={r.id} reserva={r} />)}
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
