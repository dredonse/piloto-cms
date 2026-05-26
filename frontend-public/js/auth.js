/* ============================================================
   AUTH.JS — Flujos de autenticación
   Login, registro, recuperación de contraseña y Google OAuth.

   MOCK MODE ACTIVO: todas las funciones simulate*() usan datos
   falsos. Cuando el backend esté listo, sustituir el bloque
   marcado con // --- MOCK --- por la llamada fetch() real.
   ============================================================ */

let resendInterval; // Temporizador de reenvío de email

/* ─────────────────────────────────────────
   VALIDACIÓN — Login
───────────────────────────────────────── */

// Regex estándar para formato de email
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function setFieldError(inputId, errorId, message) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(errorId);
  error.textContent = message;
  input.classList.toggle('input-error', message !== ''); // clase CSS para borde rojo
}

function validateLoginEmail() {
  const value = document.getElementById('login-email').value.trim();
  if (!value) {
    setFieldError('login-email', 'login-email-error', 'El email es obligatorio.');
    return false;
  }
  if (!EMAIL_REGEX.test(value)) {
    setFieldError('login-email', 'login-email-error', 'Introduce un email válido.');
    return false;
  }
  setFieldError('login-email', 'login-email-error', ''); // limpia el error
  return true;
}

function validateLoginPwd() {
  const value = document.getElementById('login-pwd').value;
  if (!value) {
    setFieldError('login-pwd', 'login-pwd-error', 'La contraseña es obligatoria.');
    return false;
  }
  if (value.length < 8) {
    setFieldError('login-pwd', 'login-pwd-error', 'Mínimo 8 caracteres.');
    return false;
  }
  setFieldError('login-pwd', 'login-pwd-error', '');
  return true;
}

function validateLoginForm() {
  // Llamamos ambas para que muestren sus errores a la vez
  const emailOk = validateLoginEmail();
  const pwdOk   = validateLoginPwd();
  return emailOk && pwdOk;
}

async function simulateLogin() {
  const btn   = document.getElementById('login-btn');
  const err   = document.getElementById('login-error');
  const email = document.getElementById('login-email').value.trim();
  const pwd   = document.getElementById('login-pwd').value;

  err.classList.remove('show');

  /*
  if (!email || !pwd) {
    err.textContent = 'Por favor, completa todos los campos.';
    err.classList.add('show');
    return;
  }
   */
  if (!validateLoginForm()) return;

  btn.classList.add('loading');
  btn.textContent = 'Verificando';

  // --- MOCK ---
  await delay(1200);
  // Sustituir por:
  // const res  = await fetch('/api/auth/login', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email, password: pwd }) });
  // const data = await res.json();
  // --- FIN MOCK ---

  btn.classList.remove('loading');
  btn.textContent = 'Entrar';

  // --- MOCK: lógica de respuesta simulada ---
  if (email === 'test@test.com') {
    err.textContent = 'Email o contraseña incorrectos.';
    err.classList.add('show');
  } else {
    toast('✓ Sesión iniciada correctamente', 'success');
    setTimeout(() => toast('→ Redirigiendo al área privada...'), 800);
    // Cuando haya backend: window.location.href = '/private/dashboard.html';
  }
  // --- FIN MOCK ---
}

/* ─────────────────────────────────────────
   VALIDACIÓN — Registro
───────────────────────────────────────── */

// Nombre: solo letras, espacios y guiones — mínimo 2 caracteres
const NAME_REGEX = /^[a-zA-ZÀ-ÿ\s\-]{2,}$/;

function validateRegName() {
  const value = document.getElementById('reg-name').value.trim();
  if (!value) {
    setFieldError('reg-name', 'reg-name-error', 'El nombre es obligatorio.');
    return false;
  }
  if (!NAME_REGEX.test(value)) {
    setFieldError('reg-name', 'reg-name-error', 'Solo letras, espacios y guiones.');
    return false;
  }
  setFieldError('reg-name', 'reg-name-error', '');
  return true;
}

