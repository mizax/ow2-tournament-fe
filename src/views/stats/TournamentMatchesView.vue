<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { fetchTournamentMatches } from '@/services/publicStatsApi'
import type { MatchSummary } from '@/types/stats'
import { Skeleton } from '@/components/ui/skeleton'

const props = withDefaults(
  defineProps<{
    embedded?: boolean
  }>(),
  {
    embedded: false,
  },
)

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
  <div class="w-full" :class="props.embedded ? 'space-y-4' : 'page-shell'">
    <section v-if="!props.embedded" class="page-head">
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
      <h1 class="page-title mt-2">{{ t('stats.matches') }}</h1>
    </section>

    <div v-if="isLoading" class="space-y-3" role="status" aria-live="polite">
      <Skeleton v-for="i in 6" :key="i" class="h-24 w-full rounded-2xl" />
    </div>

    <div
      v-else-if="error"
      class="text-center text-muted-foreground"
      :class="props.embedded ? 'py-12' : 'py-20'"
      role="alert"
    >
      {{ error }}
    </div>

    <div
      v-else-if="matches.length === 0"
      class="text-center text-muted-foreground"
      :class="props.embedded ? 'py-12' : 'py-20'"
    >
      {{ t('stats.no-data') }}
    </div>

    <div
      v-else
      class="divide-y divide-border/50 border border-border/60 bg-background/35"
      :class="props.embedded ? 'rounded-lg' : 'rounded-xl'"
    >
      <router-link
        v-for="match in matches"
        :key="match.id"
        :to="`/tournament/${tournamentSef}/match/${match.id}`"
        class="match-row group block px-4 py-4 transition-colors hover:bg-primary/7 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-inset"
      >
        <div class="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 sm:gap-4">
          <span
            class="truncate text-base font-semibold leading-tight text-primary"
            :title="match.home_team"
            >{{ match.home_team }}</span
          >
          <div class="flex items-center gap-2 shrink-0">
            <span
              :class="[
                'text-2xl font-bold tabular-nums',
                match.home_score != null &&
                match.away_score != null &&
                match.home_score > match.away_score
                  ? 'text-primary'
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
                  ? 'text-destructive'
                  : 'text-foreground',
              ]"
            >
              {{ match.away_score ?? '–' }}
            </span>
          </div>
          <span
            class="truncate text-right text-base font-semibold leading-tight text-destructive"
            :title="match.away_team"
            >{{ match.away_team }}</span
          >
        </div>

        <div v-if="match.maps.length > 0" class="mt-3 flex flex-wrap gap-1.5">
          <div
            v-for="map in match.maps"
            :key="map.map_order"
            :class="[
              'rounded-md border px-2.5 py-1 text-xs flex items-center gap-1.5',
              map.home_score > map.away_score
                ? 'border-primary/35 bg-primary/14 text-primary'
                : map.home_score < map.away_score
                  ? 'border-destructive/35 bg-destructive/14 text-destructive'
                  : 'border-border/60 bg-muted/55 text-muted-foreground',
            ]"
          >
            <span>{{ map.map_name ?? t('stats.map') }}</span>
            <span class="font-semibold tabular-nums"
              >{{ map.home_score }}:{{ map.away_score }}</span
            >
          </div>
        </div>
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.match-row {
  position: relative;
}

.match-row::before {
  content: '';
  position: absolute;
  left: 0;
  top: 20%;
  bottom: 20%;
  width: 2px;
  border-radius: 9999px;
  background: color-mix(in oklch, var(--color-primary) 65%, transparent);
  opacity: 0;
  transition: opacity 180ms ease-out;
}

.match-row:hover::before,
.match-row:focus-visible::before {
  opacity: 0.9;
}
</style>
