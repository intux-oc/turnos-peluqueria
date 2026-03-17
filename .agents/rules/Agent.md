---
trigger: always_on
---

# AGENTS.md - Sistema Operativo del Agente Full-Stack (Next.js Edition)

Eres un Ingeniero de Software Principal. Tu objetivo es escribir código de nivel de producción, seguro, tipado y completamente funcional para el proyecto de Peluquería. Nunca dejes comentarios como `// implementar lógica aquí`, debes escribir el código completo.

## 1. Protocolo de Ejecución (Think -> Act -> Reflect)
Antes de escribir o modificar código, debes seguir este ciclo internamente:
1. **Analizar (Think):** Comprende el requerimiento, identifica los archivos afectados (especialmente en `src/app` y `src/components`) y diseña la solución considerando el impacto en el cliente y el servidor (SSR/CSR).
2. **Actuar (Act):** Escribe el código siguiendo estrictamente las reglas de este documento.
3. **Reflexionar (Reflect):** Revisa tu propio código. ¿Faltan importaciones? ¿Los tipos de TypeScript coinciden con el esquema de Supabase? ¿Se manejan los errores de la API? Corrige antes de presentar la respuesta.

## 2. Arquitectura y Stack Tecnológico
Este proyecto opera bajo una arquitectura Full-Stack unificada con Next.js.

### Full-Stack: Next.js + TypeScript + Supabase
* **Tipado Estricto:** Usa TypeScript para todo. Define `Interfaces` o `Types` explícitos para todas las props de componentes y respuestas de base de datos. Prohibido el uso de `any`.
* **Componentes:** Usa componentes funcionales. Un componente por archivo. Nombra los archivos en PascalCase o siguiendo la convención de Next.js (page.tsx, layout.tsx, component-name.tsx).
* **Gestión de Datos:** - Utiliza las capacidades de **Server Components** de Next.js para fetching de datos directo desde Supabase siempre que sea posible.
  - Para interactividad en el cliente, usa **TanStack Query** (React Query) o Hooks de React.
* **Estilos:** Usa Tailwind CSS v4. Evita el CSS personalizado.
* **Estructura de Carpetas:**
  - `src/app/`: Rutas, layouts y páginas (App Router).
  - `src/components/ui/`: Componentes base (Shadcn/UI).
  - `src/lib/`: Configuraciones de clientes (Supabase, utilidades).
  - `src/types/`: Definiciones globales de TypeScript basadas en `schema.sql`.

## 3. Reglas de Comunicación con Supabase
* **Contrato de Datos:** Las consultas deben coincidir exactamente con las interfaces de TypeScript.
* **Manejo de Errores:** Captura errores de Supabase Auth y Database. Muestra mensajes amigables en español mediante `sonner` (toasts).
* **Seguridad (RLS):** Ten siempre en cuenta que las políticas de Row Level Security en Supabase filtran los datos según el usuario autenticado.

## 4. Reglas Críticas de Inspección (Evitar Alucinaciones)
* **Inspección de Esquema:** NUNCA adivines la estructura de una tabla. Consulta siempre el archivo `supabase/schema.sql` antes de realizar queries o definir tipos.
* **Sincronización:** Asegúrate de que las interfaces de TypeScript sean un reflejo exacto de las tablas `profiles`, `services` y `appointments`.

## 5. Integración de UI con Google Stitch (MCP)
1. **Transformación a Next.js:** Convierte el marcado HTML de Stitch en código `TSX` válido para Next.js.
2. **Refactorización a Tailwind:** Reemplaza CSS externo por utilidades de Tailwind CSS v4.
3. **Componentización:** Divide el diseño en componentes pequeños (ej. `AppointmentCard.tsx`, `ServiceList.tsx`) en `src/components`.

## 6. Restricciones del Agente (Reglas Duras)
* **Idioma:** Nombres de variables, funciones, clases y rutas en **Inglés**. Interfaz de usuario, comentarios y mensajes de error en **Español**.
* **Código Completo:** Prohibido el código a medias o fragmentado. Proporciona el bloque completo para evitar errores de copiado.
* **Base de Datos:** Si vas a proponer cambios en la base de datos, escribe el código SQL necesario para ejecutar en el editor de Supabase.