function validateRegEmail() {
  const value = document.getElementById('reg-email').value.trim();
  if (!value) {
    setFieldError('reg-email', 'reg-email-error', 'El email es obligatorio.');
    return false;
  }
  if (!EMAIL_REGEX.test(value)) {
    setFieldError('reg-email', 'reg-email-error', 'Introduce un email válido.');
    return false;
  }
  setFieldError('reg-email', 'reg-email-error', '');
  return true;
}

function validateRegPwd() {
  const value = document.getElementById('reg-pwd').value;
  if (!value) {
    setFieldError('reg-pwd', 'reg-pwd-error', 'La contraseña es obligatoria.');
    return false;
  }
  // Reutiliza la función de password.js que ya tienes
  const check = validatePassword(value);
  if (!check.valid) {
    setFieldError('reg-pwd', 'reg-pwd-error', check.message);
    return false;
  }
  setFieldError('reg-pwd', 'reg-pwd-error', '');
  // Si el campo de confirmación ya tiene algo, revalidarlo también
  // para que el error de "no coinciden" desaparezca en tiempo real
  if (document.getElementById('reg-pwd-confirm').value) {
    validateRegPwdConfirm();
  }
  return true;
}

function validateRegPwdConfirm() {
  const pwd     = document.getElementById('reg-pwd').value;
  const confirm = document.getElementById('reg-pwd-confirm').value;
  if (!confirm) {
    setFieldError('reg-pwd-confirm', 'reg-pwd-confirm-error', 'Confirma tu contraseña.');
    return false;
  }
  if (pwd !== confirm) {
    setFieldError('reg-pwd-confirm', 'reg-pwd-confirm-error', 'Las contraseñas no coinciden.');
    return false;
  }
  setFieldError('reg-pwd-confirm', 'reg-pwd-confirm-error', '');
  return true;
}

function validateRegForm() {
  // Llamamos todas para que los errores aparezcan a la vez
  const nameOk    = validateRegName();
  const emailOk   = validateRegEmail();
  const pwdOk     = validateRegPwd();
  const confirmOk = validateRegPwdConfirm();
  return nameOk && emailOk && pwdOk && confirmOk;
}

/* ─────────────────────────────────────────
   REGISTRO
───────────────────────────────────────── */

async function simulateRegister() {
  const btn   = document.getElementById('reg-btn');
  const err   = document.getElementById('reg-error');

  err.classList.remove('show');

  if (!validateRegForm()) return;

  if (!document.getElementById('terms').checked) {
    err.innerHTML = 'Acepta los términos de uso para continuar.';
    err.classList.add('show');
    return;
  }

  const email = document.getElementById('reg-email').value.trim();

  btn.classList.add('loading');
  btn.textContent = 'Registrando';

  // --- MOCK ---
  await delay(1400);
  // Sustituir por:
  // const res  = await fetch('/api/auth/register', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ nombre: name, email, password: pwd }) });
  // const data = await res.json();
  // --- FIN MOCK ---

  btn.classList.remove('loading');
  btn.textContent = 'Crear cuenta';

  // --- MOCK: lógica de respuesta simulada ---
  if (email === 'existing@test.com') {
    err.innerHTML = 'Este email ya está registrado. <span class="link" id="err-go-login">Inicia sesión.</span>';
    err.classList.add('show');
    document.getElementById('err-go-login')
        .addEventListener('click', () => goTo('login'), { once: true });
  } else {
    document.getElementById('reg-form-state').style.display = 'none';
    document.getElementById('reg-success').style.display    = 'block';
    document.getElementById('stat-users').textContent = '248';
  }
  // --- FIN MOCK ---
}

/* ─────────────────────────────────────────
   RECUPERACIÓN DE CONTRASEÑA — Paso 1
───────────────────────────────────────── */

function validateForgotEmail() {
  const value = document.getElementById('forgot-email').value.trim();
  if (!value) {
    setFieldError('forgot-email', 'forgot-email-error', 'El email es obligatorio.');
    return false;
  }
  if (!EMAIL_REGEX.test(value)) {
    setFieldError('forgot-email', 'forgot-email-error', 'Introduce un email válido.');
    return false;
  }
  setFieldError('forgot-email', 'forgot-email-error', '');
  return true;
}

