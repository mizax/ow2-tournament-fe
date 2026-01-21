import { createRouter, createWebHistory } from 'vue-router'
import ForbiddenView from '@/views/ForbiddenView.vue'
import NotFoundView from '@/views/NotFoundView.vue'
import AuthCallbackView from '@/views/AuthCallbackView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/components/HomeComponent.vue'),
    },
    {
      path: '/full-regulation',
      name: 'full-regulation',
      component: () => import('@/components/FullRegulation.vue'),
    },
    {
      path: '/auth/callback',
      name: 'authCallback',
      component: AuthCallbackView,
    },
    {
      path: '/401-forbidden',
      name: 'forbidden',
      component: ForbiddenView,
    },
    {
      path: '/404-not-found',
      name: 'notFound',
      component: NotFoundView,
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/404-not-found',
    },
  ],
})

export default router
