'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import { toast } from 'sonner'
import { ArrowLeft, ArrowRight, CalendarDays, CheckCircle2, ChevronRight, Clock, Scissors, Search, FileText, CalendarCheck, MapPin, User as UserIcon } from 'lucide-react'

interface Servicio {
  id: string
  nombre: string
  descripcion: string
  precio: number
  duracion_minutos: number
}

export default function NuevoTurnoPage() {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [servicios, setServicios] = useState<Servicio[]>([])
  
  const [servicioId, setServicioId] = useState('')
  const [fecha, setFecha] = useState<Date | undefined>()
  const [hora, setHora] = useState('')
  const [notas, setNotas] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [horariosOcupados, setHorariosOcupados] = useState<Set<string>>(new Set())
  const [miPeluqueriaId, setMiPeluqueriaId] = useState<string>('')

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)
    }
    checkUser()

    const fetchMyBarbershop = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('barbershops').select('id').eq('owner_id', user.id).single()
      if (data) setMiPeluqueriaId(data.id)
    }
    fetchMyBarbershop()

    const fetchServicios = async () => {
      const { data, error } = await supabase
        .from('servicios')
        .select('*')
        .eq('activo', true)
        .order('nombre')
      
      if (!error && data) setServicios(data)
    }
    fetchServicios()
  }, [supabase, router])

  useEffect(() => {
    const fetchOcupados = async () => {
      if (!fecha || !miPeluqueriaId) return
      
      const start = new Date(fecha)
      start.setHours(0, 0, 0, 0)
      const end = new Date(fecha)
      end.setHours(23, 59, 59, 999)

      const { data } = await supabase
        .from('turnos')
        .select('fecha_hora')
        .eq('barbershop_id', miPeluqueriaId)
        .gte('fecha_hora', start.toISOString())
        .lte('fecha_hora', end.toISOString())
        .in('estado', ['pendiente', 'confirmado'])

      if (data) {
        const ocupados = new Set(
          data.map(t => {
            const d = new Date(t.fecha_hora)
            return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
          })
        )
        setHorariosOcupados(ocupados)
      }
    }
    fetchOcupados()
  }, [fecha, miPeluqueriaId, supabase])

  const servicioSeleccionado = servicios.find(s => s.id === servicioId)

  const horasDisponibles = () => {
    if (!fecha || !servicioSeleccionado) return []
    const horas = []
    
    // Horario ejemplo: 9:00 a 18:30 (intervalos de 30 min)
    for (let h = 9; h <= 18; h++) {
      for (const m of [0, 30]) {
        if (h === 18 && m === 30) break
        
        const timeString = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
        
        // Solo añadimos la hora si NO está en el Set de horariosOcupados
        if (!horariosOcupados.has(timeString)) {
           horas.push(timeString)
        }
      }
    }
    return horas
  }

  const handleSubmit = async () => {
    if (!user || !servicioId || !fecha || !hora) {
      toast.error('Completá todos los campos', {
        style: { background: '#1a1a1a', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }
      })
      return
    }

    setLoading(true)
    try {
      const fechaHora = new Date(fecha)
      const [horas, minutos] = hora.split(':')
      fechaHora.setHours(parseInt(horas), parseInt(minutos), 0, 0)

      const { error } = await supabase.from('turnos').insert({
        barbershop_id: miPeluqueriaId,
        cliente_id: user.id,
        servicio_id: servicioId,
        fecha_hora: fechaHora.toISOString(),
        notas: notas || null,
        estado: 'pendiente',
      })

      if (error) {
        if (error.code === '23505') {
          toast.error('¡Ups! Alguien acaba de reservar este horario.', {
            description: 'Por favor, selecciona otro horario disponible.'
          })
        } else {
          throw error
        }
        return
      }

      toast.success('¡Turno reservado con éxito!', {
        style: { background: '#1a1a1a', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }
      })
      router.push('/mis-turnos')
    } catch (error: any) {
      toast.error('Error al reservar: ' + error.message, {
        style: { background: '#1a1a1a', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }
      })
    } finally {
      setLoading(false)
    }
  }

  const isNextDisabled = () => {
    if (step === 1) return !servicioId
    if (step === 2) return !fecha
    if (step === 3) return !hora
    return false
  }

  const filteredServicios = servicios.filter(s => 
    s.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
      </div>
    )
  }

  const steps = [
    { num: 1, title: 'Servicio', icon: Scissors },
    { num: 2, title: 'Fecha', icon: CalendarDays },
    { num: 3, title: 'Hora', icon: Clock },
    { num: 4, title: 'Confirmar', icon: CheckCircle2 }
  ]

  return (
    <div className="flex flex-col min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black pt-20">
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Header Section */}
        <div className="mb-12">
          <Button 
            variant="ghost" 
            className="mb-6 h-8 px-0 text-gray-500 hover:text-white hover:bg-transparent tracking-widest uppercase text-xs font-light"
            onClick={() => {
              if (step > 1) setStep(step - 1)
              else router.push('/mis-turnos')
            }}
          >
            <ArrowLeft className="w-3 h-3 mr-2" /> {step === 1 ? 'Volver a Mis Turnos' : 'Paso Anterior'}
          </Button>
          <h1 className="text-4xl font-light tracking-wide mb-2 uppercase">Agendar Turno</h1>
          <p className="text-gray-500 font-light text-sm tracking-wide">
            Seleccioná tu servicio, fecha y hora.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Main Booking Area */}
          <div className="flex-1">
            {/* Step Indicator */}
            <div className="flex items-center justify-between mb-8 relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-px bg-white/10 z-0" />
              <div 
                className="absolute left-0 top-1/2 -translate-y-1/2 h-px bg-white z-0 transition-all duration-500"
                style={{ width: `${((step - 1) / 3) * 100}%` }}
              />
              
              {steps.map((s) => (
                <div key={s.num} className={`relative z-10 flex flex-col items-center gap-2 ${step >= s.num ? 'text-white' : 'text-gray-600'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs bg-black ${
                    step >= s.num ? 'border border-white' : 'border border-white/20'
                  }`}>
                    {step > s.num ? <CheckCircle2 className="w-4 h-4" /> : s.num}
                  </div>
                  <span className="text-[10px] tracking-widest uppercase font-light bg-black px-1 hidden sm:block">
                    {s.title}
                  </span>
                </div>
              ))}
            </div>

            <Card className="bg-transparent border-none">
              <CardContent className="p-0">
                {/* Step 1: Services */}
                {step === 1 && (
                  <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                    <div className="relative mb-6">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <Input 
                        placeholder="Buscar servicios..." 
                        className="pl-12 bg-zinc-900/50 border-white/20 focus:border-white text-white h-12 rounded-none font-light placeholder:text-gray-600 transition-colors"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredServicios.map((servicio) => (
                        <div 
                          key={servicio.id}
                          className={`p-6 border cursor-pointer transition-all ${
                            servicioId === servicio.id 
                              ? 'border-white bg-white/5' 
                              : 'border-white/10 bg-zinc-900/50 hover:border-white/30'
                          }`}
                          onClick={() => setServicioId(servicio.id)}
                        >
                          <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg font-light tracking-wide pr-4">{servicio.nombre}</h3>
                            {servicioId === servicio.id && <CheckCircle2 className="w-5 h-5 text-white shrink-0" />}
                          </div>
                          <p className="text-sm text-gray-500 font-light line-clamp-2 h-10 mb-4">{servicio.descripcion}</p>
                          <div className="flex items-center justify-between mt-auto">
                            <span className="text-xs tracking-widest uppercase font-light text-gray-400">{servicio.duracion_minutos} MIN</span>
                            <span className="text-lg font-light">${servicio.precio}</span>
                          </div>
                        </div>
                      ))}
                      {filteredServicios.length === 0 && (
                         <div className="col-span-full py-12 px-6 border border-white/10 border-dashed text-center">
                           <Scissors className="w-8 h-8 text-gray-600 mx-auto mb-3" />
                           <p className="text-sm font-light text-gray-500">No se encontraron servicios que coincidan con tu búsqueda.</p>
                         </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 2: Date */}
                {step === 2 && (
                  <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                    <div className="border border-white/10 bg-zinc-900/50 p-6 flex justify-center">
                      <Calendar
                        mode="single"
                        selected={fecha}
                        onSelect={setFecha}
                        disabled={(date) => {
                          const today = new Date()
                          today.setHours(0, 0, 0, 0)
                          return date < today || date.getDay() === 0
                        }}
                        className="text-white font-light"
                        classNames={{
                          months: "space-y-4",
                          month: "space-y-4",
                          caption: "flex justify-center pt-1 relative items-center mb-4",
                          caption_label: "text-sm tracking-widest uppercase font-light",
                          nav: "space-x-1 flex items-center",
                          nav_button: "h-7 w-7 bg-transparent p-0 text-gray-400 hover:text-white transition-colors",
                          nav_button_previous: "absolute left-1",
                          nav_button_next: "absolute right-1",
                          table: "w-full border-collapse space-y-1",
                          head_row: "flex w-full",
                          head_cell: "text-gray-500 w-10 sm:w-12 font-light text-xs tracking-widest uppercase",
                          row: "flex w-full mt-2",
                          cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
                          day: "h-10 w-10 sm:h-12 sm:w-12 p-0 font-light hover:bg-white/10 transition-colors aria-selected:bg-white aria-selected:text-black rounded-none",
                          day_disabled: "text-gray-700 hover:bg-transparent cursor-not-allowed",
                          day_today: "border border-white/20",
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Step 3: Time */}
                {step === 3 && (
                  <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                    <div className="text-sm font-light text-gray-400 mb-6 flex items-center gap-2">
                      <CalendarDays className="w-4 h-4" /> 
                      Mostrando disponibilidad para {fecha?.toLocaleDateString('es-AR', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </div>
                    
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                      {horasDisponibles().map((h) => (
                        <Button
                          key={h}
                          variant="outline"
                          className={`h-12 rounded-none font-light tracking-widest text-sm transition-colors ${
                            hora === h 
                              ? 'bg-white text-black border-white hover:bg-gray-200' 
                              : 'bg-zinc-900/50 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/30'
                          }`}
                          onClick={() => setHora(h)}
                        >
                          {h}
                        </Button>
                      ))}
                      {horasDisponibles().length === 0 && (
                         <div className="col-span-full py-12 px-6 border border-white/10 border-dashed text-center">
                           <Clock className="w-8 h-8 text-gray-600 mx-auto mb-3" />
                           <p className="text-sm font-light text-gray-500">No hay horarios disponibles para esta fecha.</p>
                         </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 4: Details & Confirm */}
                {step === 4 && (
                  <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                    <div className="space-y-3">
                      <Label className="text-xs tracking-widest uppercase text-gray-400 font-light">Notas Adicionales (Opcional)</Label>
                      <Input
                        value={notas}
                        onChange={(e) => setNotas(e.target.value)}
                        placeholder="¿Alguna solicitud especial o preferencia?"
                        className="bg-zinc-900/50 border-white/20 focus:border-white text-white h-14 rounded-none font-light placeholder:text-gray-600 transition-colors"
                      />
                    </div>
                    
                    <div className="border border-white/10 p-6 bg-zinc-900/30">
                       <h4 className="text-sm tracking-widest uppercase text-white font-light border-b border-white/10 pb-4 mb-4">
                          Política de Cancelación
                       </h4>
                       <p className="text-xs text-gray-500 font-light leading-relaxed">
                          Tené en cuenta que las cancelaciones o reprogramaciones deben hacerse al menos 2 horas antes de tu turno. Valoramos tu tiempo y el de nuestros profesionales.
                       </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Actions */}
            <div className="mt-8 pt-6 border-t border-white/10 flex justify-end">
              {step < 4 ? (
                <Button
                  onClick={() => setStep(step + 1)}
                  disabled={isNextDisabled()}
                  className="h-14 px-12 text-sm tracking-widest uppercase font-light bg-white text-black hover:bg-gray-200 transition-all rounded-none flex items-center gap-2 w-full sm:w-auto"
                >
                  Continuar <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit} 
                  disabled={loading}
                  className="h-14 px-12 text-sm tracking-widest uppercase font-light bg-white text-black hover:bg-gray-200 transition-all rounded-none flex items-center justify-center gap-3 w-full sm:w-auto"
                >
                  {loading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
                      <span>Procesando...</span>
                    </>
                  ) : (
                    <>
                      <span>Confirmar Turno</span>
                      <CalendarCheck className="w-4 h-4" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Sidebar / Summary */}
          <div className="w-full lg:w-80">
            <div className="sticky top-24 space-y-6">
              <Card className="bg-zinc-900 border-white/10 rounded-none overflow-hidden">
                <div className="h-2 bg-white w-full" />
                <CardContent className="p-6">
                  <h3 className="text-xs tracking-widest uppercase text-gray-500 font-light mb-6">Resumen de Reserva</h3>
                  
                  <div className="space-y-6">
                    {servicioSeleccionado ? (
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                          <Scissors className="w-4 h-4 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-[10px] tracking-widest uppercase text-gray-500 font-light mb-1">Servicio</p>
                          <p className="text-sm font-light">{servicioSeleccionado.nombre}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4 text-gray-600">
                        <div className="w-10 h-10 border border-white/5 flex items-center justify-center">?</div>
                        <p className="text-xs font-light italic">Ningún servicio seleccionado</p>
                      </div>
                    )}

                    {fecha && (
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                          <CalendarDays className="w-4 h-4 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-[10px] tracking-widest uppercase text-gray-500 font-light mb-1">Fecha</p>
                          <p className="text-sm font-light capitalize">
                            {fecha.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
                          </p>
                        </div>
                      </div>
                    )}

                    {hora && (
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                          <Clock className="w-4 h-4 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-[10px] tracking-widest uppercase text-gray-500 font-light mb-1">Hora</p>
                          <p className="text-sm font-light">{hora} HS</p>
                        </div>
                      </div>
                    )}

                    {servicioSeleccionado && (
                      <div className="pt-6 border-t border-white/10 flex justify-between items-end">
                        <div>
                          <p className="text-[10px] tracking-widest uppercase text-gray-500 font-light mb-1">Total</p>
                          <p className="text-2xl font-light">${servicioSeleccionado.precio}</p>
                        </div>
                        <p className="text-[10px] tracking-widest uppercase text-gray-500 font-light">
                          {servicioSeleccionado.duracion_minutos} MIN
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="p-6 border border-white/5 bg-zinc-900/20">
                <div className="flex items-center gap-3 text-gray-500 mb-4">
                  <MapPin className="w-4 h-4" />
                  <span className="text-[10px] tracking-widest uppercase font-light">Ubicación</span>
                </div>
                <p className="text-xs font-light text-gray-400 leading-relaxed">
                  Av. Principal 123, Ciudad<br />
                  Piso 1, Oficina A
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
