-- Script SQL para crear las tablas en Supabase
-- Ejecutar en el SQL Editor de Supabase

-- 1. Tabla profiles (extiende auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'cliente' CHECK (role IN ('cliente', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Política de lectura: usuarios pueden leer su propio perfil
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Política de update: usuarios pueden actualizar su propio perfil
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Política de inserción automática al crear usuario (trigger)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Tabla servicios
CREATE TABLE IF NOT EXISTS servicios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  descripcion TEXT,
  precio DECIMAL(10, 2) NOT NULL,
  duracion_minutos INTEGER NOT NULL,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE servicios ENABLE ROW LEVEL SECURITY;

-- Política: cualquier persona puede leer servicios activos
CREATE POLICY "Anyone can read active servicios" ON servicios
  FOR SELECT USING (activo = true);

-- Política: solo admins pueden modificar
CREATE POLICY "Admins can manage servicios" ON servicios
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Insertar servicios de ejemplo
INSERT INTO servicios (nombre, descripcion, precio, duracion_minutos) VALUES
  ('Corte de cabello', 'Corte y peinado moderno', 2500, 30),
  ('Corte y barba', 'Corte completo con arreglo de barba', 3500, 45),
  ('Coloración', 'Tintura completa', 5000, 90),
  ('Mechas / Balayage', 'Aclaración con técnica profesional', 8000, 120),
  ('Tratamiento de hidratación', 'Mascarilla nutritiva', 2000, 30),
  ('Peinado especial', 'Peinado para eventos', 3000, 45);

-- 3. Tabla empleados
CREATE TABLE IF NOT EXISTS empleados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  nombre TEXT NOT NULL,
  especialidad TEXT,
  foto_url TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE empleados ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active empleados" ON empleados
  FOR SELECT USING (activo = true);

CREATE POLICY "Admins can manage empleados" ON empleados
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 4. Tabla turnos
CREATE TABLE IF NOT EXISTS turnos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- Política: clientes pueden ver sus propios turnos
CREATE POLICY "Clients can read own turns" ON turnos
  FOR SELECT USING (auth.uid() = cliente_id);

-- Política: clientes pueden crear turnos
CREATE POLICY "Clients can create turns" ON turnos
  FOR INSERT WITH CHECK (auth.uid() = cliente_id);

-- Política: clientes pueden cancelar sus propios turnos
CREATE POLICY "Clients can cancel own turns" ON turnos
  FOR UPDATE USING (auth.uid() = cliente_id AND estado = 'pendiente');

-- Política: admins pueden ver todos los turnos
CREATE POLICY "Admins can read all turns" ON turnos
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Política: admins pueden actualizar turnos
CREATE POLICY "Admins can update turns" ON turnos
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 5. Tabla configuración
CREATE TABLE IF NOT EXISTS configuracion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE configuracion ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read config" ON configuracion
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage config" ON configuracion
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Insertar configuración inicial
INSERT INTO configuracion (key, value) VALUES
  ('horario_atencion', '{"apertura": "09:00", "cierre": "19:00", "dias_laborables": [1,2,3,4,5]}'),
  ('politica_cancelacion', '{"horas_minimas": 2}');
