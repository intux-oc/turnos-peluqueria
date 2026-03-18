'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { ArrowRight } from 'lucide-react'
import { Servicio } from '@/types/database'
import { BookingHeader } from '@/components/booking/BookingHeader'
import { StepIndicator } from '@/components/booking/StepIndicator'
import { AdminServiceStep } from '@/components/admin/booking/AdminServiceStep'
import { AdminDateTimeStep } from '@/components/admin/booking/AdminDateTimeStep'
import { AdminConfirmationStep } from '@/components/admin/booking/AdminConfirmationStep'
import { BookingSidebar } from '@/components/booking/BookingSidebar'

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
    const initData = async () => {
      setLoading(true)
      try {
        // 1. Obtener usuario una sola vez
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.push('/login'); return }
        setUser(user)

        // 2. Obtener peluquería vinculada
        const { data: shop, error: shopError } = await supabase
          .from('barbershops')
          .select('id')
          .eq('owner_id', user.id)
          .maybeSingle()
        
        if (shopError) throw shopError
        
        if (!shop) {
          toast.error('No tenés ninguna peluquería registrada')
          router.push('/pagar')
          return
        }
        
        setMiPeluqueriaId(shop.id)

        // 3. Cargar servicios FILTRADOS por peluquería
        const { data: svcs, error: svcsError } = await supabase
          .from('servicios')
          .select('*')
          .eq('barbershop_id', shop.id)
          .eq('activo', true)
          .order('nombre')
        
        if (svcsError) throw svcsError
        if (svcs) setServicios(svcs)

      } catch (error: any) {
        toast.error('Error al cargar datos', { description: error.message })
      } finally {
        setLoading(false)
      }
    }
    
    initData()
  }, [supabase, router])

  useEffect(() => {
    const fetchOcupados = async () => {
      if (!fecha || !miPeluqueriaId) return
      const start = new Date(fecha); start.setHours(0, 0, 0, 0)
      const end = new Date(fecha); end.setHours(23, 59, 59, 999)

      const { data } = await supabase.from('turnos')
        .select('fecha_hora').eq('barbershop_id', miPeluqueriaId)
        .gte('fecha_hora', start.toISOString()).lte('fecha_hora', end.toISOString())
        .in('estado', ['pendiente', 'confirmado'])

      if (data) {
        setHorariosOcupados(new Set(data.map(t => {
          const d = new Date(t.fecha_hora)
          return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
        })))
      }
    }
    fetchOcupados()
  }, [fecha, miPeluqueriaId, supabase])

  const servicioSeleccionado = servicios.find(s => s.id === servicioId)
  const horasDisponibles = () => {
    if (!fecha || !servicioSeleccionado) return []
    const horas = []
    for (let h = 9; h <= 18; h++) {
      for (const m of [0, 30]) {
        if (h === 18 && m === 30) break
        const timeString = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
        if (!horariosOcupados.has(timeString)) horas.push(timeString)
      }
    }
    return horas
  }

  const handleSubmit = async () => {
    if (!user || !servicioId || !fecha || !hora) {
      toast.error('Completá todos los campos')
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
      if (error) throw error
      toast.success('¡Turno reservado!')
      router.push('/mis-turnos')
    } catch (error: any) {
      toast.error('Error al reservar: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  if (!user) return <div className="min-h-screen bg-black flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" /></div>

  const filteredServicios = servicios.filter(s => s.nombre.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="flex flex-col min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black pt-20">
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <BookingHeader barbershop={{ name: 'Admin Panel', slug: 'admin' } as any} />
        
        <div className="flex flex-col lg:flex-row gap-12 mt-8">
          <div className="flex-1">
            <StepIndicator currentStep={step} />
            <div className="mt-8">
              {step === 1 && <AdminServiceStep servicios={filteredServicios} selectedId={servicioId} onSelect={setServicioId} searchTerm={searchTerm} onSearchChange={setSearchTerm} />}
              {step === 2 && <AdminDateTimeStep mode="date" date={fecha} onDateSelect={setFecha} />}
              {step === 3 && <AdminDateTimeStep mode="time" hours={horasDisponibles()} selectedTime={hora} onTimeSelect={setHora} date={fecha} />}
              {step === 4 && <AdminConfirmationStep notas={notas} onNotasChange={setNotas} />}
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 flex justify-end">
              {step < 4 ? (
                <Button onClick={() => setStep(step + 1)} disabled={step === 1 ? !servicioId : step === 2 ? !fecha : !hora} className="h-14 px-12 text-sm tracking-widest uppercase font-light bg-white text-black hover:bg-gray-200 transition-all rounded-none flex items-center gap-2 w-full sm:w-auto">
                  Continuar <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={loading} className="h-14 px-12 text-sm tracking-widest uppercase font-light bg-white text-black hover:bg-gray-200 transition-all rounded-none flex items-center justify-center gap-3 w-full sm:w-auto">
                  {loading ? 'Procesando...' : 'Confirmar Turno'}
                </Button>
              )}
            </div>
          </div>

          <div className="w-full lg:w-80">
            <BookingSidebar servicio={servicioSeleccionado} fecha={fecha} hora={hora} />
          </div>
        </div>
      </main>
    </div>
  )
}
