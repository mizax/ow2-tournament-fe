import { createRouter, createWebHistory } from 'vue-router'
import ForbiddenView from '@/views/ForbiddenView.vue'
import NotFoundView from '@/views/NotFoundView.vue'
import AuthCallbackView from '@/views/AuthCallbackView.vue'
import { useAuthStore } from '@/stores/authStore'
import { toast } from 'vue-sonner'
import { useI18n } from 'vue-i18n'

const defaultMeta = {
  requiresAuth: false,
}

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
              meta: {
                requiresAuth: true,
              },
            },
            {
              path: 'register/:registrationId',
              name: 'tournament-registration-status',
              component: () => import('@/components/tournament/RegistrationStatus.vue'),
              meta: {
                requiresAuth: true,
              },
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

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  await authStore.waitForUser()
  const { requiresAuth } = { ...defaultMeta, ...to.meta }

  if (requiresAuth && !authStore.isAuthenticated) {
    toast.error("Not authenticated")
    if (from) {
      next(from)
    } else {
      next('/')
    }
    return
  }

  next()
})

export default router
