# Piloto CMS — Estrategia Frontend-First + Flujo de Registro

## ¿Es posible diseñar el front primero?

Sí, es la aproximación más limpia. Se llama **"Frontend-First" o "Contract-First"**: defines los contratos de la API antes de implementarla, y el frontend trabaja contra datos simulados (mocks) hasta que el backend esté listo. Al conectar el backend real, el frontend no cambia nada, solo se quita el mock.

------

## El proceso completo de registro de usuario

Hay tres capas que trabajan en cadena:

------

### 1. CAPA DE PRESENTACIÓN (Frontend)

El usuario rellena un formulario y hace clic en "Registrarse". El frontend recoge los datos y los valida **antes** de enviarlos:

```
Nombre        → no vacío, mínimo 2 caracteres
Email         → formato válido, no vacío
Contraseña    → mínimo 8 caracteres, mayúscula, número...
Confirmar pwd → coincide con contraseña
```

Si pasa la validación, construye una petición HTTP y la lanza:

```javascript
// Lo que el frontend envía
POST /api/auth/register
Content-Type: application/json

{
  "nombre": "Ana García",
  "email": "ana@ejemplo.com",
  "password": "MiPass123"
}
```

Mientras espera respuesta, muestra un estado de carga. Según lo que llegue, muestra éxito o el error concreto.

------

### 2. CAPA DE API / BACKEND (PHP MVC)

El controlador `AuthController` recibe la petición y orquesta el proceso:

```
Petición entra
    ↓
Middleware: ¿viene JSON válido?
    ↓
Controller → llama al AuthService
    ↓
AuthService:
    1. Valida datos (servidor, segunda línea de defensa)
    2. Comprueba si el email ya existe en BD
    3. Si existe → error 409 Conflict
    4. Si no existe → hashea la contraseña con bcrypt
    5. Llama al UserRepository para insertar
    ↓
UserRepository → ejecuta INSERT en MySQL
    ↓
Devuelve el usuario creado (sin contraseña)
    ↓
Controller → responde con JSON
```

Respuestas posibles:

```javascript
// Éxito — 201 Created
{
  "success": true,
  "data": {
    "id": 42,
    "nombre": "Ana García",
    "email": "ana@ejemplo.com",
    "rol": "user",
    "created_at": "2026-04-19T10:30:00Z"
  },
  "message": "Usuario registrado correctamente"
}

// Email duplicado — 409 Conflict
{
  "success": false,
  "error": "EMAIL_ALREADY_EXISTS",
  "message": "Este email ya está registrado"
}

// Datos inválidos — 422 Unprocessable Entity
{
  "success": false,
  "error": "VALIDATION_ERROR",
  "fields": {
    "email": "Formato de email inválido",
    "password": "Mínimo 8 caracteres"
  }
}
```

------

### 3. CAPA DE BASE DE DATOS (MySQL)

Lo que realmente ocurre en la BD cuando llega el INSERT:

```sql
INSERT INTO users (nombre, email, contraseña, rol, fecha_creacion)
VALUES ('Ana García', 'ana@ejemplo.com', '$2y$10$hashedPassword...', 'user', NOW());
```

Puntos clave:

- La **contraseña nunca se guarda en texto plano**, siempre como hash bcrypt
- `google_id` queda `NULL` porque es registro tradicional
- `rol` se asigna automáticamente como `user`
- La BD tiene un índice `UNIQUE` sobre `email` como segunda red de seguridad

------

## Diagrama del flujo completo

```
[Usuario]
    │ rellena formulario
    ▼
[Frontend — Validación JS]
    │ POST /api/auth/register
    ▼
[Middleware — Validación HTTP]
    │
    ▼
[AuthController]
    │ llama a
    ▼
[AuthService]
    ├─ ¿email existe? ──→ error 409
    ├─ bcrypt(password)
    └─ llama a
        ▼
    [UserRepository]
        │ INSERT INTO users
        ▼
    [MySQL]
        │ devuelve id generado
        ▼
    [AuthService] → construye objeto usuario
        ▼
[AuthController] → JSON 201
    ▼
[Frontend]
    ├─ éxito → redirige a login (o auto-login)
    └─ error → muestra mensaje específico
```

------

## Estrategia de mocks para trabajar sin backend

Durante la fase de diseño frontend, cada llamada a la API se sustituye por una función mock:

```javascript
// api/auth.js — con mock
async function register(datos) {
  // --- MOCK: quitar cuando el backend esté listo ---
  await delay(800); // simula latencia real
  if (datos.email === 'test@test.com') {
    throw { error: 'EMAIL_ALREADY_EXISTS' };
  }
  return { id: 1, nombre: datos.nombre, rol: 'user' };
  // --- FIN MOCK ---

  // Código real (descomentado cuando haya backend):
  // const res = await fetch('/api/auth/register', { method: 'POST', body: JSON.stringify(datos) });
  // return res.json();
}
```

Cuando el backend esté listo, simplemente se **comenta el bloque mock y se descomenta la llamada real**. El resto del componente no toca nada.

------

## Orden de trabajo sugerido

| Fase                | Qué se hace                                                 |
| ------------------- | ----------------------------------------------------------- |
| **1. Diseño**       | Wireframes y componentes visuales estáticos                 |
| **2. Lógica mock**  | Formularios con validación + llamadas simuladas             |
| **3. Contrato API** | Documentar exactamente qué envía y qué espera cada endpoint |
| **4. Backend**      | Implementar PHP respetando el contrato                      |
| **5. Integración**  | Sustituir mocks por llamadas reales                         |
| **6. QA**           | Probar flujos completos end-to-end                          |

¿Quieres que empiece con el diseño visual del formulario de registro, o prefieres que primero defina la estructura de componentes completa del frontend?