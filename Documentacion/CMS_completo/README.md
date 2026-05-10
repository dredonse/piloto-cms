# PILOTO CMS — Sistema de gestión de usuarios con control de acceso

## Objetivo

Desarrollar una aplicación web dockerizada en entorno LAMP que permita gestionar usuarios con distintos niveles de acceso, incluyendo autenticación tradicional, login con Google y recuperación de contraseña.

El sistema se plantea como base para un futuro CMS, con una arquitectura modular y preparada para crecer.

---

## Alcance funcional

### Frontend público (HTML, CSS, JS, VUE...)

Accesible sin login.

Funcionalidades:
- Registro de usuarios  
- Inicio de sesión  
- Login con Google  
- Recuperación de contraseña  
- Visualización del número total de usuarios registrados  

---

### Frontend privado (HTML, CSS, JS, VUE...)

Accesible tras autenticación.

El contenido se adapta según el tipo de usuario.

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
- Separación en:
  - `frontend-public`  
  - `frontend-private`  
- Consumo de API  

---

## Infraestructura

Aplicación dockerizada con:
- Apache + PHP  
- MySQL  

Permite despliegue sencillo y entorno reproducible.

---

## Modelo de datos

### Tabla `users`
- id  
- nombre  
- email  
- contraseña  
- google_id  
- rol  
- fecha de creación  

### Tabla `password_resets`
- email  
- token  
- fecha de expiración  

---

## Autenticación

El sistema incluye:

- Login tradicional (email y contraseña)  
- Login con Google  
- Recuperación de contraseña mediante token  

---

## API principal

### Autenticación
- `POST /api/auth/register`  
- `POST /api/auth/login`  
- `POST /api/auth/google`  

### Usuario autenticado
- `GET /api/me`  
- `PUT /api/me/password`  

### Administración (solo admin)
- `GET /api/users`  
- `POST /api/users`  
- `PUT /api/users/{id}`  
- `DELETE /api/users/{id}`  

### Métricas
- `GET /api/stats/users-count`  

---

## Escenario de demostración

- Un usuario se registra desde el frontend público  
- El contador de usuarios se actualiza  
- Se inicia sesión  
- Accede a la zona privada  
- Según su rol:
  - usuario normal → acceso limitado  
  - admin → acceso a gestión de usuarios  
- El administrador crea un nuevo usuario  
- Se prueba el login con Google  
- Se prueba la recuperación de contraseña  

---