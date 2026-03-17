import { Users, User, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Empleado } from '@/types/database'

interface EmployeeStepProps {
  employees: Empleado[]
  selectedEmployeeId?: string
  onSelect: (employee: Empleado | null) => void
  onBack: () => void
}

export function EmployeeStep({ employees, selectedEmployeeId, onSelect, onBack }: EmployeeStepProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        <button
          onClick={() => onSelect(null)}
          className={`flex items-center justify-between p-6 border text-left transition-all hover:border-white/40 ${selectedEmployeeId === undefined ? 'border-white bg-white/5' : 'border-white/10 bg-zinc-900/30'}`}
        >
          <div className="flex items-center gap-6">
            <div className="p-2.5 border border-white/5 bg-black">
              <Users className="w-4 h-4 text-gray-400" />
            </div>
            <div>
              <h4 className="font-light tracking-wide text-white">Cualquier Profesional</h4>
              <p className="text-xs text-gray-500 font-light mt-0.5">Te asignaremos el primero disponible.</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-600" />
        </button>

        {employees.map((emp) => (
          <button
            key={emp.id}
            onClick={() => onSelect(emp)}
            className={`flex items-center justify-between p-6 border text-left transition-all hover:border-white/40 ${selectedEmployeeId === emp.id ? 'border-white bg-white/5' : 'border-white/10 bg-zinc-900/30'}`}
          >
            <div className="flex items-center gap-6">
              <div className="w-10 h-10 border border-white/10 overflow-hidden bg-black flex items-center justify-center">
                {emp.foto_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={emp.foto_url} alt={emp.nombre} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-4 h-4 text-gray-600" />
                )}
              </div>
              <div>
                <h4 className="font-light tracking-wide text-white">{emp.nombre}</h4>
                <p className="text-xs text-gray-500 font-light mt-0.5">{emp.especialidad || 'Peluquero'}</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-600" />
          </button>
        ))}
      </div>
      <Button
        variant="outline"
        className="w-full border-white/10 hover:bg-white/5 text-xs tracking-widest uppercase font-light h-12 rounded-none"
        onClick={onBack}
      >
        Atrás
      </Button>
    </div>
  )
}
