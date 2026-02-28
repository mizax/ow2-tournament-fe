<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { fetchMatchStats } from '@/services/publicStatsApi'
import { mergePlayerHeroes, groupPlayersByTeam } from '@/lib/matchStats'
import type { PlayerStats, MatchStatsResponse, ProcessedMap } from '@/types/stats'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import MatchTeamStats from '@/components/stats/MatchTeamStats.vue'

const { t } = useI18n()
const route = useRoute()

const tournamentSef = String(route.params.tournamentSef ?? '')
const matchId = Number(route.params.matchId)
const stats = ref<MatchStatsResponse | null>(null)
const isLoading = ref(true)
const error = ref<string | null>(null)
const activeMap = ref<string>('0')
const expandedPlayers = ref(new Set<string>())

onMounted(async () => {
  const response = await fetchMatchStats(matchId)
  if (response.success && response.data) {
    stats.value = response.data as MatchStatsResponse
    const firstMap = stats.value.maps[0]
    if (firstMap) {
      activeMap.value = String(firstMap.map_order)
    }
  } else {
    error.value = t('stats.no-data')
  }
  isLoading.value = false
})

function togglePlayer(key: string) {
  const next = new Set(expandedPlayers.value)
  if (next.has(key)) next.delete(key)
  else next.add(key)
  expandedPlayers.value = next
}

const processedMaps = computed<ProcessedMap[]>(() => {
  if (!stats.value) return []
  return stats.value.maps.map((map) => ({
    map_order: map.map_order,
    map_name: map.map_name,
    mode_name: map.mode_name,
    rounds: map.rounds.map((round) => {
      const byTeamRecord = groupPlayersByTeam(round.players)
      return {
        round: round.round,
        byTeam: Object.entries(byTeamRecord).map(([teamName, groups]) => ({
          teamName,
          groups,
          maxDamage: Math.max(...groups.map((g) => g.hero_damage), 1),
        })),
      }
    }),
  }))
})
</script>

<template>
  <div class="page-shell">
    <section class="page-head">
      <router-link
        :to="{
          name: 'tournament-details-home',
          params: { tournamentSef },
          query: { tab: 'matches' },
        }"
        class="text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        ← {{ t('stats.back-to-tournament') }}
      </router-link>
    </section>

    <!-- Skeleton loading -->
    <div v-if="isLoading" class="space-y-4" role="status" aria-live="polite">
      <Skeleton class="h-16 w-full rounded-2xl" />
      <Skeleton class="h-10 w-1/2 rounded-xl" />
      <div class="space-y-2 pt-2">
        <Skeleton class="h-9 w-full rounded-lg" />
        <Skeleton v-for="i in 6" :key="i" class="h-11 w-full rounded-lg" />
      </div>
    </div>

    <div v-else-if="error" class="text-center py-20 text-muted-foreground" role="alert">
      {{ error }}
    </div>

    <div v-else-if="stats" class="space-y-6">
      <!-- Match header -->
      <section class="border-b border-border/60 pb-4">
        <div class="grid grid-cols-[1fr_auto_1fr] items-center gap-4 text-center">
          <span class="text-xl font-bold text-primary">{{ stats.home_team }}</span>
          <span class="px-4 text-2xl font-bold text-muted-foreground/50">vs</span>
          <span class="text-xl font-bold text-destructive">{{ stats.away_team }}</span>
        </div>
      </section>

      <!-- Maps tabs -->
      <section
        v-if="processedMaps.length > 0"
        class="overflow-hidden rounded-xl border border-border/70 bg-background/35"
      >
        <Tabs v-model="activeMap">
          <div class="border-b border-border/70 p-4">
            <TabsList
              class="flex flex-wrap items-end gap-2 border-b border-border/70 bg-transparent p-0"
            >
              <TabsTrigger
                v-for="map in processedMaps"
                :key="map.map_order"
                :value="String(map.map_order)"
                class="cursor-pointer px-3 py-1.5 text-sm data-[state=active]:text-foreground"
              >
                {{ map.map_name ?? `${t('stats.map')} ${map.map_order}` }}
                <span v-if="map.mode_name" class="ml-1 text-xs text-muted-foreground">
                  ({{ map.mode_name }})
                </span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent
            v-for="map in processedMaps"
            :key="map.map_order"
            :value="String(map.map_order)"
            class="p-4"
          >
            <div v-for="(roundData, rIdx) in map.rounds" :key="rIdx" class="mb-6 last:mb-0">
              <div
                v-if="map.rounds.length > 1"
                class="mb-3 text-sm font-medium text-muted-foreground uppercase tracking-wide"
              >
                {{ t('stats.round') }} {{ roundData.round ?? rIdx + 1 }}
              </div>

              <MatchTeamStats
                v-for="team in roundData.byTeam"
                :key="team.teamName"
                :team="team"
                :map-order="map.map_order"
                :round-idx="rIdx"
                :tournament-sef="tournamentSef"
                :home-team="stats.home_team"
                :away-team="stats.away_team"
                :expanded-players="expandedPlayers"
                class="mb-4 last:mb-0"
                @toggle-player="togglePlayer"
              />
            </div>
          </TabsContent>
        </Tabs>
      </section>

      <div v-else class="text-center py-10 text-muted-foreground">
        {{ t('stats.no-data') }}
      </div>
    </div>
  </div>
</template>
