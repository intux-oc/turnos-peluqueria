-- ============================================================
-- AUDIT FIXES: Database Optimization & Scalability
-- ============================================================

-- 1. FIX: Permite que varios empleados tengan turnos a la misma hora
-- Eliminamos el índice antiguo que solo miraba la peluquería y hora
DROP INDEX IF EXISTS unique_turno_hora;

-- Creamos el nuevo índice que incluye al empleado
-- Esto permite que el Empleado A y el Empleado B tengan turnos a las 10:00
CREATE UNIQUE INDEX unique_turno_hora_empleado 
ON turnos (barbershop_id, empleado_id, fecha_hora) 
WHERE estado IN ('pendiente', 'confirmado');

-- 2. OPTIMIZACIÓN: RLS y Consultas más rápidas
CREATE INDEX IF NOT EXISTS idx_servicios_barbershop_id ON servicios(barbershop_id);
CREATE INDEX IF NOT EXISTS idx_empleados_barbershop_id ON empleados(barbershop_id);
CREATE INDEX IF NOT EXISTS idx_turnos_barbershop_id ON turnos(barbershop_id);

-- 3. SAAS: Agregar estado 'past_due' para periodo de gracia
ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_status_check;
ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_status_check 
  CHECK (status IN ('pending', 'active', 'expired', 'canceled', 'past_due'));

-- 4. AUTOMACIÓN: Verificar suscripciones expiradas diariamente
-- Activar la extensión pg_cron (requiere permisos de superusuario)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Crear un cron job que corra todos los días a la medianoche
-- Nota: Si pg_cron no está disponible en tu plan de Supabase, podés omitir esto.
SELECT cron.schedule('verificar_suscripciones_diario', '0 0 * * *', $$
  UPDATE public.subscriptions
  SET status = 'past_due'
  WHERE status = 'active' AND current_period_end < NOW();
$$);

-- 5. ÍNDICES GENERALES PARA MEJORAR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_turnos_fecha ON turnos(fecha_hora);
CREATE INDEX IF NOT EXISTS idx_turnos_estado ON turnos(estado);
