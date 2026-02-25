<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { fetchPlayer, fetchPlayerMatches } from '@/services/publicStatsApi'
import { Badge } from '@/components/ui/badge'
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

interface PlayerProfile {
  id: number
  nickname: string
  role: string | null
  registration_id: number | null
  battletag: string | null
  team_name: string
  tournament_title: string
  tournament_sef: string
  division_name: string | null
}

interface PlayerMatchSummary {
  match_id: number
  home_team: string
  away_team: string
  home_score: number | null
  away_score: number | null
  tournament_title: string
  maps_played: number
  kills: number | null
  deaths: number | null
  damage: number | null
  healing: number | null
  time_played: number | null
}

const playerId = Number(route.params.playerId)
const profile = ref<PlayerProfile | null>(null)
const matchHistory = ref<PlayerMatchSummary[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  const [profileResponse, matchesResponse] = await Promise.all([
    fetchPlayer(playerId),
    fetchPlayerMatches(playerId),
  ])

  if (profileResponse.success && profileResponse.data) {
    profile.value = profileResponse.data as PlayerProfile
  } else {
    error.value = t('stats.no-data')
    isLoading.value = false
    return
  }

  if (matchesResponse.success && Array.isArray(matchesResponse.data)) {
    matchHistory.value = matchesResponse.data as PlayerMatchSummary[]
  }

  isLoading.value = false
})

function formatNumber(val: number | null | undefined): string {
  if (val == null) return '—'
  return Math.round(val).toLocaleString()
}

function kd(kills: number | null, deaths: number | null): string {
  if (kills == null || deaths == null) return '—'
  if (deaths === 0) return kills > 0 ? '∞' : '0'
  return (kills / deaths).toFixed(2)
}

const roleLabels: Record<string, string> = {
  tank: 'Танк',
  damage: 'Урон',
  support: 'Поддержка',
  flex: 'Флекс',
}

const roleClasses: Record<string, string> = {
  tank: 'border-blue-500/30 bg-blue-500/15 text-blue-400',
  damage: 'border-rose-500/30 bg-rose-500/15 text-rose-400',
  support: 'border-emerald-500/30 bg-emerald-500/15 text-emerald-400',
}

