import '../css/variables.css'
import '../css/layout.css'
import '../css/components.css'
import '../css/pages.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

createApp(App).use(router).mount('#app')
