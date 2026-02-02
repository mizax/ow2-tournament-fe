<script setup lang="ts">
import type { RoleValue } from '@/components/tournament/registration/types'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  isDesktop: boolean
  roleValues: RoleValue[]
  roleLabel: (role?: RoleValue | null) => string
  modelValue: Record<RoleValue, string>
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: Record<RoleValue, string>): void
  (e: 'submit'): void
}>()

const { t } = useI18n()

const updateRole = (role: RoleValue, value: string | number) => {
  emit('update:modelValue', {
    ...props.modelValue,
    [role]: value === null || value === undefined ? '' : String(value),
  })
}
</script>

<template>
  <details :open="isDesktop" class="rounded-lg bg-muted/5 ring-1 ring-white/5 p-3">
    <summary
      class="sm:hidden text-base font-semibold tracking-tight list-none flex items-center justify-between cursor-pointer select-none"
    >
      <span>{{ t('manager.details.role_rankings.title') }}</span>
      <span class="text-xs uppercase tracking-wide text-muted-foreground">
        {{ t('manager.details.role_rankings.submit') }}
      </span>
    </summary>
    <div class="space-y-3 pt-3 sm:pt-0">
      <h3 class="hidden sm:block text-base font-semibold tracking-tight">
        {{ t('manager.details.role_rankings.title') }}
      </h3>
      <div class="grid gap-2">
        <div
          v-for="role in roleValues"
          :key="role"
          class="grid items-center gap-3 sm:grid-cols-[6.5rem_minmax(0,1fr)]"
        >
          <span class="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {{ roleLabel(role) }}
          </span>
          <Input
            :model-value="modelValue[role]"
            type="number"
            min="1"
            class="h-8 text-sm"
            :placeholder="t('manager.details.role_rankings.placeholder')"
            @update:modelValue="(value) => updateRole(role, value)"
          />
        </div>
      </div>
      <Button class="w-full" size="sm" variant="secondary" @click="emit('submit')">
        {{ t('manager.details.role_rankings.submit') }}
      </Button>
    </div>
  </details>
</template>
