'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { ArrowLeft, Plus, Edit2, Power, PowerOff, Clock, DollarSign, Sparkles, Scissors, Info } from 'lucide-react'

interface Servicio {
  id: string
  nombre: string
  descripcion: string
  precio: number
  duracion_minutos: number
  activo: boolean
}

export default function AdminServiciosPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [servicios, setServicios] = useState<Servicio[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editando, setEditando] = useState<Servicio | null>(null)
  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    duracion_minutos: '',
  })
  const [formLoading, setFormLoading] = useState(false)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || (user.email !== 'admin@intux.com' && user.email !== 'admin@peluqueria.com')) {
        router.push('/')
        return
      }
      setUser(user)
      fetchServicios()
    }
    checkUser()
  }, [supabase, router])

  const fetchServicios = async () => {
    const { data } = await supabase
      .from('servicios')
      .select('*')
      .order('nombre')
    
    if (data) setServicios(data)
    setLoading(false)
  }

  const openDialog = (servicio?: Servicio) => {
    if (servicio) {
      setEditando(servicio)
      setForm({
        nombre: servicio.nombre,
        descripcion: servicio.descripcion || '',
        precio: servicio.precio.toString(),
        duracion_minutos: servicio.duracion_minutos.toString(),
      })
    } else {
      setEditando(null)
      setForm({ nombre: '', descripcion: '', precio: '', duracion_minutos: '' })
    }
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)

    try {
      const payload = {
        nombre: form.nombre,
        descripcion: form.descripcion,
        precio: parseFloat(form.precio),
        duracion_minutos: parseInt(form.duracion_minutos),
        activo: editando ? editando.activo : true,
      }

      if (editando) {
        const { error } = await supabase
          .from('servicios')
          .update(payload)
          .eq('id', editando.id)
        if (error) throw error
        toast.success('Servicio actualizado', {
          description: 'Los cambios se guardaron correctamente.'
        })
      } else {
        const { error } = await supabase
          .from('servicios')
          .insert(payload)
        if (error) throw error
        toast.success('Servicio creado', {
          description: 'El nuevo servicio ya está disponible para reservas.'
        })
      }

      setDialogOpen(false)
      fetchServicios()
    } catch (error: any) {
      toast.error('Ocurrió un error', {
        description: error.message
      })
    } finally {
      setFormLoading(false)
    }
  }

  const toggleActivo = async (servicio: Servicio) => {
    try {
      const { error } = await supabase
        .from('servicios')
        .update({ activo: !servicio.activo })
        .eq('id', servicio.id)
      
      if (error) throw error
      toast.success(servicio.activo ? 'Servicio desactivado' : 'Servicio activado', {
         description: servicio.activo ? 'El servicio ya no aparecerá.' : 'El servicio está disponible nuevamente.'
      })
      fetchServicios()
    } catch (error: any) {
      toast.error('Ocurrió un error', {
         description: error.message
      })
    }
  }

  if (!user || loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background min-h-[calc(100vh-4rem)]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
          <p className="text-muted-foreground animate-pulse font-medium">Cargando servicios...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 relative overflow-hidden bg-background py-10 px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-4rem)]">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/10 blur-[150px] rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none translate-x-1/3 translate-y-1/3" />

      <div className="max-w-5xl mx-auto relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
          <div>
            <Button 
              variant="ghost" 
              onClick={() => router.push('/admin')}
              className="mb-4 text-muted-foreground hover:text-foreground hover:bg-white/5 -ml-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Volver al Dashboard
            </Button>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
              <span className="bg-gradient-to-tr from-primary/20 to-primary/5 p-2 rounded-xl border border-primary/20 text-primary shadow-inner">
                <Settings className="h-8 w-8" />
              </span>
              Gestión de Servicios
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">Crea, edita y administra los servicios del catálogo.</p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => openDialog()} className="h-12 px-6 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all font-semibold gap-2">
                <Plus className="h-5 w-5" />
                Nuevo Servicio
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-black/90 backdrop-blur-2xl border-white/10 text-foreground">
              <form onSubmit={handleSubmit}>
                <DialogHeader className="mb-6">
                  <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                    {editando ? <Edit2 className="h-5 w-5 text-primary" /> : <Sparkles className="h-5 w-5 text-primary" />}
                    {editando ? 'Editar Servicio' : 'Nuevo Servicio'}
                  </DialogTitle>
                  <DialogDescription className="text-muted-foreground">
                    Completa los detalles del servicio {editando ? 'para actualizarlo' : 'para agregarlo al catálogo'}.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-5 py-2">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Nombre del Servicio</Label>
                    <div className="relative">
                      <Scissors className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        required
                        className="pl-9 bg-white/5 border-white/10 focus-visible:ring-primary focus-visible:border-primary text-foreground"
                        placeholder="Ej. Corte Clásico"
                        value={form.nombre} 
                        onChange={(e) => setForm({ ...form, nombre: e.target.value })} 
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-gray-300">Descripción (Opcional)</Label>
                    <div className="relative">
                      <Info className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        className="pl-9 bg-white/5 border-white/10 focus-visible:ring-primary focus-visible:border-primary text-foreground"
                        placeholder="Breve descripción del servicio"
                        value={form.descripcion} 
                        onChange={(e) => setForm({ ...form, descripcion: e.target.value })} 
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-gray-300">Precio ($)</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                          required
                          type="number" 
                          min="0"
                          step="100"
                          className="pl-9 bg-white/5 border-white/10 focus-visible:ring-primary focus-visible:border-primary text-foreground"
                          placeholder="00.00"
                          value={form.precio} 
                          onChange={(e) => setForm({ ...form, precio: e.target.value })} 
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-gray-300">Duración (min)</Label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                          required
                          type="number" 
                          min="0"
                          step="5"
                          className="pl-9 bg-white/5 border-white/10 focus-visible:ring-primary focus-visible:border-primary text-foreground"
                          placeholder="30"
                          value={form.duracion_minutos} 
                          onChange={(e) => setForm({ ...form, duracion_minutos: e.target.value })} 
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <DialogFooter className="mt-8">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={() => setDialogOpen(false)}
                    className="hover:bg-white/5 text-muted-foreground"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={formLoading}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md shadow-primary/20 min-w-[120px]"
                  >
                    {formLoading ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Guardando
                      </span>
                    ) : (
                      editando ? 'Guardar Cambios' : 'Crear Servicio'
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Services List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {servicios.map((servicio) => (
            <Card 
              key={servicio.id} 
              className={`bg-white/5 border-white/10 backdrop-blur-xl relative overflow-hidden group transition-all duration-300 ${!servicio.activo ? 'opacity-50 grayscale select-none' : 'hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5'}`}
            >
               {/* Accent Line */}
               {servicio.activo && (
                  <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-primary/80 to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
               )}
               
              <CardContent className="p-6">
                 <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                       <h3 className="text-xl font-bold text-foreground mb-1 flex items-center gap-2">
                          {servicio.nombre}
                          {!servicio.activo && <span className="text-[10px] uppercase tracking-wider font-bold bg-white/10 text-muted-foreground px-2 py-0.5 rounded-sm">Inactivo</span>}
                       </h3>
                       <p className="text-sm text-muted-foreground mb-4 line-clamp-2 min-h-[40px]">
                          {servicio.descripcion || 'Sin descripción detallada.'}
                       </p>
                       
                       <div className="flex items-center gap-4 text-sm font-medium mt-auto">
                          <span className="flex items-center gap-1.5 text-primary bg-primary/10 px-2.5 py-1 rounded-md border border-primary/20">
                             <DollarSign className="w-4 h-4" />
                             {servicio.precio}
                          </span>
                          <span className="flex items-center gap-1.5 text-gray-400 bg-white/5 px-2.5 py-1 rounded-md border border-white/10">
                             <Clock className="w-4 h-4" />
                             {servicio.duracion_minutos} min
                          </span>
                       </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 shrink-0">
                      <Button 
                         variant="ghost" 
                         size="icon" 
                         onClick={() => openDialog(servicio)}
                         className="h-10 w-10 bg-white/5 hover:bg-white/10 border border-white/5 rounded-full"
                         title="Editar servicio"
                      >
                        <Edit2 className="h-4 w-4 text-gray-300" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleActivo(servicio)}
                        className={`h-10 w-10 rounded-full border ${servicio.activo ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:text-red-400 border-red-500/20' : 'bg-green-500/10 text-green-500 hover:bg-green-500/20 hover:text-green-400 border-green-500/20'}`}
                        title={servicio.activo ? 'Desactivar servicio' : 'Activar servicio'}
                      >
                        {servicio.activo ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                      </Button>
                    </div>
                 </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {servicios.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white/5 border border-white/10 rounded-2xl border-dashed">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary/50 mb-6">
              <Settings className="h-10 w-10" />
            </div>
            <h3 className="text-2xl font-semibold text-foreground mb-2">No hay servicios</h3>
            <p className="text-muted-foreground max-w-sm mx-auto mb-6">
              Aún no creaste ningún servicio para el catálogo. ¡Empezá ahora!
            </p>
            <Button onClick={() => openDialog()} className="font-semibold gap-2">
                <Plus className="h-5 w-5" />
                Agregar el primer servicio
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
