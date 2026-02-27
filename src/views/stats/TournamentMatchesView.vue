<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { fetchTournamentMatches } from '@/services/publicStatsApi'
import type { MatchSummary } from '@/types/stats'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

const { t } = useI18n()
const route = useRoute()

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

    <div v-if="isLoading" class="space-y-3">
      <Skeleton v-for="i in 6" :key="i" class="h-24 w-full rounded-2xl" />
    </div>

    <div v-else-if="error" class="text-center py-20 text-muted-foreground">{{ error }}</div>

    <div v-else-if="matches.length === 0" class="text-center py-20 text-muted-foreground">
      {{ t('stats.no-data') }}
    </div>

    <div v-else class="space-y-3">
      <router-link v-for="match in matches" :key="match.id" :to="`/tournament/${tournamentSef}/match/${match.id}`">
        <Card class="p-5 gap-0 hover:bg-white/5 transition-colors cursor-pointer">
          <div class="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
            <span class="font-semibold text-base leading-tight text-sky-300/90">{{ match.home_team }}</span>
            <div class="flex items-center gap-2 shrink-0">
              <span
                :class="[
                  'text-2xl font-bold tabular-nums',
                  match.home_score != null &&
                  match.away_score != null &&
                  match.home_score > match.away_score
                    ? 'text-sky-400'
                    : 'text-foreground',
                ]"
              >
                {{ match.home_score ?? '–' }}
              </span>
              <span class="text-muted-foreground font-medium">:</span>
              <span
                :class="[
                  'text-2xl font-bold tabular-nums',
                  match.home_score != null &&
                  match.away_score != null &&
                  match.away_score > match.home_score
                    ? 'text-red-400'
                    : 'text-foreground',
                ]"
              >
                {{ match.away_score ?? '–' }}
              </span>
            </div>
            <span class="font-semibold text-base leading-tight text-right text-red-300/90">{{ match.away_team }}</span>
          </div>

          <div v-if="match.maps.length > 0" class="mt-3 flex flex-wrap gap-1.5">
            <div
              v-for="map in match.maps"
              :key="map.map_order"
              :class="[
                'rounded-md px-2.5 py-1 text-xs flex items-center gap-1.5',
                map.home_score > map.away_score
                  ? 'bg-sky-950/50 text-sky-300/80'
                  : map.home_score < map.away_score
                    ? 'bg-red-950/50 text-red-300/80'
                    : 'bg-muted/50 text-muted-foreground',
              ]"
            >
              <span>{{ map.map_name ?? t('stats.map') }}</span>
              <span class="font-semibold tabular-nums">{{ map.home_score }}:{{ map.away_score }}</span>
            </div>
          </div>
        </Card>
      </router-link>
    </div>
  </div>
</template>
