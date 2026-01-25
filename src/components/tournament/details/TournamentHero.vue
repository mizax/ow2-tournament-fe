<script setup lang="ts">
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useI18n } from 'vue-i18n'
import { format, formatDuration, intervalToDuration } from 'date-fns'
import type { Duration } from 'date-fns'
import { ru } from 'date-fns/locale'
import { DATE_FORMAT } from '@/util/date.ts'
import RegistrationSmartButton from '@/components/tournament/details/RegistrationSmartButton.vue'
import { computed, onUnmounted, ref, watchEffect } from 'vue'

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
    registration?: {
      start?: string
    }
  }
}

const props = defineProps<Props>()

const totalPrize = props.tournament.prize_pool.places.reduce((acc, curr) => acc + curr.amount, 0)
const startDate = props.tournament.schedule[0]?.date
const endDate = props.tournament.schedule[props.tournament.schedule.length - 1]?.date

const now = ref(Date.now())
let countdownTimerId: number | undefined

const registrationStartDate = computed(() => {
  if (!props.tournament.registration?.start) {
    return null
  }
  const parsed = new Date(props.tournament.registration.start)
  return Number.isNaN(parsed.getTime()) ? null : parsed
})

const isRegistrationOpen = computed(() => {
  if (!registrationStartDate.value) {
    return true
  }
  return registrationStartDate.value.getTime() <= now.value
})

const countdownLabel = computed(() => {
  if (!registrationStartDate.value) {
    return ''
  }
  const diffMs = registrationStartDate.value.getTime() - now.value
  if (diffMs <= 0) {
    return ''
  }
  const duration: Duration =
    diffMs < 1000
      ? { seconds: 1 }
      : intervalToDuration({
          start: new Date(now.value),
          end: registrationStartDate.value,
        })
  const units: Array<keyof typeof duration> = [
    'years',
    'months',
    'days',
    'hours',
    'minutes',
    'seconds',
  ]
  const nonzeroUnits = units.filter((unit) => (duration[unit] ?? 0) > 0)
  const formatUnits = (nonzeroUnits.length ? nonzeroUnits : ['seconds']).slice(0, 3) as (keyof typeof duration)[]
  return formatDuration(duration, {
    format: formatUnits,
    delimiter: ', ',
    locale: ru,
  })
})

const startCountdown = () => {
  if (countdownTimerId !== undefined) {
    return
  }
  countdownTimerId = window.setInterval(() => {
    now.value = Date.now()
  }, 1000)
}

const stopCountdown = () => {
  if (countdownTimerId === undefined) {
    return
  }
  window.clearInterval(countdownTimerId)
  countdownTimerId = undefined
}

watchEffect(() => {
  const start = registrationStartDate.value
  const current = now.value
  if (start && start.getTime() > current) {
    startCountdown()
  } else {
    stopCountdown()
  }
})

onUnmounted(stopCountdown)
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
        <div v-if="!isRegistrationOpen" class="text-right">
          <p class="text-sm text-muted-foreground">
            {{ t('tournament.hero.registration_opens_in', { time: countdownLabel }) }}
          </p>
        </div>
        <RegistrationSmartButton v-else :tournament-uri="tournament.id" />
      </div>
    </CardHeader>
  </Card>
</template>
