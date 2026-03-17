### 📂 `generar-archivos-sistema`
* **Para qué sirve:** Permite al Agente crear la estructura física de archivos y carpetas del proyecto, incluyendo Dockerfiles, configuraciones de entorno y manifiestos de despliegue.
* **Cómo actúa el Agente:** 1. Identifica la ruta de destino (ej: `/backend/Dockerfile`).
  2. Genera el contenido íntegro del archivo siguiendo las mejores prácticas de seguridad y ligereza.
  3. Utiliza comandos de sistema o herramientas de entorno para "escribir" el archivo en el volumen de trabajo.
  4. Verifica que las extensiones y permisos sean correctos (ej: archivos `.sh` ejecutables).