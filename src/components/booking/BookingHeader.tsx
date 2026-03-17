'use client'

import { Button } from '@/components/ui/button'
import { Barbershop } from '@/types/database'
import { useRouter } from 'next/navigation'

interface BookingHeaderProps {
  barbershop: Barbershop
}

export function BookingHeader({ barbershop }: BookingHeaderProps) {
  const router = useRouter()
  
  return (
    <nav className="sticky top-0 z-50 w-full px-6 py-5 bg-black/80 backdrop-blur-md border-b border-white/10 flex items-center justify-between">
      <div className="flex items-center gap-4">
        {barbershop.logo_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={barbershop.logo_url} alt={barbershop.name} className="h-8 w-auto object-contain" />
        )}
        <div className="text-xl font-light tracking-widest uppercase" style={{ color: barbershop.primary_color || 'white' }}>
          {barbershop.name}
        </div>
      </div>
      <Button
        variant="ghost"
        className="text-xs tracking-widest uppercase font-light hover:text-white hover:bg-white/5"
        onClick={() => router.push('/mis-turnos')}
      >
        Mis Turnos
      </Button>
    </nav>
  )
}