async function simulateForgotStep1() {
  const email = document.getElementById('forgot-email').value.trim();

  if (!validateForgotEmail()) return;

  /*
  if (!email) {
    alert('Introduce tu dirección de email.');
    return;
  }
   */

  // --- MOCK ---
  await delay(900);
  // Sustituir por:
  // await fetch('/api/auth/forgot-password', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email }) });
  // --- FIN MOCK ---

  document.getElementById('sent-email-display').textContent = email;
  document.getElementById('forgot-step1').style.display = 'none';
  document.getElementById('forgot-step2').style.display = 'block';

  startResendTimer();
}

/* ─────────────────────────────────────────
   RECUPERACIÓN DE CONTRASEÑA — Paso 2
───────────────────────────────────────── */

function simulateForgotStep2() {
  clearInterval(resendInterval);
  document.getElementById('forgot-step2').style.display = 'none';
  document.getElementById('forgot-step3').style.display = 'block';
}

/* ─────────────────────────────────────────
   RECUPERACIÓN DE CONTRASEÑA — Paso 3
───────────────────────────────────────── */

/* ─────────────────────────────────────────
   VALIDACIÓN — Reset de contraseña
───────────────────────────────────────── */

function validateNewPwd() {
  const value = document.getElementById('new-pwd').value;
  if (!value) {
    setFieldError('new-pwd', 'new-pwd-error', 'Introduce una contraseña.');
    return false;
  }
  const check = validatePassword(value); // reutiliza password.js
  if (!check.valid) {
    setFieldError('new-pwd', 'new-pwd-error', check.message);
    return false;
  }
  setFieldError('new-pwd', 'new-pwd-error', '');
  // Si la confirmación ya tiene algo, revalidarla también
  if (document.getElementById('confirm-pwd').value) {
    validateConfirmPwd();
  }
  return true;
}

function validateConfirmPwd() {
  const pwd     = document.getElementById('new-pwd').value;
  const confirm = document.getElementById('confirm-pwd').value;
  if (!confirm) {
    setFieldError('confirm-pwd', 'confirm-pwd-error', 'Confirma tu contraseña.');
    return false;
  }
  if (pwd !== confirm) {
    setFieldError('confirm-pwd', 'confirm-pwd-error', 'Las contraseñas no coinciden.');
    return false;
  }
  setFieldError('confirm-pwd', 'confirm-pwd-error', '');
  return true;
}

function validateResetForm() {
  const pwdOk     = validateNewPwd();
  const confirmOk = validateConfirmPwd();
  return pwdOk && confirmOk;
}


async function simulateReset() {
  const p1  = document.getElementById('new-pwd').value;
  const p2  = document.getElementById('confirm-pwd').value;
  const err = document.getElementById('reset-error');

  err.style.display = 'none';

  // CAMBIO: sustituye los if de p1 !== p2 y validatePassword
  if (!validateResetForm()) return;

  /*
  if (p1 !== p2) {
    err.textContent   = 'Las contraseñas no coinciden.';
    err.style.display = 'block';
    return;
  }
   */

  const pwdCheck = validatePassword(p1);
  if (!pwdCheck.valid) {
    err.textContent   = pwdCheck.message;
    err.style.display = 'block';
    return;
  }

  // --- MOCK ---
  await delay(1000);
  // Sustituir por:
  // await fetch('/api/auth/reset-password', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ token: tokenFromURL, password: p1 }) });
  // --- FIN MOCK ---

  toast('✓ Contraseña actualizada correctamente', 'success');
  setTimeout(() => goTo('login'), 1000);
}

/* ─────────────────────────────────────────
   GOOGLE OAUTH
───────────────────────────────────────── */

function simulateGoogle() {
  toast('↗ Redirigiendo a Google OAuth...');

  // --- MOCK ---
  setTimeout(() => toast('✓ Autenticado con Google', 'success'), 1500);
  // Sustituir por:
  // window.location.href = '/api/auth/google';
  // --- FIN MOCK ---
}

/* ─────────────────────────────────────────
   TEMPORIZADOR DE REENVÍO
───────────────────────────────────────── */

