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
      <div className="min-h-screen flex items-center justify-center">
        <p>Cargando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Toaster />
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">💈 Turnos Peluquería</h1>
          <nav className="flex gap-4">
            {user ? (
              <>
                <Button variant="ghost" onClick={() => router.push('/mis-turnos')}>
                  Mis Turnos
                </Button>
                <Button variant="ghost" onClick={() => router.push('/perfil')}>
                  Perfil
                </Button>
                {user.email === 'admin@intux.com' && (
                  <Button variant="ghost" onClick={() => router.push('/admin')}>
                    Admin
                  </Button>
                )}
                <Button variant="outline" onClick={handleSignOut}>
                  Cerrar Sesión
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={() => router.push('/login')}>
                  Iniciar Sesión
                </Button>
                <Button onClick={() => router.push('/login')}>
                  Reservar Turno
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        <section className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Reserva tu turno fácil y rápido
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            El mejor servicio de peluquería a tu alcance
          </p>
          <Button size="lg" onClick={() => user ? router.push('/turnos/nuevo') : router.push('/login')}>
            {user ? 'Reservar Ahora' : 'Iniciar Sesión para Reservar'}
          </Button>
        </section>

        <section className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>✂️ Cortes Modernos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Los mejores estilos para tu look</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>🎨 Colores y Peinados</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Transformá tu imagen con expertos</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>⏰ Turnos Online</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Reservá cuando quieras, 24/7</p>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  )
}
