Ahora el `index.html` limpio, solo estructura y referencias:

La estructura ha quedado así, con cada archivo con una única responsabilidad:

```
frontend-public/
├── index.html          → Solo estructura HTML, sin una línea de CSS ni JS inline
│
├── css/
│   ├── variables.css   → Design tokens: colores, tipografía, radios, sombras
│   ├── layout.css      → Body, nav, sistema de páginas, responsive
│   ├── components.css  → Botones, inputs, alertas, toaster, form-card...
│   └── pages.css       → Estilos específicos de home, stats, features, forgot
│
└── js/
    ├── ui.js           → toast() y delay() — utilidades compartidas
    ├── router.js       → goTo() y resetForms() — navegación entre vistas
    ├── password.js     → checkPwd(), validatePassword() — medidor de fortaleza
    └── auth.js         → simulateLogin/Register/Forgot/Google — flujos de auth
```

Dos cosas a destacar del criterio de separación:

**En CSS**, la jerarquía importa: `variables` se carga primero porque el resto depende de sus custom properties. `components` no sabe nada de páginas, y `pages` no repite lo que ya define `components`.

**En JS**, el orden de los `<script>` al final del HTML también importa: `ui.js` y `router.js` se cargan antes que `auth.js` porque `auth.js` llama a `toast()`, `delay()` y `goTo()` que viven en los otros archivos.