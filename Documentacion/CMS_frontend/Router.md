## método `goTo()`

El método `goTo()` **no es un método por defecto de JavaScript ni del navegador**. Es una función personalizada que debe estar implementada en alguno de tus otros archivos de script, específicamente en **`js/router.js`**.

En el desarrollo web estándar, el navegador no sabe qué significa "ir a home" en el contexto de una aplicación que no recarga la página. Por eso, necesitas una función que gestione ese cambio de estado.

### ¿Dónde está y qué hace?

Si revisas tu archivo HTML, verás esta línea: `<script src="js/router.js" defer></script>`

Es casi seguro que `goTo` está definido allí. En una arquitectura como la que estás construyendo, esa función suele encargarse de tres tareas críticas:

1. **Ocultar y Mostrar:** Busca todos los elementos con la clase `.page` y les quita la clase `.active`, para luego ponérsela solo al ID que le pases (por ejemplo, `page-home`).
2. **Gestión de la URL:** Puede usar la API de historial del navegador (`history.pushState`) para que la URL cambie (ej. de `/` a `/login`) sin recargar la web.
3. **Limpieza:** A veces aprovecha para limpiar errores de formularios previos o resetear temporizadores.

### ¿Por qué se hace así? (Filosofía de Separación)

Si usaras un enlace tradicional `<a href="index.html">`, el navegador descargaría todo el HTML, CSS y JS de nuevo. Al usar un listener que llama a `goTo('home')`:

- **Evitas la recarga:** La navegación es instantánea.
- **Control total:** Puedes decidir que, si el usuario está en medio de un registro, le aparezca un aviso de "¿Estás seguro de que quieres salir?" antes de ejecutar el cambio de página.
- **Centralización:** Si mañana decides que la página de inicio ya no se llama "home" sino "dashboard", solo cambias la lógica en un sitio (`router.js`) y no en todos los botones del HTML.



Efectivamente, aquí tienes el "motor" que mueve las piezas de tu aplicación. Como sospechábamos, `goTo` es una función personalizada que gestiona el comportamiento de una **SPA (Single Page Application)** muy ligera.

Desde el punto de vista de la **separación de tareas**, este archivo `router.js` cumple una función vital: **la Gestión de Estado Visual**.

Aquí tienes el desglose de lo que ocurre bajo el capó:

### 1. El Switcher de Vistas (La función `goTo`)

Esta función es puramente operativa. Su lógica se basa en una convención de nombres (un "contrato") entre el HTML y el JS:

- **Convención:** Todas tus páginas en el HTML empiezan por `page-` (`page-home`, `page-login`).
- **Acción:** Cuando llamas a `goTo('login')`, el script construye la cadena `'page-login'`, busca ese ID y le añade la clase `.active` (que en tu CSS probablemente tenga un `display: block` o similar).
- **Limpieza de rastro:** Antes de mostrar la nueva, se asegura de que ninguna otra página tenga la clase `.active`. Esto evita que se solapen.

### 2. El "Botón de Pánico" (La función `resetForms`)

Esta es la parte más sofisticada de tu router. No se limita a cambiar de pantalla, sino que **limpia la escena del crimen** antes de que el usuario entre:

- **Idempotencia:** Asegura que, sin importar cuántas veces entres y salgas de una sección, el formulario siempre se vea "como nuevo".
- **Reset de UI Dinámica:** Si el usuario estaba en el Paso 2 de recuperar contraseña y decide volver al inicio, `resetForms` fuerza al sistema a volver al Paso 1. Sin esto, si el usuario hiciera click en "Olvidé mi contraseña" de nuevo, se encontraría el flujo a medias, lo cual rompería la experiencia de usuario (UX).
- **Limpieza de Errores:** Borra los mensajes de "Email incorrecto" o "Faltan campos" para que el usuario no reciba una alerta negativa nada más entrar a una vista.

### 3. Anatomía de la Separación en este archivo

Si `auth.js` era el cerebro lógico, `router.js` es el **coordinador de escena**:

| **Tarea**          | **Quién la hace**      | **Por qué está ahí**                                         |
| ------------------ | ---------------------- | ------------------------------------------------------------ |
| **Navegación**     | `goTo()`               | Para no recargar la página y mantener la velocidad.          |
| **Scroll Control** | `window.scrollTo(0,0)` | Para asegurar que el usuario siempre empiece a leer desde arriba al cambiar de sección. |
| **Sanitización**   | `resetForms()`         | Para evitar que el estado de una sesión anterior (errores, loadings) ensucie la nueva vista. |

### Un detalle Socrático:

Fíjate en esta parte:

JavaScript

```
if (btn.id === 'login-btn') btn.textContent = 'Entrar';
```

Aquí el código está siendo muy específico. Si mañana cambias el texto del botón en el HTML a "Ingresar", el JS lo sobreescribirá a "Entrar" al navegar. Esto es un pequeño **acoplamiento**. Una mejora sería guardar el texto original en un atributo `data-text` en el HTML, pero para la escala de este proyecto, esta solución es directa y efectiva.

