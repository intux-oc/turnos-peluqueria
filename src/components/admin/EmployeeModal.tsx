import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Empleado } from '@/types/database'

interface EmployeeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editing: Empleado | null
  nombre: string
  especialidad: string
  fotoUrl: string
  onNombreChange: (val: string) => void
  onEspecialidadChange: (val: string) => void
  onFotoUrlChange: (val: string) => void
  onSubmit: () => void
}

export function EmployeeModal({
  open,
  onOpenChange,
  editing,
  nombre,
  especialidad,
  fotoUrl,
  onNombreChange,
  onEspecialidadChange,
  onFotoUrlChange,
  onSubmit
}: EmployeeModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-950 border-white/10 rounded-none text-white max-w-lg p-0 overflow-hidden">
        <DialogHeader className="p-8 border-b border-white/5">
          <DialogTitle className="text-xl font-light tracking-widest uppercase">
            {editing ? 'Editar Empleado' : 'Nuevo Empleado'}
          </DialogTitle>
          <DialogDescription className="text-gray-500 font-light text-xs tracking-widest">
            Ingresá los detalles del profesional.
          </DialogDescription>
        </DialogHeader>

        <div className="p-8 space-y-6">
          <div className="space-y-2">
            <Label className="text-[10px] tracking-widest uppercase text-gray-400 font-light">Nombre Completo</Label>
            <Input 
              value={nombre}
              onChange={(e) => onNombreChange(e.target.value)}
              placeholder="Ej: Juan Pérez"
              className="bg-black border-white/10 focus:border-white rounded-none h-12 font-light"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] tracking-widest uppercase text-gray-400 font-light">Especialidad</Label>
            <Input 
              value={especialidad}
              onChange={(e) => onEspecialidadChange(e.target.value)}
              placeholder="Ej: Colorista / Barbero"
              className="bg-black border-white/10 focus:border-white rounded-none h-12 font-light"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] tracking-widest uppercase text-gray-400 font-light">URL de la Foto (Opcional)</Label>
            <Input 
              value={fotoUrl}
              onChange={(e) => onFotoUrlChange(e.target.value)}
              placeholder="https://..."
              className="bg-black border-white/10 focus:border-white rounded-none h-12 font-light"
            />
          </div>
        </div>

        <DialogFooter className="p-8 bg-zinc-900/50 flex sm:justify-between items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => onOpenChange(false)}
            className="text-xs tracking-widest uppercase font-light text-gray-500 hover:text-white rounded-none"
          >
            Cancelar
          </Button>
          <Button 
            onClick={onSubmit}
            className="h-12 px-8 text-xs tracking-widest uppercase font-light bg-white text-black hover:bg-gray-200 transition-all rounded-none"
          >
            {editing ? 'Guardar Cambios' : 'Crear Empleado'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
