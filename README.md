# piloto-cms — Sistema de gestión de usuarios con control de acceso

## Objetivo

Aplicación web dockerizada en entorno LAMP que gestiona usuarios con distintos niveles de acceso: autenticación tradicional, login con Google y recuperación de contraseña. Base para un futuro CMS con arquitectura modular preparada para crecer.

---

## Alcance funcional

### Frontend público (HTML, CSS, JS vanilla)

Accesible sin login.

Funcionalidades:

- Registro de usuarios
- Inicio de sesión
- Login con Google
- Recuperación de contraseña
- Visualización del número total de usuarios registrados

---

### Frontend privado (HTML, CSS, JS vanilla)

Accesible tras autenticación. El contenido se adapta según el tipo de usuario.

#### Administrador

- Acceso a dashboard
- Gestión de usuarios (crear, editar, eliminar)
- Visualización del total de usuarios

#### Usuario estándar

- Acceso a su perfil
- Cambio de contraseña

---

## Arquitectura

### Backend

- PHP con framework propio
- Estructura basada en MVC
- Separación en controladores, servicios y acceso a datos
- API REST interna

### Control de acceso

- Sistema de roles: `admin` / `user`
- Middleware para autenticación y permisos

### Frontend

- Separación en `frontend-public` y `frontend-private`
- Consumo de API REST

---

## Infraestructura

Aplicación dockerizada con Apache + PHP y MySQL. Permite despliegue sencillo y entorno reproducible.

---

## Estructura del repositorio

```
piloto-cms/
├── backend/                        ← API REST en PHP (MVC propio, sin frameworks externos)
│   ├── public/index.php            ← Punto de entrada, registra todas las rutas
│   ├── config/bootstrap.php        ← Autoloader de clases
│   └── src/
│       ├── Core/                   ← Router, Database, Request, Response, Cors
│       ├── Controllers/            ← AuthController, UsersController, StatsController, HealthController
│       ├── Services/               ← AuthService, GoogleIdTokenVerifier
│       ├── Repositories/           ← UserRepository, SessionRepository, PasswordResetRepository
│       └── Middleware/             ← AuthGuard (protege rutas por token y rol)
├── frontend-public/                ← SPA pública (HTML + CSS + JS vanilla)
│   ├── index.html                  ← Entrada única, 4 vistas en una página
│   ├── css/
│   │   ├── variables.css           ← Design tokens (colores, tipografía, radios)
│   │   ├── layout.css              ← Body, nav, sistema de páginas (.page / .page.active)
│   │   ├── components.css          ← Botones, inputs, alertas, toaster, form-card
│   │   └── pages.css               ← Estilos específicos: home, forgot, stat-inline
│   └── js/
│       ├── ui.js                   ← toast(), delay() — utilidades globales
│       ├── router.js               ← goTo(page), resetForms() — SPA routing
│       ├── password.js             ← checkPwd(), validatePassword() — medidor de fortaleza
│       └── auth.js                 ← Flujos de autenticación + listeners centralizados en DOMContentLoaded
├── frontend-private/               ← Dashboard privado (pendiente de refactorizar)
│   └── index.html                  ← HTML + CSS + JS inline (monolito, funcional como prototipo)
├── design-system/                  ← Tokens y componentes CSS compartidos entre frontends
│   └── css/
│       ├── tokens.css
│       ├── base.css
│       └── components.css
├── docker/
│   └── apache/
│       ├── Dockerfile
│       └── vhost.conf
├── sql/
│   ├── init.sql                    ← Tablas + seed de usuario admin
│   └── migrations/
│       └── 001_user_sessions.sql
├── docker-compose.yml
└── README.md                       ← Este archivo. Actualizar al final de cada sesión.
```

---

## Modelo de datos

### Tabla `users`
`id` · `nombre` · `email` · `password` (hash bcrypt) · `google_id` · `rol` (admin/user) · `created_at`

