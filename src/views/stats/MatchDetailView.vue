<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { fetchMatchStats } from '@/services/publicStatsApi'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const { t } = useI18n()
const route = useRoute()

interface PlayerStats {
  player_id: number
  nickname: string
  team_id: number
  team_name: string
  hero_name: string
  elims: number | null
  kills: number | null
  deaths: number | null
  damage: number | null
  hero_damage: number | null
  healing: number | null
  damage_taken: number | null
  damage_blocked: number | null
  ults_earned: number | null
  ults_used: number | null
  time_played: number | null
}

interface RoundStats {
  round: number | null
  players: PlayerStats[]
}

interface MapStats {
  map_order: number
  map_name: string | null
  mode_name: string | null
  rounds: RoundStats[]
}

interface MatchStatsResponse {
  match_id: number
  home_team: string
  home_team_id: number
  away_team: string
  away_team_id: number
  maps: MapStats[]
}

const matchId = Number(route.params.matchId)
const stats = ref<MatchStatsResponse | null>(null)
const isLoading = ref(true)
const error = ref<string | null>(null)
const activeMap = ref<string>('0')

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

function formatNumber(val: number | null | undefined): string {
  if (val == null) return '—'
  return Math.round(val).toLocaleString()
}

function formatTime(seconds: number | null | undefined): string {
  if (seconds == null) return '—'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function kd(kills: number | null, deaths: number | null): string {
  if (kills == null || deaths == null) return '—'
  if (deaths === 0) return kills > 0 ? '∞' : '0'
  return (kills / deaths).toFixed(2)
}

function groupByTeam(players: PlayerStats[]): Record<string, PlayerStats[]> {
  return players.reduce(
    (acc, p) => {
      if (!acc[p.team_name]) acc[p.team_name] = []
      ;(acc[p.team_name] as PlayerStats[]).push(p)
      return acc
    },
    {} as Record<string, PlayerStats[]>,
  )
}
</script>

<template>
  <div class="container mx-auto py-8 px-4">
    <div class="mb-6">
      <router-link
        to="/"
        class="text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        ← {{ t('stats.back') }}
      </router-link>
    </div>

    <div v-if="isLoading" class="flex justify-center py-20">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
    </div>

    <div v-else-if="error" class="text-center py-20 text-muted-foreground">
      {{ error }}
    </div>

    <div v-else-if="stats" class="space-y-6">
      <!-- Match header -->
      <div class="rounded-xl border border-white/10 bg-card p-6 text-center">
        <div class="flex items-center justify-center gap-6">
          <span class="text-xl font-bold">{{ stats.home_team }}</span>
          <span class="text-3xl font-bold tabular-nums text-primary px-4">
            {{ t('stats.vs') }}
          </span>
          <span class="text-xl font-bold">{{ stats.away_team }}</span>
        </div>
      </div>

      <!-- Maps tabs -->
      <div v-if="stats.maps.length > 0" class="rounded-xl border border-white/10 bg-card overflow-hidden">
        <Tabs v-model="activeMap">
          <div class="p-4 border-b border-white/10">
            <TabsList class="flex flex-wrap gap-2 bg-muted/40 p-1">
              <TabsTrigger
                v-for="map in stats.maps"
                :key="map.map_order"
                :value="String(map.map_order)"
                class="cursor-pointer px-3 py-1.5 text-sm data-[state=active]:bg-white/5 data-[state=active]:text-foreground"
              >
                {{ map.map_name ?? `${t('stats.map')} ${map.map_order}` }}
                <span v-if="map.mode_name" class="ml-1 text-xs text-muted-foreground">
                  ({{ map.mode_name }})
                </span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent
            v-for="map in stats.maps"
            :key="map.map_order"
            :value="String(map.map_order)"
            class="p-4"
          >
            <div
              v-for="(roundData, rIdx) in map.rounds"
              :key="rIdx"
              class="mb-6 last:mb-0"
            >
              <div v-if="map.rounds.length > 1" class="mb-3 text-sm font-medium text-muted-foreground uppercase tracking-wide">
                {{ t('stats.round') }} {{ roundData.round ?? rIdx + 1 }}
              </div>

              <div
                v-for="(teamPlayers, teamName) in groupByTeam(roundData.players)"
                :key="teamName"
                class="mb-4 last:mb-0"
              >
                <div class="mb-2 text-sm font-semibold text-muted-foreground">{{ teamName }}</div>
                <div class="overflow-x-auto">
                  <table class="w-full text-sm">
                    <thead>
                      <tr class="border-b border-white/10 text-xs text-muted-foreground uppercase">
                        <th class="py-2 pr-3 text-left font-medium">{{ t('stats.player') }}</th>
                        <th class="py-2 pr-3 text-left font-medium">{{ t('stats.hero') }}</th>
                        <th class="py-2 pr-3 text-right font-medium">{{ t('stats.kills') }}</th>
                        <th class="py-2 pr-3 text-right font-medium">{{ t('stats.deaths') }}</th>
                        <th class="py-2 pr-3 text-right font-medium">{{ t('stats.kd') }}</th>
                        <th class="py-2 pr-3 text-right font-medium">{{ t('stats.damage') }}</th>
                        <th class="py-2 pr-3 text-right font-medium">{{ t('stats.healing') }}</th>
                        <th class="py-2 pr-3 text-right font-medium">{{ t('stats.blocked') }}</th>
                        <th class="py-2 pr-3 text-right font-medium">{{ t('stats.ults') }}</th>
                        <th class="py-2 text-right font-medium">{{ t('stats.time') }}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="player in teamPlayers"
                        :key="player.player_id"
                        class="border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td class="py-2 pr-3">
                          <router-link
                            :to="`/player/${player.player_id}`"
                            class="font-medium hover:text-primary transition-colors"
                          >
                            {{ player.nickname }}
                          </router-link>
                        </td>
                        <td class="py-2 pr-3 text-muted-foreground">{{ player.hero_name }}</td>
                        <td class="py-2 pr-3 text-right tabular-nums">{{ formatNumber(player.kills) }}</td>
                        <td class="py-2 pr-3 text-right tabular-nums">{{ formatNumber(player.deaths) }}</td>
                        <td class="py-2 pr-3 text-right tabular-nums">{{ kd(player.kills, player.deaths) }}</td>
                        <td class="py-2 pr-3 text-right tabular-nums">{{ formatNumber(player.damage) }}</td>
                        <td class="py-2 pr-3 text-right tabular-nums">{{ formatNumber(player.healing) }}</td>
                        <td class="py-2 pr-3 text-right tabular-nums">{{ formatNumber(player.damage_blocked) }}</td>
                        <td class="py-2 pr-3 text-right tabular-nums">
                          {{ formatNumber(player.ults_used) }}/{{ formatNumber(player.ults_earned) }}
                        </td>
                        <td class="py-2 text-right tabular-nums">{{ formatTime(player.time_played) }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <div v-else class="text-center py-10 text-muted-foreground">
        {{ t('stats.no-data') }}
      </div>
    </div>
  </div>
</template>
