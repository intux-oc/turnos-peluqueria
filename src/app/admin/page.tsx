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
  cliente: {
    full_name: string
    email: string
  }
  servicio: {
    nombre: string
    precio: number
  }
}

export default function AdminPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [turnos, setTurnos] = useState<Turno[]>([])
  const [servicios, setServicios] = useState<any[]>([])

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      
      // Check if admin (simple check - in production use role-based)
      if (user.email !== 'admin@intux.com' && user.email !== 'admin@peluqueria.com') {
        toast.error('No tenés acceso a esta sección')
        router.push('/')
        return
      }
      
      setUser(user)
      fetchData()
    }
    checkUser()
  }, [supabase, router])

  const fetchData = async () => {
    setLoading(true)
    
    // Fetch today's turns
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const { data: turnsData } = await supabase
      .from('turnos')
      .select(`
        id,
        fecha_hora,
        estado,
        cliente:profiles!turnos_cliente_id_fkey(full_name, email),
        servicio:servicios(nombre, precio)
      `)
      .gte('fecha_hora', today.toISOString())
      .lt('fecha_hora', tomorrow.toISOString())
      .order('fecha_hora')

    if (turnsData) setTurnos(turnsData as any)

    // Fetch servicios
    const { data: servData } = await supabase
      .from('servicios')
      .select('*')
      .order('nombre')
    
    if (servData) setServicios(servData)

    setLoading(false)
  }

  const actualizarEstado = async (turnoId: string, nuevoEstado: string) => {
    try {
      const { error } = await supabase
        .from('turnos')
        .update({ estado: nuevoEstado })
        .eq('id', turnoId)

      if (error) throw error
      toast.success('Estado actualizado')
      fetchData()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const stats = {
    total: turnos.length,
    pendientes: turnos.filter(t => t.estado === 'pendiente').length,
    confirmados: turnos.filter(t => t.estado === 'confirmado').length,
    completados: turnos.filter(t => t.estado === 'completado').length,
  }

  if (!user || loading) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-2xl font-bold mb-8">Panel de Administración</h1>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-4">
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-gray-500">Total Hoy</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-2xl font-bold text-yellow-600">{stats.pendientes}</p>
              <p className="text-gray-500">Pendientes</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-2xl font-bold text-green-600">{stats.confirmados}</p>
              <p className="text-gray-500">Confirmados</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-2xl font-bold text-blue-600">{stats.completados}</p>
              <p className="text-gray-500">Completados</p>
            </CardContent>
          </Card>
        </div>

        {/* Today's appointments */}
        <Card>
          <CardHeader>
            <CardTitle>Turnos de Hoy</CardTitle>
          </CardHeader>
          <CardContent>
            {turnos.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No hay turnos para hoy</p>
            ) : (
              <div className="space-y-3">
                {turnos.map((turno) => (
                  <div key={turno.id} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{turno.cliente?.full_name || 'Sin nombre'}</p>
                      <p className="text-sm text-gray-500">{turno.cliente?.email}</p>
                      <p className="text-sm">{turno.servicio?.nombre} - ${turno.servicio?.precio}</p>
                      <p className="text-sm text-gray-400">
                        {new Date(turno.fecha_hora).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        turno.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                        turno.estado === 'confirmado' ? 'bg-green-100 text-green-800' :
                        turno.estado === 'completado' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {turno.estado}
                      </span>
                      {turno.estado === 'pendiente' && (
                        <Button size="sm" onClick={() => actualizarEstado(turno.id, 'confirmado')}>
                          Confirmar
                        </Button>
                      )}
                      {turno.estado === 'confirmado' && (
                        <Button size="sm" variant="outline" onClick={() => actualizarEstado(turno.id, 'completado')}>
                          Completar
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick link to manage servicios */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Gestión Rápida</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Button onClick={() => router.push('/admin/servicios')}>
              Administrar Servicios ({servicios.length})
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
