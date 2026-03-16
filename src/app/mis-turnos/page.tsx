'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { Calendar, Clock, Banknote, CalendarX2, CheckCircle2, XCircle, ArrowLeft } from 'lucide-react'

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
      <Card key={turno.id} className="mb-4 bg-white/5 backdrop-blur-md border border-white/10 hover:border-white/20 transition-all duration-300 overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <CardContent className="p-6 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-xl text-white">{turno.servicio?.nombre}</h3>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${statusStyle}`}>
                  <StatusIcon className="w-3.5 h-3.5" />
                  {turno.estado.charAt(0).toUpperCase() + turno.estado.slice(1)}
                </span>
              </div>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-amber-500/70" />
                  <span>{fecha.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-500/70" />
                  <span>{fecha.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Banknote className="w-4 h-4 text-amber-500/70" />
                  <span>${turno.servicio?.precio} ({turno.servicio?.duracion_minutos} min)</span>
                </div>
              </div>

              {turno.notas && (
                <div className="mt-2 text-sm bg-white/5 p-3 rounded-md border border-white/5 text-gray-300">
                  <span className="text-gray-500 text-xs uppercase tracking-wider block mb-1">Notas adicionales</span>
                  {turno.notas}
                </div>
              )}
            </div>
            
            <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto mt-2 md:mt-0">
              {puedeCancel && (
                <Button
                  variant="destructive"
                  className="w-full md:w-auto bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 border border-red-500/20 transition-all font-medium"
                  onClick={() => handleCancelar(turno.id)}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Cancelar Turno
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
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
    <div className="min-h-screen bg-[#0a0a0a] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))] text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <Button 
              variant="ghost" 
              className="mb-2 text-gray-400 hover:text-white hover:bg-white/5 -ml-4"
              onClick={() => router.push('/')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al inicio
            </Button>
            <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              Mis Turnos
            </h1>
            <p className="text-gray-400 mt-1">Gestioná tus próximas reservas y el historial</p>
          </div>
          <Button 
            onClick={() => router.push('/turnos/nuevo')}
            className="bg-amber-500 hover:bg-amber-600 text-black font-semibold shadow-lg shadow-amber-500/20 w-full sm:w-auto"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Nuevo Turno
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex p-1 bg-white/5 backdrop-blur-md border border-white/10 rounded-lg w-full sm:w-fit">
          <button
            onClick={() => setActiveTab('proximos')}
            className={`flex-1 sm:px-8 py-2.5 rounded-md text-sm font-medium transition-all duration-200 ${
              activeTab === 'proximos' 
                ? 'bg-white/10 text-white shadow-sm' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Próximos ({turnosProximos.length})
          </button>
          <button
            onClick={() => setActiveTab('pasados')}
            className={`flex-1 sm:px-8 py-2.5 rounded-md text-sm font-medium transition-all duration-200 ${
              activeTab === 'pasados' 
                ? 'bg-white/10 text-white shadow-sm' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Historial ({turnosPasados.length})
          </button>
        </div>

        {/* Content */}
        <div className="min-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 space-y-4">
              <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
              <p>Cargando tus turnos...</p>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {activeTab === 'proximos' && (
                turnosProximos.length > 0 ? (
                  turnosProximos.map(renderTurno)
                ) : (
                  <Card className="bg-white/5 border-dashed border-white/10 flex flex-col items-center justify-center py-20 text-center">
                    <CalendarX2 className="w-16 h-16 text-gray-600 mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No tenés turnos próximos</h3>
                    <p className="text-gray-400 max-w-sm mb-6">
                      ¿Necesitás un corte de pelo o arreglo de barba? Reservá tu próximo turno ahora.
                    </p>
                    <Button 
                      onClick={() => router.push('/turnos/nuevo')}
                      className="bg-white/10 hover:bg-white/20 text-white border border-white/5"
                    >
                      Reservar turno
                    </Button>
                  </Card>
                )
              )}
              {activeTab === 'pasados' && (
                turnosPasados.length > 0 ? (
                  turnosPasados.map(renderTurno)
                ) : (
                  <Card className="bg-white/5 border-dashed border-white/10 flex flex-col items-center justify-center py-20 text-center">
                    <Clock className="w-16 h-16 text-gray-600 mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No hay historial</h3>
                    <p className="text-gray-400">
                      Todavía no tenés turnos pasados ni cancelados en tu historial.
                    </p>
                  </Card>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
