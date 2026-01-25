<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRegistrationManagerStore } from '@/stores/registrationManagerStore'
import { Spinner } from '@/components/ui/spinner'
import ManagedTournamentCard from '@/components/manager/ManagedTournamentCard.vue'
import { useI18n } from 'vue-i18n'

const managerStore = useRegistrationManagerStore()
const { t } = useI18n()

const tournaments = computed(() => managerStore.managedTournaments)
const loading = computed(() => managerStore.managedTournamentsLoading)

onMounted(() => {
  managerStore.loadManagedTournaments()
})
</script>

<template>
  <div class="container mx-auto py-10">
    <div class="space-y-1 text-center mb-8">
      <h1 class="text-2xl font-semibold tracking-tight">{{ t('manager.dashboard.title') }}</h1>
      <p class="text-sm text-muted-foreground">{{ t('manager.dashboard.subtitle') }}</p>
    </div>

    <div v-if="loading" class="flex items-center justify-center gap-2 text-muted-foreground">
      <Spinner class="animate-spin" />
      <span>{{ t('manager.dashboard.loading') }}</span>
    </div>

    <div v-else-if="!tournaments.length" class="text-center text-sm text-muted-foreground">
      {{ t('manager.dashboard.empty') }}
    </div>

    <div v-else class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <ManagedTournamentCard
        v-for="tournament in tournaments"
        :key="tournament.id"
        :tournament="tournament"
      />
    </div>
  </div>
</template>
