'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Scissors, CalendarDays, Clock, MapPin } from 'lucide-react'
import { Servicio } from '@/types/database'

interface BookingSidebarProps {
  servicio?: Servicio
  fecha?: Date
  hora?: string
}

export function BookingSidebar({ servicio, fecha, hora }: BookingSidebarProps) {
  return (
    <div className="sticky top-24 space-y-6">
      <Card className="bg-zinc-900 border-white/10 rounded-none overflow-hidden">
        <div className="h-2 bg-white w-full" />
        <CardContent className="p-6">
          <h3 className="text-xs tracking-widest uppercase text-gray-500 font-light mb-6">Resumen de Reserva</h3>
          
          <div className="space-y-6">
            {servicio ? (
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <Scissors className="w-4 h-4 text-gray-400" />
                </div>
                <div>
                  <p className="text-[10px] tracking-widest uppercase text-gray-500 font-light mb-1">Servicio</p>
                  <p className="text-sm font-light">{servicio.nombre}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4 text-gray-600">
                <div className="w-10 h-10 border border-white/5 flex items-center justify-center">?</div>
                <p className="text-xs font-light italic">Ningún servicio seleccionado</p>
              </div>
            )}

            {fecha && (
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <CalendarDays className="w-4 h-4 text-gray-400" />
                </div>
                <div>
                  <p className="text-[10px] tracking-widest uppercase text-gray-500 font-light mb-1">Fecha</p>
                  <p className="text-sm font-light capitalize">
                    {fecha.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </p>
                </div>
              </div>
            )}

            {hora && (
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-gray-400" />
                </div>
                <div>
                  <p className="text-[10px] tracking-widest uppercase text-gray-500 font-light mb-1">Hora</p>
                  <p className="text-sm font-light">{hora} HS</p>
                </div>
              </div>
            )}

            {servicio && (
              <div className="pt-6 border-t border-white/10 flex justify-between items-end">
                <div>
                  <p className="text-[10px] tracking-widest uppercase text-gray-500 font-light mb-1">Total</p>
                  <p className="text-2xl font-light">${servicio.precio}</p>
                </div>
                <p className="text-[10px] tracking-widest uppercase text-gray-500 font-light">
                  {servicio.duracion_minutos} MIN
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="p-6 border border-white/5 bg-zinc-900/20">
        <div className="flex items-center gap-3 text-gray-500 mb-4">
          <MapPin className="w-4 h-4" />
          <span className="text-[10px] tracking-widest uppercase font-light">Ubicación</span>
        </div>
        <p className="text-xs font-light text-gray-400 leading-relaxed">
          Av. Principal 123, Ciudad<br />
          Piso 1, Oficina A
        </p>
      </div>
    </div>
  )
}
