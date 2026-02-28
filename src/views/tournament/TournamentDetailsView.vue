<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTournamentStore } from '@/stores/tournamentStore'

import TournamentHero from '@/components/tournament/details/TournamentHero.vue'
import OverviewTab from '@/components/tournament/details/OverviewTab.vue'
import ParticipationTab from '@/components/tournament/details/ParticipationTab.vue'
import PlayersTab from '@/components/tournament/details/PlayersTab.vue'
import ScheduleTab from '@/components/tournament/details/ScheduleTab.vue'
import RulesTab from '@/components/tournament/details/RulesTab.vue'
import PrizesTab from '@/components/tournament/details/PrizesTab.vue'
import StreamTab from '@/components/tournament/details/StreamTab.vue'
import TournamentMatchesView from '@/views/stats/TournamentMatchesView.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const tournamentStore = useTournamentStore()
const tournamentSef = computed(() => String(route.params.tournamentSef ?? ''))
const tabValues = [
  'overview',
  'participation',
  'players',
  'matches',
  'schedule',
  'rules',
  'prizes',
  'stream',
] as const
const defaultTab = 'overview'
const activeTab = computed({
  get: () => {
    const queryValue = String(route.query.tab ?? '')
    return tabValues.includes(queryValue as (typeof tabValues)[number]) ? queryValue : defaultTab
  },
  set: (value) => {
    const nextValue = tabValues.includes(value as (typeof tabValues)[number]) ? value : defaultTab

    if (route.query.tab !== nextValue) {
      router.replace({
        query: {
          ...route.query,
          tab: nextValue,
        },
      })
    }
  },
})

const tournament = computed(() =>
  tournamentSef.value ? (tournamentStore.tournaments[tournamentSef.value] ?? null) : null,
)
const isLoading = ref(!tournament.value)
const error = ref<string | null>(null)
const loadTournament = async () => {
  if (!tournamentSef.value) {
    error.value = t('tournament.error.loading')
    isLoading.value = false
    return
  }

  if (tournament.value) {
    error.value = null
    isLoading.value = false
    return
  }

  isLoading.value = true
  const response = await tournamentStore.fetchTournament(tournamentSef.value)

  if (!response.success) {
    console.error('Error fetching tournament details:', response.errorCode)
    error.value = t('tournament.error.loading')
  } else {
    error.value = null
  }

  isLoading.value = false
}

onMounted(loadTournament)
watch(tournamentSef, loadTournament)
</script>

<template>
  <div v-if="isLoading" class="flex justify-center py-20" role="status" aria-live="polite">
    <div class="h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
  </div>

  <div v-else-if="error" class="py-20 text-center text-destructive" role="alert">
    {{ error }}
  </div>

  <div v-else-if="tournament" class="w-full space-y-4 py-4">
    <TournamentHero
      :tournament="tournament"
      class="mb-0 border-0 bg-transparent shadow-none ring-0"
    />
    <div class="h-px bg-border/70"></div>
    <Tabs v-model="activeTab" class="w-full">
      <div class="px-1 md:px-2">
        <div class="flex flex-col gap-3 pb-3 md:flex-row md:items-center">
          <TabsList
            :aria-label="t('tournament.tabs.navigation')"
            class="tabs-scroll flex w-full flex-nowrap items-center justify-start gap-2 overflow-x-auto text-xs uppercase tracking-[0.08em] md:flex-wrap"
          >
            <TabsTrigger
              value="overview"
              class="cursor-pointer flex-none px-3 py-2 data-[state=active]:text-foreground"
            >
              {{ t('tournament.tabs.overview') }}
            </TabsTrigger>
            <TabsTrigger
              value="participation"
              class="cursor-pointer flex-none px-3 py-2 data-[state=active]:text-foreground"
            >
              {{ t('tournament.tabs.participation') }}
            </TabsTrigger>
            <TabsTrigger
              value="players"
              class="cursor-pointer flex-none px-3 py-2 data-[state=active]:text-foreground"
            >
              {{ t('tournament.tabs.players') }}
            </TabsTrigger>
            <TabsTrigger
              value="matches"
              class="cursor-pointer flex-none px-3 py-2 data-[state=active]:text-foreground"
            >
              {{ t('stats.matches') }}
            </TabsTrigger>
            <TabsTrigger
              value="schedule"
              class="cursor-pointer flex-none px-3 py-2 data-[state=active]:text-foreground"
            >
              {{ t('tournament.tabs.schedule') }}
            </TabsTrigger>
            <TabsTrigger
              value="rules"
              class="cursor-pointer flex-none px-3 py-2 data-[state=active]:text-foreground"
            >
              {{ t('tournament.tabs.rules') }}
            </TabsTrigger>
            <TabsTrigger
              value="prizes"
              class="cursor-pointer flex-none px-3 py-2 data-[state=active]:text-foreground"
            >
              {{ t('tournament.tabs.prizes') }}
            </TabsTrigger>
            <TabsTrigger
              value="stream"
              class="cursor-pointer flex-none px-3 py-2 data-[state=active]:text-foreground"
            >
              {{ t('tournament.tabs.stream') }}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" class="mt-5">
          <OverviewTab
            :organizers="tournament.organizers || []"
            :description="tournament.markdown?.description || ''"
            :summary="tournament.results?.summary"
            :placements="tournament.results?.placements"
            :mvp="tournament.results?.mvp"
            :vod-url="tournament.media?.vod_url"
            :bracket-url="tournament.media?.bracket_url"
          />
        </TabsContent>

        <TabsContent value="participation" class="mt-5">
          <ParticipationTab
            :eligibility="tournament.eligibility"
            :registration="tournament.registration"
            :notes="tournament.markdown?.notes"
          />
        </TabsContent>

        <TabsContent value="players" class="mt-5">
          <PlayersTab :tournament-sef="tournament.id" />
        </TabsContent>

        <TabsContent value="matches" class="mt-5">
          <TournamentMatchesView embedded />
        </TabsContent>

        <TabsContent value="schedule" class="mt-5">
          <ScheduleTab :schedule="tournament.schedule" />
        </TabsContent>

        <TabsContent value="rules" class="mt-5">
          <RulesTab
            :rules="tournament.rules || {}"
            :regulation="tournament.markdown?.full_regulation"
          />
        </TabsContent>

        <TabsContent value="prizes" class="mt-5">
          <PrizesTab :prize-pool="tournament.prize_pool" />
        </TabsContent>

        <TabsContent value="stream" class="mt-5">
          <StreamTab :stream="tournament.stream" :tournament-sef="tournament.id" />
        </TabsContent>
      </div>
    </Tabs>
  </div>
</template>

<style scoped>
.tabs-scroll {
  scrollbar-width: thin;
  scrollbar-color: color-mix(in oklch, var(--color-primary) 45%, transparent) transparent;
  scroll-padding-inline: 0.5rem;
  -webkit-overflow-scrolling: touch;
}

.tabs-scroll::-webkit-scrollbar {
  height: 6px;
}

.tabs-scroll::-webkit-scrollbar-thumb {
  background: color-mix(in oklch, var(--color-primary) 38%, transparent);
  border-radius: 9999px;
}

:deep([data-slot='tabs-content'][data-state='active']) {
  animation: tab-content-enter 180ms ease-out both;
}

@keyframes tab-content-enter {
  from {
    opacity: 0;
    transform: translateY(4px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
