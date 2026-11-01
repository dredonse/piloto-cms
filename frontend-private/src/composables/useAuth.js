import { computed, reactive } from 'vue'
import router from '../router'
import { useToast } from './useToast'
import { PUBLIC_APP_URL } from '../config/env'

const { toast } = useToast()

const state = reactive({
  session: {
    token: sessionStorage.getItem('token') || '',
    user: {
      id: Number(sessionStorage.getItem('user_id') || 1),
      name: sessionStorage.getItem('user_name') || 'Carlos Administrador',
      email: sessionStorage.getItem('user_email') || 'carlos@pilotocms.es',
      role: sessionStorage.getItem('user_role') || 'admin',
    },
  },
  changePwd: {
    current: '',
    next: '',
    confirm: '',
    loading: false,
  },
})

const isAdmin = computed(() => state.session.user.role === 'admin')
const initials = computed(() => {
  const parts = state.session.user.name.split(' ').filter(Boolean).slice(0, 2)
  return parts.map((p) => p[0]?.toUpperCase() || '').join('') || 'U'
})

function logout() {
  sessionStorage.removeItem('token')
  sessionStorage.removeItem('user_id')
  sessionStorage.removeItem('user_name')
  sessionStorage.removeItem('user_email')
  sessionStorage.removeItem('user_role')
  toast('Sesion cerrada')
  window.location.href = PUBLIC_APP_URL
}

function switchRole(role) {
  // --- MOCK ---
  state.session.user.role = role
  if (role === 'admin') {
    state.session.user.name = 'Carlos Administrador'
    state.session.user.email = 'carlos@pilotocms.es'
  } else {
    state.session.user.name = 'Marta López'
    state.session.user.email = 'marta@ejemplo.com'
  }
  router.push(role === 'admin' ? '/admin' : '/user')
}

async function changePassword() {
  const { current, next, confirm } = state.changePwd
  if (!current || !next || !confirm) {
    toast('Completa todos los campos')
    return false
  }
  if (next !== confirm) {
    toast('Las contraseñas no coinciden')
    return false
  }
  if (next.length < 8) {
    toast('Minimo 8 caracteres')
    return false
  }

  state.changePwd.loading = true
  // --- MOCK ---
  await new Promise((resolve) => setTimeout(resolve, 800))
  state.changePwd.loading = false

  toast('✓ Contraseña actualizada correctamente', 'success')
  state.changePwd.current = ''
  state.changePwd.next = ''
  state.changePwd.confirm = ''
  return true
}

export function useAuth() {
  return {
    state,
    isAdmin,
    initials,
    logout,
    switchRole,
    changePassword,
  }
}
