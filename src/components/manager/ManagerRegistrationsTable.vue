<script setup lang="ts">
import { format } from 'date-fns'
import { DATE_FORMAT_EXTENDED } from '@/util/date'
import { Badge } from '@/components/ui/badge'
import { Copyable } from '@/components/ui/copyable'
import { Spinner } from '@/components/ui/spinner'
import {
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { RoleValue } from '@/components/tournament/registration/types'
import type { RegistrationStatus, RegistrationSummary } from '@/types/registrationManager'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  registrations: RegistrationSummary[]
  loading: boolean
}>()

const emit = defineEmits<{
  (e: 'open', registrationId: number): void
}>()

const { t } = useI18n()

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
</script>

<template>
  <div class="rounded-lg border">
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
        <TableRow v-if="props.loading">
          <TableCell :colspan="6">
            <div class="flex items-center justify-center gap-2 py-6 text-muted-foreground">
              <Spinner class="animate-spin" />
              <span>{{ t('manager.registrations.loading') }}</span>
            </div>
          </TableCell>
        </TableRow>
        <TableRow
          v-for="registration in props.registrations"
          :key="registration.id"
          class="cursor-pointer hover:bg-muted/30"
          @click="emit('open', registration.id)"
        >
          <TableCell class="font-medium">{{ registration.id }}</TableCell>
          <Copyable :as="TableCell" :value="registration.battletag">
            {{ registration.battletag }}
          </Copyable>
          <TableCell>
            <Badge :class="statusBadgeClasses(registration.status)">
              {{ statusLabel(registration.status) }}
            </Badge>
          </TableCell>
          <TableCell>
            <span class="text-sm text-muted-foreground">
              {{ roleLabel(registration.primary_role) }}
              <span v-if="registration.secondary_role">
                / {{ roleLabel(registration.secondary_role) }}
              </span>
            </span>
          </TableCell>
          <TableCell>{{ formatDate(registration.created_at) }}</TableCell>
          <TableCell>{{ formatDate(registration.updated_at) }}</TableCell>
        </TableRow>
        <TableEmpty v-if="!props.loading && !props.registrations.length" :colspan="6">
          {{ t('manager.registrations.empty') }}
        </TableEmpty>
      </TableBody>
    </Table>
  </div>
</template>
