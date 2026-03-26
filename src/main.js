/**
 * Styles
 */
import './styles/main.css'
/**
 * Scripts
 */
import { createApp } from 'vue'
import { createPinia } from 'pinia'

/**
 * Imports
 */
import App from './App.vue'
import router from './router'
import axiosPlugin from 'axios'
import { useTaskStore } from './stores/task'
import { useAuthStore } from './stores/auth'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(axiosPlugin)


app.mount('#app')
