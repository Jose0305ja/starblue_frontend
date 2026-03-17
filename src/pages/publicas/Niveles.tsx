import { NavbarPublico } from '../../components/layout/NavbarPublico'
import { Footer } from '../../components/layout/Footer'
import { NivelBadge } from '../../components/ui/NivelBadge'
import { NIVELES, getNivelColor } from '../../utils/nivelMembresia'
import { Link } from 'react-router-dom'

export default function Niveles() {
  return (
    <div className="min-h-screen">
      <NavbarPublico />
      <div className="pt-24 pb-20 px-4 max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <span className="text-xs font-bold text-sb-purple uppercase tracking-widest">Sistema de membresías</span>
          <h1 className="font-syne font-extrabold text-4xl md:text-5xl text-sb-text mt-3 mb-4">
            Viaja más, <span className="text-gradient">paga menos</span>
          </h1>
          <p className="text-sb-muted text-lg max-w-2xl mx-auto">
            Tu nivel sube automáticamente con cada viaje. Sin cuotas, sin pagos adicionales.
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-4 mb-16">
          {NIVELES.map((nivel, idx) => {
            const color = getNivelColor(nivel.nivel)
            return (
              <div
                key={nivel.nivel}
                className="card p-5 text-center relative overflow-hidden"
                style={idx === 4 ? { borderColor: `${color}40`, boxShadow: `0 0 20px ${color}20` } : {}}
              >
                {idx === 4 && (
                  <div
                    className="absolute inset-0 opacity-5"
                    style={{ background: `radial-gradient(circle at center, ${color}, transparent 70%)` }}
                  />
                )}
                <p className="text-2xl mb-3">{nivel.label.split(' ')[0]}</p>
                <NivelBadge nivel={nivel.nivel} />
                <div className="mt-4 space-y-2">
                  <p className="font-mono-sb font-bold text-2xl" style={{ color }}>
                    {nivel.descuento > 0 ? `-${nivel.descuento}%` : '—'}
                  </p>
                  <p className="text-xs text-sb-muted">descuento</p>
                  <p className="text-xs text-sb-muted mt-2">
                    {nivel.max === Infinity ? `${nivel.min}+ viajes` : `${nivel.min}–${nivel.max} viajes`}
                  </p>
                </div>
                <ul className="mt-4 space-y-1.5 text-left">
                  {nivel.beneficios?.map(b => (
                    <li key={b} className="text-xs text-sb-muted flex items-start gap-1.5">
                      <span style={{ color }} className="mt-0.5 flex-shrink-0">✓</span>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>

        <div className="card p-8 text-center">
          <h2 className="font-syne font-bold text-2xl text-sb-text mb-3">¿Cómo funciona?</h2>
          <p className="text-sb-muted mb-6 max-w-lg mx-auto">
            Cada reservación completada suma un viaje a tu contador. Al alcanzar el umbral, tu nivel sube automáticamente y el descuento se aplica en tu próxima compra.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link to="/registro" className="btn-primary px-8 py-3">Crear cuenta gratis</Link>
            <Link to="/buscar" className="btn-secondary px-8 py-3">Ver viajes disponibles</Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
