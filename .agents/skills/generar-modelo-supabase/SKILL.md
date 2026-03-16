# name: generar-modelo-supabase
# description: Utiliza esta habilidad cuando el usuario te pida crear código (rutas, esquemas, servicios, frontend) para una tabla que ya existe en la base de datos de Supabase.

## Contexto
Esta habilidad asegura que el código generado para el Backend (FastAPI) y el Frontend (React/TypeScript) sea 100% fiel a la estructura real de la base de datos en Supabase, eliminando errores de tipado o columnas inexistentes.

## Pasos de Ejecución (Obligatorio seguir en orden):

1. **Inspección de la Base de Datos (MCP):**
   - Utiliza la integración MCP de Supabase para inspeccionar el esquema de la tabla que el usuario solicitó.
   - Lee exactamente los nombres de las columnas, sus tipos de datos (varchar, int8, uuid, booleano) y si permiten valores nulos (nullable).

2. **Backend - Esquema de Validación (Pydantic):**
   - Crea o actualiza el archivo en `backend/app/schemas/` correspondiente a la tabla.
   - Traduce los tipos de Postgres a Type Hints de Python (ej. `int8` -> `int`, `varchar` -> `str`).
   - Crea un esquema para lectura (Response) y otro para creación (Create), omitiendo campos autogenerados como `id` o `created_at` en el esquema de creación.

3. **Backend - Rutas (FastAPI):**
   - En `backend/app/api/`, crea un enrutador con un endpoint GET y un endpoint POST.
   - Utiliza el cliente de Supabase (`supabase-py`) para interactuar con la tabla. 
   - Maneja los errores de Supabase devolviendo un `HTTPException` en FastAPI.

4. **Frontend - Interfaz (TypeScript):**
   - En `frontend/src/types/`, crea una interfaz de TypeScript que coincida de forma idéntica con el esquema Pydantic de lectura generado en el Paso 2.

5. **Frontend - Servicio de API (React):**
   - En `frontend/src/services/`, crea un archivo que exporte funciones asíncronas para llamar a los endpoints de FastAPI (usando `fetch` o la herramienta configurada en el proyecto).

6. **Reflexión y Entrega:**
   - Muestra al usuario un resumen de los archivos creados y un ejemplo de la estructura de datos que descubriste en la base de datos a través del MCP.
   - Pregunta: *"¿Quieres que proceda a crear una vista o componente visual en React (ej. una tabla o formulario) para consumir este nuevo servicio?"*