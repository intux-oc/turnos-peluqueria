-- ============================================================
-- COMPLETE DATABASE SCHEMA: Intux Oc - Peluquería SaaS
-- ============================================================

-- 1. Tabla profiles (extiende auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'cliente' CHECK (role IN ('cliente', 'admin', 'superadmin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Public can view limited profile info" ON profiles FOR SELECT USING (true);

-- Trigger para crear perfil automáticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', COALESCE(NEW.raw_user_meta_data->>'role', 'cliente'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Tabla de Peluquerías (Barbershops)
CREATE TABLE IF NOT EXISTS barbershops (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  slug         TEXT UNIQUE NOT NULL,
  address      TEXT,
  phone        TEXT,
  logo_url     TEXT,
  primary_color TEXT DEFAULT '#ffffff',
  secondary_color TEXT DEFAULT '#000000',
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE barbershops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view barbershops" ON barbershops FOR SELECT USING (true);
CREATE POLICY "Owners can manage their barbershop" ON barbershops FOR ALL USING (auth.uid() = owner_id);

-- 3. Tabla servicios
CREATE TABLE IF NOT EXISTS servicios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barbershop_id UUID NOT NULL REFERENCES barbershops(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  precio DECIMAL(10, 2) NOT NULL,
  duracion_minutos INTEGER NOT NULL,
  activo BOOLEAN DEFAULT true,
  requiere_senia BOOLEAN DEFAULT false,
  monto_senia_porcentaje DECIMAL(5, 2) DEFAULT 30.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE servicios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active servicios" ON servicios FOR SELECT USING (activo = true);
CREATE POLICY "Admin can manage own barbershop servicios" ON servicios
  FOR ALL USING (EXISTS (SELECT 1 FROM barbershops WHERE id = barbershop_id AND owner_id = auth.uid()));

-- 4. Tabla empleados (profesionales)
CREATE TABLE IF NOT EXISTS empleados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barbershop_id UUID NOT NULL REFERENCES barbershops(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  nombre TEXT NOT NULL,
  especialidad TEXT,
  foto_url TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE empleados ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active empleados" ON empleados FOR SELECT USING (activo = true);
CREATE POLICY "Admin can manage own barbershop empleados" ON empleados
  FOR ALL USING (EXISTS (SELECT 1 FROM barbershops WHERE id = barbershop_id AND owner_id = auth.uid()));

-- 5. Tabla turnos (appointments)
CREATE TABLE IF NOT EXISTS turnos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barbershop_id UUID NOT NULL REFERENCES barbershops(id) ON DELETE CASCADE,
  cliente_id UUID NOT NULL REFERENCES profiles(id),
  empleado_id UUID REFERENCES empleados(id),
  servicio_id UUID NOT NULL REFERENCES servicios(id),
  fecha_hora TIMESTAMPTZ NOT NULL,
  estado TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'confirmado', 'completado', 'cancelado')),
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE turnos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can read own turns" ON turnos FOR SELECT USING (auth.uid() = cliente_id);
CREATE POLICY "Clients can create turns" ON turnos FOR INSERT WITH CHECK (auth.uid() = cliente_id);
CREATE POLICY "Admin can manage own barbershop turnos" ON turnos
  FOR ALL USING (EXISTS (SELECT 1 FROM barbershops WHERE id = barbershop_id AND owner_id = auth.uid()));

-- Prevenir Overbooking por Rangos de Tiempo (PostgreSQL Avanzado)
CREATE OR REPLACE FUNCTION check_turno_overlap() RETURNS TRIGGER AS $$
DECLARE
  duracion INT;
BEGIN
  -- Obtener la duración del servicio
  SELECT duracion_minutos INTO duracion FROM servicios WHERE id = NEW.servicio_id;

  IF EXISTS (
    SELECT 1 FROM turnos 
    WHERE empleado_id = NEW.empleado_id
      AND barbershop_id = NEW.barbershop_id
      AND estado IN ('pendiente', 'confirmado')
      AND id != NEW.id -- Ignorar a sí mismo en caso de UPDATE
      AND (
        -- Verifica si hay superposición real de rangos de tiempo
        (NEW.fecha_hora, NEW.fecha_hora + (duracion || ' minutes')::interval) 
        OVERLAPS 
        (fecha_hora, fecha_hora + (
          SELECT duracion_minutos 
          FROM servicios 
          WHERE id = turnos.servicio_id
        ) * interval '1 minute')
      )
  ) THEN
    RAISE EXCEPTION 'El empleado ya tiene un turno asignado en ese rango de horario.';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS prevent_turno_overlap ON turnos;
CREATE TRIGGER prevent_turno_overlap
BEFORE INSERT OR UPDATE ON turnos
FOR EACH ROW EXECUTE FUNCTION check_turno_overlap();

-- Prevenir Double Booking (Un turno por hora por peluquería si está confirmado/pendiente)
-- (Mantenemos el índice unique para compatibilidad simple, aunque el trigger es más potente)
CREATE UNIQUE INDEX IF NOT EXISTS unique_turno_hora 
ON turnos (barbershop_id, fecha_hora) 
WHERE estado IN ('pendiente', 'confirmado');

-- 6. Tabla horarios (Working Hours)
CREATE TABLE IF NOT EXISTS horarios (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barbershop_id  UUID NOT NULL REFERENCES barbershops(id) ON DELETE CASCADE,
  dia_semana     INTEGER NOT NULL CHECK (dia_semana BETWEEN 0 AND 6),
  hora_apertura  TIME NOT NULL DEFAULT '09:00',
  hora_cierre    TIME NOT NULL DEFAULT '19:00',
  activo         BOOLEAN DEFAULT true,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE horarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read horarios" ON horarios FOR SELECT USING (activo = true);
CREATE POLICY "Admin can manage own horarios" ON horarios
  FOR ALL USING (EXISTS (SELECT 1 FROM barbershops WHERE id = barbershop_id AND owner_id = auth.uid()));

-- 7. Tabla suscripciones (SaaS - Mercado Pago)
CREATE TABLE IF NOT EXISTS subscriptions (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barbershop_id         UUID NOT NULL REFERENCES barbershops(id) ON DELETE CASCADE,
  plan_id               TEXT NOT NULL, -- 'mensual', 'anual'
  status                TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'expired', 'canceled')),
  mp_preference_id      TEXT,
  mp_payment_id         TEXT,
  amount                DECIMAL(10, 2),
  current_period_start  TIMESTAMPTZ DEFAULT NOW(),
  current_period_end    TIMESTAMPTZ,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can view their own subscriptions" ON subscriptions
  FOR SELECT USING (
    barbershop_id IN (SELECT id FROM barbershops WHERE owner_id = auth.uid())
  );

-- 8. Tabla reviews (Opiniones)
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    barbershop_id UUID NOT NULL REFERENCES barbershops(id) ON DELETE CASCADE,
    cliente_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    turno_id UUID NOT NULL REFERENCES turnos(id) ON DELETE CASCADE UNIQUE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Users can create their own reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = cliente_id);
-- Función auxiliar para optimizar chequeos de administración (STABLE para caché por transacción)
CREATE OR REPLACE FUNCTION is_admin_of(b_id UUID) 
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM barbershops 
    WHERE id = b_id AND owner_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 3. Tabla servicios
-- ... (código previo)
CREATE POLICY "Admin can manage own barbershop servicios" ON servicios
  FOR ALL USING (is_admin_of(barbershop_id));

-- 4. Tabla empleados
-- ... (código previo)
CREATE POLICY "Admin can manage own barbershop empleados" ON empleados
  FOR ALL USING (is_admin_of(barbershop_id));

-- 5. Tabla turnos
-- ... (código previo)
CREATE POLICY "Admin can manage own barbershop turnos" ON turnos
  FOR ALL USING (is_admin_of(barbershop_id));

-- 6. Tabla horarios
-- ... (código previo)
CREATE POLICY "Admin can manage own horarios" ON horarios
  FOR ALL USING (is_admin_of(barbershop_id));

-- 7. Tabla suscripciones
CREATE POLICY "Owners can view their own subscriptions" ON subscriptions
  FOR SELECT USING (is_admin_of(barbershop_id));

-- 8. Tabla reviews
CREATE POLICY "Owners can view and manage shop reviews" ON reviews
  FOR ALL USING (is_admin_of(barbershop_id));
