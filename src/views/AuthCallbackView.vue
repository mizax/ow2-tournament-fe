<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue-sonner'
import { fetchWithoutAuth } from '@/services/apiService.ts'
import type { User } from '@/types/User.ts'

const router = useRouter()
const authStore = useAuthStore()
const { t, te } = useI18n({ useScope: 'global' })

const showAuthError = (errorMessage: string, details?: string) => {
  const errorKeyCandidates = [`errors.${errorMessage}`, `auth_callback.${errorMessage}`]
  const resolvedKey =
    errorKeyCandidates.find((key) => te(key)) ?? 'auth_callback.authentication_failed'
  const title = t(resolvedKey)
  const trimmedDetails = details?.trim()
  if (trimmedDetails) {
    toast.error(title, { description: trimmedDetails })
  } else {
    toast.error(title)
  }
}

onMounted(async () => {
  try {
    // Get all query parameters from the URL
    const queryParams = new URLSearchParams(window.location.search)
    const state = queryParams.get('state')

    const apiResponse = await fetchWithoutAuth<
      { id_token: string; user: User },
      { error?: string; details?: string }
    >(`/api/public/v1/auth/battlenet/callback?${queryParams.toString()}`, {
      method: 'GET',
    })

    if (!apiResponse.success) {
      const errorMessage = apiResponse.errorData?.error || apiResponse.errorCode || 'unknown_error'
      showAuthError(errorMessage, apiResponse.errorData?.details)
      await router.push('/')
      return
    }

    const data = apiResponse.data!
    authStore.login(data.id_token, data.user)

    // Redirect to stored page after successful authentication
    const redirectPath = authStore.consumeRedirectPath(state)
    const safeRedirectPath = redirectPath.startsWith('/') ? redirectPath : '/'
    await router.push(safeRedirectPath)
  } catch (error: unknown) {
    console.error('Authentication error:', error)
    const errorMessage = error instanceof Error ? error.message : 'unknown_error'
    showAuthError(errorMessage)
    await router.push('/')
  }
})
</script>

<template>
  <div class="p-8 rounded-xl text-center">
    <h2 class="text-xl font-bold mb-4">{{ t('auth_callback.title') }}</h2>
    <p>{{ t('auth_callback.message') }}</p>
  </div>
</template>

<style scoped></style>
