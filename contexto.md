# Contexto General del Sistema - Turnos Peluquería SaaS

Este documento resume el estado actual del sistema tras completar todas las fases de desarrollo. La aplicación ha evolucionado de un rediseño UI a una plataforma SaaS (Software as a Service) multi-tenant completa y profesional.

## Arquitectura y Funcionalidades Principales

### 1. Multi-tenant y Branding (Fases 1 & 2)
- **Multi-tenant**: Cada peluquería tiene su propia URL única (`/b/slug`).
- **Personalización Administrativa**: Los dueños pueden cambiar colores (Primario/Secundario) y logos desde su panel, aplicando el branding de forma automática en su landing de reservas.
- **Glassmorphism Design**: Estética oscura premium constante en toda la aplicación.

### 2. Gestión de Turnos y Equipo (Phase 2)
- **Flujo de Reserva**: Selección intuitiva de servicio, profesional y horario con prevención de "double booking" mediante índices únicos en la base de datos.
- **Gestión de Empleados**: Los administradores pueden añadir, editar y asignar servicios a su equipo de profesionales.

### 3. Sistema de Pagos SaaS (Fase 3)
- **Mercado Pago**: Integración centralizada para el cobro de suscripciones (mensuales/anuales) a las peluquerías.
- **Webhooks**: Automatización de la activación de planes mediante notificaciones IPN.
- **Panel de Suscripción**: Los dueños pueden ver su estado de suscripción y renovar sus planes fácilmente.

### 4. Notificaciones por Email (Fase 4)
- **Integración con Resend**: Envío automatizado de correos electrónicos.
- **Templates Profesionales**: Confirmación de reserva para clientes y notificación de activación de suscripción para dueños.

### 5. Analytics y Reportes (Fase 5)
- **Dashboard Estadístico**: Visualización de recaudación diaria y mensual mediante gráficos de área.
- **Servicios Populares**: Gráficos de barras y circulares que muestran el rendimiento de los servicios del salón.

### 6. PWA y Feedback (Fase 6)
- **Instalabilidad (PWA)**: Soporte nativo para móviles con manifest, iconos premium y Service Worker para carga rápida.
- **Sistema de Reseñas**: Los clientes pueden calificar su experiencia (estrellas + comentario) y los administradores pueden gestionar este feedback.
- **Optimización SEO**: Metadatos profesionales (OpenGraph/Twitter) para compartir enlaces correctamente.

## Componentes Técnicos Clave
- **Frontend**: Next.js 16, Tailwind CSS v4, Lucide Icons, Recharts.
- **Backend/DB**: Supabase (PostgreSQL), RLS (Row Level Security) para protección de datos.
- **Archivo de Verdad**: `supabase/schema.sql` contiene la estructura completa y definitiva.
- **Documentación Técnica**: `TECH_STACK.md`.

## Acceso Rápido
- **Admin**: `/admin`
- **Público**: `/b/[slug]`
- **SuperAdmin**: `/super-admin` (Gestión global de la plataforma).
