<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRegistrationManagerStore } from '@/stores/registrationManagerStore'
import { Spinner } from '@/components/ui/spinner'
import ManagedTournamentCard from '@/components/manager/ManagedTournamentCard.vue'
import { useI18n } from 'vue-i18n'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/authStore'
import CreateTournamentDialog from '@/components/manager/CreateTournamentDialog.vue'

const managerStore = useRegistrationManagerStore()
const authStore = useAuthStore()
const { t } = useI18n()
const createDialogOpen = ref(false)

const tournaments = computed(() => managerStore.managedTournaments)
const loading = computed(() => managerStore.managedTournamentsLoading)
const canCreateTournament = computed(() => authStore.hasAuthority('create_tournament'))

onMounted(() => {
  managerStore.loadManagedTournaments()
})

const onCreatedTournament = () => {
  managerStore.loadManagedTournaments()
}
</script>

<template>
  <div class="page-shell">
    <section class="page-head">
      <p class="page-kicker">Control Room</p>
      <div class="mt-2 flex flex-wrap items-center justify-between gap-3">
        <h1 class="page-title">{{ t('manager.dashboard.title') }}</h1>
        <Button v-if="canCreateTournament" @click="createDialogOpen = true">
          {{ t('manager.dashboard.create.open') }}
        </Button>
      </div>
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

    <CreateTournamentDialog
      v-model:open="createDialogOpen"
      @created="onCreatedTournament"
    />
  </div>
</template>
