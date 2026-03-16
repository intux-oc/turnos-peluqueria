# name: generar-entidad
# description: Utiliza esta habilidad cuando el usuario pida crear una nueva entidad, modelo o funcionalidad completa (Full-Stack) en el proyecto.

## Contexto
Esta habilidad automatiza la creación de código repetitivo tanto para el Backend (Python/FastAPI) como para el Frontend (React) garantizando que los tipos y rutas coincidan.

## Pasos de Ejecución (Síguelos estrictamente en orden):

1. **Analizar la Entidad:**
   - Pregunta al usuario qué campos (columnas) debe tener la nueva entidad si no te lo ha especificado.
   - Detente y espera la respuesta del usuario antes de continuar.

2. **Backend - Crear Modelo y Esquema (Python):**
   - Crea el modelo de base de datos SQLAlchemy en `backend/app/models/`.
   - Crea el esquema de validación Pydantic en `backend/app/schemas/`. Asegúrate de usar Type Hints de Python estrictos.

3. **Backend - Crear Rutas (FastAPI):**
   - Crea un enrutador (APIRouter) en `backend/app/api/` con los métodos CRUD básicos (GET, POST, PUT, DELETE) para la entidad.
   - Devuelve las respuestas utilizando los esquemas de Pydantic.

4. **Frontend - Crear Tipos y Servicio (React/TypeScript):**
   - Crea la interfaz de TypeScript en `frontend/src/types/` que coincida EXACTAMENTE con el esquema Pydantic creado en el paso 2.
   - Crea un archivo en `frontend/src/services/` con funciones asíncronas para llamar a las rutas de la API del paso 3.

5. **Resumen Final:**
   - Muestra al usuario un listado con viñetas de todos los archivos creados.
   - No hagas commit del código. Pregúntale al usuario: "¿Quieres que proceda a crear los componentes visuales en React para esta entidad?"