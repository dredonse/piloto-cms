Perfecto, ya tengo todo el código leído. Es un proyecto bien estructurado, no especialmente difícil, pero con varias capas. Te lo explico de abajo arriba.

------

## Qué es y qué tiene

El proyecto es una aplicación web en cuatro bloques bien separados que se comunican entre sí. Antes de entrar en el código, el mapa mental es este:

**El usuario abre un navegador → habla con el frontend → el frontend llama a la API → la API consulta la base de datos.**

Nada más. Todo lo demás son variaciones de ese flujo.

------

## Las cuatro partes y qué hace cada una

### 1. La infraestructura (`docker/`, `docker-compose.yml`)

Es el "recinto" donde vive todo. Docker levanta dos contenedores: uno con Apache + PHP (el servidor web) y otro con MySQL (la base de datos). Cuando haces `docker compose up`, arranca todo junto automáticamente.

El fichero `.env` guarda las contraseñas y configuraciones (host de la BD, credenciales, la clave de Google OAuth...). Nunca va al repositorio en producción.

### 2. La base de datos (`sql/`)

Tres tablas solamente:

`users` — un registro por persona. Guarda nombre, email, la contraseña hasheada (nunca en texto plano), el `google_id` si entró por Google, y el rol (admin o user).

`user_sessions` — cuando alguien hace login, se crea aquí un token. Cada petición autenticada lleva ese token en la cabecera; el backend lo busca aquí para saber quién eres. Los tokens tienen fecha de expiración.

````
Cuando haces login, el servidor te da un "pase" único, que es el token. A partir de ese momento, cada vez que el frontend pide algo a la API (ver tu perfil, listar usuarios, cambiar contraseña...) incluye ese pase en la cabecera de la petición:

```
Authorization: Bearer abc123xyz...
```

El backend recibe eso, busca ese token en la tabla `user_sessions`, y si existe y no ha caducado, sabe que eres tú y te deja pasar. Si no existe o caducó, te devuelve un error 401 y tienes que volver a hacer login.

Es como el brazalete de una discoteca: te lo dan en la puerta al entrar (login), lo llevas en la muñeca toda la noche (sessionStorage del navegador), y en cada sala te lo comprueban antes de dejarte entrar (AuthGuard). A medianoche caduca y ya no vale (TTL de 7 días en este proyecto).

La tabla `user_sessions` es simplemente la lista de todos los brazaletes activos en cada momento. Cuando cambias la contraseña, el servidor borra todos los tuyos de esa tabla, obligándote a volver a hacer login, que es exactamente lo que hace este proyecto en `SessionRepository::revokeAllForUser()`.
````

`password_resets` — cuando alguien pide recuperar contraseña, se guarda aquí un token temporal con fecha de caducidad. Al usarlo, se borra.

### 3. El backend (`backend/`)

Esto es el corazón del proyecto. Está escrito en PHP puro, sin frameworks externos, con una arquitectura MVC propia. Tiene cinco capas:

```
Que para construir el backend no han usado ninguna herramienta prefabricada como Laravel o Symfony (que son los frameworks más populares de PHP y que traen ya resueltas cosas como el router, la autenticación, el acceso a la base de datos, etc.).

En lugar de eso, han escrito ellos mismos todas esas piezas desde cero:

- El Router que mapea URLs a funciones — escrito a mano.
- La conexión a la base de datos (Database.php) — escrita a mano.
- El sistema de autenticación con tokens — escrito a mano.
- El AuthGuard que protege las rutas — escrito a mano.

La ventaja es que el código es más ligero y no depende de librerías externas. La desventaja es que hay que escribir y mantener más código, y que un framework ya tiene resueltos muchos problemas de seguridad y rendimiento que aquí habría que implementar manualmente si el proyecto crece mucho.

Para un piloto o proyecto de aprendizaje como este es una decisión razonable. En un proyecto de producción grande lo habitual sería usar Laravel o Symfony precisamente para no reinventar la rueda.
```

`Core/` — el motor interno. `Router` mapea cada URL a una función. `Database` abre la conexión a MySQL. `Request` lee el cuerpo JSON de la petición entrante. `Response` devuelve JSON al frontend. `Cors` permite que el frontend (en otro puerto) pueda llamar a la API.

