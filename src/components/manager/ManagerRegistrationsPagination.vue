<script setup lang="ts">
import { computed } from 'vue'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-vue-next'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  page: number
  perPage: number
  total: number
  loading: boolean
}>()

const emit = defineEmits<{
  (e: 'update:page', value: number): void
}>()

const { t } = useI18n()

const localPage = computed({
  get: () => props.page,
  set: (value: number) => emit('update:page', value),
})

const showPagination = computed(() => props.total > props.perPage)
</script>

<template>
  <div class="flex flex-col gap-3 w-full sm:flex-row sm:items-center sm:justify-between">
    <Pagination
      v-if="showPagination"
      v-model:page="localPage"
      :items-per-page="props.perPage"
      :total="props.total"
      :sibling-count="1"
      :show-edges="true"
      :disabled="props.loading"
      class="mx-auto sm:mx-0 justify-center"
    >
      <PaginationContent v-slot="{ items }">
        <PaginationPrevious>
          <ChevronLeftIcon class="size-4" />
          <span class="hidden sm:block">{{ t('manager.registrations.pagination.prev') }}</span>
        </PaginationPrevious>
        <template
          v-for="(item, index) in items"
          :key="item.type === 'page' ? `page-${item.value}` : `ellipsis-${index}`"
        >
          <PaginationItem
            v-if="item.type === 'page'"
            :value="item.value"
            :is-active="item.value === props.page"
          >
            {{ item.value }}
          </PaginationItem>
          <PaginationEllipsis v-else />
        </template>
        <PaginationNext>
          <span class="hidden sm:block">{{ t('manager.registrations.pagination.next') }}</span>
          <ChevronRightIcon class="size-4" />
        </PaginationNext>
      </PaginationContent>
    </Pagination>
    <p class="text-sm text-muted-foreground text-center sm:text-right min-w-max">
      {{ t('manager.registrations.pagination.page', { perPage: props.perPage, total: props.total }) }}
    </p>
  </div>
</template>
