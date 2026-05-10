/* ============================================================
   PASSWORD.JS — Medidor de fortaleza y validación de contraseña
   Actualiza la barra visual y las reglas en tiempo real.
   ============================================================ */

/**
 * Evalúa la fortaleza de una contraseña y actualiza la UI.
 * Se conecta al DOM del formulario de registro y del reset.
 * @param {string} val - Valor actual del input de contraseña
 */
function checkPwd(val) {
  const hasLength = val.length >= 8;
  const hasUpper  = /[A-Z]/.test(val);
  const hasNumber = /[0-9]/.test(val);
  const isLong    = val.length > 12;

  // Score de 0 a 4
  const score = [hasLength, hasUpper, hasNumber, isLong].filter(Boolean).length;

  // Actualizar barras de color
  ['s1', 's2', 's3', 's4'].forEach((id, index) => {
    const bar = document.getElementById(id);
    if (bar) bar.classList.toggle('active', index < score);
  });

  // Actualizar etiqueta textual
  const labels = ['', 'Débil', 'Regular', 'Buena', 'Fuerte'];
  const labelEl = document.getElementById('pwd-label');
  if (labelEl) labelEl.textContent = labels[score] || '—';

  // Actualizar reglas individuales
  const ruleLen   = document.getElementById('r-len');
  const ruleUpper = document.getElementById('r-upper');
  const ruleNum   = document.getElementById('r-num');

  if (ruleLen)   ruleLen.classList.toggle('ok', hasLength);
  if (ruleUpper) ruleUpper.classList.toggle('ok', hasUpper);
  if (ruleNum)   ruleNum.classList.toggle('ok', hasNumber);
}

/**
 * Alias para el campo de reset de contraseña.
 * Reutiliza la misma lógica sin acoplar los IDs del DOM de forgot.
 * @param {string} val
 */
function checkPwdReset(val) {
  checkPwd(val);
}

/**
 * Valida que una contraseña cumpla los requisitos mínimos.
 * @param {string} val
 * @returns {{ valid: boolean, message: string }}
 */
function validatePassword(val) {
  if (val.length < 8) {
    return { valid: false, message: 'La contraseña debe tener al menos 8 caracteres.' };
  }
  return { valid: true, message: '' };
}
