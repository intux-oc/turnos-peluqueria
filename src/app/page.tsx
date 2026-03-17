'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Toaster } from '@/components/ui/sonner'
import { User } from '@supabase/supabase-js'
import { 
  Calendar, 
  ChevronRight, 
  Clock, 
  CheckCircle, 
  Scissors, 
  Monitor, 
  ShieldCheck, 
  Zap, 
  Users, 
  BarChart3, 
  Palette,
  ArrowRight
} from 'lucide-react'

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
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black overflow-x-hidden">
      <Toaster theme="dark" position="bottom-right" />
      
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full px-6 py-6 border-b border-white/5 bg-black/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white flex items-center justify-center">
              <Scissors className="w-4 h-4 text-black" />
            </div>
            <span className="text-xl font-light tracking-widest uppercase">Intux Oc</span>
          </div>
          <div className="flex items-center gap-8">
            <Button 
              variant="ghost" 
              className="hidden md:flex text-[10px] tracking-widest uppercase font-light text-gray-500 hover:text-white"
              onClick={() => router.push('/login')}
            >
              Ingresar
            </Button>
            <Button 
              className="bg-white text-black hover:bg-gray-200 rounded-none text-[10px] tracking-widest uppercase font-light px-6"
              onClick={() => user ? router.push('/admin') : router.push('/planes')}
            >
              {user ? 'Mi Dashboard' : 'Registrar mi Negocio'}
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-48 pb-32 px-6 flex flex-col items-center justify-center min-h-screen text-center overflow-hidden">
        {/* Aesthetic background elements */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-white/5 rounded-full blur-[120px] pointer-events-none animate-pulse" />
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-20 pointer-events-none" />
        
        <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] tracking-[0.2em] uppercase mb-12 text-gray-400 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            La plataforma definitiva para Peluquerías
          </div>
          
          <h1 className="text-6xl md:text-[120px] font-light tracking-tighter mb-8 leading-[0.9] animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            SISTEMA DE<br />
            <span className="italic text-gray-500 font-serif">Gestión Premium</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-400 mb-16 max-w-2xl font-light leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            Digitaliza tu salón, optimiza tus turnos y ofrece una experiencia de reserva de élite a tus clientes. Todo en un solo lugar.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
            <Button 
              size="lg" 
              className="h-16 px-12 text-xs tracking-[0.2em] uppercase bg-white text-black hover:bg-gray-200 transition-all rounded-none group"
              onClick={() => user ? router.push('/admin') : router.push('/planes')}
            >
              Comenzar Ahora
              <ArrowRight className="w-4 h-4 ml-3 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <Button 
              size="lg" 
              variant="outline" 
              className="h-16 px-12 text-xs tracking-[0.2em] uppercase border-white/10 hover:bg-white/5 transition-all rounded-none"
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Ver Funciones
            </Button>
          </div>
        </div>

        {/* Floating preview badge */}
        <div className="mt-24 w-full max-w-5xl border border-white/10 bg-zinc-900/30 backdrop-blur-2xl p-4 sm:p-2 rounded-none animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-700">
          <div className="aspect-video w-full bg-black/50 border border-white/5 flex flex-col items-center justify-center relative overflow-hidden group">
             <Monitor className="w-20 h-20 text-white/10 group-hover:scale-110 transition-transform duration-1000" strokeWidth={0.5} />
             <div className="absolute inset-0 bg-linear-to-t from-black via-transparent to-transparent opacity-60" />
             <div className="absolute bottom-8 left-8 text-left">
                <p className="text-[10px] tracking-widest uppercase text-gray-500 mb-2">Panel de Control</p>
                <h4 className="text-xl font-light uppercase tracking-widest">Dashboard de Administrador</h4>
             </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 bg-zinc-950 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-28">
            <h2 className="text-4xl md:text-5xl font-light tracking-tighter mb-6 uppercase">Potencia tu Salón</h2>
            <div className="h-0.5 w-24 bg-white mx-auto mb-8" />
            <p className="text-gray-500 text-lg max-w-2xl mx-auto font-light leading-relaxed">
              Hemos diseñado cada funcionalidad pensando en los retos diarios de los dueños de peluquerías modernas.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-px bg-white/5 border border-white/5">
            {[
              {
                icon: <Calendar className="w-8 h-8" />,
                title: "Gestión Multi-Turno",
                desc: "Agenda inteligente con vista diaria y semanal. Olvídate de los cuadernos y los errores humanos."
              },
              {
                icon: <ShieldCheck className="w-8 h-8" />,
                title: "Double Booking Zero",
                desc: "Nuestra tecnología de base de datos impide físicamente que dos personas reserven el mismo horario exacto."
              },
              {
                icon: <Palette className="w-8 h-8" />,
                title: "Branding Personalizado",
                desc: "Carga tu logo y elige tus colores. Tu página de reserva será una extensión de tu marca."
              },
              {
                icon: <Users className="w-8 h-8" />,
                title: "Control de Empleados",
                desc: "Cada profesional tiene su propio calendario y acceso. Monitorea el rendimiento de tu equipo."
              },
              {
                icon: <Zap className="w-8 h-8" />,
                title: "Reserva SaaS Rápida",
                desc: "Url única para tu negocio (ej: /b/tu-salon). Tus clientes reservan en menos de 30 segundos."
              },
              {
                icon: <BarChart3 className="w-8 h-8" />,
                title: "Reportes en Vivo",
                desc: "Visualiza tus ingresos diarios y estadísticas de servicios más pedidos en tiempo real."
              }
            ].map((f, i) => (
              <div key={i} className="bg-black p-12 hover:bg-zinc-900/50 transition-colors duration-500 group">
                <div className="mb-8 text-gray-600 group-hover:text-white transition-colors duration-500">
                  {f.icon}
                </div>
                <h3 className="text-xl font-light mb-4 tracking-widest uppercase">{f.title}</h3>
                <p className="text-gray-500 font-light leading-relaxed text-sm">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof / Call to Action */}
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

      {/* Footer */}
      <footer className="py-20 border-t border-white/5 bg-zinc-950 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-8">
              <div className="w-6 h-6 bg-white flex items-center justify-center">
                <Scissors className="w-3 h-3 text-black" />
              </div>
              <span className="text-md font-light tracking-widest uppercase">Intux Oc</span>
            </div>
            <p className="text-gray-600 font-light text-sm max-w-sm leading-relaxed">
              La plataforma SaaS líder para la gestión de servicios de belleza y cuidado personal en Latinoamérica.
            </p>
          </div>
          <div>
            <h5 className="text-[10px] tracking-widest uppercase text-white mb-8 font-light">Plataforma</h5>
            <div className="flex flex-col gap-4 text-xs font-light text-gray-500">
              <span className="hover:text-white cursor-pointer transition-colors">Características</span>
              <span className="hover:text-white cursor-pointer transition-colors">Precios</span>
              <span className="hover:text-white cursor-pointer transition-colors">Seguridad</span>
            </div>
          </div>
          <div>
            <h5 className="text-[10px] tracking-widest uppercase text-white mb-8 font-light">Legal</h5>
            <div className="flex flex-col gap-4 text-xs font-light text-gray-500">
              <span className="hover:text-white cursor-pointer transition-colors">Privacidad</span>
              <span className="hover:text-white cursor-pointer transition-colors">Términos</span>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-20 mt-20 border-t border-white/5 flex items-center justify-between">
          <p className="text-[10px] text-gray-600 tracking-widest uppercase">
            &copy; {new Date().getFullYear()} INTUX OC. ALL RIGHTS RESERVED.
          </p>
          <div className="flex gap-6">
             {/* Social placeholders */}
             <div className="w-4 h-4 border border-white/10 rounded-full" />
             <div className="w-4 h-4 border border-white/10 rounded-full" />
          </div>
        </div>
      </footer>
    </div>
  )
}
