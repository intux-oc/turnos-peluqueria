import { createClient } from '@/lib/supabase/client'
import { TurnoWithRelations } from './turno'

export interface Stats {
  totalTurnos: number
  turnosPendientes: number
  turnosConfirmados: number
  turnosCompletados: number
  turnosCancelados: number
  ingresosDelDia: number
  ingresosDelMes: number
  promedioDiario: number
}

// Clase pura para cálculos de estadísticas
export class StatsService {
  private supabase = createClient()

  // Calcular estadísticas de una lista de turnos
  calcularStats(turnos: TurnoWithRelations[]): Stats {
    const stats: Stats = {
      totalTurnos: turnos.length,
      turnosPendientes: 0,
      turnosConfirmados: 0,
      turnosCompletados: 0,
      turnosCancelados: 0,
      ingresosDelDia: 0,
      ingresosDelMes: 0,
      promedioDiario: 0,
    }

    // Contar por estado
    turnos.forEach((turno) => {
      switch (turno.estado) {
        case 'pendiente':
          stats.turnosPendientes++
          break
        case 'confirmado':
          stats.turnosConfirmados++
          break
        case 'completado':
          stats.turnosCompletados++
          // Sumar ingresos solo de turnos completados
          if (turno.servicio?.precio) {
            stats.ingresosDelDia += Number(turno.servicio.precio)
            stats.ingresosDelMes += Number(turno.servicio.precio)
          }
          break
        case 'cancelado':
          stats.turnosCancelados++
          break
      }
    })

    // Calcular promedio diario
    stats.promedioDiario = stats.totalTurnos > 0 
      ? Math.round(stats.ingresosDelDia / stats.totalTurnos)
      : 0

    return stats
  }

  // Obtener estadísticas del día
  async getStatsDelDia(): Promise<Stats> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const { data, error } = await this.supabase
      .from('turnos')
      .select(`
        id,
        fecha_hora,
        estado,
        servicio:servicios(precio)
      `)
      .gte('fecha_hora', today.toISOString())
      .lt('fecha_hora', tomorrow.toISOString())

    if (error) throw error
    return this.calcularStats(data as any)
  }

  // Obtener estadísticas del mes
  async getStatsDelMes(): Promise<Stats> {
    const firstDayOfMonth = new Date()
    firstDayOfMonth.setDate(1)
    firstDayOfMonth.setHours(0, 0, 0, 0)

    const { data, error } = await this.supabase
      .from('turnos')
      .select(`
        id,
        fecha_hora,
        estado,
        servicio:servicios(precio)
      `)
      .gte('fecha_hora', firstDayOfMonth.toISOString())

    if (error) throw error
    return this.calcularStats(data as any)
  }

  // Obtener servicios más pedidos
  async getServiciosMasPedidos(limite: number = 5): Promise<{ servicio: string; cantidad: number }[]> {
    const { data, error } = await this.supabase
      .from('turnos')
      .select(`
        servicio:servicios(nombre)
      `)
      .eq('estado', 'completado')

    if (error) throw error

    const contador: Record<string, number> = {}
    ;(data as any).forEach((turno: any) => {
      const nombre = turno.servicio?.nombre || 'Unknown'
      contador[nombre] = (contador[nombre] || 0) + 1
    })

    return Object.entries(contador)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limite)
      .map(([servicio, cantidad]) => ({ servicio, cantidad }))
  }

  // Calcular tasa de cancelación
  calcularTasaCancelacion(stats: Stats): number {
    if (stats.totalTurnos === 0) return 0
    return Math.round((stats.turnosCancelados / stats.totalTurnos) * 100)
  }
}

// Instancia singleton
export const statsService = new StatsService()