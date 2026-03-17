'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { Calendar, Clock, Banknote, CalendarX2, CheckCircle2, XCircle, ArrowLeft, MoreHorizontal, User as UserIcon } from 'lucide-react'

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
      toast.success('Turno cancelado exitosamente', {
        style: {
          background: '#1a1a1a',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.1)'
        }
      })
      if (user) fetchTurnos(user.id)
    } catch (error: any) {
      toast.error('Error al cancelar el turno: ' + error.message, {
        style: {
          background: '#1a1a1a',
          color: '#ef4444',
          border: '1px solid rgba(239, 68, 68, 0.2)'
        }
      })
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

    let statusStyle = 'bg-white/10 text-gray-300'
    let StatusIcon = Calendar
    if (turno.estado === 'pendiente') {
      statusStyle = 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
      StatusIcon = Clock
    } else if (turno.estado === 'confirmado') {
      statusStyle = 'bg-green-500/20 text-green-400 border border-green-500/30'
      StatusIcon = CheckCircle2
    } else if (turno.estado === 'cancelado') {
      statusStyle = 'bg-red-500/20 text-red-400 border border-red-500/30'
      StatusIcon = XCircle
    }

    return (
      <div key={turno.id} className="bg-zinc-900 border border-white/10 p-6 relative group overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-white opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-start gap-4 flex-1">
            <div className="w-12 h-12 bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
              <StatusIcon className="w-5 h-5 text-gray-400" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-lg font-light tracking-wide">{turno.servicio?.nombre}</h3>
                <span className={`text-[10px] tracking-widest uppercase px-2 py-0.5 border ${
                   turno.estado === 'pendiente' ? 'border-gray-500 text-gray-400' : 
                   turno.estado === 'confirmado' ? 'border-white text-white' : 
                   'border-red-900/50 text-red-500'
                }`}>
                  {turno.estado}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500 font-light">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" /> {fecha.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5" /> {fecha.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} ({turno.servicio?.duracion_minutos} min)
                </div>
                <div className="flex items-center gap-2">
                  <UserIcon className="w-3.5 h-3.5" /> {turno.servicio?.precio ? `$${turno.servicio?.precio}` : 'Precio a definir'}
                </div>
              </div>
              {turno.notas && (
                <p className="mt-3 text-sm text-gray-400 font-light border-l border-white/20 pl-3">
                  {turno.notas}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            {puedeCancel ? (
               <Button 
                variant="outline" 
                className="flex-1 md:flex-none h-10 border-white/20 hover:bg-red-900/20 hover:text-red-400 hover:border-red-900/50 rounded-none font-light text-xs tracking-widest uppercase transition-colors"
                onClick={() => handleCancelar(turno.id)}
               >
                 Cancelar
               </Button>
            ) : (
                <Button variant="ghost" className="w-10 h-10 p-0 text-gray-500 hover:text-white hover:bg-white/5 rounded-none">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black">
      <main className="flex-1 max-w-5xl w-full mx-auto p-6 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Header Section */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <Button 
              variant="ghost" 
              className="mb-6 h-8 px-0 text-gray-500 hover:text-white hover:bg-transparent tracking-widest uppercase text-xs font-light"
              onClick={() => router.push('/')}
            >
              <ArrowLeft className="w-3 h-3 mr-2" /> Volver al Inicio
            </Button>
            <h1 className="text-4xl font-light tracking-wide mb-2">Mis Turnos</h1>
            <p className="text-gray-500 font-light text-sm tracking-wide">
              Gestioná tus próximas visitas y revisá tu historial
            </p>
          </div>
            <Button 
              className="h-12 px-8 text-xs tracking-widest uppercase font-light bg-white text-black hover:bg-gray-200 transition-colors rounded-none flex items-center gap-2"
              onClick={() => router.push('/turnos/nuevo')}
            >
              <Calendar className="w-4 h-4" /> Nuevo Turno
            </Button>
        </div>

        {/* Custom Tabs */}
        <div className="mb-8 border-b border-white/10 flex gap-8">
          <button
            onClick={() => setActiveTab('proximos')}
            className={`pb-4 text-sm font-light tracking-wide uppercase transition-colors relative ${
              activeTab === 'proximos' ? 'text-white' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            Próximos ({turnosProximos.length})
            {activeTab === 'proximos' && (
              <span className="absolute bottom-0 left-0 w-full h-px bg-white" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('pasados')}
            className={`pb-4 text-sm font-light tracking-wide uppercase transition-colors relative ${
              activeTab === 'pasados' ? 'text-white' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            Historial ({turnosPasados.length})
            {activeTab === 'pasados' && (
              <span className="absolute bottom-0 left-0 w-full h-px bg-white" />
            )}
          </button>
        </div>

        {/* Content Area */}
        <div className="min-h-[400px]">
          {loading ? (
             <div className="flex flex-col items-center justify-center py-20 text-gray-500 font-light space-y-4">
               <div className="w-8 h-8 rounded-full border border-gray-600 border-t-white animate-spin" />
               <p className="text-xs uppercase tracking-widest">Cargando turnos...</p>
             </div>
          ) : (
             <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
               {activeTab === 'proximos' && (
                 turnosProximos.length > 0 ? (
                   turnosProximos.map(renderTurno)
                 ) : (
                   <div className="border border-white/10 border-dashed p-12 text-center bg-zinc-900/30">
                     <CalendarX2 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                     <h3 className="text-lg font-light tracking-wide text-white mb-2">No tenés turnos próximos</h3>
                     <p className="text-gray-500 font-light text-sm mb-6 max-w-md mx-auto">
                       No tenés reservas futuras. ¿Listo para renovar tu estilo?
                     </p>
                     <Button 
                       variant="outline"
                       className="h-10 border-white/20 hover:bg-white hover:text-black rounded-none font-light text-xs tracking-widest uppercase transition-colors"
                       onClick={() => router.push('/turnos/nuevo')}
                     >
                       Agendar Ahora
                     </Button>
                   </div>
                 )
               )}
               {activeTab === 'pasados' && (
                 turnosPasados.length > 0 ? (
                   turnosPasados.map(renderTurno)
                 ) : (
                   <div className="border border-white/10 border-dashed p-12 text-center bg-zinc-900/30">
                     <Clock className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                     <h3 className="text-lg font-light tracking-wide text-white mb-2">Sin Historial</h3>
                     <p className="text-gray-500 font-light text-sm mb-6 max-w-md mx-auto">
                       Tus turnos pasados aparecerán acá.
                     </p>
                   </div>
                 )
               )}
             </div>
          )}
        </div>
      </main>
    </div>
  )
}
