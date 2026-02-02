<script setup lang="ts">
import type { RegistrationStatus } from '@/types/registrationManager'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  isDesktop: boolean
  statusOptions: RegistrationStatus[]
  statusLabel: (status?: RegistrationStatus) => string
  localStatus: RegistrationStatus | ''
  declineReason: string
  requestedActionDescription: string
}>()

const emit = defineEmits<{
  (e: 'update:localStatus', value: RegistrationStatus | ''): void
  (e: 'update:declineReason', value: string): void
  (e: 'update:requestedActionDescription', value: string): void
  (e: 'submit'): void
}>()

const { t } = useI18n()
</script>

<template>
  <details :open="isDesktop" class="rounded-lg bg-muted/5 ring-1 ring-white/5 p-3">
    <summary
      class="sm:hidden text-base font-semibold tracking-tight list-none flex items-center justify-between cursor-pointer select-none"
    >
      <span>{{ t('manager.details.update_status.title') }}</span>
      <span class="text-xs uppercase tracking-wide text-muted-foreground">
        {{ localStatus ? statusLabel(localStatus) : '' }}
      </span>
    </summary>
    <div class="space-y-3 pt-3 sm:pt-0">
      <h3 class="hidden sm:block text-base font-semibold tracking-tight">
        {{ t('manager.details.update_status.title') }}
      </h3>
      <Select
        :model-value="localStatus"
        @update:modelValue="(value) => emit('update:localStatus', value)"
      >
        <SelectTrigger size="sm" class="w-full text-sm">
          <SelectValue :placeholder="t('manager.details.update_status.placeholder')" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem v-for="status in statusOptions" :key="status" :value="status">
            {{ statusLabel(status) }}
          </SelectItem>
        </SelectContent>
      </Select>

      <div v-if="localStatus === 'DECLINED'" class="space-y-2">
        <label class="text-xs text-muted-foreground">
          {{ t('manager.details.update_status.decline_reason') }}
        </label>
        <Textarea
          :model-value="declineReason"
          :placeholder="t('manager.details.update_status.decline_placeholder')"
          @update:modelValue="(value) => emit('update:declineReason', value)"
        />
      </div>

      <div v-if="localStatus === 'ACTION_REQUIRED'" class="space-y-2">
        <label class="text-xs text-muted-foreground">
          {{ t('manager.details.update_status.requested_action') }}
        </label>
        <Textarea
          :model-value="requestedActionDescription"
          :placeholder="t('manager.details.update_status.requested_action_placeholder')"
          @update:modelValue="(value) => emit('update:requestedActionDescription', value)"
        />
      </div>

      <Button class="w-full" size="sm" @click="emit('submit')">
        {{ t('manager.details.update_status.submit') }}
      </Button>
    </div>
  </details>
</template>
