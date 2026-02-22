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
  <div class="container mx-auto py-8 px-4">
    <div v-if="upcomingTournaments.length > 0" class="mb-10">
      <h1 class="text-2xl font-extrabold tracking-tight lg:text-3xl mb-8 text-center">
        {{ t('home.title') }}
      </h1>
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <TournamentCard
          v-for="tournament in upcomingTournaments"
          :key="`upcoming-${tournament.uri}`"
          :tournament="tournament"
        />
      </div>
    </div>

    <div v-if="pastTournaments.length > 0" class="mb-2">
      <h1 class="text-2xl font-extrabold tracking-tight lg:text-3xl mb-8 text-center">
        {{ t('home.title_past') }}
      </h1>
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <TournamentCard
          v-for="tournament in pastTournaments"
          :key="`past-${tournament.uri}`"
          :tournament="tournament"
        />
      </div>
    </div>

    <div
      v-if="upcomingTournaments.length === 0 && pastTournaments.length === 0"
      class="text-center py-12"
    >
      <p class="text-muted-foreground">{{ t('home.noTournaments') }}</p>
    </div>
  </div>
</template>

<style scoped></style>
