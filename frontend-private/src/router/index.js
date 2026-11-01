import { createRouter, createWebHistory } from 'vue-router'
import AdminView from '../views/AdminView.vue'
import UserView from '../views/UserView.vue'
import DevLoginView from '../views/DevLoginView.vue'
import { IS_DEVELOPMENT, PUBLIC_APP_URL } from '../config/env'

const routes = [
  { path: '/', redirect: '/admin' },
  { path: '/admin', name: 'admin', component: AdminView, meta: { requiresAuth: true, role: 'admin' } },
  { path: '/user', name: 'user', component: UserView, meta: { requiresAuth: true, role: 'user' } },
]

if (IS_DEVELOPMENT) {
  routes.push({
    path: '/dev-login',
    name: 'dev-login',
    component: DevLoginView,
    meta: { requiresAuth: false, devOnly: true },
  })
}

routes.push({ path: '/:pathMatch(.*)*', redirect: '/admin' })

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const token = sessionStorage.getItem('token')
  if (to.meta.requiresAuth && !token) {
    window.location.href = PUBLIC_APP_URL
    return false
  }

  const role = sessionStorage.getItem('user_role')
  if (to.meta.role && role && to.meta.role !== role) {
    return role === 'admin' ? '/admin' : '/user'
  }

  return true
})

export default router
