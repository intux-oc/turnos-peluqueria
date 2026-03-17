'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { 
  Users, 
  Plus, 
  Trash2, 
  ArrowLeft, 
  UserPlus, 
  Check, 
  X,
  User as UserIcon
} from 'lucide-react'
import { Empleado, Barbershop } from '@/types/database'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function EmployeesPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [barbershop, setBarbershop] = useState<Barbershop | null>(null)
  const [employees, setEmployees] = useState<Empleado[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Empleado | null>(null)
  
  // Form state
  const [nombre, setNombre] = useState('')
  const [especialidad, setEspecialidad] = useState('')
  const [fotoUrl, setFotoUrl] = useState('')

  useEffect(() => {
    const fetchInitialData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: shop } = await supabase
        .from('barbershops')
        .select('*')
        .eq('owner_id', user.id)
        .single()

      if (!shop) {
        toast.error('No se encontró tu peluquería')
        router.push('/admin')
        return
      }

      setBarbershop(shop as Barbershop)
      fetchEmployees(shop.id)
    }

    fetchInitialData()
  }, [supabase, router])

  const fetchEmployees = async (shopId: string) => {
    setLoading(true)
    const { data, error } = await supabase
      .from('empleados')
      .select('*')
      .eq('barbershop_id', shopId)
      .order('nombre')

    if (error) {
      toast.error('Error al cargar empleados')
    } else {
      setEmployees(data || [])
    }
    setLoading(false)
  }

  const handleOpenModal = (employee?: Empleado) => {
    if (employee) {
      setEditingEmployee(employee)
      setNombre(employee.nombre)
      setEspecialidad(employee.especialidad || '')
      setFotoUrl(employee.foto_url || '')
    } else {
      setEditingEmployee(null)
      setNombre('')
      setEspecialidad('')
      setFotoUrl('')
    }
    setIsModalOpen(true)
  }

  const handleSubmit = async () => {
    if (!barbershop) return
    if (!nombre.trim()) {
      toast.error('El nombre es obligatorio')
      return
    }

    const employeeData = {
      nombre,
      especialidad,
      foto_url: fotoUrl,
      barbershop_id: barbershop.id,
      activo: true
    }

    if (editingEmployee) {
      const { error } = await supabase
        .from('empleados')
        .update(employeeData)
        .eq('id', editingEmployee.id)

      if (error) toast.error('Error al actualizar')
      else {
        toast.success('Empleado actualizado')
        setIsModalOpen(false)
        fetchEmployees(barbershop.id)
      }
    } else {
      const { error } = await supabase
        .from('empleados')
        .insert(employeeData)

      if (error) toast.error('Error al crear')
      else {
        toast.success('Empleado creado')
        setIsModalOpen(false)
        fetchEmployees(barbershop.id)
      }
    }
  }

  const toggleStatus = async (employee: Empleado) => {
    const { error } = await supabase
      .from('empleados')
      .update({ activo: !employee.activo })
      .eq('id', employee.id)

    if (error) toast.error('Error al cambiar estado')
    else {
      toast.success(employee.activo ? 'Empleado desactivado' : 'Empleado activado')
      if (barbershop) fetchEmployees(barbershop.id)
    }
  }

  const deleteEmployee = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar a este empleado? Se eliminarán también sus registros asociados.')) return

    const { error } = await supabase
      .from('empleados')
      .delete()
      .eq('id', id)

    if (error) toast.error('Error al eliminar')
    else {
      toast.success('Empleado eliminado')
      if (barbershop) fetchEmployees(barbershop.id)
    }
  }

  if (loading && employees.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="h-8 w-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black">
      <main className="flex-1 max-w-5xl w-full mx-auto p-6 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <Button 
              variant="ghost" 
              className="mb-6 h-8 px-0 text-gray-500 hover:text-white hover:bg-transparent tracking-widest uppercase text-xs font-light"
              onClick={() => router.push('/admin')}
            >
              <ArrowLeft className="w-3 h-3 mr-2" /> Volver al Panel
            </Button>
            <h1 className="text-4xl font-light tracking-wide mb-2 uppercase text-white">Equipo de Trabajo</h1>
            <p className="text-gray-500 font-light text-sm tracking-wide">
              Gestioná los peluqueros y profesionales de tu salón.
            </p>
          </div>
          
          <Button 
            onClick={() => handleOpenModal()}
            className="h-12 px-8 text-xs tracking-widest uppercase font-light bg-white text-black hover:bg-gray-200 transition-all rounded-none flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" /> Nuevo Empleado
          </Button>
        </div>

        {/* List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {employees.map((emp) => (
            <Card key={emp.id} className="bg-zinc-900/50 border-white/10 rounded-none overflow-hidden hover:border-white/30 transition-all group">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-none border border-white/10 overflow-hidden bg-black flex items-center justify-center">
                    {emp.foto_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={emp.foto_url} alt={emp.nombre} className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon className="w-6 h-6 text-gray-700" strokeWidth={1} />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-light tracking-widest uppercase text-white truncate max-w-[150px]">{emp.nombre}</h3>
                    <p className="text-[10px] tracking-widest uppercase text-gray-500 font-light">{emp.especialidad || 'Peluquero'}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleOpenModal(emp)}
                      className="text-[10px] tracking-widest uppercase font-light text-gray-500 hover:text-white h-8 px-3 rounded-none"
                    >
                      Editar
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => toggleStatus(emp)}
                      className={`text-[10px] tracking-widest uppercase font-light h-8 px-3 rounded-none ${emp.activo ? 'text-gray-500 hover:text-red-400' : 'text-green-500 hover:text-green-400'}`}
                    >
                      {emp.activo ? 'Desactivar' : 'Activar'}
                    </Button>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => deleteEmployee(emp.id)}
                    className="text-gray-700 hover:text-red-500 h-8 w-8 p-0 rounded-none opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {employees.length === 0 && !loading && (
            <div className="col-span-full border border-dashed border-white/10 p-12 text-center">
              <Users className="w-12 h-12 text-gray-800 mx-auto mb-4" strokeWidth={0.5} />
              <p className="text-gray-500 font-light tracking-widest uppercase text-sm">Aún no hay empleados registrados</p>
            </div>
          )}
        </div>

        {/* Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="bg-zinc-950 border-white/10 rounded-none text-white max-w-lg p-0 overflow-hidden">
            <DialogHeader className="p-8 border-b border-white/5">
              <DialogTitle className="text-xl font-light tracking-widest uppercase">
                {editingEmployee ? 'Editar Empleado' : 'Nuevo Empleado'}
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
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: Juan Pérez"
                  className="bg-black border-white/10 focus:border-white rounded-none h-12 font-light"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] tracking-widest uppercase text-gray-400 font-light">Especialidad</Label>
                <Input 
                  value={especialidad}
                  onChange={(e) => setEspecialidad(e.target.value)}
                  placeholder="Ej: Colorista / Barbero"
                  className="bg-black border-white/10 focus:border-white rounded-none h-12 font-light"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] tracking-widest uppercase text-gray-400 font-light">URL de la Foto (Opcional)</Label>
                <Input 
                  value={fotoUrl}
                  onChange={(e) => setFotoUrl(e.target.value)}
                  placeholder="https://..."
                  className="bg-black border-white/10 focus:border-white rounded-none h-12 font-light"
                />
              </div>
            </div>

            <DialogFooter className="p-8 bg-zinc-900/50 flex sm:justify-between items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={() => setIsModalOpen(false)}
                className="text-xs tracking-widest uppercase font-light text-gray-500 hover:text-white rounded-none"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSubmit}
                className="h-12 px-8 text-xs tracking-widest uppercase font-light bg-white text-black hover:bg-gray-200 transition-all rounded-none"
              >
                {editingEmployee ? 'Guardar Cambios' : 'Crear Empleado'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
