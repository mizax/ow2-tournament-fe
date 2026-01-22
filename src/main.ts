import '@/assets/styles/main.css'

import { createApp } from 'vue'
import { createI18n } from 'vue-i18n'
import { createPinia } from 'pinia'

import App from './App.vue'
import { messages } from '@/i18n'
import router from './router'

const i18n = createI18n({
  legacy: false,
  locale: 'ru',
  messages
})

const pinia = createPinia()
const app = createApp(App)

app
  .use(i18n)
  .use(pinia)
  .use(router)
  .mount('#app')
