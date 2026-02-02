<script setup lang="ts">
import type { RegistrationDetailResponse, RegistrationStatus } from '@/types/registrationManager'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  actions: RegistrationDetailResponse['requested_actions']
  statusBadgeClasses: (status?: RegistrationStatus) => string
  actionStatusLabel: (status?: 'PENDING' | 'RESOLVED') => string
  formatDate: (value?: string) => string
}>()

const emit = defineEmits<{ (e: 'resolve', actionId: number): void }>()

const { t } = useI18n()
</script>

<template>
  <div class="space-y-3">
    <h3 class="text-base font-semibold tracking-tight">
      {{ t('manager.details.requested_actions.title') }}
    </h3>
    <div v-if="actions.length" class="space-y-2">
      <div
        v-for="action in actions"
        :key="action.id"
        class="rounded-md bg-muted/5 ring-1 ring-white/5 p-3 space-y-2"
      >
        <div class="flex items-center justify-between text-sm">
          <span class="text-xs uppercase tracking-wide text-muted-foreground">#{{ action.id }}</span>
          <Badge
            :class="
              statusBadgeClasses(action.status === 'RESOLVED' ? 'ACCEPTED' : 'ACTION_REQUIRED')
            "
          >
            {{ actionStatusLabel(action.status) }}
          </Badge>
        </div>
        <p class="text-sm leading-6">{{ action.description }}</p>
        <div class="flex items-center justify-between text-xs text-muted-foreground">
          <span>{{ formatDate(action.created_at) }}</span>
          <Button
            v-if="action.status === 'PENDING'"
            size="sm"
            variant="secondary"
            @click="emit('resolve', action.id)"
          >
            {{ t('manager.details.requested_actions.resolve') }}
          </Button>
        </div>
      </div>
    </div>
    <p v-else class="text-sm text-muted-foreground">
      {{ t('manager.details.requested_actions.empty') }}
    </p>
  </div>
</template>
