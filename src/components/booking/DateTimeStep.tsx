import { Scissors, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TimeSlot {
  time: string
  available: boolean
}

interface DateTimeStepProps {
  selectedServiceName?: string
  nextDays: Date[]
  selectedDate?: Date
  selectedTime: string | null
  timeSlots: TimeSlot[]
  onSelectDate: (date: Date) => void
  onSelectTime: (time: string) => void
  onBack: () => void
  onContinue: () => void
}

const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

export function DateTimeStep({
  selectedServiceName,
  nextDays,
  selectedDate,
  selectedTime,
  timeSlots,
  onSelectDate,
  onSelectTime,
  onBack,
  onContinue
}: DateTimeStepProps) {
  return (
    <div className="space-y-8">
      {/* Selected service recap */}
      <div className="flex items-center justify-between p-4 border border-white/10 bg-zinc-900/30">
        <div className="flex items-center gap-3">
          <Scissors className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-light">{selectedServiceName}</span>
        </div>
        <button onClick={onBack} className="text-[10px] tracking-widest uppercase text-gray-600 hover:text-white font-light">
          Cambiar
        </button>
      </div>

      {/* Date picker */}
      <div>
        <p className="text-[10px] tracking-widest uppercase text-gray-500 font-light mb-4">Fecha</p>
        <div className="grid grid-cols-7 gap-2">
          {nextDays.map((d, i) => {
            const isSelected = selectedDate?.toDateString() === d.toDateString()
            return (
              <button
                key={i}
                onClick={() => onSelectDate(d)}
                className={`flex flex-col items-center py-3 border transition-all ${isSelected ? 'border-white bg-white text-black' : 'border-white/10 hover:border-white/30 text-white'}`}
              >
                <span className="text-[10px] uppercase font-light">{DAYS[d.getDay()]}</span>
                <span className="text-lg font-light mt-0.5">{d.getDate()}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Time slots */}
      {selectedDate && (
        <div>
          <p className="text-[10px] tracking-widest uppercase text-gray-500 font-light mb-4">Horario</p>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {timeSlots.map(({ time, available }) => (
              <button
                key={time}
                disabled={!available}
                onClick={() => onSelectTime(time)}
                className={`py-3 text-sm font-light border transition-all ${!available ? 'border-white/5 text-gray-700 cursor-not-allowed' : selectedTime === time ? 'border-white bg-white text-black' : 'border-white/10 hover:border-white/30'}`}
              >
                {time}
              </button>
            ))}
          </div>
        </div>
      )}

      <Button
        className="w-full bg-white text-black hover:bg-gray-200 text-xs tracking-widest uppercase font-light h-12 rounded-none disabled:opacity-30"
        disabled={!selectedDate || !selectedTime}
        onClick={onContinue}
      >
        Continuar <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  )
}