### Tabla `user_sessions`
`id` · `user_id` · `token_hash` · `expires_at` · `created_at`
> El token viaja en claro al cliente; en BD se guarda su hash SHA-256. TTL: 7 días.

### Tabla `password_resets`
`email` · `token` · `expires_at`

---

## Autenticación

- Login tradicional (email y contraseña)
- Login con Google (verificación de Google ID token)
- Recuperación de contraseña mediante token con expiración

---

## API — Endpoints disponibles

### Públicos (sin autenticación)

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/register` | Registrar usuario nuevo |
| POST | `/api/auth/login` | Iniciar sesión |
| POST | `/api/auth/google` | Login con Google |
| POST | `/api/auth/forgot-password` | Solicitar recuperación de contraseña |
| POST | `/api/auth/reset-password` | Completar recuperación con token |
| GET  | `/api/stats/users-count` | Total de usuarios registrados |
| GET  | `/api/health` | Estado de la API |

### Autenticados (requieren `Authorization: Bearer <token>`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/me` | Datos del usuario en sesión |
| PUT | `/api/me/password` | Cambiar contraseña propia |

### Solo admin

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET    | `/api/users` | Listar todos los usuarios |
| POST   | `/api/users` | Crear usuario |
| PUT    | `/api/users/{id}` | Editar usuario |
| DELETE | `/api/users/{id}` | Eliminar usuario |

---

## Cómo levantar el proyecto

### 1. Backend (Docker)

```bash
cd piloto-cms
docker compose up --build
```

Espera a ver `ready for connections` en los logs. La API queda en `http://localhost:8080`.

Verificar que funciona:
```
http://localhost:8080/api/health   → { "status": "ok" }
```

### 2. Frontend (servidor estático)

Desde la raíz del proyecto, en una nueva terminal:

```bash
# Con Python
python3 -m http.server 3000

# Con Node
npx serve . -p 3000
```

Abrir en el navegador:
- `http://localhost:3000/frontend-public/index.html` → zona pública
- `http://localhost:3000/frontend-private/index.html` → zona privada

> Los frontends usan rutas absolutas que requieren servirse desde la raíz del proyecto. No abrir como archivo directamente (doble clic) o los CSS y JS no cargarán.

### Credenciales de prueba

```
Email:      admin@piloto.local
Contraseña: PilotoAdmin1!
Rol:        admin
```

---

## Escenario de demostración

- Un usuario se registra desde el frontend público
- El contador de usuarios se actualiza
- Se inicia sesión y accede a la zona privada
- Según su rol:
  - usuario normal → acceso a su perfil y cambio de contraseña
  - admin → acceso a gestión completa de usuarios
- El administrador crea un nuevo usuario
- Se prueba el login con Google
- Se prueba la recuperación de contraseña

---

# Registro de trabajo y contexto de sesión

> Este documento se actualiza al final de cada bloque de trabajo.
> Al inicio de cada sesión, leer este archivo para retomar el contexto exacto.

---

## Estado del proyecto (actualizado: 2026-05-10)

### Repositorio
`https://github.com/dredonse/piloto-cms`

### Ramas
- `main` — producción
- `development` — integración (rama activa, aquí mergean las features)

### Rama activa
`development`

### Arquitectura frontend-public
- SPA de página única: 4 `<main class="page">` — `page-home`, `page-login`, `page-register`, `page-forgot`
- Routing manejado por `router.js::goTo()` mediante eventos JS
- Scripts cargados con `defer` en `<head>`; todos los listeners en `DOMContentLoaded` en `auth.js`
- Sin framework (HTML + CSS + JS vanilla)
- Modo MOCK activo: las llamadas a API están simuladas con `delay()`, marcadas con comentarios `// --- MOCK ---`

### Estado del frontend-private
- Archivo único monolítico: HTML + CSS inline + JS inline
- Funcional como prototipo: rol-switcher (admin/user), tabla de usuarios, modal CRUD, mini-chart
- Aún usa `onclick` inline en el HTML (pendiente de refactorizar igual que public)

