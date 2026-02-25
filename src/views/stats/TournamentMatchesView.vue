<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { fetchTournamentMatches } from '@/services/publicStatsApi'

const { t } = useI18n()
const route = useRoute()

interface MapScore {
  map_order: number
  map_name: string | null
  mode_name: string | null
  home_score: number
  away_score: number
}

interface MatchSummary {
  id: number
  home_team: string
  away_team: string
  home_score: number | null
  away_score: number | null
  maps: MapScore[]
}

const tournamentSef = String(route.params.tournamentSef ?? '')
const matches = ref<MatchSummary[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  const response = await fetchTournamentMatches(tournamentSef)
  if (response.success && Array.isArray(response.data)) {
    matches.value = response.data as MatchSummary[]
  } else {
    error.value = t('stats.no-data')
  }
  isLoading.value = false
})
</script>

<template>
  <div class="container mx-auto py-8 px-4">
    <div class="mb-6">
      <router-link
        :to="`/tournament/${tournamentSef}`"
        class="text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        ← {{ t('stats.back-to-tournament') }}
      </router-link>
      <h1 class="mt-2 text-2xl font-bold">{{ t('stats.matches') }}</h1>
    </div>

    <div v-if="isLoading" class="flex justify-center py-20">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
    </div>

    <div v-else-if="error" class="text-center py-20 text-muted-foreground">
      {{ error }}
    </div>

    <div v-else-if="matches.length === 0" class="text-center py-20 text-muted-foreground">
      {{ t('stats.no-data') }}
    </div>

    <div v-else class="space-y-4">
      <router-link
        v-for="match in matches"
        :key="match.id"
        :to="`/match/${match.id}`"
        class="block rounded-xl border border-white/10 bg-card hover:bg-white/5 transition-colors p-4"
      >
        <div class="flex items-center justify-between gap-4">
          <span class="font-semibold text-lg truncate">{{ match.home_team }}</span>
          <span class="text-xl font-bold tabular-nums shrink-0">
            {{ match.home_score ?? '–' }} : {{ match.away_score ?? '–' }}
          </span>
          <span class="font-semibold text-lg truncate text-right">{{ match.away_team }}</span>
        </div>

        <div v-if="match.maps.length > 0" class="mt-3 flex flex-wrap gap-2">
          <div
            v-for="map in match.maps"
            :key="map.map_order"
            class="rounded-md bg-muted/50 px-3 py-1 text-sm flex items-center gap-2"
          >
            <span class="text-muted-foreground">{{ map.map_name ?? t('stats.map') }}</span>
            <span class="font-medium tabular-nums">{{ map.home_score }}:{{ map.away_score }}</span>
          </div>
        </div>
      </router-link>
    </div>
  </div>
</template>
