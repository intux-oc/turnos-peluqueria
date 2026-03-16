// SaaS type definitions — extend as needed when Supabase types are generated

// Re-export common row types inline (update if you generate types with the Supabase CLI)
export interface Profile {
  id: string
  email: string | null
  full_name: string | null
  phone: string | null
  role: 'cliente' | 'admin' | 'superadmin'
  created_at: string
  updated_at: string
}

export interface Servicio {
  id: string
  barbershop_id: string | null
  nombre: string
  descripcion: string | null
  precio: number
  duracion_minutos: number
  activo: boolean
  created_at: string
  updated_at: string
}

export interface Turno {
  id: string
  barbershop_id: string | null
  cliente_id: string
  empleado_id: string | null
  servicio_id: string
  fecha_hora: string
  estado: 'pendiente' | 'confirmado' | 'completado' | 'cancelado'
  notas: string | null
  created_at: string
  updated_at: string
}

export interface Empleado {
  id: string
  barbershop_id: string | null
  user_id: string | null
  nombre: string
  especialidad: string | null
  foto_url: string | null
  activo: boolean
  created_at: string
}

// New SaaS types
export interface Barbershop {
  id: string
  owner_id: string
  name: string
  slug: string
  address: string | null
  phone: string | null
  logo_url: string | null
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: string
  barbershop_id: string
  plan: 'mensual' | 'anual'
  status: 'trialing' | 'active' | 'past_due' | 'canceled'
  current_period_start: string | null
  current_period_end: string | null
  amount: number | null
  created_at: string
  updated_at: string
}

export interface Horario {
  id: string
  barbershop_id: string
  dia_semana: number
  hora_apertura: string
  hora_cierre: string
  activo: boolean
  created_at: string
}

// Extended types with relations
export interface BarbershopWithSubscription extends Barbershop {
  subscription: Subscription | null
  owner: Pick<Profile, 'full_name' | 'email'> | null
}

export interface TurnoWithRelations extends Turno {
  cliente: Pick<Profile, 'full_name' | 'email'> | null
  servicio: Pick<Servicio, 'nombre' | 'precio'> | null
}
