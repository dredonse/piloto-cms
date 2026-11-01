<script setup>
import { computed } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import { useAuth } from './composables/useAuth'
import { useToast } from './composables/useToast'
import { useUsers } from './composables/useUsers'
import { IS_DEVELOPMENT } from './config/env'

const route = useRoute()
const router = useRouter()
const { state: authState, isAdmin, initials, switchRole, logout } = useAuth()
const { toasts } = useToast()
const { totals } = useUsers()

const titleMap = {
  admin: 'Dashboard',
  user: 'Mi perfil',
}

const topbarTitle = computed(() => titleMap[route.name] || 'Área privada')

function goAdmin() {
  router.push('/admin')
}

function goUser() {
  router.push('/user')
}
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar-logo">
      <div class="logo-mark">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <rect x="1" y="1" width="5" height="5" rx="1.5" fill="white" />
          <rect x="8" y="1" width="5" height="5" rx="1.5" fill="white" opacity=".7" />
          <rect x="1" y="8" width="5" height="5" rx="1.5" fill="white" opacity=".7" />
          <rect x="8" y="8" width="5" height="5" rx="1.5" fill="white" opacity=".4" />
        </svg>
      </div>
      <div>
        <div class="sidebar-brand">Piloto CMS</div>
        <div class="sidebar-version">v1.0 · PILOTO</div>
      </div>
    </div>

    <div class="sidebar-section" v-if="isAdmin">
      <div class="sidebar-label">Administración</div>
      <button class="nav-item" :class="{ active: route.name === 'admin' }" @click="goAdmin">Dashboard + Usuarios</button>
    </div>
    <div class="sidebar-section" v-else>
      <div class="sidebar-label">Mi cuenta</div>
      <button class="nav-item" :class="{ active: route.name === 'user' }" @click="goUser">Perfil y contraseña</button>
    </div>

    <div class="role-switcher">
      <div class="role-switcher-label">Vista prototipo</div>
      <div class="role-btns">
        <button class="role-btn" :class="{ 'active-admin': authState.session.user.role === 'admin' }" @click="switchRole('admin')">Admin</button>
        <button class="role-btn" :class="{ 'active-user': authState.session.user.role === 'user' }" @click="switchRole('user')">Usuario</button>
      </div>
      <div v-if="IS_DEVELOPMENT" style="margin-top:8px;">
        <button class="role-btn" style="width:100%;" @click="router.push('/dev-login')">Cambiar rol (dev)</button>
      </div>
    </div>

    <div class="sidebar-footer">
      <div class="user-chip">
        <div class="avatar" :class="isAdmin ? 'avatar-admin' : 'avatar-user'">{{ initials }}</div>
        <div>
          <div class="user-name">{{ authState.session.user.name }}</div>
          <div class="user-role">{{ isAdmin ? 'Administrador' : 'Usuario' }}</div>
        </div>
        <button class="logout-btn" @click="logout">Salir</button>
      </div>
    </div>
  </aside>

  <div class="main">
    <div class="topbar">
      <div class="topbar-title">{{ topbarTitle }}</div>
      <div class="topbar-actions">
        <span class="badge" :class="isAdmin ? 'badge-admin' : 'badge-user'">{{ isAdmin ? 'Admin' : 'Usuario' }}</span>
        <span class="badge badge-active">{{ totals.total }} usuarios</span>
      </div>
    </div>
    <RouterView />
  </div>

  <div class="toaster">
    <div v-for="item in toasts" :key="item.id" class="toast" :class="item.type === 'success' ? 'toast-success' : ''">
      {{ item.message }}
    </div>
  </div>
</template>
