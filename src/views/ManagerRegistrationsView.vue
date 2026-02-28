<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useRegistrationManagerStore } from '@/stores/registrationManagerStore'
import ManagerRegistrationsHeader from '@/components/manager/ManagerRegistrationsHeader.vue'
import ManagerRegistrationsFilters from '@/components/manager/ManagerRegistrationsFilters.vue'
import ManagerRegistrationsTable from '@/components/manager/ManagerRegistrationsTable.vue'
import ManagerRegistrationsPagination from '@/components/manager/ManagerRegistrationsPagination.vue'
import RegistrationDetailsDialog from '@/components/manager/RegistrationDetailsDialog.vue'
import type { RegistrationStatus } from '@/types/registrationManager'
import { useI18n } from 'vue-i18n'
import { useDebounceFn } from '@vueuse/core'

const route = useRoute()
const managerStore = useRegistrationManagerStore()
const { t } = useI18n()

const tournamentId = computed(() => Number(route.params.tournamentId))
const tournament = computed(() =>
  managerStore.managedTournaments.find((item) => item.id === tournamentId.value),
)

const registrations = computed(
  () => managerStore.registrationsByTournament[tournamentId.value] ?? [],
)
const loading = computed(
  () => managerStore.registrationsLoadingByTournament[tournamentId.value] ?? false,
)
const total = computed(() => managerStore.registrationsTotalByTournament[tournamentId.value] ?? 0)

const errorMessage = ref<string | null>(null)

const sheetOpen = ref(false)
const selectedRegistrationId = ref<number | null>(null)
const battletagSearch = ref('')
const selectedStatuses = ref<RegistrationStatus[]>(['PENDING', 'PROCESSING', 'ACTION_REQUIRED'])
const sortValue = ref('created_at:desc')
const page = ref(1)
const perPage = ref(50)

const perPageValue = computed({
  get: () => String(perPage.value),
  set: (value: string) => {
    const parsed = Number(value)
    if (!Number.isNaN(parsed)) {
      perPage.value = parsed
    }
  },
})

const statusOptions: RegistrationStatus[] = [
  'PENDING',
  'PROCESSING',
  'ACCEPTED',
  'ACTION_REQUIRED',
  'DECLINED',
  'DELETED',
]

const sortOptions = computed(() => [
  { value: 'created_at:desc', label: t('manager.registrations.filters.sort.created_desc') },
  { value: 'created_at:asc', label: t('manager.registrations.filters.sort.created_asc') },
  { value: 'updated_at:desc', label: t('manager.registrations.filters.sort.updated_desc') },
  { value: 'updated_at:asc', label: t('manager.registrations.filters.sort.updated_asc') },
])

const perPageOptions = [25, 50, 100]

const loadRegistrations = async () => {
  errorMessage.value = null
  if (!tournamentId.value || Number.isNaN(tournamentId.value)) {
    errorMessage.value = t('manager.registrations.invalid_tournament')
    return
  }

  const response = await managerStore.loadRegistrations(tournamentId.value, {
    status: selectedStatuses.value.length ? selectedStatuses.value : undefined,
    sort: sortValue.value,
    page: page.value,
    perPage: perPage.value,
    battletag: battletagSearch.value.trim() || undefined,
  })
  if (!response.success) {
    errorMessage.value = t('manager.registrations.load_error')
  }
}

const debouncedLoad = useDebounceFn(loadRegistrations, 350)

const openRegistration = (registrationId: number) => {
  selectedRegistrationId.value = registrationId
  sheetOpen.value = true
}

const resetFilters = async () => {
  battletagSearch.value = ''
  selectedStatuses.value = ['PENDING', 'PROCESSING', 'ACTION_REQUIRED']
  sortValue.value = 'created_at:desc'
  perPage.value = 50
  page.value = 1
  await loadRegistrations()
}

const refreshRegistrations = async () => {
  await loadRegistrations()
}

watch(tournamentId, async () => {
  page.value = 1
  await loadRegistrations()
})

watch(sortValue, () => {
  page.value = 1
  loadRegistrations()
})

watch(perPage, () => {
  page.value = 1
  loadRegistrations()
})

watch(
  selectedStatuses,
  () => {
    page.value = 1
    loadRegistrations()
  },
  { deep: true },
)

watch(battletagSearch, () => {
  page.value = 1
  debouncedLoad()
})

watch(page, () => {
  loadRegistrations()
})

onMounted(async () => {
  if (!managerStore.managedTournaments.length) {
    await managerStore.loadManagedTournaments()
  }
  await loadRegistrations()
})
</script>

<template>
  <div class="page-shell">
    <ManagerRegistrationsHeader
      :title="tournament?.title || t('manager.registrations.title')"
      :tournament-id="tournamentId"
    />

    <ManagerRegistrationsFilters
      :battletag-search="battletagSearch"
      :sort-value="sortValue"
      :per-page-value="perPageValue"
      :per-page-options="perPageOptions"
      :sort-options="sortOptions"
      :status-options="statusOptions"
      :selected-statuses="selectedStatuses"
      @update:battletag-search="(value) => (battletagSearch = value)"
      @update:sort-value="(value) => (sortValue = value)"
      @update:per-page-value="(value) => (perPageValue = value)"
      @update:selected-statuses="(value) => (selectedStatuses = value)"
      @reset="resetFilters"
      @refresh="refreshRegistrations"
    />

    <div
      v-if="errorMessage"
      class="rounded-2xl border border-destructive/40 bg-destructive/10 p-4"
      role="alert"
    >
      <p class="text-sm text-destructive">{{ errorMessage }}</p>
    </div>

    <div v-else>
      <ManagerRegistrationsTable
        :registrations="registrations"
        :loading="loading"
        @open="openRegistration"
      />
    </div>

    <div
      v-if="!loading && !errorMessage"
      class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <ManagerRegistrationsPagination
        :page="page"
        :per-page="perPage"
        :total="total"
        :loading="loading"
        @update:page="(value) => (page = value)"
      />
    </div>

    <RegistrationDetailsDialog v-model:open="sheetOpen" :registration-id="selectedRegistrationId" />
  </div>
</template>
