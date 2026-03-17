'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { ArrowLeft, UserPlus, Users } from 'lucide-react'
import { Empleado, Barbershop } from '@/types/database'
import { EmployeeCard } from '@/components/admin/EmployeeCard'
import { EmployeeModal } from '@/components/admin/EmployeeModal'

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
            <EmployeeCard 
              key={emp.id}
              employee={emp}
              onEdit={handleOpenModal}
              onToggleActive={toggleStatus}
              onDelete={deleteEmployee}
            />
          ))}

          {employees.length === 0 && !loading && (
            <div className="col-span-full border border-dashed border-white/10 p-12 text-center">
              <Users className="w-12 h-12 text-gray-800 mx-auto mb-4" strokeWidth={0.5} />
              <p className="text-gray-500 font-light tracking-widest uppercase text-sm">Aún no hay empleados registrados</p>
            </div>
          )}
        </div>

        {/* Modal */}
        <EmployeeModal 
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          editing={editingEmployee}
          nombre={nombre}
          especialidad={especialidad}
          fotoUrl={fotoUrl}
          onNombreChange={setNombre}
          onEspecialidadChange={setEspecialidad}
          onFotoUrlChange={setFotoUrl}
          onSubmit={handleSubmit}
        />
      </main>
    </div>
  )
}
