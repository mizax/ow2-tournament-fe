<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { fetchMatchStats } from '@/services/publicStatsApi'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

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

const tournamentSef = String(route.params.tournamentSef ?? '')
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
        :to="`/tournament/${tournamentSef}/matches`"
        class="text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        ← {{ t('stats.back-to-tournament') }}
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
      <Card>
        <CardContent>
          <div class="grid grid-cols-[1fr_auto_1fr] items-center gap-4 text-center">
            <span class="text-xl font-bold text-emerald-300/90">{{ stats.home_team }}</span>
            <span class="text-2xl font-bold text-muted-foreground/50 px-4">vs</span>
            <span class="text-xl font-bold text-rose-300/90">{{ stats.away_team }}</span>
          </div>
        </CardContent>
      </Card>

      <!-- Maps tabs -->
      <Card v-if="stats.maps.length > 0" class="p-0 gap-0 overflow-hidden">
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
              <div
                v-if="map.rounds.length > 1"
                class="mb-3 text-sm font-medium text-muted-foreground uppercase tracking-wide"
              >
                {{ t('stats.round') }} {{ roundData.round ?? rIdx + 1 }}
              </div>

              <div
                v-for="(teamPlayers, teamName) in groupByTeam(roundData.players)"
                :key="teamName"
                class="mb-4 last:mb-0"
              >
                <div
                  :class="[
                    'mb-2 text-sm font-semibold pl-2 border-l-2',
                    teamName === stats?.home_team
                      ? 'border-emerald-500/60 text-emerald-300/80'
                      : teamName === stats?.away_team
                        ? 'border-rose-500/60 text-rose-300/80'
                        : 'border-white/20 text-muted-foreground',
                  ]"
                >
                  {{ teamName }}
                </div>

                <div class="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow class="border-white/10 hover:bg-transparent">
                        <TableHead class="text-xs uppercase text-muted-foreground font-medium">{{ t('stats.player') }}</TableHead>
                        <TableHead class="text-xs uppercase text-muted-foreground font-medium">{{ t('stats.hero') }}</TableHead>
                        <TableHead class="text-xs uppercase text-muted-foreground font-medium text-right">{{ t('stats.kills') }}</TableHead>
                        <TableHead class="text-xs uppercase text-muted-foreground font-medium text-right">{{ t('stats.deaths') }}</TableHead>
                        <TableHead class="text-xs uppercase text-muted-foreground font-medium text-right">{{ t('stats.kd') }}</TableHead>
                        <TableHead class="text-xs uppercase text-muted-foreground font-medium text-right">{{ t('stats.damage') }}</TableHead>
                        <TableHead class="text-xs uppercase text-muted-foreground font-medium text-right">{{ t('stats.healing') }}</TableHead>
                        <TableHead class="text-xs uppercase text-muted-foreground font-medium text-right">{{ t('stats.blocked') }}</TableHead>
                        <TableHead class="text-xs uppercase text-muted-foreground font-medium text-right">{{ t('stats.ults') }}</TableHead>
                        <TableHead class="text-xs uppercase text-muted-foreground font-medium text-right">{{ t('stats.time') }}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow
                        v-for="player in teamPlayers"
                        :key="player.player_id"
                        class="border-white/5"
                      >
                        <TableCell>
                          <router-link
                            :to="`/player/${player.player_id}`"
                            class="font-medium hover:text-primary transition-colors"
                          >
                            {{ player.nickname }}
                          </router-link>
                        </TableCell>
                        <TableCell class="text-muted-foreground">{{ player.hero_name }}</TableCell>
                        <TableCell class="text-right tabular-nums">{{ formatNumber(player.kills) }}</TableCell>
                        <TableCell class="text-right tabular-nums">{{ formatNumber(player.deaths) }}</TableCell>
                        <TableCell class="text-right tabular-nums">{{ kd(player.kills, player.deaths) }}</TableCell>
                        <TableCell class="text-right tabular-nums">{{ formatNumber(player.damage) }}</TableCell>
                        <TableCell class="text-right tabular-nums">{{ formatNumber(player.healing) }}</TableCell>
                        <TableCell class="text-right tabular-nums">{{ formatNumber(player.damage_blocked) }}</TableCell>
                        <TableCell class="text-right tabular-nums">
                          {{ formatNumber(player.ults_used) }}/{{ formatNumber(player.ults_earned) }}
                        </TableCell>
                        <TableCell class="text-right tabular-nums">{{ formatTime(player.time_played) }}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      <div v-else class="text-center py-10 text-muted-foreground">
        {{ t('stats.no-data') }}
      </div>
    </div>
  </div>
</template>
