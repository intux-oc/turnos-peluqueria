'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { Scissors, Clock, ArrowRight, CalendarDays, Check, MapPin, Phone, Users, User } from 'lucide-react'

import { BookingHeader } from '@/components/booking/BookingHeader'
import { BarbershopInfo } from '@/components/booking/BarbershopInfo'
import { StepIndicator } from '@/components/booking/StepIndicator'
import { ServiceStep } from '@/components/booking/ServiceStep'
import { DateTimeStep } from '@/components/booking/DateTimeStep'
import { EmployeeStep } from '@/components/booking/EmployeeStep'
import { ConfirmationStep } from '@/components/booking/ConfirmationStep'

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

    const slots: TimeSlot[] = []
    for (let h = 9; h < 19; h++) {
      for (const m of [0, 30]) {
        if (h === 18 && m === 30) break
        const time = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
        slots.push({ time, available: true })
      }
    }

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
      <BookingHeader barbershop={barbershop} />

      <main 
        className="flex-1 max-w-3xl w-full mx-auto px-6 py-12 md:py-20 animate-in fade-in duration-700"
        style={{ 
          '--primary': barbershop.primary_color || '#ffffff',
          '--secondary': barbershop.secondary_color || '#000000'
        } as React.CSSProperties}
      >
        <BarbershopInfo barbershop={barbershop} />
        <StepIndicator currentStep={step} />
        
        <p className="text-[10px] tracking-widest uppercase font-light text-gray-400 mb-8">{stepLabel[step - 1]}</p>

        {step === 1 && (
          <ServiceStep 
            servicios={servicios} 
            selectedServicioId={selectedServicio?.id}
            onSelect={(s) => { setSelectedServicio(s); setStep(2) }}
          />
        )}

        {step === 2 && selectedServicio && (
          <DateTimeStep 
            selectedServiceName={selectedServicio.nombre}
            nextDays={nextDays}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            timeSlots={timeSlots}
            onSelectDate={(d) => { setSelectedDate(d); setSelectedTime(null) }}
            onSelectTime={setSelectedTime}
            onBack={() => { setStep(1); setSelectedDate(undefined); setSelectedTime(null) }}
            onContinue={() => setStep(employees.length > 0 ? 3 : 4)}
          />
        )}

        {step === 3 && employees.length > 0 && (
          <EmployeeStep 
            employees={employees}
            selectedEmployeeId={selectedEmployee?.id}
            onSelect={(emp) => { setSelectedEmployee(emp); setStep(4) }}
            onBack={() => setStep(2)}
          />
        )}

        {step === 4 && selectedServicio && selectedDate && selectedTime && (
          <ConfirmationStep 
            servicioNombre={selectedServicio.nombre}
            empleadoNombre={selectedEmployee?.nombre || 'Cualquiera'}
            fecha={selectedDate}
            hora={selectedTime}
            duracion={selectedServicio.duracion_minutos}
            loading={booking}
            onBack={() => setStep(employees.length > 0 ? 3 : 2)}
            onConfirm={handleBook}
          />
        )}
      </main>
    </div>
  )
}
