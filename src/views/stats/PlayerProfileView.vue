<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { fetchPlayer, fetchPlayerMatches } from '@/services/publicStatsApi'

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
</script>

<template>
  <div class="container mx-auto py-8 px-4">
    <div class="mb-6">
      <router-link
        to="/"
        class="text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        ←
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
      <div class="rounded-xl border border-white/10 bg-card p-6">
        <div class="flex flex-wrap items-start gap-4">
          <div class="flex-1 min-w-0">
            <h1 class="text-2xl font-bold truncate">{{ profile.nickname }}</h1>
            <div v-if="profile.battletag" class="mt-1 text-sm text-muted-foreground">
              {{ profile.battletag }}
            </div>
          </div>
          <span
            v-if="profile.role"
            class="shrink-0 rounded-full bg-primary/10 text-primary px-3 py-1 text-sm font-medium"
          >
            {{ roleLabels[profile.role] ?? profile.role }}
          </span>
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
      </div>

      <!-- Match history -->
      <div>
        <h2 class="text-lg font-semibold mb-3">{{ t('stats.match-history') }}</h2>

        <div v-if="matchHistory.length === 0" class="text-center py-10 text-muted-foreground rounded-xl border border-white/10 bg-card">
          {{ t('stats.no-data') }}
        </div>

        <div v-else class="overflow-x-auto rounded-xl border border-white/10 bg-card">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-white/10 text-xs text-muted-foreground uppercase">
                <th class="py-3 px-4 text-left font-medium">{{ t('stats.match') }}</th>
                <th class="py-3 px-4 text-right font-medium">{{ t('stats.maps') }}</th>
                <th class="py-3 px-4 text-right font-medium">{{ t('stats.kills') }}</th>
                <th class="py-3 px-4 text-right font-medium">{{ t('stats.deaths') }}</th>
                <th class="py-3 px-4 text-right font-medium">{{ t('stats.kd') }}</th>
                <th class="py-3 px-4 text-right font-medium">{{ t('stats.damage') }}</th>
                <th class="py-3 px-4 text-right font-medium">{{ t('stats.healing') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="match in matchHistory"
                :key="match.match_id"
                class="border-b border-white/5 hover:bg-white/5 transition-colors"
              >
                <td class="py-3 px-4">
                  <router-link
                    :to="`/match/${match.match_id}`"
                    class="hover:text-primary transition-colors"
                  >
                    <div class="font-medium">
                      {{ match.home_team }} {{ t('stats.vs') }} {{ match.away_team }}
                    </div>
                    <div class="text-xs text-muted-foreground mt-0.5">
                      {{ match.tournament_title }} · {{ match.home_score ?? '–' }}:{{ match.away_score ?? '–' }}
                    </div>
                  </router-link>
                </td>
                <td class="py-3 px-4 text-right tabular-nums">{{ match.maps_played }}</td>
                <td class="py-3 px-4 text-right tabular-nums">{{ formatNumber(match.kills) }}</td>
                <td class="py-3 px-4 text-right tabular-nums">{{ formatNumber(match.deaths) }}</td>
                <td class="py-3 px-4 text-right tabular-nums">{{ kd(match.kills, match.deaths) }}</td>
                <td class="py-3 px-4 text-right tabular-nums">{{ formatNumber(match.damage) }}</td>
                <td class="py-3 px-4 text-right tabular-nums">{{ formatNumber(match.healing) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
