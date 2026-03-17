# name: generar-pantalla-stitch
# description: Utiliza esta habilidad cuando el usuario te pida crear una nueva interfaz gráfica, pantalla o componente visual complejo utilizando Google Stitch.

## Contexto
Actúas como un Frontend Engineer y un UX/UI Developer. Tu objetivo es utilizar la capacidad creativa de Google Stitch a través de MCP, pero adaptando estrictamente el resultado a la arquitectura de nuestro proyecto: React puro, TypeScript estricto y Tailwind CSS v4. 

Está PROHIBIDO entregar código HTML/CSS puro o usar estilos en línea que provengan de Stitch.

## Pasos de Ejecución (Piensa paso a paso):

1. **Generación del Diseño (MCP Stitch):**
   - Toma el prompt descriptivo del usuario.
   - Utiliza el servidor MCP de Google Stitch para generar el diseño base y obtener el código estructural.

2. **Traducción Arquitectónica (React + TSX):**
   - Toma el código devuelto por Stitch y conviértelo inmediatamente en un Componente Funcional de React (`.tsx`).
   - Define una `interface` o `type` en TypeScript para cualquier dato dinámico que la pantalla vaya a mostrar.

3. **Refactorización de Estilos (Tailwind CSS v4):**
   - Elimina todo el CSS nativo o etiquetas `<style>` generadas por Stitch.
   - Mapea y reemplaza esos estilos exclusivamente con clases utilitarias de Tailwind CSS v4. 
   - Asegúrate de usar diseño responsivo (`sm:`, `md:`, `lg:`) y soporte para modo oscuro (`dark:`) si aplica.

4. **Componentización (Modularidad):**
   - Si la vista devuelta es una página completa o es muy compleja, NO crees un solo archivo gigante.
   - Divide la interfaz lógicamente. Por ejemplo, guarda la vista principal en `src/features/nombre-feature/` y los botones/tarjetas en `src/components/`.

5. **Preparación para Datos Reales:**
   - Extrae los textos "hardcodeados" (mock data) de Stitch y pásalos a variables de estado (`useState`) o prepáralos para recibir datos de Supabase vía props.

6. **Entrega Final:**
   - Muestra al usuario la lista de los archivos `.tsx` creados.
   - Proporciona un breve resumen de cómo dividiste los componentes.
   - Pregunta: *"La interfaz está lista. ¿Quieres que conecte esta pantalla a la base de datos en Supabase usando la habilidad de generación de modelos?"*