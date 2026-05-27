<script setup>
import { useAuth } from '../composables/useAuth'

const { state, changePassword } = useAuth()
</script>

<template>
  <section class="page page-active">
    <div class="page-header">
      <div class="page-title">Mi perfil</div>
      <div class="page-subtitle">Tu información personal y configuración de cuenta.</div>
    </div>

    <div class="profile-layout">
      <div class="profile-card">
        <div class="profile-avatar">ML</div>
        <div class="profile-name">{{ state.session.user.name }}</div>
        <div class="profile-email">{{ state.session.user.email }}</div>
        <div class="badge badge-user">Usuario</div>
      </div>

      <div>
        <div class="card">
          <div class="card-header"><div class="card-title">Mis datos</div></div>
          <div class="card-body">
            <div class="field"><label>Nombre</label><input :value="state.session.user.name" type="text" /></div>
            <div class="field"><label>Correo electrónico</label><input :value="state.session.user.email" type="email" disabled /></div>
          </div>
        </div>

        <div class="card mt-12">
          <div class="card-header"><div class="card-title">Cambiar contraseña</div></div>
          <div class="card-body">
            <div class="field"><label>Contraseña actual</label><input v-model="state.changePwd.current" type="password" /></div>
            <div class="field"><label>Nueva contraseña</label><input v-model="state.changePwd.next" type="password" /></div>
            <div class="field"><label>Confirmar nueva contraseña</label><input v-model="state.changePwd.confirm" type="password" /></div>
            <button class="btn btn-primary-sm full" :disabled="state.changePwd.loading" @click="changePassword">
              {{ state.changePwd.loading ? 'Actualizando...' : 'Actualizar contraseña' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
