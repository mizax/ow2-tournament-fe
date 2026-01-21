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

createApp(App)
  .use(i18n)
  .use(createPinia())
  .use(router)
  .mount('#app')
