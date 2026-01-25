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

const route = useRoute()
const managerStore = useRegistrationManagerStore()

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
    return 'N/A'
  }
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return 'N/A'
  }
  return format(parsed, DATE_FORMAT_EXTENDED)
}

const roleLabel = (role?: RoleValue | null) => {
  switch (role) {
    case RoleValue.TANK:
      return 'Tank'
    case RoleValue.DAMAGE:
      return 'Damage'
    case RoleValue.SUPPORT:
      return 'Support'
    case RoleValue.FLEX:
      return 'Flex'
    default:
      return 'N/A'
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

const loadRegistrations = async () => {
  errorMessage.value = null
  if (!tournamentId.value || Number.isNaN(tournamentId.value)) {
    errorMessage.value = 'Invalid tournament id.'
    return
  }

  const response = await managerStore.loadRegistrations(tournamentId.value)
  if (!response.success) {
    errorMessage.value = 'Unable to load registrations.'
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
          Back to dashboard
        </Button>
        <h1 class="text-2xl font-semibold tracking-tight">
          {{ tournament?.title || 'Registration management' }}
        </h1>
        <p class="text-sm text-muted-foreground">Tournament ID: {{ tournamentId }}</p>
      </div>
    </div>

    <div v-if="loading" class="flex items-center justify-center gap-2 text-muted-foreground">
      <Spinner class="animate-spin" />
      <span>Loading registrations...</span>
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
            <TableHead>ID</TableHead>
            <TableHead>BattleTag</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Roles</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Updated</TableHead>
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
                {{ registration.status }}
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
            No registrations found.
          </TableEmpty>
        </TableBody>
      </Table>
    </div>

    <RegistrationDetailsSheet v-model:open="sheetOpen" :registration-id="selectedRegistrationId" />
  </div>
</template>
