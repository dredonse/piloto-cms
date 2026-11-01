<script setup>
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const { state } = useAuth()

function goToLogin() {
  router.push({ name: 'login' })
}

function goToRegister() {
  router.push({ name: 'register' })
}
</script>

<template>
  <div style="display:flex; flex-direction:column; align-items:center; width:100%; padding:80px 2rem 60px;">

    <div class="home-eyebrow">Sistema de gestión de usuarios</div>

    <h1 class="home-title">
      Gestión de acceso<br>
      <strong>inteligente y segura</strong>
    </h1>

    <p class="home-subtitle">
      Una plataforma base para tu CMS. Registro, autenticación, roles y control de acceso en una arquitectura lista para crecer.
    </p>

    <div class="stat-inline">
      <span class="stat-dot"></span>
      <span class="stat-inline-num" id="stat-users">{{ state.statsUsers }}</span>
      <span class="stat-inline-label">usuarios registrados</span>
    </div>

    <div class="home-actions">
      <button type="button" class="btn-primary" id="home-btn-register" @click="goToRegister">Crear cuenta gratuita</button>
      <button type="button" class="btn-secondary" id="home-btn-login" @click="goToLogin">Iniciar sesion →</button>
    </div>

    <div class="features-grid">
      <div class="feature-card">
        <div class="feature-icon">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="6" r="3.5" stroke="#C9540A" stroke-width="1.5"/>
            <path d="M2 16c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke="#C9540A" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </div>
        <div class="feature-title">Registro y autenticación</div>
        <div class="feature-desc">Login tradicional y con Google OAuth, contraseñas hasheadas con bcrypt.</div>
      </div>
      <div class="feature-card">
        <div class="feature-icon">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <rect x="3" y="8" width="12" height="8" rx="2" stroke="#C9540A" stroke-width="1.5"/>
            <path d="M6 8V6a3 3 0 016 0v2" stroke="#C9540A" stroke-width="1.5" stroke-linecap="round"/>
            <circle cx="9" cy="12" r="1.5" fill="#C9540A"/>
          </svg>
        </div>
        <div class="feature-title">Control de roles</div>
        <div class="feature-desc">Permisos diferenciados para administradores y usuarios estándar.</div>
      </div>
      <div class="feature-card">
        <div class="feature-icon">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M9 2L11.472 7.106L17 7.764L13 11.694L14.04 17L9 14.25L3.96 17L5 11.694L1 7.764L6.528 7.106L9 2Z" stroke="#C9540A" stroke-width="1.5" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="feature-title">Recuperación segura</div>
        <div class="feature-desc">Tokens de un solo uso con expiración para recuperar acceso.</div>
      </div>
    </div>

    <p style="font-size:11px; color:var(--muted); letter-spacing:0.04em;">
      PILOTO · ENTORNO LAMP DOCKERIZADO · API REST
    </p>
  </div>
</template>
