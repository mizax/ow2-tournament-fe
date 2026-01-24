<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { fetchWithoutAuth } from '@/services/apiService'
import type { Tournament } from '@/types/tournament'
import TournamentCard from '@/components/tournament/TournamentCard.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const tournaments = ref<Tournament[]>([])

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
    <h1 class="text-2xl font-extrabold tracking-tight lg:text-3xl mb-8 text-center">
      {{ t('home.title') }}
    </h1>

    <div v-if="tournaments.length > 0" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <TournamentCard
        v-for="tournament in tournaments"
        :key="tournament.uri"
        :tournament="tournament"
      />
    </div>
    <div v-else class="text-center py-12">
      <p class="text-muted-foreground">{{ t('home.noTournaments') }}</p>
    </div>
  </div>
</template>

<style scoped></style>
