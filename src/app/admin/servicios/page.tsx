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
import { ArrowLeft, Plus, Edit2, Power, PowerOff, Clock, DollarSign, Sparkles, Scissors, Info, Settings, Users, LayoutDashboard } from 'lucide-react'

interface Servicio {
  id: string
  nombre: string
  descripcion: string | null
  precio: number
  duracion_minutos: number
  activo: boolean
}

interface Barbershop {
  id: string
  name: string
  slug: string
}

export default function AdminServiciosPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [barbershop, setBarbershop] = useState<Barbershop | null>(null)
  const [servicios, setServicios] = useState<Servicio[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editando, setEditando] = useState<Servicio | null>(null)
  const [form, setForm] = useState({ nombre: '', descripcion: '', precio: '', duracion_minutos: '' })
  const [formLoading, setFormLoading] = useState(false)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: profile } = await supabase
        .from('profiles').select('role').eq('id', user.id).single()

      if (!profile || !['admin', 'superadmin'].includes(profile.role)) {
        router.push('/'); return
      }

      const { data: shop } = await supabase
        .from('barbershops').select('id, name, slug').eq('owner_id', user.id).single()

      if (!shop) { router.push('/planes'); return }

      setBarbershop(shop)
      fetchServicios(shop.id)
    }
    checkUser()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchServicios = async (barbershopId: string) => {
    const { data } = await supabase
      .from('servicios')
      .select('*')
      .eq('barbershop_id', barbershopId)
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
    if (!barbershop) return
    setFormLoading(true)

    try {
      const payload = {
        barbershop_id: barbershop.id,
        nombre: form.nombre,
        descripcion: form.descripcion,
        precio: parseFloat(form.precio),
        duracion_minutos: parseInt(form.duracion_minutos),
        activo: editando ? editando.activo : true,
      }

      if (editando) {
        const { error } = await supabase.from('servicios').update(payload).eq('id', editando.id)
        if (error) throw error
        toast.success('Servicio actualizado')
      } else {
        const { error } = await supabase.from('servicios').insert(payload)
        if (error) throw error
        toast.success('Servicio creado')
      }

      setDialogOpen(false)
      fetchServicios(barbershop.id)
    } catch (error: any) {
      toast.error('Ocurrió un error', { description: error.message })
    } finally {
      setFormLoading(false)
    }
  }

  const toggleActivo = async (servicio: Servicio) => {
    const { error } = await supabase
      .from('servicios')
      .update({ activo: !servicio.activo })
      .eq('id', servicio.id)
    if (error) {
      toast.error('Ocurrió un error', { description: error.message })
    } else {
      toast.success(servicio.activo ? 'Servicio desactivado' : 'Servicio activado')
      if (barbershop) fetchServicios(barbershop.id)
    }
  }

  if (!barbershop || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="h-8 w-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black transition-colors duration-500">
      {/* Navigation */}
      <nav className="sticky top-0 w-full z-50 px-6 py-6 bg-black/80 backdrop-blur-md border-b border-white/10 flex items-center justify-between">
        <div className="text-xl font-light tracking-widest uppercase cursor-pointer hover:text-gray-300 transition-colors" onClick={() => router.push('/')}>
          Peluquería
        </div>
        <div className="flex items-center gap-6">
          <Button 
            variant="ghost" 
            className="text-xs tracking-widest uppercase font-light hover:text-white hover:bg-white/5"
            onClick={() => router.push('/admin')}
          >
            <LayoutDashboard className="w-4 h-4 mr-2" /> Dashboard
          </Button>
          <Button 
            variant="ghost" 
            className="hidden md:flex text-xs tracking-widest uppercase font-light hover:text-white hover:bg-white/5"
            onClick={() => router.push('/perfil')}
          >
            <Users className="w-4 h-4 mr-2" /> Profile
          </Button>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Header Section */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-light tracking-wide mb-2 uppercase">Services Management</h1>
            <p className="text-gray-500 font-light text-sm tracking-wide">
              Create and manage your professional catalog.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <Button 
                onClick={() => openDialog()} 
                className="bg-white text-black hover:bg-gray-200 text-xs tracking-widest uppercase font-light h-12 px-8 rounded-none shadow-xl transition-all"
              >
                <Plus className="w-4 h-4 mr-2" /> New Service
              </Button>
              <DialogContent className="bg-zinc-900 border-white/10 text-white rounded-none sm:max-w-[500px] p-8">
                <form onSubmit={handleSubmit}>
                  <DialogHeader className="mb-8">
                    <DialogTitle className="text-2xl font-light tracking-widest uppercase">
                      {editando ? 'Edit Service' : 'New Service'}
                    </DialogTitle>
                    <DialogDescription className="text-gray-500 font-light text-xs tracking-widest uppercase mt-2">
                       Define the details of your professional treatment.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] tracking-widest uppercase text-gray-500 font-light">Service Name</Label>
                      <Input 
                        required
                        className="bg-black border-white/10 rounded-none h-12 text-sm focus-visible:ring-white/20 transition-all font-light"
                        placeholder="e.g. Executive Cut"
                        value={form.nombre} 
                        onChange={(e) => setForm({ ...form, nombre: e.target.value })} 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-[10px] tracking-widest uppercase text-gray-500 font-light">Description</Label>
                      <Input 
                        className="bg-black border-white/10 rounded-none h-12 text-sm focus-visible:ring-white/20 transition-all font-light"
                        placeholder="Brief overview of the experience"
                        value={form.descripcion} 
                        onChange={(e) => setForm({ ...form, descripcion: e.target.value })} 
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-[10px] tracking-widest uppercase text-gray-500 font-light">Price ($)</Label>
                        <Input 
                          required
                          type="number" 
                          className="bg-black border-white/10 rounded-none h-12 text-sm focus-visible:ring-white/20 transition-all font-light"
                          value={form.precio} 
                          onChange={(e) => setForm({ ...form, precio: e.target.value })} 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] tracking-widest uppercase text-gray-500 font-light">Duration (min)</Label>
                        <Input 
                          required
                          type="number" 
                          className="bg-black border-white/10 rounded-none h-12 text-sm focus-visible:ring-white/20 transition-all font-light"
                          value={form.duracion_minutos} 
                          onChange={(e) => setForm({ ...form, duracion_minutos: e.target.value })} 
                        />
                      </div>
                    </div>
                  </div>
                  
                  <DialogFooter className="mt-12 flex flex-col md:flex-row gap-4">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      onClick={() => setDialogOpen(false)}
                      className="w-full text-[10px] tracking-widest uppercase font-light hover:text-white hover:bg-white/5 rounded-none"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={formLoading}
                      className="w-full bg-white text-black hover:bg-gray-200 text-[10px] tracking-widest uppercase font-light h-12 rounded-none transition-all shadow-lg"
                    >
                      {formLoading ? 'Processing...' : (editando ? 'Update Service' : 'Create Service')}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Services List Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {servicios.map((servicio) => (
            <Card 
              key={servicio.id} 
              className={`bg-zinc-900/40 border-white/10 rounded-none overflow-hidden relative group transition-all duration-500 hover:bg-zinc-900/60 hover:border-white/30 ${!servicio.activo ? 'opacity-40 grayscale' : ''}`}
            >
              <CardContent className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 bg-black border border-white/5 rounded-none group-hover:border-white/20 transition-colors">
                    <Scissors className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => openDialog(servicio)}
                      className="h-8 w-8 text-gray-500 hover:text-white hover:bg-white/5 rounded-none"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => toggleActivo(servicio)}
                      className={`h-8 w-8 rounded-none ${servicio.activo ? 'text-gray-500 hover:text-red-400' : 'text-green-500 hover:text-green-400'}`}
                    >
                      {servicio.activo ? <PowerOff className="w-3.5 h-3.5" /> : <Power className="w-3.5 h-3.5" />}
                    </Button>
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-xl font-light tracking-wider uppercase mb-2 group-hover:text-white transition-colors">
                    {servicio.nombre}
                  </h3>
                  <p className="text-gray-500 font-light text-xs leading-relaxed line-clamp-2 h-8">
                    {servicio.descripcion || 'Professional aesthetic treatment.'}
                  </p>
                </div>

                <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-[10px] tracking-widest uppercase font-light text-gray-400">
                      <Clock className="w-3 h-3" />
                      {servicio.duracion_minutos} MIN
                    </div>
                  </div>
                  <div className="text-lg font-light tracking-tighter">
                    ${servicio.precio}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {servicios.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center py-32 border border-white/10 border-dashed animate-in fade-in zoom-in duration-500">
            <Settings className="w-12 h-12 text-zinc-900 mb-6" />
            <p className="text-xs tracking-widest uppercase font-light text-gray-500">Empty Catalog</p>
            <Button 
              variant="link" 
              onClick={() => openDialog()}
              className="mt-4 text-[10px] tracking-widest uppercase font-light text-white hover:text-gray-300 underline-offset-8"
            >
              Add your first professional service
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}
