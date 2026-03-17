import { Link } from 'react-router-dom'

export const Footer = () => (
  <footer className="border-t mt-20" style={{ borderColor: 'var(--sb-border)', backgroundColor: 'var(--sb-bg2)' }}>
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="font-syne font-extrabold text-xl mb-2">
            <span className="text-sb-text">STAR</span>
            <span style={{ color: 'var(--sb-blue-lt)' }}>BLUE★</span>
          </div>
          <p className="text-sb-muted text-sm max-w-xs">
            Boletos de autobús entre México y Estados Unidos. Rutas directas, precios claros.
          </p>
        </div>
        <div className="flex flex-wrap gap-6 text-sm text-sb-muted">
          <Link to="/destinos"  className="hover:text-sb-text transition-colors">Destinos</Link>
          <Link to="/horarios"  className="hover:text-sb-text transition-colors">Horarios</Link>
          <Link to="/niveles"   className="hover:text-sb-text transition-colors">Membresías</Link>
          <Link to="/buscar"    className="hover:text-sb-text transition-colors">Buscar viajes</Link>
          <Link to="/login"     className="hover:text-sb-text transition-colors">Mi cuenta</Link>
        </div>
      </div>
      <div className="mt-8 pt-6 border-t flex items-center justify-between text-xs text-sb-muted"
        style={{ borderColor: 'var(--sb-border)' }}>
        <span>© 2026 StarBlue. Todos los derechos reservados.</span>
        <div className="flex gap-4">
          <a href="#" className="hover:text-sb-text transition-colors">Privacidad</a>
          <a href="#" className="hover:text-sb-text transition-colors">Términos</a>
        </div>
      </div>
    </div>
  </footer>
)
