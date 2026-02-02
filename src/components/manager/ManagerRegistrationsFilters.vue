<script setup lang="ts">
import { computed } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { RefreshCcw, RotateCcw, Settings } from 'lucide-vue-next'
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
  (e: 'update:selectedStatuses', value: RegistrationStatus[]): void
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

const localSelectedStatuses = computed({
  get: () => props.selectedStatuses,
  set: (value: RegistrationStatus[]) => emit('update:selectedStatuses', value),
})

const selectedStatusLabel = computed(() => {
  if (!props.selectedStatuses.length) {
    return t('manager.registrations.filters.status_placeholder')
  }
  if (props.selectedStatuses.length <= 2) {
    return props.selectedStatuses
      .map((status) => t(`manager.statuses.${status.toLowerCase()}`))
      .join(', ')
  }
  return t('manager.registrations.filters.status_selected', {
    count: props.selectedStatuses.length,
  })
})

const isDesktop = useMediaQuery('(min-width: 640px)')
</script>

<template>
  <details :open="isDesktop" class="rounded-lg bg-muted/5 ring-1 ring-white/5 p-3">
    <summary
      class="sm:hidden text-sm font-semibold tracking-tight list-none flex items-center justify-between cursor-pointer select-none"
    >
      <span>{{ t('manager.registrations.filters.title') }}</span>
      <span class="text-xs uppercase tracking-wide text-muted-foreground">
        {{ selectedStatusLabel }}
      </span>
    </summary>
    <div class="space-y-3 pt-3 sm:pt-0">
      <div class="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-end">
        <div class="flex-1 space-y-1">
          <Label class="text-xs uppercase text-muted-foreground">
            {{ t('manager.registrations.filters.search_label') }}
          </Label>
          <Input
            v-model="localBattletag"
            :placeholder="t('manager.registrations.filters.search_placeholder')"
          />
        </div>
        <div class="min-w-0 sm:min-w-[220px] space-y-1">
          <Label class="text-xs uppercase text-muted-foreground">
            {{ t('manager.registrations.filters.status_label') }}
          </Label>
          <Select v-model="localSelectedStatuses" multiple>
            <SelectTrigger class="w-full">
              <SelectValue :placeholder="t('manager.registrations.filters.status_placeholder')">
                {{ selectedStatusLabel }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="status in props.statusOptions"
                :key="status"
                :value="status"
              >
                {{ t(`manager.statuses.${status.toLowerCase()}`) }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div class="flex flex-wrap gap-2">
          <Popover>
            <PopoverTrigger as-child>
              <Button
                variant="outline"
                size="icon"
                :aria-label="t('manager.registrations.filters.show_settings')"
              >
                <Settings class="size-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" class="w-72 space-y-3">
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
            </PopoverContent>
          </Popover>
          <Button
            variant="secondary"
            size="icon"
            :aria-label="t('manager.registrations.filters.reset')"
            @click="emit('reset')"
          >
            <RotateCcw class="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            :aria-label="t('manager.registrations.filters.refresh')"
            @click="emit('refresh')"
          >
            <RefreshCcw class="size-4" />
          </Button>
        </div>
      </div>
    </div>
  </details>
</template>
