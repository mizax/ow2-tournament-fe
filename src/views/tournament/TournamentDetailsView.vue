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

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const tournamentStore = useTournamentStore()
const tournamentSef = computed(() => String(route.params.tournamentSef ?? ''))
const tabValues = [
  'overview',
  'participation',
  'players',
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
  <div v-if="isLoading" class="flex justify-center py-20">
    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>

  <div v-else-if="error" class="text-center py-20 text-destructive">
    {{ error }}
  </div>

  <div v-else-if="tournament" class="container mx-auto py-8">
    <div class="rounded-2xl border border-white/10 bg-card overflow-hidden">
      <TournamentHero
        :tournament="tournament"
        class="mb-0 rounded-none border-0 bg-transparent shadow-none ring-0"
      />
      <div class="h-px bg-white/10"></div>
      <div class="px-4 pt-4 md:px-6 md:pt-6">
        <router-link
          :to="`/tournament/${tournament.id}/matches`"
          class="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-muted/40 px-4 py-2 text-sm font-medium hover:bg-white/5 transition-colors"
        >
          {{ t('stats.matches') }}
        </router-link>
      </div>
      <Tabs v-model="activeTab" class="w-full">
        <div class="p-4 md:p-6">
          <TabsList
            class="tabs-scroll flex w-full flex-nowrap items-center justify-start gap-2 overflow-x-auto bg-muted/40 p-1.5 text-xs uppercase tracking-wide md:flex-wrap"
          >
            <TabsTrigger
              value="overview"
              class="cursor-pointer flex-none px-3 py-2 data-[state=active]:bg-white/5 data-[state=active]:text-foreground"
            >
              {{ t('tournament.tabs.overview') }}
            </TabsTrigger>
            <TabsTrigger
              value="participation"
              class="cursor-pointer flex-none px-3 py-2 data-[state=active]:bg-white/5 data-[state=active]:text-foreground"
            >
              {{ t('tournament.tabs.participation') }}
            </TabsTrigger>
            <TabsTrigger
              value="players"
              class="cursor-pointer flex-none px-3 py-2 data-[state=active]:bg-white/5 data-[state=active]:text-foreground"
            >
              {{ t('tournament.tabs.players') }}
            </TabsTrigger>
            <TabsTrigger
              value="schedule"
              class="cursor-pointer flex-none px-3 py-2 data-[state=active]:bg-white/5 data-[state=active]:text-foreground"
            >
              {{ t('tournament.tabs.schedule') }}
            </TabsTrigger>
            <TabsTrigger
              value="rules"
              class="cursor-pointer flex-none px-3 py-2 data-[state=active]:bg-white/5 data-[state=active]:text-foreground"
            >
              {{ t('tournament.tabs.rules') }}
            </TabsTrigger>
            <TabsTrigger
              value="prizes"
              class="cursor-pointer flex-none px-3 py-2 data-[state=active]:bg-white/5 data-[state=active]:text-foreground"
            >
              {{ t('tournament.tabs.prizes') }}
            </TabsTrigger>
            <TabsTrigger
              value="stream"
              class="cursor-pointer flex-none px-3 py-2 data-[state=active]:bg-white/5 data-[state=active]:text-foreground"
            >
              {{ t('tournament.tabs.stream') }}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" class="mt-6">
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

          <TabsContent value="participation" class="mt-6">
            <ParticipationTab
              :eligibility="tournament.eligibility"
              :registration="tournament.registration"
            />
          </TabsContent>

          <TabsContent value="players" class="mt-6">
            <PlayersTab :tournament-sef="tournament.id" />
          </TabsContent>

          <TabsContent value="schedule" class="mt-6">
            <ScheduleTab :schedule="tournament.schedule" />
          </TabsContent>

          <TabsContent value="rules" class="mt-6">
            <RulesTab
              :rules="tournament.rules || {}"
              :regulation="tournament.markdown?.full_regulation"
            />
          </TabsContent>

          <TabsContent value="prizes" class="mt-6">
            <PrizesTab :prize-pool="tournament.prize_pool" />
          </TabsContent>

          <TabsContent value="stream" class="mt-6">
            <StreamTab :stream="tournament.stream" :tournament-sef="tournament.id" />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  </div>
</template>

<style scoped>
.tabs-scroll {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.tabs-scroll::-webkit-scrollbar {
  display: none;
}
</style>
