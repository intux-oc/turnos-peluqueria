import { Input } from '@/components/ui/input'
import { Search, Scissors, CheckCircle2 } from 'lucide-react'
import { Servicio } from '@/types/database'

interface AdminServiceStepProps {
  servicios: Servicio[]
  selectedId: string
  onSelect: (id: string) => void
  searchTerm: string
  onSearchChange: (term: string) => void
}

export function AdminServiceStep({ 
  servicios, 
  selectedId, 
  onSelect, 
  searchTerm, 
  onSearchChange 
}: AdminServiceStepProps) {
  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <Input 
          placeholder="Buscar servicios..." 
          className="pl-12 bg-zinc-900/50 border-white/20 focus:border-white text-white h-12 rounded-none font-light placeholder:text-gray-600 transition-colors"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {servicios.map((servicio) => (
          <div 
            key={servicio.id}
            className={`p-6 border cursor-pointer transition-all ${
              selectedId === servicio.id 
                ? 'border-white bg-white/5' 
                : 'border-white/10 bg-zinc-900/50 hover:border-white/30'
            }`}
            onClick={() => onSelect(servicio.id)}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-light tracking-wide pr-4">{servicio.nombre}</h3>
              {selectedId === servicio.id && <CheckCircle2 className="w-5 h-5 text-white shrink-0" />}
            </div>
            <p className="text-sm text-gray-500 font-light line-clamp-2 h-10 mb-4">{servicio.descripcion}</p>
            <div className="flex items-center justify-between mt-auto">
              <span className="text-xs tracking-widest uppercase font-light text-gray-400">{servicio.duracion_minutos} MIN</span>
              <span className="text-lg font-light">${servicio.precio}</span>
            </div>
          </div>
        ))}
        {servicios.length === 0 && (
           <div className="col-span-full py-12 px-6 border border-white/10 border-dashed text-center">
             <Scissors className="w-8 h-8 text-gray-600 mx-auto mb-3" />
             <p className="text-sm font-light text-gray-500">No se encontraron servicios que coincidan con tu búsqueda.</p>
           </div>
        )}
      </div>
    </div>
  )
}