### Estado del backend
- 100% funcional: autenticación completa, roles, CRUD usuarios, tokens de sesión con hash, recuperación de contraseña, Google OAuth
- Dockerizado con Apache + PHP 8.3 + MySQL
- Levantable con un único comando: `docker compose up --build`

---

## Trabajo completado (sesiones anteriores)

### Sesión anterior (antes de 2026-04-28)
- Añadidos IDs a todos los elementos interactivos del HTML público
- Eliminados todos los `onclick`/`oninput` inline del HTML
- Creados listeners centralizados en `auth.js::DOMContentLoaded`
- Añadidos `<form>` con `novalidate` para capturar Enter
- Añadido campo de confirmación de contraseña en registro
- Añadidos `<span class="field-error">` para errores inline por campo
- Implementada validación por campo con `setFieldError()` y `validateXxx()` reutilizables
- Añadido indicador visual de fortaleza de contraseña (barras + reglas)

---

## Trabajo completado en sesión 2026-04-28

### Simplificación UX del frontend público

**Problema:** El botón Login/Registro aparecía en 3 lugares: nav-tabs (centro), nav-pills (derecha) y hero de home.

**Cambios realizados:**

| Archivo | Cambio |
|---------|--------|
| `frontend-public/index.html` | Eliminado el `<div>` con los 4 nav-tabs (Inicio · Login · Registro · Recuperar). Nav pills renombrados: "Iniciar sesión" (ghost) y "Crear cuenta" (solid). |
| `frontend-public/js/auth.js` | Eliminados listeners de tab-home/login/register/forgot. Corregido bug `email` no definido en `simulateRegister()`. Eliminada referencia `nav-count` inexistente. Eliminado código comentado muerto. |
| `frontend-public/js/router.js` | Eliminado selector `.nav-tab` ya que no hay tabs en el DOM. |
| `frontend-public/css/layout.css` | Eliminados estilos `.nav-tab`, `.nav-tab:hover`, `.nav-tab.active`. Eliminada regla responsive `.nav-tab { display:none }`. |

**Resultado del nav:**
```
[Logo Piloto CMS]              [Iniciar sesión]  [Crear cuenta]
                               (ghost pill)      (solid accent)
```

---

### Rediseño hero home — stats strip (sesión 2026-04-28)

**Problema:** `stats-strip` era una card de 680px de ancho con un solo número — mucho contenedor, poco contenido.

**Cambios realizados:**

| Archivo | Cambio |
|---------|--------|
| `index.html` | Eliminada `stats-strip`. Añadido `.stat-inline` (dot + número + label) entre el subtítulo y los CTA buttons. El `id="stat-users"` se conserva para que `auth.js` siga actualizando el contador. |
| `pages.css` | Eliminados `.stats-strip`, `.stat-item`, `.stat-num`, `.stat-label`. Añadidos `.stat-inline`, `.stat-dot`, `.stat-inline-num`, `@keyframes live-pulse`. Reducido `margin-bottom` de `.home-actions` de 80px → 60px. Reducido `margin-bottom` de `.home-subtitle` de 36px → 24px. Añadido hover accent en `.feature-card` (`border-top: 2px solid transparent → var(--accent)`). Limpiada responsive de stats. |

---

## Trabajo completado en sesión 2026-05-10

### Integración del backend en el repositorio

**Contexto:** El proyecto existía en dos repositorios separados: uno con solo el frontend avanzado (`Piloto-CMS_frontend`) y otro con el proyecto completo generado por Cursor (`Piloto-CMS_completo`). Se decide crear un repo nuevo `piloto-cms` uniendo lo mejor de los dos.

**Criterio de selección:**
- Frontend: se usa `Piloto-CMS_frontend` porque tiene mejor arquitectura (CSS en 4 capas, JS por responsabilidad, validación por campo, mocks explícitos, sin onclick inline)
- Backend: se usa `Piloto-CMS_completo` porque está 100% funcional y completo
- Design system y Docker: de `Piloto-CMS_completo`

