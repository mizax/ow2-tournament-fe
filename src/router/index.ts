import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/components/WaiterComponent.vue'),
    },
    {
      path: '/full-regulation',
      name: 'full-regulation',
      component: () => import('@/components/FullRegulation.vue'),
    }
  ],
})

export default router
