# Decisiones técnicas

> Registro de decisiones (estilo *ADR* ligero) tomadas durante el desarrollo, con su razonamiento.
> Las superadas se conservan tachadas para dejar constancia de la evolución.

### D1 — Scripts con `defer` en `<head>`
**Decisión:** Los scripts se cargan con `defer` en `<head>` en lugar de al final del `<body>`.
**Razonamiento:** `defer` garantiza el orden de ejecución y que el DOM esté disponible, sin bloquear el renderizado. Equivalente a colocarlos al final del body, pero más explícito.

### D2 — Listeners centralizados en `DOMContentLoaded` (auth.js)
**Decisión:** Todos los event listeners se registran en un único bloque `DOMContentLoaded` en `auth.js`, en lugar de `onclick`/`oninput` inline en el HTML.
**Razonamiento:** Separación de responsabilidades (HTML = estructura, JS = comportamiento). Facilita el mantenimiento y evita la dispersión de lógica en el markup.

### ~~D3 — Sin framework JS (vanilla)~~ — SUPERADA por D11
**Decisión original:** Frontend público implementado en HTML + CSS + JS vanilla, sin Vue, React ni ningún framework.
**Razonamiento original:** El proyecto es un CMS piloto de demostración. La complejidad actual no justifica añadir una capa de framework.
**Estado:** Decisión superada en sesión 2026-05-26. Ver D11.

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

### D11 — Migración del frontend a Vue 3 + Vite (sesión 2026-05-26)
**Decisión:** Se migra el frontend-public de Vanilla JS a Vue 3 con Vite como bundler. La migración es progresiva: vista a vista, sin romper lo que funciona. La rama `vanilla` queda congelada como referencia.
**Razonamiento:** El proyecto crecerá como CMS y la complejidad futura (estado compartido, componentes reutilizables, routing declarativo) justifica el uso de un framework. Vue 3 se elige por su curva de aprendizaje gradual, su proximidad al HTML/CSS/JS vanilla que ya existe, y la calidad de su documentación oficial. Vite se elige como bundler por ser el estándar actual en proyectos Vue y por su velocidad de desarrollo.
**Impacto:** La decisión D3 queda superada. La rama `feature/vue-migration` puede mergearse a `development` tras pruebas del flujo completo (las cuatro vistas ya están en Vue).

### D12 — Migración híbrida progresiva (sesión 2026-05-26) — COMPLETADA
**Decisión:** Mantener un único `index.html` con los cuatro `<main class="page">` y migrar el interior de cada uno a Vue vista a vista.
**Estado (2026-05-29):** Completada. `index.html` pasó a shell mínimo `#app` y toda la UI vive en componentes Vue.

### D13 — Una instancia Vue por vista (sesión 2026-05-27)
**Decisión:** Cada `<main class="page">` tiene su `#app-*` y su `createApp()` en `main.js`, sin `App.vue` raíz ni Vue Router durante la migración.
**Razonamiento:** `goTo()` y `auth.js` operan sobre IDs del DOM; la delegación en `#page-*` evita depender del orden de montaje de Vue.
**Impacto:** Patrón usado para migrar sin romper. Queda reemplazado en sesión 2026-05-27 por `App.vue` + `router-view`.

### D14 — Frontend público: contenido 100 % Vue, lógica transitoria en JS (sesión 2026-05-29)
**Decisión:** Tras migrar `PageForgot.vue`, todo el markup de usuario vive en `src/views/`. Se mantienen `router.js`, `auth.js`, `password.js` y `ui.js` como capa imperativa global hasta sustituir los bloques MOCK por `fetch`.
**Razonamiento:** Separar la migración de UI (completada) de la integración API (pendiente). Reescribir auth de golpe habría mezclado dos riesgos. La delegación de eventos escala sin re-registrar listeners cuando Vue monta hijos.
**Impacto:** Decisión cerrada en sesión 2026-05-27. La capa transitoria JS se eliminó y pasó a composables.

### D15 — Arquitectura final de frontend público: Router + composables (sesión 2026-05-27)
**Decisión:** Adoptar `vue-router` y centralizar lógica en composables: `useAuth`, `usePassword`, `useToast`.
**Razonamiento:** Eliminar deuda de scripts globales, mejorar testabilidad, y preparar la integración con backend sin acoplar lógica al DOM.
**Impacto:** Eliminados `frontend-public/js/{router,auth,password,ui}.js`; navegación con `router.push`; estado de formularios, validaciones y mocks controlados desde composables.

### D16 — Frontend privado alineado al patrón Vue (sesión 2026-05-27)
**Decisión:** Migrar `frontend-private` a Vue 3 + Vite + Vue Router y composables, replicando la arquitectura del frontend público.
**Razonamiento:** Evitar mantener dos paradigmas distintos en el mismo repo (SPA moderna en público y monolito inline en privado), reducir deuda técnica y facilitar integración API posterior.
**Impacto:** `frontend-private/index.html` deja de ser monolito; CSS se divide en 4 capas; lógica se mueve a `useAuth`, `useUsers`, `useToast`; se añaden guards de token y rol basados en `sessionStorage`.

### D17 — Ruta /dev-login condicionada a entorno de desarrollo (sesión 2026-05-27)
**Decisión:** Añadir una ruta `/dev-login` en `frontend-private` que solo existe cuando `VITE_APP_ENV=development`, permitiendo simular sesiones de admin o user sin depender del frontend-public.
**Razonamiento:** sessionStorage no se comparte entre puertos distintos, lo que hace imposible probar el guard de token en desarrollo sin una puerta de entrada controlada. La condición por entorno garantiza que esta ruta no existe en producción.
**Impacto:** `DevLoginView.vue` escribe token y rol en sessionStorage y redirige a `/admin` o `/user`. El sidebar muestra un botón "Cambiar rol (dev)" para alternar sin escribir URLs manualmente.

---

### D18 — Mapear `MYSQL_*` a `DB_*` en docker-compose (sesión 2026-11-01)
**Decisión:** En lugar de cambiar `Database.php`, `docker-compose.yml` pasa al servicio `app` las variables `DB_HOST`, `DB_DATABASE`, `DB_USERNAME` y `DB_PASSWORD` a partir de las `MYSQL_*` del `.env`.
**Razonamiento:** Un único `.env` como fuente de verdad. La imagen de MySQL necesita los nombres `MYSQL_*`; el código PHP mantiene nombres genéricos (`DB_*`) que no lo atan a un motor concreto.

### D19 — Puertos fijos para los frontends (sesión 2026-11-01)
**Decisión:** Público en 5173 y privado en 5174, con `strictPort: true`. `VITE_PUBLIC_APP_URL` apunta a 5173.
**Razonamiento:** El privado redirige al público cuando no hay sesión; si los puertos cambian solos, la redirección apunta a un sitio equivocado (antes, al propio privado, en bucle). Con `strictPort` Vite falla de forma visible en vez de cambiar de puerto en silencio.
