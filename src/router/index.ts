import { createRouter, createWebHistory } from 'vue-router'
import ForbiddenView from '@/views/ForbiddenView.vue'
import NotFoundView from '@/views/NotFoundView.vue'
import AuthCallbackView from '@/views/AuthCallbackView.vue'
import { useAuthStore } from '@/stores/authStore'
import { toast } from 'vue-sonner'
import UserRole from '@/types/UserRole'

const defaultMeta = {
  requiresAuth: false,
  allowedRoles: [] as UserRole[],
}

const hasRequiredRoles = (authStore: ReturnType<typeof useAuthStore>, roles: UserRole[]) => {
  return roles.length === 0 || roles.some((role) => authStore.hasRole(role))
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
          component: () => import('@/views/tournament/TournamentListView.vue'),
        },
        {
          path: ':tournamentSef',
          name: 'tournament-details',
          component: () => import('@/views/tournament/TournamentDetailsLayout.vue'),
          children: [
            {
              path: '',
              name: 'tournament-details-home',
              component: () => import('@/views/tournament/TournamentDetailsView.vue'),
            },
            {
              path: 'register',
              name: 'tournament-registration',
              component: () => import('@/views/tournament/TournamentRegistrationView.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            {
              path: 'register/:registrationId',
              name: 'tournament-registration-status',
              component: () => import('@/views/tournament/TournamentRegistrationStatusView.vue'),
              meta: {
                requiresAuth: true,
              },
            },
          ],
        },
      ],
    },
    {
      path: '/tournament/:tournamentSef/match/:matchId',
      name: 'match-detail',
      component: () => import('@/views/stats/MatchDetailView.vue'),
    },
    {
      path: '/tournament/:tournamentSef/player/:playerId',
      name: 'player-profile',
      component: () => import('@/views/stats/PlayerProfileView.vue'),
    },
    {
      path: '/auth/callback',
      name: 'authCallback',
      component: AuthCallbackView,
    },
    {
      path: '/manager',
      name: 'manager-dashboard',
      component: () => import('@/views/ManagerDashboardView.vue'),
      meta: {
        requiresAuth: true,
        allowedRoles: [UserRole.ADMIN, UserRole.TOURNAMENT_MANAGER],
      },
    },
    {
      path: '/manager/tournaments/:tournamentId/registrations',
      name: 'manager-registrations',
      component: () => import('@/views/ManagerRegistrationsView.vue'),
      meta: {
        requiresAuth: true,
        allowedRoles: [UserRole.ADMIN, UserRole.TOURNAMENT_MANAGER],
      },
    },
    {
      path: '/manager/tournaments/:tournamentId/logs',
      name: 'manager-logs',
      component: () => import('@/views/ManagerLogsView.vue'),
      meta: {
        requiresAuth: true,
        allowedRoles: [UserRole.ADMIN, UserRole.TOURNAMENT_MANAGER],
      },
    },
    {
      path: '/manager/tournaments/:tournamentId/edit',
      name: 'manager-tournament-edit',
      component: () => import('@/views/ManagerTournamentEditView.vue'),
      meta: {
        requiresAuth: true,
        allowedRoles: [UserRole.ADMIN, UserRole.TOURNAMENT_MANAGER],
      },
    },
    {
      path: '/admin/users',
      name: 'admin-users',
      component: () => import('@/views/AdminUsersView.vue'),
      meta: {
        requiresAuth: true,
        allowedRoles: [UserRole.ADMIN],
      },
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
  await authStore.restoreSession()
  await authStore.waitForUser()
  const { requiresAuth, allowedRoles } = { ...defaultMeta, ...to.meta }

  if (requiresAuth && !authStore.isAuthenticated) {
    toast.error('Not authenticated')
    next('/')
    return
  }

  if (requiresAuth && !hasRequiredRoles(authStore, allowedRoles)) {
    toast.error('Access denied')
    next('/401-forbidden')
    return
  }

  next()
})

export default router
