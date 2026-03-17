'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { Scissors, Clock, ArrowRight, CalendarDays, Check, MapPin, Phone, Users, User } from 'lucide-react'

import { Barbershop, Empleado } from '@/types/database'

interface Servicio {
  id: string
  nombre: string
  descripcion: string | null
  duracion_minutos: number
}

interface TimeSlot {
  time: string
  available: boolean
}

const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

export default function PublicBookingPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const slug = params.slug as string

  const [barbershop, setBarbershop] = useState<Barbershop | null>(null)
  const [servicios, setServicios] = useState<Servicio[]>([])
  const [employees, setEmployees] = useState<Empleado[]>([])
  const [selectedServicio, setSelectedServicio] = useState<Servicio | null>(null)
  const [selectedEmployee, setSelectedEmployee] = useState<Empleado | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [booking, setBooking] = useState(false)
  const [notFound, setNotFound] = useState(false)

  // Generate the next 7 days
  const nextDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i)
    return d
  })

  useEffect(() => {
    fetchBarbershop()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug])

  useEffect(() => {
    if (barbershop) fetchServicios()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [barbershop])

  useEffect(() => {
    if (selectedDate && selectedServicio) generateTimeSlots()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, selectedServicio])

  const fetchBarbershop = async () => {
    const { data, error } = await supabase
      .from('barbershops')
      .select('id, name, slug, address, phone, primary_color, secondary_color, logo_url')
      .eq('slug', slug)
      .single()

    if (error || !data) { setNotFound(true); return }
    const shop = data as unknown as Barbershop
    setBarbershop(shop)
    fetchEmployees(shop.id)
  }

  const fetchServicios = async () => {
    const { data } = await supabase
      .from('servicios')
      .select('id, nombre, descripcion, duracion_minutos')
      .eq('barbershop_id', barbershop!.id)
      .eq('activo', true)
      .order('nombre')
    setServicios(data ?? [])
  }

  const fetchEmployees = async (shopId: string) => {
    const { data } = await supabase
      .from('empleados')
      .select('*')
      .eq('barbershop_id', shopId)
      .eq('activo', true)
    
    setEmployees(data || [])
  }

  const generateTimeSlots = async () => {
    if (!selectedDate || !selectedServicio || !barbershop) return

    // Generate slots from 9:00 to 18:30 every 30 min
    const slots: TimeSlot[] = []
    for (let h = 9; h < 19; h++) {
      for (const m of [0, 30]) {
        if (h === 18 && m === 30) break
        const time = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
        slots.push({ time, available: true })
      }
    }

    // Check already booked slots
    const start = new Date(selectedDate)
    start.setHours(0, 0, 0, 0)
    const end = new Date(selectedDate)
    end.setHours(23, 59, 59, 999)

    const { data: bookedTurnos } = await supabase
      .from('turnos')
      .select('fecha_hora')
      .eq('barbershop_id', barbershop.id)
      .gte('fecha_hora', start.toISOString())
      .lte('fecha_hora', end.toISOString())
      .in('estado', ['pendiente', 'confirmado'])

    const bookedTimes = new Set(
      (bookedTurnos ?? []).map(t => {
        const d = new Date(t.fecha_hora)
        return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
      })
    )

    setTimeSlots(slots.map(s => ({ ...s, available: !bookedTimes.has(s.time) })))
  }

  const handleBook = async () => {
    if (!selectedServicio || !selectedDate || !selectedTime || !barbershop) return
    setBooking(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.error('Necesitás iniciar sesión para reservar')
      router.push(`/login?redirect=/b/${slug}`)
      setBooking(false)
      return
    }

    const [h, m] = selectedTime.split(':').map(Number)
    const fechaHora = new Date(selectedDate)
    fechaHora.setHours(h, m, 0, 0)

    const { data: insertedTurno, error } = await supabase.from('turnos').insert({
      barbershop_id: barbershop.id,
      cliente_id: user.id,
      servicio_id: selectedServicio.id,
      empleado_id: selectedEmployee?.id || null,
      fecha_hora: fechaHora.toISOString(),
      estado: 'pendiente',
    }).select().single()

    if (error) {
      if (error.code === '23505') {
        toast.error('¡Ups! Alguien acaba de reservar este horario.', {
          description: 'Por favor, selecciona otro horario disponible.'
        })
        generateTimeSlots() 
      } else {
        toast.error('No se pudo confirmar el turno', { description: error.message })
      }
      setBooking(false)
      return
    }

    // Enviar email de confirmación (background)
    if (insertedTurno) {
      fetch('/api/notifications/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ turnoId: insertedTurno.id })
      }).catch(err => console.error('Error enviando mail:', err))
    }
    
    toast.success('¡Turno reservado!', { description: `${selectedServicio.nombre} el ${selectedDate.toLocaleDateString('es-AR')} a las ${selectedTime}` })
    router.push('/mis-turnos')
  }

  if (notFound) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="text-center">
          <p className="text-[10px] tracking-widest uppercase text-gray-500 mb-4">404</p>
          <h1 className="text-3xl font-light uppercase mb-2">Peluquería no encontrada</h1>
          <p className="text-gray-500 font-light text-sm">El link que usaste no existe o fue dado de baja.</p>
        </div>
      </div>
    )
  }

  if (!barbershop) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="h-8 w-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
      </div>
    )
  }

  const stepLabel = ['Elegí un servicio', 'Elegí fecha y hora', 'Elegí profesional', 'Confirmá tu turno']

  return (
    <div className="flex flex-col min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full px-6 py-5 bg-black/80 backdrop-blur-md border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {barbershop.logo_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={barbershop.logo_url} alt={barbershop.name} className="h-8 w-auto object-contain" />
          )}
          <div className="text-xl font-light tracking-widest uppercase" style={{ color: barbershop.primary_color || 'white' }}>
            {barbershop.name}
          </div>
        </div>
        <Button
          variant="ghost"
          className="text-xs tracking-widest uppercase font-light hover:text-white hover:bg-white/5"
          onClick={() => router.push('/mis-turnos')}
        >
          Mis Turnos
        </Button>
      </nav>

      <main 
        className="flex-1 max-w-3xl w-full mx-auto px-6 py-12 md:py-20 animate-in fade-in duration-700"
        style={{ 
          '--primary': barbershop.primary_color || '#ffffff',
          '--secondary': barbershop.secondary_color || '#000000'
        } as React.CSSProperties}
      >

        {/* Barbershop Info */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-[10px] tracking-widest uppercase text-gray-500 font-light mb-1">Reserva un turno en</p>
            <h1 className="text-3xl font-light tracking-wide uppercase">{barbershop.name}</h1>
            <div className="flex items-center gap-4 mt-2">
              {barbershop.address && (
                <span className="flex items-center gap-1.5 text-xs text-gray-500 font-light">
                  <MapPin className="w-3 h-3" /> {barbershop.address}
                </span>
              )}
              {barbershop.phone && (
                <span className="flex items-center gap-1.5 text-xs text-gray-500 font-light">
                  <Phone className="w-3 h-3" /> {barbershop.phone}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Step Progress */}
        <div className="flex items-center gap-0 mb-10">
          {[1, 2, 3, 4].map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <div className={`w-8 h-8 flex items-center justify-center text-xs font-light tracking-wider border transition-all ${step === s ? 'bg-white text-black border-white' : step > s ? 'bg-white/20 border-white/20 text-white' : 'border-white/10 text-gray-600'}`}>
                {step > s ? <Check className="w-3.5 h-3.5" /> : s}
              </div>
              {i < 3 && <div className={`flex-1 h-px transition-all ${step > s ? 'bg-white/30' : 'bg-white/10'}`} />}
            </div>
          ))}
        </div>
        <p className="text-[10px] tracking-widest uppercase font-light text-gray-400 mb-8">{stepLabel[step - 1]}</p>

        {/* Step 1: Select Service */}
        {step === 1 && (
          <div className="grid grid-cols-1 gap-4">
            {servicios.length === 0 ? (
              <div className="py-20 border border-white/10 border-dashed text-center">
                <Scissors className="w-8 h-8 text-gray-700 mx-auto mb-4" />
                <p className="text-sm font-light text-gray-500">Esta peluquería aún no tiene servicios disponibles.</p>
              </div>
            ) : (
              servicios.map((s) => (
                <button
                  key={s.id}
                  onClick={() => { setSelectedServicio(s); setStep(2) }}
                  className={`flex items-center justify-between p-6 border text-left transition-all hover:border-white/40 ${selectedServicio?.id === s.id ? 'border-white bg-white/5' : 'border-white/10 bg-zinc-900/30'}`}
                >
                  <div className="flex items-center gap-6">
                    <div className="p-2.5 border border-white/5 bg-black">
                      <Scissors className="w-4 h-4 text-gray-400" />
                    </div>
                    <div>
                      <h4 className="font-light tracking-wide text-white">{s.nombre}</h4>
                      {s.descripcion && <p className="text-xs text-gray-500 font-light mt-0.5">{s.descripcion}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-6 shrink-0">
                    <span className="flex items-center gap-1.5 text-xs text-gray-500 font-light">
                      <Clock className="w-3 h-3" /> {s.duracion_minutos} min
                    </span>
                    <ArrowRight className="w-4 h-4 text-gray-600" />
                  </div>
                </button>
              ))
            )}
          </div>
        )}

        {/* Step 2: Select Date & Time */}
        {step === 2 && selectedServicio && (
          <div className="space-y-8">
            {/* Selected service recap */}
            <div className="flex items-center justify-between p-4 border border-white/10 bg-zinc-900/30">
              <div className="flex items-center gap-3">
                <Scissors className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-light">{selectedServicio?.nombre}</span>
              </div>
              <button onClick={() => { setStep(1); setSelectedDate(undefined); setSelectedTime(null) }} className="text-[10px] tracking-widest uppercase text-gray-600 hover:text-white font-light">
                Cambiar
              </button>
            </div>

            {/* Date picker */}
            <div>
              <p className="text-[10px] tracking-widest uppercase text-gray-500 font-light mb-4">Fecha</p>
              <div className="grid grid-cols-7 gap-2">
                {nextDays.map((d, i) => {
                  const isSelected = selectedDate?.toDateString() === d.toDateString()
                  return (
                    <button
                      key={i}
                      onClick={() => { setSelectedDate(d); setSelectedTime(null) }}
                      className={`flex flex-col items-center py-3 border transition-all ${isSelected ? 'border-white bg-white text-black' : 'border-white/10 hover:border-white/30 text-white'}`}
                    >
                      <span className="text-[10px] uppercase font-light">{DAYS[d.getDay()]}</span>
                      <span className="text-lg font-light mt-0.5">{d.getDate()}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Time slots */}
            {selectedDate && (
              <div>
                <p className="text-[10px] tracking-widest uppercase text-gray-500 font-light mb-4">Horario</p>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {timeSlots.map(({ time, available }) => (
                    <button
                      key={time}
                      disabled={!available}
                      onClick={() => setSelectedTime(time)}
                      className={`py-3 text-sm font-light border transition-all ${!available ? 'border-white/5 text-gray-700 cursor-not-allowed' : selectedTime === time ? 'border-white bg-white text-black' : 'border-white/10 hover:border-white/30'}`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <Button
              className="w-full bg-white text-black hover:bg-gray-200 text-xs tracking-widest uppercase font-light h-12 rounded-none disabled:opacity-30"
              disabled={!selectedDate || !selectedTime}
              onClick={() => setStep(employees.length > 0 ? 3 : 4)}
            >
              Continuar <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {/* Step 3: Select Professional */}
        {step === 3 && employees.length > 0 && (
          <div className="space-y-6">
             <div className="grid grid-cols-1 gap-4">
               <button
                  onClick={() => { setSelectedEmployee(null); setStep(4) }}
                  className={`flex items-center justify-between p-6 border text-left transition-all hover:border-white/40 ${selectedEmployee === null ? 'border-white bg-white/5' : 'border-white/10 bg-zinc-900/30'}`}
                >
                  <div className="flex items-center gap-6">
                    <div className="p-2.5 border border-white/5 bg-black">
                      <Users className="w-4 h-4 text-gray-400" />
                    </div>
                    <div>
                      <h4 className="font-light tracking-wide text-white">Cualquier Profesional</h4>
                      <p className="text-xs text-gray-500 font-light mt-0.5">Te asignaremos el primero disponible.</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-600" />
                </button>

                {employees.map((emp) => (
                  <button
                    key={emp.id}
                    onClick={() => { setSelectedEmployee(emp); setStep(4) }}
                    className={`flex items-center justify-between p-6 border text-left transition-all hover:border-white/40 ${selectedEmployee?.id === emp.id ? 'border-white bg-white/5' : 'border-white/10 bg-zinc-900/30'}`}
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-10 h-10 border border-white/10 overflow-hidden bg-black flex items-center justify-center">
                        {emp.foto_url ? (
                          <img src={emp.foto_url} alt={emp.nombre} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-4 h-4 text-gray-600" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-light tracking-wide text-white">{emp.nombre}</h4>
                        <p className="text-xs text-gray-500 font-light mt-0.5">{emp.especialidad || 'Peluquero'}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-600" />
                  </button>
                ))}
             </div>
             <Button
                variant="outline"
                className="w-full border-white/10 hover:bg-white/5 text-xs tracking-widest uppercase font-light h-12 rounded-none"
                onClick={() => setStep(2)}
              >
                Atrás
              </Button>
          </div>
        )}

        {/* Step 4: Confirm */}
        {step === 4 && selectedServicio && selectedDate && selectedTime && (
          <div className="space-y-6">
            <Card className="bg-zinc-900/40 border-white/10 rounded-none">
              <CardContent className="p-8 space-y-6">
                <p className="text-[10px] tracking-widest uppercase text-gray-500 font-light">Resumen de tu turno</p>

                {[
                  { icon: <Scissors className="w-4 h-4 text-gray-500" />, label: 'Servicio', value: selectedServicio.nombre },
                  { icon: <User className="w-4 h-4 text-gray-500" />, label: 'Profesional', value: selectedEmployee?.nombre || 'Cualquiera' },
                  { icon: <CalendarDays className="w-4 h-4 text-gray-500" />, label: 'Fecha', value: selectedDate.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' }) },
                  { icon: <Clock className="w-4 h-4 text-gray-500" />, label: 'Hora', value: selectedTime },
                  { icon: <Clock className="w-4 h-4 text-gray-500" />, label: 'Duración', value: `${selectedServicio.duracion_minutos} min` },
                ].map(({ icon, label, value }) => (
                  <div key={label} className="flex items-center gap-4">
                    {icon}
                    <div>
                      <p className="text-[10px] tracking-widest uppercase text-gray-500 font-light">{label}</p>
                      <p className="text-sm font-light capitalize">{value}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button
                variant="outline"
                className="flex-1 border-white/10 hover:bg-white/5 text-xs tracking-widest uppercase font-light h-12 rounded-none"
                onClick={() => setStep(2)}
              >
                Atrás
              </Button>
              <Button
                className="flex-1 bg-white text-black hover:bg-gray-200 text-xs tracking-widest uppercase font-light h-12 rounded-none"
                disabled={booking}
                onClick={handleBook}
              >
                {booking ? 'Confirmando...' : 'Confirmar Turno'}
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
