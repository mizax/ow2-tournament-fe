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
import { getRegistrationStatusBadgeClasses } from '@/lib/registrationStatusUi'

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
  <div class="overflow-hidden rounded-2xl border border-border/70 bg-card/70">
    <Table>
      <TableHeader>
        <TableRow class="bg-muted/40 hover:bg-muted/40">
          <TableHead>{{ t('manager.registrations.table.id') }}</TableHead>
          <TableHead>{{ t('manager.registrations.table.battletag') }}</TableHead>
          <TableHead>{{ t('manager.registrations.table.status') }}</TableHead>
          <TableHead class="hidden sm:table-cell">
            {{ t('manager.registrations.table.roles') }}
          </TableHead>
          <TableHead class="hidden sm:table-cell">
            {{ t('manager.registrations.table.created') }}
          </TableHead>
          <TableHead class="hidden sm:table-cell">
            {{ t('manager.registrations.table.updated') }}
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-if="props.loading">
          <TableCell :colspan="6">
            <div
              class="flex items-center justify-center gap-2 py-6 text-muted-foreground"
              role="status"
              aria-live="polite"
            >
              <Spinner class="animate-spin" />
              <span>{{ t('manager.registrations.loading') }}</span>
            </div>
          </TableCell>
        </TableRow>
        <TableRow
          v-for="registration in props.registrations"
          :key="registration.id"
          class="cursor-pointer hover:bg-primary/8"
          @click="emit('open', registration.id)"
        >
          <TableCell class="font-medium">{{ registration.id }}</TableCell>
          <Copyable :as="TableCell" :value="registration.battletag" class="items-start gap-2">
            <div class="space-y-1 leading-tight">
              <div class="flex items-center gap-1.5">
                <span>{{ registration.battletag }}</span>
              </div>
              <div class="text-xs text-muted-foreground sm:hidden">
                {{ roleLabel(registration.primary_role) }}
                <span v-if="registration.secondary_role">
                  / {{ roleLabel(registration.secondary_role) }}
                </span>
              </div>
            </div>
          </Copyable>
          <TableCell>
            <Badge :class="getRegistrationStatusBadgeClasses(registration.status)">
              {{ statusLabel(registration.status) }}
            </Badge>
          </TableCell>
          <TableCell class="hidden sm:table-cell">
            <span class="text-sm text-muted-foreground">
              {{ roleLabel(registration.primary_role) }}
              <span v-if="registration.secondary_role">
                / {{ roleLabel(registration.secondary_role) }}
              </span>
            </span>
          </TableCell>
          <TableCell class="hidden sm:table-cell">
            {{ formatDate(registration.created_at) }}
          </TableCell>
          <TableCell class="hidden sm:table-cell">
            {{ formatDate(registration.updated_at) }}
          </TableCell>
        </TableRow>
        <TableEmpty v-if="!props.loading && !props.registrations.length" :colspan="6">
          {{ t('manager.registrations.empty') }}
        </TableEmpty>
      </TableBody>
    </Table>
  </div>
</template>