```
Son los cuatro métodos que permiten registrar rutas en el router. Cada uno corresponde a un tipo de operación HTTP:

- `get` → para **leer** datos
- `post` → para **crear** algo nuevo
- `put` → para **editar** algo existente
- `delete` → para **eliminar** algo

Los tres en `index.php` quedan así:

$router->get('/api/users', ...);          // listar usuarios
$router->post('/api/users', ...);         // crear un usuario
$router->put('/api/users/{id}', ...);     // editar un usuario
$router->delete('/api/users/{id}', ...);  // eliminar un usuario

Cada método recibe dos cosas: la URL (`$path`) y la función que se ejecutará cuando llegue esa petición (`$handler`). Lo único que hacen es guardar esa combinación llamando a `addRoute`, que es quien realmente la almacena internamente.

Después, cuando llega una petición real del navegador, el método `dispatch` busca en esa lista si hay alguna ruta que coincida con la URL y el método HTTP recibidos, y ejecuta la función correspondiente.
```

```
Son cinco ficheros que forman la fontanería básica del backend. Sin ellos no funciona nada de lo demás.

---

### Router

Es el controlador de tráfico. Su trabajo es mirar la URL y el método HTTP de cada petición que llega y decidir qué función ejecutar.

Internamente mantiene una lista de rutas registradas. Cuando llega una petición, el método `dispatch` recorre esa lista buscando coincidencia. Si encuentra una, ejecuta la función asociada. Si no, devuelve un 404.

Tiene dos tipos de rutas: las estáticas como `/api/health` que coinciden exactamente, y las dinámicas como `/api/users/{id}` donde `{id}` puede ser cualquier número. Para estas últimas usa expresiones regulares que compila él mismo a partir del patrón.

---

### Database

Abre y mantiene la conexión a MySQL usando PDO, que es la librería estándar de PHP para bases de datos. Usa el patrón Singleton, que significa que por mucho que lo llames desde distintos sitios del código, siempre devuelve la misma conexión en lugar de abrir una nueva cada vez. Las credenciales las lee del `.env` mediante `getenv()`.

---

### Request

Lee el cuerpo de la petición HTTP entrante. Cuando el frontend envía un formulario de login, los datos viajan en el cuerpo de la petición en formato JSON. `Request::jsonBody()` toma ese texto crudo, lo convierte en un array de PHP, y lo devuelve para que el Controller pueda trabajar con él.

---

### Response

El lado contrario de Request. Toma un array de PHP, lo convierte a JSON, añade la cabecera `Content-Type: application/json` para que el navegador sepa lo que recibe, y envía todo al frontend con el código HTTP correspondiente (200 si fue bien, 201 si se creó algo, 401 si no estás autenticado, 404 si no existe, etc.).

---

### Cors

Resuelve un problema de seguridad del navegador. Por defecto, un navegador bloquea las peticiones que van de un origen a otro distinto, por ejemplo de `http://localhost:3000` (el frontend) a `http://localhost:8080` (la API). Esto se llama política de mismo origen.

CORS es el mecanismo que permite levantar ese bloqueo de forma controlada. Este fichero añade las cabeceras HTTP necesarias para decirle al navegador "está bien, acepta peticiones desde este otro origen". Solo lo activa cuando `APP_ENV=local` para no dejarlo abierto en producción.
```

`Controllers/` — reciben la petición HTTP, delegan en los servicios y devuelven la respuesta. Son el punto de entrada de cada endpoint. `AuthController` gestiona login, registro, Google, recuperación de contraseña. `UsersController` gestiona el CRUD de usuarios (solo admins). `StatsController` devuelve el total de usuarios registrados.

````
Un endpoint es una URL concreta de la API a la que el frontend puede llamar para hacer algo específico.

Cada combinación de método HTTP + URL es un endpoint distinto. En este proyecto los endpoints son estos:

```
POST /api/auth/register        → registrar un usuario nuevo
POST /api/auth/login           → iniciar sesión
POST /api/auth/google          → iniciar sesión con Google
POST /api/auth/forgot-password → pedir recuperación de contraseña
POST /api/auth/reset-password  → completar recuperación de contraseña

GET  /api/me                   → ver tus propios datos
PUT  /api/me/password          → cambiar tu contraseña

GET    /api/users              → listar todos los usuarios (solo admin)
POST   /api/users              → crear un usuario (solo admin)
PUT    /api/users/{id}         → editar un usuario (solo admin)
DELETE /api/users/{id}         → eliminar un usuario (solo admin)

