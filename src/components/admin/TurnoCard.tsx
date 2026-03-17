import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TurnoWithRelations } from '@/lib/services/turno'
import { Clock, User, Scissors } from 'lucide-react'

interface TurnoCardProps {
  turno: TurnoWithRelations
  onConfirmar?: (id: string) => void
  onCompletar?: (id: string) => void
  onCancelar?: (id: string) => void
}

export function TurnoCard({ turno, onConfirmar, onCompletar, onCancelar }: TurnoCardProps) {
  const fecha = new Date(turno.fecha_hora)
  const formateado = fecha.toLocaleTimeString('es-AR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })

  const estadoColores = {
    pendiente: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    confirmado: 'bg-green-500/10 text-green-500 border-green-500/20',
    completado: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    cancelado: 'bg-red-500/10 text-red-500 border-red-500/20',
  }

  return (
    <Card className={`${estadoColores[turno.estado]} border`}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 opacity-70" />
              <span className="font-medium">{formateado}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 opacity-70" />
              <span className="text-sm text-gray-300">
                {turno.cliente?.full_name || 'Sin nombre'}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Scissors className="h-4 w-4 opacity-70" />
              <span className="text-sm text-gray-300">
                {turno.servicio?.nombre || 'Servicio'}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {turno.estado === 'pendiente' && onConfirmar && (
              <Button 
                size="sm" 
                onClick={() => onConfirmar(turno.id)}
              >
                Confirmar
              </Button>
            )}
            {turno.estado === 'confirmado' && onCompletar && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onCompletar(turno.id)}
              >
                Completar
              </Button>
            )}
            {turno.estado !== 'cancelado' && turno.estado !== 'completado' && onCancelar && (
              <Button 
                size="sm" 
                variant="ghost"
                className="text-red-500 hover:text-red-400"
                onClick={() => onCancelar(turno.id)}
              >
                Cancelar
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}