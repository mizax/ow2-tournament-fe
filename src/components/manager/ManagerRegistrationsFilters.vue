<script setup lang="ts">
import { computed } from 'vue'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { RegistrationStatus } from '@/types/registrationManager'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  battletagSearch: string
  sortValue: string
  perPageValue: string
  perPageOptions: number[]
  sortOptions: { value: string; label: string }[]
  statusOptions: RegistrationStatus[]
  selectedStatuses: RegistrationStatus[]
}>()

const emit = defineEmits<{
  (e: 'update:battletagSearch', value: string): void
  (e: 'update:sortValue', value: string): void
  (e: 'update:perPageValue', value: string): void
  (e: 'toggleStatus', status: RegistrationStatus, checked: boolean): void
  (e: 'reset'): void
  (e: 'refresh'): void
}>()

const { t } = useI18n()

const localBattletag = computed({
  get: () => props.battletagSearch,
  set: (value: string) => emit('update:battletagSearch', value),
})

const localSort = computed({
  get: () => props.sortValue,
  set: (value: string) => emit('update:sortValue', value),
})

const localPerPage = computed({
  get: () => props.perPageValue,
  set: (value: string) => emit('update:perPageValue', value),
})
</script>

<template>
  <div class="rounded-lg border bg-card p-4 space-y-4">
    <div class="grid gap-4 md:grid-cols-[2fr_1fr_1fr]">
      <div class="space-y-1">
        <Label class="text-xs uppercase text-muted-foreground">
          {{ t('manager.registrations.filters.search_label') }}
        </Label>
        <Input
          v-model="localBattletag"
          :placeholder="t('manager.registrations.filters.search_placeholder')"
        />
      </div>
      <div class="space-y-1">
        <Label class="text-xs uppercase text-muted-foreground">
          {{ t('manager.registrations.filters.sort.label') }}
        </Label>
        <Select v-model="localSort">
          <SelectTrigger>
            <SelectValue :placeholder="t('manager.registrations.filters.sort.placeholder')" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="option in props.sortOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div class="space-y-1">
        <Label class="text-xs uppercase text-muted-foreground">
          {{ t('manager.registrations.filters.per_page_label') }}
        </Label>
        <Select v-model="localPerPage">
          <SelectTrigger>
            <SelectValue :placeholder="t('manager.registrations.filters.per_page_placeholder')" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="value in props.perPageOptions" :key="value" :value="String(value)">
              {{ value }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    <div class="space-y-2">
      <p class="text-xs uppercase text-muted-foreground">
        {{ t('manager.registrations.filters.status_label') }}
      </p>
      <div class="flex flex-wrap gap-4">
        <Label
          v-for="status in props.statusOptions"
          :key="status"
          class="flex items-center gap-2 text-sm"
        >
          <Checkbox
            :model-value="props.selectedStatuses.includes(status)"
            class="bg-input/50"
            @update:model-value="(value) => emit('toggleStatus', status, value === true)"
          />
          <span>{{ t(`manager.statuses.${status.toLowerCase()}`) }}</span>
        </Label>
      </div>
    </div>

    <div class="flex flex-wrap items-center gap-2">
      <Button variant="secondary" size="sm" @click="emit('reset')">
        {{ t('manager.registrations.filters.reset') }}
      </Button>
      <Button variant="outline" size="sm" @click="emit('refresh')">
        {{ t('manager.registrations.filters.refresh') }}
      </Button>
    </div>
  </div>
</template>
