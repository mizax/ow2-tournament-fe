<script setup lang="ts">
import { computed, ref, watch } from 'vue'
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Copyable } from '@/components/ui/copyable'
import { useI18n } from 'vue-i18n'

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
const lastInitializedId = ref<number | null>(null)

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
    if (!details || details.registration.id === lastInitializedId.value) {
      return
    }
    lastInitializedId.value = details.registration.id
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
  <Sheet v-model:open="isOpen">
    <SheetContent class="px-2 pb-4 sm:max-w-lg">
      <SheetHeader>
        <SheetTitle>
          {{ t('manager.details.title', { id: registrationDetails?.registration.id ?? '' }) }}
        </SheetTitle>
        <SheetDescription>
          <Copyable class="chip" v-if="registrationDetails?.battletag" :value="registrationDetails.battletag">
            {{ registrationDetails.battletag }}
          </Copyable>
          <span v-else>{{ t('manager.details.subtitle') }}</span>
        </SheetDescription>
      </SheetHeader>

      <div class="flex-1 overflow-y-auto pr-2 space-y-6">
        <div v-if="isLoading" class="flex items-center justify-center gap-2 text-muted-foreground">
          <Spinner class="animate-spin" />
          <span>{{ t('manager.details.loading') }}</span>
        </div>

        <div v-else-if="registrationDetails" class="space-y-6">
          <div class="rounded-lg border p-4 space-y-2">
            <div class="flex items-center justify-between text-sm">
              <span class="text-muted-foreground">{{ t('manager.details.summary.status') }}</span>
              <Badge :class="statusBadgeClasses(registrationDetails.registration.status)">
                {{ statusLabel(registrationDetails.registration.status) }}
              </Badge>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-muted-foreground">{{
                t('manager.details.info.alt_accounts')
              }}</span>
              <div v-if="registrationDetails.registration.alt_accounts?.length" class="flex gap-1">
                <Copyable class="chip" v-for="account in registrationDetails.registration.alt_accounts || []"
                  :key="`alt-${registrationId}-${account}`" :value="account">
                  {{ account }}
                </Copyable>
              </div>
              <span v-else class="text-sm text-muted-foreground">
                {{ t('manager.common.not_available') }}
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-muted-foreground">{{ t('manager.details.info.twitch') }}</span>
              <Copyable class="chip" :value="registrationDetails.registration.twitch">
                {{ registrationDetails.registration.twitch || t('manager.common.not_available') }}
              </Copyable>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-muted-foreground">{{ t('manager.details.info.discord') }}</span>
              <Copyable class="chip" :value="registrationDetails.registration.discord">
                {{ registrationDetails.registration.discord || t('manager.common.not_available') }}
              </Copyable>
            </div>
            <div class="grid gap-2 text-sm">
              <div class="flex items-center justify-between">
                <span class="text-muted-foreground">{{
                  t('manager.details.summary.primary_role')
                }}</span>
                <span>{{ roleLabel(registrationDetails.registration.primary_role) }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-muted-foreground">{{
                  t('manager.details.summary.secondary_role')
                }}</span>
                <span>{{ roleLabel(registrationDetails.registration.secondary_role) }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-muted-foreground">{{
                  t('manager.details.info.guarantors')
                }}</span>
                <div
                  v-if="registrationDetails.registration.guarantors?.length"
                  class="flex gap-1"
                >
                  <Copyable
                    class="chip"
                    v-for="guarantor in registrationDetails.registration.guarantors || []"
                    :key="`gua-${registrationId}-${guarantor}`"
                    :value="guarantor"
                  >
                    {{ guarantor }}
                  </Copyable>
                </div>
                <span v-else class="text-sm text-muted-foreground">
                  {{ t('manager.common.not_available') }}
                </span>
              </div>
              <div class="space-y-1">
                <p class="text-xs text-muted-foreground">
                  {{ t('manager.details.info.additional_info') }}
                </p>
                <div class="rounded-md border p-2 text-sm whitespace-pre-line">
                  {{
                    registrationDetails.registration.additional_info
                      || t('manager.common.not_available')
                  }}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div class="space-y-3">
            <h3 class="text-sm font-semibold">{{ t('manager.details.update_status.title') }}</h3>
            <Select v-model="localStatus">
              <SelectTrigger>
                <SelectValue :placeholder="t('manager.details.update_status.placeholder')" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="status in statusOptions" :key="status" :value="status">
                  {{ statusLabel(status) }}
                </SelectItem>
              </SelectContent>
            </Select>

            <div v-if="localStatus === 'DECLINED'" class="space-y-2">
              <label class="text-xs text-muted-foreground">
                {{ t('manager.details.update_status.decline_reason') }}
              </label>
              <Textarea
                v-model="declineReason"
                :placeholder="t('manager.details.update_status.decline_placeholder')"
              />
            </div>

            <div v-if="localStatus === 'ACTION_REQUIRED'" class="space-y-2">
              <label class="text-xs text-muted-foreground">
                {{ t('manager.details.update_status.requested_action') }}
              </label>
              <Textarea
                v-model="requestedActionDescription"
                :placeholder="t('manager.details.update_status.requested_action_placeholder')"
              />
            </div>

            <Button class="w-full" @click="submitStatusUpdate">
              {{ t('manager.details.update_status.submit') }}
            </Button>
          </div>

          <Separator />

          <div class="space-y-3">
            <h3 class="text-sm font-semibold">
              {{ t('manager.details.role_rankings.title') }}
            </h3>
            <div class="grid gap-2">
              <div v-for="role in roleValues" :key="role" class="flex items-center gap-3">
                <span class="w-24 text-sm">{{ roleLabel(role) }}</span>
                <Input
                  v-model="roleRankingDraft[role]"
                  type="number"
                  min="1"
                  :placeholder="t('manager.details.role_rankings.placeholder')"
                />
              </div>
            </div>
            <Button class="w-full" variant="secondary" @click="submitRoleRankings">
              {{ t('manager.details.role_rankings.submit') }}
            </Button>
          </div>

          <Separator />

          <div class="space-y-3">
            <h3 class="text-sm font-semibold">
              {{ t('manager.details.requested_actions.title') }}
            </h3>
            <div v-if="registrationDetails.requested_actions.length" class="space-y-2">
              <div
                v-for="action in registrationDetails.requested_actions"
                :key="action.id"
                class="rounded-md border p-3 space-y-2"
              >
                <div class="flex items-center justify-between text-sm">
                  <span class="text-muted-foreground">#{{ action.id }}</span>
                  <Badge
                    :class="
                      statusBadgeClasses(
                        action.status === 'RESOLVED' ? 'ACCEPTED' : 'ACTION_REQUIRED',
                      )
                    "
                  >
                    {{ actionStatusLabel(action.status) }}
                  </Badge>
                </div>
                <p class="text-sm">{{ action.description }}</p>
                <div class="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{{ formatDate(action.created_at) }}</span>
                  <Button
                    v-if="action.status === 'PENDING'"
                    size="sm"
                    variant="secondary"
                    @click="resolveAction(action.id)"
                  >
                    {{ t('manager.details.requested_actions.resolve') }}
                  </Button>
                </div>
              </div>
            </div>
            <p v-else class="text-sm text-muted-foreground">
              {{ t('manager.details.requested_actions.empty') }}
            </p>
          </div>

          <Separator />

          <div class="space-y-3">
            <h3 class="text-sm font-semibold">{{ t('manager.details.comments.title') }}</h3>
            <div v-if="registrationDetails.comments.length" class="space-y-2">
              <div
                v-for="comment in registrationDetails.comments"
                :key="comment.id"
                class="rounded-md border p-3 text-sm space-y-1"
              >
                <p>{{ comment.comment }}</p>
                <p class="text-xs text-muted-foreground">{{ formatDate(comment.created_at) }}</p>
              </div>
            </div>
            <p v-else class="text-sm text-muted-foreground">
              {{ t('manager.details.comments.empty') }}
            </p>
            <Textarea
              v-model="commentText"
              :placeholder="t('manager.details.comments.placeholder')"
            />
            <Button class="w-full" variant="secondary" @click="submitComment">
              {{ t('manager.details.comments.submit') }}
            </Button>
          </div>

          <Separator />

          <div class="space-y-3">
            <h3 class="text-sm font-semibold">{{ t('manager.details.info.title') }}</h3>
            <div class="grid gap-2 text-sm">
              <div class="flex items-center justify-between">
                <span class="text-muted-foreground">
                  {{ t('manager.details.info.rules_accepted') }}
                </span>
                <span>
                  {{
                    registrationDetails.registration.rules_accepted
                      ? t('manager.details.info.yes')
                      : t('manager.details.info.no')
                  }}
                </span>
              </div>
              <div
                v-if="registrationDetails.registration.decline_reason"
                class="flex items-center justify-between"
              >
                <span class="text-muted-foreground">
                  {{ t('manager.details.info.decline_reason') }}
                </span>
                <span class="text-right">{{
                  registrationDetails.registration.decline_reason
                }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-muted-foreground">{{ t('manager.details.info.ip_address') }}</span>
                <span>
                  {{ registrationDetails.registration.ip_address || t('manager.common.not_available') }}
                </span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-muted-foreground">{{ t('manager.details.info.user_agent') }}</span>
                <span class="text-right text-xs text-muted-foreground">
                  {{
                    registrationDetails.registration.user_agent
                      || t('manager.common.not_available')
                  }}
                </span>
              </div>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-muted-foreground">{{ t('manager.details.summary.created') }}</span>
              <span>{{ formatDate(registrationDetails.registration.created_at) }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-muted-foreground">{{ t('manager.details.summary.updated') }}</span>
              <span>{{ formatDate(registrationDetails.registration.updated_at) }}</span>
            </div>
          </div>
        </div>

        <div v-else class="text-sm text-muted-foreground">
          {{ t('manager.details.select_prompt') }}
        </div>
      </div>
    </SheetContent>
  </Sheet>
</template>
