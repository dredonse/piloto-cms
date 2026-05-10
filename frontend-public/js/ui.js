/* ============================================================
   UI.JS — Utilidades de interfaz compartidas
   Toaster, helpers de tiempo y funciones de uso general.
   ============================================================ */

/**
 * Muestra una notificación tipo toast en la esquina inferior derecha.
 * @param {string} msg    - Texto del mensaje
 * @param {string} type   - 'default' | 'success'
 */
function toast(msg, type = 'default') {
  const container = document.getElementById('toaster');
  const el = document.createElement('div');
  el.className = 'toast';

  if (type === 'success') el.style.background = '#1A6B3C';

  el.textContent = msg;
  container.appendChild(el);

  // Auto-eliminar tras 3 segundos con fade out
  setTimeout(() => {
    el.style.opacity    = '0';
    el.style.transition = 'opacity 0.3s';
    setTimeout(() => el.remove(), 300);
  }, 3000);
}

/**
 * Pausa la ejecución el número de milisegundos indicado.
 * Útil para simular latencia de red en el prototipo.
 * @param {number} ms
 * @returns {Promise<void>}
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
