<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RouterLink } from 'vue-router'
import type { ManagedTournament } from '@/types/registrationManager'
import { useI18n } from 'vue-i18n'

defineProps<{ tournament: ManagedTournament }>()

const { t } = useI18n()
</script>

<template>
  <Card class="h-full">
    <CardHeader class="space-y-1">
      <CardTitle class="text-lg">{{ tournament.title }}</CardTitle>
      <p class="text-xs text-muted-foreground">
        {{ t('manager.tournaments.id', { id: tournament.id }) }}
      </p>
      <p v-if="tournament.sef" class="text-xs text-muted-foreground">
        {{ tournament.sef }}
      </p>
    </CardHeader>
    <CardContent class="flex flex-col gap-3">
      <p v-if="typeof tournament.registration_count === 'number'" class="text-sm">
        {{ t('manager.tournaments.registrations', { count: tournament.registration_count }) }}
      </p>
      <Button :as="RouterLink" :to="{ name: 'manager-registrations', params: { tournamentId: tournament.id } }">
        {{ t('manager.tournaments.manage') }}
      </Button>
    </CardContent>
  </Card>
</template>