**Cambios realizados:**
- Creado repo nuevo `piloto-cms` con la estructura unificada
- Copiado `frontend-public/` de `Piloto-CMS_frontend`
- Copiado `frontend-private/` de `Piloto-CMS_frontend`
- Copiado `backend/`, `design-system/`, `docker/`, `sql/`, `docker-compose.yml` de `Piloto-CMS_completo`
- Actualizado README con contexto completo de ambos proyectos

### Configuración del repositorio git (sesión 2026-05-10)

**Cambios realizados:**

| Archivo | Cambio |
|---------|--------|
| `.gitignore` | Creado. Excluye: `.env`, `Documentacion/`, `docker/data/`, `docker/mysql/`, `vendor/`, `node_modules/`, ficheros de sistema (`.DS_Store`, `Thumbs.db`), ficheros de editor (`.vscode/`, `.idea/`), logs. |
| `.env.example` | Creado. Documenta las variables de entorno necesarias sin valores reales: `MYSQL_ROOT_PASSWORD`, `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_HOST`, `APP_ENV`, `GOOGLE_CLIENT_ID`. |

**Git:**
- Repo inicializado y subido a `https://github.com/dredonse/piloto-cms`
- Rama `main` — commit inicial con toda la estructura
- Rama `development` creada y publicada en remoto

---

## Próximos pasos pendientes

- [ ] Conectar `frontend-public` al backend real (sustituir bloques MOCK por fetch)
  - [ ] `simulateLogin()` → `POST /api/auth/login`
  - [ ] `simulateRegister()` → `POST /api/auth/register`
  - [ ] `simulateForgotStep1()` → `POST /api/auth/forgot-password`
  - [ ] `simulateReset()` → `POST /api/auth/reset-password`
  - [ ] `simulateGoogle()` → flujo OAuth real
  - [ ] Cargar contador real en home → `GET /api/stats/users-count`
- [ ] Refactorizar `frontend-private`: sacar CSS e JS inline a ficheros propios
- [ ] Conectar `frontend-private` a la API (dashboard admin, perfil usuario)
- [ ] Verificar responsive en móvil tras eliminar nav-tabs

---

## Decisiones tomadas

### D1 — Scripts con `defer` en `<head>`
**Decisión:** Los scripts se cargan con `defer` en `<head>` en lugar de al final del `<body>`.
**Razonamiento:** `defer` garantiza el orden de ejecución y que el DOM esté disponible, sin bloquear el renderizado. Equivalente a colocarlos al final del body, pero más explícito.

### D2 — Listeners centralizados en `DOMContentLoaded` (auth.js)
**Decisión:** Todos los event listeners se registran en un único bloque `DOMContentLoaded` en `auth.js`, en lugar de `onclick`/`oninput` inline en el HTML.
**Razonamiento:** Separación de responsabilidades (HTML = estructura, JS = comportamiento). Facilita el mantenimiento y evita la dispersión de lógica en el markup.

### D3 — Sin framework JS (vanilla)
**Decisión:** Frontend público implementado en HTML + CSS + JS vanilla, sin Vue, React ni ningún framework.
**Razonamiento:** El proyecto es un CMS piloto de demostración. La complejidad actual no justifica añadir una capa de framework. El README menciona "HTML, CSS, JS, VUE..." como opciones, se elige la más simple para el MVP.

### D4 — Modo MOCK explícito en auth.js
**Decisión:** Las llamadas a la API están comentadas y marcadas con `// --- MOCK ---`. Las funciones `simulate*()` replican el comportamiento esperado con `delay()`.
**Razonamiento:** Permite desarrollar y testear el frontend antes de que el backend esté disponible. La sustitución es quirúrgica: basta con reemplazar el bloque MOCK por un `fetch()` real.

