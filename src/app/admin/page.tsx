'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { NavBar } from '@/components/nav-bar'
import { Overview } from '@/components/admin/Overview'
import { ScheduleList } from '@/components/admin/ScheduleList'
import { turnoService, TurnoWithRelations } from '@/lib/services/turno'
import { statsService, Stats } from '@/lib/services/stats'
import { Settings, BarChart3, Users, Plus } from 'lucide-react'

export default function AdminPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [turnos, setTurnos] = useState<TurnoWithRelations[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  
  // Verificación de acceso
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
        
      if (profile?.role !== 'admin') {
        router.push('/')
        return
      }
      
      fetchData()
    }
    checkAuth()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const data = await turnoService.getTurnosHoy()
      setTurnos(data)
      const calculatedStats = statsService.calcularStats(data)
      setStats(calculatedStats)
    } catch (error: any) {
      toast.error('Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmar = async (id: string) => {
    try {
      await turnoService.confirmarTurno(id)
      toast.success('Turno confirmado')
      fetchData()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleCompletar = async (id: string) => {
    try {
      await turnoService.completarTurno(id)
      toast.success('Turno completado')
      fetchData()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleCancelar = async (id: string) => {
    try {
      await turnoService.cancelarTurno(id)
      toast.success('Turno cancelado')
      fetchData()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-white border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <NavBar />
      
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Panel Administrativo</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => router.push('/admin/servicios')}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Servicio
            </Button>
            <Button variant="outline" size="sm" onClick={() => router.push('/admin/configuracion')}>
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {stats && <Overview stats={stats} tasaCancelacion={statsService.calcularTasaCancelacion(stats)} />}

        <div className="grid lg:grid-cols-3 gap-8 mt-12">
          <div className="lg:col-span-2">
            <ScheduleList 
              turnos={turnos}
              onConfirmar={handleConfirmar}
              onCompletar={handleCompletar}
              onCancelar={handleCancelar}
            />
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Accesos Rápidos</h3>
            <div className="grid gap-3">
              <Button 
                variant="secondary" 
                className="w-full justify-start h-14 bg-gray-900 border-gray-800 hover:bg-gray-800"
                onClick={() => router.push('/admin/reportes')}
              >
                <BarChart3 className="h-5 w-5 mr-3 text-blue-400" />
                Reportes de Negocio
              </Button>
              <Button 
                variant="secondary" 
                className="w-full justify-start h-14 bg-gray-900 border-gray-800 hover:bg-gray-800"
                onClick={() => router.push('/admin/empleados')}
              >
                <Users className="h-5 w-5 mr-3 text-green-400" />
                Gestión de Personal
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}