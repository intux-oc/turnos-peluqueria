import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface AdminConfirmationStepProps {
  notas: string
  onNotasChange: (notas: string) => void
}

export function AdminConfirmationStep({ notas, onNotasChange }: AdminConfirmationStepProps) {
  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
      <div className="space-y-3">
        <Label className="text-xs tracking-widest uppercase text-gray-400 font-light">Notas Adicionales (Opcional)</Label>
        <Input
          value={notas}
          onChange={(e) => onNotasChange(e.target.value)}
          placeholder="¿Alguna solicitud especial o preferencia?"
          className="bg-zinc-900/50 border-white/20 focus:border-white text-white h-14 rounded-none font-light placeholder:text-gray-600 transition-colors"
        />
      </div>
      
      <div className="border border-white/10 p-6 bg-zinc-900/30">
         <h4 className="text-sm tracking-widest uppercase text-white font-light border-b border-white/10 pb-4 mb-4">
            Política de Cancelación
         </h4>
         <p className="text-xs text-gray-500 font-light leading-relaxed">
            Tené en cuenta que las cancelaciones o reprogramaciones deben hacerse al menos 2 horas antes de tu turno. Valoramos tu tiempo y el de nuestros profesionales.
         </p>
      </div>
    </div>
  )
}
