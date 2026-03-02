<script setup lang="ts">
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { useI18n } from 'vue-i18n'
import { format, formatDuration, intervalToDuration } from 'date-fns'
import type { Duration } from 'date-fns'
import { ru } from 'date-fns/locale'
import { DATE_FORMAT } from '@/util/date.ts'
import RegistrationSmartButton from '@/components/tournament/details/RegistrationSmartButton.vue'
import { computed, onUnmounted, ref, watchEffect } from 'vue'
import CardContent from '@/components/ui/card/CardContent.vue'

const { t } = useI18n()

interface Props {
  tournament: {
    id: string
    title: string
    discipline: string
    format: string
    status?: 'upcoming' | 'ongoing' | 'finished'
    schedule: Array<{ date: string }>
    prize_pool: {
      currency: string
      places?: Array<{ amount: number }>
    }
    registration?: {
      start?: string
      deadline?: string
    }
  }
}

const props = defineProps<Props>()

const totalPrize = props.tournament.prize_pool.places?.reduce((acc, curr) => acc + curr.amount, 0) ?? 0
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

const registrationDeadlineDate = computed(() => {
  if (!props.tournament.registration?.deadline) {
    return null
  }
  const parsed = new Date(props.tournament.registration.deadline)
  return Number.isNaN(parsed.getTime()) ? null : parsed
})

const isRegistrationOpen = computed(() => {
  if (!registrationStartDate.value) {
    return true
  }
  return registrationStartDate.value.getTime() <= now.value
})

const isRegistrationClosed = computed(() => {
  if (!registrationDeadlineDate.value) {
    return false
  }
  return registrationDeadlineDate.value.getTime() < now.value
})

const isTournamentFinished = computed(() => {
  if (props.tournament.status) {
    return props.tournament.status === 'finished'
  }

  if (!endDate) {
    return false
  }

  const parsedEnd = new Date(endDate)
  if (Number.isNaN(parsedEnd.getTime())) {
    return false
  }

  return parsedEnd.getTime() < now.value
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
  const formatUnits = (nonzeroUnits.length ? nonzeroUnits : ['seconds']).slice(
    0,
    3,
  ) as (keyof typeof duration)[]
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
  <Card class="mb-0 gap-3">
    <CardHeader>
      <CardTitle
        class="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight leading-[1.05] text-balance"
        >{{ tournament.title }}</CardTitle
      >
    </CardHeader>
    <CardContent>
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div class="flex flex-col space-y-3 max-w-xl">
          <div class="flex flex-wrap gap-2">
            <span class="chip">{{ tournament.discipline }}</span>
            <span class="chip">{{ tournament.format }}</span>
          </div>
          <span class="text-xs uppercase tracking-wide text-muted-foreground/80">
            {{ format(startDate!, DATE_FORMAT) }} — {{ format(endDate!, DATE_FORMAT) }}
          </span>
          <span
            v-if="isTournamentFinished"
            class="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
          >
            {{ t('tournament.status.finished') }}
          </span>
          <div>
            <span class="text-xs uppercase tracking-wide text-muted-foreground/70"
              >{{ t('tournament.hero.prize_pool') }}:
            </span>
            <span class="text-sm font-semibold text-foreground"
              >{{ totalPrize }} {{ tournament.prize_pool.currency }}</span
            >
          </div>
        </div>
        <div class="shrink-0 text-right">
          <p v-if="isTournamentFinished" class="text-sm text-muted-foreground">
            {{ t('tournament.hero.tournament_finished') }}
          </p>
          <div v-if="!isRegistrationOpen">
            <p class="text-sm text-muted-foreground">
              {{ t('tournament.hero.registration_opens_in', { time: countdownLabel }) }}
            </p>
          </div>
          <RegistrationSmartButton
            v-else-if="!isTournamentFinished"
            :tournament-uri="tournament.id"
            :is-registration-closed="isRegistrationClosed"
          />
        </div>
      </div>
    </CardContent>
  </Card>
</template>
