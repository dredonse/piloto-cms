import { computed, reactive } from 'vue'
import { useToast } from './useToast'

const { toast } = useToast()

const state = reactive({
  users: [
    { id: 1, name: 'Carlos Administrador', email: 'carlos@pilotocms.es', role: 'admin', auth: 'email', date: '01/01/2026', active: true },
    { id: 2, name: 'Marta López', email: 'marta@ejemplo.com', role: 'user', auth: 'email', date: '19/04/2026', active: true },
    { id: 3, name: 'Roberto Pérez', email: 'roberto@mail.es', role: 'user', auth: 'google', date: '15/03/2026', active: true },
    { id: 4, name: 'Ana García', email: 'ana@empresa.com', role: 'user', auth: 'email', date: '10/03/2026', active: false },
    { id: 5, name: 'Luis Fernández', email: 'luis@correo.net', role: 'admin', auth: 'email', date: '05/02/2026', active: true },
    { id: 6, name: 'Elena Martínez', email: 'elena@web.es', role: 'user', auth: 'google', date: '28/01/2026', active: true },
    { id: 7, name: 'Javier Torres', email: 'javier@demo.es', role: 'user', auth: 'email', date: '20/01/2026', active: false },
    { id: 8, name: 'Sofía Ramírez', email: 'sofia@test.com', role: 'user', auth: 'email', date: '12/01/2026', active: true },
  ],
  query: '',
  roleFilter: '',
  modalMode: 'create',
  modalOpen: false,
  deleteOpen: false,
  deleteTarget: null,
  form: {
    id: null,
    name: '',
    surname: '',
    email: '',
    role: 'user',
    password: '',
  },
})

const totals = computed(() => {
  const total = state.users.length
  const active = state.users.filter((u) => u.active).length
  const admin = state.users.filter((u) => u.role === 'admin').length
  const user = state.users.filter((u) => u.role === 'user').length
  return { total, active, admin, user }
})

const filteredUsers = computed(() => {
  const q = state.query.trim().toLowerCase()
  return state.users.filter((u) => {
    const byText = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    const byRole = !state.roleFilter || u.role === state.roleFilter
    return byText && byRole
  })
})

const dashboardRecentUsers = computed(() => state.users.slice(0, 5))
const chartData = computed(() => [2, 5, 3, 8, 4, 6, 3])

function initials(name) {
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()
}

function openCreateModal() {
  state.modalMode = 'create'
  state.form = { id: null, name: '', surname: '', email: '', role: 'user', password: '' }
  state.modalOpen = true
}

function openEditModal(user) {
  const parts = user.name.split(' ')
  state.modalMode = 'edit'
  state.form = {
    id: user.id,
    name: parts[0] || '',
    surname: parts.slice(1).join(' ') || '',
    email: user.email,
    role: user.role,
    password: '',
  }
  state.modalOpen = true
}

function closeModal() {
  state.modalOpen = false
}

async function saveUser() {
  if (!state.form.name || !state.form.email) {
    toast('Completa los campos obligatorios')
    return
  }

  // Misma regla que la API: al crear, la contraseña es obligatoria (mínimo 8);
  // al editar, vacía significa "no cambiarla".
  const pwd = state.form.password
  if (state.modalMode === 'create' && !pwd) {
    toast('Define una contraseña para el nuevo usuario')
    return
  }
  if (pwd && pwd.length < 8) {
    toast('La contraseña debe tener al menos 8 caracteres')
    return
  }

  // --- MOCK ---
  await new Promise((resolve) => setTimeout(resolve, 600))

  const fullName = `${state.form.name} ${state.form.surname}`.trim()
  if (state.modalMode === 'edit') {
    const idx = state.users.findIndex((u) => u.id === state.form.id)
    if (idx >= 0) {
      state.users[idx] = { ...state.users[idx], name: fullName, email: state.form.email, role: state.form.role }
    }
  } else {
    state.users.unshift({
      id: Math.max(...state.users.map((u) => u.id)) + 1,
      name: fullName,
      email: state.form.email,
      role: state.form.role,
      auth: 'email',
      date: new Date().toLocaleDateString('es-ES'),
      active: true,
    })
  }

  closeModal()
  toast('✓ Usuario guardado correctamente', 'success')
}

function openDeleteModal(user) {
  state.deleteTarget = user
  state.deleteOpen = true
}

function closeDeleteModal() {
  state.deleteOpen = false
  state.deleteTarget = null
}

async function confirmDelete() {
  if (!state.deleteTarget) return
  // --- MOCK ---
  await new Promise((resolve) => setTimeout(resolve, 400))
  state.users = state.users.filter((u) => u.id !== state.deleteTarget.id)
  toast('Usuario eliminado')
  closeDeleteModal()
}

export function useUsers() {
  return {
    state,
    totals,
    filteredUsers,
    dashboardRecentUsers,
    chartData,
    initials,
    openCreateModal,
    openEditModal,
    closeModal,
    saveUser,
    openDeleteModal,
    closeDeleteModal,
    confirmDelete,
  }
}
