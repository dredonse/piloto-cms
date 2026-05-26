import '../css/variables.css'
import '../css/layout.css'
import '../css/components.css'
import '../css/pages.css'

import { createApp } from 'vue'
import PageHome from './views/PageHome.vue'
import PageLogin from './views/PageLogin.vue'

const homeRoot = document.getElementById('app')
if (homeRoot) {
  createApp(PageHome).mount(homeRoot)
}

const loginRoot = document.getElementById('app-login')
if (loginRoot) {
  createApp(PageLogin).mount(loginRoot)
}
