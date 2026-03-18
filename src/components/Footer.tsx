import Link from 'next/link'
import { Scissors } from 'lucide-react'

export function Footer() {
  const year = new Date().getFullYear()
  
  return (
    <footer className="py-20 border-t border-white/5 bg-zinc-950 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-2">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-6 h-6 bg-white flex items-center justify-center">
              <Scissors className="w-3 h-3 text-black" />
            </div>
            <span className="text-md font-light tracking-widest uppercase text-white">Intux Oc</span>
          </div>
          <p className="text-gray-600 font-light text-sm max-w-sm leading-relaxed">
            La plataforma SaaS líder para la gestión de servicios de belleza y cuidado personal en Latinoamérica.
          </p>
        </div>
        <div>
          <h5 className="text-[10px] tracking-widest uppercase text-white mb-8 font-light">Plataforma</h5>
          <div className="flex flex-col gap-4 text-xs font-light text-gray-500">
            <Link href="/" className="hover:text-white transition-colors">Características</Link>
            <Link href="/planes" className="hover:text-white transition-colors">Precios</Link>
            <Link href="/login" className="hover:text-white transition-colors">Acceso Admin</Link>
          </div>
        </div>
        <div>
          <h5 className="text-[10px] tracking-widest uppercase text-white mb-8 font-light">Legal</h5>
          <div className="flex flex-col gap-4 text-xs font-light text-gray-500">
            <Link href="/privacidad" className="hover:text-white transition-colors">Privacidad</Link>
            <Link href="/terminos" className="hover:text-white transition-colors">Términos</Link>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto pt-20 mt-20 border-t border-white/5 flex items-center justify-between">
        <p className="text-[10px] text-gray-600 tracking-widest uppercase font-light">
          &copy; {year} INTUX OC. ALL RIGHTS RESERVED.
        </p>
        <div className="flex gap-6">
           <div className="w-4 h-4 border border-white/10 rounded-full" />
           <div className="w-4 h-4 border border-white/10 rounded-full" />
        </div>
      </div>
    </footer>
  )
}