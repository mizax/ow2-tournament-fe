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
  <div class="flex flex-col gap-2">
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
    <div>
      <h1 class="text-2xl font-semibold tracking-tight">
        {{ props.title || t('manager.registrations.title') }}
      </h1>
      <p class="text-sm text-muted-foreground">
        {{ t('manager.registrations.tournament_id', { id: props.tournamentId }) }}
      </p>
    </div>
  </div>
</template>
