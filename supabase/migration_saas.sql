-- ============================================================
-- MIGRATION: Single-tenant → Multi-tenant SaaS
-- Run this in your Supabase SQL Editor in ORDER.
-- ============================================================

-- ────────────────────────────────────────────────
-- STEP 1: Update `profiles` role constraint to include 'superadmin'
-- ────────────────────────────────────────────────
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('cliente', 'admin', 'superadmin'));

-- ────────────────────────────────────────────────
-- STEP 2: Create `barbershops` table
-- ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS barbershops (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  slug         TEXT UNIQUE NOT NULL,  -- used in /b/[slug]
  address      TEXT,
  phone        TEXT,
  logo_url     TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE barbershops ENABLE ROW LEVEL SECURITY;

-- Owner can read/update their own barbershop
CREATE POLICY "Owner can read own barbershop" ON barbershops
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Owner can update own barbershop" ON barbershops
  FOR UPDATE USING (auth.uid() = owner_id);

-- Anyone can INSERT their own barbershop (during registration)
CREATE POLICY "Authenticated users can create barbershop" ON barbershops
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Super-admins can see all
CREATE POLICY "Superadmin can read all barbershops" ON barbershops
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'superadmin')
  );

-- Public: anyone can read by slug (for the /b/[slug] booking page)
CREATE POLICY "Public can read barbershop by slug" ON barbershops
  FOR SELECT USING (true);

-- ────────────────────────────────────────────────
-- STEP 3: Create `subscriptions` table
-- ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subscriptions (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barbershop_id         UUID NOT NULL REFERENCES barbershops(id) ON DELETE CASCADE,
  plan                  TEXT DEFAULT 'mensual' CHECK (plan IN ('mensual', 'anual')),
  status                TEXT DEFAULT 'trialing' CHECK (status IN ('trialing', 'active', 'past_due', 'canceled')),
  current_period_start  TIMESTAMPTZ DEFAULT NOW(),
  current_period_end    TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
  amount                DECIMAL(10, 2),
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Owner can view their subscription
CREATE POLICY "Owner can read own subscription" ON subscriptions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM barbershops WHERE id = barbershop_id AND owner_id = auth.uid())
  );

-- Super-admin can see all subscriptions
CREATE POLICY "Superadmin can read all subscriptions" ON subscriptions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'superadmin')
  );

-- Super-admin can manage all subscriptions
CREATE POLICY "Superadmin can manage subscriptions" ON subscriptions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'superadmin')
  );

-- ────────────────────────────────────────────────
-- STEP 4: Add `barbershop_id` to existing tables
-- ────────────────────────────────────────────────

-- servicios
ALTER TABLE servicios ADD COLUMN IF NOT EXISTS barbershop_id UUID REFERENCES barbershops(id) ON DELETE CASCADE;

-- empleados
ALTER TABLE empleados ADD COLUMN IF NOT EXISTS barbershop_id UUID REFERENCES barbershops(id) ON DELETE CASCADE;

-- turnos
ALTER TABLE turnos ADD COLUMN IF NOT EXISTS barbershop_id UUID REFERENCES barbershops(id) ON DELETE CASCADE;

-- configuracion
ALTER TABLE configuracion ADD COLUMN IF NOT EXISTS barbershop_id UUID REFERENCES barbershops(id) ON DELETE CASCADE;

-- ────────────────────────────────────────────────
-- STEP 5: Update RLS Policies for multi-tenancy
-- ────────────────────────────────────────────────

-- DROP old single-tenant policies
DROP POLICY IF EXISTS "Admins can manage servicios" ON servicios;
DROP POLICY IF EXISTS "Admins can manage empleados" ON empleados;
DROP POLICY IF EXISTS "Admins can read all turns" ON turnos;
DROP POLICY IF EXISTS "Admins can update turns" ON turnos;
DROP POLICY IF EXISTS "Admins can manage config" ON configuracion;

-- SERVICIOS: Admin can only manage their own barbershop's services
CREATE POLICY "Admin can manage own barbershop servicios" ON servicios
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM barbershops
      WHERE barbershops.id = barbershop_id
      AND barbershops.owner_id = auth.uid()
    )
  );

-- EMPLEADOS: Admin can only manage their own barbershop's employees
CREATE POLICY "Admin can manage own barbershop empleados" ON empleados
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM barbershops
      WHERE barbershops.id = barbershop_id
      AND barbershops.owner_id = auth.uid()
    )
  );

-- TURNOS: Admin can see/update their own barbershop's appointments
CREATE POLICY "Admin can read own barbershop turnos" ON turnos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM barbershops
      WHERE barbershops.id = barbershop_id
      AND barbershops.owner_id = auth.uid()
    )
  );

CREATE POLICY "Admin can update own barbershop turnos" ON turnos
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM barbershops
      WHERE barbershops.id = barbershop_id
      AND barbershops.owner_id = auth.uid()
    )
  );

-- CONFIGURACION: Admin can manage their own barbershop config
CREATE POLICY "Admin can manage own barbershop config" ON configuracion
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM barbershops
      WHERE barbershops.id = barbershop_id
      AND barbershops.owner_id = auth.uid()
    )
  );

-- SUPER-ADMIN: can read everything
CREATE POLICY "Superadmin can read all turnos" ON turnos
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'superadmin')
  );

-- ────────────────────────────────────────────────
-- STEP 6: Create `horarios` table (working hours per barbershop)
-- ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS horarios (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barbershop_id  UUID NOT NULL REFERENCES barbershops(id) ON DELETE CASCADE,
  dia_semana     INTEGER NOT NULL CHECK (dia_semana BETWEEN 0 AND 6), -- 0=Sunday
  hora_apertura  TIME NOT NULL DEFAULT '09:00',
  hora_cierre    TIME NOT NULL DEFAULT '19:00',
  activo         BOOLEAN DEFAULT true,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE horarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read horarios" ON horarios
  FOR SELECT USING (activo = true);

CREATE POLICY "Admin can manage own horarios" ON horarios
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM barbershops
      WHERE barbershops.id = barbershop_id
      AND barbershops.owner_id = auth.uid()
    )
  );