### D5 — Eliminar nav-tabs del frontend público (sesión 2026-04-28)
**Decisión:** Se eliminan los nav-tabs del centro (Inicio | Login | Registro | Recuperar) del nav público. Se mantienen únicamente los dos nav-pills de la derecha y el logo.
**Razonamiento:** Los tabs eran un artefacto de prototipo para navegar entre vistas durante el desarrollo. En un producto real, el usuario no necesita un tab "Recuperar" en la barra de navegación principal — esa vista solo se accede desde el link "¿Olvidaste tu contraseña?" dentro del login. Eliminarlos reduce la carga cognitiva y alinea la UI con el estilo minimalista del proyecto. Los listeners de los tabs se eliminan también de auth.js.

### D6 — Hero home conserva sus dos CTAs (sesión 2026-04-28)
**Decisión:** Los botones "Crear cuenta gratuita" y "Iniciar sesión →" del hero de home se mantienen.
**Razonamiento:** No son redundantes con los nav-pills aunque apunten a la misma acción. Los nav-pills son persistentes y discretos (utilidad); los botones del hero son el CTA principal de la landing page (conversión). Esta es una práctica estándar en productos SaaS.

### D7 — Stat de usuarios como elemento inline en el hero, no como card (sesión 2026-04-28)
**Decisión:** El contador de usuarios registrados se muestra como una línea inline (dot animado + número + label) integrada en el hero, antes de los CTA buttons. Se elimina la `stats-strip` card.
**Razonamiento:** La card estaba diseñada para múltiples métricas pero solo contenía una — mucho contenedor vacío. El elemento inline sigue el patrón de "social proof" habitual en productos SaaS (lineal, sin ruido visual), reduce el scroll total de la página y encaja mejor con el estilo minimalista. El dot verde pulsante refuerza la sensación de plataforma viva sin añadir complejidad.

### D8 — Token de sesión hasheado en BD (sesión 2026-05-10)
**Decisión:** El backend nunca guarda el token en claro en `user_sessions`, sino su hash SHA-256.
**Razonamiento:** Si alguien obtiene acceso a la tabla, los tokens no sirven de nada. El token real solo viaja entre el servidor (en la respuesta de login) y el navegador (en sessionStorage). Cada petición envía el token en claro, el backend lo hashea y compara.

### D9 — Repo unificado desde dos proyectos separados (sesión 2026-05-10)
**Decisión:** Se crea un repo nuevo `piloto-cms` combinando el frontend de `Piloto-CMS_frontend` y el backend de `Piloto-CMS_completo`, en lugar de modificar cualquiera de los dos existentes.
**Razonamiento:** El frontend avanzado tiene mejor arquitectura pero sin backend. El proyecto completo tiene backend funcional pero frontend básico. Unirlos en un repo limpio desde el principio evita deuda técnica y conflictos de historial git.

### D10 — Documentacion/ ignorada en git pero conservada en local (sesión 2026-05-10)
**Decisión:** La carpeta `Documentacion/` se añade al `.gitignore` y no se sube al repositorio remoto.
**Razonamiento:** Contiene capturas de pantalla, PDFs y documentos de trabajo de sesiones anteriores que no aportan valor a quien clona el repo y engordan el historial git innecesariamente. Se conserva en local como material de estudio y referencia personal.

---

## Cómo usar este README con Cursor

Al inicio de cada sesión, el primer mensaje a Cursor es:

```
Lee el README.md. Es el contexto completo del proyecto.
La tarea de hoy es: [descripción concreta de la tarea].
No toques nada fuera del alcance de esa tarea.
```

Al terminar cada sesión, actualizar:
- La fecha en "Estado del proyecto"
- La rama activa si ha cambiado
- El bloque "Trabajo completado" con la nueva sesión y el detalle de cada cambio por archivo
- La lista de pendientes (marcar completados, añadir nuevos si aparecen)
- Las decisiones tomadas si se tomó alguna nueva, con su razonamiento completo
