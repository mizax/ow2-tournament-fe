<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { Trophy } from 'lucide-vue-next'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'

const { t } = useI18n()
</script>

<template>
  <div class="container mx-auto py-10 px-4">
    <h1 class="text-2xl font-semibold tracking-tight text-center mb-8">
      {{ t('tournament.list.title') }}
    </h1>
    <Empty class="mx-auto max-w-lg rounded-2xl border border-dashed border-border/60 bg-muted/20 p-8 text-center">
      <EmptyHeader class="items-center">
        <EmptyMedia variant="icon">
          <Trophy class="size-6" />
        </EmptyMedia>
      </EmptyHeader>
      <EmptyTitle>{{ t('tournament.list.empty_title') }}</EmptyTitle>
      <EmptyDescription>{{ t('tournament.list.empty_description') }}</EmptyDescription>
    </Empty>
  </div>
</template>

<style scoped></style>
