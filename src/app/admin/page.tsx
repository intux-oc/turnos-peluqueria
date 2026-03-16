'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { toast } from 'sonner'
import { CalendarClock, CheckCircle2, Clock, CheckSquare, Settings, Users, LayoutDashboard, Calendar as CalendarIcon, DollarSign } from 'lucide-react'

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
        toast.error('Acceso denegado', {
          description: 'No tenés permisos para ver esta sección.'
        })
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
      toast.success('Estado actualizado', {
        description: `El turno ahora está marcado como ${nuevoEstado}.`
      })
      fetchData()
    } catch (error: any) {
      toast.error('Ocurrió un error', {
        description: error.message
      })
    }
  }

  const stats = {
    total: turnos.length,
    pendientes: turnos.filter(t => t.estado === 'pendiente').length,
    confirmados: turnos.filter(t => t.estado === 'confirmado').length,
    completados: turnos.filter(t => t.estado === 'completado').length,
    recaudacion: turnos.filter(t => t.estado === 'completado').reduce((acc, t) => acc + (t.servicio?.precio || 0), 0)
  }

  if (!user || loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background min-h-[calc(100vh-4rem)]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
          <p className="text-muted-foreground animate-pulse font-medium">Cargando panel de administración...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 relative overflow-hidden bg-background py-10 px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-4rem)]">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 blur-[150px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none translate-y-1/3 -translate-x-1/3" />

      <div className="max-w-7xl mx-auto relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
              <span className="bg-gradient-to-tr from-primary/20 to-primary/5 p-2 rounded-xl border border-primary/20 text-primary shadow-inner">
                <LayoutDashboard className="h-8 w-8" />
              </span>
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">Resumen general y gestión de turnos del día.</p>
          </div>
          <div className="flex gap-4">
            <Button 
              onClick={() => router.push('/admin/servicios')}
              variant="outline"
              className="h-12 border-primary/30 text-primary hover:bg-primary/10 hover:text-primary min-w-[200px]"
            >
              <Settings className="mr-2 h-5 w-5" />
              Gestión de Servicios
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {/* Total */}
          <Card className="bg-white/5 border-white/10 backdrop-blur-xl relative overflow-hidden group hover:border-primary/50 transition-colors">
            <div className="absolute -right-6 -top-6 text-white/5 group-hover:text-primary/10 transition-colors duration-500 pointer-events-none">
               <CalendarIcon className="w-32 h-32" />
            </div>
            <CardContent className="p-6 relative z-10">
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2">
                 <CalendarIcon className="h-4 w-4" /> Turnos Hoy
              </p>
              <p className="text-4xl font-bold text-foreground">{stats.total}</p>
            </CardContent>
          </Card>
          
          {/* Pendientes */}
          <Card className="bg-white/5 border-white/10 backdrop-blur-xl relative overflow-hidden group hover:border-yellow-500/50 transition-colors">
            <div className="absolute -right-6 -top-6 text-white/5 group-hover:text-yellow-500/10 transition-colors duration-500 pointer-events-none">
               <Clock className="w-32 h-32" />
            </div>
            <CardContent className="p-6 relative z-10">
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2">
                 <Clock className="h-4 w-4 text-yellow-500" /> Pendientes
              </p>
              <p className="text-4xl font-bold text-foreground">{stats.pendientes}</p>
            </CardContent>
          </Card>
          
          {/* Confirmados */}
          <Card className="bg-white/5 border-white/10 backdrop-blur-xl relative overflow-hidden group hover:border-blue-500/50 transition-colors">
            <div className="absolute -right-6 -top-6 text-white/5 group-hover:text-blue-500/10 transition-colors duration-500 pointer-events-none">
               <CheckCircle2 className="w-32 h-32" />
            </div>
            <CardContent className="p-6 relative z-10">
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2">
                 <CheckCircle2 className="h-4 w-4 text-blue-500" /> Confirmados
              </p>
              <p className="text-4xl font-bold text-foreground">{stats.confirmados}</p>
            </CardContent>
          </Card>
          
          {/* Recaudación */}
          <Card className="bg-white/5 border-white/10 backdrop-blur-xl relative overflow-hidden group hover:border-green-500/50 transition-colors">
            <div className="absolute -right-6 -top-6 text-white/5 group-hover:text-green-500/10 transition-colors duration-500 pointer-events-none">
               <DollarSign className="w-32 h-32" />
            </div>
            <CardContent className="p-6 relative z-10">
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2">
                 <DollarSign className="h-4 w-4 text-green-500" /> Recaudación Hoy
              </p>
              <p className="text-4xl font-bold text-foreground">${stats.recaudacion}</p>
            </CardContent>
          </Card>
        </div>

        {/* Turnos Board */}
        <Card className="bg-white/5 border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
          <CardHeader className="bg-black/20 border-b border-white/5 pb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <CalendarClock className="h-6 w-6 text-primary" />
                Agenda de Hoy
              </CardTitle>
              <CardDescription className="mt-1 text-base">
                {new Date().toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {turnos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary/50 mb-6">
                  <CalendarClock className="h-10 w-10" />
                </div>
                <h3 className="text-2xl font-semibold text-foreground mb-2">Día Libre</h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  No hay turnos agendados para este día. ¡Disfrutá tu tiempo libre!
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {turnos.map((turno) => (
                  <div key={turno.id} className="p-5 sm:p-6 flex flex-col lg:flex-row justify-between lg:items-center gap-6 hover:bg-white/[0.02] transition-colors">
                    <div className="flex gap-4 lg:gap-6 items-start">
                      {/* Time Badge */}
                      <div className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 shrink-0 flex items-center justify-center">
                         <span className="text-xl font-bold text-primary">
                           {new Date(turno.fecha_hora).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                         </span>
                      </div>
                      
                      {/* Turno Details */}
                      <div>
                        <div className="mb-2">
                           <h4 className="text-lg font-bold text-foreground flex items-center gap-2">
                             {turno.cliente?.full_name || 'Sin nombre'}
                           </h4>
                           <p className="text-muted-foreground text-sm flex items-center gap-1.5 mt-0.5">
                             <Mail className="h-3.5 w-3.5" />
                             {turno.cliente?.email}
                           </p>
                        </div>
                        <div className="bg-primary/10 border border-primary/20 text-primary px-3 py-1.5 rounded-lg inline-flex items-center text-sm font-medium">
                          {turno.servicio?.nombre} <span className="mx-2 opacity-50">•</span> ${turno.servicio?.precio}
                        </div>
                      </div>
                    </div>
                    
                    {/* Turno Actions */}
                    <div className="flex items-center gap-3 self-end lg:self-auto ml-16 lg:ml-0">
                      {/* Status Badge */}
                      <span className={`px-4 py-1.5 rounded-full text-sm font-medium border flex items-center gap-1.5 ${
                        turno.estado === 'pendiente' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                        turno.estado === 'confirmado' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                        turno.estado === 'completado' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                        'bg-red-500/10 text-red-500 border-red-500/20'
                      }`}>
                         {turno.estado === 'pendiente' && <Clock className="h-3.5 w-3.5" />}
                         {turno.estado === 'confirmado' && <CheckCircle2 className="h-3.5 w-3.5" />}
                         {turno.estado === 'completado' && <CheckSquare className="h-3.5 w-3.5" />}
                        <span className="capitalize">{turno.estado}</span>
                      </span>

                      {/* Action Buttons */}
                      {turno.estado === 'pendiente' && (
                        <Button 
                          onClick={() => actualizarEstado(turno.id, 'confirmado')}
                          className="font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20"
                        >
                          Confirmar
                        </Button>
                      )}
                      {turno.estado === 'confirmado' && (
                        <Button 
                          onClick={() => actualizarEstado(turno.id, 'completado')}
                          className="font-medium bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-900/20"
                        >
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

      </div>
    </div>
  )
}
