<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTournamentStore } from '@/stores/tournamentStore'

import TournamentHero from './details/TournamentHero.vue'
import OverviewTab from './details/OverviewTab.vue'
import ParticipationTab from './details/ParticipationTab.vue'
import ScheduleTab from './details/ScheduleTab.vue'
import RulesTab from './details/RulesTab.vue'
import PrizesTab from './details/PrizesTab.vue'
import StreamTab from './details/StreamTab.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const tournamentStore = useTournamentStore()
const tournamentSef = computed(() => String(route.params.tournamentSef ?? ''))
const tabValues = ['overview', 'participation', 'schedule', 'rules', 'prizes', 'stream'] as const
const defaultTab = 'overview'
const activeTab = computed({
  get: () => {
    const queryValue = String(route.query.tab ?? '')
    return tabValues.includes(queryValue as (typeof tabValues)[number]) ? queryValue : defaultTab
  },
  set: (value) => {
    const nextValue = tabValues.includes(value as (typeof tabValues)[number])
      ? value
      : defaultTab

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
  tournamentSef.value ? tournamentStore.tournaments[tournamentSef.value] ?? null : null,
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
    <TournamentHero :tournament="tournament" />

    <Tabs v-model="activeTab" class="w-full">
      <TabsList class="grid w-full grid-cols-3 md:grid-cols-6 mb-8 h-auto">
        <TabsTrigger value="overview" class="py-2">
          {{ t('tournament.tabs.overview') }}
        </TabsTrigger>
        <TabsTrigger value="participation" class="py-2">
          {{ t('tournament.tabs.participation') }}
        </TabsTrigger>
        <TabsTrigger value="schedule" class="py-2">
          {{ t('tournament.tabs.schedule') }}
        </TabsTrigger>
        <TabsTrigger value="rules" class="py-2">
          {{ t('tournament.tabs.rules') }}
        </TabsTrigger>
        <TabsTrigger value="prizes" class="py-2">
          {{ t('tournament.tabs.prizes') }}
        </TabsTrigger>
        <TabsTrigger value="stream" class="py-2">
          {{ t('tournament.tabs.stream') }}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <OverviewTab
          :organizers="tournament.organizers || []"
          :description="tournament.markdown?.description || ''"
        />
      </TabsContent>

      <TabsContent value="participation">
        <ParticipationTab
          :eligibility="tournament.eligibility"
          :registration="tournament.registration"
        />
      </TabsContent>

      <TabsContent value="schedule">
        <ScheduleTab :schedule="tournament.schedule" />
      </TabsContent>

      <TabsContent value="rules">
        <RulesTab
          :rules="tournament.rules || {}"
          :regulation="tournament.markdown?.full_regulation"
        />
      </TabsContent>

      <TabsContent value="prizes">
        <PrizesTab :prize-pool="tournament.prize_pool" />
      </TabsContent>

      <TabsContent value="stream">
        <StreamTab :stream="tournament.stream" />
      </TabsContent>
    </Tabs>
  </div>
</template>

<style scoped></style>
