import '../css/variables.css'
import '../css/layout.css'
import '../css/components.css'
import '../css/pages.css'

import { createApp } from 'vue'
import App from './App.vue'

const root = document.getElementById('app')
if (root) {
  createApp(App).mount(root)
}
