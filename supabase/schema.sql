-- ============================================================
-- GLOBAL SCHEMA: Intux Oc - Peluquería SaaS
-- ============================================================

-- EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 1. Profiles (extiende auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT,
  full_name   TEXT,
  phone       TEXT,
  role        TEXT DEFAULT 'cliente' CHECK (role IN ('cliente', 'admin', 'superadmin')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

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

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Barbershops
CREATE TABLE IF NOT EXISTS barbershops (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  slug            TEXT UNIQUE NOT NULL,
  address         TEXT,
  phone           TEXT,
  logo_url        TEXT,
  primary_color   TEXT DEFAULT '#ffffff',
  secondary_color TEXT DEFAULT '#000000',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE barbershops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view barbershops" ON barbershops FOR SELECT USING (true);
CREATE POLICY "Owners can manage their barbershop" ON barbershops FOR ALL USING (auth.uid() = owner_id);

-- Utility: is_admin_of
CREATE OR REPLACE FUNCTION is_admin_of(b_id UUID) 
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM barbershops 
    WHERE id = b_id AND owner_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 3. SaaS Plans
CREATE TABLE IF NOT EXISTS saas_plans (
  id          TEXT PRIMARY KEY, -- 'mensual', 'anual'
  name        TEXT NOT NULL,
  description TEXT,
  price       DECIMAL(10, 2) NOT NULL,
  interval    TEXT DEFAULT 'month', -- 'month', 'year'
  active      BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE saas_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read active plans" ON saas_plans FOR SELECT USING (active = true);

INSERT INTO saas_plans (id, name, description, price, interval) VALUES
  ('mensual', 'Plan Mensual Profesional', 'Gestión completa de peluquería, empleados y reportes.', 4999.00, 'month'),
  ('anual', 'Plan Anual Premium', 'Ahorra 2 meses pagando el año completo.', 39999.00, 'year')
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price;

-- 4. Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barbershop_id         UUID NOT NULL REFERENCES barbershops(id) ON DELETE CASCADE,
  plan_id               TEXT REFERENCES saas_plans(id),
  status                TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'canceled', 'past_due', 'expired')),
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
  FOR SELECT USING (is_admin_of(barbershop_id));

-- 5. Servicios
CREATE TABLE IF NOT EXISTS servicios (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barbershop_id           UUID NOT NULL REFERENCES barbershops(id) ON DELETE CASCADE,
  nombre                  TEXT NOT NULL,
  descripcion             TEXT,
  precio                  DECIMAL(10, 2) NOT NULL,
  duracion_minutos        INTEGER NOT NULL,
  activo                  BOOLEAN DEFAULT true,
  requiere_senia          BOOLEAN DEFAULT false,
  monto_senia_porcentaje  DECIMAL(5, 2) DEFAULT 30.00,
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  updated_at              TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE servicios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active servicios" ON servicios FOR SELECT USING (activo = true);
CREATE POLICY "Admin can manage own barbershop servicios" ON servicios
  FOR ALL USING (is_admin_of(barbershop_id));

-- 6. Empleados
CREATE TABLE IF NOT EXISTS empleados (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barbershop_id   UUID NOT NULL REFERENCES barbershops(id) ON DELETE CASCADE,
  user_id         UUID REFERENCES profiles(id),
  nombre          TEXT NOT NULL,
  especialidad    TEXT,
  foto_url        TEXT,
  activo          BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE empleados ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active empleados" ON empleados FOR SELECT USING (activo = true);
CREATE POLICY "Admin can manage own barbershop empleados" ON empleados
  FOR ALL USING (is_admin_of(barbershop_id));

-- 7. Turnos
CREATE TABLE IF NOT EXISTS turnos (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barbershop_id   UUID NOT NULL REFERENCES barbershops(id) ON DELETE CASCADE,
  cliente_id      UUID NOT NULL REFERENCES profiles(id),
  empleado_id     UUID REFERENCES empleados(id),
  servicio_id     UUID NOT NULL REFERENCES servicios(id),
  fecha_hora      TIMESTAMPTZ NOT NULL,
  estado          TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'confirmado', 'completado', 'cancelado')),
  notas           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE turnos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can read own turns" ON turnos FOR SELECT USING (auth.uid() = cliente_id);
CREATE POLICY "Clients can create turns" ON turnos FOR INSERT WITH CHECK (auth.uid() = cliente_id);
CREATE POLICY "Admin can manage own barbershop turnos" ON turnos
  FOR ALL USING (is_admin_of(barbershop_id));

-- Overbooking Logic
CREATE OR REPLACE FUNCTION check_turno_overlap() RETURNS TRIGGER AS $$
DECLARE
  duracion INT;
BEGIN
  SELECT duracion_minutos INTO duracion FROM servicios WHERE id = NEW.servicio_id;
  IF EXISTS (
    SELECT 1 FROM turnos 
    WHERE empleado_id = NEW.empleado_id
      AND barbershop_id = NEW.barbershop_id
      AND estado IN ('pendiente', 'confirmado')
      AND id != NEW.id
      AND (
        (NEW.fecha_hora, NEW.fecha_hora + (duracion || ' minutes')::interval) 
        OVERLAPS 
        (fecha_hora, fecha_hora + (SELECT duracion_minutos FROM servicios WHERE id = turnos.servicio_id) * interval '1 minute')
      )
  ) THEN
    RAISE EXCEPTION 'El empleado ya tiene un turno asignado en ese rango de horario.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER prevent_turno_overlap
BEFORE INSERT OR UPDATE ON turnos
FOR EACH ROW EXECUTE FUNCTION check_turno_overlap();

-- Unique index per employee (Audit fix)
CREATE UNIQUE INDEX IF NOT EXISTS unique_turno_hora_empleado 
ON turnos (barbershop_id, empleado_id, fecha_hora) 
WHERE estado IN ('pendiente', 'confirmado');

-- 8. Horarios
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
  FOR ALL USING (is_admin_of(barbershop_id));

-- 9. Reviews
CREATE TABLE IF NOT EXISTS reviews (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    barbershop_id UUID NOT NULL REFERENCES barbershops(id) ON DELETE CASCADE,
    cliente_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    turno_id      UUID NOT NULL REFERENCES turnos(id) ON DELETE CASCADE UNIQUE,
    rating        INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment       TEXT,
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    updated_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Users can create their own reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = cliente_id);
CREATE POLICY "Owners can view and manage shop reviews" ON reviews FOR ALL USING (is_admin_of(barbershop_id));

-- 10. INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_servicios_barbershop_id ON servicios(barbershop_id);
CREATE INDEX IF NOT EXISTS idx_empleados_barbershop_id ON empleados(barbershop_id);
CREATE INDEX IF NOT EXISTS idx_turnos_barbershop_id ON turnos(barbershop_id);
CREATE INDEX IF NOT EXISTS idx_turnos_fecha ON turnos(fecha_hora);
CREATE INDEX IF NOT EXISTS idx_turnos_estado ON turnos(estado);
CREATE INDEX IF NOT EXISTS idx_turnos_barbershop_fecha ON turnos(barbershop_id, fecha_hora);
CREATE INDEX IF NOT EXISTS idx_empleados_barbershop_active ON empleados(barbershop_id) WHERE activo = true;

-- 11. CRON JOBS (Requires pg_cron)
-- Check expired daily at midnight
SELECT cron.schedule('verificar_suscripciones_diario', '0 0 * * *', $$
  UPDATE public.subscriptions
  SET status = 'past_due'
  WHERE status = 'active' AND current_period_end < NOW();
$$);

-- Suspender morosos after 5 days in past_due
SELECT cron.schedule('suspender-morosos-diario', '0 3 * * *', $$
    UPDATE public.subscriptions 
    SET status = 'expired' 
    WHERE status = 'past_due' 
    AND updated_at < NOW() - INTERVAL '5 days';
$$);

-- 12. PERMISSIONS (GRANT)
-- Grant usage on schema public to anon and authenticated roles
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- Ensure future tables also get these permissions
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, anon, authenticated, service_role;
