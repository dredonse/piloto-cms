<template>
  <div class="form-card">

    <span class="back-link" id="back-to-login">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M9 2L4 7l5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      Volver al login
    </span>

    <!-- Paso 1: Introduce tu email -->
    <div id="forgot-step1">
      <div class="steps">
        <div class="step-dot active"></div>
        <div class="step-dot"></div>
        <div class="step-dot"></div>
      </div>
      <div class="form-header">
        <div class="form-tag">Recuperar acceso</div>
        <div class="form-title">¿Olvidaste tu contraseña?</div>
        <div class="form-subtitle">Introduce tu email y te enviamos un enlace para recuperar el acceso.</div>
      </div>
      <form id="forgot-form-step1" novalidate>
        <div class="field">
          <label for="forgot-email">Correo electrónico registrado</label>
          <input type="email" id="forgot-email" placeholder="tu@email.com" autocomplete="email">
          <span class="field-error" id="forgot-email-error"></span>
        </div>
        <button type="submit" class="btn-submit">Enviar enlace de recuperación</button>
      </form>
    </div>

    <!-- Paso 2: Email enviado -->
    <div id="forgot-step2" style="display:none;">
      <div class="steps">
        <div class="step-dot"></div>
        <div class="step-dot active"></div>
        <div class="step-dot"></div>
      </div>
      <div class="success-icon" style="display:flex; margin-bottom:16px;">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M3 8l9 6 9-6M3 8v10a1 1 0 001 1h16a1 1 0 001-1V8M3 8a1 1 0 011-1h16a1 1 0 011 1" stroke="#1A6B3C" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <div class="form-header">
        <div class="form-tag" style="color:var(--success);">Email enviado</div>
        <div class="form-title">Revisa tu bandeja de entrada</div>
        <div class="form-subtitle">
          Hemos enviado un enlace de recuperación a <strong id="sent-email-display"></strong>.
          El enlace expira en 30 minutos.
        </div>
      </div>
      <div style="background:var(--bg); border-radius:10px; padding:14px 16px; margin-bottom:20px;">
        <div style="font-size:11px; color:var(--muted); font-weight:600; letter-spacing:0.05em; margin-bottom:6px;">ENLACE DE EJEMPLO (SIMULADO)</div>
        <div style="font-size:11px; font-family:var(--font-mono); color:var(--muted); word-break:break-all;">
          https://tu-dominio.com/reset?token=<span style="color:var(--accent);">a7f3b9c1d2e4...</span>
        </div>
      </div>
      <button type="button" class="btn-submit" id="btn-forgot-step2">He recibido el email — Continuar</button>
      <div class="form-footer" style="margin-top:12px;">
        ¿No lo ves? <span class="link">Reenviar en <span id="resend-timer">60</span>s</span>
      </div>
    </div>

    <!-- Paso 3: Nueva contraseña (token simulado en el enlace del paso 2) -->
    <div id="forgot-step3" style="display:none;">
      <div class="steps">
        <div class="step-dot"></div>
        <div class="step-dot"></div>
        <div class="step-dot active"></div>
      </div>
      <div class="form-header">
        <div class="form-tag">Último paso</div>
        <div class="form-title">Nueva contraseña</div>
        <div class="form-subtitle">Elige una contraseña segura para tu cuenta.</div>
      </div>
      <form id="reset-form" novalidate>
        <div class="field">
          <label for="new-pwd">Nueva contraseña</label>
          <input type="password" id="new-pwd" placeholder="Mínimo 8 caracteres" autocomplete="new-password">
          <span class="field-error" id="new-pwd-error"></span>
        </div>
        <div class="field">
          <label for="confirm-pwd">Confirmar contraseña</label>
          <input type="password" id="confirm-pwd" placeholder="Repite la contraseña" autocomplete="new-password">
          <span class="field-error" id="confirm-pwd-error"></span>
        </div>
        <div class="alert alert-error" id="reset-error" style="display:none;"></div>
        <button type="submit" class="btn-submit">Establecer nueva contraseña</button>
      </form>
    </div>

  </div>
</template>
