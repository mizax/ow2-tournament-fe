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
</script>

<template>
  <Card
    class="group overflow-hidden gap-4 border border-border/70 bg-card/75 transition duration-200 transform-gpu will-change-transform hover:border-primary/25"
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
      <div class="flex justify-between items-baseline">
        <div v-if="tournament.prize_pool">
          <span class="text-xs uppercase tracking-[0.08em] text-muted-foreground/85"
            >{{ t('tournament.hero.prize_pool') }}:
          </span>
          <span class="ml-1 text-sm font-semibold text-foreground">{{
            tournament.prize_pool
          }}</span>
        </div>
        <Button
          class="px-0 text-sm text-primary hover:text-primary/80 hover:no-underline"
          :as="RouterLink"
          variant="link"
          :to="`/tournament/${tournament.uri}`"
        >
          {{ t('tournament_card.details') }}
          <span class="transition-transform group-hover:translate-x-0.5">→</span>
        </Button>
      </div>
    </CardContent>
  </Card>
</template>
