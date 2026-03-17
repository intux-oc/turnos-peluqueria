import { TurnoWithRelations } from '@/lib/services/turno'
import { TurnoCard } from './TurnoCard'

interface ScheduleListProps {
  turnos: TurnoWithRelations[]
  onConfirmar?: (id: string) => void
  onCompletar?: (id: string) => void
  onCancelar?: (id: string) => void
  titulo?: string
}

export function ScheduleList({ 
  turnos, 
  onConfirmar, 
  onCompletar, 
  onCancelar,
  titulo = 'Turnos del Día' 
}: ScheduleListProps) {
  if (turnos.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No hay turnos para hoy
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{titulo}</h3>
      <div className="space-y-3">
        {turnos.map((turno) => (
          <TurnoCard
            key={turno.id}
            turno={turno}
            onConfirmar={onConfirmar}
            onCompletar={onCompletar}
            onCancelar={onCancelar}
          />
        ))}
      </div>
    </div>
  )
}