// src/types/database.ts

export interface Profile {
  id: string
  email: string | null
  full_name: string | null
  phone: string | null
  role: 'cliente' | 'admin' | 'superadmin'
  created_at: string
  updated_at: string
}

export interface Barbershop {
  id: string
  owner_id: string
  name: string
  slug: string
  address: string | null
  phone: string | null
  logo_url: string | null
  primary_color: string | null
  secondary_color: string | null
}

export interface Servicio {
  id: string
  barbershop_id: string
  nombre: string
  descripcion: string | null
  precio: number
  duracion_minutos: number
  activo: boolean
}

export interface Empleado {
  id: string
  barbershop_id: string
  user_id: string | null
  nombre: string
  especialidad: string | null
  foto_url: string | null
  activo: boolean
}

export interface Turno {
  id: string
  barbershop_id: string
  cliente_id: string
  empleado_id: string | null
  servicio_id: string
  fecha_hora: string
  estado: 'pendiente' | 'confirmado' | 'completado' | 'cancelado'
  notas: string | null
  // Relaciones (joins) que haremos con Supabase
  cliente?: { full_name: string; email: string } | null
  servicio?: { nombre: string; precio: number; duracion_minutos: number } | null
  empleado?: { nombre: string; especialidad: string | null } | null
}

export interface Subscription {
  id: string
  barbershop_id: string
  plan_id: string
  status: 'pending' | 'active' | 'canceled' | 'expired' | 'past_due'
  mp_preference_id?: string
  mp_payment_id?: string
  amount: number
  current_period_start: string
  current_period_end?: string
  created_at: string
}

export interface Review {
  id: string
  barbershop_id: string
  cliente_id: string
  turno_id: string
  rating: number
  comment?: string
  created_at: string
  cliente?: Partial<Profile>
}
