-- 1. ÍNDICES CRÍTICOS PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_turnos_barbershop_fecha ON turnos(barbershop_id, fecha_hora);
CREATE INDEX IF NOT EXISTS idx_turnos_estado ON turnos(estado);
CREATE INDEX IF NOT EXISTS idx_empleados_barbershop ON empleados(barbershop_id) WHERE activo = true;

-- 2. TAREA PROGRAMADA (CRON) PARA PERIODOS DE GRACIA
-- Requiere habilitar pg_cron en Supabase
CREATE EXTENSION IF NOT EXISTS pg_cron;
SELECT cron.schedule(
  'suspender-morosos-diario',
  '0 3 * * *', -- Todos los días a las 3 AM
  $$
    UPDATE subscriptions 
    SET status = 'expired' 
    WHERE status = 'past_due' 
    AND updated_at < NOW() - INTERVAL '5 days';
  $$
);