function startResendTimer() {
  let seconds = 60;
  const el = document.getElementById('resend-timer');

  clearInterval(resendInterval);

  resendInterval = setInterval(() => {
    seconds--;
    if (el) el.textContent = seconds;
    if (seconds <= 0) clearInterval(resendInterval);
  }, 1000);
}

/* ─────────────────────────────────────────
   CAMBIO: INIT — registro centralizado de todos los listeners
   Sustituye todos los onclick/oninput del HTML.
   Se ejecuta cuando el DOM está completamente cargado
   (garantizado por el atributo defer en los <script> del HTML).
───────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {

  // ── Navegación global ──────────────────────────────────────
  document.getElementById('logo-link')
      .addEventListener('click', () => goTo('home'));

  document.getElementById('nav-pill-login')
      .addEventListener('click', () => goTo('login'));
  document.getElementById('nav-pill-register')
      .addEventListener('click', () => goTo('register'));

  // ── Página de inicio (Vue monta los botones tras DOMContentLoaded) ──
  document.getElementById('page-home')?.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    if (btn.id === 'home-btn-register') goTo('register');
    if (btn.id === 'home-btn-login') goTo('login');
  });

  // ── Login (Vue monta el formulario tras DOMContentLoaded) ──
  document.getElementById('page-login')?.addEventListener('click', (e) => {
    const el = e.target.closest('#btn-google-login, #link-to-forgot, #link-to-register');
    if (!el) return;
    if (el.id === 'btn-google-login') simulateGoogle();
    if (el.id === 'link-to-forgot') goTo('forgot');
    if (el.id === 'link-to-register') {
      e.preventDefault();
      goTo('register');
    }
  });

  document.getElementById('page-login')?.addEventListener('submit', (e) => {
    if (e.target.id !== 'login-form') return;
    e.preventDefault();
    simulateLogin();
  });

  // ── Registro (Vue monta el formulario tras DOMContentLoaded) ──
  const pageRegister = document.getElementById('page-register');
  if (pageRegister) {
    // focusout sustituye blur: el evento blur no burbujea; focusout sí
    pageRegister.addEventListener('focusout', (e) => {
      if (e.target.id === 'reg-name') validateRegName();
      if (e.target.id === 'reg-email') validateRegEmail();
      if (e.target.id === 'reg-pwd') validateRegPwd();
    });

    pageRegister.addEventListener('input', (e) => {
      if (e.target.id === 'reg-pwd') checkPwd(e.target.value);
      if (e.target.id === 'reg-pwd-confirm') validateRegPwdConfirm();
    });

    pageRegister.addEventListener('click', (e) => {
      const el = e.target.closest(
          '#btn-google-register, #link-to-login, #btn-success-to-login, #err-go-login');
      if (!el) return;
      if (el.id === 'btn-google-register') simulateGoogle();
      if (el.id === 'link-to-login') {
        e.preventDefault();
        goTo('login');
      }
      if (el.id === 'btn-success-to-login' || el.id === 'err-go-login') goTo('login');
    });

    pageRegister.addEventListener('submit', (e) => {
      if (e.target.id !== 'reg-form') return;
      e.preventDefault();
      simulateRegister();
    });
  }

  // ── Recuperar contraseña ───────────────────────────────────
  // Reset — mismo patrón que el registro
  document.getElementById('new-pwd')
      .addEventListener('blur', validateNewPwd);

  document.getElementById('confirm-pwd')
      .addEventListener('input', validateConfirmPwd);

  document.getElementById('back-to-login')
      .addEventListener('click', () => goTo('login'));

  document.getElementById('forgot-form-step1')
      .addEventListener('submit', (e) => {
        e.preventDefault();
        simulateForgotStep1();
      });

  document.getElementById('forgot-email')
      .addEventListener('blur', validateForgotEmail);

  document.getElementById('btn-forgot-step2')
      .addEventListener('click', simulateForgotStep2);

  document.getElementById('reset-form')
      .addEventListener('submit', (e) => {
        e.preventDefault();
        simulateReset();
      });

  // Indicador de seguridad en el reset (antes era oninput en el HTML)
  document.getElementById('new-pwd')
      .addEventListener('input', (e) => checkPwdReset(e.target.value));

});