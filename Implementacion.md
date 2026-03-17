# Desglose de Mejoras y Modularización del Sistema

Para lograr que el sistema sea realmente ligero y escalable, la prioridad número uno es aplicar el **Principio de Responsabilidad Única (SRP)**. Actualmente, tenemos componentes que gestionan demasiadas tareas, lo que causa lentitud en la renderización y dificultad en el mantenimiento.

A continuación, detallo mi propuesta técnica para "adelgazar" el sistema:

## 1. Descomposición de Funciones Críticas

### 1.1 Gestión de Turnos (Admin)
Actualmente, la lógica de carga, filtrado y cálculo de estadísticas está en un solo bloque.
- **Recomendación**: Dividir [AdminPage](file:///c:/Users/esteb/Desktop/Peluqueria/turnos-peluqueria/src/app/admin/page.tsx#13-317) en:
  - `TurnoService.ts`: Lógica pura de base de datos (fetch, update).
  - `StatsService.ts`: Funciones puras para procesar datos y devolver números (recaudación, pendientes).
  - `TurnoCard.tsx`: Un componente visual que solo muestra los datos de un turno y maneja sus estados internos.

### 1.2 Generador de Horarios (Frontend)
El cálculo de huecos disponibles es pesado y se ejecuta en el componente principal de reserva.
- **Recomendación**: Crear un Helper `TimeSlotGenerator.ts`.
  - Esta función recibirá la jornada laboral y los turnos ocupados, y devolverá solo el array de huecos listos para mostrar.
  - Esto libera al componente visual de cálculos matemáticos y de fechas complejos.

## 2. Refactorización de Componentes Gigantes

### 2.1 Páginas de "Cero Configuración"
Las páginas deben actuar como orquestadores, no como ejecutores.
- **Antes**: La página pide datos -> Los procesa -> Muestra 500 líneas de HTML.
- **Después**: 
  - `Page.tsx`: Solo llama a los componentes.
  - `<Overview />`: Muestra estadísticas.
  - `<ScheduleList />`: Muestra la agenda.
  - `<ActionPanel />`: Botones de gestión rápida.

## 3. Estrategia de Carga Inteligente

### 3.1 Priorizar Server Components
Muchas partes del sistema no necesitan interactividad constante.
- **Propuesta**: Convertir el encabezado y la información estática del local en **Server Components**.
- **Beneficio**: El navegador recibe HTML puro y no tiene que "pensar" cómo dibujarlo, reduciendo el tiempo de carga inicial drásticamente.

### 3.2 Optimización de Assets
- Sustituir todas las etiquetas `<img>` por el componente `<Image />` de Next.js.
- Esto habilita automáticamente el **Lazy Loading** (solo carga la imagen cuando el usuario hace scroll hacia ella) y el redimensionamiento automático.

## 4. Hoja de Ruta Sugerida

1. **Semana 1: Limpieza Estructural**. Extraer funciones de negocio de los archivos [.tsx](file:///c:/Users/esteb/Desktop/Peluqueria/turnos-peluqueria/src/app/page.tsx) a carpetas `/lib` o `/services`.
2. **Semana 2: Componentización**. Dividir el Admin y la Reserva Pública en piezas atómicas.
3. **Semana 3: SSR y Performance**. Implementar carga en el servidor y optimización de imágenes.

---
*Este documento es una guía estratégica. No se han realizado cambios en el código aún para permitir su revisión.*
