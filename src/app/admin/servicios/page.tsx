'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'

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

  const handleSubmit = async () => {
    try {
      const payload = {
        nombre: form.nombre,
        descripcion: form.descripcion,
        precio: parseFloat(form.precio),
        duracion_minutos: parseInt(form.duracion_minutos),
        activo: true,
      }

      if (editando) {
        const { error } = await supabase
          .from('servicios')
          .update(payload)
          .eq('id', editando.id)
        if (error) throw error
        toast.success('Servicio actualizado')
      } else {
        const { error } = await supabase
          .from('servicios')
          .insert(payload)
        if (error) throw error
        toast.success('Servicio creado')
      }

      setDialogOpen(false)
      fetchServicios()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const toggleActivo = async (servicio: Servicio) => {
    try {
      const { error } = await supabase
        .from('servicios')
        .update({ activo: !servicio.activo })
        .eq('id', servicio.id)
      
      if (error) throw error
      fetchServicios()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  if (!user || loading) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <Button variant="ghost" onClick={() => router.push('/admin')}>
              ← Volver
            </Button>
            <h1 className="text-2xl font-bold mt-2">Gestionar Servicios</h1>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger>
              <Button onClick={() => openDialog()}>Nuevo Servicio</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editando ? 'Editar' : 'Nuevo'} Servicio</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Nombre</Label>
                  <Input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
                </div>
                <div>
                  <Label>Descripción</Label>
                  <Input value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Precio ($)</Label>
                    <Input type="number" value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })} />
                  </div>
                  <div>
                    <Label>Duración (min)</Label>
                    <Input type="number" value={form.duracion_minutos} onChange={(e) => setForm({ ...form, duracion_minutos: e.target.value })} />
                  </div>
                </div>
                <Button onClick={handleSubmit} className="w-full">
                  {editando ? 'Actualizar' : 'Crear'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4">
          {servicios.map((servicio) => (
            <Card key={servicio.id} className={!servicio.activo ? 'opacity-60' : ''}>
              <CardContent className="pt-4 flex justify-between items-center">
                <div>
                  <p className="font-semibold">{servicio.nombre}</p>
                  <p className="text-sm text-gray-500">{servicio.descripcion}</p>
                  <p className="text-sm">${servicio.precio} - {servicio.duracion_minutos} min</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => openDialog(servicio)}>
                    Editar
                  </Button>
                  <Button
                    variant={servicio.activo ? 'destructive' : 'default'}
                    size="sm"
                    onClick={() => toggleActivo(servicio)}
                  >
                    {servicio.activo ? 'Desactivar' : 'Activar'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {servicios.length === 0 && (
          <p className="text-center text-gray-500 py-8">No hay servicios creados</p>
        )}
      </div>
    </div>
  )
}
