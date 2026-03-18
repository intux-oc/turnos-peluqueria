'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { NavBar } from '@/components/nav-bar'
import { Overview } from '@/components/admin/Overview'
import { ScheduleList } from '@/components/admin/ScheduleList'
import { statsService, Stats } from '@/lib/services/stats'
import { turnoService, TurnoWithRelations } from '@/lib/services/turno'
import { Settings, Plus, WifiOff } from 'lucide-react'
import { QuickActionCards } from '@/components/admin/QuickActionCards'
import { useNetworkStatus } from '@/hooks/useNetworkStatus'

function AdminDashboard() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const barbershopId = searchParams.get('barbershop')
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const isOnline = useNetworkStatus()
  const [turnos, setTurnos] = useState<TurnoWithRelations[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [barbershopName, setBarbershopName] = useState('Panel Administrativo')
  
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
        
      if (profile?.role !== 'admin' && profile?.role !== 'superadmin') {
        router.push('/')
        return
      }

      if (barbershopId) {
        const { data: shop } = await supabase
          .from('barbershops')
          .select('name')
          .eq('id', barbershopId)
          .single()
        if (shop) setBarbershopName(shop.name)
      }
      
      fetchData()
    }
    checkAuth()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [barbershopId])

  const getOwnBarbershopId = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    const { data: shop } = await supabase
      .from('barbershops')
      .select('id')
      .eq('owner_id', user.id)
      .single()
    return shop?.id
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const currentBarbershopId = barbershopId || (await getOwnBarbershopId())
      
      if (!currentBarbershopId) {
        setLoading(false)
        return
      }

      const { data: turnosData, error } = await supabase
        .from('turnos')
        .select(`
          id, fecha_hora, estado, notas, cliente_id, servicio_id, empleado_id,
          servicio:servicios(nombre, precio, duracion_minutos),
          empleado:empleados(nombre),
          cliente:profiles!turnos_cliente_id_fkey(full_name, email)
        `)
        .eq('barbershop_id', currentBarbershopId)
        .gte('fecha_hora', new Date().toISOString().split('T')[0])
        .order('fecha_hora', { ascending: true })

      if (error) throw error

      setTurnos(turnosData as any)
      const calculatedStats = statsService.calcularStats(turnosData as any)
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

  return (
    <div className="min-h-screen bg-black text-white">

      
      {!isOnline && (
        <div className="bg-yellow-500/10 border-b border-yellow-500/20 px-6 py-2 flex items-center justify-center gap-2 text-yellow-500 text-sm">
          <WifiOff className="h-4 w-4" />
          <span>Estás sin conexión. Los turnos agendados se sincronizarán al recuperar el internet.</span>
        </div>
      )}

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-light tracking-widest uppercase">{barbershopName}</h1>
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

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : (
          stats && <Overview stats={stats} tasaCancelacion={statsService.calcularTasaCancelacion(stats)} />
        )}

        <div className="grid lg:grid-cols-3 gap-8 mt-12">
          <div className="lg:col-span-2">
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : (
              <ScheduleList 
                turnos={turnos}
                onConfirmar={handleConfirmar}
                onCompletar={handleCompletar}
                onCancelar={handleCancelar}
              />
            )}
          </div>

          <QuickActionCards />
        </div>
      </main>
    </div>
  )
}

export default function AdminPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-white border-t-transparent rounded-full" />
      </div>
    }>
      <AdminDashboard />
    </Suspense>
  )
}