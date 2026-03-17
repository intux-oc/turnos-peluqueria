import Link from 'next/link'
import { Scissors } from 'lucide-react'

// Componente Server: solo rendering estático, carga ultra-rápida
export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-black">
            <Scissors className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white uppercase">
            Peluquería
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm font-medium text-gray-400 hover:text-white">
            Inicio
          </Link>
          <Link href="/planes" className="text-sm font-medium text-gray-400 hover:text-white">
            Planes
          </Link>
          <Link href="/login" className="text-sm font-medium text-gray-400 hover:text-white">
            Admin
          </Link>
        </nav>
      </div>
    </header>
  )
}