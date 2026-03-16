'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Toaster } from '@/components/ui/sonner'

export default function Home() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setLoading(false)
    })
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
    setUser(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="animate-pulse text-white text-xl">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Toaster />
      
      {/* Header */}
      <header className="backdrop-blur-md bg-white/10 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            ✂️ <span className="hidden sm:inline">Peluquería</span>
          </h1>
          <nav className="flex gap-2">
            {user ? (
              <>
                <Button 
                  variant="ghost" 
                  className="text-white hover:bg-white/20" 
                  onClick={() => router.push('/mis-turnos')}
                >
                  Mis Turnos
                </Button>
                <Button 
                  variant="ghost" 
                  className="text-white hover:bg-white/20" 
                  onClick={() => router.push('/perfil')}
                >
                  Perfil
                </Button>
                {(user.email === 'admin@intux.com' || user.email === 'admin@peluqueria.com') && (
                  <Button 
                    variant="ghost" 
                    className="text-white hover:bg-white/20" 
                    onClick={() => router.push('/admin')}
                  >
                    Admin
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                  onClick={handleSignOut}
                >
                  Cerrar
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  className="text-white hover:bg-white/20" 
                  onClick={() => router.push('/login')}
                >
                  Iniciar Sesión
                </Button>
                <Button 
                  className="bg-purple-500 hover:bg-purple-600 text-white"
                  onClick={() => router.push('/login')}
                >
                  Reservar Turno
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main>
        <section className="py-20 px-4 text-center">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Tu estilo, <span className="text-purple-400">nuestra pasión</span>
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Reservá tu turno de manera fácil y rápida. Te esperamos con los mejores profesionales y servicios de peluquería.
          </p>
          <Button 
            size="lg" 
            className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-6 text-lg"
            onClick={() => user ? router.push('/turnos/nuevo') : router.push('/login')}
          >
            {user ? '📅 Reservar Ahora' : '🚀 Reservar Turno'}
          </Button>
        </section>

        {/* Features */}
        <section className="py-16 px-4 bg-white/5">
          <div className="max-w-6xl mx-auto">
            <h3 className="text-3xl font-bold text-white text-center mb-12">
              ¿Por qué elegirnos?
            </h3>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="bg-white/10 border-white/20 text-white backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    ⏰ <span>Agenda 24/7</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">Reservá cuando quieras, desde cualquier lugar. Sin llamar, sin esperar.</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/10 border-white/20 text-white backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    ✨ <span>Profesionales</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">Nuestro equipo de expertos te recomienda el mejor look para vos.</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/10 border-white/20 text-white backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    🎁 <span>Beneficios</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">Descuentos exclusivos para clientes frecuentes y referidos.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Services Preview */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-3xl font-bold text-white mb-8">
              Nuestros Servicios
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { name: 'Corte', icon: '✂️' },
                { name: 'Barba', icon: '🧔' },
                { name: 'Color', icon: '🎨' },
                { name: 'Mechas', icon: '✨' },
                { name: 'Tratamiento', icon: '💆' },
                { name: 'Peinado', icon: '💇' },
              ].map((service) => (
                <div 
                  key={service.name}
                  className="bg-white/10 rounded-xl p-6 text-white hover:bg-white/20 transition cursor-pointer"
                  onClick={() => user ? router.push('/turnos/nuevo') : router.push('/login')}
                >
                  <span className="text-4xl block mb-2">{service.icon}</span>
                  <span className="font-medium">{service.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-4 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">
            ¿Listo para verte increíble?
          </h3>
          <Button 
            size="lg" 
            className="bg-purple-500 hover:bg-purple-600 text-white px-8"
            onClick={() => user ? router.push('/turnos/nuevo') : router.push('/login')}
          >
            {user ? 'Ver Mis Turnos' : 'Crear Cuenta'}
          </Button>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-white/10 text-center text-gray-400">
        <p>© 2026 Peluquería. Todos los derechos reservados.</p>
      </footer>
    </div>
  )
}
