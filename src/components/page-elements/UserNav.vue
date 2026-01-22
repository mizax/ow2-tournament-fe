<script setup lang="ts">
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/authStore.ts'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { useAuthReady } from '@/composables/useAuthReady'

const { t } = useI18n()
const authStore = useAuthStore()
const { isAuthenticated, user } = storeToRefs(authStore)
const { authorize } = authStore
const authReady = useAuthReady()

const userInitials = computed(() => {
  if (!user.value?.battletag) return '??'
  return user.value.battletag.substring(0, 2).toUpperCase()
})
</script>

<template>
  <div v-if="authReady">
    <div v-if="isAuthenticated && user" class="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger class="cursor-pointer ml-5 flex items-center gap-1">
          <Avatar class="h-8 w-8">
            <AvatarFallback>{{ userInitials }}</AvatarFallback>
          </Avatar>
          <span class="text-sm font-medium">{{ user.battletag }}</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem @click="authStore.logout()">{{ t('nav.logout') }}</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
    <Button
      v-else
      variant="default"
      class="bg-(--bnet-color) hover:bg-(--bnet-color) cursor-pointer"
      @click="authorize"
    >
      {{ t('nav.login') }}
    </Button>
  </div>
</template>

<style scoped>
* {
  --bnet-color: oklch(0.5672 0.186074 254.8927);
}
</style>