¿Ves cómo cada archivo tiene una "misión" única? `auth.js` valida datos, `router.js` mueve paneles y `password.js` (que mencionaba tu HTML) probablemente se encarga solo de las reglas de seguridad.



## document.querySelectorAll()

Es normal que estas líneas confundan al principio, porque son el corazón de cómo JavaScript manipula el HTML moderno. Vamos a desglosarlas como si fueran piezas de un mecanismo.

### 1. `document.querySelectorAll('.page')`

Imagina que tienes una caja con varios documentos y algunos tienen una etiqueta pegada que dice `.page`.

- **¿Qué hace?** Busca en **todo** tu HTML cualquier elemento que tenga la clase CSS `page`.
- **¿Qué devuelve?** Una lista (técnicamente un *NodeList*) con todos esos elementos. En tu caso, encontrará los bloques `<main class="page" id="page-home">`, `page-login`, `page-register`, etc.

### 2. `.forEach(p => ... )`

Como `querySelectorAll` te ha devuelto una **lista** de páginas, no puedes darles una orden a todas a la vez diciendo "ocultaos". Tienes que ir una por una.

- **`forEach`**: Es un ciclo que dice: "Para cada elemento que hayas encontrado en la lista...".
- **`p`**: Es el nombre temporal que le damos a la página que estamos tocando en ese preciso instante (podría haberse llamado `pagina` o `elemento`).
- **`p.classList.remove('active')`**: Aquí es donde ocurre la magia. `classList` es un objeto que contiene todas las clases CSS de ese elemento. El método `.remove('active')` simplemente busca la palabra "active" en la lista de clases de esa página y la borra.

> **Resultado de esta línea:** Todas las secciones de tu web se quedan sin la clase `active`. Como tu CSS probablemente dice que las páginas sin `active` no se ven (`display: none`), la pantalla se queda "vacía" por un milisegundo.

------

### 3. `document.getElementById('page-' + page).classList.add('active')`

Ahora que hemos limpiado la pantalla y no hay ninguna página visible, tenemos que mostrar **la que el usuario quiere**.

- **`'page-' + page`**: Esto es una concatenación. Si llamaste a `goTo('login')`, JavaScript crea el texto `'page-login'`.
- **`getElementById(...)`**: Busca el elemento exacto que tiene ese ID único.
- **`.classList.add('active')`**: A ese elemento específico, le añade la palabra "active" a su lista de clases.

------

### En resumen: El truco de magia

Este sistema funciona como un mazo de cartas sobre una mesa donde solo la carta que está "boca arriba" (`active`) se puede ver:

1. **`querySelectorAll().forEach(remove)`**: Pone **todas** las cartas boca abajo.
2. **`getElementById().add('active')`**: Le da la vuelta **solo** a la carta que te interesa.

| **Método**         | **Analogía**                                    |
| ------------------ | ----------------------------------------------- |
| `querySelectorAll` | "Buscador de grupos" (todas las páginas).       |
| `classList.remove` | "Borrador de etiquetas" (quitar visibilidad).   |
| `getElementById`   | "Francotirador" (va a por una página concreta). |
| `classList.add`    | "Pegar etiqueta" (activar visibilidad).         |

¿Ves ahora por qué es tan eficiente? Con solo dos líneas de código puedes tener 100 páginas diferentes en tu HTML y el sistema de navegación nunca cambiaría.

¿Te queda más claro cómo JavaScript "toca" las clases del HTML?





Esta es una de las dudas más comunes y entenderla te dará el superpoder de manejar el DOM con precisión. La respuesta corta es: **JavaScript no busca una coincidencia exacta de toda la frase, busca si la clase que pides está presente en la "lista" de clases del elemento.**

### 1. El concepto de "Lista de Clases" (Token List)

Cuando en HTML escribes `class="page active"`, el navegador no lo ve como un único nombre largo. Lo ve como un elemento que tiene **dos etiquetas separadas**:

1. `page`
2. `active`

Es como si el elemento tuviera dos apellidos. Si tú gritas en una sala: "¿Quién se apellida **page**?", el elemento `main` levantará la mano, aunque también se apellide **active**.

### 2. ¿Cómo trabaja `querySelectorAll('.page')`?

El punto (`.`) le dice a JavaScript: "Busca elementos que tengan **al menos** esta clase".

- Si el elemento es `class="page"`, lo encuentra.
- Si el elemento es `class="page active"`, lo encuentra.
- Si el elemento es `class="página-principal page modo-oscuro"`, también lo encuentra.

**¿Por qué?** Porque el método `querySelectorAll` divide el valor del atributo `class` por los espacios y comprueba si la palabra `page` existe en ese grupo.

### 3. Diferencia entre "Contener" y "Ser exactamente"

Si quisieras buscar un elemento que tenga **exactamente y solo** esas dos clases y ninguna más, podrías ser más específico en tu selector:

