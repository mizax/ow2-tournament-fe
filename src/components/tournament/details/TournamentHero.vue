<script setup lang="ts">
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useI18n } from 'vue-i18n'
import { format } from 'date-fns'
import { DATE_FORMAT } from '@/util/date.ts'
import RegistrationSmartButton from '@/components/tournament/details/RegistrationSmartButton.vue'

const { t } = useI18n()

interface Props {
  tournament: {
    id: string
    title: string
    discipline: string
    format: string
    schedule: Array<{ date: string }>
    prize_pool: {
      currency: string
      places: Array<{ amount: number }>
    }
  }
}

const props = defineProps<Props>()

const totalPrize = props.tournament.prize_pool.places.reduce((acc, curr) => acc + curr.amount, 0)
const startDate = props.tournament.schedule[0]?.date
const endDate = props.tournament.schedule[props.tournament.schedule.length - 1]?.date
</script>

<template>
  <Card class="mb-6">
    <CardHeader>
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div class="flex flex-col justify-between gap-2">
          <CardTitle class="text-3xl font-bold mb-2">{{ tournament.title }}</CardTitle>
          <div class="flex gap-2">
            <Badge variant="secondary">{{ tournament.discipline }}</Badge>
            <Badge variant="outline">{{ tournament.format }}</Badge>
          </div>
          <p class="text-md text-muted-foreground">
            {{ format(startDate!, DATE_FORMAT) }} — {{ format(endDate!, DATE_FORMAT) }}
          </p>
          <p class="text-lg font-bold">
            {{ t('tournament.hero.prize_pool') }}: {{ totalPrize }}
            {{ tournament.prize_pool.currency }}
          </p>
        </div>
        <RegistrationSmartButton :tournament-uri="tournament.id" />
      </div>
    </CardHeader>
  </Card>
</template>
