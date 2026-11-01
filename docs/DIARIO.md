# Diario de desarrollo

> Registro histórico de las sesiones de trabajo, tal como se fue escribiendo durante el desarrollo
> (abril–mayo de 2026). Las rutas, ramas y pendientes reflejan el momento de cada sesión.
> **El estado actual del proyecto está en el [README](../README.md).**
> Las decisiones técnicas están en [DECISIONES.md](DECISIONES.md).

> Este documento se actualiza al final de cada bloque de trabajo.
> Al inicio de cada sesión, leer este archivo para retomar el contexto exacto.

---

## Estado del proyecto (actualizado: 2026-05-27 · tarde)

### Repositorio
`https://github.com/dredonse/piloto-cms`

### Ramas
- `main` — producción
- `development` — integración, aquí mergean las features
- `vanilla` — referencia congelada del frontend en Vanilla JS (nunca se mergea)
- `feature/vue-migration` — migración progresiva del frontend a Vue 3 + Vite

### Rama activa
`feature/vue-migration`

### Arquitectura frontend-public
- **Migración de lógica completada:** Vue Router + composables (`useAuth`, `usePassword`, `useToast`)
- Rutas: `/`, `/login`, `/register`, `/forgot`
- Estado y validación: centralizados en `useAuth` con `setFieldError()` y funciones `simulate*()` (MOCK)
- Medidor de contraseña: `usePassword::checkPwd()` en register y reset
- Toaster: reactivo en `useToast` + render en `App.vue`
- Dev: **Vite** (`cd frontend-public && npm install && npm run dev`)
- Modo MOCK activo (sin conexión al backend)

### Estado del frontend-private
- Migrado a Vue 3 + Vite + Vue Router (mismo patrón del frontend-public)
- CSS separado en 4 capas: `variables.css`, `layout.css`, `components.css`, `pages.css`
- Vistas: `AdminView` (dashboard + tabla + modal CRUD + stats) y `UserView` (perfil + cambio de contraseña)
- Composables: `useAuth` (sesión + logout), `useUsers` (CRUD MOCK), `useToast`
- Guards de rutas: sin token en `sessionStorage` redirige a `/frontend-public/`
- Guards de rol: `user` no accede a ruta admin y viceversa

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
[Logo Piloto CMS]         [Iniciar sesión]  [Crear cuenta]
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

## Trabajo completado en sesión 2026-05-26

### Paso 1 — Base Vue 3 + Vite y migración de `page-home`

**Objetivo:** Montar la estructura del proyecto Vue sin romper login/registro/forgot ni conectar al backend.

| Archivo | Cambio |
|---------|--------|
| `frontend-public/package.json` | Nuevo. Dependencias: `vue`, `vite`, `@vitejs/plugin-vue`. Scripts: `dev`, `build`, `preview`. |
| `frontend-public/vite.config.js` | Nuevo. Plugin Vue, `outDir: dist`, puerto dev 5173. |
| `frontend-public/src/main.js` | Monta la app en `#app` dentro de `#page-home`. |
| `frontend-public/src/App.vue` | Contenedor que renderiza `PageHome`. |
| `frontend-public/src/views/PageHome.vue` | Contenido de la landing (hero, stat, CTAs, feature cards) migrado desde el HTML. |
| `frontend-public/index.html` | `#page-home` solo contiene `<div id="app">`; añadido `<script type="module" src="/src/main.js">`. CSS importado desde `main.js` (mismos `css/*.css`). Vistas login/register/forgot intactas. |
| `frontend-public/vite.config.js` | `base: './'` y plugin que copia `js/` y `css/` a `dist/` en el build. |
| `frontend-public/js/auth.js` | CTAs del home: delegación de eventos en `#page-home` (los botones los crea Vue tras `DOMContentLoaded`). Mocks `simulate*` sin cambios. |

**Cómo arrancar el frontend público en desarrollo:**

```bash
cd frontend-public
npm install
npm run dev
```

Abre `http://localhost:5173`. Navegación entre vistas y flujos MOCK deben comportarse igual que en `vanilla` para home + auth.

**No tocado:** `backend/`, `sql/`, `docker/`, `frontend-private/`.

---

## Trabajo completado en sesión 2026-05-27 (refactor composables)

### Paso 2 — Migración de `page-login` a Vue

**Objetivo:** Mover el formulario de login a `PageLogin.vue` sin reimplementar mocks ni validación; `auth.js` sigue siendo la fuente de verdad.

