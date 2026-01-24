import {defineStore} from 'pinia'
import {type RemovableRef, useLocalStorage} from '@vueuse/core'
import {type ApiResponse, fetchWithAuth, fetchWithoutAuth} from '@/services/apiService'
import type { User } from "@/types/User.ts";
import type UserRole from "@/types/UserRole.ts";
import type { RouteLocationNormalizedGeneric } from 'vue-router'

interface AuthState {
  navigateToAfterSuccess: RemovableRef<Partial<RouteLocationNormalizedGeneric>>
  token: RemovableRef<string | null>
  user: User | null
  fetchingUser: Promise<ApiResponse<User>> | null
}

interface AuthUrlResponse {
    auth_url: string;
}

async function fetchAuthUrlAndRedirect(): Promise<{ success: boolean, errorCode?: string }> {
    const response = await fetchWithoutAuth<AuthUrlResponse>(
      '/api/public/v1/auth/battlenet',
    )

    if (!response.success) {
        console.error('Authentication attempt failed', response);

        return { success: false, errorCode: response.errorCode };
    }

    if (response.data?.auth_url) {
        window.location.href = response.data.auth_url;
        return { success: true };
    } else {
        console.error('No auth_url in response', response);
        return { success: false, errorCode: 'missing_auth_url' };
    }
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    navigateToAfterSuccess: useLocalStorage('auth_redirect_after_success', { path: '/' }),
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
      if (navigateToAfterSuccess) {
        this.navigateToAfterSuccess = navigateToAfterSuccess
      }
      const result = await fetchAuthUrlAndRedirect()

      if (!result.success) {
        return result.errorCode || null
      }

      return null
    },

    async fetchUser(): Promise<{ success: boolean; errorCode?: string }> {
      try {
        this.fetchingUser = fetchWithAuth<User>('/api/secured/v1/user/whoami')
        const response = await this.fetchingUser

        console.log('Fetched user info', response)

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
