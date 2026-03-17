# Stack Tecnológico - Intux Oc Peluquería

Este proyecto es una plataforma SaaS premium para la gestión de turnos en peluquerías y barberías.

## Frontend & Framework
- **Framework**: [Next.js 15/16 (App Router)](https://nextjs.org/) - Arquitectura moderna orientada a Server Components.
- **Lenguaje**: [TypeScript](https://www.typescriptlang.org/) - Tipado estricto en todo el proyecto.
- **Estilos**: [Tailwind CSS v4](https://tailwindcss.com/) - Diseño ultra-personalizado y optimizado.
- **Tipografía**: Outfit (Google Fonts).

## Backend & Base de Datos
- **Infraestructura**: [Supabase](https://supabase.com/)
  - **Base de Datos**: PostgreSQL con Row Level Security (RLS).
  - **Autenticación**: Supabase Auth (Integrado con perfiles personalizados).
  - **Storage**: Supabase Storage para logos, fotos de empleados e iconos.
  - **Realtime**: Para actualizaciones automáticas de turnos (opcional).

## Integraciones Clave
- **Pagos SaaS**: [Mercado Pago SDK](https://www.mercadopago.com.ar/developers) - Gestión de suscripciones mensuales/anuales para dueños de locales.
- **Emailing**: [Resend](https://resend.com/) - Notificaciones automáticas de reservas y activaciones de suscripción.
- **Estadísticas**: [Recharts](https://recharts.org/) - Visualización de recaudación y servicios populares para el administrador.

## UI Components & UX
- **Componentes**: [Shadcn/UI](https://ui.shadcn.com/) (basado en Radix UI / Base UI).
- **Iconos**: [Lucide React](https://lucide.dev/).
- **Toasts**: [Sonner](https://sonner.stevenly.me/).
- **PWA**: Soporte Nativo (Manifest + Service Worker) para instalación en dispositivos móviles.

## Características de Arquitectura
- **Multi-tenant**: Cada peluquería tiene su propio sub-sitio basado en un `slug` único.
- **Glassmorphism Design**: Estética oscura premium con transparencias y bordes definidos.
- **Mobile First**: Totalmente responsivo y optimizado para el uso diario en locales.
