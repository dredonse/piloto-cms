import { createRouter, createWebHistory } from 'vue-router'
import PageHome from '../views/PageHome.vue'
import PageLogin from '../views/PageLogin.vue'
import PageRegister from '../views/PageRegister.vue'
import PageForgot from '../views/PageForgot.vue'

const routes = [
  { path: '/', name: 'home', component: PageHome, meta: { formPage: false } },
  { path: '/login', name: 'login', component: PageLogin, meta: { formPage: true } },
  { path: '/register', name: 'register', component: PageRegister, meta: { formPage: true } },
  { path: '/forgot', name: 'forgot', component: PageForgot, meta: { formPage: true } },
  { path: '/:pathMatch(.*)*', redirect: { name: 'home' } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
