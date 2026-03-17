'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Plus, Settings } from 'lucide-react'
import { ServiceCard } from '@/components/admin/ServiceCard'
import { ServiceModal } from '@/components/admin/ServiceModal'
import { Servicio, Barbershop } from '@/types/database'

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
        .from('barbershops').select('*').eq('owner_id', user.id).single()

      if (!shop) { router.push('/planes'); return }

      setBarbershop(shop as Barbershop)
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
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Header Section */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-light tracking-wide mb-2 uppercase">Gestión de Servicios</h1>
            <p className="text-gray-500 font-light text-sm tracking-wide">
              Crea y gestiona tu catálogo profesional.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              onClick={() => openDialog()} 
              className="bg-white text-black hover:bg-gray-200 text-xs tracking-widest uppercase font-light h-12 px-8 rounded-none shadow-xl transition-all"
            >
              <Plus className="w-4 h-4 mr-2" /> Nuevo Servicio
            </Button>
            
            <ServiceModal 
              open={dialogOpen}
              onOpenChange={setDialogOpen}
              editing={editando}
              form={form}
              onFormChange={setForm}
              onSubmit={handleSubmit}
              loading={formLoading}
            />
          </div>
        </div>

        {/* Services List Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {servicios.map((servicio) => (
            <ServiceCard 
              key={servicio.id}
              servicio={servicio}
              onEdit={(s) => openDialog({ ...s, barbershop_id: barbershop.id })}
              onToggleActive={(s) => toggleActivo({ ...s, barbershop_id: barbershop.id })}
            />
          ))}
        </div>

        {servicios.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center py-32 border border-white/10 border-dashed animate-in fade-in zoom-in duration-500">
            <Settings className="w-12 h-12 text-zinc-900 mb-6" />
            <p className="text-xs tracking-widest uppercase font-light text-gray-500">Catálogo Vacío</p>
            <Button 
              variant="link" 
              onClick={() => openDialog()}
              className="mt-4 text-[10px] tracking-widest uppercase font-light text-white hover:text-gray-300 underline-offset-8"
            >
              Agregá tu primer servicio profesional
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}
