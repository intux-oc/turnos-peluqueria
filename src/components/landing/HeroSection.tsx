'use client'

import { Button } from '@/components/ui/button'
import { ArrowRight, Monitor } from 'lucide-react'
import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

interface HeroSectionProps {
  user: User | null
}

export function HeroSection({ user }: HeroSectionProps) {
  const router = useRouter()
  
  return (
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

      {/* Floating preview badge with premium image */}
      <div className="mt-24 w-full max-w-5xl border border-white/10 bg-zinc-900/30 backdrop-blur-2xl p-4 sm:p-2 rounded-none animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-700">
        <div className="aspect-video w-full bg-black/50 border border-white/5 flex flex-col items-center justify-center relative overflow-hidden group">
           <img 
             src="/hero-bw.png" 
             alt="Premium Dashboard" 
             className="absolute inset-0 w-full h-full object-cover grayscale opacity-60 group-hover:scale-105 transition-transform duration-1000"
           />
           <div className="absolute inset-0 bg-linear-to-t from-black via-transparent to-transparent opacity-80" />
           <div className="absolute bottom-8 left-8 text-left z-10">
              <p className="text-[10px] tracking-widest uppercase text-gray-500 mb-2 font-light">Experiencia de Elite</p>
              <h4 className="text-xl font-light uppercase tracking-widest">Dashboard de Administrador</h4>
           </div>
        </div>
      </div>
    </section>
  )
}
