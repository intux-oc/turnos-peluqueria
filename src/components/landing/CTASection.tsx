'use client'

import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export function CTASection() {
  const router = useRouter()
  
  return (
    <section className="py-48 px-6 bg-black relative">
      <div className="max-w-4xl mx-auto text-center border border-white/10 p-20 bg-linear-to-b from-zinc-900/50 to-transparent">
        <h2 className="text-4xl md:text-6xl font-light tracking-tighter mb-12 uppercase leading-tight">
          DEJA LAS RESERVAS <br />EN <span className="italic font-serif text-gray-500">Piloto Automático</span>
        </h2>
        <p className="text-gray-400 text-lg mb-12 font-light max-w-xl mx-auto">
          Únete a la nueva generación de peluquerías que ya están escalando su negocio con Intux Oc.
        </p>
        <Button 
          size="lg" 
          className="h-16 px-12 text-xs tracking-[0.2em] uppercase bg-white text-black hover:bg-gray-200 transition-all rounded-none"
          onClick={() => router.push('/planes')}
        >
          Registrar mi Business
        </Button>
      </div>
    </section>
  )
}
