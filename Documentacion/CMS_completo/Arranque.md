==Este modo de arranque (Docker para el backend + servidor estático para el frontend) es típico de **entornos de desarrollo local**, concretamente cuando:==

- ==El frontend y el backend están en carpetas separadas y aún no hay un proceso de build que los integre.==
- ==Los HTMLs usan rutas absolutas (`/design-system/...`) que necesitan un servidor para resolverse.==
- ==No hay un servidor de producción configurado que sirva todo junto.==

==En **producción** o en un entorno más maduro del proyecto, lo habitual sería una de estas dos opciones:==

- ==**Todo en Docker**: añadir un segundo contenedor en el `docker-compose.yml` (Nginx o Apache) que sirva los frontends, de forma que con un solo `docker compose up` levante absolutamente todo en las URLs definitivas.==
- ==**Frontend compilado**: si se migra a Vue, React u otro framework, el proceso de build generaría archivos estáticos que Apache o Nginx servirían directamente desde el mismo contenedor del backend, o desde un CDN.==

==En el estado actual del proyecto, el `npx serve` o `python3 -m http.server` es un atajo de desarrollo, no una solución definitiva. Es exactamente lo que está pendiente en la hoja de ruta: integrar los frontends en la infraestructura Docker del proyecto.==



## Cómo levantar el proyecto

**1. Arrancar el backend** (desde la carpeta `piloto-cms`):

```bash
docker compose up --build
```

Espera a ver `ready for connections` en los logs. La API queda en `http://localhost:8080`.

**2. Arrancar los frontends** (nueva terminal, misma carpeta):

```bash
# Con Node
npx serve . -p 3000

# Con Python
python3 -m http.server 3000
```

**3. Abrir en el navegador:**

- `http://localhost:3000/frontend-public/index.html` → zona pública
- `http://localhost:3000/frontend-private/index.html` → zona privada

**Usuario de prueba:**

```
Email:      admin@piloto.local
Contraseña: PilotoAdmin1!
```

------

Para parar:

```bash
docker compose down
```