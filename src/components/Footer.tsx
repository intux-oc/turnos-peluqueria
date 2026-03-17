import Link from 'next/link'

// Componente Server: contenido estático
export function Footer() {
  const year = new Date().getFullYear()
  
  return (
    <footer className="border-t border-white/10 bg-black py-8">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Peluquería SaaS</h3>
            <p className="text-sm text-gray-500">
              Sistema de gestión de turnos para peluquerías modernas.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Navegación</h4>
            <nav className="space-y-2">
              <Link href="/" className="block text-sm text-gray-500 hover:text-white">
                Inicio
              </Link>
              <Link href="/planes" className="block text-sm text-gray-500 hover:text-white">
                Planes
              </Link>
              <Link href="/login" className="block text-sm text-gray-500 hover:text-white">
                Admin
              </Link>
            </nav>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Legal</h4>
            <nav className="space-y-2">
              <Link href="/terminos" className="block text-sm text-gray-500 hover:text-white">
                Términos
              </Link>
              <Link href="/privacidad" className="block text-sm text-gray-500 hover:text-white">
                Privacidad
              </Link>
            </nav>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/10 text-center">
          <p className="text-xs text-gray-600">
            © {year} Peluquería SaaS. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}