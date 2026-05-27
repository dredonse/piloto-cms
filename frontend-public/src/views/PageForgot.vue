<script setup>
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const {
  state,
  validateForgotEmail,
  simulateForgotStep1,
  simulateForgotStep2,
  onResetPwdInput,
  validateNewPwd,
  validateConfirmPwd,
  simulateReset,
} = useAuth()

function goToLogin() {
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="form-card">

    <button
      id="back-to-login"
      type="button"
      class="back-link"
      style="background:none; border:none; padding:0;"
      @click="goToLogin"
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M9 2L4 7l5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      Volver al login
    </button>

    <!-- Paso 1: Introduce tu email -->
    <div id="forgot-step1" :style="{ display: state.forgot.step === 1 ? 'block' : 'none' }">
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
      <form id="forgot-form-step1" novalidate @submit.prevent="simulateForgotStep1">
        <div class="field">
          <label for="forgot-email">Correo electrónico registrado</label>
          <input
            id="forgot-email"
            v-model="state.forgot.email"
            type="email"
            placeholder="tu@email.com"
            autocomplete="email"
            :class="{ 'input-error': !!state.forgot.errors.email }"
            @blur="validateForgotEmail"
          >
          <span class="field-error" id="forgot-email-error">{{ state.forgot.errors.email }}</span>
        </div>
        <button type="submit" class="btn-submit">Enviar enlace de recuperación</button>
      </form>
    </div>

    <!-- Paso 2: Email enviado -->
    <div id="forgot-step2" :style="{ display: state.forgot.step === 2 ? 'block' : 'none' }">
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
          Hemos enviado un enlace de recuperación a <strong id="sent-email-display">{{ state.forgot.sentEmail }}</strong>.
          El enlace expira en 30 minutos.
        </div>
      </div>
      <div style="background:var(--bg); border-radius:10px; padding:14px 16px; margin-bottom:20px;">
        <div style="font-size:11px; color:var(--muted); font-weight:600; letter-spacing:0.05em; margin-bottom:6px;">ENLACE DE EJEMPLO (SIMULADO)</div>
        <div style="font-size:11px; font-family:var(--font-mono); color:var(--muted); word-break:break-all;">
          https://tu-dominio.com/reset?token=<span style="color:var(--accent);">a7f3b9c1d2e4...</span>
        </div>
      </div>
      <button type="button" class="btn-submit" id="btn-forgot-step2" @click="simulateForgotStep2">
        He recibido el email — Continuar
      </button>
      <div class="form-footer" style="margin-top:12px;">
        ¿No lo ves? <span class="link">Reenviar en <span id="resend-timer">{{ state.forgot.resendTimer }}</span>s</span>
      </div>
    </div>

    <!-- Paso 3: Nueva contraseña (token simulado en el enlace del paso 2) -->
    <div id="forgot-step3" :style="{ display: state.forgot.step === 3 ? 'block' : 'none' }">
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
      <form id="reset-form" novalidate @submit.prevent="simulateReset">
        <div class="field">
          <label for="new-pwd">Nueva contraseña</label>
          <input
            id="new-pwd"
            v-model="state.forgot.newPwd"
            type="password"
            placeholder="Mínimo 8 caracteres"
            autocomplete="new-password"
            :class="{ 'input-error': !!state.forgot.errors.newPwd }"
            @blur="validateNewPwd"
            @input="onResetPwdInput"
          >
          <span class="field-error" id="new-pwd-error">{{ state.forgot.errors.newPwd }}</span>
          <div class="pwd-strength">
            <div class="pwd-bar" :class="{ active: state.forgot.pwdStrength.score >= 1 }"></div>
            <div class="pwd-bar" :class="{ active: state.forgot.pwdStrength.score >= 2 }"></div>
            <div class="pwd-bar" :class="{ active: state.forgot.pwdStrength.score >= 3 }"></div>
            <div class="pwd-bar" :class="{ active: state.forgot.pwdStrength.score >= 4 }"></div>
            <span class="pwd-label">{{ state.forgot.pwdStrength.label }}</span>
          </div>
        </div>
        <div class="field">
          <label for="confirm-pwd">Confirmar contraseña</label>
          <input
            id="confirm-pwd"
            v-model="state.forgot.confirmPwd"
            type="password"
            placeholder="Repite la contraseña"
            autocomplete="new-password"
            :class="{ 'input-error': !!state.forgot.errors.confirmPwd }"
            @input="validateConfirmPwd"
          >
          <span class="field-error" id="confirm-pwd-error">{{ state.forgot.errors.confirmPwd }}</span>
        </div>
        <div id="reset-error" class="alert alert-error" :style="{ display: state.forgot.error ? 'block' : 'none' }">
          {{ state.forgot.error }}
        </div>
        <button type="submit" class="btn-submit">Establecer nueva contraseña</button>
      </form>
    </div>

  </div>
</template>
