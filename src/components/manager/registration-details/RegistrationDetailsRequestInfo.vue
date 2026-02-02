<script setup lang="ts">
import type { RegistrationDetailResponse } from '@/types/registrationManager'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  registration: RegistrationDetailResponse['registration']
  formatDate: (value?: string) => string
}>()

const { t } = useI18n()
</script>

<template>
  <div class="space-y-3">
    <h3 class="text-base font-semibold tracking-tight">
      {{ t('manager.details.info.title') }}
    </h3>
    <div class="grid gap-2 text-sm">
      <div class="flex items-center justify-between">
        <span class="text-[0.7rem] uppercase tracking-wide text-muted-foreground">
          {{ t('manager.details.info.rules_accepted') }}
        </span>
        <span class="text-sm font-medium">
          {{
            registration.rules_accepted
              ? t('manager.details.info.yes')
              : t('manager.details.info.no')
          }}
        </span>
      </div>
      <div v-if="registration.decline_reason" class="flex items-center justify-between">
        <span class="text-[0.7rem] uppercase tracking-wide text-muted-foreground">
          {{ t('manager.details.info.decline_reason') }}
        </span>
        <span class="text-right text-sm">{{ registration.decline_reason }}</span>
      </div>
      <div class="flex items-center justify-between">
        <span class="text-[0.7rem] uppercase tracking-wide text-muted-foreground">{{
          t('manager.details.info.ip_address')
        }}</span>
        <span class="text-sm">
          {{ registration.ip_address || t('manager.common.not_available') }}
        </span>
      </div>
      <div class="flex items-center justify-between">
        <span class="text-[0.7rem] uppercase tracking-wide text-muted-foreground">{{
          t('manager.details.info.user_agent')
        }}</span>
        <span class="text-right text-xs leading-5 text-muted-foreground">
          {{ registration.user_agent || t('manager.common.not_available') }}
        </span>
      </div>
    </div>
    <div class="flex items-center justify-between">
      <span class="text-[0.7rem] uppercase tracking-wide text-muted-foreground">
        {{ t('manager.details.summary.created') }}
      </span>
      <span class="text-sm">{{ formatDate(registration.created_at) }}</span>
    </div>
    <div class="flex items-center justify-between">
      <span class="text-[0.7rem] uppercase tracking-wide text-muted-foreground">
        {{ t('manager.details.summary.updated') }}
      </span>
      <span class="text-sm">{{ formatDate(registration.updated_at) }}</span>
    </div>
  </div>
</template>