| Archivo | Cambio |
|---------|--------|
| `frontend-public/src/views/PageLogin.vue` | Nuevo. Formulario email/contraseña, Google, alertas, enlaces a forgot/register. Mismos IDs que el HTML vanilla. |
| `frontend-public/src/main.js` | Segunda instancia `createApp(PageLogin)` en `#app-login`. Eliminado `App.vue` intermedio. |
| `frontend-public/index.html` | `#page-login` solo contiene `<div id="app-login">`. |
| `frontend-public/js/auth.js` | Login: delegación de `click` y `submit` en `#page-login` (formulario montado por Vue tras `DOMContentLoaded`). `simulateLogin()`, `validateLoginForm()` y `setFieldError()` sin cambios. |

**Comportamiento conservado:**
- Submit del formulario → `simulateLogin()` → `validateLoginForm()` → `setFieldError()` por campo
- Google → `simulateGoogle()`
- «¿Olvidaste tu contraseña?» → `goTo('forgot')`
- «Regístrate aquí» → `goTo('register')`
- `router.js::resetForms()` sigue reseteando `#login-btn` y `#login-error`

**No tocado:** `backend/`, `sql/`, `docker/`, `frontend-private/`, mocks `simulate*`.

---

## Trabajo completado en sesión 2026-05-28

### Paso 3 — Migración de `page-register` a Vue

**Objetivo:** Mover el formulario de registro (incl. estado de éxito) a `PageRegister.vue` sin reimplementar validación, medidor de contraseña ni mocks.

| Archivo | Cambio |
|---------|--------|
| `frontend-public/src/views/PageRegister.vue` | Nuevo. Formulario completo, medidor `pwd-strength`, checkbox términos, pantalla `reg-success`. Mismos IDs que el HTML vanilla. |
| `frontend-public/src/main.js` | Tercera instancia `createApp(PageRegister)` en `#app-register`. |
| `frontend-public/index.html` | `#page-register` solo contiene `<div id="app-register">`. |
| `frontend-public/js/auth.js` | Registro: delegación en `#page-register` — `focusout` (validación blur), `input` (`checkPwd` / confirmación), `click` (Google, enlaces login, `err-go-login` dinámico), `submit` → `simulateRegister()`. |

**Comportamiento conservado:**
- Blur en nombre/email/contraseña → `validateReg*()` → `setFieldError()`
- Input en `#reg-pwd` → `checkPwd()` (`password.js`)
- Input en confirmación → `validateRegPwdConfirm()`
- Submit → `simulateRegister()` (términos, email duplicado MOCK, éxito con `reg-success` y contador `stat-users`)
- Enlaces a login y Google MOCK sin cambios

**No tocado:** `backend/`, `sql/`, `docker/`, `frontend-private/`.

---

## Trabajo completado en sesión 2026-05-29

### Paso 4 — Migración de `page-forgot` a Vue (frontend público 100 % Vue)

**Objetivo:** Completar la migración de la SPA pública. El wizard de recuperación tiene **3 pasos** en el código (email → confirmación de envío → nueva contraseña); el token MOCK se muestra en el paso 2 como enlace de ejemplo.

| Archivo | Cambio |
|---------|--------|
| `frontend-public/src/views/PageForgot.vue` | Nuevo. Tres pasos con IDs `forgot-step1`…`3`, formularios, `reset-form`, enlace volver al login. |
| `frontend-public/src/main.js` | Cuarta instancia `createApp(PageForgot)` en `#app-forgot`. |
| `frontend-public/index.html` | Eliminado ~100 líneas de HTML de formularios; solo shell + `#app-forgot`. Comentarios de prototipo limpiados. |
| `frontend-public/js/auth.js` | Forgot: delegación en `#page-forgot` (`focusout`, `input`, `click`, `submit`). `simulateForgotStep1()`, `simulateForgotStep2()`, `simulateReset()` sin cambios. |

**Comportamiento conservado:**
- Paso 1 submit → `simulateForgotStep1()` + `validateForgotEmail()` / `setFieldError()`
- Paso 2 → `simulateForgotStep2()` + temporizador `resend-timer`
- Paso 3 → `validateNewPwd()` / `validateConfirmPwd()` en blur/input; submit → `simulateReset()`; `checkPwdReset()` en `#new-pwd` (las barras visuales `s1`–`s4` solo existen en registro — mismos IDs no duplicados en el DOM)
- «Volver al login» → `goTo('login')`
- `router.js::resetForms()` sigue reseteando los pasos del forgot

**No tocado:** `backend/`, `sql/`, `docker/`, `frontend-private/`.

---

## Trabajo completado en sesión 2026-05-27

### Paso 5 — Refactor de JS vanilla a Vue Router + composables

