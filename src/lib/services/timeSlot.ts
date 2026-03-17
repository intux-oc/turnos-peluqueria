import { TurnoWithRelations } from './turno'

export interface TimeSlot {
  hora: string
  disponible: boolean
  turnoId?: string
}

export interface HorarioConfig {
  horaApertura: string // "09:00"
  horaCierre: string // "20:00"
  duracionSlots: number // minutos por turno (ej: 30, 45, 60)
}

export interface DateConfig {
  diaSemana: number // 0=Domingo, 1=Lunes...
  esFestivo?: boolean
}

// Helper puro para generar horarios disponibles
export class TimeSlotGenerator {
  private config: HorarioConfig

  constructor(config: HorarioConfig) {
    this.config = config
  }

  // Generar todos los slots de un día
  generarSlots(turnosOcupados: TurnoWithRelations[]): TimeSlot[] {
    const slots: TimeSlot[] = []
    const [aperturaHora, aperturaMin] = this.config.horaApertura.split(':').map(Number)
    const [cierreHora, cierreMin] = this.config.horaCierre.split(':').map(Number)

    // Convertir minutos desde medianoche
    const inicioMinutos = aperturaHora * 60 + aperturaMin
    const finMinutos = cierreHora * 60 + cierreMin
    const duracion = this.config.duracionSlots

    // Crear mapa de ocupación para búsqueda O(1)
    const ocupados = new Map<string, string>()
    turnosOcupados.forEach((turno) => {
      const hora = new Date(turno.fecha_hora).toTimeString().slice(0, 5)
      ocupados.set(hora, turno.id)
    })

    // Generar cada slot
    for (let minutos = inicioMinutos; minutos < finMinutos; minutos += duracion) {
      const hora = Math.floor(minutos / 60)
      const min = minutos % 60
      const horaStr = `${hora.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`
      
      slots.push({
        hora: horaStr,
        disponible: !ocupados.has(horaStr),
        turnoId: ocupados.get(horaStr),
      })
    }

    return slots
  }

  // Obtener solo los disponibles
  getSlotsDisponibles(turnosOcupados: TurnoWithRelations[]): TimeSlot[] {
    return this.generarSlots(turnosOcupados).filter(slot => slot.disponible)
  }

  // Verificar si una hora específica está disponible
  isHoraDisponible(hora: string, turnosOcupados: TurnoWithRelations[]): boolean {
    return !turnosOcupados.some(turno => {
      const horaTurno = new Date(turno.fecha_hora).toTimeString().slice(0, 5)
      return horaTurno === hora
    })
  }

  // Encontrar el próximo slot disponible
  getProximoSlotDisponible(turnosOcupados: TurnoWithRelations[]): string | null {
    const disponibles = this.getSlotsDisponibles(turnosOcupados)
    return disponibles.length > 0 ? disponibles[0].hora : null
  }
}

// Configuraciones predefinidas por día de la semana
export const configuracionPorDefecto: Record<number, HorarioConfig> = {
  0: { horaApertura: '10:00', horaCierre: '18:00', duracionSlots: 60 }, // Domingo
  1: { horaApertura: '09:00', horaCierre: '20:00', duracionSlots: 30 }, // Lunes
  2: { horaApertura: '09:00', horaCierre: '20:00', duracionSlots: 30 }, // Martes
  3: { horaApertura: '09:00', horaCierre: '20:00', duracionSlots: 30 }, // Miércoles
  4: { horaApertura: '09:00', horaCierre: '20:00', duracionSlots: 30 }, // Jueves
  5: { horaApertura: '09:00', horaCierre: '20:00', duracionSlots: 30 }, // Viernes
  6: { horaApertura: '09:00', horaCierre: '20:00', duracionSlots: 30 }, // Sábado
}

// Factory function para crear el generador con configuración apropiada
export function createTimeSlotGenerator(diaSemana: number): TimeSlotGenerator {
  const config = configuracionPorDefecto[diaSemana] || configuracionPorDefecto[1]
  return new TimeSlotGenerator(config)
}

// Instancia por defecto
export const timeSlotGenerator = new TimeSlotGenerator(configuracionPorDefecto[1])