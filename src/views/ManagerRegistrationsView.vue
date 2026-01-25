<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { format } from 'date-fns'
import { DATE_FORMAT_EXTENDED } from '@/util/date'
import { useRegistrationManagerStore } from '@/stores/registrationManagerStore'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Spinner } from '@/components/ui/spinner'
import RegistrationDetailsSheet from '@/components/manager/RegistrationDetailsSheet.vue'
import { RoleValue } from '@/components/tournament/registration/types'
import type { RegistrationStatus } from '@/types/registrationManager'
import { Copyable } from '@/components/ui/copyable'
import { useI18n } from 'vue-i18n'

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

const errorMessage = ref<string | null>(null)

const sheetOpen = ref(false)
const selectedRegistrationId = ref<number | null>(null)

const formatDate = (value?: string) => {
  if (!value) {
    return t('manager.common.not_available')
  }
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return t('manager.common.not_available')
  }
  return format(parsed, DATE_FORMAT_EXTENDED)
}

const roleLabel = (role?: RoleValue | null) => {
  switch (role) {
    case RoleValue.TANK:
      return t('tournament.registration_form.roles.options.tank')
    case RoleValue.DAMAGE:
      return t('tournament.registration_form.roles.options.damage')
    case RoleValue.SUPPORT:
      return t('tournament.registration_form.roles.options.support')
    case RoleValue.FLEX:
      return t('tournament.registration_form.roles.options.flex')
    default:
      return t('manager.common.not_available')
  }
}

const statusBadgeClasses = (status?: RegistrationStatus) => {
  switch (status) {
    case 'ACCEPTED':
      return 'bg-[oklch(0.5_0.1751_141.88)]'
    case 'DECLINED':
      return 'bg-black text-white'
    case 'PENDING':
      return 'bg-[oklch(0.764_0.1392_100.59)] text-black'
    case 'PROCESSING':
      return 'bg-[oklch(0.5412_0.1357_50.82)] text-white'
    case 'ACTION_REQUIRED':
      return 'bg-[oklch(0.4588_0.1702_15.88)] text-white'
    case 'DELETED':
      return 'bg-muted text-muted-foreground'
    default:
      return 'bg-muted text-muted-foreground'
  }
}

const statusLabel = (status?: RegistrationStatus) => {
  switch (status) {
    case 'PENDING':
      return t('manager.statuses.pending')
    case 'PROCESSING':
      return t('manager.statuses.processing')
    case 'ACCEPTED':
      return t('manager.statuses.accepted')
    case 'ACTION_REQUIRED':
      return t('manager.statuses.action_required')
    case 'DECLINED':
      return t('manager.statuses.declined')
    case 'DELETED':
      return t('manager.statuses.deleted')
    default:
      return t('manager.common.not_available')
  }
}

const loadRegistrations = async () => {
  errorMessage.value = null
  if (!tournamentId.value || Number.isNaN(tournamentId.value)) {
    errorMessage.value = t('manager.registrations.invalid_tournament')
    return
  }

  const response = await managerStore.loadRegistrations(tournamentId.value)
  if (!response.success) {
    errorMessage.value = t('manager.registrations.load_error')
  }
}

const openRegistration = (registrationId: number) => {
  selectedRegistrationId.value = registrationId
  sheetOpen.value = true
}

watch(tournamentId, loadRegistrations)

onMounted(async () => {
  if (!managerStore.managedTournaments.length) {
    await managerStore.loadManagedTournaments()
  }
  await loadRegistrations()
})
</script>

<template>
  <div class="container mx-auto py-10 space-y-6">
    <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <Button variant="link" :as="RouterLink" to="/manager" class="p-0">
          {{ t('manager.registrations.back') }}
        </Button>
        <h1 class="text-2xl font-semibold tracking-tight">
          {{ tournament?.title || t('manager.registrations.title') }}
        </h1>
        <p class="text-sm text-muted-foreground">
          {{ t('manager.registrations.tournament_id', { id: tournamentId }) }}
        </p>
      </div>
    </div>

    <div v-if="loading" class="flex items-center justify-center gap-2 text-muted-foreground">
      <Spinner class="animate-spin" />
      <span>{{ t('manager.registrations.loading') }}</span>
    </div>

    <div
      v-else-if="errorMessage"
      class="rounded-lg border border-destructive/40 bg-destructive/10 p-4"
    >
      <p class="text-sm text-destructive">{{ errorMessage }}</p>
    </div>

    <div v-else class="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{{ t('manager.registrations.table.id') }}</TableHead>
            <TableHead>{{ t('manager.registrations.table.battletag') }}</TableHead>
            <TableHead>{{ t('manager.registrations.table.status') }}</TableHead>
            <TableHead>{{ t('manager.registrations.table.roles') }}</TableHead>
            <TableHead>{{ t('manager.registrations.table.created') }}</TableHead>
            <TableHead>{{ t('manager.registrations.table.updated') }}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow
            v-for="registration in registrations"
            :key="registration.id"
            class="cursor-pointer hover:bg-muted/30"
            @click="openRegistration(registration.id)"
          >
            <TableCell class="font-medium">{{ registration.id }}</TableCell>
            <Copyable :as="TableCell" :value="registration.battletag">{{ registration.battletag }}</Copyable>
            <TableCell>
              <Badge :class="statusBadgeClasses(registration.status)">
                {{ statusLabel(registration.status) }}
              </Badge>
            </TableCell>
            <TableCell>
              <span class="text-sm text-muted-foreground">
                {{ roleLabel(registration.primary_role) }}
                <span v-if="registration.secondary_role"
                  >/ {{ roleLabel(registration.secondary_role) }}</span
                >
              </span>
            </TableCell>
            <TableCell>{{ formatDate(registration.created_at) }}</TableCell>
            <TableCell>{{ formatDate(registration.updated_at) }}</TableCell>
          </TableRow>
          <TableEmpty v-if="!registrations.length" :colspan="6">
            {{ t('manager.registrations.empty') }}
          </TableEmpty>
        </TableBody>
      </Table>
    </div>

    <RegistrationDetailsSheet v-model:open="sheetOpen" :registration-id="selectedRegistrationId" />
  </div>
</template>