**Objetivo:** Sustituir `router.js`, `ui.js`, `password.js`, `auth.js` por arquitectura Vue nativa, manteniendo los mocks y sin tocar backend.

| Archivo | Cambio |
|---------|--------|
| `frontend-public/package.json` | Añadido `vue-router`. |
| `frontend-public/src/router/index.js` | Nuevas rutas: `/`, `/login`, `/register`, `/forgot`. |
| `frontend-public/src/main.js` | Un único `createApp(App).use(router)`. |
| `frontend-public/src/App.vue` | Nav global, `<router-view>`, wrapper `.page/.form-page` y toaster reactivo. |
| `frontend-public/src/composables/useToast.js` | Reemplaza `ui.js`: `toast()` reactivo con autocierre. |
| `frontend-public/src/composables/usePassword.js` | Reemplaza `password.js`: `checkPwd()` y `validatePassword()`. |
| `frontend-public/src/composables/useAuth.js` | Reemplaza `auth.js`: validaciones por campo, `simulate*()`, estado de login/register/forgot, reset UI por navegación. |
| `frontend-public/src/views/*.vue` | Home/Login/Register/Forgot conectadas a composables y `router.push()`. |
| `frontend-public/index.html` | Shell mínimo con solo `#app` y script módulo Vite. |
| `frontend-public/js/*` | Eliminados (`router.js`, `ui.js`, `password.js`, `auth.js`). |
| `frontend-public/vite.config.js` | Simplificado: sin plugin de copia de assets vanilla. |

**Riesgos detectados y mitigación:**
- `goTo()` hacía `resetForms()` implícito al navegar.  
  → Mitigado con `resetUiState()` en `useAuth`, disparado en cada cambio de ruta desde `App.vue`.
- Dependencia fuerte de IDs históricos en validación por campo.  
  → Se conservaron los IDs clave en inputs/errores/botones para compatibilidad y trazabilidad.

**No tocado:** `backend/`, `sql/`, `docker/`, `frontend-private/`.

---

## Trabajo completado en sesión 2026-05-27 (frontend-private Vue)

### Paso 6 — Refactor completo de `frontend-private` al patrón Vue

**Objetivo:** Migrar el monolito privado (HTML + CSS + JS inline) al mismo patrón arquitectónico del frontend público.

| Archivo | Cambio |
|---------|--------|
| `frontend-private/index.html` | Reemplazado por shell mínimo con `#app`. |
| `frontend-private/package.json` | Nuevo proyecto Vite con `vue` y `vue-router`. |
| `frontend-private/vite.config.js` | Configuración base Vite para entorno privado (puerto 5174). |
| `frontend-private/css/*.css` | Separación del CSS inline en 4 capas (`variables/layout/components/pages`). |
| `frontend-private/src/main.js` | Entrada única de app con router. |
| `frontend-private/src/App.vue` | Layout global (sidebar, topbar, toaster, role switcher de prototipo). |
| `frontend-private/src/views/AdminView.vue` | Dashboard admin + tabla de usuarios + CRUD en modal + métricas. |
| `frontend-private/src/views/UserView.vue` | Perfil de usuario + cambio de contraseña. |
| `frontend-private/src/composables/useAuth.js` | Estado de sesión, logout, cambio de contraseña y mock role switch. |
| `frontend-private/src/composables/useUsers.js` | CRUD de usuarios y filtros con bloques `// --- MOCK ---`. |
| `frontend-private/src/composables/useToast.js` | Toaster reactivo (mismo patrón que público). |
| `frontend-private/src/router/index.js` | Rutas y guards: token + rol. |
| `frontend-private/js/*` | Eliminados al dejar de usar JS inline/global. |

**Guards implementados:**
- Sin `sessionStorage.token` → redirección a `PUBLIC_APP_URL` (configurable por entorno, fallback `http://localhost:5174`).
- Si rol es `user`, no entra a `/admin` (y viceversa).

**Notas de mocks:**
- Todas las operaciones de datos (`saveUser`, `confirmDelete`, `changePassword`, cambios de sesión) están marcadas con `// --- MOCK ---` para reemplazo posterior por `fetch`.

**No tocado:** `backend/`, `sql/`, `docker/`, `frontend-public/`.

---

## Fixes aplicados en sesión 2026-05-27 (frontend-private)

### Fix 1 — Token hardcodeado en sessionStorage
**Problema:** El guard no redirigía porque `useAuth.js` tenía una función `syncSessionStorage()` que escribía un token mock en sessionStorage al arrancar.
**Solución:** Eliminada `syncSessionStorage()` y cualquier `sessionStorage.setItem` del código del private. El private solo lee y borra sesión, nunca la crea.

