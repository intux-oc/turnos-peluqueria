'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Toaster } from '@/components/ui/sonner'
import { User } from '@supabase/supabase-js'
import { Calendar, User as UserIcon, LogIn, ChevronRight, Star, Clock, CheckCircle, Scissors, Sparkles } from 'lucide-react'

export default function Home() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user as User)
      setLoading(false)
    })
  }, [supabase.auth])

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black">
      <Toaster theme="dark" />
      
      {/* Hero Section */}
      <section className="relative py-32 px-6 flex flex-col items-center justify-center min-h-[80vh] text-center overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/2 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm tracking-widest uppercase mb-12 text-gray-400">
            <span className="w-2 h-2 rounded-full bg-white" />
            Cuidado Capilar Premium
          </div>
          
          <h1 className="text-6xl md:text-8xl font-light tracking-tighter mb-8 leading-tight">
            ELEVA TU<br />
            <span className="font-serif italic text-gray-400">Estilo</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl font-light leading-relaxed">
            Experimenta los mejores servicios de peluquería y estética en un entorno minimalista y premium. Reserva tu sesión exclusiva hoy mismo.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto">
            <Button 
              size="lg" 
              className="h-16 px-10 text-sm tracking-widest uppercase bg-white text-black hover:bg-gray-200 transition-all hover:scale-105 rounded-none"
              onClick={() => user ? router.push('/turnos/nuevo') : router.push('/login')}
            >
              <Calendar className="w-5 h-5 mr-3" />
              {user ? 'Agendar mi turno' : 'Ingresar para Reservar'}
            </Button>
            
            <Button 
              size="lg" 
              variant="outline" 
              className="h-16 px-10 text-sm tracking-widest uppercase border-white/20 hover:bg-white hover:text-black transition-all rounded-none"
              onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Nuestros Servicios
            </Button>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-32 bg-zinc-950 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-5xl font-light tracking-tighter mb-6 uppercase">Servicios</h2>
              <p className="text-gray-400 text-lg md:text-xl font-light leading-relaxed">
                Tratamientos seleccionados a medida de tu estilo y personalidad. Utilizamos exclusivamente productos de alta gama para asegurar resultados excepcionales.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Service 1 */}
            <div className="group border border-white/10 p-10 hover:bg-white/5 transition-colors duration-500">
              <div className="mb-8 p-4 bg-white/5 inline-block rounded-none border border-white/10">
                <Scissors className="w-8 h-8 font-extralight text-white group-hover:rotate-12 transition-transform duration-500" strokeWidth={1} />
              </div>
              <h3 className="text-2xl font-light mb-4 tracking-wide uppercase">Corte Signature</h3>
              <p className="text-gray-400 font-light leading-relaxed mb-8">
                Asesoramiento personalizado, corte de precisión y peinado adaptado a la forma de tu rostro y textura del cabello.
              </p>
              <div className="text-sm tracking-widest uppercase text-gray-500 flex items-center gap-2 group-hover:text-white transition-colors duration-500">
                Explorar
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>

            {/* Service 2 */}
            <div className="group border border-white/10 p-10 hover:bg-white/5 transition-colors duration-500">
              <div className="mb-8 p-4 bg-white/5 inline-block rounded-none border border-white/10">
                <Sparkles className="w-8 h-8 font-extralight text-white group-hover:rotate-12 transition-transform duration-500" strokeWidth={1} />
              </div>
              <h3 className="text-2xl font-light mb-4 tracking-wide uppercase">Color y Tono</h3>
              <p className="text-gray-400 font-light leading-relaxed mb-8">
                Servicios de color a medida, desde reflejos sutiles hasta transformaciones completas utilizando tinturas de primer nivel.
              </p>
              <div className="text-sm tracking-widest uppercase text-gray-500 flex items-center gap-2 group-hover:text-white transition-colors duration-500">
                Explorar
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>

            {/* Service 3 */}
            <div className="group border border-white/10 p-10 hover:bg-white/5 transition-colors duration-500">
              <div className="mb-8 p-4 bg-white/5 inline-block rounded-none border border-white/10">
                <Star className="w-8 h-8 font-extralight text-white group-hover:rotate-12 transition-transform duration-500" strokeWidth={1} />
              </div>
              <h3 className="text-2xl font-light mb-4 tracking-wide uppercase">Estilo y Acabado</h3>
              <p className="text-gray-400 font-light leading-relaxed mb-8">
                Modelado profesional y peinados para eventos especiales o simplemente para brillar en tu mejor versión.
              </p>
              <div className="text-sm tracking-widest uppercase text-gray-500 flex items-center gap-2 group-hover:text-white transition-colors duration-500">
                Explorar
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights / Features */}
      <section className="py-32 bg-black border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-light tracking-tighter mb-10 leading-tight uppercase">
                LA EXPERIENCIA<br />PELUQUERÍA
              </h2>
              
              <div className="space-y-8">
                <div className="flex gap-6">
                  <div className="mt-1">
                    <CheckCircle className="w-6 h-6 text-white" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h4 className="text-xl font-light mb-2 uppercase">Estilistas Expertos</h4>
                    <p className="text-gray-400 font-light leading-relaxed">Nuestro equipo está formado por profesionales altamente capacitados y apasionados por su arte.</p>
                  </div>
                </div>
                
                <div className="flex gap-6">
                  <div className="mt-1">
                    <CheckCircle className="w-6 h-6 text-white" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h4 className="text-xl font-light mb-2 uppercase">Productos Premium</h4>
                    <p className="text-gray-400 font-light leading-relaxed">Utilizamos exclusivamente productos de grado profesional para todos nuestros tratamientos.</p>
                  </div>
                </div>
                
                <div className="flex gap-6">
                  <div className="mt-1">
                    <Clock className="w-6 h-6 text-white" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h4 className="text-xl font-light mb-2 uppercase">Reservas Ágiles</h4>
                    <p className="text-gray-400 font-light leading-relaxed">Gestioná tus turnos sin esfuerzo a través de nuestra plataforma digital optimizada.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="hidden md:flex justify-end">
              <div className="w-full max-w-md aspect-4/5 bg-zinc-900 border border-white/10 relative overflow-hidden group">
                 {/* Placeholder for an aesthetic salon image */}
                 <div className="absolute inset-0 bg-linear-to-tr from-black/80 to-transparent z-10" />
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-32 h-32 rounded-full border border-white/20 group-hover:scale-110 transition-transform duration-700 z-20">
                    <span className="text-xs tracking-widest uppercase font-light text-white/70">Est. 2024</span>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10 bg-black text-center">
        <p className="text-gray-500 font-light text-sm tracking-widest uppercase">
          &copy; {new Date().getFullYear()} Peluquería. Todos los derechos reservados.
        </p>
      </footer>
    </div>
  )
}
