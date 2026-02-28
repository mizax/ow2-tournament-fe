<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { fetchWithoutAuth } from '@/services/apiService'
import type { Tournament } from '@/types/tournament'
import TournamentCard from '@/components/tournament/TournamentCard.vue'
import { useI18n } from 'vue-i18n'
import { Trophy } from 'lucide-vue-next'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'

const { t } = useI18n()

const tournaments = ref<Tournament[]>([])

const isPastTournament = (tournament: Tournament): boolean => {
  const endDate = tournament.dates[tournament.dates.length - 1]
  if (!endDate) return false
  const parsed = new Date(endDate)
  if (Number.isNaN(parsed.getTime())) return false
  return parsed.getTime() < Date.now()
}

const upcomingTournaments = computed(() =>
  tournaments.value.filter((tournament) => !isPastTournament(tournament)),
)

const pastTournaments = computed(() =>
  tournaments.value.filter((tournament) => isPastTournament(tournament)),
)

const ongoingCount = computed(
  () =>
    upcomingTournaments.value.filter((tournament) => {
      if (tournament.status === 'ongoing') return true
      if (tournament.status) return false
      const start = new Date(tournament.dates[0]!).getTime()
      return !Number.isNaN(start) && start <= Date.now()
    }).length,
)

const participantsTotal = computed(() =>
  tournaments.value.reduce((sum, tournament) => sum + (tournament.registration_count ?? 0), 0),
)

const upcomingGridClass = computed(() => {
  const n = upcomingTournaments.value.length
  if (n === 1) return 'max-w-md'
  if (n === 2) return 'grid grid-cols-1 gap-6 sm:grid-cols-2'
  return 'grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3'
})

onMounted(async () => {
  try {
    const response = await fetchWithoutAuth<Tournament[]>('/api/public/v1/tournaments')
    if (response.success && response.data) {
      tournaments.value = response.data
    }
  } catch (error) {
    console.error('Error fetching tournaments:', error)
  }
})
</script>

<template>
  <div class="w-full space-y-10">
    <section class="brand-panel relative overflow-hidden rounded-2xl px-5 py-6 md:px-8 md:py-8">
      <img
        src="@/assets/img/S21_Thumbnail.png"
        alt=""
        aria-hidden="true"
        class="hero-img pointer-events-none absolute inset-0 h-full w-full object-cover object-center"
      />
      <div
        class="pointer-events-none absolute inset-0 bg-gradient-to-r from-card from-[68%] to-transparent md:from-[44%]"
      />
      <div class="hero-content relative z-10">
        <p class="page-kicker">OW Tournament Hub</p>
        <h1 class="brand-title mt-2 text-4xl leading-[0.92] sm:text-5xl lg:text-6xl">
          {{ t('home.hero_title') }}
        </h1>
        <p class="mt-3 text-sm leading-6 text-muted-foreground">
          {{ t('home.about') }}
        </p>
        <div v-if="tournaments.length > 0" class="mt-5 flex flex-wrap gap-2">
          <span class="chip">{{ t('home.stat_total', { count: tournaments.length }) }}</span>
          <span v-if="participantsTotal > 0" class="chip">
            {{ t('home.stat_participants', { count: participantsTotal }) }}
          </span>
          <span v-if="ongoingCount > 0" class="chip">
            {{ t('home.stat_ongoing', { count: ongoingCount }) }}
          </span>
        </div>
      </div>
    </section>

    <section class="space-y-5">
      <h2 class="section-title">{{ t('home.section_upcoming') }}</h2>
      <div v-if="upcomingTournaments.length > 0" :class="upcomingGridClass">
        <TournamentCard
          v-for="tournament in upcomingTournaments"
          :key="`upcoming-${tournament.uri}`"
          :tournament="tournament"
        />
      </div>
      <Empty
        v-else
        class="rounded-2xl border border-dashed border-border/60 bg-muted/20 p-8 text-center"
      >
        <EmptyHeader class="items-center">
          <EmptyMedia variant="icon">
            <Trophy class="size-6" />
          </EmptyMedia>
        </EmptyHeader>
        <EmptyTitle>{{ t('home.upcoming_empty_title') }}</EmptyTitle>
        <EmptyDescription>{{ t('home.upcoming_empty_description') }}</EmptyDescription>
      </Empty>
    </section>

    <section v-if="pastTournaments.length > 0" class="space-y-5">
      <h2 class="section-title text-muted-foreground/70">{{ t('home.section_past') }}</h2>
      <div class="grid grid-cols-1 gap-6 opacity-80 md:grid-cols-2 xl:grid-cols-3">
        <TournamentCard
          v-for="tournament in pastTournaments"
          :key="`past-${tournament.uri}`"
          :tournament="tournament"
        />
      </div>
    </section>

  </div>
</template>

<style scoped>
@keyframes hero-img-in {
  from {
    opacity: 0;
    transform: scale(1.06) translateX(12px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateX(0);
  }
}

@keyframes hero-content-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.hero-img {
  animation: hero-img-in 1.4s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.hero-content {
  animation: hero-content-in 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both;
}

@media (prefers-reduced-motion: reduce) {
  .hero-img,
  .hero-content {
    animation: none;
  }
}
</style>
