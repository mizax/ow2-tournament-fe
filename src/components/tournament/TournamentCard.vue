<script setup lang="ts">
import { format } from 'date-fns'
import type { Tournament } from '@/types/tournament.ts'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { DATE_FORMAT } from '@/util/date.ts'

const { t } = useI18n()

const props = defineProps<{
  tournament: Tournament
}>()

const startDate = props.tournament.dates[0]!
const endDate = props.tournament.dates[props.tournament.dates.length - 1]!
</script>

<template>
  <Card class="overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg gap-4">
    <CardHeader>
      <CardTitle class="text-3xl font-semibold tracking-tight leading-[1.05] truncate" :title="tournament.title">{{ tournament.title }}</CardTitle>
      <div class="flex gap-2 pt-1">
        <span class="chip">{{ tournament.discipline }}</span>
        <span class="chip">{{ tournament.format }}</span>
      </div>
    </CardHeader>
    <CardContent class="flex flex-col justify-between gap-3">
      <span class="text-sm text-muted-foreground">
        {{ format(startDate, DATE_FORMAT) }} - {{ format(endDate, DATE_FORMAT) }}
      </span>
      <div class="flex justify-between items-baseline">
        <div v-if="tournament.prize_pool">
          <span class="text-sm text-muted-foreground/80">{{ t('tournament.hero.prize_pool') }}: </span>
          <span class="text-sm font-medium text-foreground">{{ tournament.prize_pool }}</span>
        </div>
        <Button
          class="text-sm text-muted-foreground hover:text-foreground hover:underline underline-offset-4 group px-0 gap-0"
          :as="RouterLink"
          variant="link"
          :to="`/tournament/${tournament.uri}`"
        >
          {{ t('tournament_card.details') }} →
        </Button>
      </div>
    </CardContent>
  </Card>
</template>
