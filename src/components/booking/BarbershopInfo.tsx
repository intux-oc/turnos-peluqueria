import { MapPin, Phone } from 'lucide-react'
import { Barbershop } from '@/types/database'

interface BarbershopInfoProps {
  barbershop: Barbershop
}

export function BarbershopInfo({ barbershop }: BarbershopInfoProps) {
  return (
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
  )
}
