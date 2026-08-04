DB Hosting - Frontend Landing
Plataforma de aprovisionamiento automático de bases de datos SQL Server gratuitas para desarrolladores y estudiantes.

🚀 Stack Tecnológico
Framework: Next.js 16 (App Router, Turbopack)
Lenguaje: TypeScript 5 (Strict Mode)
Estilos: Tailwind CSS v4 (Design Tokens, Modo oscuro automático)
UI: Componentes propios (sin librerías externas de UI)
Despliegue: Docker (standalone) + GitHub Actions + Caddy (Reverse Proxy)
📦 Estructura del Proyecto
Este es un monorepo gestionado con npm workspaces.

apps/landing: Aplicación principal de Next.js.
🛠️ Comandos de Desarrollo
# Instalar dependenciasnpm install# Levantar el servidor de desarrollo (Puerto 3000)npm run dev# Construir para producciónnpm run build
🔐 Variables de Entorno
Copia .env.example a .env y configura:

NEXT_PUBLIC_CELL_NAME: Nombre de la célula (ej. mbro).
NEXT_PUBLIC_API_URL: URL del backend (ej. https://api.mbro.andrescortes.dev).
🏗️ Arquitectura
Este frontend consume una API externa que implementa una arquitectura "Database-Centric", donde toda la lógica de negocio reside en la base de datos mediante Stored Procedures.