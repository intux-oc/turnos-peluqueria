'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Toaster } from '@/components/ui/sonner'
import { User } from '@supabase/supabase-js'
import { Scissors, Sparkles, CalendarCheck } from 'lucide-react'

export default function Home() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
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
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <Toaster theme="dark" />
      
      {/* Hero Section */}
      <section className="relative flex-1 flex flex-col items-center justify-center overflow-hidden py-24 px-4 bg-background">
        {/* Background glow effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="relative z-10 text-center max-w-4xl mx-auto flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium mb-8 text-primary backdrop-blur-sm">
            <Sparkles className="h-4 w-4" />
            <span>Elevando tu estilo al próximo nivel</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-foreground">
            El arte de un <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-amber-500">corte perfecto</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl font-light">
            Experimenta el mejor servicio de peluquería y barbería premium. Reserva tu turno online en segundos.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Button 
              size="lg" 
              className="h-14 px-8 text-lg rounded-xl shadow-[0_0_30px_-5px] shadow-primary/30 transition-all hover:scale-105"
              onClick={() => user ? router.push('/turnos') : router.push('/login')}
            >
               {user ? 'Agendar mi turno' : 'Ingresar para Reservar'}
            </Button>
            {!user && (
              <Button 
                size="lg" 
                variant="outline" 
                className="h-14 px-8 text-lg rounded-xl bg-white/5 hover:bg-white/10 border-white/10"
                onClick={() => router.push('/login')}
              >
                Crear cuenta
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Services/Features Section */}
      <section className="py-24 bg-card/30 border-t border-white/5 relative z-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
             <h2 className="text-3xl md:text-4xl font-bold mb-4">Servicios Destacados</h2>
             <p className="text-muted-foreground text-lg">Todo lo que necesitas para tu mejor versión</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-white/5 border-white/10 backdrop-blur-md transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/20 group">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/20 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                  <Scissors className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl">Cortes Modernos</CardTitle>
                <CardDescription className="text-muted-foreground/80">
                  Asesoramiento personalizado y los mejores estilos para tu look de acuerdo a tus facciones.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white/5 border-white/10 backdrop-blur-md transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/20 group">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/20 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                  <Sparkles className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl">Color y Estilo</CardTitle>
                <CardDescription className="text-muted-foreground/80">
                  Transformá tu imagen con expertos en colorimetría, mechas, tinturas y tratamientos capilares.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white/5 border-white/10 backdrop-blur-md transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/20 group">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/20 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                  <CalendarCheck className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl">Turnos 24/7</CardTitle>
                <CardDescription className="text-muted-foreground/80">
                  Gestioná tus turnos desde la comodidad de tu casa, en cualquier momento del día.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
