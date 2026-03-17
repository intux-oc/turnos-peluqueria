import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'

interface ServiceModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editing: any
  form: { 
    nombre: string
    descripcion: string
    precio: string
    duracion_minutos: string 
  }
  onFormChange: (form: any) => void
  onSubmit: (e: React.FormEvent) => void
  loading: boolean
}

export function ServiceModal({ 
  open, 
  onOpenChange, 
  editing, 
  form, 
  onFormChange, 
  onSubmit, 
  loading 
}: ServiceModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-white/10 text-white rounded-none sm:max-w-[500px] p-8">
        <form onSubmit={onSubmit}>
          <DialogHeader className="mb-8">
            <DialogTitle className="text-2xl font-light tracking-widest uppercase">
              {editing ? 'Editar Servicio' : 'Nuevo Servicio'}
            </DialogTitle>
            <DialogDescription className="text-gray-500 font-light text-xs tracking-widest uppercase mt-2">
               Definí los detalles de tu tratamiento profesional.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] tracking-widest uppercase text-gray-500 font-light">Nombre del Servicio</Label>
              <Input 
                required
                className="bg-black border-white/10 rounded-none h-12 text-sm focus-visible:ring-white/20 transition-all font-light"
                placeholder="ej. Corte Ejecutivo"
                value={form.nombre} 
                onChange={(e) => onFormChange({ ...form, nombre: e.target.value })} 
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-[10px] tracking-widest uppercase text-gray-500 font-light">Descripción</Label>
              <Input 
                className="bg-black border-white/10 rounded-none h-12 text-sm focus-visible:ring-white/20 transition-all font-light"
                placeholder="Breve resumen de la experiencia"
                value={form.descripcion} 
                onChange={(e) => onFormChange({ ...form, descripcion: e.target.value })} 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] tracking-widest uppercase text-gray-500 font-light">Precio ($)</Label>
                <Input 
                  required
                  type="number" 
                  className="bg-black border-white/10 rounded-none h-12 text-sm focus-visible:ring-white/20 transition-all font-light"
                  value={form.precio} 
                  onChange={(e) => onFormChange({ ...form, precio: e.target.value })} 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] tracking-widest uppercase text-gray-500 font-light">Duración (min)</Label>
                <Input 
                  required
                  type="number" 
                  className="bg-black border-white/10 rounded-none h-12 text-sm focus-visible:ring-white/20 transition-all font-light"
                  value={form.duracion_minutos} 
                  onChange={(e) => onFormChange({ ...form, duracion_minutos: e.target.value })} 
                />
              </div>
            </div>
          </div>
          
          <DialogFooter className="mt-12 flex flex-col md:flex-row gap-4">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => onOpenChange(false)}
              className="w-full text-[10px] tracking-widest uppercase font-light hover:text-white hover:bg-white/5 rounded-none"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full bg-white text-black hover:bg-gray-200 text-[10px] tracking-widest uppercase font-light h-12 rounded-none transition-all shadow-lg"
            >
              {loading ? 'Procesando...' : (editing ? 'Actualizar Servicio' : 'Crear Servicio')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