### Fix 2 — Redirección a ruta relativa en el guard
**Problema:** El guard redirigía a `/frontend-public/` como ruta relativa, que no existe en el servidor de Vite del private.
**Solución:** Añadido `frontend-private/src/config/env.js` con `PUBLIC_APP_URL` que lee `VITE_PUBLIC_APP_URL` del `.env` con fallback a `http://localhost:5174`. Guard y logout usan esta variable.

**Ficheros modificados:**

| Archivo | Cambio |
|---------|--------|
| `frontend-private/src/config/env.js` | Nuevo. Expone `PUBLIC_APP_URL` e `IS_DEVELOPMENT`. |
| `frontend-private/src/router/index.js` | Guard usa `PUBLIC_APP_URL` en lugar de ruta relativa. |
| `frontend-private/src/composables/useAuth.js` | Logout usa `PUBLIC_APP_URL` para consistencia. |
| `frontend-private/.env.example` | Añadidas `VITE_PUBLIC_APP_URL` y `VITE_APP_ENV`. |
| `frontend-private/.env` | Crear localmente (no en git): `VITE_APP_ENV=development`, `VITE_PUBLIC_APP_URL=http://localhost:5174`. |

### Fix 3 — Ruta /dev-login para pruebas en desarrollo
**Problema:** Imposible probar el private en desarrollo porque sessionStorage no se comparte entre puertos distintos y el guard redirige antes de poder escribir el token.
**Solución:** Ruta `/dev-login` con `DevLoginView.vue` que permite entrar como admin o user con un clic. Solo existe cuando `VITE_APP_ENV=development`. Botón "Cambiar rol (dev)" visible en el sidebar durante desarrollo.

**Ficheros modificados:**

| Archivo | Cambio |
|---------|--------|
| `frontend-private/src/views/DevLoginView.vue` | Nuevo. Botones admin/user, limpia sessionStorage antes de escribir nuevo rol. |
| `frontend-private/src/App.vue` | Botón "Cambiar rol (dev)" en sidebar, visible solo en `IS_DEVELOPMENT`. |
| `frontend-private/src/router/index.js` | Ruta `/dev-login` registrada solo si `IS_DEVELOPMENT`. |

---

## Próximos pasos pendientes

- [x] Migración completa de `frontend-public` a Vue 3 + Vite + Vue Router + composables
- [x] Merge de `feature/vue-migration` a `development`
- [x] Migración completa de `frontend-private` a Vue 3 + Vite + Vue Router + composables
- [ ] PR de `feature/private-vue` a `development`
- [ ] Conectar `frontend-public` al backend real (sustituir bloques MOCK por fetch)
  - [ ] `simulateLogin()` → `POST /api/auth/login`
  - [ ] `simulateRegister()` → `POST /api/auth/register`
  - [ ] `simulateForgotStep1()` → `POST /api/auth/forgot-password`
  - [ ] `simulateReset()` → `POST /api/auth/reset-password`
  - [ ] `simulateGoogle()` → flujo OAuth real
  - [ ] Cargar contador real en home → `GET /api/stats/users-count`
- [ ] Ejecutar `npm install` en `frontend-private/` y correr smoke tests manuales (guards + CRUD + perfil)
- [ ] Conectar `frontend-private` a la API (dashboard admin, perfil usuario)
- [ ] Verificar responsive en móvil tras eliminar nav-tabs

---

---

## Sesión 2026-11-01 — Limpieza para portfolio

| Archivo | Cambio |
|---------|--------|
| `.gitignore` | Añadidos `.vite/` y `dist/`. Retirados del repo los `.DS_Store`, `.idea/` y la caché `.vite/deps`. |
| `docker-compose.yml`, `.env.example` | Mapeo `MYSQL_*` → `DB_*` para PHP (D18). `.env.example` con valores de ejemplo. |
| `frontend-*/vite.config.js`, `frontend-private/src/config/env.js`, `frontend-private/.env.example` | Puertos fijos 5173/5174 y `PUBLIC_APP_URL` → 5173 (D19). |
| `frontend-private` (`useUsers.js`, `AdminView.vue`) | Campo de contraseña en el alta de usuarios; eliminada la contraseña por defecto `temp123`. |
| `README.md`, `docs/` | README reescrito para presentar el proyecto; este diario y las decisiones pasan a `docs/`. |

---

## Metodología: desarrollo asistido por IA

Durante el desarrollo, este diario funcionaba también como **contexto para el asistente de IA** (Cursor):
al empezar cada sesión se le pedía leerlo y se acotaba la tarea, y al terminar se actualizaba con los
cambios por fichero, los pendientes y las decisiones nuevas con su razonamiento.

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
