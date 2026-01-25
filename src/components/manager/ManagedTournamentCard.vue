<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RouterLink } from 'vue-router'
import type { ManagedTournament } from '@/types/registrationManager'

defineProps<{ tournament: ManagedTournament }>()
</script>

<template>
  <Card class="h-full">
    <CardHeader class="space-y-1">
      <CardTitle class="text-lg">{{ tournament.title }}</CardTitle>
      <p class="text-xs text-muted-foreground">ID: {{ tournament.id }}</p>
      <p v-if="tournament.sef" class="text-xs text-muted-foreground">
        {{ tournament.sef }}
      </p>
    </CardHeader>
    <CardContent class="flex flex-col gap-3">
      <p v-if="typeof tournament.registration_count === 'number'" class="text-sm">
        Registrations: {{ tournament.registration_count }}
      </p>
      <Button :as="RouterLink" :to="{ name: 'manager-registrations', params: { tournamentId: tournament.id } }">
        Manage registrations
      </Button>
    </CardContent>
  </Card>
</template>
