<script setup lang="ts">
import { format } from 'date-fns'
import type { Tournament } from '@/types/tournament.ts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { DATE_FORMAT } from '@/util/date.ts'
import { computed } from 'vue'

const { t } = useI18n()

const props = defineProps<{
  tournament: Tournament
}>()

const startDate = props.tournament.dates[0]!
const endDate = props.tournament.dates[props.tournament.dates.length - 1]!

const tournamentStatus = computed<'upcoming' | 'ongoing' | 'finished'>(() => {
  if (props.tournament.status) {
    return props.tournament.status
  }

  const now = Date.now()
  const start = new Date(startDate).getTime()
  const end = new Date(endDate).getTime()

  if (!Number.isNaN(end) && end < now) {
    return 'finished'
  }
  if (!Number.isNaN(start) && start > now) {
    return 'upcoming'
  }
  return 'ongoing'
})

const podium = computed(() => {
  if (tournamentStatus.value !== 'finished') {
    return []
  }
  return (props.tournament.podium ?? []).slice(0, 3)
})

const podiumPlaceClass = (place: number): string => {
  if (place === 1)
    return 'bg-amber-500/15 text-amber-700 border-amber-600/40 dark:text-amber-300 dark:border-amber-400/40'
  if (place === 2)
    return 'bg-slate-300/15 text-slate-700 border-slate-500/35 dark:text-slate-200 dark:border-slate-300/40'
  return 'bg-orange-500/15 text-orange-700 border-orange-600/40 dark:text-orange-300 dark:border-orange-400/40'
}
</script>

<template>
  <Card
    class="overflow-hidden gap-4 border border-border/70 bg-card/75 transition duration-200 transform-gpu will-change-transform hover:border-primary/25"
  >
    <CardHeader>
      <CardTitle
        class="max-w-full truncate max-sm:text-2xl text-3xl font-semibold leading-[0.95]"
        :title="tournament.title"
        >{{ tournament.title }}</CardTitle
      >
      <div class="flex flex-wrap gap-2 pt-1.5">
        <span class="chip">{{ t(`tournament.status.${tournamentStatus}`) }}</span>
        <span class="chip">{{ tournament.discipline }}</span>
        <span class="chip">{{ tournament.format }}</span>
        <span v-if="(tournament.registration_count ?? 0) > 0" class="chip">
          {{ t('tournament_card.registrations', { count: tournament.registration_count }) }}
        </span>
      </div>
    </CardHeader>
    <CardContent class="flex flex-col justify-between gap-3">
      <span class="text-sm text-muted-foreground/90">
        {{ format(startDate, DATE_FORMAT) }} - {{ format(endDate, DATE_FORMAT) }}
      </span>
      <div v-if="podium.length > 0" class="space-y-1.5 rounded-lg border border-border/60 bg-muted/20 p-3">
        <p class="text-xs uppercase tracking-[0.08em] text-muted-foreground/85">
          {{ t('tournament_card.podium_title') }}
        </p>
        <ul class="space-y-1.5">
          <li
            v-for="place in podium"
            :key="`${tournament.uri}-${place.place}`"
            class="flex items-center justify-between gap-3"
          >
            <span
              :class="[
                'inline-flex items-center rounded-md border px-2 py-1 text-xs font-semibold',
                podiumPlaceClass(place.place),
              ]"
            >
              {{ t('tournament_card.podium_place', { place: place.place }) }}
            </span>
            <span
              :class="[
                'text-sm text-foreground',
                place.place === 1 ? 'font-semibold' : 'font-medium text-foreground/90',
              ]"
            >
              {{ place.team_name }}
            </span>
          </li>
        </ul>
      </div>
      <div
        :class="['flex items-center', tournament.prize_pool ? 'justify-between' : 'justify-end']"
      >
        <div v-if="tournament.prize_pool">
          <span class="text-xs uppercase tracking-[0.08em] text-muted-foreground/85"
            >{{ t('tournament.hero.prize_pool') }}:
          </span>
          <span class="ml-1 text-sm font-semibold text-foreground">{{
            tournament.prize_pool
          }}</span>
        </div>
        <Button size="sm" :as="RouterLink" variant="default" :to="`/tournament/${tournament.uri}`">
          {{ t('tournament_card.details') }}
        </Button>
      </div>
    </CardContent>
  </Card>
</template>
