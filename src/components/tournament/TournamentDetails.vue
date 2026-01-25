<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { fetchWithoutAuth } from '@/services/apiService'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import TournamentHero from './details/TournamentHero.vue'
import OverviewTab from './details/OverviewTab.vue'
import ParticipationTab from './details/ParticipationTab.vue'
import ScheduleTab from './details/ScheduleTab.vue'
import RulesTab from './details/RulesTab.vue'
import PrizesTab from './details/PrizesTab.vue'
import StreamTab from './details/StreamTab.vue'

const { t } = useI18n()
const route = useRoute()
const { tournamentSef } = route.params

// Define the tournament type based on JSON schema
interface TournamentDetails {
  id: string
  title: string
  discipline: string
  format: string
  type: string
  organizers?: Array<{ role: string; name: string; contact?: string }>
  rules?: {
    full_rules_url?: string
    version?: string
    last_update?: string
  }
  eligibility?: {
    min_rank?: string
    min_competitive_hours?: number
    min_calibrated_seasons?: number
    wins_current_season_main_role?: number
    subscription?: {
      twitch_channel?: string
      donation_amount_rub?: number
      donation_url?: string
    }
    verification_battletag?: string
  }
  registration?: {
    start?: string
    deadline?: string
    checkin?: {
      from?: string
      to?: string
      platform?: string
      platform_url?: string
    }
  }
  schedule: Array<{
    day: number
    date: string
    stage: string
    start_time: string
  }>
  prize_pool: {
    currency: string
    places: Array<{ place: number; amount: number }>
  }
  stream?: {
    platform?: string
    channel?: string
  }
  markdown?: {
    description?: string
    notes?: string
    full_regulation?: string
  }
}

const tournament = ref<TournamentDetails | null>(null)
const isLoading = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    const response = await fetchWithoutAuth<TournamentDetails>(
      `/api/public/v1/tournaments/${tournamentSef}`,
    )

    if (!response.success) {
      throw new Error(response.errorCode || 'unknown_error')
    }

    tournament.value = response.data!
  } catch (err) {
    console.error('Error fetching tournament details:', err)
    error.value = t('tournament.error.loading')
  } finally {
    isLoading.value = false
  }
})
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

    <Tabs default-value="overview" class="w-full">
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
