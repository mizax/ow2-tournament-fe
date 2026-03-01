<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { RouterLink } from 'vue-router'
import type { ManagedTournament } from '@/types/registrationManager'
import { useI18n } from 'vue-i18n'
import { EllipsisVertical } from 'lucide-vue-next'

defineProps<{ tournament: ManagedTournament }>()

const { t } = useI18n()
</script>

<template>
  <Card
    class="group relative h-full border border-border/70 bg-card/75 transition-colors hover:border-primary/25"
  >
    <div class="absolute right-3 top-6">
      <DropdownMenu>
        <DropdownMenuTrigger :as-child="true">
          <Button variant="ghost" size="icon-sm">
            <EllipsisVertical />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            :as="RouterLink"
            :to="{ name: 'manager-registrations', params: { tournamentId: tournament.id } }"
          >
            {{ t('manager.tournaments.manage') }}
          </DropdownMenuItem>
          <DropdownMenuItem
            :as="RouterLink"
            :to="{ name: 'manager-tournament-edit', params: { tournamentId: tournament.id } }"
          >
            {{ t('manager.tournaments.edit') }}
          </DropdownMenuItem>
          <DropdownMenuItem
            :as="RouterLink"
            :to="{ name: 'manager-logs', params: { tournamentId: tournament.id } }"
          >
            {{ t('manager.tournaments.load_logs') }}
          </DropdownMenuItem>
          <DropdownMenuItem
            :as="RouterLink"
            :to="{ name: 'manager-tournament-managers', params: { tournamentId: tournament.id } }"
          >
            {{ t('manager.tournaments.manage_managers') }}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>

    <CardHeader class="space-y-1">
      <CardTitle class="text-3xl leading-[0.95]">{{ tournament.title }}</CardTitle>
      <p class="text-xs text-muted-foreground">
        {{ t('manager.tournaments.id', { id: tournament.id }) }}
      </p>
      <p v-if="tournament.sef" class="text-xs text-muted-foreground">
        {{ tournament.sef }}
      </p>
    </CardHeader>
    <CardContent class="flex flex-row justify-start gap-3">
      <Badge
        v-if="tournament.status === 'draft'"
        variant="secondary"
        class="w-fit border border-border/70 bg-background/70 text-[11px] uppercase tracking-[0.08em]"
      >
        {{ t('manager.tournaments.draft') }}
      </Badge>
      <p
        v-if="typeof tournament.registration_count === 'number'"
        class="text-sm text-muted-foreground"
      >
        {{ t('manager.tournaments.registrations', { count: tournament.registration_count }) }}
      </p>
    </CardContent>
  </Card>
</template>
