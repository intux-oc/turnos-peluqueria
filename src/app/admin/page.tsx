'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { CalendarClock, CheckCircle2, Clock, Settings, Users, Calendar as CalendarIcon, DollarSign, Link as LinkIcon } from 'lucide-react'

interface Turno {
  id: string
  fecha_hora: string
  estado: string
  cliente: { full_name: string; email: string } | null
  servicio: { nombre: string; precio: number } | null
}

interface Barbershop {
  id: string
  name: string
  slug: string
}

export default function AdminPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [barbershop, setBarbershop] = useState<Barbershop | null>(null)
  const [turnos, setTurnos] = useState<Turno[]>([])

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      // Verify role is admin or superadmin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (!profile || !['admin', 'superadmin'].includes(profile.role)) {
        toast.error('Acceso denegado', { description: 'No tenés permisos para ver esta sección.' })
        router.push('/')
        return
      }

      // Load the barbershop owned by this user
      const { data: shop } = await supabase
        .from('barbershops')
        .select('id, name, slug')
        .eq('owner_id', user.id)
        .single()

      if (!shop) {
        // Admin without a barbershop yet — redirect to registration
        toast.error('Peluquería no encontrada', { description: 'Primero registrá tu peluquería.' })
        router.push('/planes')
        return
      }

      setBarbershop(shop)
      fetchData(shop.id)
    }
    checkUser()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchData = async (barbershopId: string) => {
    setLoading(true)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const { data: turnsData } = await supabase
      .from('turnos')
      .select(`id, fecha_hora, estado, cliente:profiles!turnos_cliente_id_fkey(full_name, email), servicio:servicios(nombre, precio)`)
      .eq('barbershop_id', barbershopId)
      .gte('fecha_hora', today.toISOString())
      .lt('fecha_hora', tomorrow.toISOString())
      .order('fecha_hora')

    if (turnsData) setTurnos(turnsData as any)
    setLoading(false)
  }

  const actualizarEstado = async (turnoId: string, nuevoEstado: string) => {
    const { error } = await supabase
      .from('turnos')
      .update({ estado: nuevoEstado })
      .eq('id', turnoId)

    if (error) {
      toast.error('Ocurrió un error', { description: error.message })
    } else {
      toast.success('Estado actualizado', { description: `El turno ahora está marcado como ${nuevoEstado}.` })
      if (barbershop) fetchData(barbershop.id)
    }
  }

  const stats = {
    total: turnos.length,
    pendientes: turnos.filter(t => t.estado === 'pendiente').length,
    confirmados: turnos.filter(t => t.estado === 'confirmado').length,
    completados: turnos.filter(t => t.estado === 'completado').length,
    recaudacion: turnos.filter(t => t.estado === 'completado').reduce((acc, t) => acc + (t.servicio?.precio || 0), 0)
  }

  if (!barbershop || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="h-8 w-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black">
        {/* Header Section */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-light tracking-wide mb-2 uppercase">Panel de Administración</h1>
            <p className="text-gray-500 font-light text-sm tracking-wide capitalize">
              {new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              className="text-[10px] tracking-widest uppercase font-light text-gray-500 hover:text-white hover:bg-white/5 h-10 px-4 rounded-none border border-white/10 flex items-center gap-2"
              onClick={() => window.open(`/b/${barbershop.slug}`, '_blank')}
            >
              <LinkIcon className="w-3.5 h-3.5" /> Ver Página Pública
            </Button>
            <Button 
              variant="outline" 
              className="border-white/10 bg-zinc-900/50 hover:bg-white/5 text-xs tracking-widest uppercase font-light h-10 px-6 rounded-none transition-all"
              onClick={() => fetchData(barbershop.id)}
            >
              Actualizar
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <Card className="bg-zinc-900/50 border-white/10 rounded-none overflow-hidden relative group transition-all hover:border-white/30">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <p className="text-[10px] tracking-widest uppercase text-gray-500 font-light">Turnos del Día</p>
                <CalendarIcon className="w-4 h-4 text-gray-600" />
              </div>
              <p className="text-3xl font-light">{stats.total}</p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/50 border-white/10 rounded-none overflow-hidden relative group transition-all hover:border-white/30">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <p className="text-[10px] tracking-widest uppercase text-gray-500 font-light">Pendientes</p>
                <Clock className="w-4 h-4 text-gray-600" />
              </div>
              <p className="text-3xl font-light">{stats.pendientes}</p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/50 border-white/10 rounded-none overflow-hidden relative group transition-all hover:border-white/30">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <p className="text-[10px] tracking-widest uppercase text-gray-500 font-light">Confirmados</p>
                <CheckCircle2 className="w-4 h-4 text-gray-600" />
              </div>
              <p className="text-3xl font-light">{stats.confirmados}</p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/50 border-white/10 rounded-none overflow-hidden relative group transition-all hover:border-white/30">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <p className="text-[10px] tracking-widest uppercase text-gray-500 font-light">Recaudación Diaria</p>
                <DollarSign className="w-4 h-4 text-gray-600" />
              </div>
              <p className="text-3xl font-light">${stats.recaudacion}</p>
            </CardContent>
          </Card>
        </div>

        {/* Schedule Board */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h2 className="text-sm tracking-widest uppercase font-light text-white">Agenda del Día</h2>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span className="text-[10px] tracking-widest uppercase font-light text-gray-500">Actualizado en Vivo</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {turnos.length === 0 ? (
              <div className="py-24 px-6 border border-white/10 border-dashed text-center">
                <CalendarClock className="w-10 h-10 text-gray-600 mx-auto mb-4" />
                <p className="text-sm font-light text-gray-500 tracking-wide">No hay turnos programados para hoy.</p>
              </div>
            ) : (
              turnos.map((turno) => (
                <div 
                  key={turno.id}
                  className="flex flex-col md:flex-row md:items-center justify-between p-6 border border-white/10 bg-zinc-900/30 hover:bg-zinc-900/50 transition-all gap-6"
                >
                  <div className="flex items-center gap-8">
                    <div className="h-full border-r border-white/10 pr-8">
                       <p className="text-2xl font-light tracking-tighter">
                         {new Date(turno.fecha_hora).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                       </p>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-light tracking-wide text-white mb-1">
                        {turno.cliente?.full_name || 'N/A'}
                      </h4>
                      <div className="flex items-center gap-4">
                        <span className="text-[10px] tracking-widest uppercase font-light text-gray-500">
                          {turno.servicio?.nombre}
                        </span>
                        <span className="text-[10px] tracking-widest uppercase font-light text-white">
                          ${turno.servicio?.precio}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className={`text-[10px] tracking-widest uppercase font-light px-3 py-1 border transition-all ${
                      turno.estado === 'pendiente' ? 'border-gray-500/50 text-gray-400' :
                      turno.estado === 'confirmado' ? 'border-white text-white' :
                      turno.estado === 'completado' ? 'border-white/10 bg-white/5 text-gray-500' :
                      'border-red-500/50 text-red-500'
                    }`}>
                      {turno.estado}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {turno.estado === 'pendiente' && (
                        <Button 
                          onClick={() => actualizarEstado(turno.id, 'confirmado')}
                          className="h-10 px-6 text-[10px] tracking-widest uppercase font-light bg-white text-black hover:bg-gray-200 rounded-none transition-all"
                        >
                          Confirmar
                        </Button>
                      )}
                      {turno.estado === 'confirmado' && (
                        <Button 
                          onClick={() => actualizarEstado(turno.id, 'completado')}
                          className="h-10 px-6 text-[10px] tracking-widest uppercase font-light bg-white text-black hover:bg-gray-200 rounded-none transition-all"
                        >
                          Completar
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-10 w-10 text-gray-600 hover:text-white hover:bg-white/5 rounded-none"
                        title="Cancelar Turno"
                        onClick={() => actualizarEstado(turno.id, 'cancelado')}
                      >
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
