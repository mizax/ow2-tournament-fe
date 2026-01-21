<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useI18n } from 'vue-i18n'
import { handleApiResponse } from '@/services/apiService.ts'

const router = useRouter()
const authStore = useAuthStore()
const { t, te } = useI18n({ useScope: 'global' })

onMounted(async () => {
  try {
    // Get all query parameters from the URL
    const queryParams = new URLSearchParams(window.location.search)

    // Create a request to the backend callback endpoint
    const response = await fetch(
      `/api/public/v1/auth/battlenet/callback?${queryParams.toString()}`,
      {
        method: 'GET',
      },
    )

    if (!response.ok) {
      const errorResponse = await handleApiResponse(response)
      throw new Error(errorResponse.errorCode || 'unknown_error')
    }

    const data = await response.json()

    authStore.login(data.id_token, data.user)
    console.log('authResponse', data)

    // Redirect to home page after successful authentication
    await router.push('/')
  } catch (error: unknown) {
    console.error('Authentication error:', error)
    // Redirect to the login page on error
    const errorMessage = error instanceof Error ? error.message : 'unknown_error'
    // TODO: really?
    await router.push(`/login?error=${errorMessage}`)
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
