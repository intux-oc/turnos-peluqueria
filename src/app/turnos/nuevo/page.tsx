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
import { ArrowLeft, ArrowRight, CalendarDays, CheckCircle2, ChevronRight, Clock, Scissors, Search, FileText } from 'lucide-react'

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

  const servicioSeleccionado = servicios.find(s => s.id === servicioId)

  const horasDisponibles = () => {
    if (!fecha || !servicioSeleccionado) return []
    const horas = []
    const duracion = servicioSeleccionado.duracion_minutos
    
    // Horario ejemplo: 9:00 a 19:00
    for (let h = 9; h <= 18; h++) {
      if (h + duracion/60 <= 19) {
        horas.push(`${h.toString().padStart(2, '0')}:00`)
        if (duracion <= 30) {
          horas.push(`${h.toString().padStart(2, '0')}:30`)
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
        cliente_id: user.id,
        servicio_id: servicioId,
        fecha_hora: fechaHora.toISOString(),
        notas: notas || null,
        estado: 'pendiente',
      })

      if (error) throw error

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
    <div className="min-h-screen bg-[#0a0a0a] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))] text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        
        {/* Header */}
        <div className="mb-10 block text-center sm:text-left">
          <Button 
            variant="ghost" 
            className="mb-4 text-gray-400 hover:text-white hover:bg-white/5 -ml-4"
            onClick={() => router.push(step === 1 ? '/mis-turnos' : '#')}
            onClickCapture={(e) => {
              if (step > 1) {
                e.stopPropagation()
                setStep(step - 1)
              }
            }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {step === 1 ? 'Volver a Mis Turnos' : 'Paso anterior'}
          </Button>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            Reservar Turno
          </h1>
          <p className="text-gray-400 mt-2">Personalizá tu experiencia en 4 simples pasos</p>
        </div>
        
        {/* Progress Timeline */}
        <div className="relative mb-12 px-2 sm:px-0 hidden sm:block">
          <div className="absolute top-1/2 left-0 w-full h-[2px] bg-white/5 -translate-y-1/2 z-0 rounded-full" />
          <div 
            className="absolute top-1/2 left-0 h-[2px] bg-gradient-to-r from-amber-500 to-amber-300 -translate-y-1/2 z-0 rounded-full transition-all duration-500 ease-in-out" 
            style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
          />
          
          <div className="relative z-10 flex justify-between">
            {steps.map((s) => {
              const StepIcon = s.icon
              const isActive = step === s.num
              const isCompleted = step > s.num
              
              return (
                <div key={s.num} className="flex flex-col items-center gap-2">
                  <div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 shadow-xl ${
                      isActive 
                        ? 'bg-[#1a1a1a] border-amber-500 text-amber-500 scale-110' 
                        : isCompleted 
                          ? 'bg-amber-500 border-amber-500 text-black' 
                          : 'bg-[#0a0a0a] border-white/10 text-gray-500'
                    }`}
                  >
                    <StepIcon className="w-4 h-4" />
                  </div>
                  <span className={`text-xs font-medium transition-colors ${isActive ? 'text-amber-500' : isCompleted ? 'text-gray-300' : 'text-gray-600'}`}>
                    {s.title}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Mobile Progress Indicator */}
        <div className="sm:hidden mb-8 text-center flex items-center justify-center gap-2">
           <span className="text-amber-500 font-medium">Paso {step} de 4</span>
           <span className="text-gray-500">- {steps[step - 1].title}</span>
        </div>

        <Card className="bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl overflow-hidden relative">
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent pointer-events-none" />
          
          <CardContent className="p-6 sm:p-8 relative z-10 min-h-[400px]">
            {/* Step 1: Servicio */}
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                      <Scissors className="w-5 h-5 text-amber-500" />
                      Elegí tu servicio
                    </h2>
                    <p className="text-sm text-gray-400 mt-1">Seleccioná el tratamiento que deseas realizarte.</p>
                  </div>
                  
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input 
                      placeholder="Buscar servicio..." 
                      className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-amber-500/50"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                  {filteredServicios.map((servicio) => (
                    <div
                      key={servicio.id}
                      className={`group relative p-5 rounded-xl cursor-pointer transition-all duration-300 border ${
                        servicioId === servicio.id 
                          ? 'bg-amber-500/10 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.15)]' 
                          : 'bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10'
                      }`}
                      onClick={() => setServicioId(servicio.id)}
                    >
                      {servicioId === servicio.id && (
                         <div className="absolute top-3 right-3 text-amber-500">
                           <CheckCircle2 className="w-5 h-5" />
                         </div>
                      )}
                      <div className="flex justify-between items-start mb-2 pr-6">
                        <h3 className={`font-semibold text-lg ${servicioId === servicio.id ? 'text-amber-400' : 'text-white'}`}>
                          {servicio.nombre}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-400 line-clamp-2 mb-4 h-10">{servicio.descripcion}</p>
                      
                      <div className="flex justify-between items-end mt-auto pt-4 border-t border-white/5">
                        <div className="flex items-center text-xs text-gray-400 bg-white/5 px-2 py-1 rounded">
                          <Clock className="w-3 h-3 mr-1" />
                          {servicio.duracion_minutos} min
                        </div>
                        <p className="font-bold text-xl text-white">${servicio.precio}</p>
                      </div>
                    </div>
                  ))}
                  
                  {filteredServicios.length === 0 && (
                     <div className="col-span-full py-12 text-center text-gray-500">
                        No se encontraron servicios que coincidan con tu búsqueda.
                     </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Fecha */}
            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="text-center sm:text-left mb-6">
                  <h2 className="text-xl font-semibold text-white flex items-center justify-center sm:justify-start gap-2">
                    <CalendarDays className="w-5 h-5 text-amber-500" />
                    ¿Qué día preferís?
                  </h2>
                  <p className="text-sm text-gray-400 mt-1">Seleccioná una fecha disponible en el calendario.</p>
                </div>
                
                <div className="flex justify-center bg-white/5 p-4 sm:p-8 rounded-xl border border-white/5">
                  <Calendar
                    mode="single"
                    selected={fecha}
                    onSelect={setFecha}
                    disabled={(date) => {
                      const today = new Date()
                      today.setHours(0, 0, 0, 0)
                      // Disable past days and Sundays (0)
                      return date < today || date.getDay() === 0
                    }}
                    className="text-white p-3"
                    classNames={{
                      months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                      month: "space-y-4",
                      caption: "flex justify-center pt-1 relative items-center",
                      caption_label: "text-sm font-medium",
                      nav: "space-x-1 flex items-center",
                      nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 hover:bg-white/10 rounded-md transition-colors",
                      nav_button_previous: "absolute left-1",
                      nav_button_next: "absolute right-1",
                      table: "w-full border-collapse space-y-1",
                      head_row: "flex",
                      head_cell: "text-gray-400 rounded-md w-9 font-normal text-[0.8rem]",
                      row: "flex w-full mt-2",
                      cell: "h-9 w-9 text-center text-sm p-0 flex items-center justify-center",
                      day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-white/10 rounded-md transition-colors aria-selected:bg-amber-500 aria-selected:text-black aria-selected:font-bold",
                      day_disabled: "text-gray-600 hover:bg-transparent cursor-not-allowed",
                      day_today: "bg-white/5 text-amber-400 font-bold",
                    }}
                  />
                </div>
              </div>
            )}

            {/* Step 3: Hora */}
            {step === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="text-center sm:text-left mb-6">
                  <h2 className="text-xl font-semibold text-white flex items-center justify-center sm:justify-start gap-2">
                    <Clock className="w-5 h-5 text-amber-500" />
                    Elegí el horario
                  </h2>
                  <p className="text-sm text-gray-400 mt-1">
                    Mostrando turnos para el {fecha?.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}.
                  </p>
                </div>
                
                <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 p-4 rounded-lg flex items-start gap-3 mb-6">
                  <Clock className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Duración estimada del servicio</p>
                    <p className="text-xs opacity-80 mt-1">Tu cita tomará aproximadamente {servicioSeleccionado?.duracion_minutos} minutos. Por favor, sé puntual.</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {horasDisponibles().map((h) => (
                    <Button
                      key={h}
                      variant="outline"
                      className={`h-12 border transition-all ${
                        hora === h 
                          ? 'bg-amber-500 text-black border-amber-500 hover:bg-amber-600 shadow-[0_0_15px_rgba(245,158,11,0.3)]' 
                          : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white hover:border-white/20'
                      }`}
                      onClick={() => setHora(h)}
                    >
                      {h}
                    </Button>
                  ))}
                  
                  {horasDisponibles().length === 0 && (
                     <div className="col-span-full py-8 text-center text-gray-500">
                        No hay horarios disponibles para esta fecha.
                     </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 4: Confirmar */}
            {step === 4 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="text-center sm:text-left mb-6">
                  <h2 className="text-xl font-semibold text-white flex items-center justify-center sm:justify-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-amber-500" />
                    Revisá y confirmá
                  </h2>
                  <p className="text-sm text-gray-400 mt-1">Acá está el resumen de tu reserva.</p>
                </div>
                
                <div className="bg-white/5 border border-white/10 p-6 rounded-xl space-y-4 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
                  
                  <div className="flex justify-between items-start border-b border-white/5 pb-4">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Servicio seleccionado</p>
                      <p className="text-lg font-semibold text-white">{servicioSeleccionado?.nombre}</p>
                    </div>
                    <p className="text-2xl font-bold border border-amber-500/30 bg-amber-500/10 text-amber-400 px-3 py-1 rounded-lg">
                      ${servicioSeleccionado?.precio}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                      <p className="text-sm text-gray-400 mb-1 flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5" /> Fecha</p>
                      <p className="font-medium text-white">{fecha?.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Horario y Duración</p>
                      <p className="font-medium text-white">{hora} hs <span className="text-gray-500 text-sm ml-1">({servicioSeleccionado?.duracion_minutos} min)</span></p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-white/5">
                  <Label className="text-gray-300 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-400" />
                    Agregá una nota adicional <span className="text-gray-500 font-normal">(opcional)</span>
                  </Label>
                  <Input
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                    placeholder="Ej: Prefiero corte con tijera, necesito atención especial..."
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-amber-500/50"
                  />
                </div>
              </div>
            )}
          </CardContent>

          {/* Navigation Footer */}
          <div className="bg-black/40 border-t border-white/5 p-4 sm:p-6 flex justify-between items-center z-20 relative">
            <Button
              variant="ghost"
              onClick={() => setStep(step - 1)}
              disabled={step === 1}
              className={`text-gray-400 hover:text-white hover:bg-white/10 ${step === 1 ? 'opacity-0 pointer-events-none' : ''}`}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Atrás
            </Button>
            
            {step < 4 ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={isNextDisabled()}
                className="bg-white text-black hover:bg-gray-200 shadow-lg px-8"
              >
                Siguiente
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit} 
                disabled={loading}
                className="bg-amber-500 hover:bg-amber-600 text-black font-bold shadow-[0_0_20px_rgba(245,158,11,0.4)] px-8 min-w-[180px]"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    Procesando...
                  </div>
                ) : (
                  <>
                    Confirmar Reserva
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
