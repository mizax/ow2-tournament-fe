import {defineStore} from 'pinia'
import {type RemovableRef, useLocalStorage} from '@vueuse/core'
import {type ApiResponse, fetchWithAuth, fetchWithoutAuth} from '@/services/apiService'
import type { User } from "@/types/User.ts";
import type UserRole from "@/types/UserRole.ts";
import type { RouteLocationNormalizedGeneric } from 'vue-router'

interface AuthState {
  navigateToAfterSuccess: RemovableRef<Partial<RouteLocationNormalizedGeneric>>
  redirectStateMap: RemovableRef<Record<string, { path: string; createdAt: number }>>
  token: RemovableRef<string | null>
  user: User | null
  fetchingUser: Promise<ApiResponse<User>> | null
}

interface AuthUrlResponse {
    auth_url: string;
}

const normalizePath = (
  target?: Partial<RouteLocationNormalizedGeneric>,
): string => {
  if (target?.fullPath) {
    return target.fullPath
  }
  if (target?.path) {
    return target.path
  }
  const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`
  return currentPath || '/'
}

const REDIRECT_STATE_TTL_MS = 1000 * 60 * 60 * 6
const REDIRECT_STATE_MAX_ENTRIES = 50

const pruneRedirectStateMap = (
  map: Record<string, { path: string; createdAt: number }>,
): Record<string, { path: string; createdAt: number }> => {
  const now = Date.now()
  const entries = Object.entries(map)
    .filter(([, value]) => value?.path && now - value.createdAt <= REDIRECT_STATE_TTL_MS)
    .sort(([, a], [, b]) => b.createdAt - a.createdAt)
    .slice(0, REDIRECT_STATE_MAX_ENTRIES)

  return Object.fromEntries(entries)
}

async function fetchAuthUrl(): Promise<{ success: boolean; authUrl?: string; errorCode?: string }> {
    const response = await fetchWithoutAuth<AuthUrlResponse>(
      '/api/public/v1/auth/battlenet',
    )

    if (!response.success) {
        console.error('Authentication attempt failed', response);

        return { success: false, errorCode: response.errorCode };
    }

    if (response.data?.auth_url) {
        return { success: true, authUrl: response.data.auth_url };
    } else {
        console.error('No auth_url in response', response);
        return { success: false, errorCode: 'missing_auth_url' };
    }
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    navigateToAfterSuccess: useLocalStorage('auth_redirect_after_success', { path: '/' }),
    redirectStateMap: useLocalStorage('auth_redirect_state_map', {}),
    token: useLocalStorage('auth_token', null),
    user: null,
    fetchingUser: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    hasRole: (state) => (role: UserRole) => state.user?.roles?.includes(role) || false,
    waitForUser: (state) => async () => state.fetchingUser && (await state.fetchingUser),
  },

  actions: {
    setToken(token: string) {
      this.token = token
    },

    setUser(user: User) {
      this.user = user
    },

    async restoreSession(): Promise<{ success: boolean; errorCode?: string } | null> {
      if (!this.token) {
        return null
      }

      if (this.user) {
        return { success: true }
      }

      if (this.fetchingUser) {
        return this.fetchingUser
      }

      return await this.fetchUser()
    },

    async authorize(
      navigateToAfterSuccess?: Partial<RouteLocationNormalizedGeneric>,
    ): Promise<string | null> {
      const redirectTarget = normalizePath(navigateToAfterSuccess ?? this.navigateToAfterSuccess)

      if (navigateToAfterSuccess) {
        this.navigateToAfterSuccess = navigateToAfterSuccess
      } else {
        this.navigateToAfterSuccess = { path: redirectTarget }
      }

      const result = await fetchAuthUrl()

      if (!result.success) {
        return result.errorCode || null
      }

      if (!result.authUrl) {
        return 'missing_auth_url'
      }

      let state: string | null = null
      try {
        const url = new URL(result.authUrl)
        state = url.searchParams.get('state')
      } catch (error) {
        console.warn('Failed to parse auth_url', error)
      }

      if (state) {
        this.redirectStateMap = pruneRedirectStateMap({
          ...this.redirectStateMap,
          [state]: { path: redirectTarget, createdAt: Date.now() },
        })
      }

      window.location.href = result.authUrl
      return null
    },

    consumeRedirectPath(state?: string | null): string {
      const fallbackPath = normalizePath(this.navigateToAfterSuccess)
      this.redirectStateMap = pruneRedirectStateMap(this.redirectStateMap)

      if (!state) {
        return fallbackPath
      }

      const entry = this.redirectStateMap[state]
      if (!entry?.path) {
        return fallbackPath
      }

      const { [state]: _removed, ...rest } = this.redirectStateMap
      this.redirectStateMap = rest

      return entry.path
    },

    async fetchUser(): Promise<{ success: boolean; errorCode?: string }> {
      try {
        this.fetchingUser = fetchWithAuth<User>('/api/secured/v1/user/whoami')
        const response = await this.fetchingUser

        if (response.success && response.data) {
          this.user = response.data
          return { success: true }
        } else {
          // If the request failed, and it wasn't an auth error (which would already trigger logout in fetchWithAuth),
          // we should still log out the user as this is a critical user info fetch
          if (response.errorCode !== 'unauthorized') {
            await this.logout()
          }

          return {
            success: false,
            errorCode: response.errorCode,
          }
        }
      } finally {
        this.fetchingUser = null
      }
    },

    login(token: string, user: User) {
      this.setToken(token)
      this.setUser(user)
    },

    async logout() {
      this.token = null
      this.user = null
    },
  },
})