GET /api/stats/users-count     → total de usuarios registrados
GET /api/health                → comprobar que la API está viva
```

Cuando dices "el frontend llama a un endpoint", significa que hace una petición HTTP a una de esas URLs. El Controller es el código PHP que está escuchando en ese endpoint y sabe qué hacer cuando llega esa llamada.
````

`Services/` — aquí vive la lógica de negocio real. `AuthService` sabe cómo registrar un usuario (validar campos, hashear contraseña, crear sesión), cómo hacer login (verificar hash), cómo verificar un token de Google, cómo gestionar el reset de contraseña. Es la capa más importante.

`Repositories/` — solo hablan con la base de datos. `UserRepository` sabe buscar usuarios por email, por ID, por google_id, crear uno nuevo, actualizarlo, borrarlo. `SessionRepository` crea y valida tokens de sesión. `PasswordResetRepository` gestiona los tokens de recuperación.

`Middleware/AuthGuard` — intercepta peticiones protegidas. Lee el header `Authorization: Bearer <token>`, lo busca en `user_sessions`, y si no existe o está caducado, corta la petición con un 401. Si el endpoint requiere admin y el usuario es `user`, devuelve 403.

El punto de entrada de todo es `backend/public/index.php`. Registra todas las rutas y arranca el router.

### 4. Los frontends (`frontend-public/`, `frontend-private/`, `frontend-shared/`)

Son ficheros HTML+CSS+JS puros, sin frameworks de compilación. Se sirven directamente como ficheros estáticos (aún no desde el servidor Docker, se abren en local o se sirven aparte).

`frontend-public/index.html` — todo lo que ve alguien sin login: formulario de registro, formulario de login, botón de Google, formulario de recuperación de contraseña, y el contador de usuarios registrados.

`frontend-private/index.html` — la zona protegida. Si eres user normal, ves tu perfil y puedes cambiar la contraseña. Si eres admin, ves el dashboard con la tabla de usuarios y puedes crear, editar y eliminar.

`frontend-shared/js/api-client.js` — la pieza clave que conecta los dos frontends con el backend. Es un objeto global `PilotoApi` que sabe llamar a la API (con `fetch`), añadir el token en las cabeceras de forma automática, guardar el token en `sessionStorage` cuando haces login, y lanzar errores con el mensaje del servidor si algo falla.

`design-system/` — variables CSS (colores en tema oscuro, tipografía DM Sans, espaciados, radios) y componentes reutilizables entre los dos frontends.

------

## Cómo se conectan: el flujo completo de un login

Para que quede claro cómo hablan las capas entre sí, este es el recorrido exacto cuando alguien escribe su email y contraseña y pulsa "Entrar":

El frontend llama a `PilotoApi.post('/api/auth/login', { email, password })`. El api-client construye el `fetch` con las cabeceras correctas y lo envía a `http://localhost:8080/api/auth/login`.

Apache recibe la petición y la pasa a `backend/public/index.php`. El Router lee que es `POST /api/auth/login` y llama a `AuthController::login()`.

El Controller lee el cuerpo JSON con `Request::jsonBody()` y llama a `AuthService::login()`.

El Service valida que email y password no estén vacíos, llama a `UserRepository::findByEmail()` para buscar el usuario, y usa `password_verify()` para comparar la contraseña con el hash guardado. Si coincide, llama a `SessionRepository::createTokenForUser()`.

El SessionRepository genera un token aleatorio de 64 caracteres, lo hashea con SHA-256, guarda el hash en `user_sessions` con fecha de expiración, y devuelve el token en claro.

El Service devuelve `{ user, token }` al Controller, que llama a `Response::json()` para devolver el JSON al frontend.

El api-client recibe la respuesta, guarda el token en `sessionStorage`, y el frontend redirige al usuario a la zona privada.

A partir de ahí, cada petición autenticada que hace el frontend incluye `Authorization: Bearer <token>`. El `AuthGuard` lo intercepta, lo hashea, lo busca en la BD y, si está vigente, deja pasar la petición.

------

## El punto más delicado: el token de sesión

Merece mención especial porque está bien pensado. El backend nunca guarda el token en claro en la BD, sino su hash SHA-256. Así, si alguien consigue acceso a la tabla `user_sessions`, los tokens no sirven de nada. El token real solo viaja entre el servidor (en la respuesta de login) y el navegador del usuario (en `sessionStorage`). Cada petición envía el token en claro, el backend lo hashea y lo compara. Sencillo y seguro.

------

## Resumen de lo que está hecho y lo que falta

Lo que ya existe y funciona: la infraestructura Docker completa, el esquema de BD, toda la autenticación (login, registro, Google, recuperación de contraseña), el CRUD de usuarios, el api-client del frontend, y el design system.

Lo que queda por conectar según el README: los frontends no están aún servidos desde Docker (se abren como ficheros locales), y habría que integrar el api-client en el HTML del frontend-public y frontend-private, que tienen la estructura visual pero aún sin llamadas reales a la API conectadas.

Es un proyecto bien armado para el nivel que pretende. El backend es el más elaborado y ya está completo. Los frontends son el trabajo que queda.