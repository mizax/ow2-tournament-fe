<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import { toast } from 'vue-sonner'
import { format } from 'date-fns'
import { DATE_FORMAT_EXTENDED } from '@/util/date'
import { roleValues, RoleValue } from '@/components/tournament/registration/types'
import type {
  RegistrationDetailResponse,
  RegistrationStatus,
  RoleRankingAssignment,
} from '@/types/registrationManager'
import { useRegistrationManagerStore } from '@/stores/registrationManagerStore'
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogScrollContent,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { Copyable } from '@/components/ui/copyable'
import { useI18n } from 'vue-i18n'
import RegistrationDetailsSummary from '@/components/manager/registration-details/RegistrationDetailsSummary.vue'
import RegistrationDetailsActions from '@/components/manager/registration-details/RegistrationDetailsActions.vue'
import RegistrationDetailsComments from '@/components/manager/registration-details/RegistrationDetailsComments.vue'
import RegistrationDetailsRequestInfo from '@/components/manager/registration-details/RegistrationDetailsRequestInfo.vue'
import RegistrationDetailsStatusControl from '@/components/manager/registration-details/RegistrationDetailsStatusControl.vue'
import RegistrationDetailsRoleRankings from '@/components/manager/registration-details/RegistrationDetailsRoleRankings.vue'
import { Separator } from '@/components/ui/separator'

const props = defineProps<{ open: boolean; registrationId: number | null }>()
const emit = defineEmits<{ (e: 'update:open', value: boolean): void }>()

const managerStore = useRegistrationManagerStore()
const { t } = useI18n()
const localStatus = ref<RegistrationStatus | ''>('')
const declineReason = ref('')
const requestedActionDescription = ref('')
const commentText = ref('')
const roleRankingDraft = ref<Record<RoleValue, string>>({
  [RoleValue.TANK]: '',
  [RoleValue.DAMAGE]: '',
  [RoleValue.SUPPORT]: '',
  [RoleValue.FLEX]: '',
})
const lastInitializedKey = ref<string | null>(null)
const isDesktop = useMediaQuery('(min-width: 640px)')

const isOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value),
})

const registrationDetails = computed<RegistrationDetailResponse | null>(() => {
  if (!props.registrationId) {
    return null
  }
  return managerStore.registrationDetails[props.registrationId] ?? null
})

const isLoading = computed(() =>
  props.registrationId ? managerStore.registrationDetailsLoading[props.registrationId] : false,
)

const statusOptions: RegistrationStatus[] = [
  'PENDING',
  'PROCESSING',
  'ACCEPTED',
  'ACTION_REQUIRED',
  'DECLINED',
  'DELETED',
]

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