- `document.querySelectorAll('.page.active')` (Sin espacio entre los puntos): Busca elementos que tengan **ambas** clases a la vez.
- `document.querySelector('[class="page active"]')`: Busca elementos donde el texto de la clase sea **idéntico** a esa cadena (menos común y más frágil).

### 4. ¿Por qué esto es útil en tu `router.js`?

Tu código de navegación hace esto:

1. **`querySelectorAll('.page')`**: Selecciona todas las secciones (`home`, `login`, `register`) porque todas comparten el "apellido" `.page`. No importa si están activas o no; las encuentra a todas para poder "apagarlas".
2. **`p.classList.remove('active')`**: Aquí es donde la separación de clases brilla. JavaScript entra en el elemento `class="page active"`, busca solo la palabra `active` y la borra. El elemento pasa a ser simplemente `class="page"`.

### En resumen

El navegador trata las clases como una **colección de etiquetas independientes**. `querySelectorAll('.page')` entrará en tu `main` porque `page` es una de sus etiquetas, ignorando si tiene otras diez clases más al lado.

¿Te imaginas lo difícil que sería programar si tuviéramos que escribir siempre el nombre exacto de todas las clases combinadas? ¡El sistema de selectores está hecho para ser flexible!



¡Entiendo perfectamente tu duda! El "misterio" está en que **JavaScript trata las clases como una lista de etiquetas**, no como una frase fija, y el CSS reacciona instantáneamente a cualquier cambio en esa lista.

Vamos a visualizarlo paso a paso con lo que ocurre en la memoria del navegador.

### 1. El estado inicial

Imagina que tus cuatro elementos `<main>` tienen una maleta de etiquetas (clases). En el inicio, la situación es esta:

- **Página Home:** Tiene las etiquetas `["page", "active"]`.
- **Página Login:** Tiene las etiquetas `["page", "form-page"]`.
- **Página Registro:** Tiene las etiquetas `["page", "form-page"]`.
- **Página Forgot:** Tiene las etiquetas `["page", "form-page"]`.

Como el CSS dice que `.page.active` es lo único que se muestra (`display: flex`), el usuario solo ve la Home.

------

### 2. El proceso de "Limpieza"

Cuando ejecutas `goTo('login')`, lo primero que hace el código es:

```
document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
```

Aquí, JavaScript se comporta como un inspector que pasa por las 4 maletas:

1. **En Home:** Mira la maleta, ve que existe la etiqueta `"active"` y **la arranca**. Ahora Home solo tiene `["page"]`.
2. **En Login:** Mira la maleta, busca `"active"`. Como **no está**, no hace nada. Sigue teniendo `["page", "form-page"]`.
3. **En Registro:** Lo mismo, no encuentra `"active"`, no hace nada.
4. **En Forgot:** Lo mismo.

**Resultado de este paso:** Ahora **ninguno** de los 4 elementos tiene la etiqueta `"active"`. En este preciso instante, si el CSS pudiera hablar, diría: *"No veo a nadie con las dos etiquetas puestas, así que oculto todo"*. La pantalla se queda en blanco por una milmillonésima de segundo.

------

### 3. El proceso de "Encendido"

Inmediatamente después, el código ejecuta:

```
document.getElementById('page-login').classList.add('active');
```

JavaScript va directo al cajón de la página de Login (gracias al ID) y mete la etiqueta `"active"` en su maleta.

- **Página Login ahora tiene:** `["page", "form-page", "active"]`.

------

### 4. La reacción del CSS

Aquí es donde ocurre la "magia". El CSS no es algo que se ejecute una vez y ya está; el navegador está vigilando el HTML constantemente.

En cuanto el navegador detecta que el elemento `#page-login` ahora tiene las clases `page` y `active` a la vez, aplica la regla:

CSS

```
.page.active { display: flex; }
```

Como la página Home ya no cumple esa regla (porque le quitamos el "active"), deja de mostrarse. Como la página Login ahora sí la cumple, aparece mágicamente ante el usuario.

### Resumen visual de la transformación:

| **Momento**                 | **Clase de Home** | **Clase de Login**      | **¿Qué ve el usuario?** |
| --------------------------- | ----------------- | ----------------------- | ----------------------- |
| **Inicio**                  | `page active`     | `page form-page`        | Home                    |
| **Tras `remove('active')`** | `page`            | `page form-page`        | Nada (blanco)           |
| **Tras `add('active')`**    | `page`            | `page form-page active` | Login                   |

**¿Por qué usamos `querySelectorAll('.page')` para quitar la clase?**

Porque es más fácil y seguro decirle a JavaScript "quita el active a todo lo que sea una página" que intentar recordar cuál era la página que estaba abierta anteriormente para quitárselo solo a esa. Es una "limpieza general" antes de poner la nueva.

¿Te ayuda esta analogía de las "etiquetas en la maleta" a ver cómo el CSS decide qué mostrar?