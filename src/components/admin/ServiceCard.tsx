import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Scissors, Edit2, Power, PowerOff, Clock } from 'lucide-react'

interface Servicio {
  id: string
  nombre: string
  descripcion: string | null
  precio: number
  duracion_minutos: number
  activo: boolean
}

interface ServiceCardProps {
  servicio: Servicio
  onEdit: (servicio: Servicio) => void
  onToggleActive: (servicio: Servicio) => void
}

export function ServiceCard({ servicio, onEdit, onToggleActive }: ServiceCardProps) {
  return (
    <Card 
      className={`bg-zinc-900/40 border-white/10 rounded-none overflow-hidden relative group transition-all duration-500 hover:bg-zinc-900/60 hover:border-white/30 ${!servicio.activo ? 'opacity-40 grayscale' : ''}`}
    >
      <CardContent className="p-8">
        <div className="flex justify-between items-start mb-6">
          <div className="p-3 bg-black border border-white/5 rounded-none group-hover:border-white/20 transition-colors">
            <Scissors className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
          </div>
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onEdit(servicio)}
              className="h-8 w-8 text-gray-500 hover:text-white hover:bg-white/5 rounded-none"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onToggleActive(servicio)}
              className={`h-8 w-8 rounded-none ${servicio.activo ? 'text-gray-500 hover:text-red-400' : 'text-green-500 hover:text-green-400'}`}
            >
              {servicio.activo ? <PowerOff className="w-3.5 h-3.5" /> : <Power className="w-3.5 h-3.5" />}
            </Button>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-light tracking-wider uppercase mb-2 group-hover:text-white transition-colors">
            {servicio.nombre}
          </h3>
          <p className="text-gray-500 font-light text-xs leading-relaxed line-clamp-2 h-8">
            {servicio.descripcion || 'Tratamiento estético profesional.'}
          </p>
        </div>

        <div className="pt-6 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-[10px] tracking-widest uppercase font-light text-gray-400">
              <Clock className="w-3 h-3" />
              {servicio.duracion_minutos} MIN
            </div>
          </div>
          <div className="text-lg font-light tracking-tighter">
            ${servicio.precio}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
