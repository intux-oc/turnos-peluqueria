'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { toast } from 'sonner'

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
    const fechaStr = fecha.toISOString().split('T')[0]
    
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
      toast.error('Completá todos los campos')
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

      toast.success('Turno reservado correctamente!')
      router.push('/mis-turnos')
    } catch (error: any) {
      toast.error(error.message)
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

  if (!user) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-center mb-8">Reservar Turno</h1>
        
        {/* Progress */}
        <div className="flex justify-center mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                s <= step ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}>
                {s}
              </div>
              {s < 4 && <div className={`w-16 h-1 ${s < step ? 'bg-blue-600' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        <Card>
          <CardContent className="pt-6">
            {/* Step 1: Servicio */}
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Seleccioná un servicio</h2>
                <div className="grid gap-3">
                  {servicios.map((servicio) => (
                    <div
                      key={servicio.id}
                      className={`p-4 border rounded-lg cursor-pointer hover:border-blue-500 ${
                        servicioId === servicio.id ? 'border-blue-500 bg-blue-50' : ''
                      }`}
                      onClick={() => setServicioId(servicio.id)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{servicio.nombre}</p>
                          <p className="text-sm text-gray-500">{servicio.descripcion}</p>
                          <p className="text-xs text-gray-400">{servicio.duracion_minutos} min</p>
                        </div>
                        <p className="font-bold text-lg">${servicio.precio}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Fecha */}
            {step === 2 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Seleccioná una fecha</h2>
                <div className="flex justify-center">
                  <Calendar
                    mode="single"
                    selected={fecha}
                    onSelect={setFecha}
                    disabled={(date) => {
                      const today = new Date()
                      today.setHours(0, 0, 0, 0)
                      return date < today || date.getDay() === 0
                    }}
                    className="rounded-md border"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Hora */}
            {step === 3 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Seleccioná un horario</h2>
                <p className="text-sm text-gray-500">
                  Duración del servicio: {servicioSeleccionado?.duracion_minutos} minutos
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {horasDisponibles().map((h) => (
                    <Button
                      key={h}
                      variant={hora === h ? 'default' : 'outline'}
                      onClick={() => setHora(h)}
                    >
                      {h}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Confirmar */}
            {step === 4 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Confirmar turno</h2>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p><strong>Servicio:</strong> {servicioSeleccionado?.nombre}</p>
                  <p><strong>Precio:</strong> ${servicioSeleccionado?.precio}</p>
                  <p><strong>Fecha:</strong> {fecha?.toLocaleDateString('es-AR')}</p>
                  <p><strong>Hora:</strong> {hora}</p>
                  <p><strong>Duración:</strong> {servicioSeleccionado?.duracion_minutos} min</p>
                </div>
                <div>
                  <Label>Notas adicionales (opcional)</Label>
                  <Input
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                    placeholder="Algo que quieras comunicar..."
                  />
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                disabled={step === 1}
              >
                Atrás
              </Button>
              {step < 4 ? (
                <Button
                  onClick={() => setStep(step + 1)}
                  disabled={isNextDisabled()}
                >
                  Siguiente
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={loading}>
                  {loading ? 'Reservando...' : 'Confirmar Turno'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
