<script setup>
import { computed, watch } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import { useAuth } from './composables/useAuth'
import { useToast } from './composables/useToast'

const route = useRoute()
const router = useRouter()
const { resetUiState } = useAuth()
const { toasts } = useToast()

const currentPageId = computed(() => `page-${route.name}`)

watch(
  () => route.fullPath,
  () => {
    window.scrollTo(0, 0)
    resetUiState()
  },
  { immediate: true },
)

function goHome() {
  router.push({ name: 'home' })
}

function goLogin() {
  router.push({ name: 'login' })
}

function goRegister() {
  router.push({ name: 'register' })
}
</script>

<template>
  <nav>
    <a class="logo" id="logo-link" href="#" @click.prevent="goHome">
      <div class="logo-mark">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <rect x="1" y="1" width="5" height="5" rx="1.5" fill="white" />
          <rect x="8" y="1" width="5" height="5" rx="1.5" fill="white" opacity=".7" />
          <rect x="1" y="8" width="5" height="5" rx="1.5" fill="white" opacity=".7" />
          <rect x="8" y="8" width="5" height="5" rx="1.5" fill="white" opacity=".4" />
        </svg>
      </div>
      Piloto CMS
    </a>

    <div style="display:flex; align-items:center; gap:8px;">
      <button class="nav-pill nav-ghost" id="nav-pill-login" type="button" @click="goLogin">
        Iniciar sesion
      </button>
      <button class="nav-pill nav-solid" id="nav-pill-register" type="button" @click="goRegister">
        Crear cuenta
      </button>
    </div>
  </nav>

  <main class="page active" :class="{ 'form-page': route.meta.formPage }" :id="currentPageId">
    <RouterView />
  </main>

  <div class="toaster" id="toaster">
    <div
      v-for="item in toasts"
      :key="item.id"
      class="toast"
      :style="{ background: item.type === 'success' ? '#1A6B3C' : undefined }"
    >
      {{ item.message }}
    </div>
  </div>

</template>
