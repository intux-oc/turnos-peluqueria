
-- 8. Tabla de Planes (SaaS)
CREATE TABLE IF NOT EXISTS saas_plans (
  id TEXT PRIMARY KEY, -- 'mensual', 'anual'
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  interval TEXT DEFAULT 'month', -- 'month', 'year'
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE saas_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read active plans" ON saas_plans FOR SELECT USING (active = true);

-- Insertar planes iniciales
INSERT INTO saas_plans (id, name, description, price, interval) VALUES
  ('mensual', 'Plan Mensual Profesional', 'Gestión completa de peluquería, empleados y reportes.', 4999.00, 'month'),
  ('anual', 'Plan Anual Premium', 'Ahorra 2 meses pagando el año completo.', 39999.00, 'year')
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price;

-- 9. Actualizar Tabla de Suscripciones (para mayor robustez)
-- Borrar si existe para recrear con mejor estructura
-- DROP TABLE IF EXISTS subscriptions;

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barbershop_id UUID NOT NULL REFERENCES barbershops(id) ON DELETE CASCADE,
  plan_id TEXT REFERENCES saas_plans(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'canceled', 'past_due')),
  mp_preference_id TEXT,
  mp_payment_id TEXT,
  amount DECIMAL(10, 2),
  current_period_start TIMESTAMPTZ DEFAULT NOW(),
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners can see their subscriptions" ON subscriptions FOR SELECT USING (
  EXISTS (SELECT 1 FROM barbershops WHERE id = subscriptions.barbershop_id AND owner_id = auth.uid())
);
