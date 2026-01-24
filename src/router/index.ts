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
      component: () => import('@/views/HomeView.vue'),
    },
    {
      path: '/tournament',
      name: 'tournament',
      component: () => import('@/views/TournamentView.vue'),
      children: [
        {
          path: '',
          name: 'tournament-list',
          component: () => import('@/components/tournament/TournamentList.vue')
        },
        {
          path: ':tournamentSef',
          name: 'tournament-details',
          component: () => import('@/components/tournament/TournamentDetailsParent.vue'),
          children: [
            {
              path: '',
              name: 'tournament-details-home',
              component: () => import('@/components/tournament/TournamentDetails.vue'),
            },
            {
              path: 'regulation',
              name: 'tournament-regulation',
              component: () => import('@/components/common/MarkdownRenderer.vue'),
            },
            {
              path: 'register',
              name: 'tournament-registration',
              component: () => import('@/components/tournament/SubmitRequest.vue'),
            }
          ]
        }
      ]
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
