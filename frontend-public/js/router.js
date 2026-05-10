/* ============================================================
   ROUTER.JS — Navegación entre vistas (SPA simple)
   Controla qué página se muestra y resetea el estado de los
   formularios al cambiar de vista.
   ============================================================ */

/**
 * Navega a la vista indicada.
 * @param {string} page - ID de la página sin el prefijo 'page-'
 */
function goTo(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + page).classList.add('active');

  window.scrollTo(0, 0);
  resetForms();
}

/**
 * Limpia el estado visual de todos los formularios:
 * alertas, botones de carga, estados de éxito y pasos del forgot.
 */
function resetForms() {
  // Ocultar alertas
  document.querySelectorAll('.alert').forEach(a => a.classList.remove('show'));

  // Restaurar texto y estado de botones submit
  document.querySelectorAll('.btn-submit').forEach(btn => {
    btn.classList.remove('loading');
    if (btn.id === 'login-btn') btn.textContent = 'Entrar';
    if (btn.id === 'reg-btn')   btn.textContent = 'Crear cuenta';
  });

  // Resetear estado de éxito del registro
  const regSuccess = document.getElementById('reg-success');
  const regForm    = document.getElementById('reg-form-state');
  if (regSuccess) regSuccess.style.display = 'none';
  if (regForm)    regForm.style.display    = 'block';

  // Resetear pasos del flujo de recuperación de contraseña
  const s1 = document.getElementById('forgot-step1');
  const s2 = document.getElementById('forgot-step2');
  const s3 = document.getElementById('forgot-step3');
  if (s1) { s1.style.display = 'block'; }
  if (s2) { s2.style.display = 'none';  }
  if (s3) { s3.style.display = 'none';  }
}
