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
    <div className="flex flex-col min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black">
      {/* Navigation */}
      <nav className="sticky top-0 w-full z-50 px-6 py-6 bg-black/80 backdrop-blur-md border-b border-white/10 flex items-center justify-between">
        <div className="text-xl font-light tracking-widest uppercase cursor-pointer hover:text-gray-300 transition-colors" onClick={() => router.push('/')}>
          Peluquería
        </div>
        <div className="flex items-center gap-6">
          <Button 
            variant="ghost" 
            className="hidden md:flex text-xs tracking-widest uppercase font-light hover:text-white hover:bg-white/5"
            onClick={() => router.push('/perfil')}
          >
            <UserIcon className="w-4 h-4 mr-2" /> Profile
          </Button>
        </div>
      </nav>

      <main className="flex-1 max-w-5xl w-full mx-auto p-6 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
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
            <ArrowLeft className="w-3 h-3 mr-2" /> {step === 1 ? 'Back to Appointments' : 'Previous Step'}
          </Button>
          <h1 className="text-4xl font-light tracking-wide mb-2">Book Appointment</h1>
          <p className="text-gray-500 font-light text-sm tracking-wide">
            Select your service, date, and time.
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
                        placeholder="Search services..." 
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
                           <p className="text-sm font-light text-gray-500">No services found matching your search.</p>
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
                      Showing availability for {fecha?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
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
                           <p className="text-sm font-light text-gray-500">No available time slots for this date.</p>
                         </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 4: Details & Confirm */}
                {step === 4 && (
                  <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                    <div className="space-y-3">
                      <Label className="text-xs tracking-widest uppercase text-gray-400 font-light">Additional Notes (Optional)</Label>
                      <Input
                        value={notas}
                        onChange={(e) => setNotas(e.target.value)}
                        placeholder="Any special requests or preferences?"
                        className="bg-zinc-900/50 border-white/20 focus:border-white text-white h-14 rounded-none font-light placeholder:text-gray-600 transition-colors"
                      />
                    </div>
                    
                    <div className="border border-white/10 p-6 bg-zinc-900/30">
                       <h4 className="text-sm tracking-widest uppercase text-white font-light border-b border-white/10 pb-4 mb-4">
                          Cancellation Policy
                       </h4>
                       <p className="text-xs text-gray-500 font-light leading-relaxed">
                          Please note that cancellations or rescheduling must be done at least 2 hours prior to your appointment time. We value your time and the time of our professionals.
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
                  Continue <ArrowRight className="w-4 h-4" />
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
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      Confirm Booking <CheckCircle2 className="w-4 h-4 ml-1" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Booking Summary Sidebar */}
          <div className="w-full lg:w-80 shrink-0">
             <div className="sticky top-32 border border-white/10 bg-zinc-900/50 p-6">
                <h3 className="text-sm tracking-widest uppercase text-white font-light border-b border-white/10 pb-4 mb-6">
                  Booking Summary
                </h3>
                
                <div className="space-y-6">
                  {/* Service Detail */}
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                      <Scissors className="w-4 h-4 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-[10px] tracking-widest uppercase text-gray-500 mb-1">Service</p>
                      <p className="text-sm font-light text-white">
                        {servicioSeleccionado ? servicioSeleccionado.nombre : 'Not selected'}
                      </p>
                      {servicioSeleccionado && (
                        <p className="text-xs text-gray-500 mt-1">{servicioSeleccionado.duracion_minutos} min</p>
                      )}
                    </div>
                  </div>

                  {/* Date & Time Detail */}
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                      <CalendarCheck className="w-4 h-4 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-[10px] tracking-widest uppercase text-gray-500 mb-1">Date & Time</p>
                      <p className="text-sm font-light text-white">
                        {fecha ? fecha.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Not selected'}
                      </p>
                      {hora && (
                        <p className="text-xs text-gray-500 mt-1">{hora}</p>
                      )}
                    </div>
                  </div>

                  {/* Location Detail (Static for demo) */}
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-[10px] tracking-widest uppercase text-gray-500 mb-1">Location</p>
                      <p className="text-sm font-light text-white">Peluquería Central</p>
                      <p className="text-xs text-gray-500 mt-1">123 Main St, City</p>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="pt-6 border-t border-white/10 flex items-end justify-between">
                     <div>
                       <p className="text-[10px] tracking-widest uppercase text-gray-500 mb-1">Total</p>
                       <p className="text-2xl font-light text-white">
                         {servicioSeleccionado ? `$${servicioSeleccionado.precio}` : '-'}
                       </p>
                     </div>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </main>
    </div>
  )
}
