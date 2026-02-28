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
  <div class="page-shell">
    <section class="page-head">
      <p class="page-kicker">Control Room</p>
      <h1 class="page-title mt-2">{{ t('manager.dashboard.title') }}</h1>
      <p class="mt-3 text-sm text-muted-foreground">{{ t('manager.dashboard.subtitle') }}</p>
    </section>

    <div
      v-if="loading"
      class="flex items-center justify-center gap-2 text-muted-foreground"
      role="status"
      aria-live="polite"
    >
      <Spinner class="animate-spin" />
      <span>{{ t('manager.dashboard.loading') }}</span>
    </div>

    <div
      v-else-if="!tournaments.length"
      class="border-y border-dashed border-border/80 py-10 text-center text-sm text-muted-foreground"
    >
      {{ t('manager.dashboard.empty') }}
    </div>

    <div v-else class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      <ManagedTournamentCard
        v-for="tournament in tournaments"
        :key="tournament.id"
        :tournament="tournament"
      />
    </div>
  </div>
</template>
