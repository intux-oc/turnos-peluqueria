import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { User as UserIcon, Trash2 } from 'lucide-react'
import { Empleado } from '@/types/database'

interface EmployeeCardProps {
  employee: Empleado
  onEdit: (employee: Empleado) => void
  onToggleActive: (employee: Empleado) => void
  onDelete: (id: string) => void
}

export function EmployeeCard({ employee, onEdit, onToggleActive, onDelete }: EmployeeCardProps) {
  return (
    <Card className="bg-zinc-900/50 border-white/10 rounded-none overflow-hidden hover:border-white/30 transition-all group">
      <CardContent className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-none border border-white/10 overflow-hidden bg-black flex items-center justify-center">
            {employee.foto_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={employee.foto_url} alt={employee.nombre} className="w-full h-full object-cover" />
            ) : (
              <UserIcon className="w-6 h-6 text-gray-700" strokeWidth={1} />
            )}
          </div>
          <div>
            <h3 className="text-lg font-light tracking-widest uppercase text-white truncate max-w-[150px]">{employee.nombre}</h3>
            <p className="text-[10px] tracking-widest uppercase text-gray-500 font-light">{employee.especialidad || 'Peluquero'}</p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onEdit(employee)}
              className="text-[10px] tracking-widest uppercase font-light text-gray-500 hover:text-white h-8 px-3 rounded-none"
            >
              Editar
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onToggleActive(employee)}
              className={`text-[10px] tracking-widest uppercase font-light h-8 px-3 rounded-none ${employee.activo ? 'text-gray-500 hover:text-red-400' : 'text-green-500 hover:text-green-400'}`}
            >
              {employee.activo ? 'Desactivar' : 'Activar'}
            </Button>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onDelete(employee.id)}
            className="text-gray-700 hover:text-red-500 h-8 w-8 p-0 rounded-none opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