const actionStatusLabel = (status?: 'PENDING' | 'RESOLVED') => {
  switch (status) {
    case 'PENDING':
      return t('manager.action_statuses.pending')
    case 'RESOLVED':
      return t('manager.action_statuses.resolved')
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

const initializeFormState = (details: RegistrationDetailResponse) => {
  localStatus.value = details.registration.status
  declineReason.value = details.registration.decline_reason ?? ''
  requestedActionDescription.value = ''

  const draft: Record<RoleValue, string> = {
    [RoleValue.TANK]: '',
    [RoleValue.DAMAGE]: '',
    [RoleValue.SUPPORT]: '',
    [RoleValue.FLEX]: '',
  }

  details.role_rankings.forEach((ranking) => {
    draft[ranking.role] = String(ranking.ranking)
  })

  roleRankingDraft.value = draft
  commentText.value = ''
}

const buildInitKey = (details: RegistrationDetailResponse) =>
  `${details.registration.id}:${details.registration.status}:${details.registration.updated_at}`

const ensureDetailsLoaded = async (registrationId: number) => {
  const response = await managerStore.loadRegistrationDetails(registrationId)
  if (!response.success) {
    toast.error(t('manager.details.toasts.load_error'))
  }
}

watch(
  () => props.registrationId,
  async (registrationId) => {
    if (!registrationId) {
      return
    }
    await ensureDetailsLoaded(registrationId)
  },
)

watch(
  () => registrationDetails.value,
  (details) => {
    if (!details) {
      return
    }
    const key = buildInitKey(details)
    if (key === lastInitializedKey.value) {
      return
    }
    lastInitializedKey.value = key
    initializeFormState(details)
  },
  { immediate: true },
)

const submitStatusUpdate = async () => {
  if (!props.registrationId || !localStatus.value) {
    return
  }

  const payload = {
    status: localStatus.value,
  } as {
    status: RegistrationStatus
    decline_reason?: string | null
    requested_action_description?: string | null
  }

  if (localStatus.value === 'DECLINED') {
    payload.decline_reason = declineReason.value || null
  }

  if (localStatus.value === 'ACTION_REQUIRED') {
    payload.requested_action_description = requestedActionDescription.value || null
  }

  const response = await managerStore.updateRegistrationStatus(props.registrationId, payload)
  if (response.success) {
    toast.success(t('manager.details.toasts.status_updated'))
  } else {
    toast.error(t('manager.details.toasts.status_update_error'))
  }
}

const submitComment = async () => {
  if (!props.registrationId || !commentText.value.trim()) {
    return
  }

  const response = await managerStore.addRegistrationComment(
    props.registrationId,
    commentText.value.trim(),
  )

  if (response.success) {
    commentText.value = ''
    toast.success(t('manager.details.toasts.comment_added'))
  } else {
    toast.error(t('manager.details.toasts.comment_error'))
  }
}

const submitRoleRankings = async () => {
  if (!props.registrationId) {
    return
  }

  const assignments: RoleRankingAssignment[] = roleValues
    .map((role) => {
      let rawValue: string | null = null
      if (typeof roleRankingDraft.value[role] === 'string') {
        rawValue = roleRankingDraft.value[role]?.trim()
      } else {
        rawValue = roleRankingDraft.value[role]
      }
      if (!rawValue) {
        return null
      }
      const ranking = Number(rawValue)
      if (!Number.isFinite(ranking)) {
        return null
      }
      return { role, ranking }
    })
    .filter((assignment): assignment is RoleRankingAssignment => assignment !== null)

  if (!assignments.length) {
    toast.error(t('manager.details.role_rankings.validation'))
    return
  }

  const response = await managerStore.updateRoleRankings(props.registrationId, assignments)
  if (response.success) {
    toast.success(t('manager.details.toasts.rankings_updated'))
  } else {
    toast.error(t('manager.details.toasts.rankings_error'))
  }
}

const resolveAction = async (actionId: number) => {
  if (!props.registrationId) {
    return
  }

  const response = await managerStore.resolveRequestedAction(props.registrationId, actionId)
  if (response.success) {
    toast.success(t('manager.details.toasts.action_resolved'))
  } else {
    toast.error(t('manager.details.toasts.action_resolve_error'))
  }
}
</script>

<template>
  <Dialog v-model:open="isOpen">
    <DialogScrollContent
      class="h-dvh w-full max-w-none rounded-none p-0 bg-background sm:h-auto sm:max-w-4xl sm:rounded-lg lg:max-w-5xl my-0 sm:my-8"
      @open-auto-focus.prevent
    >
      <DialogHeader class="border-b px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 sm:px-6 sm:py-4">
        <DialogTitle class="text-xl font-semibold tracking-tight">
          {{ t('manager.details.title', { id: registrationDetails?.registration.id ?? '' }) }}
        </DialogTitle>
        <DialogDescription class="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Copyable
            class="chip px-2 py-0.5 text-[0.7rem]"
            v-if="registrationDetails?.battletag"
            :value="registrationDetails.battletag"
          >
            {{ registrationDetails.battletag }}
          </Copyable>
          <span v-else>{{ t('manager.details.subtitle') }}</span>
          <Badge
            v-if="registrationDetails?.registration.status"
            :class="`${statusBadgeClasses(registrationDetails.registration.status)} text-[0.7rem] uppercase tracking-wide`"
          >
            {{ statusLabel(registrationDetails.registration.status) }}
          </Badge>
        </DialogDescription>
      </DialogHeader>

      <div class="min-h-dvh bg-background space-y-5 px-4 pt-4 pb-10 sm:min-h-0 sm:bg-transparent sm:space-y-6 sm:px-6 sm:py-6">
        <div
          v-if="isLoading && !registrationDetails"
          class="flex items-center justify-center gap-2 text-muted-foreground"
        >
          <Spinner class="animate-spin" />
          <span>{{ t('manager.details.loading') }}</span>
        </div>

        <div v-else-if="registrationDetails" class="space-y-6 sm:space-y-8">
          <div v-if="isLoading" class="flex items-center gap-2 text-xs text-muted-foreground">
            <Spinner class="h-3.5 w-3.5 animate-spin" />
            <span>{{ t('manager.details.loading') }}</span>
          </div>
          <div class="grid gap-4 sm:gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <div class="order-2 space-y-6 lg:order-1">
              <RegistrationDetailsSummary
                :registration="registrationDetails.registration"
                :registration-id="registrationId"
                :role-label="roleLabel"
              />

              <Separator class="opacity-40" />

              <RegistrationDetailsActions
                :actions="registrationDetails.requested_actions"
                :status-badge-classes="statusBadgeClasses"
                :action-status-label="actionStatusLabel"
                :format-date="formatDate"
                @resolve="resolveAction"
              />

              <Separator class="opacity-40" />

              <RegistrationDetailsComments
                v-model="commentText"
                :comments="registrationDetails.comments"
                :format-date="formatDate"
                @submit="submitComment"
              />

              <Separator class="opacity-40" />

              <RegistrationDetailsRequestInfo
                :registration="registrationDetails.registration"
                :format-date="formatDate"
              />
            </div>

            <div class="order-1 space-y-4 sm:space-y-6 lg:order-2 lg:sticky lg:top-6 lg:self-start">
              <RegistrationDetailsStatusControl
                :is-desktop="isDesktop"
                :status-options="statusOptions"
                :status-label="statusLabel"
                :local-status="localStatus"
                :decline-reason="declineReason"
                :requested-action-description="requestedActionDescription"
                @update:localStatus="(value) => (localStatus = value)"
                @update:declineReason="(value) => (declineReason = value)"
                @update:requestedActionDescription="(value) => (requestedActionDescription = value)"
                @submit="submitStatusUpdate"
              />

              <RegistrationDetailsRoleRankings
                :is-desktop="isDesktop"
                :role-values="roleValues"
                :role-label="roleLabel"
                :model-value="roleRankingDraft"
                @update:modelValue="(value) => (roleRankingDraft = value)"
                @submit="submitRoleRankings"
              />
            </div>
          </div>
          <div class="h-[max(1rem,env(safe-area-inset-bottom))] sm:hidden" />
        </div>

        <div v-else class="text-sm text-muted-foreground">
          {{ t('manager.details.select_prompt') }}
        </div>
      </div>
    </DialogScrollContent>
  </Dialog>
</template>
