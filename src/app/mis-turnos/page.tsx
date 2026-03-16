'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

interface Turno {
  id: string
  fecha_hora: string
  estado: string
  notas: string | null
  servicio: {
    nombre: string
    precio: number
    duracion_minutos: number
  }
}

export default function MisTurnosPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [turnos, setTurnos] = useState<Turno[]>([])
  const [activeTab, setActiveTab] = useState<'proximos' | 'pasados'>('proximos')

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)
      fetchTurnos(user.id)
    }
    checkUser()
  }, [supabase, router])

  const fetchTurnos = async (userId: string) => {
    setLoading(true)
    const now = new Date().toISOString()
    
    const { data, error } = await supabase
      .from('turnos')
      .select(`
        id,
        fecha_hora,
        estado,
        notas,
        servicio:servicios(nombre, precio, duracion_minutos)
      `)
      .eq('cliente_id', userId)
      .order('fecha_hora', { ascending: true })

    if (!error && data) {
      setTurnos(data as any)
    }
    setLoading(false)
  }

  const handleCancelar = async (turnoId: string) => {
    try {
      const { error } = await supabase
        .from('turnos')
        .update({ estado: 'cancelado' })
        .eq('id', turnoId)

      if (error) throw error
      toast.success('Turno cancelado')
      if (user) fetchTurnos(user.id)
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const puedeCancelar = (fechaHora: string) => {
    const turno = new Date(fechaHora)
    const ahora = new Date()
    const horasRestantes = (turno.getTime() - ahora.getTime()) / (1000 * 60 * 60)
    return horasRestantes >= 2 // Mínimo 2 horas antes
  }

  const turnosProximos = turnos.filter(t => new Date(t.fecha_hora) >= new Date() && t.estado !== 'cancelado')
  const turnosPasados = turnos.filter(t => new Date(t.fecha_hora) < new Date() || t.estado === 'cancelado')

  const renderTurno = (turno: Turno) => {
    const fecha = new Date(turno.fecha_hora)
    const puedeCancel = puedeCancelar(turno.fecha_hora) && turno.estado === 'pendiente'

    return (
      <Card key={turno.id} className="mb-4">
        <CardContent className="pt-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-semibold text-lg">{turno.servicio?.nombre}</p>
              <p className="text-gray-500">
                {fecha.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })} - {fecha.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
              </p>
              <p className="text-sm text-gray-500">
                {turno.servicio?.duracion_minutos} min - ${turno.servicio?.precio}
              </p>
              {turno.notas && <p className="text-sm mt-2">📝 {turno.notas}</p>}
            </div>
            <div className="text-right">
              <span className={`inline-block px-3 py-1 rounded-full text-sm ${
                turno.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                turno.estado === 'confirmado' ? 'bg-green-100 text-green-800' :
                turno.estado === 'cancelado' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {turno.estado.charAt(0).toUpperCase() + turno.estado.slice(1)}
              </span>
              {puedeCancel && (
                <Button
                  variant="destructive"
                  size="sm"
                  className="mt-2"
                  onClick={() => handleCancelar(turno.id)}
                >
                  Cancelar
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!user) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => router.push('/')}>
              🏠 Inicio
            </Button>
            <Button variant="ghost" onClick={() => router.push('/turnos/nuevo')}>
              ➕ Nuevo Turno
            </Button>
          </div>
        </div>

        <h1 className="text-2xl font-bold">Mis Turnos</h1>

        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === 'proximos' ? 'default' : 'outline'}
            onClick={() => setActiveTab('proximos')}
          >
            Próximos ({turnosProximos.length})
          </Button>
          <Button
            variant={activeTab === 'pasados' ? 'default' : 'outline'}
            onClick={() => setActiveTab('pasados')}
          >
            Pasados ({turnosPasados.length})
          </Button>
        </div>

        {loading ? (
          <p className="text-center">Cargando...</p>
        ) : (
          <>
            {activeTab === 'proximos' && (
              turnosProximos.length > 0 ? (
                turnosProximos.map(renderTurno)
              ) : (
                <p className="text-center text-gray-500">No tenés turnos próximos</p>
              )
            )}
            {activeTab === 'pasados' && (
              turnosPasados.length > 0 ? (
                turnosPasados.map(renderTurno)
              ) : (
                <p className="text-center text-gray-500">No tenés turnos pasados</p>
              )
            )}
          </>
        )}
      </div>
    </div>
  )
}
