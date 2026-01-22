<script setup lang="ts">
import { provide, ref } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { authReadyKey } from '@/composables/useAuthReady'

const authStore = useAuthStore()
const authReady = ref(false)

provide(authReadyKey, authReady)

try {
  await (new Promise((resolve) => {setTimeout(resolve, 1000)}))
  await authStore.restoreSession()
} finally {
  authReady.value = true
}
</script>

<template>
  <slot />
</template>
