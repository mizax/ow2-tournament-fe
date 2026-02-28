<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

const props = defineProps<{
  title?: string
  tournamentId: number
}>()

const { t } = useI18n()
</script>

<template>
  <div class="rounded-2xl border border-border/70 bg-card/70 px-5 py-5 md:px-6 md:py-6">
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink as-child>
            <RouterLink to="/manager">
              {{ t('manager.dashboard.title') }}
            </RouterLink>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>
            {{ props.title || t('manager.registrations.title') }}
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
    <div class="mt-3">
      <h1 class="text-4xl leading-[0.92] sm:text-5xl">
        {{ props.title || t('manager.registrations.title') }}
      </h1>
      <p class="mt-2 text-sm text-muted-foreground">
        {{ t('manager.registrations.tournament_id', { id: props.tournamentId }) }}
      </p>
    </div>
  </div>
</template>
