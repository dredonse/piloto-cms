<template>
  <div class="form-card">

    <div id="reg-form-state">
      <div class="form-header">
        <div class="form-tag">Nuevo usuario</div>
        <div class="form-title">Crear cuenta</div>
        <div class="form-subtitle">Únete a la plataforma en menos de un minuto</div>
      </div>

      <button type="button" class="btn-google" id="btn-google-register">
        <svg width="16" height="16" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Continuar con Google
      </button>

      <div class="divider"><span>o con email</span></div>

      <div class="alert alert-error" id="reg-error"></div>

      <form id="reg-form" novalidate>
        <div class="field">
          <label for="reg-name">Nombre completo</label>
          <input type="text" id="reg-name" placeholder="Ana García" autocomplete="name">
          <span class="field-error" id="reg-name-error"></span>
        </div>
        <div class="field">
          <label for="reg-email">Correo electrónico</label>
          <input type="email" id="reg-email" placeholder="tu@email.com" autocomplete="email">
          <span class="field-error" id="reg-email-error"></span>
        </div>
        <div class="field">
          <label for="reg-pwd">Contraseña</label>
          <input type="password" id="reg-pwd" placeholder="Mínimo 8 caracteres" autocomplete="new-password">
          <div class="pwd-strength">
            <div class="pwd-bar" id="s1"></div>
            <div class="pwd-bar" id="s2"></div>
            <div class="pwd-bar" id="s3"></div>
            <div class="pwd-bar" id="s4"></div>
            <span class="pwd-label" id="pwd-label">—</span>
          </div>
          <div class="pwd-rules">
            <div class="pwd-rule" id="r-len"><span class="r-dot"></span>Mínimo 8 caracteres</div>
            <div class="pwd-rule" id="r-upper"><span class="r-dot"></span>Una mayúscula</div>
            <div class="pwd-rule" id="r-num"><span class="r-dot"></span>Un número</div>
          </div>
          <span class="field-error" id="reg-pwd-error"></span>
        </div>
        <div class="field">
          <label for="reg-pwd-confirm">Confirmar contraseña</label>
          <input type="password" id="reg-pwd-confirm" placeholder="Repite la contraseña" autocomplete="new-password">
          <span class="field-error" id="reg-pwd-confirm-error"></span>
        </div>

        <div class="field-check" style="margin-top:8px;">
          <input type="checkbox" id="terms">
          <label for="terms">
            Acepto los <span class="link">términos de uso</span> y la <span class="link">política de privacidad</span>
          </label>
        </div>

        <button type="submit" class="btn-submit" id="reg-btn">Crear cuenta</button>
      </form>

      <div class="form-footer">
        ¿Ya tienes cuenta? <a id="link-to-login">Inicia sesión</a>
      </div>
    </div>

    <div class="success-state" id="reg-success">
      <div class="success-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M5 13l4 4L19 7" stroke="#1A6B3C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <div style="font-size:18px; font-weight:600; letter-spacing:-0.02em; margin-bottom:8px;">¡Cuenta creada!</div>
      <div style="font-size:13px; color:var(--muted); margin-bottom:24px; line-height:1.6;">
        Bienvenido/a. Tu cuenta ha sido registrada correctamente.
      </div>
      <button type="button" class="btn-submit" id="btn-success-to-login">Ir a iniciar sesión →</button>
    </div>

  </div>
</template>
