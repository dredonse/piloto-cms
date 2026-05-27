<script setup>
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const { state, validateLoginEmail, validateLoginPwd, simulateLogin, simulateGoogle } = useAuth()

function goToForgot() {
  router.push({ name: 'forgot' })
}

function goToRegister() {
  router.push({ name: 'register' })
}
</script>

<template>
  <div class="form-card">

    <div class="form-header">
      <div class="form-tag">Bienvenido de nuevo</div>
      <div class="form-title">Iniciar sesión</div>
      <div class="form-subtitle">Accede a tu cuenta para continuar</div>
    </div>

    <button type="button" class="btn-google" id="btn-google-login" @click="simulateGoogle">
      <svg width="16" height="16" viewBox="0 0 24 24">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
      Continuar con Google
    </button>

    <div class="divider"><span>o con email</span></div>

    <div class="alert alert-error" id="login-error" :class="{ show: !!state.login.error }">
      {{ state.login.error }}
    </div>

    <form id="login-form" novalidate @submit.prevent="simulateLogin">
      <div class="field">
        <label for="login-email">Correo electrónico</label>
        <input
          id="login-email"
          v-model="state.login.email"
          type="email"
          placeholder="tu@email.com"
          autocomplete="email"
          :class="{ 'input-error': !!state.login.errors.email }"
          @blur="validateLoginEmail"
        >
        <span class="field-error" id="login-email-error">{{ state.login.errors.email }}</span>
      </div>
      <div class="field">
        <label for="login-pwd">Contraseña</label>
        <input
          id="login-pwd"
          v-model="state.login.pwd"
          type="password"
          placeholder="••••••••"
          autocomplete="current-password"
          :class="{ 'input-error': !!state.login.errors.pwd }"
          @blur="validateLoginPwd"
        >
        <span class="field-error" id="login-pwd-error">{{ state.login.errors.pwd }}</span>
      </div>

      <div style="text-align:right; margin-bottom:20px;">
        <button
          id="link-to-forgot"
          type="button"
          class="link"
          style="font-size:12px; background:none; border:none; padding:0;"
          @click="goToForgot"
        >
          ¿Olvidaste tu contraseña?
        </button>
      </div>

      <button type="submit" class="btn-submit" id="login-btn" :class="{ loading: state.login.loading }">
        {{ state.login.loading ? 'Verificando' : 'Entrar' }}
      </button>
    </form>

    <div class="form-footer">
      ¿No tienes cuenta?
      <a id="link-to-register" href="#" @click.prevent="goToRegister">Regístrate aquí</a>
    </div>

  </div>
</template>
