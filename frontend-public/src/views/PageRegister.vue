<script setup>
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const {
  state,
  validateRegName,
  validateRegEmail,
  validateRegPwd,
  validateRegPwdConfirm,
  onRegisterPwdInput,
  simulateRegister,
  simulateGoogle,
  goToLoginFromRegisterError,
} = useAuth()

function goToLogin() {
  router.push({ name: 'login' })
}

function handlePwdInput() {
  onRegisterPwdInput()
}
</script>

<template>
  <div class="form-card">

    <div id="reg-form-state" v-show="!state.register.success">
      <div class="form-header">
        <div class="form-tag">Nuevo usuario</div>
        <div class="form-title">Crear cuenta</div>
        <div class="form-subtitle">Únete a la plataforma en menos de un minuto</div>
      </div>

      <button type="button" class="btn-google" id="btn-google-register" @click="simulateGoogle">
        <svg width="16" height="16" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Continuar con Google
      </button>

      <div class="divider"><span>o con email</span></div>

      <div class="alert alert-error" id="reg-error" :class="{ show: !!state.register.error }">
        <template v-if="state.register.error === 'Este email ya esta registrado.'">
          {{ state.register.error }}
          <button
            id="err-go-login"
            type="button"
            class="link"
            style="background:none; border:none; padding:0; margin-left:4px;"
            @click="goToLoginFromRegisterError"
          >
            Inicia sesión.
          </button>
        </template>
        <template v-else>
          {{ state.register.error }}
        </template>
      </div>

      <form id="reg-form" novalidate @submit.prevent="simulateRegister">
        <div class="field">
          <label for="reg-name">Nombre completo</label>
          <input
            id="reg-name"
            v-model="state.register.name"
            type="text"
            placeholder="Ana García"
            autocomplete="name"
            :class="{ 'input-error': !!state.register.errors.name }"
            @blur="validateRegName"
          >
          <span class="field-error" id="reg-name-error">{{ state.register.errors.name }}</span>
        </div>
        <div class="field">
          <label for="reg-email">Correo electrónico</label>
          <input
            id="reg-email"
            v-model="state.register.email"
            type="email"
            placeholder="tu@email.com"
            autocomplete="email"
            :class="{ 'input-error': !!state.register.errors.email }"
            @blur="validateRegEmail"
          >
          <span class="field-error" id="reg-email-error">{{ state.register.errors.email }}</span>
        </div>
        <div class="field">
          <label for="reg-pwd">Contraseña</label>
          <input
            id="reg-pwd"
            v-model="state.register.pwd"
            type="password"
            placeholder="Mínimo 8 caracteres"
            autocomplete="new-password"
            :class="{ 'input-error': !!state.register.errors.pwd }"
            @blur="validateRegPwd"
            @input="handlePwdInput"
          >
          <div class="pwd-strength">
            <div id="s1" class="pwd-bar" :class="{ active: state.register.pwdStrength.score >= 1 }"></div>
            <div id="s2" class="pwd-bar" :class="{ active: state.register.pwdStrength.score >= 2 }"></div>
            <div id="s3" class="pwd-bar" :class="{ active: state.register.pwdStrength.score >= 3 }"></div>
            <div id="s4" class="pwd-bar" :class="{ active: state.register.pwdStrength.score >= 4 }"></div>
            <span class="pwd-label" id="pwd-label">{{ state.register.pwdStrength.label }}</span>
          </div>
          <div class="pwd-rules">
            <div id="r-len" class="pwd-rule" :class="{ ok: state.register.pwdStrength.hasLength }">
              <span class="r-dot"></span>Mínimo 8 caracteres
            </div>
            <div id="r-upper" class="pwd-rule" :class="{ ok: state.register.pwdStrength.hasUpper }">
              <span class="r-dot"></span>Una mayúscula
            </div>
            <div id="r-num" class="pwd-rule" :class="{ ok: state.register.pwdStrength.hasNumber }">
              <span class="r-dot"></span>Un número
            </div>
          </div>
          <span class="field-error" id="reg-pwd-error">{{ state.register.errors.pwd }}</span>
        </div>
        <div class="field">
          <label for="reg-pwd-confirm">Confirmar contraseña</label>
          <input
            id="reg-pwd-confirm"
            v-model="state.register.confirmPwd"
            type="password"
            placeholder="Repite la contraseña"
            autocomplete="new-password"
            :class="{ 'input-error': !!state.register.errors.confirmPwd }"
            @input="validateRegPwdConfirm"
          >
          <span class="field-error" id="reg-pwd-confirm-error">{{ state.register.errors.confirmPwd }}</span>
        </div>

        <div class="field-check" style="margin-top:8px;">
          <input id="terms" v-model="state.register.terms" type="checkbox">
          <label for="terms">
            Acepto los <span class="link">términos de uso</span> y la <span class="link">política de privacidad</span>
          </label>
        </div>

        <button type="submit" class="btn-submit" id="reg-btn" :class="{ loading: state.register.loading }">
          {{ state.register.loading ? 'Registrando' : 'Crear cuenta' }}
        </button>
      </form>

      <div class="form-footer">
        ¿Ya tienes cuenta?
        <a id="link-to-login" href="#" @click.prevent="goToLogin">Inicia sesión</a>
      </div>
    </div>

    <div id="reg-success" class="success-state" :style="{ display: state.register.success ? 'block' : 'none' }">
      <div class="success-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M5 13l4 4L19 7" stroke="#1A6B3C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <div style="font-size:18px; font-weight:600; letter-spacing:-0.02em; margin-bottom:8px;">¡Cuenta creada!</div>
      <div style="font-size:13px; color:var(--muted); margin-bottom:24px; line-height:1.6;">
        Bienvenido/a. Tu cuenta ha sido registrada correctamente.
      </div>
      <button type="button" class="btn-submit" id="btn-success-to-login" @click="goToLogin">
        Ir a iniciar sesión →
      </button>
    </div>

  </div>
</template>
