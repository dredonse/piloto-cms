<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function loginAs(role) {
  sessionStorage.clear()
  sessionStorage.setItem('token', 'mock-private-token')
  sessionStorage.setItem('user_role', role)
  sessionStorage.setItem('user_id', role === 'admin' ? '1' : '2')
  sessionStorage.setItem(
    'user_name',
    role === 'admin' ? 'Carlos Administrador' : 'Marta López',
  )
  sessionStorage.setItem(
    'user_email',
    role === 'admin' ? 'carlos@pilotocms.es' : 'marta@ejemplo.com',
  )

  router.push(role === 'admin' ? '/admin' : '/user')
}
</script>

<template>
  <section class="page page-active">
    <div class="page-header">
      <div class="page-title">Dev Login</div>
      <div class="page-subtitle">Solo disponible con VITE_APP_ENV=development</div>
    </div>

    <div class="card" style="max-width: 420px;">
      <div class="card-body">
        <p style="margin-bottom: 14px; color: var(--muted); font-size: 13px;">
          Escribe sesión mock en sessionStorage y redirige al área privada.
        </p>
        <div style="display: flex; gap: 10px;">
          <button class="btn btn-primary-sm" @click="loginAs('admin')">Entrar como admin</button>
          <button class="btn btn-ghost-sm" @click="loginAs('user')">Entrar como user</button>
        </div>
      </div>
    </div>
  </section>
</template>
