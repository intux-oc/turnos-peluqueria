import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { CalendarDays, Clock } from 'lucide-react'

interface AdminDateTimeStepProps {
  mode: 'date' | 'time'
  date?: Date
  onDateSelect?: (date: Date | undefined) => void
  hours?: string[]
  selectedTime?: string
  onTimeSelect?: (time: string) => void
}

export function AdminDateTimeStep({ 
  mode, 
  date, 
  onDateSelect, 
  hours, 
  selectedTime, 
  onTimeSelect 
}: AdminDateTimeStepProps) {
  if (mode === 'date') {
    return (
      <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
        <div className="border border-white/10 bg-zinc-900/50 p-6 flex justify-center">
          <Calendar
            mode="single"
            selected={date}
            onSelect={onDateSelect}
            disabled={(date) => {
              const today = new Date()
              today.setHours(0, 0, 0, 0)
              return date < today || date.getDay() === 0
            }}
            className="text-white font-light"
            classNames={{
              months: "space-y-4",
              month: "space-y-4",
              caption: "flex justify-center pt-1 relative items-center mb-4",
              caption_label: "text-sm tracking-widest uppercase font-light",
              nav: "space-x-1 flex items-center",
              nav_button: "h-7 w-7 bg-transparent p-0 text-gray-400 hover:text-white transition-colors",
              nav_button_previous: "absolute left-1",
              nav_button_next: "absolute right-1",
              table: "w-full border-collapse space-y-1",
              head_row: "flex w-full",
              head_cell: "text-gray-500 w-10 sm:w-12 font-light text-xs tracking-widest uppercase",
              row: "flex w-full mt-2",
              cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
              day: "h-10 w-10 sm:h-12 sm:w-12 p-0 font-light hover:bg-white/10 transition-colors aria-selected:bg-white aria-selected:text-black rounded-none",
              day_disabled: "text-gray-700 hover:bg-transparent cursor-not-allowed",
              day_today: "border border-white/20",
            }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
      <div className="text-sm font-light text-gray-400 mb-6 flex items-center gap-2">
        <CalendarDays className="w-4 h-4" /> 
        Mostrando disponibilidad para {date?.toLocaleDateString('es-AR', { weekday: 'long', month: 'long', day: 'numeric' })}
      </div>
      
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {hours?.map((h) => (
          <Button
            key={h}
            variant="outline"
            className={`h-12 rounded-none font-light tracking-widest text-sm transition-colors ${
              selectedTime === h 
                ? 'bg-white text-black border-white hover:bg-gray-200' 
                : 'bg-zinc-900/50 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/30'
            }`}
            onClick={() => onTimeSelect?.(h)}
          >
            {h}
          </Button>
        ))}
        {hours?.length === 0 && (
           <div className="col-span-full py-12 px-6 border border-white/10 border-dashed text-center">
             <Clock className="w-8 h-8 text-gray-600 mx-auto mb-3" />
             <p className="text-sm font-light text-gray-500">No hay horarios disponibles para esta fecha.</p>
           </div>
        )}
      </div>
    </div>
  )
}
