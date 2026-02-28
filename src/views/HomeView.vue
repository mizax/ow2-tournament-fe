<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { fetchWithoutAuth } from '@/services/apiService'
import type { Tournament } from '@/types/tournament'
import TournamentCard from '@/components/tournament/TournamentCard.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const tournaments = ref<Tournament[]>([])

const isPastTournament = (tournament: Tournament): boolean => {
  const endDate = tournament.dates[tournament.dates.length - 1]
  if (!endDate) {
    return false
  }
  const parsed = new Date(endDate)
  if (Number.isNaN(parsed.getTime())) {
    return false
  }
  return parsed.getTime() < Date.now()
}

const upcomingTournaments = computed(() =>
  tournaments.value.filter((tournament) => !isPastTournament(tournament)),
)

const pastTournaments = computed(() =>
  tournaments.value.filter((tournament) => isPastTournament(tournament)),
)

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
    <section class="brand-panel rounded-2xl px-5 py-6 md:px-8 md:py-8">
      <p class="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        OW Tournament Hub
      </p>
      <h1 class="brand-title mt-2 text-4xl leading-[0.92] sm:text-5xl lg:text-6xl">
        {{ t('home.title') }}
      </h1>
      <p class="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
        {{ t('home.subtitle') }}
      </p>
    </section>

    <section v-if="upcomingTournaments.length > 0" class="space-y-5">
      <h2 class="text-2xl leading-[0.95] sm:text-3xl">{{ t('home.title') }}</h2>
      <div class="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        <TournamentCard
          v-for="tournament in upcomingTournaments"
          :key="`upcoming-${tournament.uri}`"
          :tournament="tournament"
        />
      </div>
    </section>

    <section v-if="pastTournaments.length > 0" class="space-y-5">
      <h2 class="text-2xl leading-[0.95] sm:text-3xl">{{ t('home.title_past') }}</h2>
      <div class="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        <TournamentCard
          v-for="tournament in pastTournaments"
          :key="`past-${tournament.uri}`"
          :tournament="tournament"
        />
      </div>
    </section>

    <div
      v-if="upcomingTournaments.length === 0 && pastTournaments.length === 0"
      class="rounded-2xl border border-dashed border-border/90 bg-card/55 px-6 py-12 text-center"
    >
      <p class="text-muted-foreground">{{ t('home.noTournaments') }}</p>
    </div>
  </div>
</template>

<style scoped></style>
