import { Scissors, User, CalendarDays, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface ConfirmationStepProps {
  servicioNombre: string
  empleadoNombre: string
  fecha: Date
  hora: string
  duracion: number
  loading: boolean
  onBack: () => void
  onConfirm: () => void
}

export function ConfirmationStep({
  servicioNombre,
  empleadoNombre,
  fecha,
  hora,
  duracion,
  loading,
  onBack,
  onConfirm
}: ConfirmationStepProps) {
  return (
    <div className="space-y-6">
      <Card className="bg-zinc-900/40 border-white/10 rounded-none">
        <CardContent className="p-8 space-y-6">
          <p className="text-[10px] tracking-widest uppercase text-gray-500 font-light">Resumen de tu turno</p>

          {[
            { icon: <Scissors className="w-4 h-4 text-gray-500" />, label: 'Servicio', value: servicioNombre },
            { icon: <User className="w-4 h-4 text-gray-500" />, label: 'Profesional', value: empleadoNombre },
            { icon: <CalendarDays className="w-4 h-4 text-gray-500" />, label: 'Fecha', value: fecha.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' }) },
            { icon: <Clock className="w-4 h-4 text-gray-500" />, label: 'Hora', value: hora },
            { icon: <Clock className="w-4 h-4 text-gray-500" />, label: 'Duración', value: `${duracion} min` },
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
          onClick={onBack}
        >
          Atrás
        </Button>
        <Button
          className="flex-1 bg-white text-black hover:bg-gray-200 text-xs tracking-widest uppercase font-light h-12 rounded-none"
          disabled={loading}
          onClick={onConfirm}
        >
          {loading ? 'Confirmando...' : 'Confirmar Turno'}
        </Button>
      </div>
    </div>
  )
}
