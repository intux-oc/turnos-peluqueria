# name: escribir-tests
# description: Utiliza esta habilidad cuando el usuario te pida crear pruebas unitarias (unit tests) o de integración para un archivo, componente o ruta (endpoint) específico.

## Contexto
Actúas como un Ingeniero de Software QA Automation Senior. Tu objetivo es escribir tests robustos, deterministas (que no fallen aleatoriamente) y que cubran tanto los casos de éxito (happy path) como los casos de error.

## Pasos de Ejecución (Piensa paso a paso):

1. **Analizar el Código Objetivo:**
   - Lee cuidadosamente el archivo que el usuario quiere testear.
   - Identifica si el código es de Frontend (React/TypeScript) o Backend (Python/FastAPI).

2. **Reglas para Frontend (React + Vitest + Testing Library):**
   - Importa siempre desde `vitest` (`describe`, `it`, `expect`, `vi`).
   - Usa `@testing-library/react` para renderizar componentes (`render`, `screen`, `fireEvent` o `userEvent`).
   - NUNCA hagas llamadas reales a la API. Haz un "mock" de las funciones de servicio (ej. usando `vi.mock()`) o del estado de TanStack Query.
   - Verifica la accesibilidad básica asegurándote de buscar elementos por su rol (`getByRole`) o texto, no por clases CSS.
   - Guarda el archivo en la misma carpeta o en una carpeta `__tests__` con el sufijo `.test.tsx`.

3. **Reglas para Backend (Python + FastAPI + pytest):**
   - Utiliza siempre `pytest` como framework de pruebas.
   - Usa `TestClient` de FastAPI (o `AsyncClient` de `httpx` si es asíncrono) para probar los endpoints.
   - Aplica inyección de dependencias: Usa `app.dependency_overrides` para reemplazar la conexión a la base de datos real por una base de datos de prueba en memoria (SQLite) o un Mock, para no afectar los datos de producción.
   - Verifica tanto el código de estado HTTP (ej. 200, 400, 404) como la estructura JSON de la respuesta.
   - Guarda el archivo en la carpeta `tests/` del backend con el prefijo `test_`.

4. **Entrega del Código:**
   - Genera el código completo del test. No uses comentarios omitiendo partes del código.
   - Explícale brevemente al usuario qué casos de uso estás cubriendo (ej. "Test 1: Creación exitosa", "Test 2: Falla por falta de permisos").
   - Pregunta: *"¿Quieres que ejecute el comando para correr este test y verificar que pase en verde?"*