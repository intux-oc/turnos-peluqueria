import { Scissors, Clock, ArrowRight } from 'lucide-react'

interface Servicio {
  id: string
  nombre: string
  descripcion: string | null
  duracion_minutos: number
}

interface ServiceStepProps {
  servicios: Servicio[]
  selectedServicioId?: string
  onSelect: (servicio: Servicio) => void
}

export function ServiceStep({ servicios, selectedServicioId, onSelect }: ServiceStepProps) {
  if (servicios.length === 0) {
    return (
      <div className="py-20 border border-white/10 border-dashed text-center">
        <Scissors className="w-8 h-8 text-gray-700 mx-auto mb-4" />
        <p className="text-sm font-light text-gray-500">Esta peluquería aún no tiene servicios disponibles.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {servicios.map((s) => (
        <button
          key={s.id}
          onClick={() => onSelect(s)}
          className={`flex items-center justify-between p-6 border text-left transition-all hover:border-white/40 ${selectedServicioId === s.id ? 'border-white bg-white/5' : 'border-white/10 bg-zinc-900/30'}`}
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
      ))}
    </div>
  )
}
