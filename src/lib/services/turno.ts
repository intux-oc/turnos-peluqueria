import { createClient } from '@/lib/supabase/client'

// Tipos
export interface Turno {
  id: string
  fecha_hora: string
  estado: 'pendiente' | 'confirmado' | 'completado' | 'cancelado'
  notas: string | null
  cliente_id: string
  servicio_id: string
  empleado_id: string | null
}

export interface TurnoWithRelations extends Turno {
  servicio?: { nombre: string; precio: number; duracion_minutos: number }
  empleado?: { nombre: string }
  cliente?: { full_name: string; email: string }
}

// Lógica pura de base de datos
export class TurnoService {
  private supabase = createClient()

  // Obtener todos los turnos con filtros
  async getTurnos(filtros?: {
    fechaInicio?: string
    fechaFin?: string
    estado?: string
    empleadoId?: string
  }): Promise<TurnoWithRelations[]> {
    let query = this.supabase
      .from('turnos')
      .select(`
        id,
        fecha_hora,
        estado,
        notas,
        cliente_id,
        servicio_id,
        empleado_id,
        servicio:servicios(nombre, precio, duracion_minutos),
        empleado:empleados(nombre),
        cliente:profiles!turnos_cliente_id_fkey(full_name, email)
      `)
      .order('fecha_hora', { ascending: true })

    if (filtros?.fechaInicio) {
      query = query.gte('fecha_hora', filtros.fechaInicio)
    }
    if (filtros?.fechaFin) {
      query = query.lt('fecha_hora', filtros.fechaFin)
    }
    if (filtros?.estado) {
      query = query.eq('estado', filtros.estado)
    }
    if (filtros?.empleadoId) {
      query = query.eq('empleado_id', filtros.empleadoId)
    }

    const { data, error } = await query

    if (error) throw error
    return data as any
  }

  // Obtener turnos de hoy
  async getTurnosHoy(): Promise<TurnoWithRelations[]> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    return this.getTurnos({
      fechaInicio: today.toISOString(),
      fechaFin: tomorrow.toISOString(),
    })
  }

  // Actualizar estado de un turno
  async actualizarEstado(turnoId: string, nuevoEstado: string): Promise<void> {
    const { error } = await this.supabase
      .from('turnos')
      .update({ 
        estado: nuevoEstado,
        updated_at: new Date().toISOString()
      })
      .eq('id', turnoId)

    if (error) throw error
  }

  // Crear un nuevo turno
  async crearTurno(datos: {
    cliente_id: string
    servicio_id: string
    fecha_hora: string
    notas?: string
    empleado_id?: string
  }): Promise<Turno> {
    const { data, error } = await this.supabase
      .from('turnos')
      .insert({
        cliente_id: datos.cliente_id,
        servicio_id: datos.servicio_id,
        fecha_hora: datos.fecha_hora,
        notas: datos.notas || null,
        empleado_id: datos.empleado_id || null,
        estado: 'pendiente',
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Cancelar un turno
  async cancelarTurno(turnoId: string): Promise<void> {
    await this.actualizarEstado(turnoId, 'cancelado')
  }

  // Confirmar un turno
  async confirmarTurno(turnoId: string): Promise<void> {
    await this.actualizarEstado(turnoId, 'confirmado')
  }

  // Completar un turno
  async completarTurno(turnoId: string): Promise<void> {
    await this.actualizarEstado(turnoId, 'completado')
  }
}

// Instancia singleton
export const turnoService = new TurnoService()