const totalKills = computed(() => matchHistory.value.reduce((s, m) => s + (m.kills ?? 0), 0))
const totalDeaths = computed(() => matchHistory.value.reduce((s, m) => s + (m.deaths ?? 0), 0))
const totalDamage = computed(() => matchHistory.value.reduce((s, m) => s + (m.damage ?? 0), 0))
const avgDamage = computed(() =>
  matchHistory.value.length > 0 ? Math.round(totalDamage.value / matchHistory.value.length) : 0,
)
const overallKD = computed(() => {
  if (totalDeaths.value === 0) return totalKills.value > 0 ? '∞' : '0'
  return (totalKills.value / totalDeaths.value).toFixed(2)
})
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

    <div v-else-if="profile" class="space-y-6">
      <!-- Player card -->
      <Card>
        <CardContent>
          <div class="flex flex-wrap items-start gap-4">
            <div class="flex-1 min-w-0">
              <h1 class="text-2xl font-bold truncate">{{ profile.nickname }}</h1>
              <div v-if="profile.battletag" class="mt-1 text-sm text-muted-foreground">
                {{ profile.battletag }}
              </div>
            </div>
            <Badge
              v-if="profile.role"
              variant="outline"
              :class="roleClasses[profile.role] ?? 'border-primary/30 bg-primary/10 text-primary'"
            >
              {{ roleLabels[profile.role] ?? profile.role }}
            </Badge>
          </div>

          <div class="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <span>
              {{ t('stats.team') }}:
              <span class="text-foreground font-medium">{{ profile.team_name }}</span>
            </span>
            <span>
              {{ t('stats.tournament') }}:
              <router-link
                :to="`/tournament/${profile.tournament_sef}`"
                class="text-primary hover:underline"
              >
                {{ profile.tournament_title }}
              </router-link>
            </span>
            <span v-if="profile.division_name">
              {{ t('stats.division') }}:
              <span class="text-foreground font-medium">{{ profile.division_name }}</span>
            </span>
          </div>
        </CardContent>
      </Card>

      <!-- Aggregate stats -->
      <div v-if="matchHistory.length > 0" class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card class="p-4 gap-1 text-center">
          <div class="text-2xl font-bold tabular-nums">{{ matchHistory.length }}</div>
          <div class="text-xs text-muted-foreground uppercase tracking-wide">{{ t('stats.matches') }}</div>
        </Card>
        <Card class="p-4 gap-1 text-center">
          <div class="text-2xl font-bold tabular-nums">{{ overallKD }}</div>
          <div class="text-xs text-muted-foreground uppercase tracking-wide">{{ t('stats.kd') }}</div>
        </Card>
        <Card class="p-4 gap-1 text-center">
          <div class="text-2xl font-bold tabular-nums">{{ avgDamage.toLocaleString() }}</div>
          <div class="text-xs text-muted-foreground uppercase tracking-wide">{{ t('stats.damage') }}/матч</div>
        </Card>
        <Card class="p-4 gap-1 text-center">
          <div class="text-2xl font-bold tabular-nums">{{ totalKills.toLocaleString() }}</div>
          <div class="text-xs text-muted-foreground uppercase tracking-wide">{{ t('stats.kills') }}</div>
        </Card>
      </div>

      <!-- Match history -->
      <div>
        <h2 class="text-lg font-semibold mb-3">{{ t('stats.match-history') }}</h2>

        <div
          v-if="matchHistory.length === 0"
          class="text-center py-10 text-muted-foreground rounded-xl border border-white/10 bg-card"
        >
          {{ t('stats.no-data') }}
        </div>

        <Card v-else class="p-0 gap-0 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow class="border-white/10 hover:bg-transparent">
                <TableHead class="text-xs uppercase text-muted-foreground font-medium">{{ t('stats.match') }}</TableHead>
                <TableHead class="text-xs uppercase text-muted-foreground font-medium text-right">{{ t('stats.maps') }}</TableHead>
                <TableHead class="text-xs uppercase text-muted-foreground font-medium text-right">{{ t('stats.kills') }}</TableHead>
                <TableHead class="text-xs uppercase text-muted-foreground font-medium text-right">{{ t('stats.deaths') }}</TableHead>
                <TableHead class="text-xs uppercase text-muted-foreground font-medium text-right">{{ t('stats.kd') }}</TableHead>
                <TableHead class="text-xs uppercase text-muted-foreground font-medium text-right">{{ t('stats.damage') }}</TableHead>
                <TableHead class="text-xs uppercase text-muted-foreground font-medium text-right">{{ t('stats.healing') }}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow
                v-for="match in matchHistory"
                :key="match.match_id"
                class="border-white/5"
              >
                <TableCell>
                  <router-link
                    :to="`/tournament/${profile.tournament_sef}/match/${match.match_id}`"
                    class="hover:text-primary transition-colors"
                  >
                    <div class="font-medium">
                      {{ match.home_team }} {{ t('stats.vs') }} {{ match.away_team }}
                    </div>
                    <div class="text-xs text-muted-foreground mt-0.5">
                      {{ match.tournament_title }} · {{ match.home_score ?? '–' }}:{{ match.away_score ?? '–' }}
                    </div>
                  </router-link>
                </TableCell>
                <TableCell class="text-right tabular-nums">{{ match.maps_played }}</TableCell>
                <TableCell class="text-right tabular-nums">{{ formatNumber(match.kills) }}</TableCell>
                <TableCell class="text-right tabular-nums">{{ formatNumber(match.deaths) }}</TableCell>
                <TableCell class="text-right tabular-nums">{{ kd(match.kills, match.deaths) }}</TableCell>
                <TableCell class="text-right tabular-nums">{{ formatNumber(match.damage) }}</TableCell>
                <TableCell class="text-right tabular-nums">{{ formatNumber(match.healing) }}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  </div>
</template>
